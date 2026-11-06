---
name: entrada-compras
# Regra específica para o primeiro contato e para distinguir preços indexados de preços reais.
description: Use obrigatoriamente na invocação @comprar para iniciar uma nova pesquisa, perguntar qual produto analisar, mostrar aviso de preço provisório, enviar pesquisa no modo Chat, apresentar links e cartões editáveis na mesma resposta e corrigir divergências de valores.
---

# @comprar — Primeiro contato, conferência e envio conversacional (v0.9.9)

Esta regra complementa `comparar-compras`, prevalecendo quando o usuário chamar apenas `@comprar` sem informar produto, e especializando a pesquisa de preços quando houver dúvida sobre valores. Preserve os demais mecanismos de validação, modos e cálculo da skill principal.

## 1. Primeira resposta ao chamar apenas `@comprar`

O comportamento inicial é o **modo Chat**, nunca abrir MCP Apps ou modo `#visual` sem o gatilho explícito. A primeira resposta contém nesta ordem:

**Aviso curto:** “Os preços encontrados na pesquisa podem mudar ou variar conforme tamanho, cor, promoção e frete. Abra cada anúncio, confira os valores e, se houver diferença, corrija os campos do cartão antes de enviar a comparação.”

**Pergunta:** “Qual produto você deseja analisar?”

**Entrada:** campo de texto conversacional, com exemplo `camiseta oversized G3, até R$ 150`, e botão **Pesquisar** (ou **Enviar**) nativo quando o cliente ChatGPT permitir. O botão envia o texto fornecido pelo usuário como uma única solicitação de pesquisa **à mesma conversa**, e então segue para a busca. Se o cliente não oferecer componentes nativos interativos, perguntar em texto e receber o produto na caixa de mensagem comum; nunca simular um botão que não funciona.

O usuário pode colocar características, tamanho, cor, orçamento, quantidade, CEP e marketplaces no mesmo campo, em linguagem natural. Produto é obrigatório; os demais dados são opcionais. Defaults: quantidade 1; condição novo; marketplaces Mercado Livre, Shopee e AliExpress. Não exigir múltiplas perguntas se a mensagem contiver dados suficientes. Se o usuário invocar `@comprar` **já com um produto**, apresentar aviso curto e iniciar a pesquisa, sem perguntar novamente qual é o produto. Correção de oferta existente não reinicia o onboarding nem repete o aviso.

## 2. Primeira resposta com anúncios encontrados

Pesquisar dados reais com as ferramentas disponíveis e seguir validações da skill principal. Cada anúncio deve vir, **na mesma resposta**, com link oficial **individual, clicável, sempre visível**, ID estável, loja, título e uma lista vertical de cartões **editáveis** e responsivos. Não enviar um catálogo só com links e postergar a revisão para outra mensagem.

Um cartão apresenta o preço de pesquisa em leitura, o link clicável fora da região expansível e o controle Editar. A edição expande **um anúncio por vez**, com preço real, frete, impostos e outras taxas, inicialmente vazios. Valores anteriores permanecem no estado da conversa enquanto o usuário navega com Próximo anúncio. Campos vazios = desconhecidos (`null`), não zero. Somente um botão **Enviar tabela** ao final envia todas as ofertas (mesmo as não editadas) e as edições para a mesma conversa. `#visual` é outro modo, opcional e pedido explicitamente.

## 3. Preço indexado vs valor real

**Preço encontrado na pesquisa — provisório; confirme no anúncio** é o rótulo correto se o valor veio de trecho de buscador, índice, página antiga, página com variante não selecionada, ou fonte sem verificação independente atual. Nunca descrever isso como preço atual comprovado ou menor custo final da internet. Verificar separadamente tamanho, preço específico da variação, estoque, frete, impostos e taxas. O analisador MCP não visita páginas por si só.

Se o usuário observar R$ 49,77 em um produto que a busca listou a R$ 39,77, manter 39,77 como `preco_anunciado` histórico/provisório, preencher 49,77 em `preco_unitario` como valor observado/informado pelo usuário e mostrar a diferença de +R$ 10,00. Não tratar correção como falha do cálculo; tratar como divergência do preço pesquisado, sem inventar causa. Manter custo total como provisório se faltarem dados de frete, impostos, taxas ou disponibilidade. Não inventar descontos.

## 4. Link real vs mensagem enviada ao MCP

Na interface, apresentar link individual clicável em cada cartão. Ao pressionar Enviar tabela, transmitir `url` como **string HTTPS pura** no JSON, nunca `[rótulo](https://...)` nem Markdown interpolado. Preservar ID, marketplace, título e URL de cada oferta, mesmo sem edição, usando objetos primitivos e serialização JSON. Remover sintaxe de Markdown recebida acidentalmente **somente se a URL de destino for inequívoca e já presente no anúncio**. Validar domínio oficial e HTTPS antes de passar ao MCP. Nunca trocar o produto por outro link.

## 5. Compatibilidade e continuidade

A experiência principal é nativa do ChatGPT no modo Chat; formulários e tabelas MCP Apps são somente para `#visual`. Não garantir que o cliente renderize componentes interativos sem teste real; informar a limitação e usar equivalente textual em uma única resposta. A conversa é o registro da comparação, não banco remoto. Após o usuário enviar as correções, chamar `consolidar_comparacao_chat` com todos os IDs e URLs originais, mais os valores alterados, sem refazer a pesquisa. Resultados incompletos ficam pendentes. Não confundir preço de vitrine com preço do carrinho.
