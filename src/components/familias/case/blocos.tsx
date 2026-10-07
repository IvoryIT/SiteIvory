// Blocos de conteúdo dos cases e dos hubs de setor (as duas famílias usam os mesmos blocos e os
// mesmos nomes no MDX). Reproduzem as estruturas do Elementor medidas no WordPress: faixas de
// 1140px com textura, blocos com título em itálico azul, texto + imagem, cartões de destaque,
// lista com bordas, depoimento, letreiro e o botão de chamada.
//
// Nos hubs (família "setor") alguns blocos têm outro visual no WordPress (cartões translúcidos,
// títulos menores, botão dentro da faixa). O molde do setor registra versões com `estilo="hub"`
// (ver src/components/familias/setor/mdx.ts); no MDX os nomes e as props são os mesmos.
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { LinkInteligente } from "@/components/conteudo/basicos";
import { dimensoesImagem, versaoWebp } from "@/lib/imagens";

export type Estilo = "case" | "hub";

const variavel = (nome: string, valor: string) => ({ [nome]: valor }) as CSSProperties;

/*
 * Os moldes (ModeloCase e ModeloSetor) envolvem a página num elemento `group/caso` com
 * data-centralizar quando títulos e textos ficam centralizados no celular.
 */
const CENTRALIZA = "max-md:group-data-[centralizar]/caso:text-center";

/** Texto corrido (editor de texto do Elementor): 1em no celular, 1.1em do tablet em diante. */
const TEXTO =
  "flex flex-col text-base leading-normal [&>p:first-child]:mt-[1em] md:text-[1.1rem] [&>p]:mb-[0.9rem] [&>ul]:mb-[0.9rem] [&>ul]:list-disc [&>ul]:pl-10 [&>ol]:mb-[0.9rem] [&>ol]:list-decimal [&>ol]:pl-10 [&_strong]:font-bold [&_em]:italic [&_a]:text-azul [&_a]:underline [&>h3]:mt-6 [&>h3]:mb-[0.9rem] [&>h3]:text-[1.4rem] [&>h3]:leading-normal [&>h3]:font-bold [&>h3]:text-azul [&>h3]:italic";

/** Espaço entre blocos de uma faixa: 3em (2em no celular) + o `espacoAcima`; o primeiro só o `espacoAcima`. */
function classeEspaco(junto?: boolean) {
  return junto
    ? "mt-(--acima-m) md:mt-(--acima)"
    : "mt-[calc(2rem+var(--acima-m))] first:mt-(--acima-m) md:mt-[calc(3rem+var(--acima))] md:first:mt-(--acima)";
}

/** Variáveis do espaço acima (tablet/desktop e celular). */
function varsEspaco(acima: number, acimaCelular?: number) {
  return { ["--acima" as string]: `${acima}px`, ["--acima-m" as string]: `${acimaCelular ?? acima}px` } as CSSProperties;
}

/* ------------------------------------------------------------------------------- Faixa */

type PropsFaixa = {
  children: ReactNode;
  /** "padrao" (textura sobre o fundo claro) ou "creme" (faixa amarelada #FFEEC2). */
  fundo?: "padrao" | "creme";
  /** Conteúdo dentro de um painel branco translúcido com os cantos de baixo arredondados. */
  painel?: boolean;
  /** Âncora da faixa (ex.: "vale" -> /cases-de-sucesso-ivory/cases-mineracao/#vale). */
  id?: string;
  /**
   * Espaço vertical no desktop: "normal" (4em em cima e embaixo), "medio" (4em em cima, 3em
   * embaixo), "amplo" (5em em cima, 3em embaixo) ou "colado" (1em em cima, 3em embaixo; cases
   * seguidos nos hubs).
   */
  espaco?: "normal" | "medio" | "amplo" | "colado";
};

/** Faixa horizontal de largura total; o conteúdo fica em 1140px. Agrupa <Bloco>s. */
export function Faixa({ children, fundo = "padrao", painel, id, espaco = "normal" }: PropsFaixa) {
  if (painel) {
    return (
      <section id={id} className="fundo-ruido md:px-4 md:pt-4 md:pb-8 lg:p-0">
        <div className="fundo-ruido mx-auto flex flex-col rounded-b-[3em] bg-white/79 p-4 md:p-8 lg:max-w-[1140px]">{children}</div>
      </section>
    );
  }
  const topo = { normal: "lg:py-16", medio: "lg:pt-16 lg:pb-12", amplo: "lg:pt-20 lg:pb-12", colado: "lg:pt-4 lg:pb-12" }[espaco];
  return (
    <section id={id} className={`${fundo === "creme" ? "bg-creme" : ""} fundo-ruido px-4 pt-12 md:pt-4 md:pb-8 lg:px-0 ${topo}`}>
      <div className="mx-auto flex flex-col lg:max-w-[1140px]">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------------------- Bloco */

type PropsBloco = {
  /** Título do bloco (ex.: "O desafio"). */
  titulo?: string;
  /** Linha cinza abaixo do bloco. */
  divisor?: boolean;
  /** Espaço abaixo do conteúdo, antes da linha: "nenhum", "pequeno" (1em) ou "grande" (2em). Padrão: grande com divisor, nenhum sem. */
  respiro?: "nenhum" | "pequeno" | "grande";
  /** Cola no bloco anterior: sem o espaço normal entre blocos (3em; 2em no celular), só o `espacoAcima`. */
  junto?: boolean;
  /** Espaço extra acima do bloco, em px (padrão 0; 30 quando `junto`). */
  espacoAcima?: number;
  /** Espaço extra acima no celular, em px, quando diferente do `espacoAcima`. */
  espacoAcimaCelular?: number;
  /** Imagem à direita do bloco (cantos arredondados); no celular fica abaixo do texto. */
  imagem?: string;
  /** Texto alternativo da imagem. */
  alt?: string;
  children?: ReactNode;
  /** Uso interno: definido pelo molde da família (não usar no MDX). */
  estilo?: Estilo;
};

/** Bloco de conteúdo dentro de uma <Faixa>: título opcional + texto em Markdown e componentes. */
export function Bloco({ titulo, divisor, respiro, junto, espacoAcima, espacoAcimaCelular, imagem, alt = "", children, estilo = "case" }: PropsBloco) {
  const r = respiro ?? (divisor ? "grande" : "nenhum");
  const pb = { nenhum: "", pequeno: "md:pb-4", grande: "md:pb-8" }[r];
  const tituloClasse =
    estilo === "hub"
      ? "mb-[0.9rem] text-[1.4rem] leading-[33.6px] font-bold"
      : "mt-2 mb-4 text-[1.75rem] leading-[33.6px] font-medium";
  const conteudo = (
    <>
      {titulo && <h2 className={`${tituloClasse} text-azul italic ${CENTRALIZA}`}>{titulo}</h2>}
      {/* Nos hubs, no celular, os parágrafos não têm espaço entre si (como na maioria dos textos do WordPress). */}
      <div className={`${TEXTO} ${CENTRALIZA} ${estilo === "hub" ? "max-md:[&>p]:mb-0" : ""}`}>{children}</div>
    </>
  );
  const dims = imagem ? dimensoesImagem(imagem) : undefined;
  return (
    <div
      className={`flex text-corpo ${imagem ? "flex-col md:flex-row" : "flex-col"} ${classeEspaco(junto)} ${pb} ${divisor ? "border-b border-linha" : ""}`}
      style={varsEspaco(espacoAcima ?? (junto ? 30 : 0), espacoAcimaCelular)}
    >
      {imagem && dims ? (
        <>
          <div className="flex w-full flex-col justify-center md:pr-8">{conteudo}</div>
          <div className="flex w-full flex-col items-center md:items-end">
            <Image src={imagem} alt={alt} width={dims.width} height={dims.height} sizes="(max-width: 767px) 100vw, 560px" className="h-auto max-w-full rounded-[2rem]" />
          </div>
        </>
      ) : (
        conteudo
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------ TextoImagem */

type PropsTextoImagem = {
  /** Imagem ao lado do texto (sem ela, o texto ocupa a largura toda). */
  imagem?: string;
  /** Texto alternativo: descreva a imagem. */
  alt?: string;
  /** Lado da imagem no desktop. No tablet e no celular ela fica abaixo do texto. */
  lado?: "direita" | "esquerda";
  /** Tamanho do texto no tablet e no desktop, em em (padrão 1.2; no celular é sempre 1). */
  tamanho?: number;
  children: ReactNode;
};

/** Texto em destaque (40% da largura) com uma imagem ao lado. */
export function TextoImagem({ imagem, alt = "", lado = "direita", tamanho = 1.2, children }: PropsTextoImagem) {
  const dims = imagem ? dimensoesImagem(imagem) : undefined;
  return (
    <div className={`flex flex-col lg:flex-row lg:gap-5 ${lado === "esquerda" ? "lg:flex-row-reverse lg:justify-end" : ""}`}>
      <div
        className={`mt-[1em] text-base leading-normal md:text-[length:var(--tamanho)] [&_em]:italic [&_p]:mb-[0.9rem] [&_strong]:font-bold ${CENTRALIZA} ${imagem ? "lg:w-2/5 lg:shrink-0 lg:self-center" : "w-full"}`}
        style={variavel("--tamanho", `${tamanho}rem`)}
      >
        {children}
      </div>
      {imagem && dims && (
        <div className="flex justify-center lg:block lg:min-w-0">
          <Image src={imagem} alt={alt} width={dims.width} height={dims.height} sizes={`(max-width: 767px) 100vw, ${dims.width}px`} className="h-auto max-w-full" />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------- Destaques */

type PropsDestaques = {
  /** Tamanho do texto dos cartões, em em (padrão 1.1 nos cases e 1 nos hubs). */
  tamanho?: number;
  /** Espaço em volta da linha de cartões: "normal" (padrão) ou "nenhum". */
  espaco?: "normal" | "nenhum";
  /** Imagem ao lado dos cartões (os cartões ficam dois a dois na outra metade). */
  imagem?: string;
  /** Texto alternativo da imagem. */
  alt?: string;
  /** Cartões <Destaque> desta linha. Várias linhas = vários <Destaques> seguidos. */
  children: ReactNode;
  estilo?: Estilo;
};

/** Linha de cartões de destaque (números, entregas, benefícios). No celular, um embaixo do outro. */
export function Destaques({ tamanho, espaco = "normal", imagem, alt = "", children, estilo = "case" }: PropsDestaques) {
  const t = tamanho ?? (estilo === "hub" ? 1 : 1.1);
  if (imagem) {
    const dims = dimensoesImagem(imagem);
    return (
      <div className="flex flex-col gap-4 lg:flex-row" style={variavel("--tamanho", `${t}rem`)}>
        <div className={`flex w-full flex-col gap-4 md:flex-row md:flex-wrap md:[&>*]:w-[calc(50%-0.5rem)] ${espaco === "nenhum" ? "" : "py-4"}`}>{children}</div>
        <div className="flex w-full flex-col justify-center p-2.5">
          <Image src={imagem} alt={alt} width={dims.width} height={dims.height} sizes="(max-width: 767px) 100vw, 550px" className="h-auto max-w-full max-lg:mr-auto lg:mx-auto" />
        </div>
      </div>
    );
  }
  const classe =
    estilo === "hub"
      ? `flex flex-col gap-4 ${espaco === "nenhum" ? "" : "py-4"} md:flex-row md:flex-wrap md:[&>*]:w-[48%] lg:flex-nowrap lg:[&>*]:w-full [&+&]:-mt-4 [&+p]:mt-[1em]`
      : `flex flex-col gap-5 md:flex-row ${espaco === "nenhum" ? "" : "mt-4 mb-8 [&+&]:-mt-3"}`;
  return (
    <div className={classe} style={variavel("--tamanho", `${t}rem`)}>
      {children}
    </div>
  );
}

type PropsDestaque = {
  /** Cartão azul com texto branco (padrão: cartão claro com borda branca e texto azul). */
  escuro?: boolean;
  /** No cartão claro, o texto fora do **negrito** sai em cinza-escuro em vez de azul. */
  textoEscuro?: boolean;
  /** Imagem decorativa de fundo do cartão (degradê suave), vista através do branco translúcido. Usada nos hubs. */
  fundo?: string;
  /** Texto do cartão. Um título opcional vai como "### Título" na primeira linha. */
  children: ReactNode;
  estilo?: Estilo;
};

export function Destaque({ escuro, textoEscuro, fundo, children, estilo = "case" }: PropsDestaque) {
  if (estilo === "hub") {
    const texto = "text-center text-[length:var(--tamanho)] leading-normal text-corpo [&_em]:italic [&_strong]:font-bold";
    if (fundo) {
      return (
        <div
          className="flex w-full overflow-hidden rounded-[2rem] border-2 border-white bg-white/44 bg-(image:--fundo) bg-[position:center_left] bg-no-repeat"
          style={variavel("--fundo", `url("${versaoWebp(fundo)}")`)}
        >
          {/* No tablet o WordPress aplica 48% também à camada interna: o texto ocupa metade do cartão. */}
          <div className={`fundo-ruido flex min-h-32 w-full flex-col justify-center bg-white/44 px-4 py-8 md:max-lg:w-[48%] ${texto}`}>{children}</div>
        </div>
      );
    }
    return <div className={`flex w-full flex-col justify-center rounded-[2rem] border-2 border-white bg-white/44 px-4 py-8 ${texto}`}>{children}</div>;
  }
  const cor = escuro ? "bg-azul text-white" : `border-2 border-white bg-white/33 text-azul ${textoEscuro ? "[&_p]:text-texto [&_strong]:text-azul" : ""}`;
  return (
    <div
      className={`flex w-full flex-col justify-center rounded-[1.4rem] p-4 text-center text-[length:var(--tamanho)] leading-[23px] font-medium italic [&_h3]:mb-1 [&_h3]:text-2xl [&_h3]:leading-[23px] [&_h3]:font-bold [&_h3+p]:text-[0.9rem] [&_h3+p]:leading-5 [&_strong]:font-bold ${cor}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------------------ Lista */

type PropsLista = {
  /** Imagem na coluna ao lado da lista. */
  imagem?: string;
  alt?: string;
  /** Lado da imagem (no celular a ordem é mantida: esquerda = imagem antes da lista). */
  lado?: "direita" | "esquerda";
  /** Tamanho do texto dos itens, em em (padrão 0.9). */
  tamanho?: number;
  /** Itens <Item>. */
  children: ReactNode;
};

/** Lista de itens com borda azul, com uma imagem ao lado. */
export function Lista({ imagem, alt = "", lado = "direita", tamanho = 0.9, children }: PropsLista) {
  const dims = imagem ? dimensoesImagem(imagem) : undefined;
  const coluna = imagem && dims && (
    <div className="flex w-full flex-col justify-center p-2.5 text-center">
      <Image src={imagem} alt={alt} width={dims.width} height={dims.height} sizes="(max-width: 767px) 100vw, 550px" className="mx-auto h-auto max-w-full" />
    </div>
  );
  return (
    <div className="flex flex-col gap-1.5 md:flex-row">
      {lado === "esquerda" && coluna}
      <div className="flex w-full flex-col justify-center gap-3.5 p-2.5" style={variavel("--tamanho", `${tamanho}rem`)}>
        {children}
      </div>
      {lado === "direita" && coluna}
    </div>
  );
}

type PropsItem = {
  /** Número exibido num quadrado azul à esquerda do texto (lista numerada). */
  numero?: string | number;
  children: ReactNode;
};

export function Item({ numero, children }: PropsItem) {
  return (
    <div className="flex overflow-hidden rounded-[0.8rem] border border-azul transition-colors hover:bg-white max-md:flex-wrap">
      {numero !== undefined && (
        <div className="flex w-[10%] shrink-0 items-center justify-center rounded-[0.8rem] bg-azul text-[2.2rem] leading-normal text-white max-md:w-full">{numero}</div>
      )}
      <div className="w-full p-[1.2rem] text-[length:var(--tamanho)] leading-normal [&_em]:italic [&_strong]:font-bold">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------------- Depoimento */

type PropsDepoimento = {
  /** Nome de quem deu o depoimento. */
  autor: string;
  /** Cargo / empresa. */
  cargo?: string;
  /** O depoimento (texto entre aspas). */
  children: ReactNode;
  estilo?: Estilo;
};

/** Depoimento do cliente em caixa com borda, com o autor embaixo. */
export function Depoimento({ autor, cargo, children, estilo = "case" }: PropsDepoimento) {
  if (estilo === "hub") {
    return (
      <figure className="flex flex-col rounded-[2rem] border-2 border-white bg-white/44 p-8 text-left font-sistema text-base leading-normal text-corpo md:px-16 [&_em]:italic">
        <blockquote className="italic [&_p]:mb-[0.9rem]">{children}</blockquote>
        <figcaption className="mb-[0.9rem] font-medium">
          <em className="font-bold text-azul">{autor}</em>
          {cargo ? <em> | </em> : null}
          {cargo}
        </figcaption>
      </figure>
    );
  }
  return (
    <figure className="mt-[1.2rem] flex items-center rounded-[1.2rem] border border-corpo p-[1.2rem]">
      <div className="w-full text-base leading-normal font-light md:pl-[2.4rem] md:text-[1.2rem]">
        <blockquote>{children}</blockquote>
        <figcaption className="mt-[1.5em] font-bold italic">
          <span className="text-azul">{autor}</span>
          {cargo ? ` | ${cargo}` : ""}
        </figcaption>
      </div>
    </figure>
  );
}

/* ---------------------------------------------------------------------------- Letreiro */

/** Faixa azul com uma frase repetida (some no celular). */
export function Letreiro({ texto = "Case de Sucesso Ivory" }: { texto?: string }) {
  const linha = Array.from({ length: 16 }, () => texto).join(" . ") + " . ";
  return (
    <div aria-hidden className="fundo-ruido hidden min-h-24 items-center justify-center bg-azul md:flex lg:py-4">
      <p className="w-full overflow-x-hidden text-center text-[1.6rem] leading-normal font-medium whitespace-nowrap text-white italic">{linha}</p>
    </div>
  );
}

/* ---------------------------------------------------------------------------- Chamada */

type PropsChamada = {
  /** Destino do botão (ex.: WhatsApp). */
  href: string;
  /** Tamanho do texto no desktop, em em (padrão 1.8 nos cases e 1.4 nos hubs; no tablet 1.6, no celular 1). */
  tamanho?: number;
  /** Espaço acima: "normal" (3em) ou "amplo" (5em). */
  espaco?: "normal" | "amplo";
  children: ReactNode;
  estilo?: Estilo;
};

/** Botão de contorno largo com a frase de chamada (no fim do case; nos hubs, no fim de cada case). */
export function Chamada({ href, tamanho, espaco = "normal", children, estilo = "case" }: PropsChamada) {
  if (estilo === "hub") {
    return (
      <div className="mt-8 flex md:mt-12" style={variavel("--tamanho", `${tamanho ?? 1.4}rem`)}>
        <LinkInteligente href={href} className="botao w-full text-center text-base !leading-none md:text-(length:--tamanho) lg:w-[70%]">
          {children}
        </LinkInteligente>
      </div>
    );
  }
  return (
    <section className={`fundo-ruido px-4 pt-12 md:pt-4 md:pb-8 lg:px-0 lg:pb-12 ${espaco === "amplo" ? "lg:pt-20" : "lg:pt-12"}`}>
      <div className="mx-auto flex lg:max-w-[1140px]" style={variavel("--tamanho", `${tamanho ?? 1.8}rem`)}>
        <LinkInteligente href={href} className="botao w-full text-center text-base !leading-none md:text-[1.6rem] lg:w-[90%] lg:text-(length:--tamanho)">
          {children}
        </LinkInteligente>
      </div>
    </section>
  );
}
