---
name: navegacao-compras
description: Use obrigatoriamente no @comprar ao exibir resultados, links, cartões editáveis ou comparação consolidada, e sempre que o usuário selecionar Buscar mais ofertas, Pesquisar mais, Nova pesquisa, Reiniciar pesquisa ou começar outra compra. Implementa os dois botões intuitivos no Chat, continuação sem duplicatas e início independente.
---

# @comprar — Continuidade e nova pesquisa no Chat (v0.10.1)

Esta skill complementa `comparar-compras` e `entrada-compras`. Nas ações de continuação/reinício e na disposição dos botões, esta regra prevalece sobre qualquer sugestão genérica de refazer a pesquisa. Não alterar a conexão MCP, a lista de marketplaces, as regras de custo e o modo `#visual`.

## 1. Onde mostrar os controles

Na **mesma resposta em que aparecerem anúncios reais e seus cartões editáveis**, exibir, **abaixo da lista e do botão único `Enviar tabela`**, duas ações de navegação nativas do ChatGPT, se o cliente permitir. Repeti-las depois da consolidação final. Não colocar esses controles antes da primeira pesquisa e não fazer um cartão de produto falso só para criar botões.

**Duas ações com rótulos inequívocos e descrições curtas:**

- **`Buscar mais ofertas`** (ícone de pesquisa/adicionar, ação de continuidade). Descrição acessível: **`Mesmo produto e filtros; procurar outros anúncios.`** Este controle **amplia a comparação atual**.
- **`Nova pesquisa`** (ícone de reiniciar/nova busca, ação secundária). Descrição acessível: **`Escolher outro produto e começar do zero.`** Este controle **inicia uma comparação independente**. Evitar rotular só como `Reiniciar`, pois pode sugerir perda irreversível de dados; a conversa mantém histórico.

Exibir em uma linha se couber, e empilhar verticalmente em telas pequenas; usar ícones acompanhados de **texto** (não apenas ícones); boa área de toque, nenhum botão desabilitado artificialmente. Não transformar em botões de compra/pagamento, nem abrir `#visual` automaticamente. Cada controle executa ação verdadeira: componentes de botão nativos podem enviar uma mensagem para **a mesma conversa** por ação de nova mensagem do host. Se não existirem controles suportados, apresentar duas escolhas textuais claras e reconhecer `Buscar mais ofertas` e `Nova pesquisa` escritos pela pessoa; não alegar que existem botões funcionais nesse cliente.

## 2. Ao selecionar `Buscar mais ofertas`

- **Não reiniciar**: reutilizar exatamente o produto, características obrigatórias (tamanho/cor/variação), quantidade, condição, CEP, orçamento e **marketplaces que foram selecionados (inclusive TikTok Shop, quando marcado)**. Não ampliar a lojas fora da seleção sem pedido explícito. Não repetir o onboarding nem o aviso inicial; não exigir novo produto.
- Fazer **nova rodada de pesquisa real** com termos/ordens de termos diferentes, sinônimos, páginas ainda não examinadas, índices ou mecanismos de busca adicionais **se disponíveis e autorizados**, dando prioridade a lojas sem cobertura suficiente. Não chamar de fonte diferente um link que apenas reproduz a lista anterior. A ferramenta `planejar_busca_profunda` só planeja consultas: executar pesquisa com ferramentas de busca efetivamente acessíveis; o MCP `pesquisar_ofertas` pode estar sem provedor configurado. Não prometer uma pesquisa em fontes que a sessão não permite.
- **Preservar o estado da comparação anterior**: IDs, URLs puras, preço anunciado histórico, preço real, frete, impostos, taxas, descontos, disponibilidade e edições manuais. Não substituir correções existentes por preços de uma nova indexação nem zerar campos pendentes. Se a UI possui valores ainda não enviados, incluir esse estado no comando enviado ao chat ou, se o host não permitir, solicitar `Enviar tabela` antes de ampliar — nunca descartar os valores silenciosamente.
- **Mesclar sem duplicatas**: comparar URLs normalizadas (retirar somente parâmetros de rastreamento, sem perder atributos de tamanho/cor) e identificadores de anúncio do marketplace; se um mesmo anúncio surgir em outra URL ou resultado, conservar o mesmo ID e correções. Para ofertas verdadeiramente inéditas, atribuir IDs subsequentes `#N+1`, `#N+2` etc., nunca reutilizar um ID anterior. Cada anúncio novo deve ter link individual real, preço de busca provisório, evidência do filtro e campos editáveis vazios. Não usar um mesmo anúncio de produto como duas ofertas.
- Informar o **número de anúncios novos**, os repetidos/descartados quando conhecido, e as fontes/marketplaces efetivamente consultados. Incluir os anúncios novos nos cartões da mesma comparação, com links individuais e campo de correção na mesma resposta. Se nenhuma oferta nova for comprovada, declarar **`Nenhuma oferta nova encontrada nesta rodada`** e manter a tabela intacta, sem inventar resultados nem anunciar que toda a internet foi esgotada.
- O botão `Enviar tabela` continua **único** por comparação visível e envia a lista **completa** (anteriores + novos) junto das correções, como URLs HTTPS puras em JSON, sem Markdown dentro do campo `url`.

## 3. Ao selecionar `Nova pesquisa`

- Esta ação **não é `Buscar mais ofertas`**: encerrar a seleção ativa da comparação anterior, sem remover mensagens ou tabelas já registradas no histórico da conversa. Não misturar produtos, filtros, links, IDs ou preços da pesquisa anterior. IDs da nova comparação podem recomeçar em `#1` **somente após ficar claro que é uma nova comparação**; não renumerar a comparação antiga.
- Se existem edições ainda **não enviadas**, apresentar antes uma confirmação clara como: `Há valores preenchidos que ainda não foram enviados. Deseja enviar a tabela antes de iniciar outra pesquisa?` com caminhos de **`Enviar tabela`** e **`Iniciar nova pesquisa sem enviar`**; caso o cliente não suporte, perguntar em texto. Se os dados já foram enviados ou estão vazios, avançar imediatamente, sem confirmação redundante.
- Mostrar novamente o aviso compacto: **`Os preços encontrados na pesquisa podem mudar. Confira cada anúncio e corrija os valores quando necessário.`**, e a pergunta **`Qual produto você deseja analisar?`** com **formulário conversacional completo**: Produto, Descrição ou características, checkboxes de lojas, Quanto pretende gastar? (R$), opções de quantidade/CEP e botão **`Pesquisar`** (ou `Enviar`) na mesma conversa, se suportados. Não abrir formulário MCP Apps, não solicitar `#visual`.
- O próximo envio de produto inicia outra pesquisa **independente**, usando os padrões do plugin para critérios não fornecidos, sem importar critérios da busca anterior automaticamente. Se a pessoa pedir reutilização explícita de determinado critério, atendê-la.

## 4. Comandos inequívocos para botões nativos

As ações do host devem gerar nova mensagem com intenção inequívoca e suficiente para o agente prosseguir:

- `@comprar — BUSCAR MAIS OFERTAS na comparação atual. Mantenha todos os filtros, ofertas, IDs, URLs e correções informadas; procure novos anúncios por outras consultas/fontes disponíveis, deduplique e acrescente somente os inéditos. Não reinicie e não refaça links já encontrados.`
- `@comprar — NOVA PESQUISA independente. Preserve a comparação anterior no histórico e não reutilize anúncios ou custos. Mostre o aviso de preços provisórios e pergunte qual produto desejo analisar, com campo e botão Pesquisar.`

Quando a interface permitir, transportar no comando o estado completo dos anúncios atuais e das edições ainda não enviadas, respeitando os limites de tamanho do cliente. Nunca alegar persistência remota. Caso a mensagem de navegação chegue sem dados suficientes e o histórico não identifique os anúncios anteriores, recuperar o estado disponível na conversa; não fabricar URLs nem resultados.

## 5. Critérios de aceite

1. Após a pesquisa, existem as ações **Buscar mais ofertas** e **Nova pesquisa**, com descrições que explicam a diferença.
2. Buscar mais **não muda critérios**, não apaga custos digitados, deduplica e mantém IDs, acrescentando somente links de anúncios novos.
3. Nova pesquisa abre **uma nova entrada de produto**, não reaproveita resultados e não apaga o histórico da conversa.
4. No celular, ações continuam identificáveis sem rolagem horizontal.
5. O modo Chat permanece padrão; `#visual` só abre quando o usuário pedir explicitamente.

