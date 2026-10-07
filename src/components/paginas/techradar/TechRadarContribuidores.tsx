import Image from "next/image";
import type { ReactNode } from "react";
import { versaoWebp } from "@/lib/imagens";

type Props = {
  /** Título da caixa no tablet e no celular (no computador ele vem desenhado na imagem de fundo). */
  titulo: string;
  /** Imagem de fundo da faixa no computador (caixa azul com a aba "Contribuidores:"). */
  fundo: string;
  children: ReactNode;
};

/**
 * Faixa "Contribuidores" com as fotos das pessoas. No computador, as pessoas ficam em linha sobre a
 * imagem de fundo; no tablet e no celular, numa caixa azul com o título (que quebra em linhas).
 */
export function TechRadarContribuidores({ titulo, fundo, children }: Props) {
  return (
    <section className="fundo-ruido px-4 pt-12 md:pt-4 md:pb-8 lg:px-0 lg:py-0">
      <div
        className="flex flex-col rounded-[2em] bg-azul px-4 pt-8 pb-4 lg:container-site lg:min-h-[23em] lg:justify-center lg:rounded-none lg:bg-transparent lg:bg-[image:var(--fundo)] lg:bg-contain lg:bg-center lg:bg-no-repeat lg:px-8 lg:pt-16 lg:pb-0"
        style={{ ["--fundo" as string]: `url("${versaoWebp(fundo)}")` }}
      >
        <h2 className="mb-[0.9rem] self-center text-base leading-normal font-semibold text-white italic md:self-start lg:sr-only">{titulo}</h2>
        <div className="flex flex-col md:flex-row md:flex-wrap md:justify-center lg:flex-nowrap">{children}</div>
      </div>
    </section>
  );
}

/** Uma pessoa: foto redonda (já recortada no arquivo) e o nome. */
export function TechRadarPessoa({ foto, nome }: { foto: string; nome: string }) {
  return (
    <div className="flex flex-col items-center gap-5 md:w-[14em] lg:w-auto lg:flex-1">
      <Image src={foto} alt={`Foto de ${nome}`} width={270} height={270} sizes="128px" className="h-auto w-[8em]" />
      <p className="mb-[0.9rem] text-base leading-normal text-white">{nome}</p>
    </div>
  );
}
