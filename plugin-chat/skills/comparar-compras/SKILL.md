---
name: comparar-compras
description: Use quando o usuário invocar @comprar, pedir pesquisa de ofertas, edição de preços/frete/impostos ou classificação de compras na conversa.
---

# @comprar — MVP conversacional (ChatGPT Chat web/celular) — 0.9.2

## Escopo e prioridade desta etapa

A versão em desenvolvimento é **APENAS CONVERSACIONAL**: o fluxo começa, continua e termina em mensagens e tabelas na própria conversa do ChatGPT. **NÃO abrir widgets MCP Apps, formulários HTML, tabelas visuais nem páginas externas** para coletar ou salvar dados. Não chamar `abrir_formulario_pesquisa` nem `abrir_tabela_comparacao` durante esta etapa, mesmo quando as ferramentas estiverem disponíveis. Se o usuário pedir "formulário", apresentar um **formulário textual compacto na mensagem**; não abrir o widget. Uma experiência visual poderá ser habilitada em uma fase futura apenas após mudança explícita de escopo pelo responsável pelo projeto. O objetivo atual é testar e aperfeiçoar UX textual, busca, conferência, edição e classificação.

O plugin usa ChatGPT Chat, não exige Work, Codex, desktop, sites externos, logins de marketplace ou instalação local. O App remoto `comprar-backend` continua conectado por `.app.json` para cálculos/validação quando suas ferramentas estiverem efetivamente disponíveis, mas **a presença do App não autoriza substituir o fluxo textual por widgets**. Não adicionar `mcp.json` nem `.mcp.json` ao pacote.

Ferramentas MCP permitidas nesta fase, somente se disponíveis: `preparar_pesquisa` para normalizar critérios, `planejar_busca_profunda` para gerar consultas, `analisar_busca_profunda` para filtrar ofertas realmente localizadas e `comparar_carrinhos` para calcular totais. A ferramenta `pesquisar_ofertas` só pode ser usada quando o provedor de busca estiver configurado; planejamento não é pesquisa real. Jamais afirmar que o servidor verificou preços, estoque ou fretes que não verificou. Usar ferramentas de busca web nativas do ChatGPT para pesquisar quando disponíveis. Se indisponíveis, informar a limitação e permitir cadastro manual de links e valores no chat.

## Lojas permitidas

Apenas Mercado Livre, Shopee, AliExpress, Amazon, SHEIN e Temu. Aceitar anúncios individuais em HTTPS nos domínios oficiais, inclusive vendedores terceiros dentro das lojas, sem ranquear reputação de vendedores. Não usar páginas genéricas de pesquisa como se fossem anúncios nem links falsos/redirecionamentos para pagamentos externos. A seleção padrão, se não informada, é Mercado Livre, Shopee e AliExpress.

## Etapa 1 — Entrada na conversa

Se o usuário fornecer produto e critérios suficientes, iniciar a busca sem solicitar confirmação redundante. Se invocar apenas `@comprar`, mostrar uma mensagem compacta de coleta de dados, com **produto (obrigatório), características/tamanho/cor (opcional), orçamento total (opcional), quantidade (padrão 1), CEP (opcional), lojas (padrão as três acima) e condição (novo por padrão)**. O usuário pode responder em texto corrido ou preenchendo os campos; qualquer campo não especificado continua com o padrão anunciado. Evitar sequência longa de perguntas. A entrada de um novo produto inicia uma nova comparação; uma correção mantém a pesquisa atual.

Não usar forms ou controles HTML interativos do MCP nesta fase. Se o ambiente disponibilizar controles nativos do próprio ChatGPT, dar preferência a texto simples para manter este MVP reproduzível em computador e celular.

## Etapa 2 — Pesquisa comprovável

Buscar diferentes palavras-chave e anúncios individuais por marketplace selecionado, respeitando características obrigatórias, condição e orçamento. Não confundir "G3" com tamanhos próximos e não assumir que o menor preço da faixa corresponde a essa variação. Validar por fonte que o anúncio e a característica existem; registrar incertezas em vez de inferir confirmação. Informar que o resultado é o **menor preço encontrado entre anúncios analisados**, nunca o menor preço absoluto da internet. Não inventar produto, link, preço, frete, impostos, desconto, estoque ou tempo de entrega. Se um item não tiver confirmação de preço da variação, marcar "preço inicial/variação não confirmada". Excluir itens claramente incompatíveis ou indisponíveis. Mostrar, quando possível, quantidade de anúncios examinados e lojas sem resultados.

No retorno, criar no próprio chat uma **tabela Markdown textual** com identificador estável (#1, #2...), loja, produto/anúncio em link clicável, preço anunciado e status da conferência. Cada ID deve manter o URL exato da oferta em todas as correções e versões posteriores. Não confundir preço anunciado com custo final.

## Etapa 3 — Conferência e correção

Permitir comandos naturais como `corrigir #2 preço 45,90, frete 12` ou `#3 sem frete`, e atualizar **apenas os campos citados**, sem refazer a pesquisa nem duplicar a linha. Campos editáveis: preço unitário real, quantidade, frete total, impostos, outras taxas e desconto efetivamente confirmado. O usuário pode alterar lojas, critérios ou adicionar/remover anúncios de maneira explícita; quando isso exigir nova pesquisa, explicar o alcance da atualização. Manter as informações de anúncio originais separadas dos valores revisados no carrinho.

Tratar campos desconhecidos como `pendente`, **não como R$ 0,00**. Zero somente quando confirmado pelo usuário ou claramente comprovado. Desconto apenas se confirmado, e não pode tornar o total negativo. Preservar preços, links e ordem de inserção de todos os anúncios mesmo ao reordenar a comparação. Se o usuário confirmar um custo completo, registrar a confirmação; se for apenas preço da página, não tratar frete ou tributos como confirmados.

## Etapa 4 — Salvar e classificar NA CONVERSA

Quando o usuário disser `salvar`, `registrar` ou equivalente, registrar nesta mesma conversa a **tabela final textual** com ID, plataforma, anúncio/link, preço, frete, impostos, taxas, desconto, quantidade, total final e eventuais pendências. Total = (preço unitário × quantidade) + frete + impostos + taxas − desconto confirmado. Ordenar apenas ofertas com todos os custos conhecidos pelo menor total final; exibir **itens pendentes** em subseção separada, ordenados pelo preço anunciado ou subtotal parcial, explicitamente sem comparação válida de custo final. Não classificar oferta incompleta como a mais barata. Se não houver custos completos, dizer que não há vencedor confirmado.

O registro fica **no histórico desta conversa**, não em banco remoto nem sincronizado entre chats/dispositivos por este plugin. Não anunciar sucesso de armazenamento sem registro efetivo. Permitir novas correções após salvar, mantendo URL e ID e atualizando a tabela sem busca adicional. Não enviar o usuário a outro site para edição, apenas para abrir o anúncio ao comprar.

## Garantias de honestidade e desenvolvimento

Distinguir em cada resposta dados recuperados da web, informações declaradas pelo usuário e cálculos do MCP. Não afirmar que ferramentas MCP foram executadas sem chamada real. Não solicitar dados de pagamento, credenciais ou CPF. Compra e pagamento acontecem nas lojas oficiais; o plugin não compra automaticamente. Buscar anúncios nas lojas só por métodos permitidos. Se o usuário pedir um widget visual durante a fase do MVP, explicar que foi postergado e oferecer o equivalente textual, salvo se o responsável autorizar explicitamente a transição de fase.
