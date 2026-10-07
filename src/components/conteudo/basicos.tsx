// Componentes básicos permitidos no corpo MDX de qualquer família de página.
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ehExterno } from "@/lib/site";
import { dimensoesImagem } from "@/lib/imagens";

/** Texto em azul da marca (o "destaque" usado nos títulos e frases-chave do site). */
export function Azul({ children }: { children: ReactNode }) {
  return <span className="text-azul">{children}</span>;
}

/** Linha divisória curta entre blocos de texto dos artigos. */
export function Divisor() {
  return <hr className="my-8 w-full border-0 border-t border-linha md:mt-6 md:w-2/5" />;
}

type PropsImagem = {
  src: string;
  /** Texto alternativo: descreva a imagem (vazio só para imagem decorativa). */
  alt: string;
  /** Largura máxima em px (padrão: largura do arquivo, limitada à coluna). */
  largura?: number;
  /** Largura em % da coluna de texto (ex.: 40). */
  porcento?: number;
  /** Cantos arredondados (padrão: não). */
  arredondada?: boolean;
  /** Link ao clicar na imagem. */
  href?: string;
  /** Alinhamento quando a imagem é menor que a coluna. */
  alinhar?: "esquerda" | "centro" | "direita";
  prioridade?: boolean;
};

export function Imagem({ src, alt, largura, porcento, arredondada, href, alinhar = "centro", prioridade }: PropsImagem) {
  const { width, height } = dimensoesImagem(src);
  const w = Math.min(largura ?? width, width);
  const img = (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={prioridade}
      sizes={`(max-width: 1160px) 100vw, ${Math.min(w, 1140)}px`}
      className={`h-auto ${arredondada ? "rounded-2xl" : ""}`}
      style={{ width: "100%", maxWidth: w }}
    />
  );
  const classeAlinhamento = alinhar === "esquerda" ? "justify-start" : alinhar === "direita" ? "justify-end" : "justify-center";
  const conteudo = href ? <LinkInteligente href={href}>{img}</LinkInteligente> : img;
  return (
    <div className={`my-4 flex ${classeAlinhamento}`}>
      {porcento ? <div style={{ width: `${porcento}%` }}>{conteudo}</div> : conteudo}
    </div>
  );
}

/** Link que abre em nova aba quando aponta para fora do site. */
export function LinkInteligente({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  if (ehExterno(href) || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return (
      <a href={href} className={className} {...(ehExterno(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

type PropsBotao = {
  href: string;
  children: ReactNode;
  /** contorno (azul, padrão) ou acao (laranja cheio). */
  variante?: "contorno" | "acao";
  /** Tamanho do texto em px (padrão 20). */
  tamanho?: number;
};

export function Botao({ href, children, variante = "contorno", tamanho = 20 }: PropsBotao) {
  const classes =
    variante === "acao"
      ? "inline-flex items-center justify-center rounded-[18px] bg-laranja px-6 py-3 italic leading-none text-white transition-colors hover:bg-azul"
      : "botao";
  return (
    <LinkInteligente href={href} className={classes}>
      <span style={{ fontSize: tamanho }}>{children}</span>
    </LinkInteligente>
  );
}

type PropsTextoComImagem = {
  /** Imagem à direita do texto (abaixo dele no celular). */
  imagem: string;
  /** Texto alternativo da imagem. */
  alt: string;
  /** Largura do texto a partir do tablet, em % da linha. Padrão 60. */
  larguraTexto?: number;
  /** Largura da imagem a partir do tablet, em % da linha. Padrão: o que sobra do texto. */
  larguraImagem?: number;
  /** Centraliza o par na linha (padrão: alinhado à esquerda, como no Elementor). */
  centralizar?: boolean;
  children: ReactNode;
};

/** Texto à esquerda e imagem à direita, centralizados na vertical; empilham no celular. */
export function TextoComImagem({ imagem, alt, larguraTexto = 60, larguraImagem = 100 - larguraTexto, centralizar, children }: PropsTextoComImagem) {
  const { width, height } = dimensoesImagem(imagem);
  return (
    <div className={`flex flex-col gap-5 p-[10px] md:flex-row md:items-center ${centralizar ? "md:justify-center" : ""}`}>
      <div className="w-full md:w-[var(--lt)] md:max-w-[var(--lt)]" style={{ ["--lt" as string]: `${larguraTexto}%` }}>
        {children}
      </div>
      <div className="w-full md:w-[var(--li)] md:max-w-[var(--li)]" style={{ ["--li" as string]: `${larguraImagem}%` }}>
        {/* Tamanho natural, limitado à coluna (a imagem não é esticada). */}
        <Image src={imagem} alt={alt} width={width} height={height} sizes={`(max-width: 767px) 100vw, ${Math.round(11.4 * larguraImagem)}px`} className="mx-auto block h-auto max-w-full" />
      </div>
    </div>
  );
}
