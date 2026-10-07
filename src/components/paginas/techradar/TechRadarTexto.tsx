import type { ReactNode } from "react";

/**
 * Texto corrido do Tech Radar (1.1em, entrelinha 1.5). No celular fica centralizado, em 1em e
 * com 1em entre parágrafos. A margem negativa no computador compensa a capa, que lá tem 1em a
 * menos de respiro embaixo do que a <Capa> comum.
 */
export function TechRadarTexto({ children }: { children: ReactNode }) {
  return (
    <section className="fundo-ruido px-4 pt-12 md:pt-4 md:pb-8 lg:-mt-4 lg:px-0 lg:py-0">
      <div className="texto-rico max-md:text-center max-md:text-base max-md:[&_p]:mb-4 lg:container-site">{children}</div>
    </section>
  );
}

/** Caixa clara com os quadrantes do radar, um por linha (número à esquerda, texto à direita). */
export function TechRadarQuadrantes({ children }: { children: ReactNode }) {
  return (
    <section className="fundo-ruido px-4 py-12 md:pt-4 md:pb-8 lg:px-0 lg:py-4">
      <div className="flex flex-col gap-5 rounded-[2em] border-2 border-white bg-white/44 px-8 pt-8 pb-4 lg:container-site">{children}</div>
    </section>
  );
}

/** Um quadrante: número em azul e a descrição (no celular, o número fica acima do texto). */
export function TechRadarQuadrante({ numero, children }: { numero: string; children: ReactNode }) {
  return (
    <div className="flex flex-col text-[1.2em] leading-normal text-corpo md:flex-row md:gap-5 [&_p]:mb-[0.9rem]">
      <p className="font-bold text-azul md:basis-[10%]">{numero}</p>
      <div className="md:basis-full">{children}</div>
    </div>
  );
}
