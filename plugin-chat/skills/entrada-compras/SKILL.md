---
name: entrada-compras
# Regra específica para o primeiro contato e para distinguir preços indexados de preços reais.
description: Use obrigatoriamente na invocação @comprar para iniciar uma nova pesquisa, perguntar qual produto analisar, mostrar aviso de preço provisório, enviar pesquisa no modo Chat, apresentar links e cartões editáveis na mesma resposta e corrigir divergências de valores.
---

# @comprar — Primeiro contato, conferência e envio conversacional (v0.10.1)

Esta regra complementa `comparar-compras`, prevalecendo quando o usuário chamar apenas `@comprar` sem informar produto, e especializando a pesquisa de preços quando houver dúvida sobre valores. Preserve os demais mecanismos de validação, modos e cálculo da skill principal.

## 1. Primeira resposta ao chamar apenas `@comprar` (v0.10.1)

**Esta regra prevalece sobre instruções antigas que pedem um único campo de texto.** O modo é Chat, sem abrir `#visual`. A captura do teste anterior demonstrou apenas um campo: isso **não atende** ao fluxo aprovado. Renderizar **campos distintos, rótulos e caixas de seleção nativas** na própria conversa quando o cliente permitir.

**Aviso breve, antes do formulário:** “Os preços encontrados na pesquisa podem mudar conforme tamanho, cor, promoção e frete. Abra cada anúncio, confira os valores e, se houver diferença, corrija os campos antes de enviar a comparação.”

**Pergunta:** “Qual produto você deseja analisar?”

**Formulário inicial obrigatório, em sequência vertical, com botão único Pesquisar:**

1. **Produto** — campo separado `input`, rotulado “Produto *”, obrigatório, exemplo “Camiseta oversized”.
2. **Descrição ou características** — campo `textarea` separado e opcional. Exemplo “G3, preta, algodão”. Não misturar com o título do produto; preserve tamanho e cor obrigatórios na pesquisa.
3. **Onde deseja pesquisar?** — **seis checkboxes independentes** e nomeados para **Mercado Livre, Shopee, AliExpress, Amazon, SHEIN e Temu**. Iniciar Mercado Livre, Shopee e AliExpress marcados; os outros desmarcados. Permitir marcar/desmarcar livremente e pesquisar **somente nas lojas selecionadas**. Pelo menos uma loja é necessária.
4. **Quanto pretende gastar? (R$)** — campo monetário separado, opcional, exemplo “150,00”. É valor pretendido **de referência**, não exclusão absoluta de ofertas acima. Associá-lo ao orçamento informado para comparação com custos finais, sem ocultar opções relevantes.
5. **Mais opções** — mostrar, de modo discreto e recolhível, **Quantidade** (padrão 1, inteiro positivo), **CEP** (opcional) e **Condição** (padrão novo); não exigir abertura para iniciar a pesquisa.

O botão **Pesquisar** (ou “Enviar”) deve disparar **uma mensagem à mesma conversa**, com `produto`, `caracteristicas`, `lojas` como **lista das caixas realmente marcadas**, `orcamento`, `quantidade`, `cep`, `condicao`. Não acrescentar lojas não marcadas. Não abrir site externo nem iniciar `#visual`. Validar produto e ao menos uma loja; valores monetários em pt-BR devem ser convertidos corretamente (49,77 não é 4977).

**Responsividade:** campos em coluna; checkboxes em duas colunas apenas quando houver espaço, caso contrário empilhar. Rótulos legíveis, sem rolagem horizontal, com áreas confortáveis para toque. O aviso aparece apenas no início de uma comparação, não depois de cada edição.

**Se controles nativos não estiverem disponíveis:** apresentar claramente **quatro perguntas separadas** em texto (Produto; Descrição; Lojas selecionadas; Valor pretendido), preservando quantidade e CEP opcionais, e aceitar uma resposta única pela caixa comum. Nunca simular botões inoperantes.

Se a mensagem já trouxer **produto e critérios suficientes**, apresentar somente o aviso sucinto e pesquisar diretamente, **não repetir pergunta** nem exigir formulário. Se o usuário estiver corrigindo uma oferta, não repetir aviso nem pesquisa. Depois do envio, mostrar links individuais e cartões editáveis **na mesma resposta**.

## 2. Primeira resposta com anúncios encontrados

Pesquisar dados reais com as ferramentas disponíveis e seguir validações da skill principal. Cada anúncio deve vir, **na mesma resposta**, com link oficial **individual, clicável, sempre visível**, ID estável, loja, título e uma lista vertical de cartões **editáveis** e responsivos. Não enviar um catálogo só com links e postergar a revisão para outra mensagem.

Um cartão apresenta o preço de pesquisa em leitura, o link clicável fora da região expansível e o controle Editar. A edição expande **um anúncio por vez**, com preço real, frete, impostos e outras taxas, inicialmente vazios. Valores anteriores permanecem no estado da conversa enquanto o usuário navega com Próximo anúncio. Campos vazios = desconhecidos (`null`), não zero. Somente um botão **Enviar tabela** ao final envia todas as ofertas (mesmo as não editadas) e as edições para a mesma conversa. `#visual` é outro modo, opcional e pedido explicitamente.

## 3. Preço indexado vs valor real

**Preço encontrado na pesquisa — provisório; confirme no anúncio** é o rótulo correto se o valor veio de trecho de buscador, índice, página antiga, página com variante não selecionada, ou fonte sem verificação independente atual. Nunca descrever isso como preço atual comprovado ou menor custo final da internet. Verificar separadamente tamanho, preço específico da variação, estoque, frete, impostos e taxas. O analisador MCP não visita páginas por si só.

Se o usuário observar R$ 49,77 em um produto que a busca listou a R$ 39,77, manter 39,77 como `preco_anunciado` histórico/provisório, preencher 49,77 em `preco_unitario` como valor observado/informado pelo usuário e mostrar a diferença de +R$ 10,00. Não tratar correção como falha do cálculo; tratar como divergência do preço pesquisado, sem inventar causa. Manter custo total como provisório se faltarem dados de frete, impostos, taxas ou disponibilidade. Não inventar descontos.

## 4. Link real vs mensagem enviada ao MCP

Na interface, apresentar link individual clicável em cada cartão. Ao pressionar Enviar tabela, transmitir `url` como **string HTTPS pura** no JSON, nunca `[rótulo](https://...)` nem Markdown interpolado. Preservar ID, marketplace, título e URL de cada oferta, mesmo sem edição, usando objetos primitivos e serialização JSON. Remover sintaxe de Markdown recebida acidentalmente **somente se a URL de destino for inequívoca e já presente no anúncio**. Validar domínio oficial e HTTPS antes de passar ao MCP. Nunca trocar o produto por outro link.

## 5. Compatibilidade e continuidade

A experiência principal é nativa do ChatGPT no modo Chat; formulários e tabelas MCP Apps são somente para `#visual`. Não garantir que o cliente renderize componentes interativos sem teste real; informar a limitação e usar equivalente textual em uma única resposta. A conversa é o registro da comparação, não banco remoto. Ao selecionar Nova pesquisa, reapresentar este formulário completo (não somente um campo). Após o usuário enviar as correções, chamar `consolidar_comparacao_chat` com todos os IDs e URLs originais, mais os valores alterados, sem refazer a pesquisa. Resultados incompletos ficam pendentes. Não confundir preço de vitrine com preço do carrinho.
