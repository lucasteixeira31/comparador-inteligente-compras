export const LOJAS = ["Mercado Livre", "Shopee", "AliExpress", "Amazon", "SHEIN", "Temu"];

export const DOMINIOS = Object.freeze({
  "Mercado Livre": ["mercadolivre.com.br"],
  "Shopee": ["shopee.com.br"],
  "AliExpress": ["aliexpress.com"],
  "Amazon": ["amazon.com.br"],
  "SHEIN": ["shein.com"],
  "Temu": ["temu.com"]
});

export function dominioAutorizado(link, loja) {
  if (!LOJAS.includes(loja) || typeof link !== "string") return false;
  try {
    const u = new URL(link);
    if (u.protocol !== "https:" || u.username || u.password) return false;
    const hostname = u.hostname.toLowerCase();
    return DOMINIOS[loja].some(d => hostname === d || hostname.endsWith("." + d));
  } catch {
    return false;
  }
}

export function cents(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) : null;
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw || !/^[\d.,]+$/.test(raw)) return null;
  let normalized = raw;
  if (raw.includes(",") && raw.includes(".")) normalized = raw.replace(/\./g, "").replace(",", ".");
  else if (raw.includes(",")) normalized = raw.replace(",", ".");
  else if (/^\d{1,3}(?:\.\d{3})+$/.test(raw)) normalized = raw.replace(/\./g, "");
  const valueNumber = Number(normalized);
  return Number.isFinite(valueNumber) && valueNumber >= 0 ? Math.round(valueNumber * 100) : null;
}

export function prepararPesquisa({produto, caracteristicas = [], lojas = LOJAS.slice(0,3), quantidade = 1, orcamento = null, cep = null, condicao = "novo"}) {
  const nome = String(produto || "").trim();
  if (!nome) throw new Error("O produto é obrigatório.");
  if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 1000) throw new Error("Quantidade inválida.");
  const escolhidas = [...new Set(lojas)].filter(l => LOJAS.includes(l));
  if (!escolhidas.length) throw new Error("Selecione pelo menos uma loja.");
  return {
    produto: nome,
    caracteristicas: caracteristicas.map(c=>String(c).trim()).filter(Boolean),
    lojas: escolhidas,
    quantidade,
    orcamento_total: orcamento,
    cep: cep || null,
    condicao,
    status: "criterios_preparados_sem_busca_remota",
    orientacao: "Pesquisar anúncios individuais nas ferramentas de pesquisa autorizadas do host, verificar equivalência e registrar fontes. A ferramenta preparar_pesquisa apenas organiza os critérios; para descobrir links, use pesquisar_ofertas quando o provedor estiver configurado. A descoberta não comprova preços ou disponibilidade."
  };
}

export function compararOfertas({quantidade = 1, ofertas = []}) {
  if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 1000) throw new Error("Quantidade inválida.");
  const result = ofertas.map((o, i) => {
    if (!LOJAS.includes(o.loja)) throw new Error("Marketplace não autorizado: " + String(o.loja));
    if (o.url !== undefined && o.url !== null && o.url !== "" && !dominioAutorizado(o.url, o.loja))
      throw new Error("Link não corresponde ao domínio oficial do marketplace: " + o.loja);
    const preco = cents(o.preco_unitario);
    const frete = cents(o.frete);
    const impostos = cents(o.impostos);
    const taxas = cents(o.outras_taxas);
    const pendentes = [];
    if (preco === null) pendentes.push("preco_unitario");
    if (frete === null) pendentes.push("frete");
    if (impostos === null) pendentes.push("impostos");
    if (taxas === null) pendentes.push("outras_taxas");
    const disponivel = o.disponivel !== false;
    const incompleta = pendentes.length > 0 || !disponivel;
    const base = preco === null ? null : preco * quantidade;
    const valorDesconto = cents(o.desconto_valor) ?? 0;
    const percentual = Number(o.desconto_percentual ?? 0);
    const desconto = o.cupom_confirmado && base !== null ? Math.min(base, o.desconto_tipo === "percentual" ? Math.round(base * Math.min(100, Math.max(0, percentual)) / 100) : valorDesconto) : 0;
    const total = incompleta ? null : base + frete + impostos + taxas - desconto;
    return {
      id: String(o.id ?? i+1), loja: String(o.loja ?? "Não informada"), produto: String(o.produto ?? ""), url: o.url ?? null,
      disponibilidade: o.disponivel === false ? "indisponivel" : o.disponivel === true ? "confirmada_pelo_usuario" : "nao_verificada",
      pendencias: !disponivel ? ["indisponivel", ...pendentes] : pendentes,
      preco_unitario: preco === null ? null : preco / 100,
      subtotal: base === null ? null : base / 100,
      frete: frete === null ? null : frete / 100,
      impostos: impostos === null ? null : impostos / 100,
      outras_taxas: taxas === null ? null : taxas / 100,
      desconto_aplicado: desconto / 100,
      total: total === null ? null : Math.max(0,total) / 100,
      cupom_confirmado: Boolean(o.cupom_confirmado),
      dados_confirmados: Boolean(o.preco_confirmado_carrinho && o.frete_confirmado_carrinho && o.impostos_confirmados_carrinho && o.disponivel === true)
    };
  });
  const validas = result.filter(o=>o.total !== null).sort((a,b)=>a.total - b.total);
  return {
    quantidade,
    ranking: validas,
    pendentes: result.filter(o=>o.total === null),
    menor_total: validas[0] ?? null,
    menor_imposto: [...validas].sort((a,b)=>a.impostos-b.impostos)[0] ?? null,
    economia_extremos: validas.length > 1 ? Math.round((validas[validas.length-1].total - validas[0].total)*100)/100 : null,
    observacao: "O ranking depende dos valores informados. Dados não verificados devem ser confirmados no carrinho. Campos vazios não equivalem a zero."
  };
}
