import type { ReactNode } from "react";
export const metadata = { title: "Comparador Inteligente de Compras", description: "Projeto pessoal, gratuito e de código aberto para comparação de custo real." };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="pt-BR"><body style={{fontFamily:"system-ui,Arial,sans-serif",margin:0,background:"#f4f7fb",color:"#17263a"}}>{children}</body></html>;
}
