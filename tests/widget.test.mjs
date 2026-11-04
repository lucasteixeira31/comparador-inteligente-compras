import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../public/widget-comparador.html",import.meta.url),"utf8");

test("interface possui formulario de custo real e botao salvar",()=>{
  for(const key of ["price","shipping","taxes","fees","discount","link","quantity","results"]){
    assert.ok(html.includes('id="'+key+'"'),"Campo ausente: "+key);
  }
  assert.ok(html.includes("Salvar na tabela"));
  assert.ok(html.includes("setWidgetState"));
  assert.ok(html.includes('id="export"'));
});

test("script da tabela nao possui erro de sintaxe",()=>{
  const match=html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(match,"Script ausente");
  assert.doesNotThrow(()=>new vm.Script(match[1]));
});

test("salvamento associa link do anuncio ao valor final e evita dominios falsos",()=>{
  assert.ok(html.includes("link(o.url,o.titulo"));
  assert.ok(html.includes("saved.push(o)"));
  assert.ok(html.includes("shopee.com.br"));
  assert.ok(html.includes("host===domain||host.endsWith"));
  assert.ok(html.includes("preco_unitario"));
});

const formulario = readFileSync(new URL("../public/widget-pesquisa.html",import.meta.url),"utf8");
test("formulario interativo informa criterios sem abrir guias",()=>{
  for(const id of ["product","features","budget","quantity","zip","condition","shops"])
    assert.ok(formulario.includes('id="'+id+'"'),"Campo ausente: "+id);
  for(const shop of ["Mercado Livre","Shopee","AliExpress","Amazon","SHEIN","Temu"])
    assert.ok(formulario.includes('"'+shop+'"'));
  assert.ok(formulario.includes("sendFollowUpMessage"));
  assert.ok(formulario.includes("abrir_tabela_comparacao"));
  assert.ok(!formulario.includes("window.open("));
});
test("javascript do formulario é sintaticamente valido",()=>{
  const m=formulario.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(m);
  assert.doesNotThrow(()=>new vm.Script(m[1]));
});
