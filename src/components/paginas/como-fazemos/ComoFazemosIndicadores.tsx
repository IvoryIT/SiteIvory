import type { ReactNode } from "react";
import { separarFilhos } from "@/components/paginas/inicio/util";

/** Um número de destaque de `<ComoFazemosIndicadores>` (ex.: valor "+40%" e a legenda como conteúdo). */
export function ComoFazemosIndicador(props: { valor: string; children: ReactNode }) {
  void props;
  return null;
}

/**
 * Caixa em degradê rosa→azul com os números de destaque lado a lado (empilhados no celular),
 * separados por fios brancos. O que não for `<ComoFazemosIndicador>` (ex.: um `<BotaoIvory>`) vem logo abaixo.
 */
export function ComoFazemosIndicadores({ children }: { children: ReactNode }) {
  const { indicadores, resto } = separarFilhos(children, { indicadores: ComoFazemosIndicador });
  return (
    <section className="fundo-ruido pb-8 md:max-lg:px-4 md:max-lg:pt-4 max-md:p-4 max-md:pb-8">
      <div className="mx-auto max-w-[1140px]">
        <div className="flex justify-center">
          <div className="w-[85%] rounded-[10px] border-2 border-white bg-[linear-gradient(160deg,var(--color-rosa-claro),var(--color-azul-claro))] max-lg:w-full">
            <div className="fundo-ruido flex py-4 max-md:flex-col max-md:px-4 max-md:py-8">
              {indicadores.map(({ props: ind }, i) => (
                <div
                  key={i}
                  className="flex flex-1 flex-col items-center justify-center border-r-2 border-white px-8 py-4 last:border-r-0 max-md:border-r-0 max-md:border-b-2 max-md:py-8 max-md:first:pt-0 max-md:last:border-b-0 max-md:last:pb-0"
                >
                  <p className="text-[57.6px] leading-none font-bold text-azul italic max-md:text-[48px]">{ind.valor}</p>
                  <p className="text-center text-[19.2px] leading-[1.2] font-medium text-corpo italic">{ind.children}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {resto.length > 0 && <div className="mt-12 flex flex-col items-start">{resto}</div>}
      </div>
    </section>
  );
}
