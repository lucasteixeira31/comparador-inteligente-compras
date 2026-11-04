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
for (const name of ["preparar_pesquisa", "comparar_carrinhos", "pesquisar_ofertas", "planejar_busca_profunda", "analisar_busca_profunda", "abrir_tabela_comparacao"]) {
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

const plan = await request("tools/call", {
  name:"planejar_busca_profunda",
  arguments:{produto:"blusa",caracteristicas_obrigatorias:["preta","tamanho M"],lojas:["Shopee","Mercado Livre"]}
},4,session);
const p = plan.data.result?.structuredContent || JSON.parse(plan.data.result?.content?.find(c=>c.type==="text")?.text || "{}");
if(p.total_consultas_planejadas!==6 || p.consultas_executadas!==0) throw Error("Deep search planning invalid: "+JSON.stringify(p));
const analyzed = await request("tools/call",{
  name:"analisar_busca_profunda",
  arguments:{produto:"blusa",lojas:["Shopee"],ofertas:[
    {loja:"Shopee",titulo:"Blusa preta",url:"https://shopee.com.br/Blusa-i.123.456",preco_unitario:19.9}
  ]}
},5,session);
const a = analyzed.data.result?.structuredContent || JSON.parse(analyzed.data.result?.content?.find(c=>c.type==="text")?.text || "{}");
if(a.menor_preco_anunciado_provisorio?.preco_unitario!==19.9 || a.menor_custo_total_confirmado!==null)
  throw Error("Deep search analysis invalid: "+JSON.stringify(a));
console.log(JSON.stringify({deepSearchPlan:p.total_consultas_planejadas,provisional:a.menor_preco_anunciado_provisorio.preco_unitario,confirmed:a.menor_custo_total_confirmado}));

const resources = await request("resources/list",{},6,session);
if(!resources.data.result?.resources?.some(x=>x.uri==="ui://comparador/tabela-custos-v1"))
  throw Error("MCP UI resource not discovered");
const read = await request("resources/read",{uri:"ui://comparador/tabela-custos-v1"},7,session);
const resource = read.data.result?.contents?.[0];
if(resource?.mimeType!=="text/html;profile=mcp-app" ||
   !resource.text?.includes("Salvar na tabela") ||
   !resource.text?.includes("setWidgetState")) throw Error("MCP UI template unavailable");
const table = await request("tools/call",{
  name:"abrir_tabela_comparacao",
  arguments:{produto:"blusa preta",quantidade:2,ofertas:[
    {loja:"Shopee",titulo:"Blusa preta M",url:"https://shopee.com.br/Blusa-preta-i.123.456",preco_anunciado:29.9},
    {loja:"Shopee",titulo:"Phishing",url:"https://shopee.com.br.evil.example/Blusa-i.123.2",preco_anunciado:1}
  ]}
},8,session);
const result = table.data.result?.structuredContent || JSON.parse(table.data.result?.content?.find(c=>c.type==="text")?.text || "{}");
if(result.ofertas?.length!==1 || result.links_rejeitados!==1 ||
  result.ofertas[0].preco_anunciado!==29.9 || result.quantidade!==2)
  throw Error("Render tool did not validate URLs: "+JSON.stringify(result));
console.log(JSON.stringify({widget:"ok",resource:resource.mimeType,renderedOffers:result.ofertas.length,rejected:result.links_rejeitados}));
