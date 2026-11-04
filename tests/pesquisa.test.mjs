import test from "node:test";
import assert from "node:assert/strict";
import { verificarAnuncio, pesquisarOfertas } from "../src/pesquisa.mjs";

test("aceita links individuais e rejeita paginas de categoria", () => {
  assert.ok(verificarAnuncio("https://produto.mercadolivre.com.br/MLB-1234567890-item", "Mercado Livre"));
  assert.ok(verificarAnuncio("https://shopee.com.br/Produto-i.12345.67890", "Shopee"));
  assert.ok(verificarAnuncio("https://pt.aliexpress.com/item/1005001234567890.html", "AliExpress"));
  assert.ok(verificarAnuncio("https://www.amazon.com.br/dp/B012345678", "Amazon"));
  assert.ok(verificarAnuncio("https://www.temu.com/br/exemplo-g-60123456789.html", "Temu"));
  assert.ok(verificarAnuncio("https://portuguese.alibaba.com/product-detail/item-123.html", "Alibaba"));
  assert.equal(verificarAnuncio("https://lista.mercadolivre.com.br/notebook", "Mercado Livre"), null);
  assert.equal(verificarAnuncio("https://www.amazon.com.br/s?k=notebook", "Amazon"), null);
});

test("recusa links adulterados e outros protocolos", () => {
  assert.equal(verificarAnuncio("https://mercadolivre.com.br.evil.example/MLB-1234567", "Mercado Livre"), null);
  assert.equal(verificarAnuncio("http://produto.mercadolivre.com.br/MLB-1234567", "Mercado Livre"), null);
  assert.equal(verificarAnuncio("https://attacker@produto.mercadolivre.com.br/MLB-1234567", "Mercado Livre"), null);
});

test("sem chave retorna estado explicito e nao inventa ofertas", async () => {
  const result = await pesquisarOfertas({produto:"Memoria RAM",lojas:["Shopee"]}, {apiKey:""});
  assert.equal(result.status, "credencial_da_busca_pendente");
  assert.equal(result.anuncios.length, 0);
});

test("busca real por API retorna links mas nao inventa valores", async () => {
  const requests = [];
  const fetchImpl = async (url, opts) => {
    requests.push({url,body:JSON.parse(opts.body),authorization:opts.headers.Authorization});
    return {ok:true,json:async () => ({
      results: [
        {title:"Produto A",url:"https://shopee.com.br/Produto-A-i.123.456",content:"Anúncio da loja"},
        {title:"Busca genérica",url:"https://shopee.com.br/search?keyword=ram"},
        {title:"Phishing",url:"https://shopee.com.br.attacker.test/Produto-i.123.456"}
      ]
    })};
  };
  const result=await pesquisarOfertas({produto:"Memoria RAM",lojas:["Shopee"],limite_por_loja:3},{apiKey:"token_de_teste",fetchImpl});
  assert.equal(result.status,"links_indexados");
  assert.equal(result.anuncios.length,1);
  assert.equal(result.anuncios[0].preco_unitario,null);
  assert.equal(result.anuncios[0].disponibilidade,"nao_verificada");
  assert.deepEqual(requests[0].body.include_domains,["shopee.com.br"]);
  assert.equal(requests[0].authorization,"Bearer token_de_teste");
});

test("cada marketplace recebe filtro de dominio proprio", async () => {
  const domains=[];
  const fetchImpl=async (_,opts)=>{domains.push(JSON.parse(opts.body).include_domains[0]);return {ok:true,json:async()=>({results:[]})}};
  const res=await pesquisarOfertas({produto:"Produto",lojas:["Mercado Livre","AliExpress"]},{apiKey:"teste",fetchImpl});
  assert.equal(res.status,"sem_links_confirmados");
  assert.deepEqual(domains,["mercadolivre.com.br","aliexpress.com"]);
});

test("falha no provedor nao e confundida com ausencia de ofertas", async () => {
  const fetchImpl=async()=>({ok:false,status:429});
  const res=await pesquisarOfertas({produto:"Produto",lojas:["Amazon"]},{apiKey:"teste",fetchImpl});
  assert.equal(res.lojas[0].situacao,"cota_ou_limite_atingido");
  assert.equal(res.anuncios.length,0);
});
