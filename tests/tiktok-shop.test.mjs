import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LOJAS, DOMINIOS, dominioAutorizado, prepararPesquisa, compararOfertas } from "../src/comparacao.mjs";
import { verificarAnuncio, pesquisarOfertas } from "../src/pesquisa.mjs";
import { planejarBuscaProfunda, analisarBuscaProfunda } from "../src/busca-profunda.mjs";

const id="1731410956394792439";
const share="https://shop.tiktok.com/view/product/"+id+"?region=BR";
const pdp="https://www.tiktok.com/shop/pdp/camiseta-oversized/"+id;

test("TikTok Shop integra a lista sem alterar as três lojas padrão",()=>{
  assert.equal(LOJAS.length,7);
  assert.deepEqual(DOMINIOS["TikTok Shop"],["tiktok.com"]);
  assert.ok(LOJAS.includes("TikTok Shop"));
  assert.deepEqual(prepararPesquisa({produto:"Camiseta"}).lojas,["Mercado Livre","Shopee","AliExpress"]);
  assert.deepEqual(prepararPesquisa({produto:"Camiseta",lojas:["TikTok Shop","Amazon"]}).lojas,["TikTok Shop","Amazon"]);
});

test("TikTok Shop valida apenas URLs HTTPS oficiais de produtos individuais",()=>{
  for(const url of [share,pdp,
    "https://shop.tiktok.com/br/pdp/camiseta-preta/"+id,
    "https://www.tiktok.com/view/product/"+id,
    "https://shop.tiktok.com/us/pdp/"+id
  ])assert.equal(verificarAnuncio(url,"TikTok Shop"),url,"Link válido rejeitado: "+url);
  for(const url of [
    "http://shop.tiktok.com/view/product/"+id,
    "https://shop.tiktok.com.evil.example/view/product/"+id,
    "https://evil@shop.tiktok.com/view/product/"+id,
    "https://seller.tiktok.com/view/product/"+id,
    "https://vt.tiktok.com/shortlink",
    "https://www.tiktok.com/@perfil/video/1234567890",
    "https://www.tiktok.com/@perfil",
    "https://www.tiktok.com/live",
    "https://shop.tiktok.com/br/store/exemplo/12345678901234567",
    "https://www.tiktok.com/search?q=camiseta",
    "https://shop.tiktok.com/view/product/1234",
    "https://www.tiktok.com/shop/pdp/camiseta"
  ])assert.equal(verificarAnuncio(url,"TikTok Shop"),null,"URL insegura: "+url);
  assert.equal(dominioAutorizado("https://shop.tiktok.com/view/product/"+id,"TikTok Shop"),true);
  assert.equal(dominioAutorizado("https://evil.tiktok.com/view/product/"+id,"TikTok Shop"),false);
});

test("pesquisa indexada TikTok Shop filtra video e não inventa preços",async()=>{
  const chamadas=[];
  const fetchImpl=async (_,opts)=>{
    chamadas.push(JSON.parse(opts.body));
    return {ok:true,json:async()=>({results:[
      {title:"Camiseta oversized preta",url:share,content:"Anúncio indexado"},
      {title:"Vídeo de camiseta",url:"https://www.tiktok.com/@usuario/video/1731410956394792439"},
      {title:"Loja falsa",url:"https://shop.tiktok.com.phishing.test/view/product/"+id}
    ]})};
  };
  const res=await pesquisarOfertas({produto:"Camiseta oversized",lojas:["TikTok Shop"]},{apiKey:"teste",fetchImpl});
  assert.equal(res.status,"links_indexados");
  assert.equal(res.anuncios.length,1);
  assert.equal(res.anuncios[0].loja,"TikTok Shop");
  assert.equal(res.anuncios[0].url,share);
  assert.equal(res.anuncios[0].preco_unitario,null);
  assert.equal(res.anuncios[0].frete,null);
  assert.equal(res.anuncios[0].disponibilidade,"nao_verificada");
  assert.deepEqual(chamadas[0].include_domains,["tiktok.com"]);
  assert.match(chamadas[0].query,/TikTok Shop/);
});

test("planejamento e análise incluem TikTok Shop e valores pendentes",()=>{
  const plano=planejarBuscaProfunda({produto:"camiseta",lojas:["TikTok Shop"]});
  assert.equal(plano.lojas[0].loja,"TikTok Shop");
  assert.match(plano.lojas[0].consultas[0].busca_web,/site:tiktok\.com/);
  const resultado=analisarBuscaProfunda({
    produto:"camiseta",
    lojas:["TikTok Shop"],
    ofertas:[{loja:"TikTok Shop",titulo:"Camiseta preta",url:share,preco_unitario:"39,90",origem:"indice_web"}]
  });
  assert.equal(resultado.cobertura.anuncios_unicos_validos,1);
  assert.equal(resultado.menor_preco_anunciado_provisorio.loja,"TikTok Shop");
  assert.equal(resultado.menor_custo_total_confirmado,null);
  assert.ok(resultado.pendentes[0].pendencias.includes("frete_nao_confirmado"));
});

test("TikTok Shop aceita comparação de custo final sem supor frete zero",()=>{
  const ranking=compararOfertas({ofertas:[
    {loja:"TikTok Shop",url:share,preco_unitario:"39,90",frete:"10,00",impostos:0,outras_taxas:0,disponivel:true},
    {loja:"Shopee",preco_unitario:"46,90",frete:5,impostos:0,outras_taxas:0,disponivel:true}
  ]});
  assert.equal(ranking.menor_total.loja,"TikTok Shop");
  assert.equal(ranking.menor_total.total,49.90);
  const parcial=compararOfertas({ofertas:[{loja:"TikTok Shop",url:share,preco_unitario:39.9}]});
  assert.equal(parcial.ranking.length,0);
  assert.ok(parcial.pendentes[0].pendencias.includes("frete"));
});

test("formulários, instruções e MCP incluem a sétima loja sem ativar desktop",()=>{
  const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
  const form=read("public/widget-pesquisa.html");
  const table=read("public/widget-comparador.html");
  const html=read("public/comparador.html");
  const server=read("app/api/mcp/route.ts");
  const skill=read("plugin-chat/skills/entrada-compras/SKILL.md");
  const root=JSON.parse(read("plugin-chat/plugin.json"));
  assert.ok(form.includes('"TikTok Shop"'));
  assert.ok(table.includes('"TikTok Shop"'));
  assert.ok(html.includes("'TikTok Shop'"));
  assert.ok(table.includes('if(shop==="TikTok Shop")return'));
  assert.match(server,/\.max\(7\)/);
  assert.ok(skill.includes("sete checkboxes independentes"));
  assert.ok(skill.includes("🛒 Comparador Inteligente de Compras"));
  assert.ok(skill.includes("Olá! Este é o chat"));
  assert.equal(root.extensions["com.openai"].apps,"./.app.json");
  assert.equal(root.version,"0.10.5");
});
