# Comparador Inteligente de Compras

Projeto pessoal, gratuito, sem monetização e de código aberto para uso no **ChatGPT Web**. O objetivo é pesquisar anúncios com links individuais e comparar o custo real da compra, considerando quantidade, frete, impostos, outras taxas e cupons confirmados.

**Estado do projeto: fundação técnica / MVP.** Existe um protótipo web editável (`/comparador.html`) e um servidor MCP com duas ferramentas executáveis. **Existe um conector de pesquisa web indexada (Tavily), mas ele exige a configuração de TAVILY_API_KEY pelo mantenedor e não está necessariamente ativado. Não há integração direta com APIs das lojas, interface MCP App incorporada ao chat, OAuth nem banco de dados na nuvem.** Não confunda este repositório de código-fonte com uma versão final pronta para qualquer pessoa instalar.

## Para pessoas que só querem usar

Para testes iniciais, o repositório inclui `releases/comparador-compras-lite.zip`, uma versão Lite antiga, baseada somente em instruções e **sem servidor MCP**. Essa versão histórica não reflete a lista fechada atual de marketplaces; a versão 0.5.1 é a configuração ativa do plugin privado. O servidor central já foi implantado na Vercel. O ZIP completo conectado ao MCP será disponibilizado em uma Release após os testes de conexão e controles básicos contra abuso. Você **não** precisará criar conta na Vercel, clonar um repositório, executar comandos ou configurar variáveis de ambiente. Se a sua conta do ChatGPT Web oferecer **upload de plugins**, importe esse ZIP e autorize a conexão necessária. Essa opção depende das permissões da sua conta ou espaço de trabalho. O caminho mais simples para todos é uma futura publicação no diretório de plugins, sujeita a aprovação.

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

## Ativação da busca indexada (somente mantenedor)

A plataforma [Tavily](https://www.tavily.com/pricing) dispõe do plano Researcher com franquia mensal gratuita de 1.000 créditos e sem cartão de crédito. Para habilitar a pesquisa, o mantenedor cria sua própria conta e adiciona a variável **`TAVILY_API_KEY`** ao ambiente Production do projeto na Vercel, usando o painel de Environment Variables. **Nunca coloque essa chave no GitHub, nos ZIPs ou em mensagens de chat.** Depois disso, a Vercel precisa implantar o código com a variável atualizada.

Uma busca em cada marketplace escolhido consome geralmente um crédito de pesquisa básica; escolher três lojas gera até três consultas. Os limites gratuitos são compartilhados pelos usuários e podem acabar; nesse caso a ferramenta comunica a indisponibilidade. Para o lançamento público, adicionar limite de requisições por origem e controle de gastos/consumo. Não assumir que URL indexada confirma preço, disponibilidade, compatibilidade, impostos ou frete. Não obter dados privados dos usuários nem realizar scraping de páginas das lojas.

## Teste de protocolo MCP

O teste automatizado `scripts/smoke-mcp.mjs` verifica `initialize`, `tools/list` e uma chamada de cálculo real ao endpoint HTTPS. O workflow `.github/workflows/mcp-smoke.yml` executa os testes no GitHub Actions após pushes na branch principal. Sucesso no deploy, por si só, não comprova que as ferramentas apareceram no ChatGPT Web.

## Privacidade, limites e segurança

- Nenhum login pessoal é exigido na versão MVP.
- A aplicação web salva dados no `localStorage` do navegador; o MCP de comparação não persiste as ofertas.
- CEP e demais dados enviados à ferramenta passam pelo serviço MCP, sem armazenamento nesta versão. Não envie documentos ou dados financeiros sensíveis.
- No plano Hobby da Vercel há cotas e política de uso pessoal não comercial. Mais usuários podem esgotar a franquia gratuita.
- Antes de abrir publicamente para grande volume, implementar limitação de requisições, observabilidade sem dados pessoais, testes de abuso e fontes oficiais autorizadas.

## Instalação pelo GitHub e licença

O código-fonte pode ser clonado por contribuidores, mas **usuários finais não devem precisar clonar**. A distribuição prevista é ZIP pronto para instalação em contas com permissão, e futuramente o diretório oficial do ChatGPT.

Licença: MIT. Contribuições são bem-vindas.
