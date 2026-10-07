import type { CSSProperties, ReactNode } from "react";
import { versaoWebp } from "@/lib/imagens";
import { separarFilhos } from "@/components/paginas/inicio/util";

/** Um cartão de `<ComoFazemosCapacidades>`: nome e lista em Markdown. Só tem efeito dentro dele. */
export function ComoFazemosCapacidade(props: { titulo: string; children: ReactNode }) {
  void props;
  return null;
}

type PropsCapacidades = {
  /** Âncora da seção (ex.: "expertises", alvo do botão "ver expertises"). */
  id?: string;
  /** Desenho de linhas no canto superior direito dos cartões. */
  fundo?: string;
  /** Conteúdo: `## título` e os `<ComoFazemosCapacidade>`s. */
  children: ReactNode;
};

/** "Capacidades que sustentam…": título (60% da largura) e cartões em duas colunas. */
export function ComoFazemosCapacidades({ id, fundo, children }: PropsCapacidades) {
  const { capacidades, resto } = separarFilhos(children, { capacidades: ComoFazemosCapacidade });
  const estilo = (fundo ? { "--fundo": `url("${versaoWebp(fundo)}")` } : {}) as CSSProperties;
  return (
    // Sem respiro embaixo: o bloco do formulário que fecha a página já traz 48px.
    <section id={id} className="fundo-ruido pt-8 md:max-lg:px-4 md:max-lg:pt-4 max-md:px-4 max-md:pt-4 max-md:pb-4" style={estilo}>
      <div className="mx-auto flex max-w-[1140px] flex-col gap-5 pt-4 pr-4 text-corpo max-md:p-0">
        <div className="[&_h2]:mb-[14.4px] [&_h2]:w-[60%] [&_h2]:text-[38.4px] [&_h2]:leading-[1.2] [&_h2]:font-normal max-lg:[&_h2]:w-full max-md:[&_h2]:text-[25.6px]">{resto}</div>
        <div className="grid grid-cols-2 gap-5 p-[10px] max-md:grid-cols-1 max-md:p-0">
          {capacidades.map(({ props: c }) => (
            <div
              key={c.titulo}
              className="rounded-[30px] border-2 border-white bg-[image:var(--fundo)] bg-cover bg-[position:top_right] bg-no-repeat p-4"
            >
              <p className="text-base leading-6">{c.titulo}</p>
              <div className="relative mt-[28.8px] text-base leading-6 font-light before:absolute before:left-0 before:h-px before:w-24 before:-translate-y-[12.8px] before:bg-black before:content-[''] [&_ul]:list-disc [&_ul]:pl-10">
                {c.children}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
