// Blocos exclusivos dos hubs de setor (/cases-de-sucesso-ivory/cases-<setor>/).
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { dimensoesImagem } from "@/lib/imagens";

type PropsCaseDoHub = {
  /** Nome do case em destaque (azul, negrito itálico). Use "\n" para quebrar a linha. */
  titulo: string;
  /** Linha de apoio abaixo do título. */
  subtitulo?: string;
  /** Imagem do case (mockup com os logos). */
  imagem: string;
  /** Texto alternativo da imagem. */
  alt?: string;
  /** Lado da imagem no tablet e no desktop (no celular ela vem antes ou depois do texto, na mesma ordem). */
  lado?: "esquerda" | "direita";
  /** Tamanho do título no tablet e no celular, em em (padrão 2.6 e 1.8; no desktop é sempre 2.6). */
  tamanhoTituloTablet?: number;
  tamanhoTituloCelular?: number;
  /** Largura máxima da imagem, em em (padrão: a coluna toda). */
  larguraImagem?: number;
  /** Largura máxima da imagem no tablet, em em (padrão: a mesma do desktop). */
  larguraImagemTablet?: number;
  /** Centraliza a imagem na coluna (padrão: encostada no início da coluna). */
  centralizarImagem?: boolean;
  /** Recuo de 2em num dos lados da imagem (tablet e desktop). */
  recuo?: "esquerda" | "direita";
  /** Espaço extra acima, em px (como no <Bloco>). */
  espacoAcima?: number;
  /** Texto de abertura do case (Markdown; "### Título" vira um subtítulo de tópico). */
  children?: ReactNode;
};

/** Abertura de um case dentro do hub: imagem de um lado; título, subtítulo e texto do outro. */
export function CaseDoHub({
  titulo,
  subtitulo,
  imagem,
  alt = "",
  lado = "esquerda",
  tamanhoTituloTablet = 2.6,
  tamanhoTituloCelular = 1.8,
  larguraImagem,
  larguraImagemTablet,
  centralizarImagem,
  recuo,
  espacoAcima = 0,
  children,
}: PropsCaseDoHub) {
  const { width, height } = dimensoesImagem(imagem);
  const padding = recuo === "esquerda" ? "md:pl-8" : recuo === "direita" ? "md:pr-8" : "";
  const coluna = (
    <div className={`flex w-full flex-col items-center ${centralizarImagem ? "" : "md:items-start"} ${padding}`}>
      <Image
        src={imagem}
        alt={alt}
        width={width}
        height={height}
        sizes="(max-width: 767px) 100vw, 560px"
        className={`h-auto ${larguraImagem ? "w-full max-w-[min(var(--largura-t),100%)] lg:max-w-[min(var(--largura),100%)]" : "max-w-full"}`}
        style={
          larguraImagem
            ? ({ ["--largura" as string]: `${larguraImagem}rem`, ["--largura-t" as string]: `${larguraImagemTablet ?? larguraImagem}rem` } as CSSProperties)
            : undefined
        }
      />
    </div>
  );
  return (
    <div
      className="mt-[calc(2rem+var(--acima))] flex flex-col gap-8 text-corpo first:mt-(--acima) md:mt-[calc(3rem+var(--acima))] md:flex-row md:first:mt-(--acima)"
      style={{ ["--acima" as string]: `${espacoAcima}px` } as CSSProperties}
    >
      {lado === "esquerda" && coluna}
      <div className="flex w-full flex-col justify-center max-md:text-center">
        <h2
          className="text-(length:--tt-m) leading-normal font-bold whitespace-pre-line text-azul italic md:text-(length:--tt-t) lg:text-[2.6rem]"
          style={{ ["--tt-m" as string]: `${tamanhoTituloCelular}rem`, ["--tt-t" as string]: `${tamanhoTituloTablet}rem` } as CSSProperties}
        >
          {titulo}
        </h2>
        {subtitulo && <p className="mb-[0.9rem] text-[1.2rem] leading-normal font-medium text-azul">{subtitulo}</p>}
        <div className="flex flex-col text-base leading-normal md:text-[1.1rem] [&_em]:italic [&_strong]:font-bold [&>h3]:mt-6 [&>h3]:mb-[0.9rem] [&>h3]:text-[1.4rem] [&>h3]:leading-normal [&>h3]:font-bold [&>h3]:text-azul [&>h3]:italic [&>p]:mb-[0.9rem] [&>p:first-child]:mt-[1em]">
          {children}
        </div>
      </div>
      {lado === "direita" && coluna}
    </div>
  );
}

export type SetorVizinho = { caminho: string; nome: string };

const SETA_ANTERIOR = "/wp-content/uploads/2025/09/Group-313.png";
const SETA_PROXIMA = "/wp-content/uploads/2025/09/Group-312.png";

/** Setas para o setor anterior e o próximo (lista circular, pela `ordem` dos hubs). */
export function NavegacaoSetores({ anterior, proximo }: { anterior: SetorVizinho; proximo: SetorVizinho }) {
  const seta = (src: string, vizinho: SetorVizinho, rotulo: string) => (
    <Link href={vizinho.caminho} aria-label={`${rotulo}: ${vizinho.nome}`} className="block w-8">
      <Image src={src} alt="" width={dimensoesImagem(src).width} height={dimensoesImagem(src).height} className="h-auto w-8" />
    </Link>
  );
  return (
    <nav aria-label="Outros setores" className="fundo-ruido px-4 pt-12 md:pt-4 md:pb-8 lg:px-0 lg:py-4">
      <div className="mx-auto flex justify-end gap-4 lg:max-w-[1140px]">
        {seta(SETA_ANTERIOR, anterior, "Setor anterior")}
        {seta(SETA_PROXIMA, proximo, "Próximo setor")}
      </div>
    </nav>
  );
}
