import { Children, type ReactNode } from "react";
import { site } from "@/lib/site";
import { TituloCarreiras } from "./CarreirasMotivos";

type PropsBeneficios = {
  titulo: string;
  /** Texto do botão abaixo dos blocos, que abre o e-mail de currículos (site.emailCurriculos). */
  botao?: string;
  /** Número de colunas no computador e no tablet; os blocos são distribuídos na ordem, coluna a coluna. */
  colunas?: number;
  children: ReactNode;
};

/** Mosaico de benefícios do /carreiras/: blocos coloridos em colunas (um embaixo do outro no celular). */
export function CarreirasBeneficios({ titulo, botao, colunas = 3, children }: PropsBeneficios) {
  const blocos = Children.toArray(children);
  const porColuna = Math.ceil(blocos.length / colunas);
  const grupos = Array.from({ length: colunas }, (_, i) => blocos.slice(i * porColuna, (i + 1) * porColuna)).filter((g) => g.length);
  return (
    <section className="fundo-ruido px-4 pt-12 md:pt-4 md:pb-8 lg:px-0 lg:py-4">
      <div className="flex flex-col md:gap-4 lg:container-site">
        <TituloCarreiras>{titulo}</TituloCarreiras>
        <div className="flex flex-col gap-5 md:flex-row">
          {grupos.map((grupo, i) => (
            <div key={i} className="flex flex-1 flex-col gap-5">
              {grupo}
            </div>
          ))}
        </div>
        {botao && (
          <a href={`mailto:${site.emailCurriculos}`} className="botao mt-4 self-center text-base leading-none md:self-start md:text-[30px]">
            {botao}
          </a>
        )}
      </div>
    </section>
  );
}

const cores = { azul: "bg-azul", vinho: "bg-vinho", laranja: "bg-laranja" } as const;

type PropsBeneficio = {
  cor: keyof typeof cores;
  /** Bloco com o dobro da altura. */
  alto?: boolean;
  children: ReactNode;
};

/** Um benefício: bloco colorido com o nome no canto inferior. */
export function CarreirasBeneficio({ cor, alto, children }: PropsBeneficio) {
  return (
    <div className={`fundo-ruido flex min-h-[10em] flex-col justify-end rounded-[22px] p-4 ${cores[cor]} ${alto ? "md:min-h-[260px]" : "md:min-h-[130px]"}`}>
      <div className="w-4/5 text-[1.6em] leading-none font-medium text-white italic">{children}</div>
    </div>
  );
}
