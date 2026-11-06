# Tabela editável na própria conversa — @comprar 0.9.9

O modo **Chat** continua sendo a experiência padrão do plugin. A partir da versão 0.9.9, a interface desejada após uma pesquisa é uma **tabela com campos editáveis nativos do ChatGPT e um botão “Enviar tabela”**, sem abrir o HTML da interface `#visual`.

## Entrada obrigatória ao invocar somente @comprar (v0.9.9)

A primeira mensagem do plugin, **antes da pesquisa**, mostra um aviso curto: **"Os preços encontrados na pesquisa podem mudar ou variar conforme tamanho, cor, promoção e frete. Abra cada anúncio, confira os valores e, se houver diferença, corrija os campos do cartão antes de enviar a comparação."**

Em seguida, apresenta **"Qual produto você deseja analisar?"** e um **campo de texto conversacional** com botão **Pesquisar** / **Enviar**, ambos nativos do ChatGPT quando disponíveis. A pessoa digita livremente, por exemplo: `camiseta oversized G3, até R$ 150, 1 unidade, CEP 32340-040, Mercado Livre, Shopee e SHEIN`. O clique gera uma mensagem de pesquisa para **a mesma conversa**; caso o cliente não suporte controles, a pergunta permanece e a pessoa responde pela caixa de mensagens comum. Não ativar `#visual` automaticamente.

Se o produto já estiver indicado na invocação, exibir aviso sucinto e **pesquisar imediatamente**, sem segunda confirmação. A mensagem de resultados traz **link clicável + cartão editável na mesma resposta**, nunca apenas links. O aviso não é repetido na sequência da mesma compra.

## Preços provisórios e divergências de página

Preço de índice de busca = **"Preço encontrado na pesquisa — provisório; confirme no anúncio"**, inclusive se a página apresentar outro preço. O preço de um G3 não pode ser inferido do menor preço de outras variações. O preço real confirmado manualmente entra em campo separado, e o sistema mostra diferenças sem ocultar o valor anterior. Exemplo ilustrativo: R$ 39,77 pesquisado contra R$ 49,77 visto na página = diferença de R$ 10,00. Nunca converter desconhecidos em zero.

**Transmissão dos links:** os cartões exibem links clicáveis, mas o botão `Enviar tabela` serializa no JSON URLs HTTPS em texto puro (valor de `url`), **nunca** `[rótulo](URL)`; os IDs e endereços originais devem permanecer idênticos durante correções. O campo de preço anunciado é histórico, e o de preço real é a correção informada, não uma verificação automática da loja.

## Layout responsivo aprovado para testes (0.9.9)

A versão anterior mostrou quatro campos de entrada em todas as linhas de uma tabela larga e repetitiva. Esse layout não é adequado para celular. O padrão passa a ser **cartões compactos e expansíveis**, em lista vertical:

1. Cartão fechado: número do anúncio, marketplace, nome/link, preço de vitrine e status de G3, com botão `Editar`.
2. Cartão aberto: **Preço real**, **Frete**, **Impostos** e **Taxas** em grade que se adapta à largura, mais confirmação opcional de G3 disponível.
3. Um cartão aberto por vez; os valores já digitados **não se perdem** ao navegar entre os anúncios.
4. Um único botão **Enviar tabela** no rodapé, que envia todos os anúncios e as alterações informadas em uma mensagem ao mesmo chat.

Não usar formulários dentro de tabelas largas ou com colunas estreitas. Priorizar leitura e toque no celular, sem rolagem horizontal; disponibilizar links clicáveis e campos com rótulos visíveis. Números ausentes seguem `null`, jamais zero automático.

## Link individual sempre visível (0.9.9)

**Na primeira resposta da pesquisa**, cada anúncio já deve aparecer como um cartão compacto com nome, ID, preço de vitrine e um link **“Abrir anúncio na [loja]” em linha separada**, sem precisar clicar em `Editar`. Não esconder o link no título, na expansão ou em uma resposta anterior.

Sequência do usuário: **Abrir anúncio → conferir o carrinho → voltar ao chat → preencher os custos do cartão → Próximo anúncio**. O comando opcional `Próximo anúncio` abre o item seguinte sem apagar os valores já informados. No fim, **Enviar tabela** transmite os dados de todos os itens em uma única mensagem.

**Estrutura visual do cartão:**

```text
#3 · Mercado Livre
Blusa oversized azul royal — R$ 39,74 anunciado
G3 selecionado (preço/carrinho a conferir)
Abrir anúncio no Mercado Livre  [LINK INDIVIDUAL]
[Editar]
  Preço real: ______   Frete: ______
  Impostos:   ______   Outras taxas: ______
  [Próximo anúncio]
```

O título identifica o produto; a linha **Abrir anúncio** é o elemento de navegação e deve funcionar mesmo com o editor fechado. Nenhum anúncio sem URL individual válida entra na comparação. O histórico da conversa não é um banco de dados remoto; não garantir persistência dos campos se o cliente recarregar.

## Como funciona

1. O usuário informa o produto, quantidade, orçamento, CEP e marketplaces e inicia a busca.
2. O ChatGPT mostra os anúncios individuais com IDs estáveis (#1, #2, …), links originais e **preços anunciados**.
3. Na **mesma resposta**, cada anúncio já tem campos editáveis **Preço real**, **Frete**, **Impostos**, além de controles opcionais de taxas/desconto e confirmação de disponibilidade, se suportados.
4. O usuário preenche os valores conferidos no carrinho. **Não precisa digitar comandos por ID**.
5. Um único botão **Enviar tabela** transmite à conversa **todas as linhas** e **somente os valores efetivamente informados como correções**.
6. O comparador processa as correções de uma vez por `consolidar_comparacao_chat`, calcula os totais completos e separa custos desconhecidos como pendências. Os mesmos IDs e URLs serão reutilizados em futuras edições.

### Exemplo resumido da estrutura

| ID | Produto/link | Preço anunciado | Preço real (R$) | Frete (R$) | Impostos (R$) |
|---|---|---:|---|---|---|
| #1 | Anúncio A | R$ 29,90 | [campo vazio] | [campo vazio] | [campo vazio] |
| #2 | Anúncio B | R$ 46,30 | [campo vazio] | [campo vazio] | [campo vazio] |

**Botão único:** `Enviar tabela` — envia as duas linhas de uma só vez para o chat.

A estrutura acima é ilustrativa; os valores não representam anúncios atuais e os **campos reais** serão controles nativos interativos quando suportados pelo host.

## Regras de preenchimento

- Preço anunciado é **referência de vitrine**, não equivale a preço real confirmado.
- Campos de preços começam vazios mesmo com anúncio localizado. **Campo vazio = pendente**, não `R$ 0,00`. O usuário digita `0` se a cobrança for comprovadamente nula.
- Um envio parcialmente preenchido é permitido. Ofertas incompletas nunca são classificadas como a compra com menor custo final.
- Se houver orçamento, o limite só é comparado com totais completos (preço real × quantidade + frete + impostos + taxas − desconto confirmado).
- O envio é **para a mesma conversa**, sem abas extras, sem recomeçar a busca, sem mudar o URL de nenhum anúncio e sem persistência garantida em banco externo.
- A escolha entre modo Chat e modo visual avançado é independente: **`@comprar` = chat com tabela inline**, **`#visual` = widget MCP mais completo**, **`#chat` = retorno à conversa**.

## Suporte e limitação

O plugin pode orientar o ChatGPT a construir controles nativos, mas **não controla a disponibilidade desses componentes nos clientes web ou móvel**. É necessário testar o funcionamento do botão e dos campos em cada cliente. Quando os controles não estiverem disponíveis, apresentar uma única tabela textual para preenchimento e devolução integral ao chat. Não afirmar que a interface interativa funcionou sem teste real.

Esta é a especificação de UX do **MVP conversacional**. O modo gráfico MCP avançado continua em desenvolvimento separado. Ver [Gatilhos](GATILHOS.md) e [Validação de Ofertas](VALIDACAO-OFERTAS.md).
