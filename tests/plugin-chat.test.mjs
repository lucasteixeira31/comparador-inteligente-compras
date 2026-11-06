import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const root = new URL("../plugin-chat/", import.meta.url);
const read = p => readFileSync(new URL(p,root),"utf8");
test("plugin @comprar usa App MCP sem MCP direto",()=>{
  const rootManifest=JSON.parse(read("plugin.json"));
  const compat=JSON.parse(read(".codex-plugin/plugin.json"));
  const app=JSON.parse(read(".app.json"));
  assert.equal(rootManifest.name,"comprar");
  assert.equal(rootManifest.extensions["com.openai"].interface.displayName,"comprar");
  assert.equal(rootManifest.version,"0.9.5");
  assert.equal(compat.version,"0.9.5");
  assert.equal(rootManifest.extensions["com.openai"].apps,"./.app.json");
  assert.equal(compat.apps,"./.app.json");
  assert.equal(app.apps["comprar-backend"].id,"asdk_app_6aeca1ead5d88191974ba923cfef6dc3");
  assert.equal(compat.mcpServers,undefined);
  assert.equal(rootManifest.mcpServers,undefined);
  assert.equal(existsSync(new URL("mcp.json",root)),false);
  assert.equal(existsSync(new URL(".mcp.json",root)),false);
  assert.match(read("agents/openai.yaml"),/\bCHAT\b/);
  const skill=read("skills/comparar-compras/SKILL.md");
  assert.match(skill,/MODO CHAT É O PADRÃO INCONDICIONAL/);
  assert.match(skill,/gatilho exato `#visual`/);
  assert.match(skill,/com \*\*\x60#chat\x60\*\*/);
  assert.match(skill,/\x60abrir_formulario_pesquisa\x60/);
  assert.match(skill,/\x60abrir_tabela_comparacao\x60/);
  assert.match(skill,/\x60consolidar_comparacao_chat\x60/);
  assert.match(skill,/não abrir formulários nem tabelas MCP Apps automaticamente/);
  assert.match(skill,/caracteristicas_confirmadas/);
  assert.match(skill,/preco_variacao_confirmado/);
  assert.match(skill,/orcamento_total/);
  assert.match(skill,/Não fabricar citações/);
});

test("guia dos gatilhos esta acessivel a partir do README e esclarece seus limites",()=>{
  const readProject = p => readFileSync(new URL("../"+p,root),"utf8");
  const guia=readProject("docs/GATILHOS.md");
  const readme=readProject("README.md");
  assert.match(readme,/\[guia completo dos gatilhos\]\(docs\/GATILHOS\.md\)/);
  for (const comando of ["@comprar #visual","#visual","#chat","modo visual","modo chat"])
    assert.ok(guia.includes(comando),"Gatilho não documentado: "+comando);
  assert.match(guia,/não comandos universais/);
  assert.match(guia,/não são automaticamente sincronizados/);
});
