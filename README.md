# Comparador Inteligente de Compras

Projeto pessoal, gratuito, sem monetização e de código aberto para uso no **ChatGPT Web**. O objetivo é pesquisar anúncios com links individuais e comparar o custo real da compra, considerando quantidade, frete, impostos, outras taxas e cupons confirmados.

**Estado do projeto: fundação técnica / MVP.** Existe uma tabela editável em `/widget-comparador.html`, um formulário complementar em `/comparador.html` e um servidor MCP com sete ferramentas, incluindo dois recursos MCP Apps: formulário inicial de pesquisa e tabela final de custos, ambos destinados a renderizar dentro da conversa no ChatGPT Web. **Existe um conector de pesquisa web indexada (Tavily), mas ele exige a configuração de TAVILY_API_KEY pelo mantenedor e não está necessariamente ativado. Não há integração direta com APIs das lojas, coleta automática contínua, OAuth nem banco de dados remoto. A interface inline MCP Apps já é registrada pelo servidor, mas ainda precisa ser confirmada visualmente no ChatGPT Web.** Não confunda este repositório de código-fonte com uma versão final pronta para qualquer pessoa instalar.

## Como encontrar no ChatGPT

O nome técnico e visível do plugin atual é **comprar** (menção **`@comprar`**); a pasta histórica `plugin-template/` usa o identificador antigo `comparador-inteligente-compras` e não é o pacote principal de Chat. O plugin é pessoal e privado; **atualizar o nome não garante que apareça no seletor `@`** se não estiver instalado/ativado ou se o cliente atual não oferecer suporte. Abra a página do plugin no ChatGPT, confira a instalação em **Plugins → Pessoais/Instalados**, e teste novamente em uma conversa compatível, preferencialmente ChatGPT Web. A disponibilidade varia por interface, conta e configurações; uma instalação não substitui o teste na interface.

## Plugin `@comprar` no ChatGPT Web e celular — MVP conversacional 0.9.3

**Prioridade atual: apenas experiência por mensagens e tabelas no chat.** O fluxo é `@comprar` → coleta textual dos critérios (produto, características, orçamento, quantidade, CEP, lojas e condição) → pesquisa de anúncios individuais com links e preços → edição conversacional de preço/frete/impostos/taxas/descontos → comando `salvar` → tabela Markdown ordenada por custo final **confirmado**. Não abrir `abrir_formulario_pesquisa` nem `abrir_tabela_comparacao` durante o desenvolvimento deste MVP. A experiência visual foi testada como prova de conceito e será retomada apenas numa fase posterior.

O plugin **comprar** conserva seu App `comprar-backend` no arquivo `plugin-chat/.app.json` e permanece dedicado a `CHAT`; o App usa o servidor Vercel MCP existente. As ferramentas de planejamento, validação de resultados e cálculo podem apoiar os passos conversacionais quando disponíveis. A busca autônoma do backend ainda depende de provedor configurado; a experiência de pesquisa usa as ferramentas nativas do ChatGPT realmente disponíveis. O pacote do plugin continua sem `mcp.json` e `.mcp.json` para evitar classificação exclusiva de computador.

**Novo na versão 0.9.3:** a ferramenta MCP não visual `consolidar_comparacao_chat` recebe IDs estáveis, ofertas já encontradas e correções pontuais; produz tabela Markdown textual, informa pendências e devolve as ofertas atualizadas sem duplicação nem perda do link. Não pesquisa anúncios e não grava o histórico em banco remoto. Exemplos: `corrigir #2 frete 12,90`, `#1 confirmar preço 29,90` e `salvar` na mesma conversa. Disponibilidade não confirmada impede declarar um vencedor; custo de vitrine não é custo confirmado.

**Critérios de qualidade:** links individuais genuínos; variações como G3 precisam ser confirmadas; custos desconhecidos não equivalem a zero; só calcular o ranking definitivo para ofertas com custos completos; conservar anúncio e URL ao editar; `salvar` registra na conversa, sem prometer banco de dados remoto. Testar chat móvel e web antes de avançar para widgets.

## Para pessoas que só querem usar

Para testes iniciais, o repositório inclui `releases/comparador-compras-lite.zip`, uma versão Lite antiga, baseada somente em instruções e **sem servidor MCP**. Essa versão histórica não reflete a lista fechada atual de marketplaces; a versão 0.8.0 é a configuração ativa do plugin privado. O servidor central já foi implantado na Vercel. O ZIP completo conectado ao MCP será disponibilizado em uma Release após os testes de conexão e controles básicos contra abuso. Você **não** precisará criar conta na Vercel, clonar um repositório, executar comandos ou configurar variáveis de ambiente. Se a sua conta do ChatGPT Web oferecer **upload de plugins**, importe esse ZIP e autorize a conexão necessária. Essa opção depende das permissões da sua conta ou espaço de trabalho. O caminho mais simples para todos é uma futura publicação no diretório de plugins, sujeita a aprovação.

A versão Lite não dispõe de API nem armazenamento remoto; usa as pesquisas que o ChatGPT já conseguir realizar. A busca pública não exigirá conexão com as suas contas do Mercado Livre, Shopee ou AliExpress. Caso uma função futura precise de acesso privado, deverá solicitar autorização oficial e específica. Jamais será necessário enviar senhas ao ChatGPT.

## Versões

- **Lite (já empacotada):** skill de pesquisa e comparação. Não contém MCP, autenticação, busca oficial de lojas nem tabela sincronizada. Apenas para quem tiver permissão de upload de ZIP no ChatGPT.
- **MCP (v0.3.0 — teste privado):** endpoint remoto central implantado, plugin privado vinculado, ferramentas de preparação de critérios e comparação. Ainda sem buscas verificadas em lojas ou interface editável dentro do ChatGPT. A distribuição pública será liberada após validação.

## Marketplaces permitidos

A lista inicial é fechada: **Mercado Livre, Shopee, AliExpress, Amazon, SHEIN e Temu**. Alibaba e demais plataformas não estão habilitados nesta versão. A inclusão de novas lojas exige revisão e atualização explícita da lista.

Os resultados da busca são aceitos apenas quando o domínio pertence ao marketplace autorizado e o link corresponde ao formato de anúncio individual reconhecido. O comparador é **centrado no marketplace**, não na reputação de lojistas individuais: pode comparar diversos anúncios dentro de uma mesma plataforma aprovada, mas não recomenda sites independentes, vendas por redes sociais, WhatsApp ou pagamentos fora do marketplace. A reputação individual do vendedor **não entra no ranking**. Ainda são necessários cuidados com links e redirecionamentos, compatibilidade do produto, valores do checkout e condições da compra. Estar em uma plataforma reconhecida não garante ausência de fraudes.

## Como funciona

- `preparar_pesquisa`: valida e organiza os critérios da compra, sem alegar que consultou lojas.
- `pesquisar_ofertas`: busca páginas individuais indexadas por marketplace via Tavily **quando TAVILY_API_KEY estiver configurada no servidor**. Não confirma estoque ou valores.
- `planejar_busca_profunda`: gera múltiplas consultas por marketplace, gratuitamente, sem executar busca nem consumir cota de buscador.
- `analisar_busca_profunda`: recebe anúncios obtidos por pesquisa autorizada, valida domínios e URLs, remove duplicatas, separa preços provisórios e custos finais comprovados e informa a cobertura por plataforma. Não consulta lojas automaticamente.
- `abrir_formulario_pesquisa`: exibe o formulário de critérios dentro da conversa e permite enviar a pesquisa por mensagem ao ChatGPT.
- `abrir_tabela_comparacao`: recebe links individuais e preços anunciados, valida os domínios e oferece uma interface MCP Apps inline para editar e **salvar na tabela** preço real, frete, impostos, outras taxas e desconto confirmado. Cada total completo mantém o link do anúncio; registros incompletos ficam pendentes.
- `comparar_carrinhos`: calcula o custo total e os rankings com os valores informados.
- `/comparador.html`: protótipo local com tabela editável e salvamento **somente no navegador**.
- APIs oficiais de busca das próprias lojas: **não integradas nesta fase**. A descoberta via índice web pode retornar zero links ou resultados desatualizados.

## Para quem mantém o servidor

Pré-requisitos: Node.js 20 ou posterior e uma conta Vercel. Somente o responsável pela hospedagem faz estas etapas.

```bash
npm install
npm test
npm run dev
```

O MCP local usa `http://localhost:3000/api/mcp`. O repositório já está conectado à Vercel, com HTTPS em produção. Para gerar um ZIP a ser distribuído posteriormente:

```bash
python3 scripts/gerar-plugin.py https://comparador-inteligente-compras.vercel.app/api/mcp
```

O resultado é `dist/comparador-compras-chatgpt.zip`. Publique-o como asset de uma Release do GitHub. Não publique a versão conectada antes dos testes de protocolo, proteção contra abuso e checagem da instalação em outra conta.

## Registro e armazenamento dos valores da compra

A interface `/widget-comparador.html` funciona como página web independente e também é publicada pelo MCP como recurso `ui://comparador/tabela-custos-v1`. O usuário seleciona um anúncio, confere o link oficial, digita preço unitário, frete, impostos e outras taxas, confirma descontos aplicados e clica em **Salvar na tabela**. O resultado é ordenado pelo custo total informado, com **link clicável na mesma linha** para manter a correspondência entre o anúncio e o preço salvo. É possível editar e excluir registros, alterar quantidade, importar/exportar JSON e cadastrar links manualmente.

No site independente, os dados ficam no localStorage do navegador; dentro do ChatGPT, a interface utiliza `window.openai.setWidgetState`, se disponível. **Isso não é armazenamento remoto permanente nem sincronização entre dispositivos.** A cópia durável por enquanto é o JSON exportado pelo usuário. Um banco remoto por usuário exige autenticação, proteção de dados e infraestrutura própria, ainda pendentes.

## Ativação da busca indexada (somente mantenedor)

A plataforma [Tavily](https://www.tavily.com/pricing) dispõe do plano Researcher com franquia mensal gratuita de 1.000 créditos e sem cartão de crédito. Para habilitar a pesquisa, o mantenedor cria sua própria conta e adiciona a variável **`TAVILY_API_KEY`** ao ambiente Production do projeto na Vercel, usando o painel de Environment Variables. **Nunca coloque essa chave no GitHub, nos ZIPs ou em mensagens de chat.** Depois disso, a Vercel precisa implantar o código com a variável atualizada.

Uma busca em cada marketplace escolhido consome geralmente um crédito de pesquisa básica; escolher três lojas gera até três consultas. Os limites gratuitos são compartilhados pelos usuários e podem acabar; nesse caso a ferramenta comunica a indisponibilidade. Para o lançamento público, adicionar limite de requisições por origem e controle de gastos/consumo. Não assumir que URL indexada confirma preço, disponibilidade, compatibilidade, impostos ou frete. Não obter dados privados dos usuários nem realizar scraping de páginas das lojas.

## Busca profunda sem chave externa

O fluxo sem assinatura é: planejar buscas por vários termos e marketplaces com `planejar_busca_profunda`; buscar links individuais por ferramentas de pesquisa efetivamente disponíveis; registrar preço e características de cada página sem inventar valores; enviar esses anúncios para `analisar_busca_profunda`. A ferramenta mostra os menores preços informados por marketplace, deduplicação e possíveis incompatibilidades. Sem comprovação de frete, impostos, disponibilidade e checkout, exibe somente ranking **provisório** do preço anunciado.

O módulo não promete nem realiza descoberta automática sem uma fonte de dados disponível. O algoritmo só compara os anúncios recebidos e não garante o menor preço absoluto de uma loja.

## Fluxo principal no próprio chat (0.8.0)

1. O plugin apresenta `abrir_formulario_pesquisa`: produto, características obrigatórias, orçamento, quantidade, CEP e marketplaces.
2. Clicando **Pesquisar**, os critérios são enviados ao próprio ChatGPT. O ChatGPT pesquisa links individuais reais nos marketplaces selecionados, conforme suas ferramentas disponíveis.
3. O ChatGPT apresenta resultados e chama `abrir_tabela_comparacao`: a tabela permite manter ou corrigir o preço anunciado, editar frete, impostos, taxas e descontos.
4. **Salvar na tabela** guarda cada link e valores na interface, ordenando ofertas com custos completos do mais barato ao mais caro. Custos incompletos não se tornam zero e ficam pendentes.
5. **Mostrar tabela na conversa** registra um resumo textual com os links e valores editados, sem refazer a busca. Exportar JSON fornece cópia independente.

A interface é inline, sem abrir guias externas. As páginas `/widget-pesquisa.html` e `/widget-comparador.html` existem para desenvolvimento e teste. A API Tavily é opcional e permanece desativada sem chave; a pesquisa de anúncios depende de ferramentas autorizadas realmente disponíveis ao ChatGPT.

A persistência via `widgetState` é por instância da interface, não sincronização permanente entre dispositivos e conversas. A prova de renderização ponta a ponta no ChatGPT permanece pendente.

## Teste de protocolo MCP

O teste automatizado `scripts/smoke-mcp.mjs` verifica `initialize`, `tools/list` e uma chamada de cálculo real ao endpoint HTTPS. O workflow `.github/workflows/mcp-smoke.yml` executa os testes no GitHub Actions após pushes na branch principal. Sucesso no deploy, por si só, não comprova que as ferramentas apareceram no ChatGPT Web.

## Privacidade, limites e segurança

- Nenhum login pessoal é exigido na versão MVP.
- O site mantém dados no `localStorage` do navegador e a UI MCP Apps pode manter estado associado ao widget; nenhum dos dois equivale a banco remoto com sincronização. O MCP de comparação não persiste as ofertas.
- CEP e demais dados enviados à ferramenta passam pelo serviço MCP, sem armazenamento nesta versão. Não envie documentos ou dados financeiros sensíveis.
- No plano Hobby da Vercel há cotas e política de uso pessoal não comercial. Mais usuários podem esgotar a franquia gratuita.
- Antes de abrir publicamente para grande volume, implementar limitação de requisições, observabilidade sem dados pessoais, testes de abuso e fontes oficiais autorizadas.

## Instalação pelo GitHub e licença

O código-fonte pode ser clonado por contribuidores, mas **usuários finais não devem precisar clonar**. A distribuição prevista é ZIP pronto para instalação em contas com permissão, e futuramente o diretório oficial do ChatGPT.

Licença: MIT. Contribuições são bem-vindas.
