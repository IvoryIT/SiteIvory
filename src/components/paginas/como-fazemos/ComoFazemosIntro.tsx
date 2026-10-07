import type { ReactNode } from "react";
import { separarTag, separarFilhos } from "@/components/paginas/inicio/util";

/**
 * Abertura em duas colunas separadas por um fio vertical (horizontal no celular): o `## título`
 * vai, grande, na coluna da esquerda (45%); o resto do conteúdo (parágrafo e `<BotaoIvory>`) vai
 * na da direita.
 */
export function ComoFazemosIntro({ children }: { children: ReactNode }) {
  const { resto } = separarFilhos(children, {});
  const { tag: titulo, resto: direita } = separarTag(resto, "h2");
  return (
    <section className="fundo-ruido py-[10px] max-md:p-8">
      <div className="mx-auto flex max-w-[1140px] text-corpo md:w-[calc(100%_-_20px)] max-md:flex-col">
        <div className="flex w-[45%] flex-col justify-center border-r-2 border-preto/25 py-4 pr-4 max-md:w-full max-md:border-r-0 max-md:border-b-2 max-md:p-0 max-md:pb-8 [&_h2]:mb-[14.4px] [&_h2]:text-[38.4px] [&_h2]:leading-[1.2] [&_h2]:font-normal max-md:[&_h2]:text-[25.6px]">
          {titulo}
        </div>
        <div className="flex w-[55%] flex-col justify-center gap-5 py-4 pl-8 max-md:w-full max-md:pb-0 max-md:pl-0 [&_p]:mb-[14.4px] [&_p]:text-[19.2px] [&_p]:leading-[1.5] max-md:[&_p]:mt-6 max-md:[&_p]:text-base [&>a]:self-start max-md:[&>a]:self-center">
          {direita}
        </div>
      </div>
    </section>
  );
}
