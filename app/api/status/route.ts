export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    projeto: "Comparador Inteligente de Compras",
    versao_servidor: "0.9.3",
    mcp: {
      endpoint: "/api/mcp",
      ferramentas: ["preparar_pesquisa", "comparar_carrinhos", "pesquisar_ofertas", "planejar_busca_profunda", "analisar_busca_profunda", "consolidar_comparacao_chat", "abrir_tabela_comparacao", "abrir_formulario_pesquisa"]
    },
    pesquisa: {
      provedor: "Tavily",
      chave_configurada: Boolean(process.env.TAVILY_API_KEY?.trim()),
      precos_verificados_pelo_servidor: false,
      compras_automaticas: false
    }
  }, { headers: { "Cache-Control": "no-store" } });
}
