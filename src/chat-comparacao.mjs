import { compararOfertas, cents, LOJAS } from "./comparacao.mjs";
import { verificarAnuncio } from "./pesquisa.mjs";

const CAMPOS_DINHEIRO = ["preco_unitario", "frete", "impostos", "outras_taxas", "desconto_valor"];
const CAMPOS_EDICAO = [...CAMPOS_DINHEIRO, "desconto_tipo", "desconto_percentual", "cupom_confirmado", "disponivel"];
const formato = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const moeda = valor => valor === null || valor === undefined ? "pendente" : formato.format(valor);
const texto = valor => String(valor).replace(/\r?\n/g, " ").replace(/\|/g, "\\|").replace(/\[/g, "\\[").replace(/\]/g, "\\]");
const identidade = id => String(id).trim().replace(/^#/, "");

function validarDinheiro(valor, campo, id) {
  if (valor === null || valor === undefined || valor === "") return null;
  if (cents(valor) === null) throw Error("Valor inválido em " + campo + " do anúncio #" + id);
  return cents(valor) / 100;
}
function montarOferta(o, i) {
  if (!o || typeof o !== "object" || !LOJAS.includes(o.loja)) throw Error("Loja inválida no anúncio " + (i + 1));
  const id = identidade(o.id ?? String(i + 1));
  if (!/^[1-9]\d{0,5}$/.test(id)) throw Error("Identificador inválido no anúncio " + (i + 1));
  const url = verificarAnuncio(o.url, o.loja);
  if (!url) throw Error("Link individual inválido do anúncio #" + id);
  const titulo = String(o.titulo ?? o.produto ?? "").trim();
  if (!titulo || titulo.length > 300) throw Error("Título inválido do anúncio #" + id);
  const registro = {
    id, loja: o.loja, titulo, url, 
    preco_anunciado: validarDinheiro(o.preco_anunciado, "preco_anunciado", id),
    preco_unitario: null, frete: null, impostos: null, outras_taxas: null,
    desconto_valor: null, desconto_tipo: "fixo", desconto_percentual: 0,
    cupom_confirmado: false, disponivel: null
  };
  for (const campo of CAMPOS_DINHEIRO) if (Object.hasOwn(o, campo)) registro[campo] = validarDinheiro(o[campo], campo, id);
  if (o.desconto_tipo !== undefined) {
    if (!["fixo", "percentual"].includes(o.desconto_tipo)) throw Error("Tipo de desconto inválido no anúncio #" + id);
    registro.desconto_tipo = o.desconto_tipo;
  }
  if (o.desconto_percentual !== undefined) {
    if (typeof o.desconto_percentual !== "number" || o.desconto_percentual < 0 || o.desconto_percentual > 100)
      throw Error("Percentual inválido no anúncio #" + id);
    registro.desconto_percentual = o.desconto_percentual;
  }
  for (const campo of ["cupom_confirmado", "disponivel"]) if (Object.hasOwn(o, campo)) {
    if (o[campo] !== null && typeof o[campo] !== "boolean") throw Error("Confirmação inválida no anúncio #" + id);
    registro[campo] = o[campo];
  }
  return registro;
}
function corrigir(oferta, edicao) {
  for (const [campo, valor] of Object.entries(edicao)) {
    if (campo === "id") continue;
    if (!CAMPOS_EDICAO.includes(campo)) throw Error("Campo não editável: " + campo + ". Links e IDs permanecem preservados.");
    if (CAMPOS_DINHEIRO.includes(campo)) oferta[campo] = validarDinheiro(valor, campo, oferta.id);
    else if (campo === "desconto_tipo") {
      if (!["fixo", "percentual"].includes(valor)) throw Error("Tipo de desconto inválido no anúncio #" + oferta.id);
      oferta[campo] = valor;
    } else if (campo === "desconto_percentual") {
      if (typeof valor !== "number" || !Number.isFinite(valor) || valor < 0 || valor > 100)
        throw Error("Percentual inválido no anúncio #" + oferta.id);
      oferta[campo] = valor;
    } else if (campo === "cupom_confirmado") {
      if (typeof valor !== "boolean") throw Error("Confirmação de desconto inválida no anúncio #" + oferta.id);
      oferta[campo] = valor;
    } else if (campo === "disponivel") {
      if (valor !== null && typeof valor !== "boolean") throw Error("Disponibilidade inválida no anúncio #" + oferta.id);
      oferta[campo] = valor;
    }
  }
}

export function consolidarComparacaoChat({ produto = "", quantidade = 1, ofertas = [], edicoes = [] } = {}) {
  if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 1000) throw Error("Quantidade inválida.");
  if (!Array.isArray(ofertas) || ofertas.length > 100) throw Error("Limite de 100 anúncios.");
  if (!Array.isArray(edicoes) || edicoes.length > 100) throw Error("Limite de 100 correções.");
  const registros = ofertas.map(montarOferta);
  const ids = new Set(), urls = new Set();
  for (const o of registros) {
    if (ids.has(o.id)) throw Error("ID duplicado: #" + o.id);
    if (urls.has(o.url)) throw Error("Anúncio duplicado: " + o.url);
    ids.add(o.id); urls.add(o.url);
  }
  const porId = new Map(registros.map(o => [o.id, o]));
  for (const e of edicoes) {
    if (!e || typeof e !== "object" || e.id === undefined) throw Error("Correção sem ID.");
    const id = identidade(e.id), oferta = porId.get(id);
    if (!oferta) throw Error("Anúncio #" + id + " não encontrado; nenhuma correção aplicada.");
    corrigir(oferta, e);
  }
  for (const o of registros) {
    if (o.cupom_confirmado && o.desconto_tipo === "fixo" && o.desconto_valor !== null && o.preco_unitario !== null &&
        cents(o.desconto_valor) > cents(o.preco_unitario) * quantidade)
      throw Error("Desconto maior que subtotal no anúncio #" + o.id);
  }
  const calc = compararOfertas({ quantidade, ofertas: registros.map(o => ({
    id: o.id, loja: o.loja, produto: o.titulo, url: o.url,
    preco_unitario: o.preco_unitario, frete: o.frete, impostos: o.impostos,
    outras_taxas: o.outras_taxas, desconto_tipo: o.desconto_tipo,
    desconto_valor: o.desconto_valor, desconto_percentual: o.desconto_percentual,
    cupom_confirmado: o.cupom_confirmado, disponivel: o.disponivel
  })) });
  const completos = calc.ranking.filter(r => porId.get(r.id).disponivel === true);
  const pendentes = [...calc.pendentes, ...calc.ranking.filter(r => porId.get(r.id).disponivel !== true)]
    .map(r => ({
      ...r,
      pendencias: [...r.pendencias, ...(porId.get(r.id).disponivel !== true ? ["disponibilidade_nao_confirmada"] : [])],
      total: null
    })).sort((a,b) => Number(a.id) - Number(b.id));
  const linha = (r, pendente = false) => {
    const o = porId.get(r.id);
    const link = "[" + texto(o.titulo) + "](" + o.url.replace(/\)/g, "%29") + ")";
    const base = ["#" + o.id, texto(o.loja), link, moeda(o.preco_anunciado),
      moeda(o.preco_unitario), moeda(o.frete), moeda(o.impostos), moeda(o.outras_taxas),
      o.cupom_confirmado ? moeda(r.desconto_aplicado) : "não aplicado"];
    if (pendente) return "| " + [...base, "—", texto(r.pendencias.join(", "))].join(" | ") + " |";
    return "| " + [...base, moeda(r.total), "completo"].join(" | ") + " |";
  };
  const cabecalho = "| ID | Loja | Anúncio | Anunciado | Preço real | Frete | Impostos | Taxas | Desconto | Total | Situação |\n" +
    "|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|";
  const tabela = [
    "### Comparação: " + texto(produto || "produtos") + " (quantidade: " + quantidade + ")",
    "**Totais completos informados:** " + completos.length,
    completos.length ? [cabecalho, ...completos.map(r => linha(r))].join("\n") : "Nenhum total final completo com disponibilidade confirmada.",
    "**Pendências de custo/verificação:** " + pendentes.length,
    pendentes.length ? [cabecalho, ...pendentes.map(r => linha(r, true))].join("\n") : "Nenhuma pendência.",
    "Os valores são os informados na conversa; preços anunciados não são confirmação de carrinho. Nenhum dado foi salvo em banco remoto."
  ].join("\n\n");
  return {
    status: "tabela_conversacional_pronta",
    produto: String(produto), quantidade,
    ofertas_atualizadas: registros,
    ranking: completos, pendentes,
    menor_total: completos[0] ?? null,
    tabela_markdown: tabela,
    armazenado_remotamente: false,
    observacao: "Copie a tabela para a conversa para registrar os resultados. Edite passando o estado anterior como ofertas e apenas os campos alterados como edicoes; nunca refaça pesquisa por causa de correção."
  };
}
