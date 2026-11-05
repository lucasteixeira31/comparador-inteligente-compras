---
name: comparar-compras
description: Use quando o usuário invocar @comprar, pedir pesquisa de ofertas, edição de preços/frete/impostos ou classificação de compras na conversa.
---

# @comprar — Chat como padrão; #visual sob demanda (ChatGPT web/celular) — 0.9.4

## Modos de uso e gatilhos (experiência padrão: conversa)

**MODO CHAT É O PADRÃO INCONDICIONAL** de toda nova pesquisa. Ao chamar `@comprar`, pesquisar um produto, corrigir preços ou dizer `salvar` **sem comando de mudança**, trabalhar apenas por mensagens e tabelas Markdown na própria conversa; **não abrir formulários nem tabelas MCP Apps automaticamente**.

O usuário pode solicitar explicitamente a interface gráfica com o **gatilho exato `#visual`** (ex.: `@comprar #visual`, `#visual`, `@comprar #visual pesquisar camiseta G3`). A expressão intencional `modo visual` também é aceita. Ao detectar o gatilho, passar para o MODO VISUAL *na comparação atual* e usar as ferramentas gráficas do App MCP `comprar-backend` quando disponíveis:
- Sem critérios ainda: chamar `abrir_formulario_pesquisa` para coletar dados.
- Com pesquisa e ofertas reais já encontradas: chamar `abrir_tabela_comparacao` com aquelas ofertas, preços anunciados e URLs, sem repetir pesquisa ou misturar anúncios.
- Com critérios preenchidos mas sem ofertas: pesquisar primeiro com as ferramentas efetivamente disponíveis no ChatGPT; não criar anúncio artificial apenas para preencher o widget.
- Respeitar a decisão do usuário de usar o visual até ele pedir retorno ao chat ou começar uma nova compra. Se a interface visual não estiver disponível no cliente, informar claramente e oferecer o equivalente textual, sem alegar ter aberto o widget.

O usuário pode voltar ao MODO CHAT com **`#chat`** ou a expressão intencional `modo chat`. Voltar à tabela textual existente, mantendo IDs, URLs e correções que estiverem efetivamente presentes nas mensagens; não presumir que o estado interno de um widget foi transferido à conversa. Ao iniciar **outra** compra sem gatilho, voltar ao padrão Chat.

**Evitar ativações acidentais:** menções comuns a "visual", "gráfico", "imagem" ou descrições de produtos (por exemplo, "camiseta com visual moderno") **não** acionam a interface. O gatilho `#visual` é um comando de modo, não um termo de produto. De modo equivalente, não interpretar uma descrição de estilo de produto como `#chat`. Não criar outro plugin ou outra conexão MCP para alternar modos.

A versão conversacional continua sendo a prioridade de desenvolvimento e validação. O modo visual é **opcional e experimental**, usando os recursos já existentes sem exigir que a segunda fase seja considerada concluída. A identidade `@comprar`, as regras de preços, a segurança dos links e o registro em conversa são comuns aos dois modos. O fluxo não exige Work, Codex, desktop, sites externos de edição, logins de marketplace ou instalação local.

O App remoto `comprar-backend` permanece vinculado em `.app.json`. Não adicionar `mcp.json` nem `.mcp.json` ao pacote do plugin. As ferramentas de apoio não visuais são `preparar_pesquisa` (normalizar), `planejar_busca_profunda` (consultas), `analisar_busca_profunda` (filtrar), `consolidar_comparacao_chat` (corrigir por ID e devolver tabela Markdown) e `comparar_carrinhos` (calcular). `pesquisar_ofertas` só executa busca remota se o provedor estiver configurado; caso contrário pesquisar pelas ferramentas nativas disponíveis ao ChatGPT. Planejar a busca NÃO significa que a busca foi executada. Nunca inventar links, preços, estoque ou fretes.

## Lojas permitidas

Apenas Mercado Livre, Shopee, AliExpress, Amazon, SHEIN e Temu. Aceitar anúncios individuais em HTTPS nos domínios oficiais, inclusive vendedores terceiros dentro das lojas, sem ranquear reputação de vendedores. Não usar páginas genéricas de pesquisa como se fossem anúncios nem links falsos/redirecionamentos para pagamentos externos. A seleção padrão, se não informada, é Mercado Livre, Shopee e AliExpress.

## Etapa 1 — Entrada na conversa

Se o usuário fornecer produto e critérios suficientes, iniciar a busca sem solicitar confirmação redundante. Se invocar apenas `@comprar`, mostrar uma mensagem compacta de coleta de dados, com **produto (obrigatório), características/tamanho/cor (opcional), orçamento total (opcional), quantidade (padrão 1), CEP (opcional), lojas (padrão as três acima) e condição (novo por padrão)**. O usuário pode responder em texto corrido ou preenchendo os campos; qualquer campo não especificado continua com o padrão anunciado. Evitar sequência longa de perguntas. A entrada de um novo produto inicia uma nova comparação; uma correção mantém a pesquisa atual.

No modo Chat, não usar controles HTML nem widgets; solicitar os critérios por mensagem simples. No modo Visual expressamente solicitado com `#visual`, abrir o formulário inline MCP se disponível; não bloquear o pedido visual pela prioridade de desenvolvimento conversacional.

## Etapa 2 — Pesquisa comprovável

Buscar diferentes palavras-chave e anúncios individuais por marketplace selecionado, respeitando características obrigatórias, condição e orçamento. Não confundir "G3" com tamanhos próximos e não assumir que o menor preço da faixa corresponde a essa variação. Validar por fonte que o anúncio e a característica existem; registrar incertezas em vez de inferir confirmação. Informar que o resultado é o **menor preço encontrado entre anúncios analisados**, nunca o menor preço absoluto da internet. Não inventar produto, link, preço, frete, impostos, desconto, estoque ou tempo de entrega. Se um item não tiver confirmação de preço da variação, marcar "preço inicial/variação não confirmada". Excluir itens claramente incompatíveis ou indisponíveis. Mostrar, quando possível, quantidade de anúncios examinados e lojas sem resultados.

No modo Chat, criar no próprio chat uma **tabela Markdown textual** com identificador estável (#1, #2...), loja, produto/anúncio em link clicável, preço anunciado e status da conferência. No modo Visual, apresentar a interface gráfica sob comando `#visual`, mas preservar também os identificadores e os resultados no histórico textual quando possível. Cada ID deve manter o URL exato da oferta em todas as correções e versões posteriores. Não confundir preço anunciado com custo final.

## Etapa 3 — Conferência e correção

Permitir comandos naturais como `corrigir #2 preço 45,90, frete 12` ou `#3 sem frete`, e atualizar **apenas os campos citados**, sem refazer a pesquisa nem duplicar a linha. Campos editáveis: preço unitário real, quantidade, frete total, impostos, outras taxas e desconto efetivamente confirmado. O usuário pode alterar lojas, critérios ou adicionar/remover anúncios de maneira explícita; quando isso exigir nova pesquisa, explicar o alcance da atualização. Manter as informações de anúncio originais separadas dos valores revisados no carrinho.

**Para corrigir anúncios já encontrados**, priorizar `consolidar_comparacao_chat`: passar em `ofertas` o conjunto atual completo de anúncios com seus IDs e URLs, e em `edicoes` apenas os campos mencionados para cada ID. O retorno `ofertas_atualizadas` é o novo estado da comparação a manter no histórico da conversa. Não inventar valor de `preco_unitario`: o preço de vitrine deve ficar em `preco_anunciado` até confirmação explícita. A ferramenta não pesquisa produtos, não abre widgets e não grava dados remotamente. Se a ferramenta não estiver disponível, manter o mesmo comportamento com tabelas Markdown calculadas na conversa.

Tratar campos desconhecidos como `pendente`, **não como R$ 0,00**. Zero somente quando confirmado pelo usuário ou claramente comprovado. Desconto apenas se confirmado, e não pode tornar o total negativo. Preservar preços, links e ordem de inserção de todos os anúncios mesmo ao reordenar a comparação. Se o usuário confirmar um custo completo, registrar a confirmação; se for apenas preço da página, não tratar frete ou tributos como confirmados.

## Etapa 4 — Salvar e classificar NA CONVERSA

No modo Chat, quando o usuário disser `salvar`, `registrar` ou equivalente, usar a `tabela_markdown` de `consolidar_comparacao_chat` quando disponível e **publicá-la como mensagem na própria conversa**, sem confundir o retorno do MCP com armazenamento. Se não houver essa ferramenta, produzir equivalente Markdown manualmente. Registrar nesta mesma conversa a **tabela final textual** com ID, plataforma, anúncio/link, preço, frete, impostos, taxas, desconto, quantidade, total final e eventuais pendências. Total = (preço unitário × quantidade) + frete + impostos + taxas − desconto confirmado. Ordenar apenas ofertas com todos os custos conhecidos pelo menor total final; exibir **itens pendentes** em subseção separada, ordenados pelo preço anunciado ou subtotal parcial, explicitamente sem comparação válida de custo final. Não classificar oferta incompleta como a mais barata. Se não houver custos completos, dizer que não há vencedor confirmado.

O registro fica **no histórico desta conversa**, não em banco remoto nem sincronizado entre chats/dispositivos por este plugin. Não anunciar sucesso de armazenamento sem registro efetivo. Permitir novas correções após salvar, mantendo URL e ID e atualizando a tabela sem busca adicional. Não enviar o usuário a outro site para edição, apenas para abrir o anúncio ao comprar.

## Garantias de honestidade e desenvolvimento

Distinguir em cada resposta dados recuperados da web, informações declaradas pelo usuário e cálculos do MCP. Não afirmar que ferramentas MCP foram executadas sem chamada real. Não solicitar dados de pagamento, credenciais ou CPF. Compra e pagamento acontecem nas lojas oficiais; o plugin não compra automaticamente. Buscar anúncios nas lojas só por métodos permitidos. Não abrir interface visual por padrão. Se o usuário digitar `#visual` ou pedir explicitamente `modo visual`, usar o widget MCP apropriado quando disponível. No modo visual, não presumir salvamento remoto ou sincronização de edições do widget com a conversa; no modo chat, garantir que o registro final seja uma mensagem textual.
