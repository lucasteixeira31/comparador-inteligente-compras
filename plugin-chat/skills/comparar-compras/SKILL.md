---
name: comparar-compras
description: Use quando o usuário invocar @comprar, pedir pesquisa de ofertas, edição de preços/frete/impostos ou classificação de compras na conversa.
---

# @comprar — Chat com tabela editável nativa; #visual sob demanda — 0.9.7

## Modos de uso e gatilhos (experiência padrão: conversa)

**MODO CHAT É O PADRÃO INCONDICIONAL** de toda nova pesquisa. Ao chamar `@comprar`, pesquisar um produto, corrigir preços ou dizer `salvar` **sem comando de mudança**, trabalhar na própria conversa, incluindo **tabela editável com controles nativos inline após a pesquisa**, quando o cliente ChatGPT oferecer essa capacidade; **não abrir formulários nem tabelas MCP Apps automaticamente**. A tabela com campos de entrada é a interface leve do modo Chat e NÃO equivale ao modo gráfico avançado `#visual`.

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

No modo Chat, não abrir os widgets HTML/MCP Apps e solicitar os critérios iniciais por mensagem simples. **Depois da busca**, usar controles nativos do ChatGPT para a tabela editável inline, se disponíveis; `#visual` é reservado exclusivamente à interface gráfica MCP Apps avançada. No modo Visual expressamente solicitado com `#visual`, abrir o formulário MCP se disponível.

## Etapa 2 — Pesquisa comprovável

Buscar diferentes palavras-chave e anúncios individuais por marketplace selecionado, respeitando características obrigatórias, condição e orçamento. Não confundir "G3" com tamanhos próximos e não assumir que o menor preço da faixa corresponde a essa variação. Validar por fonte que o anúncio e a característica existem; registrar incertezas em vez de inferir confirmação. Informar que o resultado é o **menor preço encontrado entre anúncios analisados**, nunca o menor preço absoluto da internet. Não inventar produto, link, preço, frete, impostos, desconto, estoque ou tempo de entrega. Se um item não tiver confirmação de preço da variação, marcar "preço inicial/variação não confirmada". Excluir itens claramente incompatíveis ou indisponíveis. Mostrar, quando possível, quantidade de anúncios examinados e lojas sem resultados.

No modo Chat, publicar os resultados com identificador estável (#1, #2...), loja, produto/anúncio em link clicável, preço anunciado e status da conferência e **na mesma resposta disponibilizar a tabela de preenchimento inline** (especificação abaixo). Não esperar nova mensagem para oferecer o cadastro de custos. No modo Visual, apresentar a interface MCP sob comando `#visual`, preservando IDs e fontes já conhecidos. Cada ID mantém exatamente o mesmo URL em todas as correções. Não confundir preço anunciado com preço real confirmado.

### Verificação de características e variações obrigatórias (v0.9.5)

Quando o usuário pedir tamanho, cor, versão ou modelo específico, tratar essa condição como **obrigatória**. Na análise por `analisar_busca_profunda`, informar `caracteristicas_obrigatorias` com os critérios relevantes, sem usar `produto_confirmado: true` para ignorar tamanho incorreto. O analisador só considera uma oferta compatível se a característica aparecer no anúncio ou tiver sido explicitamente conferida na fonte em `caracteristicas_confirmadas`. Essa lista representa **informação declarada pelo agente**, não verificação independente feita pelo servidor. Se nenhuma fonte comprovar G3, deixar como pendente de característica e **não** afirmar que o anúncio está disponível em G3.

Distinguir **G3 listado na grade** de **preço específico da variação G3**. Informar `preco_variacao_confirmado: true` somente se a seleção de G3 e seu preço forem realmente verificáveis na página. Caso contrário, manter o valor em `preco_unitario` como preço anunciado provisório, sinalizar `preco_variacao_nao_confirmado` e não anunciar esse valor como preço de G3 confirmado. `menor_preco_anunciado_provisorio` não equivale a `menor_preco_da_variacao_confirmada_provisorio`, nem a menor custo final confirmado. Não fabricar citações, referências `turn...` ou datas de consulta: só citar fontes realmente retornadas pelas ferramentas em execução.

Sempre preservar dados da fonte recuperada e expor incertezas, sem transformar em verificação automática os indicadores declarados à ferramenta. A pesquisa é feita com ferramentas de busca externas efetivamente disponíveis, não pelo analisador.

## Etapa 2.5 — TABELA EDITÁVEL INLINE NO CHAT (fluxo padrão, v0.9.7)

### Apresentação RESPONSIVA EM CARTÕES EXPANSÍVEIS (v0.9.7)

**Padrão de UX obrigatório:** a tabela ampla com dois blocos e quatro campos repetidos em todas as linhas foi rejeitada por ser pouco responsiva. Não usar tabela HTML/Markdown com formulários embutidos. Em vez disso, renderizar **lista vertical de cartões compactos, mobile-first** com **edição progressiva por anúncio**.

- No estado fechado, cada cartão contém somente **ID estável**, nome/loja, **link individual do anúncio**, preço anunciado e situação G3, além do botão **Editar**; não exibir campos vazios dos nove anúncios de uma vez.
- Ao clicar Editar, expandir **um anúncio por vez** com controles nativos do chat rotulados **Preço real (R$)**, **Frete (R$)** e **Impostos (R$)** e **Taxas (R$)** opcionais, em grade responsiva (até duas colunas, uma coluna quando o espaço for estreito). Disponibilidade é uma confirmação explícita opcional. Os outros cartões ficam compactos.
- **Manter os valores digitados no estado compartilhado** mesmo quando o usuário fechar um anúncio e abrir outro. Ofertas editadas recebem indicação discreta de preenchimento; não marcar como 'completo' enquanto custos ou disponibilidade estiverem pendentes.
- Mostrar **um único botão Enviar tabela ao final da lista** para todas as correções, inclusive parciais. Jamais exigir comandos por ID nem um botão separado por anúncio.
- Evitar rolagem horizontal, colunas apertadas, preços truncados, formulários inteiros repetidos e cards excessivamente altos. Links legíveis, alvos de toque apropriados, labels sempre visíveis, campos vazios = null, 0 só quando digitado.
- Na resposta seguinte, preservar IDs e links e chamar `consolidar_comparacao_chat` com a mesma pesquisa, o catálogo completo e apenas os campos alterados. Se o cliente não oferecer controles nativos, apresentar um fallback textual compacto; não alegar que o botão funciona.
- Esta interface leve é a experiência **Chat**, nunca chamar as ferramentas MCP Apps visuais sem o gatilho `#visual`.



**Requisito principal de UX:** terminou a pesquisa e encontrou anúncios individuais reais? Já mostrar, **na mesma resposta**, um formulário em formato de tabela compacto **dentro da conversa**. Não esperar o usuário digitar `corrigir #6 ...` e não obrigar uma mensagem por anúncio. Usar **componentes nativos interativos do ChatGPT** (`input`/campos, tabelas/linhas, botão de envio ou equivalente) caso o host suporte; são diferentes dos recursos UI/HTML do MCP. Nunca chamar `abrir_tabela_comparacao` ou `abrir_formulario_pesquisa` no modo Chat. Em celulares, adaptar a tabela a linhas/cartões compactos se necessário, sem mudar o fluxo.

- Cada anúncio precisa exibir **ID estável**, loja, nome/link individual, preço anunciado e indicação de tamanho/variação. Ao lado, oferecer campos editáveis **Preço real encontrado (R$)**, **Frete (R$)** e **Impostos (R$)**. Incluir **taxas adicionais e desconto confirmado** como campos opcionais quando cabíveis, e opção explícita de **disponibilidade confirmada** para permitir o ranking completo; não inventar confirmação de estoque.
- Os campos de preço real/frete/impostos começam **vazios**, mesmo se um preço anunciado existir. O preço anunciado é referência não editável da fonte; não preenchê-lo como preço confirmado no carrinho. Valores já confirmados pelo usuário em turnos anteriores podem ser pré-preenchidos na revisão da tabela. Campo vazio significa `null`/pendente; o número zero só conta se digitado ou comprovado. Descontos não confirmados não são aplicados.
- Mostrar **um único botão funcional “Enviar tabela”** (ou “Enviar alterações”) abaixo de **todas** as linhas. Ao clicar, a ação nativa deve enviar uma única nova mensagem à **mesma conversa**, com o conjunto completo de anúncios (IDs, loja, título, URL, preço anunciado) e todas as edições informadas; nunca abrir outra aba, comprar ou anunciar salvamento de banco remoto. Não omitir linhas vazias do conjunto; enviar somente valores realmente preenchidos como edições. Permitir envio parcial.
- Ao receber a mensagem gerada pelo botão, interpretar a tabela como **correção da pesquisa atual**, sem iniciar nova busca. Preferir `consolidar_comparacao_chat` passando todos os anúncios existentes em `ofertas`, alterações por ID em `edicoes` e orçamento em `orcamento_total`. Se não houver ferramenta, calcular com o mesmo rigor na conversa. Responder com ranking final apenas para ofertas completas e disponibilidade confirmada, mais seção de pendências; preservar links e IDs.
- Se o usuário alterar uma oferta depois, reapresentar a tabela nativa com campos já informados, permitindo novo envio único e sem duplicação.
- **Limitação do cliente:** instruções de skill não garantem renderização de controles nativos em todos os clientes do ChatGPT. Se o host não oferecer entradas interativas, avisar de forma breve e fornecer uma única tabela preenchível/copiável para o usuário devolver inteira, sem exigir comandos `#id valor...`. Não chamar isso de tabela editável funcional se nenhum botão/estado puder ser usado.

## Etapa 3 — Conferência e correção

**A forma principal de corrigir é pela tabela editável inline com envio único**. Comandos naturais como `corrigir #2 preço 45,90, frete 12` ainda são aceitos como alternativa, mas não devem ser exigidos. Atualizar apenas os campos preenchidos ou citados, sem refazer a pesquisa nem duplicar a linha. Campos editáveis: preço unitário real, quantidade, frete total, impostos, outras taxas e desconto efetivamente confirmado. O usuário pode alterar lojas, critérios ou adicionar/remover anúncios de maneira explícita; quando isso exigir nova pesquisa, explicar o alcance da atualização. Manter as informações de anúncio originais separadas dos valores revisados no carrinho.

**Para corrigir anúncios já encontrados**, priorizar `consolidar_comparacao_chat`: passar em `ofertas` o conjunto atual completo de anúncios com seus IDs e URLs, e em `edicoes` apenas os campos mencionados para cada ID. O retorno `ofertas_atualizadas` é o novo estado da comparação a manter no histórico da conversa. Não inventar valor de `preco_unitario`: o preço de vitrine deve ficar em `preco_anunciado` até confirmação explícita. A ferramenta não pesquisa produtos, não abre widgets e não grava dados remotamente. Se a ferramenta não estiver disponível, manter o mesmo comportamento com tabelas Markdown calculadas na conversa.

Tratar campos desconhecidos como `pendente`, **não como R$ 0,00**. Zero somente quando confirmado pelo usuário ou claramente comprovado. Desconto apenas se confirmado, e não pode tornar o total negativo. Preservar preços, links e ordem de inserção de todos os anúncios mesmo ao reordenar a comparação. Se o usuário confirmar um custo completo, registrar a confirmação; se for apenas preço da página, não tratar frete ou tributos como confirmados.

## Etapa 4 — Salvar e classificar NA CONVERSA

No modo Chat, quando o usuário disser `salvar`, `registrar` ou equivalente, usar a `tabela_markdown` de `consolidar_comparacao_chat` quando disponível e **publicá-la como mensagem na própria conversa**, sem confundir o retorno do MCP com armazenamento. Se não houver essa ferramenta, produzir equivalente Markdown manualmente. Registrar nesta mesma conversa a **tabela final textual** com ID, plataforma, anúncio/link, preço, frete, impostos, taxas, desconto, quantidade, total final e eventuais pendências. Total = (preço unitário × quantidade) + frete + impostos + taxas − desconto confirmado. Ordenar apenas ofertas com todos os custos conhecidos pelo menor total final; exibir **itens pendentes** em subseção separada, ordenados pelo preço anunciado ou subtotal parcial, explicitamente sem comparação válida de custo final. Não classificar oferta incompleta como a mais barata. Se não houver custos completos, dizer que não há vencedor confirmado.

O registro fica **no histórico desta conversa**, não em banco remoto nem sincronizado entre chats/dispositivos por este plugin. Não anunciar sucesso de armazenamento sem registro efetivo. Permitir novas correções após salvar, mantendo URL e ID e atualizando a tabela sem busca adicional. Não enviar o usuário a outro site para edição, apenas para abrir o anúncio ao comprar.

### Orçamento no ranking conversacional (v0.9.5)

Se o usuário informar orçamento (ex.: R$ 150), transmitir esse valor como `orcamento_total` ao chamar `consolidar_comparacao_chat`. Classificar os **totais completos** como `dentro_orcamento` ou `acima_orcamento` considerando preço unitário × quantidade, frete, impostos, taxas e descontos efetivamente confirmados. Para anúncios sem preço real, frete, tributos, taxas ou disponibilidade, o cumprimento do orçamento é **indeterminado**, mesmo que o preço anunciado seja baixo. Não afirmar que o menor preço de vitrine é a compra dentro do orçamento.

## Garantias de honestidade e desenvolvimento

Distinguir em cada resposta dados recuperados da web, informações declaradas pelo usuário e cálculos do MCP. Não afirmar que ferramentas MCP foram executadas sem chamada real. Não solicitar dados de pagamento, credenciais ou CPF. Compra e pagamento acontecem nas lojas oficiais; o plugin não compra automaticamente. Buscar anúncios nas lojas só por métodos permitidos. Não abrir interface visual por padrão. Se o usuário digitar `#visual` ou pedir explicitamente `modo visual`, usar o widget MCP apropriado quando disponível. No modo visual, não presumir salvamento remoto ou sincronização de edições do widget com a conversa; no modo chat, garantir que o registro final seja uma mensagem textual.
