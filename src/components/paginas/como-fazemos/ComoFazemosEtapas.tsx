import Image from "next/image";
import type { ReactNode } from "react";
import { dimensoesImagem } from "@/lib/imagens";
import { separarFilhos } from "@/components/paginas/inicio/util";

type PropsEtapa = {
  /** Ícone da etapa (círculo branco com o número), mostrado com 8em (128px). */
  icone: string;
  /** Nome da etapa, em azul. */
  titulo: string;
  /** Descrição curta. */
  children: ReactNode;
};

/** Uma etapa de `<ComoFazemosEtapas>`. Só tem efeito dentro dele. */
export function ComoFazemosEtapa(props: PropsEtapa) {
  void props;
  return null;
}

/**
 * Linha do processo: etapas lado a lado ligadas por uma linha tracejada que passa atrás dos
 * ícones. A faixa tem no mínimo 960px; em telas menores ela rola na horizontal.
 */
export function ComoFazemosEtapas({ children }: { children: ReactNode }) {
  const { etapas } = separarFilhos(children, { etapas: ComoFazemosEtapa });
  return (
    <section className="fundo-ruido pt-8 max-md:pt-0 max-md:pb-8">
      <div className="mx-auto max-w-[1140px] overflow-x-auto overflow-y-hidden p-[10px] max-md:p-0">
        <div className="relative flex min-w-[960px] justify-center gap-5 py-4 pr-4 before:absolute before:top-[28%] before:left-0 before:h-[2px] before:w-full before:-translate-y-1/2 before:bg-[repeating-linear-gradient(to_right,#242424_0_12px,transparent_12px_25px)] before:content-[''] max-lg:before:top-[27%] max-md:p-0 max-md:pb-8 max-md:before:top-[23%]">
          {etapas.map(({ props: e }) => {
            const { width, height } = dimensoesImagem(e.icone);
            return (
              <div key={e.titulo} className="relative flex flex-1 flex-col">
                <div className="p-[10px]">
                  <Image src={e.icone} alt="" width={width} height={height} sizes="128px" className="mx-auto block h-auto w-32 max-w-full" />
                </div>
                <p className="text-center text-[19.2px] leading-[1.5] font-medium text-azul italic">{e.titulo}</p>
                <div className="text-center text-[14.4px] leading-[1.2] font-light text-corpo [&_p]:mb-[14.4px]">{e.children}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
