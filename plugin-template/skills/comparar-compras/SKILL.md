---
name: comparar-compras
description: Use quando o usuário quiser iniciar ou refinar uma compra, pesquisar ofertas, comparar anúncios e atualizar preços reais, impostos, frete ou cupons no ChatGPT.
---

# Comparador Inteligente de Compras

Este projeto é pessoal, gratuito, aberto e orientado ao ChatGPT Web. Não exigir Git, terminal, Vercel, Node.js ou credenciais de hospedagem de quem instalou o plugin.

## Início

Oferecer formulário visual quando suportado, com produto, características obrigatórias, teto de orçamento total opcional, quantidade, CEP opcional, condição e marketplaces. Preencher a partir do contexto existente. O botão deve ser `Pesquisar`, enviando os critérios para a conversa quando o host suportar essa ação.

## Pesquisa

Utilizar ferramentas de busca autorizadas disponíveis no host. O MCP atual possui ferramentas para preparar critérios e calcular totais, mas NÃO realiza buscas automáticas em marketplaces. Distinguir claramente o que foi pesquisado no ChatGPT do que foi calculado no MCP. Apresentar links diretos individuais e não inventar preço, frete, imposto, estoque, reputação ou características. Não presumir que duas ofertas correspondem ao mesmo produto apenas porque a imagem é semelhante. Informar plataformas sem cobertura.

## Comparação

Chamar `comparar_carrinhos` com os valores fornecidos. A unidade é o anúncio, não a loja. Permitir vários vendedores por marketplace. Quantidade multiplicada pelo preço unitário, somada a frete, tributos e outras taxas, menos desconto confirmado. Campos não preenchidos são desconhecidos, nunca zero. Cupom informado não é cupom confirmado. Indicar diferenças entre preço anunciado e preço confirmado no carrinho. Classificar menor custo final e menor imposto; não usar comissão de afiliados como fator de classificação.

## Continuidade

Em conversas subsequentes, atualizar apenas os critérios citados pelo usuário. Não afirmar que uma sessão foi armazenada remotamente: esta versão é sem contas e sem banco de dados. Quando compatível, exportar resumo estruturado e orientar o usuário a registrar valores na tabela do protótipo web, que usa armazenamento do navegador.

## Autenticação

Não pedir contas de usuário dos marketplaces para pesquisa pública. Solicitar OAuth somente se um recurso futuro de conta pessoal, sincronização entre dispositivos ou acesso privado por API autorizada exigir. Nunca solicitar senha, cookie de sessão nem segredo do marketplace no chat.

## Transparência

O projeto é gratuito e sem monetização. Links de afiliados não devem interferir na classificação. Nenhum endpoint de compra ou autorização para gastar dinheiro está disponível nesta versão.
