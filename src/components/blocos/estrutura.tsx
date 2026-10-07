// Blocos de estrutura reutilizados por todas as famílias de página.
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import type { ReactNode } from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import { FormularioContato } from "./FormularioContato";
import { lerBloco, type ItemBreadcrumb } from "@/lib/conteudo";
import { dimensoesImagem, versaoWebp } from "@/lib/imagens";

type PropsSecao = {
  children: ReactNode;
  /** padrao (textura sobre o fundo creme claro), creme (faixa #FFEEC2) ou branco. */
  fundo?: "padrao" | "creme" | "branco";
  /** Espaçamento vertical interno. */
  espaco?: "nenhum" | "pequeno" | "medio" | "grande";
  /** Conteúdo ocupa a largura do container (1140px) ou a tela inteira. */
  largura?: "container" | "tela";
  id?: string;
  className?: string;
};

const espacos = {
  nenhum: "",
  pequeno: "py-4",
  medio: "py-8",
  grande: "py-16",
};

const fundos = {
  padrao: "fundo-ruido",
  creme: "bg-creme fundo-ruido",
  branco: "bg-white fundo-ruido",
};

/** Faixa horizontal do site: textura de fundo + conteúdo centralizado em 1140px. */
export function Secao({ children, fundo = "padrao", espaco = "pequeno", largura = "container", id, className = "" }: PropsSecao) {
  return (
    <section id={id} className={`${fundos[fundo]} ${espacos[espaco]} ${className}`}>
      {largura === "container" ? <div className="container-site">{children}</div> : children}
    </section>
  );
}

type PropsCapa = {
  trilha: ItemBreadcrumb[];
  /** Imagem de fundo da capa (já com o recorte de "pasta" desenhado na imagem). */
  imagem?: string;
  /** Imagem de fundo usada no celular, quando diferente. */
  imagemMobile?: string;
  /** Imagem de fundo do tablet, quando diferente da do celular. */
  imagemTablet?: string;
  titulo: ReactNode;
  /** Tamanho do título em em (relativo a 16px). */
  tamanhoTitulo?: number;
  /** Peso do título. */
  pesoTitulo?: 400 | 500 | 600 | 700;
  /** Ajustes do título por dispositivo (campo `capaTitulo` do cabeçalho). */
  estiloTitulo?: EstiloTituloCapa;
  semBreadcrumb?: boolean;
  /** Conteúdo extra abaixo da capa, dentro da mesma faixa. */
  children?: ReactNode;
};

/**
 * Topo das páginas internas: breadcrumbs + faixa com imagem de fundo e título em branco.
 * Sem imagem, vira só o título (como nos cases, em que a capa é o próprio cartão do case).
 */
export type EstiloTituloCapa = {
  /** Entrelinha: 1 (título do Elementor, padrão) ou 1.5 (título feito com editor de texto). */
  entrelinha?: number;
  /** Tamanho no tablet, em em (padrão: o do desktop). */
  tamanhoTablet?: number;
  /** Tamanho no celular, em em (padrão 1.4). */
  tamanhoMobile?: number;
  /** Margem acima do título no desktop (ex.: "6em", "10%"). Padrão 6em. */
  margemTopo?: string;
  /** Margem à esquerda no desktop (ex.: "2em", "2%"). Padrão 2em. */
  margemEsquerda?: string;
  /** Largura do título no desktop (ex.: "90%"). Padrão 90%. */
  largura?: string;
  /** Alinhamento no celular. Padrão: esquerda. */
  alinharMobile?: "esquerda" | "centro";
  /** Título em itálico (em todos os tamanhos de tela). */
  italico?: boolean;
};

export function Capa({ trilha, imagem, imagemMobile, imagemTablet, titulo, tamanhoTitulo = 2.4, pesoTitulo = 500, estiloTitulo = {}, semBreadcrumb, children }: PropsCapa) {
  const fundo = imagem ? versaoWebp(imagem) : undefined;
  const fundoMobile = imagemMobile ? versaoWebp(imagemMobile) : fundo;
  const fundoTablet = imagemTablet ? versaoWebp(imagemTablet) : fundoMobile;
  const e = estiloTitulo;
  const variaveis = {
    "--tam": `${tamanhoTitulo}em`,
    "--tam-t": `${e.tamanhoTablet ?? tamanhoTitulo}em`,
    "--tam-m": `${e.tamanhoMobile ?? 1.4}em`,
    "--lh": String(e.entrelinha ?? 1),
    "--mt": e.margemTopo ?? "6em",
    "--ml": e.margemEsquerda ?? "2em",
    "--lw": e.largura ?? "90%",
  } as React.CSSProperties;
  return (
    <section className="fundo-ruido pt-24 pb-8 lg:pt-40">
      <div className="lg:container-site">
        {!semBreadcrumb && <Breadcrumbs itens={trilha} />}
        {fundo ? (
          <div
            className="mt-5 flex min-h-[10em] flex-col justify-center bg-[image:var(--capa-m)] bg-cover bg-[position:center_left] bg-no-repeat px-4 pt-4 md:min-h-[4em] md:bg-[image:var(--capa-t)] md:px-8 md:pt-8 md:pb-4 lg:min-h-[22em] lg:justify-start lg:bg-[image:var(--capa)] lg:bg-contain lg:bg-[position:0_0] lg:p-[10px]"
            style={{ ["--capa" as string]: `url("${fundo}")`, ["--capa-m" as string]: `url("${fundoMobile}")`, ["--capa-t" as string]: `url("${fundoTablet}")` }}
          >
            <h1
              className={`w-full text-[length:var(--tam-m)] leading-[var(--lh)] text-white md:mb-4 md:text-center md:text-[length:var(--tam-t)] lg:mt-[var(--mt)] lg:mb-0 lg:ml-[var(--ml)] lg:w-[var(--lw)] lg:text-left lg:text-[length:var(--tam)] ${
                e.alinharMobile === "centro" ? "max-md:text-center" : ""
              } ${e.italico ? "italic" : ""}`}
              style={{ ...variaveis, fontWeight: pesoTitulo }}
            >
              {titulo}
            </h1>
          </div>
        ) : (
          <h1 className="mt-5 px-4 text-[2em] leading-[1.2] text-azul lg:px-0" style={{ fontWeight: pesoTitulo }}>
            {titulo}
          </h1>
        )}
        {children}
      </div>
    </section>
  );
}

/** Faixa branca de cantos arredondados que "abre" o rodapé no fim de cada página. */
export function TopoRodape() {
  return (
    <div className="fundo-ruido pt-12 lg:pt-8">
      <div className="h-8 rounded-t-[64px] bg-white fundo-ruido lg:container-site lg:h-12" />
    </div>
  );
}

const iconesCompartilhar = [
  { src: "/wp-content/uploads/2025/09/Group-318.png", alt: "Instagram", href: "https://www.instagram.com/ivory_it/" },
  { src: "/wp-content/uploads/2025/09/Group-317.png", alt: "LinkedIn", href: "https://br.linkedin.com/company/ivoryit" },
  { src: "/wp-content/uploads/2025/09/Group-316.png", alt: "Facebook", href: "https://www.facebook.com/ivoryit" },
  { src: "/wp-content/uploads/2025/09/Group-315.png", alt: "X" },
];

/** Barra "COMPARTILHE" do fim dos artigos. */
export function Compartilhe() {
  return (
    <section className="fundo-ruido py-8">
      <div className="container-site flex items-center gap-5">
        <p className="text-base leading-6 font-bold text-corpo italic">COMPARTILHE</p>
        {iconesCompartilhar.map((i) => {
          const img = <Image key={i.src} src={i.src} alt={i.alt} width={32} height={32} />;
          return i.href ? (
            <a key={i.src} href={i.href} target="_blank" rel="noopener noreferrer" aria-label={i.alt}>
              {img}
            </a>
          ) : (
            img
          );
        })}
      </div>
    </section>
  );
}

export type ItemInsight = { caminho: string; imagem: string; imagemAlt?: string; rotulo?: string; titulo: string };

/** Faixa creme "Insights recentes" com quatro cartões e o botão "Veja todos". */
export function InsightsRecentes({ itens }: { itens: ItemInsight[] }) {
  return (
    <section className="bg-creme fundo-ruido py-8">
      <div className="container-site max-md:px-[22px]">
        {/* No celular o cabeçalho empilha: título centralizado, linha embaixo, botão centralizado. */}
        <div className="flex flex-col items-center md:flex-row">
          <p className="shrink-0 text-[19px] leading-7 font-bold text-texto italic">Insights recentes</p>
          <span aria-hidden className="mt-0.5 h-0.5 w-full bg-corpo md:mx-4 md:mt-0 md:w-auto md:flex-1" />
          <Link href="/blog/" className="botao mt-4 shrink-0 px-6 py-3 text-base leading-4 md:mt-0">
            Veja todos &gt;
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-4">
          {itens.map((item) => (
            <Link
              key={item.caminho}
              href={item.caminho}
              className="block rounded-2xl border-2 border-white bg-white/44 p-4 transition-colors hover:bg-white/70"
            >
              <Image
                src={item.imagem}
                alt={item.imagemAlt ?? ""}
                {...dimensoesImagem(item.imagem)}
                sizes="(max-width: 767px) 90vw, 270px"
                className="mb-4 h-auto w-full rounded-2xl"
              />
              {item.rotulo && <p className="text-xs leading-[1.6] text-corpo">{item.rotulo}</p>}
              <p className="mt-[7px] text-sm leading-[1.1] font-bold text-azul italic">{item.titulo}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Faixa final com o formulário de contato (antigos templates "Formulário de contato" e
 * "Formulário de contato (sem área)"). Emenda no rodapé com os cantos superiores arredondados.
 */
export async function BlocoContato({ variante = "com-area", titulo }: { variante?: "com-area" | "sem-area"; titulo?: string }) {
  const fotos = (await lerBloco<string[]>("fotos-formulario")).map((src) => ({ src, ...dimensoesImagem(src) }));
  return (
    <section className="fundo-ruido pt-12">
      <div className="rounded-t-[64px] bg-white fundo-ruido px-4 pt-8 pb-4 md:px-16 md:pt-12 lg:container-site lg:pt-16">
        <FormularioContato variante={variante} titulo={titulo} fotos={fotos} />
        {/* 20px de espaçamento do container + 16px de margem, como no template do WordPress. */}
        <div className="mx-auto mt-9 h-0.5 w-full bg-linha/25 md:w-[70%]" />
      </div>
    </section>
  );
}
