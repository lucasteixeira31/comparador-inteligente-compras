import { createMcpHandler } from "mcp-handler";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { verificarAnuncio } from "../../../src/pesquisa.mjs";
import { z } from "zod";
import { pesquisarOfertas } from "../../../src/pesquisa.mjs";
import { planejarBuscaProfunda, analisarBuscaProfunda } from "../../../src/busca-profunda.mjs";
import { compararOfertas, prepararPesquisa, LOJAS, cents } from "../../../src/comparacao.mjs";

export const runtime = "nodejs";
export const maxDuration = 60;

const loja = z.enum(LOJAS as [string, ...string[]]);
const dinheiro = z.union([z.number().nonnegative(),z.string()]).nullable().optional();

const handler = createMcpHandler((server) => {
  server.registerTool("preparar_pesquisa", {
    title: "Preparar pesquisa de compra",
    description: "Organiza critérios para pesquisa no ChatGPT Web. Não consulta marketplaces diretamente.",
    inputSchema: z.object({
      produto: z.string().min(1),
      caracteristicas: z.array(z.string()).default([]),
      lojas: z.array(loja).min(1).default(["Mercado Livre", "Shopee", "AliExpress"]),
      quantidade: z.number().int().min(1).max(1000).default(1),
      orcamento: dinheiro,
      cep: z.string().nullable().optional(),
      condicao: z.enum(["novo", "usado", "qualquer"]).default("novo")
    }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }, async args => {
    const dados = prepararPesquisa(args as any);
    return { content: [{ type: "text", text: JSON.stringify(dados) }], structuredContent: dados };
  });

  server.registerTool("comparar_carrinhos", {
    title: "Comparar custo final das ofertas",
    description: "Calcula ranking de custo real com frete, impostos, taxas e cupons confirmados; preserva desconhecidos.",
    inputSchema: z.object({
      quantidade: z.number().int().min(1).max(1000).default(1),
      ofertas: z.array(z.object({
        id: z.string().optional(), loja, produto: z.string().optional(), url: z.string().url().nullable().optional(),
        preco_unitario: dinheiro, frete: dinheiro, impostos: dinheiro, outras_taxas: dinheiro,
        disponivel: z.boolean().nullable().optional(),
        desconto_tipo: z.enum(["fixo", "percentual"]).default("fixo"),
        desconto_valor: dinheiro, desconto_percentual: z.number().min(0).max(100).default(0),
        cupom_confirmado: z.boolean().default(false), preco_confirmado_carrinho: z.boolean().default(false),
        frete_confirmado_carrinho: z.boolean().default(false), impostos_confirmados_carrinho: z.boolean().default(false)
      })).max(100)
    }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }, async args => {
    const dados = compararOfertas(args as any);
    return { content: [{ type: "text", text: JSON.stringify(dados) }], structuredContent: dados };
  });

  server.registerTool("pesquisar_ofertas", {
    title: "Pesquisar links de anúncios",
    description: "Busca páginas de anúncios indexadas em marketplaces selecionados usando uma integração de busca autorizada, quando configurada pelo mantenedor. Não confirma preços nem estoque.",
    inputSchema: z.object({
      produto: z.string().min(2).max(200),
      caracteristicas: z.array(z.string().max(160)).max(12).default([]),
      lojas: z.array(loja).min(1).max(6).default(["Mercado Livre", "Shopee", "AliExpress"]),
      limite_por_loja: z.number().int().min(1).max(5).default(3)
    }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: true }
  }, async args => {
    const dados = await pesquisarOfertas(args as any);
    return { content: [{ type: "text", text: JSON.stringify(dados) }], structuredContent: dados };
  });

  server.registerTool("planejar_busca_profunda", {
    title: "Planejar pesquisa ampla por marketplace",
    description: "Gera múltiplas consultas precisas por marketplace aprovado, sem consumir APIs, sem executar consultas nem inventar resultados.",
    inputSchema: z.object({
      produto: z.string().min(1).max(200),
      caracteristicas_obrigatorias: z.array(z.string().max(100)).max(8).default([]),
      lojas: z.array(loja).min(1).max(6).default(["Mercado Livre","Shopee","AliExpress","Amazon","SHEIN","Temu"]),
      max_consultas_por_loja: z.number().int().min(1).max(4).default(3)
    }),
    annotations: {readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false}
  }, async args => {
    const dados = planejarBuscaProfunda(args as any);
    return {content:[{type:"text",text:JSON.stringify(dados)}],structuredContent:dados};
  });

  server.registerTool("analisar_busca_profunda", {
    title: "Filtrar e comparar anúncios coletados",
    description: "Analisa ofertas fornecidas, valida links diretos de marketplaces, deduplica, identifica diferenças de preço anunciado e custo final, com cobertura e pendências. Não consulta lojas nem verifica preços por conta própria.",
    inputSchema: z.object({
      produto: z.string().min(1).max(200),
      caracteristicas_obrigatorias: z.array(z.string().max(100)).max(8).default([]),
      lojas: z.array(loja).min(1).max(6).default(["Mercado Livre","Shopee","AliExpress","Amazon","SHEIN","Temu"]),
      quantidade: z.number().int().min(1).max(1000).default(1),
      ofertas: z.array(z.object({
        loja,
        titulo: z.string().min(1).max(300),
        url: z.string().url(),
        preco_unitario: dinheiro,
        frete: dinheiro,
        impostos: dinheiro,
        outras_taxas: dinheiro,
        disponivel: z.boolean().nullable().optional(),
        produto_confirmado: z.boolean().default(false),
        preco_confirmado_carrinho: z.boolean().default(false),
        frete_confirmado_carrinho: z.boolean().default(false),
        impostos_confirmados_carrinho: z.boolean().default(false),
        origem: z.string().max(100).optional()
      })).max(100).default([])
    }),
    annotations: {readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false}
  }, async args => {
    const dados = analisarBuscaProfunda(args as any);
    return {content:[{type:"text",text:JSON.stringify(dados)}],structuredContent:dados};
  });


  server.registerResource("Formulário inicial do comparador", "ui://comparador/formulario-pesquisa-v1", {
    mimeType: "text/html;profile=mcp-app",
    description: "Formulário de pesquisa de produtos apresentado na própria conversa."
  }, async () => ({
    contents: [{
      uri: "ui://comparador/formulario-pesquisa-v1",
      mimeType: "text/html;profile=mcp-app",
      text: await readFile(join(process.cwd(), "public", "widget-pesquisa.html"), "utf8"),
      _meta: { "openai/ui": { availableDisplayModes: ["inline", "fullscreen"] }, ui: { prefersBorder: true } }
    }]
  }));

  server.registerTool("abrir_formulario_pesquisa", {
    title: "Abrir formulário de pesquisa no chat",
    description: "Primeira etapa do comparador: apresenta um formulário interativo inline de produto, características, quantidade, orçamento, CEP e marketplaces. A pesquisa é solicitada à conversa após o usuário clicar Pesquisar.",
    inputSchema: z.object({
      produto: z.string().max(200).default(""),
      caracteristicas: z.array(z.string().max(100)).max(8).default([]),
      orcamento: dinheiro,
      quantidade: z.number().int().min(1).max(1000).default(1),
      cep: z.string().max(9).nullable().optional(),
      condicao: z.enum(["novo", "usado", "qualquer"]).default("novo"),
      lojas: z.array(loja).min(1).max(6).default(["Mercado Livre", "Shopee", "AliExpress"])
    }),
    _meta: {
      ui: { resourceUri: "ui://comparador/formulario-pesquisa-v1" },
      "openai/outputTemplate": "ui://comparador/formulario-pesquisa-v1"
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }, async args => {
    const dados = { ...args, etapa: "formulario_pesquisa",
      orientacao: "Os critérios serão enviados à própria conversa. O servidor ainda não executou buscas." };
    return { content: [{ type: "text", text: JSON.stringify(dados) }], structuredContent: dados };
  });

  server.registerResource("Tabela de custos do comparador", "ui://comparador/tabela-custos-v1", {
    mimeType: "text/html;profile=mcp-app",
    description: "Interface para o usuário registrar preço real, frete, impostos e taxas, salvar na tabela e abrir o anúncio."
  }, async () => ({
    contents: [{
      uri: "ui://comparador/tabela-custos-v1",
      mimeType: "text/html;profile=mcp-app",
      text: await readFile(join(process.cwd(), "public", "widget-comparador.html"), "utf8")
    }]
  }));

  server.registerTool("abrir_tabela_comparacao", {
    title: "Abrir tabela editável de valores e links",
    description: "Exibe uma interface no ChatGPT para o usuário conferir anúncios, registrar preço real, frete, impostos e taxas e salvar cada oferta numa tabela com link do próprio anúncio. A lista pode vir de resultados pesquisados ou ficar vazia para cadastro manual. Não persiste em banco remoto.",
    inputSchema: z.object({
      produto: z.string().max(200).default(""),
      quantidade: z.number().int().min(1).max(1000).default(1),
      ofertas: z.array(z.object({
        loja,
        titulo: z.string().min(1).max(300),
        url: z.string().url(),
        preco_anunciado: dinheiro
      })).max(30).default([])
    }),
    _meta: {
      ui: { resourceUri: "ui://comparador/tabela-custos-v1" },
      "openai/outputTemplate": "ui://comparador/tabela-custos-v1"
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }, async args => {
    const vistos = new Set<string>();
    const ofertas = args.ofertas.filter(o => {
      if (!verificarAnuncio(o.url, o.loja)) return false;
      const key = o.loja + "|" + o.url.split("#")[0];
      if (vistos.has(key)) return false;
      vistos.add(key);
      return true;
    }).map(o => ({
      loja: o.loja,
      titulo: o.titulo,
      url: o.url,
      preco_anunciado: cents(o.preco_anunciado) === null ? null : cents(o.preco_anunciado)! / 100
    })).sort((a,b) => (a.preco_anunciado ?? Infinity) - (b.preco_anunciado ?? Infinity));
    const dados = {
      produto: args.produto,
      quantidade: args.quantidade,
      ofertas,
      links_rejeitados: args.ofertas.length - ofertas.length,
      armazenamento: "estado_do_widget",
      aviso: "Salvar na tabela guarda valores no estado deste widget. Para cópia durável, o usuário deve exportar o arquivo JSON. Preços anunciados não são confirmados automaticamente."
    };
    return { content: [{type:"text",text:JSON.stringify(dados)}], structuredContent:dados };
  });
});

export { handler as GET, handler as POST };
