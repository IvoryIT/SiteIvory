import type { ReactNode } from "react";

/**
 * Abertura de bloco: etiqueta pequena em itálico, `## título` (38,4px) e parágrafo de apoio grande
 * e leve (32px). No tablet o texto encosta nas bordas da tela, como no site antigo.
 */
export function ComoFazemosChamada({ etiqueta, children }: { etiqueta?: string; children: ReactNode }) {
  return (
    <section className="fundo-ruido pt-16 max-md:px-8 max-md:pt-8">
      <div
        className={[
          // Coluna flex: as margens não se somam ("colapsam") como no fluxo normal, igual ao Elementor.
          "mx-auto flex max-w-[1140px] flex-col py-4 pr-4 text-corpo max-md:p-0 max-md:pb-8",
          "[&_h2]:mb-[14.4px] [&_h2]:text-[38.4px] [&_h2]:leading-[1.2] [&_h2]:font-normal max-md:[&_h2]:text-[25.6px]",
          "[&_h2+p]:mt-8 [&_h2+p]:mb-[14.4px] [&_h2+p]:text-[32px] [&_h2+p]:leading-[1.2] [&_h2+p]:font-light",
          "max-md:[&_h2+p]:mt-[19.2px] max-md:[&_h2+p]:text-[19.2px]",
        ].join(" ")}
      >
        {etiqueta && <p className="text-[19.2px] leading-[1.5] font-light italic max-md:text-[25.6px]">{etiqueta}</p>}
        {children}
      </div>
    </section>
  );
}
