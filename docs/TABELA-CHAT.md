# Tabela editável na própria conversa — @comprar 0.10.0

O modo **Chat** continua sendo a experiência padrão do plugin. A partir da versão 0.10.1, a interface desejada após uma pesquisa é uma **tabela com campos editáveis nativos do ChatGPT e um botão “Enviar tabela”**, sem abrir o HTML da interface `#visual`.

## Formulário de entrada completo — v0.10.1

O usuário testou o `@comprar` em um chat fora do projeto e viu **apenas um campo único para escrever tudo**. Esse formato é **incompleto** e não atende ao MVP aprovado. A entrada no modo Chat deve conservar o aviso breve e oferecer os **quatro grupos de campos separados** abaixo.

**Aviso inicial:** “Os preços encontrados na pesquisa podem mudar conforme tamanho, cor, promoção e frete. Abra cada anúncio, confira os valores e, se houver diferença, corrija os campos antes de enviar a comparação.”

**Pergunta:** “Qual produto você deseja analisar?”

| Rótulo no formulário | Tipo de controle | Estado inicial | Obrigatório |
|---|---|---|---|
| **Produto** | Campo de texto simples | Vazio; ex.: camiseta oversized | Sim |
| **Descrição ou características** | Área de texto | Vazia; ex.: G3, preta, algodão | Não |
| **Onde deseja pesquisar?** | Seis checkboxes: Mercado Livre, Shopee, AliExpress, Amazon, SHEIN e Temu | Os três primeiros marcados, demais desmarcados | Ao menos uma loja |
| **Quanto pretende gastar? (R$)** | Campo de valor/moeda | Vazio; ex.: 150,00 | Não |

A seção recolhível **Mais opções** contém **Quantidade** (padrão 1), **CEP** e **Condição** (padrão novo). Os campos aparecem em coluna, checkboxes se adaptam à largura, sem rolagem horizontal. Ao clicar em **Pesquisar**, o ChatGPT recebe o conjunto completo e **somente as lojas efetivamente selecionadas** como uma única mensagem na mesma conversa.

**Significado do valor:** é um valor **pretendido de referência**, não um bloqueio que impede mostrar opções úteis acima dele. Pode ser usado na comparação para informar quais ofertas ficaram acima/abaixo, sem descartar arbitrariamente anúncios que atendam aos outros critérios.

Se o usuário escrever o produto diretamente na invocação (`@comprar camiseta oversized`), começar a pesquisa sem formulário redundante. Se o cliente não suportar múltiplos controles nativos, apresentar as quatro perguntas separadamente em texto e receber uma única mensagem; não transformar o formulário em um campo único e não simular botões.

Após **Nova pesquisa**, reabrir o formulário completo (sem reutilizar valores anteriores). **Buscar mais ofertas** não pede formulário: mantém critérios e alterações e amplia a comparação existente.

## Preços provisórios e divergências de página

Preço de índice de busca = **"Preço encontrado na pesquisa — provisório; confirme no anúncio"**, inclusive se a página apresentar outro preço. O preço de um G3 não pode ser inferido do menor preço de outras variações. O preço real confirmado manualmente entra em campo separado, e o sistema mostra diferenças sem ocultar o valor anterior. Exemplo ilustrativo: R$ 39,77 pesquisado contra R$ 49,77 visto na página = diferença de R$ 10,00. Nunca converter desconhecidos em zero.

**Transmissão dos links:** os cartões exibem links clicáveis, mas o botão `Enviar tabela` serializa no JSON URLs HTTPS em texto puro (valor de `url`), **nunca** `[rótulo](URL)`; os IDs e endereços originais devem permanecer idênticos durante correções. O campo de preço anunciado é histórico, e o de preço real é a correção informada, não uma verificação automática da loja.

## Layout responsivo aprovado para testes (0.10.1)

A versão anterior mostrou quatro campos de entrada em todas as linhas de uma tabela larga e repetitiva. Esse layout não é adequado para celular. O padrão passa a ser **cartões compactos e expansíveis**, em lista vertical:

1. Cartão fechado: número do anúncio, marketplace, nome/link, preço de vitrine e status de G3, com botão `Editar`.
2. Cartão aberto: **Preço real**, **Frete**, **Impostos** e **Taxas** em grade que se adapta à largura, mais confirmação opcional de G3 disponível.
3. Um cartão aberto por vez; os valores já digitados **não se perdem** ao navegar entre os anúncios.
4. Um único botão **Enviar tabela** no rodapé, que envia todos os anúncios e as alterações informadas em uma mensagem ao mesmo chat.

Não usar formulários dentro de tabelas largas ou com colunas estreitas. Priorizar leitura e toque no celular, sem rolagem horizontal; disponibilizar links clicáveis e campos com rótulos visíveis. Números ausentes seguem `null`, jamais zero automático.

## Navegação depois da pesquisa — v0.10.1

A interface apresenta, **após os anúncios e o único botão Enviar tabela**, dois controles nativos e responsivos. Eles são opcionais, não substituem a tabela e continuam disponíveis depois da consolidação:

- **Buscar mais ofertas** — texto explicativo: **“Mesmo produto e filtros; procurar outros anúncios.”** Mantém a comparação existente, incluindo tamanho, CEP, orçamento, marketplaces escolhidos, IDs, links, correções e pendências. Executa novas consultas ou utiliza outras fontes de pesquisa autorizadas quando disponíveis, deduplica por URL/ID de anúncio e **acrescenta apenas ofertas inéditas** com IDs subsequentes. Caso não encontre novidades, informa isso sem apagar a tabela. Valores ainda não enviados precisam ser preservados; se o host não puder carregá-los, pedir o envio da tabela antes de pesquisar mais.
- **Nova pesquisa** — texto explicativo: **“Escolher outro produto e começar do zero.”** Inicia uma comparação independente, sem reaproveitar links ou custos da pesquisa anterior, mas **preserva o histórico da conversa**. Se houver alterações ainda não enviadas, perguntar antes se o usuário deseja enviá-las ou descartá-las; não apagar silenciosamente. Reapresentar o aviso de preços provisórios, o campo “Qual produto você deseja analisar?” e o botão Pesquisar.

Em telas largas, os dois controles podem ficar lado a lado. No celular, devem aparecer empilhados, com ícone e rótulo textual, sem rolagem horizontal. **Não usar apenas “Reiniciar” como título do segundo botão**, pois a intenção é iniciar uma pesquisa nova e independente. Esses controles permanecem no **modo Chat**, sem acionar o modo `#visual`.

### Comportamento das ações

Ao tocar **Buscar mais ofertas**, uma nova mensagem na mesma conversa transporta a intenção de continuar **e, se possível, o estado completo da comparação atual**. Pesquisa adicional não é sinônimo de pesquisar de novo exatamente os mesmos links: variar consultas, páginas e mecanismos efetivamente disponíveis, sempre respeitando as lojas selecionadas. O resultado informa quantas ofertas realmente novas foram adicionadas e mantém os cartões editáveis.

Ao tocar **Nova pesquisa**, a conversa registra a intenção explícita de começar outra comparação e pergunta o novo produto. Novas ofertas começam com IDs próprios a partir de #1; IDs e URLs históricos não são alterados.

Se o cliente ChatGPT não oferecer botões nativos, exibir as duas opções textuais e reconhecer seus nomes como comandos. Nunca indicar que o botão funciona sem teste no cliente. O backend MCP atual não fornece por si só a persistência de estado entre mensagens; o histórico conversacional e o estado enviado pelo host são a referência.

## Link individual sempre visível (0.10.1)

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
