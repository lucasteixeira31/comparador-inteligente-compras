# Estado atual: restauração para ChatGPT Web (v0.10.4)

**A configuração de transporte MCP direto de v0.10.2–0.10.3 foi retirada do pacote ativo** porque o usuário relatou ausência do plugin no ChatGPT Web e indicação de desktop. O pacote v0.10.4 voltou a ter mapeamento `.app.json` declarado pelos dois manifests. `mcp.json` e `.mcp.json` estão arquivados em `docs/historico-mcp-direto/`, não na raiz de `plugin-chat/`.

A implementação Vercel continua independente da distribuição do plugin e possui todas as ferramentas. O registro App MCP associado ao identificador anterior pode exigir conexão/instalação para uso na web. A publicação do plugin é distinta de sua instalação no navegador, e **nenhum sucesso na UI foi comprovado** pelo teste de repositório.

A tentativa de MCP direto permanece documentada a seguir para eventual retomada em ambiente compatível.

---

# Migração do @comprar para MCP direto — v0.10.3

**Atualização de recuperação (v0.10.3):** a referência ativa ao App registrado separadamente, `extensions.com.openai.apps` e `apps` de compatibilidade, foi removida dos manifests. O arquivo físico `.app.json` foi **preservado como backup não declarado**, sem depender da instalação desfeita de `comprar-backend`. O MCP remoto é acessado pelo `mcp.json` direto e pela variante de compatibilidade `.mcp.json`. A mudança tenta corrigir a ausência do `@comprar` no ChatGPT Web, porém o resultado no seletor só pode ser atestado por um teste de usuário no cliente.

## Finalidade

Reunir no plugin pessoal `@comprar` a experiência conversacional (skills e cartões de correção) e a configuração direta do servidor MCP remoto, sem recriar serviços nem interromper a conexão de desenvolvimento `comprar-backend`.

## Arquitetura

- Plugin público/futuro: `@comprar` (atualmente pessoal/privado).
- Skills: `skills/comparar-compras`, `skills/entrada-compras` e `skills/navegacao-compras`.
- MCP remoto já existente: `https://comparador-inteligente-compras.vercel.app/api/mcp`.
- Configuração portátil em `plugin-chat/mcp.json`: `mcpServers.comprar.type = streamable-http` com HTTPS, autenticador `none`, conforme política atual do endpoint.
- Formato de compatibilidade em `plugin-chat/.mcp.json`; `plugin-chat/.codex-plugin/plugin.json` referencia `./.mcp.json`.
- A referência física `plugin-chat/.app.json` continua arquivada como backup, mas não é mais declarada nos manifests. O plugin não depende do cadastro desinstalado.

## O que esta versão comprova

1. Os dois manifests e os dois formatos MCP possuem URLs coincidentes.
2. As oito ferramentas do servidor continuam registradas no código.
3. A versão do plugin principal é 0.10.2 e os testes de regressão verificam o fluxo de pesquisa, custos e UI.
4. Nenhum registro antigo foi removido ou desconectado.

## O que ainda precisa ser testado no ChatGPT

1. Em uma conversa **nova**, chamar somente `@comprar`.
2. Confirmar o formulário completo (Produto, Descrição, checkboxes das seis lojas, Valor pretendido).
3. Pesquisar e validar que o ChatGPT consegue invocar uma ferramenta MCP da nova declaração direta, **sem depender exclusivamente** da instalação independente de desenvolvimento.
4. Conferir as oito ferramentas, URLs em HTTPS puro, custos pendentes, edição e botão Enviar tabela.
5. Testar Buscar mais ofertas (mesmos critérios/mesclagem) e Nova pesquisa (estado independente).
6. Verificar a entrada do seletor `@`. **Ela poderá continuar mostrando `comprar-backend` porque se trata de outro cadastro pessoal instalado**; a inclusão de `mcp.json` não equivale a removê-lo.

## Critério antes da desinstalação

Só considerar remover a **instalação/cadastro independente** de `comprar-backend`, mediante aprovação, depois de testar no `@comprar` acesso à totalidade das ferramentas sem o cadastro legado. **Nunca** excluir o repositório, o servidor MCP na Vercel ou as definições das ferramentas.

## Plano de reversão

Se o cliente rejeitar a ligação direta ou duplicar ferramentas, restaurar os manifests anteriores 0.10.1, preservando `.app.json`, sem tocar na Vercel. O histórico do GitHub mantém a versão anterior para recuperação.

Fonte do formato: https://developers.openai.com/plugins/build/plugins
