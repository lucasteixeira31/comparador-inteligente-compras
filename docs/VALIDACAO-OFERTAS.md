# Validação de anúncios e orçamento — @comprar 0.9.5

O modo **Chat** é o padrão de trabalho. A interface gráfica só será aberta por `#visual` (ver [Gatilhos](GATILHOS.md)).

## Preço indexado e valor visto no anúncio (v0.9.9)

**Todo preço extraído apenas de busca indexada é provisório**, mesmo quando exibido em um cartão com link oficial. Snippets não comprovam o preço atual do tamanho escolhido, estoque ou frete. O usuário deve abrir o anúncio e conferir preços e encargos, informando diferenças nos campos de correção. `preco_anunciado` conserva o valor encontrado, e `preco_unitario` guarda o informado como preço real; informar divergência e não reescrever o histórico. Campo `url` do MCP contém exclusivamente o endereço HTTPS do anúncio em texto puro, sem sintaxe Markdown.

## O que o comparador consegue comprovar

1. **Link individual:** valida se a URL é HTTPS, pertence ao domínio oficial de um dos sete marketplaces aprovados e corresponde à estrutura de um anúncio individual. Isso **não comprova** que o anúncio existe, esteja disponível ou tenha aquele preço.
2. **Características obrigatórias:** tamanho, cor e versão precisam aparecer no título do anúncio ou estar explicitamente presentes nas informações conferidas na fonte. O indicador `produto_confirmado` não substitui a conferência de G3 quando G3 é obrigatório.
3. **Preço de variação:** encontrar “G3” na grade não significa que a variante G3 custe o menor preço exibido. Só declarar `preco_variacao_confirmado: true` se o preço da variação estiver realmente visível ou tiver sido informado pelo usuário.
4. **Disponibilidade:** somente quando conferida na fonte ou afirmada pelo usuário; o analisador não visita páginas por conta própria.
5. **Frete/tributos/taxas:** valor não informado permanece `pendente`. `R$ 0,00` só depois de confirmação.
6. **Proveniência:** ferramentas de planejamento e análise do MCP não fazem pesquisas; usar o mecanismo de pesquisa do ChatGPT quando disponível. Nunca inventar links, citações ou consultas ao carrinho.

## Orçamento total

O orçamento é avaliado somente contra **custo completo**:

```text
Total = preço unitário × quantidade + frete + impostos + taxas − descontos confirmados
```

- Exemplo A: blusa R$ 29,90 + frete R$ 15,00 + taxas/impostos R$ 0,00 confirmados = **R$ 44,90**. Com limite de R$ 40,00, **acima do orçamento**.
- Exemplo B: blusa R$ 35,00 + frete R$ 0,00 + demais custos R$ 0,00 confirmados = **R$ 35,00**, **dentro do orçamento**.
- Exemplo C: blusa anunciada a R$ 20,00, com frete ainda desconhecido = **resultado indeterminado**, mesmo abaixo do limite anunciado.

O custo real da variante e a disponibilidade devem ser conferidos na compra. O servidor não oferece garantias de menor preço absoluto.

## Protocolo de testes da versão 0.9.5

- G3 obrigatório + anúncio exclusivamente G1: não marcar como compatível.
- G3 listado + preço mínimo da vitrine: marcar preço da variação pendente.
- G3 e seu preço verificados na fonte: marcar preço de variação confirmado, sem inferir frete/estoque.
- Orçamento R$ 150: calcular status somente para ofertas completas; pendentes ficam indeterminadas.
- Alteração `corrigir #2 frete 12`: não gerar novo ID nem trocar o link.
- Comando `#visual`: fora do MVP padrão; só abrir por solicitação expressa.

**Limitação técnica:** os novos parâmetros `caracteristicas_confirmadas`, `preco_variacao_confirmado` e `orcamento_total` são dados recebidos pela ferramenta, não uma coleta independente. A confiabilidade depende das fontes efetivamente consultadas e da conferência no carrinho.


## TikTok Shop (v0.10.5)

Somente URLs individuais de produto em `shop.tiktok.com`, `www.tiktok.com` e `tiktok.com` com estrutura de detalhe `/view/product/<ID>` ou `/shop/pdp/<slug>/<ID>` (variações regionais suportadas). Recusar vídeos, lives, perfis, páginas de busca, links curtos e domínios falsificados. O ID deve ter 15 a 22 dígitos. Mesmo quando o link passar na validação sintática, isso não prova que a mercadoria exista ou esteja disponível no Brasil; preço e frete continuam a depender de confirmação pelo comprador.
