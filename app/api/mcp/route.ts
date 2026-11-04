import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { compararOfertas, prepararPesquisa, LOJAS } from "../../../src/comparacao.mjs";

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
    const dados = prepararPesquisa(args);
    return { content: [{ type: "text", text: JSON.stringify(dados) }], structuredContent: dados };
  });

  server.registerTool("comparar_carrinhos", {
    title: "Comparar custo final das ofertas",
    description: "Calcula ranking de custo real com frete, impostos, taxas e cupons confirmados; preserva desconhecidos.",
    inputSchema: z.object({
      quantidade: z.number().int().min(1).max(1000).default(1),
      ofertas: z.array(z.object({
        id: z.string().optional(), loja: z.string(), produto: z.string().optional(), url: z.string().url().nullable().optional(),
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
    const dados = compararOfertas(args);
    return { content: [{ type: "text", text: JSON.stringify(dados) }], structuredContent: dados };
  });
});

export { handler as GET, handler as POST };
