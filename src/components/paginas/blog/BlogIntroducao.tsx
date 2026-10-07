import type { ReactNode } from "react";

/**
 * Texto de apresentação logo abaixo da capa do /blog/ (editor de texto do Elementor: 1.1em,
 * entrelinha 1.5). No celular fica centralizado e em 1em, sem margem entre parágrafos.
 */
export function BlogIntroducao({ children }: { children: ReactNode }) {
  return (
    <section className="fundo-ruido px-4 pt-12 md:pt-4 md:pb-8 lg:px-0 lg:py-4">
      <div className="texto-rico max-md:text-center max-md:text-base max-md:[&_p]:mb-0 lg:container-site">{children}</div>
    </section>
  );
}
