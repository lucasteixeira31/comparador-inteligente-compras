import test from "node:test";
import assert from "node:assert/strict";
import { cents, compararOfertas, prepararPesquisa } from "../src/comparacao.mjs";

test("interpreta números nacionais sem misturar separador decimal e de milhar", () => {
  assert.equal(cents("1.234,56"),123456);
  assert.equal(cents("29,90"),2990);
  assert.equal(cents(29.90),2990);
  assert.equal(cents(""),null);
  assert.equal(cents("-10"),null);
});

test("o desconto não é aplicado antes de confirmação no carrinho", () => {
  const res = compararOfertas({ quantidade:2, ofertas:[{loja:"Shopee",preco_unitario:85,frete:18,impostos:0,outras_taxas:0,desconto_valor:15,cupom_confirmado:false,disponivel:true}] });
  assert.equal(res.ranking[0].total,188);
  assert.equal(res.ranking[0].desconto_aplicado,0);
});

test("compara custos totais e aplica cupom fixo confirmado", () => {
  const res = compararOfertas({quantidade:2,ofertas:[
    {loja:"Mercado Livre",preco_unitario:99,frete:0,impostos:0,outras_taxas:0,disponivel:true},
    {loja:"Shopee",preco_unitario:85,frete:18,impostos:0,outras_taxas:0,desconto_valor:15,cupom_confirmado:true,disponivel:true}
  ]});
  assert.equal(res.menor_total.loja,"Shopee");
  assert.equal(res.menor_total.total,173);
  assert.equal(res.economia_extremos,25);
});

test("não ranqueia ofertas com impostos não informados",()=>{
  const res=compararOfertas({quantidade:1,ofertas:[{loja:"AliExpress",preco_unitario:10,frete:0,outras_taxas:0}]});
  assert.equal(res.ranking.length,0);
  assert.deepEqual(res.pendentes[0].pendencias,["impostos"]);
});

test("não ranqueia anúncio indisponível",()=>{
  const res=compararOfertas({quantidade:1,ofertas:[{loja:"Shopee",preco_unitario:10,frete:0,impostos:0,outras_taxas:0,disponivel:false}]});
  assert.equal(res.ranking.length,0);
});

test("prepara pesquisa sem alegar ter efetuado busca",()=>{
  const res=prepararPesquisa({produto:"Globo digital"});
  assert.equal(res.status,"criterios_preparados_sem_busca_remota");
  assert.equal(res.lojas.length,3);
});
