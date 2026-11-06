import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const root = new URL("../plugin-chat/", import.meta.url);
const read = p => readFileSync(new URL(p,root),"utf8");
test("plugin @comprar usa App MCP sem MCP direto",()=>{
  const rootManifest=JSON.parse(read("plugin.json"));
  const compat=JSON.parse(read(".codex-plugin/plugin.json"));
  const app=JSON.parse(read(".app.json"));
  assert.equal(rootManifest.name,"comprar");
  assert.equal(rootManifest.extensions["com.openai"].interface.displayName,"comprar");
  assert.equal(rootManifest.version,"0.10.1");
  assert.equal(compat.version,"0.10.1");
  assert.equal(rootManifest.extensions["com.openai"].apps,"./.app.json");
  assert.equal(compat.apps,"./.app.json");
  assert.equal(app.apps["comprar-backend"].id,"asdk_app_6aeca1ead5d88191974ba923cfef6dc3");
  assert.equal(compat.mcpServers,undefined);
  assert.equal(rootManifest.mcpServers,undefined);
  assert.equal(existsSync(new URL("mcp.json",root)),false);
  assert.equal(existsSync(new URL(".mcp.json",root)),false);
  assert.match(read("agents/openai.yaml"),/\bCHAT\b/);
  const skill=read("skills/comparar-compras/SKILL.md");
  assert.match(skill,/MODO CHAT É O PADRÃO INCONDICIONAL/);
  assert.match(skill,/gatilho exato `#visual`/);
  assert.match(skill,/com \*\*\x60#chat\x60\*\*/);
  assert.match(skill,/\x60abrir_formulario_pesquisa\x60/);
  assert.match(skill,/\x60abrir_tabela_comparacao\x60/);
  assert.match(skill,/\x60consolidar_comparacao_chat\x60/);
  assert.match(skill,/não abrir formulários nem tabelas MCP Apps automaticamente/);
  assert.match(skill,/caracteristicas_confirmadas/);
  assert.match(skill,/preco_variacao_confirmado/);
  assert.match(skill,/orcamento_total/);
  assert.match(skill,/Não fabricar citações/);
  assert.match(skill,/TABELA EDITÁVEL INLINE NO CHAT/);
  assert.match(skill,/um único botão funcional/);
  assert.match(skill,/campos editáveis \*\*Preço real encontrado \(R\$\)\*\*/);
  assert.match(skill,/[Cc]ampo vazio significa/);
  assert.match(skill,/Não esperar o usuário digitar/);
  assert.match(skill,/instruções de skill não garantem renderização/);
  assert.match(skill,/RESPONSIVA EM CARTÕES EXPANSÍVEIS/);
  assert.match(skill,/mobile-first/);
  assert.match(skill,/um anúncio por vez/);
  assert.match(skill,/Manter os valores digitados/);
  assert.match(skill,/rolagem horizontal/);
  assert.match(skill,/LINK DESTACADO/);
  assert.match(skill,/link individual permanentemente visível/);
  assert.match(skill,/O título não substitui o link/);
  assert.match(skill,/Próximo anúncio/);
  assert.match(skill,/MESMA mensagem/);
  const guiaTabela=readFileSync(new URL("../docs/TABELA-CHAT.md",root),"utf8");
  assert.match(guiaTabela,/Link individual sempre visível/);
  assert.match(guiaTabela,/Abrir anúncio na/);
});

test("guia dos gatilhos esta acessivel a partir do README e esclarece seus limites",()=>{
  const readProject = p => readFileSync(new URL("../"+p,root),"utf8");
  const guia=readProject("docs/GATILHOS.md");
  const readme=readProject("README.md");
  assert.match(readme,/\[guia completo dos gatilhos\]\(docs\/GATILHOS\.md\)/);
  for (const comando of ["@comprar #visual","#visual","#chat","modo visual","modo chat"])
    assert.ok(guia.includes(comando),"Gatilho não documentado: "+comando);
  assert.match(guia,/não comandos universais/);
  assert.match(guia,/não são automaticamente sincronizados/);
  const tabela=readProject("docs/TABELA-CHAT.md");
  assert.match(tabela,/cartões compactos e expansíveis/);
  assert.match(tabela,/não se perdem/);
});


test("primeiro contato @comprar avisa sobre preco e pede produto com envio conversacional",()=>{
  const skill=read("skills/comparar-compras/SKILL.md");
  const guia=readFileSync(new URL("../docs/TABELA-CHAT.md",root),"utf8");
  assert.match(skill,/preços encontrados na pesquisa podem mudar/);
  assert.match(skill,/Qual produto você deseja analisar\?/);
  assert.match(skill,/botão \*\*"Pesquisar"\*\*/);
  assert.match(skill,/mensagem à \*\*mesma conversa\*\*/);
  assert.match(skill,/produto e critérios suficientes/);
  assert.match(skill,/não repetir pergunta/);
  assert.match(guia,/campo de texto conversacional/);
  assert.match(guia,/link clicável \+ cartão editável/);
});

test("preco de busca e URL de MCP permanecem separados da edicao",()=>{
  const skill=read("skills/comparar-compras/SKILL.md");
  const guia=readFileSync(new URL("../docs/TABELA-CHAT.md",root),"utf8");
  assert.match(skill,/Preço encontrado na pesquisa — provisório/);
  assert.match(skill,/preco_anunciado/);
  assert.match(skill,/preco_unitario/);
  assert.match(skill,/URLs de origem como \*\*strings HTTPS puras\*\*/);
  assert.match(skill,/nunca serializar/);
  assert.match(guia,/R\$ 39,77 pesquisado contra R\$ 49,77/);
  assert.match(guia,/\*\*nunca\*\* \x60\[rótulo\]\(URL\)\x60/);
});

test("botões de navegação distinguem pesquisar mais de nova pesquisa",()=>{
  const nav=read("skills/navegacao-compras/SKILL.md");
  const guia=readFileSync(new URL("../docs/TABELA-CHAT.md",root),"utf8");
  assert.match(nav,/Buscar mais ofertas/);
  assert.match(nav,/Nova pesquisa/);
  assert.match(nav,/Mesmo produto e filtros; procurar outros anúncios/);
  assert.match(nav,/Escolher outro produto e começar do zero/);
  assert.match(nav,/abaixo da lista e do botão único/);
  assert.match(nav,/sem duplicatas|sem duplicata|Mesclar sem duplicatas/);
  assert.match(nav,/IDs subsequentes/);
  assert.match(nav,/Preservar o estado da comparação anterior/);
  assert.match(nav,/edições ainda \*\*não enviadas\*\*/);
  assert.match(nav,/Nenhuma oferta nova encontrada nesta rodada/);
  assert.match(nav,/não apagar|sem remover mensagens ou tabelas/);
  assert.match(guia,/após os anúncios e o único botão Enviar tabela/);
  assert.match(guia,/sem rolagem horizontal/);
});

test("busca adicional mantém lojas selecionadas e nova pesquisa não herda resultados",()=>{
  const nav=read("skills/navegacao-compras/SKILL.md");
  assert.match(nav,/marketplaces que foram selecionados/);
  assert.match(nav,/Não ampliar a lojas fora da seleção/);
  assert.match(nav,/não são duas ofertas|mesmo anúncio|mesmo ID|mesmo anúncio de produto/);
  assert.match(nav,/não reutilize anúncios ou custos|Não misturar produtos, filtros, links, IDs ou preços/);
  assert.match(nav,/Qual produto você deseja analisar\?/);
  assert.match(nav,/#visual/);
});


test("formulario inicial v0.10.1 tem quatro grupos separados e seis marketplaces",()=>{
  const e=read("skills/entrada-compras/SKILL.md");
  const c=read("skills/comparar-compras/SKILL.md");
  const d=readFileSync(new URL("../docs/TABELA-CHAT.md",root),"utf8");
  for(const label of ["Produto","Descrição ou características","Onde deseja pesquisar?","Quanto pretende gastar? (R$)"]) {
    assert.ok(e.includes(label),"Campo obrigatório da interface ausente: "+label);
    assert.ok(c.includes(label),"Instrução principal sem campo: "+label);
    assert.ok(d.includes(label),"Documentação sem campo: "+label);
  }
  for(const loja of ["Mercado Livre","Shopee","AliExpress","Amazon","SHEIN","Temu"]){
    assert.ok(e.includes(loja),"Loja faltante: "+loja);
  }
  assert.match(e,/checkboxes independentes/);
  assert.match(e,/Mercado Livre, Shopee e AliExpress marcados/);
  assert.match(e,/somente nas lojas selecionadas/);
  assert.match(e,/uma mensagem à mesma conversa/);
  assert.match(e,/Mais opções/);
  assert.match(e,/CEP/);
  assert.match(e,/Quantidade/);
  assert.match(e,/valor pretendido/);
  assert.match(e,/não é exclusão absoluta|não exclusão absoluta|referência/);
  assert.match(c,/Não reduzir o formulário a um único campo/);
  assert.match(d,/apenas um campo único/);
  assert.match(d,/Nova pesquisa/);
});
