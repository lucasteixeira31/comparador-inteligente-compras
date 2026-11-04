export default function Home() {
  return <main style={{maxWidth:760,margin:"8vh auto",padding:"0 22px",lineHeight:1.6}}>
    <h1>Comparador Inteligente de Compras</h1>
    <p>Projeto pessoal, gratuito e de código aberto. Este servidor fornece ferramentas MCP para organizar pesquisas e calcular custos reais de ofertas.</p>
    <p><a href="/widget-comparador.html">Abrir tabela de registro de preços e links</a></p>
    <p><a href="/comparador.html">Abrir formulário original de critérios</a></p>
    <p>Endpoint MCP: <code>/api/mcp</code></p>
    <p style={{fontSize:14,color:"#617388"}}>Nesta fase, não existem integrações oficiais de busca com marketplaces, contas de usuário ou armazenamento remoto. A tabela web salva no navegador; no ChatGPT, o widget usa o estado da interface, que não é banco de dados. Exporte JSON para manter uma cópia dos valores.</p>
  </main>;
}
