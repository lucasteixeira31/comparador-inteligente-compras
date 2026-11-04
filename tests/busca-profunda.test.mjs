import test from "node:test";
import assert from "node:assert/strict";
import {planejarBuscaProfunda,analisarBuscaProfunda} from "../src/busca-profunda.mjs";

const shopee=n=>"https://shopee.com.br/Blusa-preta-tamanho-M-i.123."+n;
const ml=n=>"https://produto.mercadolivre.com.br/MLB-"+n+"-blusa";

test("plano gratis gera buscas por plataforma sem declarar coleta",()=>{
  const p=planejarBuscaProfunda({produto:"blusa",caracteristicas_obrigatorias:["preta","tamanho M"],lojas:["Shopee","Mercado Livre"]});
  assert.equal(p.total_consultas_planejadas,6);
  assert.equal(p.consultas_executadas,0);
  assert.ok(p.lojas[0].consultas[0].busca_web.includes("site:shopee.com.br"));
});
test("bloqueia marketplaces externos",()=>{
  assert.throws(()=>planejarBuscaProfunda({produto:"blusa",lojas:["Alibaba"]}),/não aprovados/);
  assert.throws(()=>analisarBuscaProfunda({produto:"blusa",lojas:["Alibaba"]}),/não aprovados/);
});
test("separa preco do produto e custo real",()=>{
  const a=analisarBuscaProfunda({produto:"blusa",caracteristicas_obrigatorias:["preta","tamanho M"],
    lojas:["Shopee","Mercado Livre"],ofertas:[
      {loja:"Shopee",titulo:"Blusa preta tamanho M",url:shopee(456),preco_unitario:30,frete:20,impostos:0,outras_taxas:0,
       disponivel:true,produto_confirmado:true,preco_confirmado_carrinho:true,frete_confirmado_carrinho:true,impostos_confirmados_carrinho:true},
      {loja:"Mercado Livre",titulo:"Blusa preta tamanho M",url:ml(1234567890),preco_unitario:35,frete:0,impostos:0,outras_taxas:0,
       disponivel:true,produto_confirmado:true,preco_confirmado_carrinho:true,frete_confirmado_carrinho:true,impostos_confirmados_carrinho:true},
      {loja:"Shopee",titulo:"Blusa",url:"https://site-falso.example/item",preco_unitario:1}
    ]});
  assert.equal(a.menor_preco_anunciado_provisorio.loja,"Shopee");
  assert.equal(a.menor_custo_total_confirmado.loja,"Mercado Livre");
  assert.equal(a.menor_custo_total_confirmado.total,35);
  assert.equal(a.cobertura.anuncios_rejeitados,1);
});
test("index nao confirma automaticamente checkout",()=>{
  const a=analisarBuscaProfunda({produto:"blusa",lojas:["Shopee"],ofertas:[
    {loja:"Shopee",titulo:"Blusa feminina",url:shopee(456),preco_unitario:14.90,origem:"indice_web"}
  ]});
  assert.equal(a.menor_custo_total_confirmado,null);
  assert.equal(a.menor_preco_anunciado_provisorio.preco_unitario,14.9);
  assert.ok(a.pendentes[0].pendencias.includes("preco_checkout_nao_confirmado"));
});
test("produto nao equivalente fica pendente de verificacao",()=>{
  const a=analisarBuscaProfunda({produto:"blusa",caracteristicas_obrigatorias:["preta","tamanho M"],
    lojas:["Shopee"],ofertas:[{loja:"Shopee",titulo:"Blusa branca tamanho P",url:shopee(456),preco_unitario:10}]});
  assert.equal(a.ranking_preco_anunciado_provisorio.length,0);
  assert.equal(a.pendentes.length,1);
});
test("duplicata com conflito de preco nao e ranqueada",()=>{
  const a=analisarBuscaProfunda({produto:"blusa",lojas:["Shopee"],ofertas:[
    {loja:"Shopee",titulo:"Blusa",url:shopee(456)+"?utm_source=x",preco_unitario:20},
    {loja:"Shopee",titulo:"Blusa",url:shopee(456)+"?utm_source=y",preco_unitario:25}
  ]});
  assert.equal(a.cobertura.duplicatas_removidas,1);
  assert.equal(a.ranking_preco_anunciado_provisorio.length,0);
  assert.ok(a.pendentes[0].pendencias.includes("precos_conflitantes"));
});
test("sem resultados nao inventa menor preco",()=>{
  const a=analisarBuscaProfunda({produto:"blusa",lojas:["Amazon","Temu"],ofertas:[]});
  assert.equal(a.menor_custo_total_confirmado,null);
  assert.equal(a.cobertura.lojas_sem_links_validos.length,2);
});
test("sem frete nao atribui valor zero",()=>{
  const a=analisarBuscaProfunda({produto:"blusa",lojas:["Shopee"],ofertas:[
    {loja:"Shopee",titulo:"Blusa",url:shopee(456),preco_unitario:15,
      disponivel:true,produto_confirmado:true,preco_confirmado_carrinho:true}
  ]});
  assert.equal(a.ranking_custo_total_confirmado.length,0);
});
