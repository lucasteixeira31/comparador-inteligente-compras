# Arquitetura e roadmap

## Decisões

- Produto alvo: ChatGPT Web (não Codex, não Work).
- Código no GitHub; hospedagem central única no plano pessoal gratuito da Vercel, sujeita às cotas.
- Usuários finais jamais configuram Vercel, Node, Git ou segredos.
- Para buscas públicas, iniciar em modo anônimo. Conta/OAuth somente se houver necessidade real de persistência no servidor ou de acessar dados privados mediante autorização.
- Compartilhar o código não significa conceder acesso a contas de lojas; as APIs oficiais exigem aprovações próprias.
- Nenhum segredo ou token de serviço nos ZIPs ou no repositório.

## Marketplaces autorizados

Somente Mercado Livre, Shopee, AliExpress, Amazon, SHEIN, Temu e TikTok Shop nesta fase. Lista fechada no backend, filtros de domínio na descoberta, validação da plataforma na comparação, links HTTPS oficiais e comparação centrada na plataforma, sem notas individuais de reputação dos vendedores. Anúncios de terceiros dentro dos marketplaces são permitidos; sites, contatos e pagamentos externos não são aceitos. Alibaba está fora da primeira versão de compras ao consumidor.

## Componentes

1. Plugin: skill em português + MCP remoto para ferramentas estruturadas.
2. Backend: Vercel Functions/Next.js e mcp-handler.
3. Motor de custos: módulo puro testado, sem custos externos.
4. Duas interfaces MCP Apps inline: formulário de pesquisa `ui://comparador/formulario-pesquisa-v1` e tabela de custos `ui://comparador/tabela-custos-v1`. Ambos aparecem na conversa em clientes compatíveis. Página web externa é apenas uma prévia técnica; dados salvos no widget não formam um banco remoto.
5. Adaptadores de lojas: planejados, dependentes de documentação, aprovação e cobertura.
6. Persistência remota e autenticação: adiadas; avaliar somente se salvar e sincronizar entre dispositivos for indispensável.

## Motor de busca profunda (0.6.0)

- O planejamento de buscas é local, determinístico e não depende de Tavily.
- O ChatGPT ou integrações futuras fazem a descoberta de ofertas mediante acesso autorizado.
- O analisador recebe URLs individuais, filtra marketplace oficial, elimina duplicações, impede anúncios incompatíveis de entrar no ranking e publica a cobertura efetivamente recebida.
- Os menores preços anunciados são provisórios; preço final somente com confirmação explícita de produto, disponibilidade, preço do carrinho, frete e impostos.
- O motor não verifica sites automaticamente, não substitui APIs oficiais e não declara menor preço absoluto.

## Fases

- [x] Calcular e classificar anúncios; preservar valores desconhecidos; não aplicar cupom não confirmado.
- [x] Formulário e tabela demonstrativos na web.
- [x] Servidor MCP para preparar critérios e comparar carrinhos, implantado na Vercel com status READY.
- [x] Gerador de ZIP com URL do servidor central (não gerar URL fictícia).
- [x] Deploy de produção na Vercel e endpoint HTTPS publicado.
- [x] Plugin privado 0.3.0 atualizado para apontar ao MCP remoto.
- [ ] Confirmação automática do handshake JSON-RPC e das chamadas de ferramentas no endpoint remoto.
- [ ] Teste das ferramentas no ChatGPT Web.
- [x] Planejamento multi-termos gratuito e análise de ofertas sem pontuação de vendedores.
- [ ] Descoberta automática com preços e disponibilidade verificados, sem depender de franquias reduzidas.
- [x] Formulário inicial inline com botão de pesquisar na própria conversa.
- [x] Tabela de registro manual inline: preço anunciado pré-preenchido, custos editáveis, ofertas incompletas pendentes, link individual e resumo para conversa.
- [ ] Validar renderização, passagem dos critérios, recebimento de anúncios e salvamento em sessão real do ChatGPT Web.
- [x] Implementado adaptador Tavily para descobrir links individuais por marketplace, com filtragem de domínio e sem fabricar valores.
- [ ] Ativar TAVILY_API_KEY do plano Researcher gratuito apenas na Vercel, verificar consultas reais e uso da franquia.
- [ ] Adicionar prova de disponibilidade, preço, identidade do anúncio e outras fontes autorizadas.
- [ ] Armazenamento por usuário, se necessário, com OAuth e políticas de privacidade.
- [ ] Rate limiting, logs limitados, monitoramento de cotas e qualidade.
- [ ] Publicar Release ZIP no GitHub e testar permissões de instalação com outra conta.
- [ ] Submissão para diretório público, caso desejada.
