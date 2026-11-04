const url = process.env.MCP_URL || "https://comparador-inteligente-compras.vercel.app/api/mcp";
const runId = String(Date.now());

async function request(method, params, id, session) {
  const headers = {
    "content-type": "application/json",
    "accept": "application/json, text/event-stream",
    "mcp-protocol-version": "2025-03-26"
  };
  if (session) headers["mcp-session-id"] = session;
  const payload = { jsonrpc: "2.0", method };
  if (params !== undefined) payload.params = params;
  if (id !== undefined) payload.id = id;
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20000)
  });
  const text = await response.text();
  if (!response.ok) throw Error(method + ": HTTP " + response.status + " " + text.slice(0, 400));
  if (id === undefined) return {response};
  const data = response.headers.get("content-type")?.includes("text/event-stream")
    ? text.split(/\r?\n/).filter(s => s.startsWith("data:")).map(s => {
        try { return JSON.parse(s.slice(5).trim()); } catch { return null; }
      }).find(x => x && x.jsonrpc === "2.0")
    : JSON.parse(text);
  if (!data || data.error) throw Error(method + ": invalid/error JSON-RPC " + JSON.stringify(data));
  return {response, data};
}

const init = await request("initialize", {
  protocolVersion: "2025-03-26",
  capabilities: {},
  clientInfo: {name: "comparador-github-actions", version: "0.3.0"}
}, 1);
if (!init.data.result?.protocolVersion) throw Error("MCP initialize did not return protocolVersion.");
const session = init.response.headers.get("mcp-session-id");
await request("notifications/initialized", {}, undefined, session);
const tools = await request("tools/list", {}, 2, session);
const names = tools.data.result?.tools?.map(t => t.name) || [];
for (const name of ["preparar_pesquisa", "comparar_carrinhos", "pesquisar_ofertas"]) {
  if (!names.includes(name)) throw Error("Missing tool: " + name);
}
const call = await request("tools/call", {
  name: "comparar_carrinhos",
  arguments: {
    quantidade: 2,
    ofertas: [
      {
        id: "teste",
        loja: "Shopee",
        preco_unitario: 85,
        frete: 18,
        impostos: 0,
        outras_taxas: 0,
        disponivel: true,
        desconto_tipo: "fixo",
        desconto_valor: 15,
        cupom_confirmado: true
      }
    ]
  }
}, 3, session);
const output = call.data.result?.structuredContent || JSON.parse(call.data.result?.content?.find(c=>c.type==="text")?.text || "{}");
if (output.ranking?.[0]?.total !== 173) {
  throw Error("Unexpected calculator result: " + JSON.stringify(output));
}
console.log(JSON.stringify({status:"ok",initialize:init.data.result.protocolVersion,tools:names,comparison:output.ranking[0].total,runId}));
