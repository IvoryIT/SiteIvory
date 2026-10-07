import type { CSSProperties, ReactNode } from "react";
import { versaoWebp } from "@/lib/imagens";
import { separarFilhos } from "@/components/paginas/inicio/util";

type PropsModelo = {
  /** Rótulo pequeno em azul acima do nome (ex.: "Modelo 1"). */
  rotulo: string;
  /** Nome do modelo. */
  titulo: string;
  /** Imagem de fundo do cartão; sem ela o cartão fica translúcido. */
  fundo?: string;
  /** Lado da imagem de fundo que fica à vista (padrão: esquerda). */
  fundoPosicao?: "esquerda" | "direita";
  /** Título do bloco final, depois do tracejado (ex.: "Quando usar"). */
  rotuloQuando: string;
  /** Texto do bloco final. */
  quando: string;
  /** Descrição e lista de características, em Markdown. */
  children: ReactNode;
};

/** Um cartão de `<ComoFazemosModelos>`. Só tem efeito dentro dele. */
export function ComoFazemosModelo(props: PropsModelo) {
  void props;
  return null;
}

/**
 * "Modelos de Entrega": `## título`, parágrafo de apoio (70% da largura) e os cartões de modelo
 * lado a lado (empilhados no tablet e no celular), todos com a mesma altura.
 */
export function ComoFazemosModelos({ children }: { children: ReactNode }) {
  const { modelos, resto } = separarFilhos(children, { modelos: ComoFazemosModelo });
  return (
    <section className="fundo-ruido py-8 md:max-lg:px-4 md:max-lg:pt-4 max-md:px-4 max-md:pt-4">
      <div
        className={[
          "mx-auto flex max-w-[1140px] flex-col gap-5 py-4 pr-4 text-corpo max-md:p-0 max-md:pb-8",
          "[&_h2]:mb-[14.4px] [&_h2]:text-[38.4px] [&_h2]:leading-[1.2] [&_h2]:font-normal max-md:[&_h2]:text-[25.6px]",
          "[&_p]:mb-[14.4px] [&_p]:w-[70%] [&_p]:text-[32px] [&_p]:leading-[1.2] [&_p]:font-light max-lg:[&_p]:w-full max-md:[&_p]:text-[19.2px]",
        ].join(" ")}
      >
        {resto}
      </div>
      <div className="mx-auto flex max-w-[1140px] gap-4 max-lg:flex-col max-md:pb-8">
        {modelos.map(({ props: m }) => {
          const estilo: CSSProperties | undefined = m.fundo ? { backgroundImage: `url("${versaoWebp(m.fundo)}")` } : undefined;
          return (
            <div
              key={m.titulo}
              style={estilo}
              className={`flex flex-1 flex-col rounded-[30px] border-2 border-white p-8 text-corpo max-md:p-4 ${
                m.fundo ? `bg-cover bg-no-repeat ${m.fundoPosicao === "direita" ? "bg-[position:center_right]" : "bg-[position:0_0]"}` : "bg-white/35"
              }`}
            >
              <p className="mb-[14.4px] text-base leading-none text-azul">{m.rotulo}</p>
              <p className="mb-[10px] text-[28.8px] leading-[1.2] font-bold italic">{m.titulo}</p>
              <div className="text-base leading-6 font-light [&_p]:mb-[14.4px] [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-10 [&_ul]:italic">{m.children}</div>
              <p className="relative mt-8 text-base leading-6 text-azul before:absolute before:left-0 before:h-[2px] before:w-full before:-translate-y-6 before:bg-[repeating-linear-gradient(to_right,#fff_5px_12px,transparent_22px_25px)] before:content-['']">
                {m.rotuloQuando}
              </p>
              <p className="text-base leading-6 font-light italic">{m.quando}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
