// Faixa "Confira alguns depoimentos…" da página /cases-de-sucesso-ivory/.
import Image from "next/image";
import type { ReactNode } from "react";
import { dimensoesImagem } from "@/lib/imagens";

/** Título à esquerda e os depoimentos (<CasesDepoimento>) à direita; no celular, um embaixo do outro. */
export function CasesDepoimentos({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="fundo-ruido px-4 pt-12 md:pt-4 md:pb-8 lg:px-0 lg:pt-20 lg:pb-12">
      <div className="mx-auto flex flex-col items-center gap-8 md:flex-row md:gap-0 lg:max-w-[1140px]">
        <div className="w-full md:w-2/5 lg:pr-24">
          <h2 className="mt-2 mb-4 text-[2rem] leading-[1.2] font-medium text-texto max-md:text-center">{titulo}</h2>
        </div>
        <div className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:w-3/5 md:pl-8">{children}</div>
      </div>
    </section>
  );
}

type PropsDepoimento = {
  /** Logo do cliente (aparece no alto da caixa). */
  logo?: string;
  /** Nome do cliente (texto alternativo do logo). */
  empresa?: string;
  /** Quem deu o depoimento. */
  autor: string;
  /** Cargo de quem deu o depoimento. */
  cargo?: string;
  /** O depoimento, entre aspas. */
  children: ReactNode;
};

/** Um depoimento de cliente: logo, texto, autor e cargo. */
export function CasesDepoimento({ logo, empresa = "", autor, cargo, children }: PropsDepoimento) {
  const dims = logo ? dimensoesImagem(logo) : undefined;
  return (
    <figure className="flex w-full shrink-0 snap-start flex-col gap-5 rounded-[2rem] border-2 border-white bg-white/44 p-8 font-sistema text-base leading-normal text-corpo">
      {logo && dims && <Image src={logo} alt={empresa} width={dims.width} height={dims.height} className="h-auto w-32" />}
      <div>
        <blockquote className="[&_p]:mb-0">{children}</blockquote>
        <figcaption className="mt-6 mb-[0.9rem]">
          <strong className="text-azul">{autor}</strong>
          {cargo && (
            <>
              <br />
              {cargo}
            </>
          )}
        </figcaption>
      </div>
    </figure>
  );
}
