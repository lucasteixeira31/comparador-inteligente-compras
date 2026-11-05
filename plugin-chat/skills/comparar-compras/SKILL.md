---
name: comparar-compras
description: Use quando o usuário disser @comprar, quiser pesquisar produtos e ordenar preços finais de ofertas nos marketplaces aprovados, ou quiser salvar/editar o comparativo na mesma conversa.
---

# comprar — comparação de ofertas no ChatGPT Web e celular

## Superfície e prioridade

Este plugin foi preparado para o **ChatGPT Chat (web e celular)**, sem exigir Codex ou Work. Seu pacote inclui uma dependencia de App **comprar-backend** declarada em `.app.json` com o ID de aplicativo real. O App fornece as ferramentas do servidor remoto MCP ja publicado em Vercel. Nao usar `mcp.json` ou `.mcp.json` no pacote, pois a conexão é feita via App. **A presença da dependencia nao garante que o host permita ferramentas em todo dispositivo ou sessao:** chamar apenas ferramentas efetivamente disponibilizadas pelo ChatGPT. Nunca alegar sucesso de chamada nao realizada nem persistencia que nao ocorreu.

Quando o App `comprar-backend` estiver disponivel, priorizar as ferramentas registradas sob esse App:
- `abrir_formulario_pesquisa`: abrir formulario interativo inline com os parametros ja conhecidos; nao abrir navegador externo.
- `preparar_pesquisa`: normalizar criterios, sem confundir com busca real.
- `planejar_busca_profunda`: gerar consultas por loja; pesquisar ofertas na web pelas capacidades de pesquisa que o ChatGPT disponibilizar.
- `pesquisar_ofertas`: usar apenas quando o provedor de busca do backend estiver configurado; atualmente ele pode estar sem chave e nao consegue buscar por si so.
- `analisar_busca_profunda`: filtrar resultados e links genuinos provenientes de pesquisas efetivamente realizadas.
- `abrir_tabela_comparacao`: mostrar tabela editavel no ChatGPT, preservando o link individual de cada anuncio.
- `comparar_carrinhos`: calcular totais completos, mantendo frete/impostos/taxas desconhecidos como pendencias.

Se qualquer uma das ferramentas acima nao estiver acessivel na interface, usar o fluxo conversacional no proprio ChatGPT, sem inventar chamadas ou funcionalidades.

Ao ser invocado, executar o fluxo na **própria conversa**, sem abrir outras abas para registrar dados. Se a ferramenta `abrir_formulario_pesquisa` do App estiver acessível, utilizá-la; caso contrário, empregar controles interativos nativos. Na ausência de ambos, conduzir as etapas com mensagens concisas e tabela Markdown no chat. Usar links de produtos apenas para o usuário abrir o anúncio quando desejar comprar.

## Lojas permitidas

A lista fechada é: Mercado Livre, Shopee, AliExpress, Amazon, SHEIN e Temu. Não incluir outros sites. Vendedores terceiros hospedados **dentro** dessas plataformas são permitidos; não pontuar reputação individual de vendedores. Rejeitar links falsos e domínios parecidos, redirecionamentos externos e pagamentos fora da plataforma. Aceitar apenas anúncios individuais em domínio HTTPS oficial da plataforma. Não prometer ausência de risco em anúncios.

## 1 — Formulário de pesquisa no chat

Ao receber `@comprar` com solicitação de nova compra, mostrar um formulário compacto na própria conversa, com estes campos:
- Produto a pesquisar (obrigatório)
- Características desejadas e obrigatórias (ex.: tamanho, cor, modelo)
- Orçamento total (opcional)
- Quantidade (padrão 1)
- CEP para estimar frete (opcional)
- Marketplace(s) selecionados dentre os seis autorizados (padrão Mercado Livre, Shopee e AliExpress; usuário pode alterar)
- Condição (novo por padrão, usado ou qualquer)

Pré-preencher qualquer campo que o usuário já tenha informado. Oferecer a ação `Pesquisar` quando o host suportar interface interativa; o clique deve enviar os critérios à mesma conversa. Na ausência de componente, solicitar somente detalhes essenciais que faltem e iniciar a pesquisa sem insistência em formulários não suportados.

## 2 — Busca de anúncios

Pesquisar anúncios reais com as ferramentas disponíveis no ChatGPT, realizando variações de palavras-chave e buscando vários links por plataforma, preferindo ordenação crescente de preço onde fontes autorizadas permitirem. Não assumir que o primeiro resultado é o mais barato. Não usar scraping proibido, contas privadas, APIs bloqueadas ou contornar limites de marketplaces. Se a plataforma não puder ser consultada, informar a ausência de resultados verificados. Não inventar preço, desconto, frete, impostos, disponibilidade, links, avaliações ou características. Nunca afirmar `menor preço absoluto da internet`: dizer `menor preço encontrado entre os anúncios analisados`.

Cada candidato deve ter no mínimo plataforma, nome do produto, link individual e preço anunciado se encontrado. Se o preço não puder ser verificado, marcar `não verificado` ou `não informado`. Descartar anúncios inequivocamente incompatíveis, evitar links duplicados e não considerar anúncios indisponíveis como compras disponíveis. Mostrar a cobertura das buscas quando possível.

## 3 — Edição de valores no próprio chat

Depois da pesquisa, apresentar os anúncios e seus links em uma tabela da conversa. Oferecer ao usuário a opção de **manter ou corrigir o preço anunciado** e informar, por anúncio:
- Preço unitário real informado
- Frete total da compra
- Impostos/tributos adicionais
- Outras taxas
- Desconto efetivamente confirmado

Não presumir custos desconhecidos como zero. A indicação `R$ 0,00` só deve ser usada quando o usuário confirmar ausência daquele custo. Quando o usuário editar uma oferta, preservar o mesmo link; nunca associar um valor de um anúncio ao URL de outro.

## 4 — Salvar e classificar na conversa

Quando o usuário escrever `salvar`, `registrar`, clicar na ação correspondente ou confirmar os valores, registrar a lista editada com link e valores nesta **mesma conversa**. A tabela final deve mostrar plataforma, anúncio/link clicável, preço unitário, frete, impostos, outras taxas, desconto e **total**, ordenada por menor total completo. Calcular como: `(preço unitário × quantidade) + frete + impostos + outras taxas − desconto efetivamente confirmado`. Nunca produzir total negativo; apontar descontos inconsistentes. Se algum campo necessário estiver faltando, exibir essa oferta em **pendências de custo** e não classificá-la como se fosse mais barata.

Permitir ao usuário corrigir e atualizar uma linha salva sem duplicação do mesmo anúncio. Não refazer a busca a cada edição; manter a pesquisa atual e atualizar somente os valores nomeados. Ao terminar, informar que os dados estão registrados na conversa, **não em banco de dados remoto**, e que a disponibilidade de histórico entre sessões depende do ChatGPT. Não afirmar sincronização garantida nem usar o servidor MCP como armazenamento se não tiver sido efetivamente conectado.

## Restrições e clareza

A pessoa deve poder completar o fluxo no chat, do formulário até a tabela salva. Não exigir acesso ao desktop, Work, Codex, Vercel ou GitHub. É gratuito para o usuário; compras são realizadas nas plataformas autorizadas, fora do plugin. Não solicitar login ou credenciais de marketplaces. O App MCP não garante verificação automática de checkout/estoque, nem disponibilidade de widgets em todos os clientes. O servidor não tem provedor de busca habilitado por padrão; distinguir resultados de busca nativos do ChatGPT e retornos do App. Se o host apresentar os widgets MCP, utilizá-los diretamente no ChatGPT, sem exigir site externo. Se não os apresentar, oferecer controles de chat ou tabelas Markdown.
