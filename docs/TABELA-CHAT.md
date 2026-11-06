# Tabela editável na própria conversa — @comprar 0.9.8

O modo **Chat** continua sendo a experiência padrão do plugin. A partir da versão 0.9.8, a interface desejada após uma pesquisa é uma **tabela com campos editáveis nativos do ChatGPT e um botão “Enviar tabela”**, sem abrir o HTML da interface `#visual`.

## Layout responsivo aprovado para testes (0.9.8)

A versão anterior mostrou quatro campos de entrada em todas as linhas de uma tabela larga e repetitiva. Esse layout não é adequado para celular. O padrão passa a ser **cartões compactos e expansíveis**, em lista vertical:

1. Cartão fechado: número do anúncio, marketplace, nome/link, preço de vitrine e status de G3, com botão `Editar`.
2. Cartão aberto: **Preço real**, **Frete**, **Impostos** e **Taxas** em grade que se adapta à largura, mais confirmação opcional de G3 disponível.
3. Um cartão aberto por vez; os valores já digitados **não se perdem** ao navegar entre os anúncios.
4. Um único botão **Enviar tabela** no rodapé, que envia todos os anúncios e as alterações informadas em uma mensagem ao mesmo chat.

Não usar formulários dentro de tabelas largas ou com colunas estreitas. Priorizar leitura e toque no celular, sem rolagem horizontal; disponibilizar links clicáveis e campos com rótulos visíveis. Números ausentes seguem `null`, jamais zero automático.

## Link individual sempre visível (0.9.8)

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
