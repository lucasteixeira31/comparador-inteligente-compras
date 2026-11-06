import { LOJAS, DOMINIOS, cents, compararOfertas } from "./comparacao.mjs";
import { verificarAnuncio } from "./pesquisa.mjs";

const normalizar = valor => String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const termos = str => normalizar(str).split(" ").filter(x=>x && !["de","da","do","dos","das","a","o","e","com"].includes(x));
const contem = (texto, requisito) => termos(requisito).every(t=>normalizar(texto).split(" ").includes(t));
const rotulos = new Set(["tamanho","tam","cor","modelo"]);
function requisitoNaFonte(titulo, declaradas, requisito) {
  const tokens = termos(requisito).filter(t=>!rotulos.has(t));
  if (!tokens.length) return false;
  return [titulo, ...declaradas].some(texto => {
    const encontrados = new Set(termos(texto));
    return tokens.every(t => encontrados.has(t));
  });
}
const dinheiro = valor => cents(valor)===null ? null : cents(valor)/100;
const validas = lojas => {
  if (!Array.isArray(lojas) || !lojas.length || lojas.some(l=>!LOJAS.includes(l))) throw Error("Marketplaces não aprovados.");
  return [...new Set(lojas)];
};

export function planejarBuscaProfunda({produto,caracteristicas_obrigatorias=[],lojas=LOJAS,max_consultas_por_loja=3}) {
  if (typeof produto!=="string" || !produto.trim() || produto.length>200) throw Error("Produto inválido.");
  if (!Array.isArray(caracteristicas_obrigatorias) || caracteristicas_obrigatorias.length>8 ||
      caracteristicas_obrigatorias.some(x=>typeof x!=="string" || x.length>100)) throw Error("Características inválidas.");
  if (!Number.isInteger(max_consultas_por_loja) || max_consultas_por_loja<1 || max_consultas_por_loja>4) throw Error("Limite inválido.");
  const escolhidas=validas(lojas);
  const base=produto.trim(), extras=caracteristicas_obrigatorias.map(x=>x.trim()).filter(Boolean);
  const consultas=[ [base,...extras].join(" "), base, [base,...extras,"preço"].join(" "), [base,...extras,"oferta"].join(" ") ];
  const unicas=[...new Set(consultas)].slice(0,max_consultas_por_loja);
  return {
    status:"plano_sem_consultas_executadas",produto:base,caracteristicas_obrigatorias:extras,
    lojas:escolhidas.map(loja=>({
      loja,dominios:DOMINIOS[loja],
      consultas:unicas.map(q=>({texto:q,busca_web:"site:"+DOMINIOS[loja][0]+" "+q}))
    })),
    total_consultas_planejadas:unicas.length*escolhidas.length,
    consultas_executadas:0,
    orientacao:"Pesquisar vários anúncios nas fontes autorizadas disponíveis, sem afirmar cobertura total. Não usar página genérica de busca como produto. Analisar os resultados obtidos com analisar_busca_profunda."
  };
}

function chave(url) {
  const u=new URL(url);
  for(const k of [...u.searchParams.keys()]) if (/^(utm_|fbclid$|gclid$|spm$|source$)/i.test(k)) u.searchParams.delete(k);
  u.searchParams.sort();
  return u.hostname.toLowerCase()+u.pathname.replace(/\/+$/,"")+u.search;
}

function registro(o,url) {
  return {
    loja:o.loja,titulo:o.titulo,url,
    preco_unitario:dinheiro(o.preco_unitario),frete:dinheiro(o.frete),
    impostos:dinheiro(o.impostos),outras_taxas:dinheiro(o.outras_taxas),
    disponivel:o.disponivel===true?true:o.disponivel===false?false:null,
    produto_confirmado:o.produto_confirmado===true,
    caracteristicas_confirmadas:Array.isArray(o.caracteristicas_confirmadas)?o.caracteristicas_confirmadas.filter(x=>typeof x==="string"):[],
    preco_variacao_confirmado:o.preco_variacao_confirmado===true,
    preco_confirmado_carrinho:o.preco_confirmado_carrinho===true,
    frete_confirmado_carrinho:o.frete_confirmado_carrinho===true,
    impostos_confirmados_carrinho:o.impostos_confirmados_carrinho===true,
    origem:o.origem||"informado_na_conversa",
    duplicatas:0,conflito_preco:false
  };
}
const nota=r=>["preco_unitario","frete","impostos","outras_taxas"].filter(k=>r[k]!==null).length+
  ["produto_confirmado","preco_variacao_confirmado","preco_confirmado_carrinho","frete_confirmado_carrinho","impostos_confirmados_carrinho"].filter(k=>r[k]).length+Math.min(r.caracteristicas_confirmadas.length,8)+Number(r.disponivel===true);

function melhoresPorLoja(lista,campo) {
  const mapa=new Map();
  for(const r of lista) if(r[campo]!==null && (mapa.get(r.loja)?.[campo]??Infinity)>r[campo]) mapa.set(r.loja,r);
  return [...mapa.values()].sort((a,b)=>a[campo]-b[campo]);
}

export function analisarBuscaProfunda({produto,caracteristicas_obrigatorias=[],lojas=LOJAS,ofertas=[],quantidade=1}) {
  if(typeof produto!=="string" || !produto.trim() || produto.length>200) throw Error("Produto inválido.");
  if(!Array.isArray(caracteristicas_obrigatorias) || caracteristicas_obrigatorias.length>8 ||
    caracteristicas_obrigatorias.some(x=>typeof x!=="string" || x.length>100)) throw Error("Características inválidas.");
  const escolhidas=validas(lojas);
  if(!Array.isArray(ofertas)||ofertas.length>100) throw Error("Limite máximo de 100 anúncios.");
  if(!Number.isInteger(quantidade)||quantidade<1||quantidade>1000) throw Error("Quantidade inválida.");
  const vistos=new Map(),rejeitados=[];
  for(const [indice,o] of ofertas.entries()){
    if(!o || typeof o!=="object" || !escolhidas.includes(o.loja)){
      rejeitados.push({indice,motivo:"marketplace_nao_selecionado"});continue;
    }
    const url=verificarAnuncio(o.url,o.loja);
    if(!url){rejeitados.push({indice,motivo:"link_nao_e_anuncio_oficial"});continue;}
    const novo=registro(o,url), id=chave(url),anterior=vistos.get(id);
    if(!anterior){vistos.set(id,novo);continue;}
    anterior.duplicatas++;
    const conflito=anterior.preco_unitario!==null && novo.preco_unitario!==null &&
      anterior.preco_unitario!==novo.preco_unitario;
    if(nota(novo)>nota(anterior)){
      const duplicatas=anterior.duplicatas,precoConflitante=anterior.conflito_preco||conflito;
      Object.assign(anterior,novo,{duplicatas,conflito_preco:precoConflitante});
    }else if(conflito) anterior.conflito_preco=true;
  }
  const compativeis=[],pendentes=[];
  for(const r of vistos.values()){
    if(r.disponivel===false){rejeitados.push({loja:r.loja,url:r.url,motivo:"indisponivel"});continue;}
    const exigencias=caracteristicas_obrigatorias.filter(x=>!requisitoNaFonte(r.titulo,r.caracteristicas_confirmadas,x));
    const produtoEquivalente=r.produto_confirmado || contem(r.titulo,produto);
    const corresponde=produtoEquivalente && exigencias.length===0;
    const faltas=[];
    r.caracteristicas_faltantes=exigencias;
    if(!produtoEquivalente) faltas.push("equivalencia_nao_confirmada");
    if(exigencias.length) faltas.push("caracteristicas_obrigatorias_nao_confirmadas");
    if(caracteristicas_obrigatorias.length && r.preco_unitario!==null &&
        !r.preco_variacao_confirmado && !r.preco_confirmado_carrinho) faltas.push("preco_variacao_nao_confirmado");
    if(r.conflito_preco) faltas.push("precos_conflitantes");
    if(r.preco_unitario===null) faltas.push("preco_nao_informado");
    if(r.disponivel!==true) faltas.push("disponibilidade_nao_confirmada");
    if(!r.preco_confirmado_carrinho) faltas.push("preco_checkout_nao_confirmado");
    if(r.frete===null||!r.frete_confirmado_carrinho) faltas.push("frete_nao_confirmado");
    if(r.impostos===null||!r.impostos_confirmados_carrinho) faltas.push("impostos_nao_confirmados");
    if(r.outras_taxas===null) faltas.push("outras_taxas_desconhecidas");
    r.pendencias=faltas;
    if(faltas.length) pendentes.push(r);
    if(corresponde&&!r.conflito_preco) compativeis.push(r);
  }
  const precoProvisorio=compativeis.filter(r=>r.preco_unitario!==null).sort((a,b)=>a.preco_unitario-b.preco_unitario)
    .map(r=>({loja:r.loja,titulo:r.titulo,url:r.url,preco_unitario:r.preco_unitario,
      preco_sem_frete_quantidade:Math.round(r.preco_unitario*quantidade*100)/100,
      preco_variacao_confirmado:r.preco_variacao_confirmado || r.preco_confirmado_carrinho,
      origem:r.origem,pendencias:r.pendencias}));
  const confirmadas=compativeis.filter(r=>r.pendencias.length===0);
  const custos=compararOfertas({quantidade,ofertas:confirmadas.map(r=>({
    loja:r.loja,produto:r.titulo,url:r.url,preco_unitario:r.preco_unitario,frete:r.frete,
    impostos:r.impostos,outras_taxas:r.outras_taxas,disponivel:true,
    preco_confirmado_carrinho:true,frete_confirmado_carrinho:true,
    impostos_confirmados_carrinho:true,cupom_confirmado:false
  }))});
  const presentes=[...new Set([...compativeis,...pendentes].map(r=>r.loja))];
  return {
    status:"analise_de_ofertas_fornecidas",
    cobertura:{
      lojas_selecionadas:escolhidas,lojas_com_links_recebidos:presentes,
      lojas_sem_links_validos:escolhidas.filter(l=>!presentes.includes(l)),
      anuncios_recebidos:ofertas.length,anuncios_unicos_validos:vistos.size,
      anuncios_compativeis:compativeis.length,anuncios_com_total_confirmado:custos.ranking.length,
      anuncios_com_caracteristicas_pendentes:pendentes.filter(r=>r.caracteristicas_faltantes.length>0).length,
      anuncios_com_preco_da_variacao_nao_confirmado:pendentes.filter(r=>r.pendencias.includes("preco_variacao_nao_confirmado")).length,
      anuncios_rejeitados:rejeitados.length,
      duplicatas_removidas:[...vistos.values()].reduce((s,r)=>s+r.duplicatas,0)
    },
    menor_preco_anunciado_provisorio:precoProvisorio[0]??null,
    menor_preco_da_variacao_confirmada_provisorio:
      (precoProvisorio.find(r=>!caracteristicas_obrigatorias.length||r.preco_variacao_confirmado)??null),
    menores_precos_anunciados_por_loja:melhoresPorLoja(precoProvisorio,"preco_unitario"),
    ranking_preco_anunciado_provisorio:precoProvisorio,
    menor_custo_total_confirmado:custos.menor_total,
    menores_custos_totais_por_loja:melhoresPorLoja(custos.ranking,"total"),
    ranking_custo_total_confirmado:custos.ranking,
    pendentes,rejeitados,
    observacao:"Resultado limitado aos anúncios fornecidos e às confirmações declaradas pelo chamador. O servidor não verifica a página, a seleção da variação, o estoque ou o checkout por conta própria. Preço anunciado não é total final; valores ausentes não são zero."
  };
}
