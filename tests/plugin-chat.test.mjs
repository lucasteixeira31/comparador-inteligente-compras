import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const root = new URL("../plugin-chat/", import.meta.url);
const read = p => readFileSync(new URL(p,root),"utf8");
test("versao Chat do comprar nao declara MCP direto",()=>{
  const rootManifest=JSON.parse(read("plugin.json"));
  const compat=JSON.parse(read(".codex-plugin/plugin.json"));
  assert.equal(rootManifest.name,"comprar");
  assert.equal(rootManifest.extensions["com.openai"].interface.displayName,"comprar");
  assert.equal(rootManifest.version,"0.9.0");
  assert.equal(compat.version,"0.9.0");
  assert.equal(compat.mcpServers,undefined);
  assert.equal(rootManifest.mcpServers,undefined);
  assert.equal(existsSync(new URL("mcp.json",root)),false);
  assert.equal(existsSync(new URL(".mcp.json",root)),false);
  assert.match(read("agents/openai.yaml"),/\bCHAT\b/);
});
