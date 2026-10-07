import Image from "next/image";
import Link from "next/link";
import type { ReactElement, ReactNode } from "react";
import { dimensoesImagem } from "@/lib/imagens";
import { CartaoVirar } from "./CartaoVirar";
import { separarFilhos } from "./util";

type PropsLogoCase = {
  /** Logo em cinza (face normal do cartão). */
  frente: string;
  /** Logo colorido (face mostrada no hover/toque). */
  verso: string;
  alt: string;
  /** Destino no computador e no tablet (página do case). */
  href: string;
  /** Destino no celular, quando diferente (ex.: o hub do setor com âncora). */
  hrefCelular?: string;
};

/** Um cliente na grade de logos de `<InicioSolucoes>`. Só tem efeito dentro dela. */
export function InicioLogo(props: PropsLogoCase) {
  void props;
  return null;
}

type PropsSolucoesInicio = {
  /**
   * Conteúdo: `## título`, parágrafo, `<BotaoIvory>` (coluna da esquerda) e os `<InicioLogo>`
   * (grade da direita), na ordem em que aparecem.
   */
  children: ReactNode;
  /** Quantos logos vão em cada coluna da grade de computador/tablet (padrão "3,2,3"). */
  colunas?: string;
  /** Logos da grade de computador/tablet abrem em nova aba. */
  novaAba?: boolean;
};

function imagemLogo(src: string, alt: string, sizes: string) {
  const { width, height } = dimensoesImagem(src);
  return <Image src={src} alt={alt} width={width} height={height} sizes={sizes} className="block h-auto w-full" />;
}

/**
 * "Soluções na medida do seu desafio": texto e botão à esquerda (40%) e, à direita, a grade de
 * logos de clientes em cartões que viram (cinza → colorido). As colunas laterais têm três logos,
 * com o último subindo 1,3em; a do meio fica centralizada. No celular a grade vira duas colunas
 * de logos simples, que levam ao hub do setor.
 */
export function InicioSolucoes({ children, colunas = "3,2,3", novaAba }: PropsSolucoesInicio) {
  const { logos, resto } = separarFilhos(children, { logos: InicioLogo });
  const tamanhos = colunas.split(",").map((n) => Number(n.trim()) || 0);
  const grupos: ReactElement<PropsLogoCase>[][] = [];
  let i = 0;
  for (const n of tamanhos) {
    grupos.push(logos.slice(i, i + n));
    i += n;
  }
  if (i < logos.length) grupos.push(logos.slice(i));

  return (
    <section className="fundo-ruido relative z-[2] pt-8">
      <div className="mx-auto flex max-w-[1140px] max-md:flex-col max-md:gap-4 max-md:px-4">
        <div
          className={[
            "flex w-[40%] flex-col text-corpo max-md:w-full max-md:text-center",
            "[&_h2]:mt-2 [&_h2]:mb-4 [&_h2]:text-[32px] [&_h2]:leading-[1.2] [&_h2]:font-medium [&_h2]:italic",
            "[&_p]:mt-5 [&_p]:mb-[14.4px] [&_p]:text-[20px] [&_p]:leading-[1.5] [&_p]:font-light",
            "max-md:[&_p]:mt-4 max-md:[&_p]:text-base",
            "[&>a]:mt-8 [&>a]:self-start max-md:[&>a]:self-center",
          ].join(" ")}
        >
          {resto}
        </div>

        {/* Computador e tablet: cartões que viram. */}
        <div className="flex w-[60%] gap-4 px-8 pt-8 pb-4 max-md:hidden">
          {grupos.map((grupo, g) => (
            <div key={g} className="flex flex-1 flex-col justify-center gap-4">
              {grupo.map((logo, j) => (
                <CartaoVirar
                  key={logo.props.frente}
                  href={logo.props.href}
                  novaAba={novaAba}
                  rotulo={logo.props.alt}
                  className={grupo.length >= 3 && j === grupo.length - 1 ? "-mt-[20.8px]" : ""}
                  frente={imagemLogo(logo.props.frente, logo.props.alt, "(max-width: 1024px) 122px, 196px")}
                  verso={imagemLogo(logo.props.verso, logo.props.alt, "(max-width: 1024px) 122px, 196px")}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Celular: duas colunas de logos. */}
        <div className="flex flex-wrap justify-center gap-4 md:hidden">
          {logos.map((logo) => (
            <Link key={logo.props.frente} href={logo.props.hrefCelular ?? logo.props.href} className="block w-[45%]">
              {imagemLogo(logo.props.frente, logo.props.alt, "45vw")}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
