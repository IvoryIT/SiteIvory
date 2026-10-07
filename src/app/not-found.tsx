// Página 404 (antigo template "Elementor Error 404", id 3014): a frase centralizada e o topo do
// rodapé. Vale para qualquer URL sem página em content/paginas (a rota [[...slug]] chama notFound()).
import type { Metadata } from "next";
import { TopoRodape } from "@/components/blocos/estrutura";

// O Next já acrescenta <meta name="robots" content="noindex"> nas respostas 404.
export const metadata: Metadata = { title: "Página não encontrada - Ivory IT" };

export default function PaginaNaoEncontrada() {
  return (
    <>
      {/* A margem negativa no tablet/computador compensa o respiro do <TopoRodape>, que lá é menor. */}
      <section className="fundo-ruido px-4 pt-32 pb-[0.9rem] md:-mb-4 md:pt-40">
        <h1 className="text-center text-[1.6em] leading-normal font-bold text-texto md:text-[2em]">A página não pode ser encontrada.</h1>
      </section>
      <TopoRodape />
    </>
  );
}
