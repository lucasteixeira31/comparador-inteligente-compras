# Arquitetura e roadmap

## Decisões

- Produto alvo: ChatGPT Web (não Codex, não Work).
- Código no GitHub; hospedagem central única no plano pessoal gratuito da Vercel, sujeita às cotas.
- Usuários finais jamais configuram Vercel, Node, Git ou segredos.
- Para buscas públicas, iniciar em modo anônimo. Conta/OAuth somente se houver necessidade real de persistência no servidor ou de acessar dados privados mediante autorização.
- Compartilhar o código não significa conceder acesso a contas de lojas; as APIs oficiais exigem aprovações próprias.
- Nenhum segredo ou token de serviço nos ZIPs ou no repositório.

## Componentes

1. Plugin: skill em português + MCP remoto para ferramentas estruturadas.
2. Backend: Vercel Functions/Next.js e mcp-handler.
3. Motor de custos: módulo puro testado, sem custos externos.
4. Interface web demonstrativa: formulário e tabela com armazenamento local. **Não é ainda interface MCP App dentro do chat.**
5. Adaptadores de lojas: planejados, dependentes de documentação, aprovação e cobertura.
6. Persistência remota e autenticação: adiadas; avaliar somente se salvar e sincronizar entre dispositivos for indispensável.

## Fases

- [x] Calcular e classificar anúncios; preservar valores desconhecidos; não aplicar cupom não confirmado.
- [x] Formulário e tabela demonstrativos na web.
- [x] Servidor MCP para preparar critérios e comparar carrinhos (fonte local, sem deploy).
- [x] Gerador de ZIP com URL do servidor central (não gerar URL fictícia).
- [ ] Deploy de desenvolvimento na Vercel e testes reais com ChatGPT Web.
- [ ] UI MCP App: formulário e resultados sincronizados no chat.
- [ ] Provedor(es) de busca com fontes autorizadas, provas de disponibilidade e links diretos.
- [ ] Armazenamento por usuário, se necessário, com OAuth e políticas de privacidade.
- [ ] Rate limiting, logs limitados, monitoramento de cotas e qualidade.
- [ ] Publicar Release ZIP no GitHub e testar permissões de instalação com outra conta.
- [ ] Submissão para diretório público, caso desejada.
