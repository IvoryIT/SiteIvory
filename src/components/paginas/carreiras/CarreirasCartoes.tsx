import type { ReactNode } from "react";
import { versaoWebp } from "@/lib/imagens";

/** Faixa com os cartões de abertura do /carreiras/: três colunas (uma embaixo da outra no celular). */
export function CarreirasCartoes({ children }: { children: ReactNode }) {
  return (
    <section className="fundo-ruido px-4 pt-12 md:pt-4 md:pb-8 lg:px-0 lg:py-4">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-4 lg:container-site">{children}</div>
    </section>
  );
}

/** Classes comuns aos cartões: a imagem de fundo desenha o cartão (moldura, recorte e ilustração). */
export const classesCartao =
  "block min-h-[26em] bg-[image:var(--fundo)] bg-contain bg-no-repeat p-8 text-base leading-normal text-corpo [&_p]:mb-[0.9rem]";

export const fundoCartao = (imagem: string) => ({ ["--fundo" as string]: `url("${versaoWebp(imagem)}")` });

type Props = {
  /** Imagem de fundo do cartão inteiro. */
  imagem: string;
  /** Descrição da imagem para leitores de tela, quando o cartão não tem texto (ex.: mural de logotipos). */
  descricao?: string;
  children?: ReactNode;
};

/** Cartão com imagem de fundo e texto por cima. */
export function CarreirasCartao({ imagem, descricao, children }: Props) {
  return (
    <div className={classesCartao} style={fundoCartao(imagem)} {...(descricao && !children ? { role: "img", "aria-label": descricao } : {})}>
      {children}
    </div>
  );
}
