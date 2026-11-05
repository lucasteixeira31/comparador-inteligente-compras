import test from "node:test";
import assert from "node:assert/strict";
import { consolidarComparacaoChat } from "../src/chat-comparacao.mjs";

const url = n => "https://shopee.com.br/Blusa-oversized-G3-i.123." + n;
const cadastro = [
  {id:"1",loja:"Shopee",titulo:"Blusa oversized G3",url:url(456),preco_anunciado:"29,90"},
  {id:"2",loja:"Shopee",titulo:"Blusa oversized G3 preta",url:url(789),preco_anunciado:"34,90"}
];

test("vitrine nunca e convertida em preco real automaticamente",()=>{
  const r=consolidarComparacaoChat({produto:"blusa",ofertas:cadastro});
  assert.equal(r.ranking.length,0);
  assert.equal(r.pendentes.length,2);
  assert.equal(r.ofertas_atualizadas[0].preco_unitario,null);
  assert.match(r.tabela_markdown,/29,90/);
  assert.match(r.tabela_markdown,/Nenhum total final completo/);
});
test("corrige somente linha e campos informados sem perder URL ou ID",()=>{
  const r=consolidarComparacaoChat({produto:"blusa",ofertas:cadastro,edicoes:[
    {id:"#2",preco_unitario:"35,00",frete:"10,00",impostos:0,outras_taxas:0,disponivel:true},
    {id:"#1",preco_unitario:"29,90",frete:"20,00",impostos:0,outras_taxas:0,disponivel:true}
  ]});
  assert.equal(r.ranking.length,2);
  assert.equal(r.ranking[0].id,"2");
  assert.equal(r.ranking[0].total,45);
  assert.equal(r.ranking[1].total,49.9);
  assert.equal(r.ofertas_atualizadas[1].url,url(789));
  assert.match(r.tabela_markdown,/#2/); // IDs permanecem visíveis na tabela
  assert.ok(r.tabela_markdown.includes(url(456)));
  assert.ok(r.tabela_markdown.includes(url(789)));
});
test("custos parciais nao ganham da oferta completa",()=>{
  const r=consolidarComparacaoChat({ofertas:cadastro,edicoes:[
    {id:"1",preco_unitario:"20,00",frete:null,impostos:0,outras_taxas:0,disponivel:true},
    {id:"2",preco_unitario:"35,00",frete:0,impostos:0,outras_taxas:0,disponivel:true}
  ]});
  assert.equal(r.menor_total.id,"2");
  assert.ok(r.pendentes[0].pendencias.includes("frete"));
});
test("disponibilidade nao confirmada impede classificar como vencedor",()=>{
  const r=consolidarComparacaoChat({ofertas:[cadastro[0]],edicoes:[
    {id:"1",preco_unitario:"20",frete:0,impostos:0,outras_taxas:0}
  ]});
  assert.equal(r.ranking.length,0);
  assert.ok(r.pendentes[0].pendencias.includes("disponibilidade_nao_confirmada"));
});
test("salvar novamente com estado anterior nao duplica anuncio",()=>{
  const r=consolidarComparacaoChat({ofertas:cadastro,edicoes:[{id:"2",frete:"10"}]});
  const novo=consolidarComparacaoChat({ofertas:r.ofertas_atualizadas,edicoes:[{id:"2",frete:"12"}]});
  assert.equal(novo.ofertas_atualizadas.length,2);
  assert.equal(novo.ofertas_atualizadas[1].frete,12);
  assert.equal(novo.ofertas_atualizadas[1].url,url(789));
  assert.equal(novo.ofertas_atualizadas[0].frete,null);
});
test("nao permite mudar URL via correcao nem links externos",()=>{
  assert.throws(()=>consolidarComparacaoChat({ofertas:cadastro,edicoes:[{id:"1",url:"https://example.com"}]}),/Campo não editável/);
  assert.throws(()=>consolidarComparacaoChat({ofertas:[{...cadastro[0],url:"https://sitefalso.com"}]}),/Link individual inválido/);
  assert.throws(()=>consolidarComparacaoChat({ofertas:[cadastro[0],cadastro[0]]}),/ID duplicado/);
});
test("edicao invalida interrompe em vez de zerar silenciosamente",()=>{
  assert.throws(()=>consolidarComparacaoChat({ofertas:cadastro,edicoes:[{id:"1",frete:"R$xx"}]}),/Valor inválido/);
  assert.throws(()=>consolidarComparacaoChat({ofertas:cadastro,edicoes:[{id:"99",frete:1}]}),/não encontrado/);
});
test("rejeita desconto maior que o subtotal sem inventar total",()=>{
  assert.throws(()=>consolidarComparacaoChat({ofertas:cadastro,edicoes:[
    {id:"1",preco_unitario:10,frete:0,impostos:0,outras_taxas:0,disponivel:true,desconto_valor:15,cupom_confirmado:true}
  ]}),/Desconto maior que subtotal/);
});
