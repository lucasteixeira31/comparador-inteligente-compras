export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    projeto: "Comparador Inteligente de Compras",
    versao_servidor: "0.5.0",
    mcp: {
      endpoint: "/api/mcp",
      ferramentas: ["preparar_pesquisa", "comparar_carrinhos", "pesquisar_ofertas"]
    },
    pesquisa: {
      provedor: "Tavily",
      chave_configurada: Boolean(process.env.TAVILY_API_KEY?.trim()),
      precos_verificados_pelo_servidor: false,
      compras_automaticas: false
    }
  }, { headers: { "Cache-Control": "no-store" } });
}
