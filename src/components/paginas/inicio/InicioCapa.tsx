import Image from "next/image";
import type { ReactNode } from "react";
import { dimensoesImagem, versaoWebp } from "@/lib/imagens";

type PropsCapaInicio = {
  /** Imagem de fundo (degradê), que some em direção ao rodapé da capa. */
  imagem: string;
  /** Mancha de luz decorativa que sobrepõe a parte de baixo da capa (opcional). */
  brilho?: string;
  /**
   * Conteúdo em Markdown: `# título` (H1 da página), o parágrafo de apoio e o botão
   * (`<BotaoIvory>`). No celular tudo fica centralizado.
   */
  children: ReactNode;
};

/**
 * Capa da home: faixa de 576px com o degradê de fundo esmaecendo para o creme, título grande em
 * itálico, texto de apoio e botão. Logo abaixo, a "mancha de luz" decorativa que o WordPress
 * desenhava por cima da emenda entre a capa e a seção seguinte.
 */
export function InicioCapa({ imagem, brilho, children }: PropsCapaInicio) {
  const brilhoDims = brilho ? dimensoesImagem(brilho) : undefined;
  return (
    <>
      <section className="fundo-ruido pb-4 max-md:-mt-[6.4px]">
        <div
          className="bg-cover bg-[position:bottom_center] bg-no-repeat [mask-image:linear-gradient(to_bottom,black_0%,black_80%,transparent_100%)]"
          style={{ backgroundImage: `url("${versaoWebp(imagem)}")` }}
        >
          <div className="fundo-ruido min-h-[576px] pt-40 pb-8">
            <div
              className={[
                "mx-auto flex max-w-[1140px] flex-col gap-5 p-[10px] text-corpo max-md:p-0 [&>a]:self-start max-md:[&>a]:self-center",
                // Título (H1): 45px, peso 500, entrelinha 1,5; no celular 22,4px centralizado.
                "[&_h1]:m-0 [&_h1]:p-[10px] [&_h1]:pb-[24.4px] [&_h1]:text-[45px] [&_h1]:leading-[1.5] [&_h1]:font-medium",
                "max-md:[&_h1]:p-0 max-md:[&_h1]:pb-[14.4px] max-md:[&_h1]:text-center max-md:[&_h1]:text-[22.4px]",
                // Texto de apoio: 21px leve; no celular 16px centralizado com respiro de 1em.
                "[&_p]:m-0 [&_p]:pb-[14.4px] [&_p]:text-[21px] [&_p]:leading-[1.5] [&_p]:font-light",
                "max-md:[&_p]:px-4 max-md:[&_p]:pt-4 max-md:[&_p]:pb-[30.4px] max-md:[&_p]:text-center max-md:[&_p]:text-base",
              ].join(" ")}
            >
              {children}
            </div>
          </div>
        </div>
      </section>
      {/* Faixa de 2em com a mancha de luz, que vaza para cima (sobre a capa) e para baixo. */}
      <div aria-hidden className="fundo-ruido relative z-[2] h-8">
        {brilho && brilhoDims && (
          <Image
            src={brilho}
            alt=""
            width={brilhoDims.width}
            height={brilhoDims.height}
            sizes="100vw"
            priority
            className="pointer-events-none absolute top-[-25em] left-0 h-auto w-full max-w-none"
          />
        )}
      </div>
    </>
  );
}
