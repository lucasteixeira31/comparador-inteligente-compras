# Comparador Inteligente de Compras

Projeto pessoal, gratuito, sem monetização e de código aberto para uso no **ChatGPT Web**. O objetivo é pesquisar anúncios com links individuais e comparar o custo real da compra, considerando quantidade, frete, impostos, outras taxas e cupons confirmados.

**Estado do projeto: fundação técnica / MVP.** Existe um protótipo web editável (`/comparador.html`) e um servidor MCP com duas ferramentas executáveis. **Não existem ainda conectores de pesquisa automática para lojas, interface MCP App incorporada ao chat, OAuth nem banco de dados na nuvem.** Não confunda este repositório de código-fonte com uma versão final pronta para qualquer pessoa instalar.

## Para pessoas que só querem usar

Para testes iniciais, o repositório inclui `releases/comparador-compras-lite.zip`, uma versão baseada somente em instruções, **sem servidor MCP**. O servidor central já foi implantado na Vercel. O ZIP completo conectado ao MCP será disponibilizado em uma Release após os testes de conexão e controles básicos contra abuso. Você **não** precisará criar conta na Vercel, clonar um repositório, executar comandos ou configurar variáveis de ambiente. Se a sua conta do ChatGPT Web oferecer **upload de plugins**, importe esse ZIP e autorize a conexão necessária. Essa opção depende das permissões da sua conta ou espaço de trabalho. O caminho mais simples para todos é uma futura publicação no diretório de plugins, sujeita a aprovação.

A versão Lite não dispõe de API nem armazenamento remoto; usa as pesquisas que o ChatGPT já conseguir realizar. A busca pública não exigirá conexão com as suas contas do Mercado Livre, Shopee ou AliExpress. Caso uma função futura precise de acesso privado, deverá solicitar autorização oficial e específica. Jamais será necessário enviar senhas ao ChatGPT.

## Versões

- **Lite (já empacotada):** skill de pesquisa e comparação. Não contém MCP, autenticação, busca oficial de lojas nem tabela sincronizada. Apenas para quem tiver permissão de upload de ZIP no ChatGPT.
- **MCP (v0.3.0 — teste privado):** endpoint remoto central implantado, plugin privado vinculado, ferramentas de preparação de critérios e comparação. Ainda sem buscas verificadas em lojas ou interface editável dentro do ChatGPT. A distribuição pública será liberada após validação.

## Como funciona

- `preparar_pesquisa`: valida e organiza os critérios da compra, sem alegar que consultou lojas.
- `comparar_carrinhos`: calcula o custo total e os rankings com os valores informados.
- `/comparador.html`: protótipo local com tabela editável e salvamento **somente no navegador**.
- Ferramentas de busca automática por marketplace: **não implementadas nesta fase**.

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
