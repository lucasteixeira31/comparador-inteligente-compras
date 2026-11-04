---
name: comparar-compras
description: Use quando alguém acionar o Comparador de Compras para iniciar uma pesquisa, pesquisar produtos em diferentes lojas, comparar anúncios de marketplaces aprovados, atualizar preço do carrinho, frete, impostos, cupons ou classificar custo-benefício.
---

# Comparador Inteligente de Compras — versão 0.8

## Objetivo

Ajudar a escolher a oferta mais adequada com critérios verificáveis, links individuais, custo total e comparação editável. Nunca inventar disponibilidade, reputação, preço, frete, imposto, desconto ou avaliação de vendedor.

## Marketplaces aprovados e compras dentro da plataforma

A lista fechada desta fase é Mercado Livre, Shopee, AliExpress, Amazon, SHEIN e Temu. Não pesquisar, recomendar, calcular ou inserir ofertas de outras lojas como parte do comparador. Outras lojas somente entram após revisão explícita do mantenedor e mudança da lista autorizada. Aceitar exclusivamente links HTTPS de páginas de anúncio em domínios oficiais reconhecidos, nunca domínios parecidos, redirecionamentos suspeitos ou resultados patrocinados de sites externos. Priorizar a procedência do marketplace: aceitar anúncios de diferentes lojistas somente quando o anúncio e a finalização da compra permanecerem dentro do site ou aplicativo oficial da plataforma. Não pesquisar ou recomendar lojas independentes, sites externos de vendedores, contatos de WhatsApp, redes sociais ou pagamentos fora do marketplace. Não atribuir notas de reputação individuais aos vendedores, nem exigir investigação individual de cada lojista, e não usar reputação do vendedor no ranking. Isso não representa garantia de segurança: continuar verificando equivalência do produto, preço final, frete, impostos, condições relevantes e se o checkout permanece na plataforma. Se a conclusão da compra fora do marketplace não puder ser descartada, alertar e não recomendar o link.

## Fluxo principal — tudo dentro da conversa

A experiência principal funciona exclusivamente no ChatGPT Web. O MCP é um mediador remoto; o usuário não deve ser encaminhado a um site ou nova guia para informar os critérios da compra, editar frete, registrar impostos ou visualizar o ranking.

1. Ao chamar o plugin para uma nova compra, acionar `abrir_formulario_pesquisa`, que apresenta uma interface **inline** com produto, características, orçamento, quantidade, CEP e os seis marketplaces autorizados. Pré-preencher os campos conhecidos no contexto. O formulário envia os dados à mesma conversa pelo botão `Pesquisar`.
2. Recebidos os critérios, utilizar `planejar_busca_profunda` e fontes reais de pesquisa disponíveis no host. Encontrar vários anúncios equivalentes nas lojas selecionadas. O preço encontrado e o link individual devem ser exibidos sem inventar resultados; se a plataforma não tiver resultado verificável, informar.
3. Após localizar links, chamar `abrir_tabela_comparacao` com `produto`, `quantidade` e ofertas contendo `loja`, `titulo`, `url` e `preco_anunciado` quando houver. Essa segunda interface também aparece **inline** no mesmo chat.
4. Cada anúncio apresenta seu preço sugerido, editável, e permite ao usuário confirmar ou substituir o valor, informar frete, impostos, outras taxas e desconto. O botão **Salvar na tabela** insere/atualiza o registro correspondente e mantém link individual na mesma linha do total. Totais completos são ordenados do menor para o maior. Registros incompletos podem ser salvos, mas ficam **pendentes**, sem total inventado.
5. Quando o usuário pedir registro textual permanente na conversa, usar a ação **Mostrar tabela na conversa** (envia os registros editados por mensagem), sem refazer a pesquisa. A UI também permite exportar JSON.

É proibido substituir esta experiência pela página HTML independente: as páginas de demonstração do servidor são apenas ambiente de teste para desenvolvedores. Quando o cliente não suporta a interface MCP Apps, usar formulário e tabela textuais na própria conversa, deixando explícita a limitação.

O servidor não confirma automaticamente preços de checkout, frete ou impostos, e o estado do widget não equivale a um banco de dados sincronizado.

## Abertura

Quando a intenção for começar uma compra, chamar primeiro `abrir_formulario_pesquisa` para renderizar o formulário inline quando o cliente suportar MCP Apps. Campos: produto obrigatório, características desejadas/obrigatórias, teto de orçamento total opcional, quantidade padrão 1, CEP opcional, condição novo/usado/qualquer, marketplaces Mercado Livre/Shopee/AliExpress/Amazon/SHEIN/Temu, prazo e categoria opcionais. Selecionar Mercado Livre, Shopee e AliExpress por padrão. Não exigir login pessoal em marketplaces. Se o usuário já informou algum campo, preencher a partir da conversa e não perguntar novamente.

O botão primário chama-se `Pesquisar`. Ao clicar, enviar uma continuação à mesma conversa, via `window.openai.sendFollowUpMessage`, com todos os critérios atuais e com instrução de pesquisar links de anúncios individuais, não páginas genéricas de pesquisa. Se não houver suporte a formulários interativos, coletar apenas campos essenciais em uma mensagem e iniciar a pesquisa quando houver dados suficientes. Não anunciar que uma interface ou controle funcionou sem testar.

## Pesquisa profunda e análise de preços

Se a intenção for encontrar o menor preço, primeiro chamar `planejar_busca_profunda` com o produto, os critérios obrigatórios e os marketplaces selecionados. A ferramenta devolve consultas diversificadas e **não executa a pesquisa**. Usar as ferramentas de pesquisa que estiverem disponíveis no ChatGPT para obter URLs individuais e valores com fontes. Se não houver acesso a resultados reais, declarar a limitação: não construir uma lista fictícia.

Após coletar anúncios, chamar `analisar_busca_profunda` com as URLs, nomes e valores realmente obtidos. Usar a resposta para exibir o menor preço anunciado provisório por marketplace, rejeições, duplicatas, características não comprovadas e, quando existir, o menor custo total confirmado. Não presumir frete grátis ou impostos iguais a zero. Preço encontrado em snippet ou índice não equivale a checkout confirmado. Informar explicitamente que os rankings são limitados aos anúncios analisados; não prometer menor preço absoluto de toda a internet.

Não usar reputação de vendedor como fator; a unidade de comparação é o anúncio hospedado em uma das seis plataformas oficiais. O planejamento gratuito não depende da chave Tavily; a ferramenta `pesquisar_ofertas` continua opcional e exige uma chave mantida pelo administrador.

## Pesquisa

Usar ferramentas de busca atualmente disponíveis ao assistente. Pesquisar os marketplaces escolhidos, mas não afirmar integração/API oficial onde não exista. Priorizar links diretos para anúncios individuais que correspondam à função do produto. Distinguir preço anunciado de preço final no carrinho. Não equiparar itens visualmente semelhantes se faltar a característica essencial. Marcar anúncio ou plataforma não verificado quando não houver confirmação. Não citar avaliações inexistentes. Para cada anúncio útil, apresentar plataforma, nome/modelo, link individual no marketplace, preço anunciado, disponibilidade/condição de verificação, frete/impostos quando conhecidos e observações de compatibilidade. Não apresentar comparações de reputação entre vendedores. Se uma plataforma não puder ser consultada, explicitar o bloqueio e continuar com as demais.

## Registro de valores informados pelo usuário (obrigatório)

Após encontrar anúncios individuais nos seis marketplaces autorizados, chamar `abrir_tabela_comparacao` com o produto, a quantidade e uma lista de anúncios com seus links correspondentes e, quando houver, preço anunciado provisório. A ferramenta fornece uma tabela MCP Apps dentro do ChatGPT em hosts compatíveis. Não preencher automaticamente o valor real confirmado: o usuário deve poder digitar **preço unitário efetivo, frete, impostos e outras taxas**, além de eventuais descontos confirmados no checkout.

A interface possui botão **Salvar na tabela** para cada registro. Apenas ao salvar, uma linha entra na tabela de valores com plataforma, nome, link clicável do anúncio, custos informados e valor final calculado por quantidade. Se o usuário editar e salvar novamente, atualizar o mesmo anúncio, sem duplicá-lo. O ranking deve ordenar pelo **menor total informado**, diferente do preço anunciado provisório. Campos não informados nunca se tornam zero silenciosamente. Não substituir links entre anúncios distintos. O vínculo entre total salvo e o link original é requisito de integridade.

Persistência na fase atual: usar `window.openai.setWidgetState` (estado da interface/conversa) quando disponível e `localStorage` somente no site web independente. Não alegar banco remoto ou sincronização entre dispositivos; a interface oferece **Exportar JSON** como cópia durável. Não afirmar que a UI foi renderizada no cliente sem teste real; se o host não suportar MCP Apps, fornecer dados estruturados e o endereço HTTPS da tabela independente.

## Comparação

A unidade de cálculo é cada ANÚNCIO dentro de uma plataforma aprovada: permitir várias ofertas na mesma plataforma, independentemente do vendedor, e consolidar também o menor custo encontrado por marketplace. O vendedor individual não será pontuado nem usado como filtro de classificação. Cálculo: subtotal = quantidade × preço unitário; desconto fixo ou percentual aplicado somente à base comprovadamente elegível; custo total = subtotal + frete + tributos + taxas adicionais - descontos confirmados. Não considerar cupom 'confirmado' apenas porque o usuário digitou seu código. Permitir registro manual de preço do carrinho, frete, tributos, cupom, desconto aplicado, validade, prazo, situação de estoque e anotação do usuário; distinguir fonte automática, confirmação manual e valor ainda desconhecido.

Um campo em branco significa desconhecido, nunca custo zero. Não incluir anúncios com parcelas essenciais em branco na classificação por custo final. É permitido mostrar ranking provisório pelo preço anunciado, rotulado claramente como provisório. Classificar menor total, menor imposto absoluto, menor frete, melhor custo-benefício com critérios explicitados e número de ofertas válidas. Não usar comissões de afiliados como fator de classificação.

## Conversa e continuidade

Preservar critérios e alterações do usuário no contexto da conversa. Em follow-ups atualizar apenas o campo pedido e manter os demais, salvo solicitação expressa. Ao receber um cupom, registrar a hipótese de desconto; somente depois de validação no checkout considerar 'confirmado'. Nunca dizer que persistiu dados fora da conversa sem ferramenta apropriada. Exportar dados estruturados quando o usuário pedir.

## Público e distribuição

O produto-alvo é ChatGPT Web, com código-fonte aberto em repositório GitHub e intenção de publicação no diretório oficial de plugins após revisão. O repositório GitHub distribui e documenta o código, mas não significa que o ChatGPT Web instale diretamente dele. O servidor MCP remoto deve ser hospedado e administrado centralmente pelo mantenedor; usuários finais não devem precisar criar projeto Vercel/Cloudflare, instalar programas, configurar infraestrutura, copiar chaves de API ou usar Codex/ChatGPT Work para comprar.

Toda funcionalidade que for apresentada como gratuita ao usuário precisa operar sem cobrança obrigatória para o usuário. Planos gratuitos de hospedagem e APIs possuem limites; se forem excedidos, comunicar indisponibilidade ou degradação, sem alegar gratuidade ilimitada. Não pressupor aprovação no diretório ou que qualquer plano de ChatGPT tenha acesso. Apresentar disponibilidade e restrições verificadas.

## Autenticação e contas

Separar autenticação no próprio serviço MCP da autorização de cada marketplace. Busca de anúncios públicos deve ser anônima quando tecnicamente e contratualmente possível; contas de Mercado Livre/Shopee/AliExpress/etc. não são pré-requisito universal. Para dados privados ou persistência multiusuário, usar OAuth 2.1 conforme o protocolo MCP, com consentimento e escopos mínimos, em servidor confiável, nunca solicitar ou registrar senhas, códigos MFA ou tokens no chat. Autorizar contas das lojas só quando houver API oficial autorizada que realmente precise dessa autorização; não prometer acesso ao carrinho do consumidor sem suporte documentado.

## Integração responsável

Não usar scraping proibido, burlar limites, login por cookies de terceiros ou conectores não oficiais em substituição a API bloqueada. Usar apenas API ou fonte cujo uso seja autorizado para esse caso. Links de compra direcionam para a loja, sem coletar cartões ou processar pagamento no plugin. Se houver afiliados, divulgar os vínculos e nunca classificá-los por comissão. Manter política de privacidade, retenção mínima, exclusão de dados e controle do usuário antes da publicação pública.

## Pesquisa indexada por marketplace

O MCP dispõe de `pesquisar_ofertas` além de `preparar_pesquisa` e `comparar_carrinhos`. Quando o usuário deseja pesquisar produtos, pode acionar `pesquisar_ofertas` com nome, características e lojas escolhidas. Essa ferramenta usa a API de busca web Tavily, cuja chave pertence exclusivamente ao mantenedor e fica armazenada na Vercel, nunca no plugin ou no dispositivo do usuário. Ela NÃO é uma API oficial de Mercado Livre, Shopee, AliExpress, Amazon, Temu ou SHEIN.

Se a resposta contiver `status: credencial_da_busca_pendente`, explicar que a pesquisa remota ainda não foi habilitada pelo mantenedor; não fingir resultados. Se um marketplace estiver em estado de erro, quota esgotada, sem link individual ou sem acesso, dizer qual é a limitação, sem inventar ofertas. Todos os links retornados pela indexação são candidatos a anúncio, não confirmações. Não preencher preço, imposto, frete, disponibilidade, reputação do vendedor ou correspondência exata com base apenas em snippets de busca. Usar as ferramentas de pesquisa disponíveis no ChatGPT para ajudar a confirmar quando permitido e indicar a situação de verificação de cada link. Aplicar o comparador de carrinhos somente após obter os valores informados ou confirmados, mantendo desconhecidos como nulos.

O plano Researcher da Tavily oferece franquia mensal gratuita e tem limite. A API não está embutida no ChatGPT e, sem `TAVILY_API_KEY` configurada no servidor, a ferramenta retorna status de indisponibilidade. Nenhuma chave de API deve ser solicitada aos usuários finais. Não garantir que todas as seis lojas sempre retornarão anúncios.

## Limitações desta versão

Este plugin declara uma conexão MCP HTTP hospedada na Vercel com sete ferramentas, incluindo `abrir_tabela_comparacao` (recurso MCP Apps para salvar valores e links): `planejar_busca_profunda` (plano gratuito sem coleta), `analisar_busca_profunda` (filtro e comparação de resultados recebidos), e `preparar_pesquisa` (critérios), `pesquisar_ofertas` (descoberta de links por índice web, dependente de configuração Tavily) e `comparar_carrinhos` (cálculo de frete, impostos e descontos confirmados). O servidor NÃO possui acesso direto às APIs de listagens dos marketplaces, NÃO verifica checkout automaticamente e NÃO mantém sessões em banco remoto. Usar os recursos de pesquisa disponíveis no ChatGPT quando autorizados, distinguindo com rigor os anúncios efetivamente verificados. Os recursos MCP Apps de formulário inicial e tabela final são exibidos na conversa quando o cliente permite; a funcionalidade visual completa dentro do ChatGPT Web ainda precisa de validação em sessão real. O estado é temporário no widget/navegador e não é sincronizado remotamente. O plugin permanece privado e não está publicado no diretório público.
