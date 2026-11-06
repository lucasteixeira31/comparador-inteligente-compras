import { LOJAS, DOMINIOS, dominioAutorizado } from "./comparacao.mjs";

export { DOMINIOS };

function caminhoDeAnuncio(url, loja) {
  const path = url.pathname.toLowerCase();
  if (loja === "Mercado Livre") return /\/mlb-?\d{7,}/i.test(path);
  if (loja === "Shopee") return /-i\.\d+\.\d+/.test(path) || /\/product\/\d+\/\d+/.test(path);
  if (loja === "AliExpress") return /\/item\/\d+\.html/.test(path);
  if (loja === "Amazon") return /\/(?:dp|gp\/product)\/[a-z0-9]{10}/.test(path);
  if (loja === "Temu") return /-g-\d+\.html/.test(path) || (path.includes("/goods.html") && url.searchParams.has("goods_id"));
  if (loja === "SHEIN") return /-p-\d+\.html$/.test(path);
  // TikTok Shop: somente páginas de detalhe de produto com ID, não vídeos ou perfis.
  if (loja === "TikTok Shop") return /^\/(?:shop\/pdp|(?:[a-z]{2}\/)?pdp|view\/product)\/(?:[^/?#]+\/)?\d{15,22}\/?$/.test(path);
  return false;
}

export function verificarAnuncio(link, loja) {
  if (!LOJAS.includes(loja)) return null;
  try {
    const u = new URL(link);
    if (!dominioAutorizado(u.toString(), loja)) return null;
    if (!caminhoDeAnuncio(u, loja)) return null;
    u.hash = "";
    return u.toString();
  } catch {
    return null;
  }
}

function mensagemStatus(status) {
  if (status === 401 || status === 403) return "credencial_invalida_ou_sem_permissao";
  if (status === 429) return "cota_ou_limite_atingido";
  return "erro_do_provedor";
}

function consulta(produto, caracteristicas) {
  return [produto.trim(), ...caracteristicas.map(x => String(x).trim()).filter(Boolean)]
    .join(" ").slice(0, 380);
}

async function pesquisarLoja(loja, query, limite, { apiKey, fetchImpl }) {
  const body = {
    query: loja === "TikTok Shop" ? "TikTok Shop " + query : query,
    search_depth: "basic",
    topic: "general",
    max_results: Math.max(5, Math.min(12, limite * 3)),
    include_domains: DOMINIOS[loja],
    include_answer: false,
    include_images: false,
    include_raw_content: false
  };
  try {
    const res = await fetchImpl("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(18000)
    });
    if (!res.ok) return { loja, situacao: mensagemStatus(res.status), anuncios: [] };
    const json = await res.json();
    const encontrados = new Set();
    const anuncios = [];
    for (const r of Array.isArray(json.results) ? json.results : []) {
      const url = verificarAnuncio(r.url, loja);
      if (!url || encontrados.has(url)) continue;
      encontrados.add(url);
      anuncios.push({
        id: loja.toLowerCase().replaceAll(" ", "-") + "-" + anuncios.length + 1,
        loja,
        titulo: String(r.title || "Anúncio sem título").slice(0, 240),
        url,
        resumo_fonte: String(r.content || "").slice(0, 500),
        verificado: false,
        origem: "indice_tavily",
        preco_unitario: null,
        frete: null,
        impostos: null,
        outras_taxas: null,
        disponibilidade: "nao_verificada",
        correspondencia: "nao_verificada"
      });
      if (anuncios.length >= limite) break;
    }
    return { loja, situacao: anuncios.length ? "links_encontrados_nao_verificados" : "nenhum_link_individual", anuncios };
  } catch {
    return { loja, situacao: "falha_na_consulta", anuncios: [] };
  }
}

export async function pesquisarOfertas(
  { produto, caracteristicas = [], lojas = LOJAS.slice(0, 3), limite_por_loja = 3 },
  { apiKey = process.env.TAVILY_API_KEY, fetchImpl = fetch } = {}
) {
  if (typeof produto !== "string" || !produto.trim() || produto.length > 200) throw new Error("Produto inválido.");
  if (!Array.isArray(caracteristicas) || caracteristicas.length > 12) throw new Error("Características inválidas.");
  if (!Number.isInteger(limite_por_loja) || limite_por_loja < 1 || limite_por_loja > 5) throw new Error("Limite inválido.");
  const selecionadas = [...new Set(lojas)];
  if (!selecionadas.length || selecionadas.length > LOJAS.length || selecionadas.some(l => !LOJAS.includes(l))) throw new Error("Lojas inválidas.");
  if (!apiKey || !apiKey.trim()) return {
    status: "credencial_da_busca_pendente",
    provedor: "Tavily",
    anuncios: [],
    lojas: selecionadas.map(loja => ({ loja, situacao: "credencial_da_busca_pendente", anuncios: [] })),
    orientacao: "O mantenedor precisa configurar TAVILY_API_KEY na Vercel; nenhum usuário final deverá configurar essa chave."
  };
  const query = consulta(produto, caracteristicas);
  const resultados = await Promise.all(selecionadas.map(loja => pesquisarLoja(loja, query, limite_por_loja, { apiKey, fetchImpl })));
  const anuncios = resultados.flatMap(r => r.anuncios);
  return {
    status: anuncios.length ? "links_indexados" : "sem_links_confirmados",
    provedor: "Tavily",
    produto,
    lojas: resultados,
    anuncios,
    ofertas_com_valores_verificados: 0,
    observacao: "Resultados são links de páginas indexadas, NÃO confirmação de preço, estoque, frete, tributos ou adequação ao produto. Confira cada anúncio e o carrinho antes do ranking definitivo."
  };
}
