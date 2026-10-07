import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { dimensoesImagem } from "@/lib/imagens";
import { atributosNovaAba } from "./util";

type PropsChamadaBlog = {
  /** Arte da faixa (já com o recorte no canto inferior direito, onde fica o link). */
  imagem: string;
  alt: string;
  /** Destino do link. */
  href: string;
  /** Texto do link, no recorte da arte (ex.: "Acesse nosso blog!"). */
  link: string;
  novaAba?: boolean;
  /** Mostra só no computador (no WordPress a faixa ficava oculta no tablet e no celular). */
  somenteComputador?: boolean;
  /** Frase em branco sobre a arte. */
  children: ReactNode;
};

/** Faixa-convite para o blog: arte de 1140px, frase em branco por cima e o link no recorte. */
export function InicioBlog({ imagem, alt, href, link, novaAba, somenteComputador, children }: PropsChamadaBlog) {
  const { width, height } = dimensoesImagem(imagem);
  const linkClasses = "pr-[22px] font-semibold text-corpo italic";
  return (
    <section className={`fundo-ruido ${somenteComputador ? "hidden lg:block" : ""}`}>
      <div className="relative container-site">
        <Image src={imagem} alt={alt} width={width} height={height} sizes="(max-width: 1160px) 100vw, 1140px" className="block h-auto w-full" />
        <div className="absolute top-[119px] left-6 w-[56%] text-[24px] leading-[1.5] font-semibold text-white italic [&_p]:mb-[14.4px]">{children}</div>
        <h2 className="absolute right-[0.4px] bottom-[19.2px] text-right text-[22px] leading-[22px]">
          {novaAba ? (
            <a href={href} className={linkClasses} {...atributosNovaAba(true)}>
              {link}
            </a>
          ) : (
            <Link href={href} className={linkClasses}>
              {link}
            </Link>
          )}
        </h2>
      </div>
    </section>
  );
}
