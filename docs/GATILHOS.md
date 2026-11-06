# Gatilhos de modo do @comprar

Este guia explica como escolher entre o **modo conversacional (padrão)** e o **modo visual (opcional e experimental)** no mesmo plugin de comparação de compras.

> **Importante:** `#visual` e `#chat` são palavras-gatilho reconhecidas pelas instruções do **@comprar**, e não comandos universais ou recursos nativos do ChatGPT. A disponibilidade do modo visual depende das ferramentas MCP disponíveis na sessão e do suporte da interface utilizada.

## Comandos disponíveis

| O que digitar | Resultado esperado |
|---|---|
| `@comprar` | Inicia a coleta por mensagens e, após a pesquisa, a **tabela editável nativa do chat**, se disponível, sem abrir a interface MCP avançada. |
| `@comprar Quero pesquisar uma camiseta oversized G3` | Inicia a pesquisa **conversacional** com os critérios já fornecidos. |
| `@comprar #visual` | Solicita o **modo visual** desde o início. |
| `#visual` | Na conversa já iniciada com o plugin, solicita a interface visual para a comparação em andamento. |
| `#chat` | Volta à apresentação **conversacional**, em texto e tabelas no chat. |
| `modo visual` / `modo chat` | Alternativas escritas por extenso para os gatilhos correspondentes. |

O modo conversacional (incluindo a [tabela inline de preenchimento](TABELA-CHAT.md)) é sempre o **padrão de uma nova pesquisa** quando não há solicitação explícita de interface gráfica. O gatilho deve ser um pedido intencional de troca de modo; a palavra "visual" usada casualmente em características de um produto não deve mudar o modo.

## Exemplo 1: comparação somente no chat

1. Escreva: `@comprar Quero uma blusa oversized G3, até R$ 150, no Mercado Livre, Shopee e SHEIN.`
2. O plugin procura anúncios individuais com os recursos de pesquisa efetivamente disponíveis e apresenta ofertas, links e valores encontrados na conversa. Se não puder pesquisar, deve avisar e permitir cadastrar links manualmente.
3. Informe uma correção, por exemplo: `corrigir #2 frete 12,90`.
4. Ao finalizar, envie `salvar` para receber a tabela textual com os totais confirmados e as pendências de custo.

A pesquisa **não** é refeita ao modificar apenas um valor. Cada anúncio mantém seu número e link. Custos não conhecidos ficam pendentes; um preço de vitrine não é tratado automaticamente como total final.

## Exemplo 2: ativar o modo gráfico desde o começo

Escreva: `@comprar #visual`.

Quando a ferramenta estiver disponível, o plugin deverá solicitar o formulário MCP `abrir_formulario_pesquisa`. Depois da pesquisa e da seleção de anúncios, poderá usar a tabela gráfica `abrir_tabela_comparacao`.

Se o cliente ChatGPT não oferecer essas ferramentas, o plugin deve **informar a limitação** e oferecer o fluxo equivalente em mensagens; não deve afirmar que um widget abriu sem tê-lo aberto.

## Exemplo 3: alternar durante a mesma compra

1. Comece a comparação normalmente com `@comprar`.
2. Depois dos resultados, envie `#visual` para solicitar a tabela gráfica das ofertas já conhecidas, evitando nova pesquisa quando possível.
3. Envie `#chat` para retornar à comparação por mensagens.

**Estado da comparação:** anúncios, preços e correções que já estiverem registrados na conversa podem ser reutilizados. Porém, valores editados **somente no widget visual** não são automaticamente sincronizados com o texto: para reutilizá-los, precisam ser efetivamente enviados à conversa. O plugin não fornece banco de dados remoto nem sincronização garantida entre chats.

## O que cada modo oferece

| Recurso | Chat (padrão) | Visual (opcional) |
|---|---|---|
| Informar produto, tamanho, orçamento e lojas | Texto na conversa | Formulário gráfico, se disponível |
| Pesquisa de anúncios reais | Ferramentas de pesquisa disponíveis no ChatGPT | As mesmas fontes e limitações |
| Corrigir frete, impostos e descontos | Comandos por ID do anúncio | Campos da tabela, se disponíveis |
| Comparação de custos | Tabela textual com pendências | Tabela interativa, se disponível |
| Guardar resultado | Histórico da conversa | Estado do widget; exportação quando oferecida |
| Exige Work ou Codex | Não | Não é o objetivo; depende de suporte MCP no ChatGPT |

## Status e próximos passos

- **Versão 0.9.4:** os gatilhos estão configurados nas instruções do plugin. A alternância deve ser validada na interface ChatGPT Web e no celular, pois ter o App associado não garante que widgets sejam apresentados em todas as sessões.
- **Fase prioritária:** aperfeiçoamento e testes do fluxo conversacional, incluindo descoberta confiável de anúncios, correção de valores e tabela final.
- **Fase visual:** aperfeiçoar o design, o controle de estado e a interoperabilidade com o chat **depois da validação do fluxo conversacional**.

Projeto: [Comparador Inteligente de Compras](https://github.com/lucasteixeira31/comparador-inteligente-compras) · Plugin: [@comprar](https://chatgpt.com/plugins/plugins_6aec7f66091c8191bbd817b51317b307).
