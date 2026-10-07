import type { CSSProperties, ReactNode } from "react";
import { Breadcrumbs } from "@/components/blocos/Breadcrumbs";
import { Final } from "@/components/blocos/Final";
import type { ItemBreadcrumb } from "@/lib/conteudo";
import type { FrontmatterCase } from "@/lib/esquema";
import { dimensoesImagem, versaoWebp } from "@/lib/imagens";
import Image from "next/image";

/** Separa o título do case no trecho em destaque (até o primeiro ":") e no resto. */
export function partesTitulo(titulo: string): [string, string] {
  const i = titulo.indexOf(":");
  if (i < 0) return [titulo, ""];
  return [titulo.slice(0, i + 1), titulo.slice(i + 1).trim()];
}

/** Breadcrumbs + nome do setor ("Cases de Mineração") no topo do case. */
function CabecalhoCase({ trilha, setorTitulo }: { trilha: ItemBreadcrumb[]; setorTitulo: string }) {
  return (
    <section className="fundo-ruido pt-24 pb-8 lg:pt-40">
      <div className="mx-auto lg:max-w-[1140px]">
        <Breadcrumbs itens={trilha} />
        <p className="mt-5 font-hanken text-[2rem] leading-none font-medium text-corpo max-md:text-center">{setorTitulo}</p>
      </div>
    </section>
  );
}

/** Selo branco translúcido com os logos do cliente + Ivory, sobre o canto da capa. */
function Selo({ dados }: { dados: FrontmatterCase }) {
  if (!dados.logo) return null;
  const { width, height } = dimensoesImagem(dados.logo);
  const modo = dados.logoCelular ?? "esquerda";
  const posicao =
    modo === "centro"
      ? "bg-white/67 max-md:left-1/2 max-md:w-48 max-md:-translate-x-1/2 md:left-8"
      : `bg-white/47 left-8 ${modo === "oculto" ? "max-md:hidden" : ""}`;
  const largura = (dados.logoLargura ?? 8.5) * 16;
  return (
    <div className={`absolute -top-8 flex min-h-16 w-40 items-center justify-center rounded-2xl border border-white ${posicao}`}>
      <Image src={dados.logo} alt={dados.logoAlt ?? ""} width={width} height={height} sizes={`${Math.round(largura)}px`} className="h-auto" style={{ width: largura }} />
    </div>
  );
}

/** Capa do case: imagem arredondada com o selo de logos e o título (H1). */
function CapaCase({ dados }: { dados: FrontmatterCase }) {
  const [destaque, resto] = partesTitulo(dados.titulo);
  return (
    <section className="fundo-ruido pt-12 md:px-4 md:pt-4 md:pb-8 lg:px-0 lg:pt-20 lg:pb-12">
      <div className="mx-auto flex flex-col gap-5 pb-8 md:pb-0 lg:max-w-[1140px]">
        <div
          role="img"
          aria-label={dados.imagemAlt ?? ""}
          className="relative min-h-[18rem] bg-[image:var(--capa)] bg-cover bg-[position:center_left] md:rounded-2xl"
          style={{ ["--capa" as string]: `url("${versaoWebp(dados.imagem)}")` } as CSSProperties}
        >
          <Selo dados={dados} />
        </div>
        <h1 className={`max-md:group-data-[centralizar]/caso:text-center px-[1em] text-[1.4rem] leading-normal font-medium text-texto md:px-0 md:text-[2.2rem] lg:text-[2.6rem]`}>
          <strong className="font-bold text-azul italic">{destaque}</strong>
          {resto && ` ${resto}`}
        </h1>
      </div>
    </section>
  );
}

/**
 * Molde dos cases: setor no topo, capa com selo de logos e título, faixas de conteúdo do MDX
 * (<Faixa>, <Bloco>, <Destaques>, <Lista>…), a <Chamada> e o formulário de contato.
 */
export function ModeloCase({ dados, trilha, children }: { dados: FrontmatterCase; trilha: ItemBreadcrumb[]; children: ReactNode }) {
  return (
    <div className="group/caso" data-centralizar={dados.centralizarNoCelular || undefined}>
      <CabecalhoCase trilha={trilha} setorTitulo={dados.setorTitulo} />
      <CapaCase dados={dados} />
      {children}
      <Final tipo={dados.final ?? "contato"} />
    </div>
  );
}
