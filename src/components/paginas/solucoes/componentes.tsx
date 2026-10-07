// Componentes exclusivos do hub /solucoes/ (família "pagina"). Os nomes levam "Solucoes" porque o
// registro da família "pagina" é compartilhado entre todas as páginas únicas.
import Image from "next/image";
import type { ReactNode } from "react";
import { CapaSolucao } from "@/components/familias/solucao/CapaSolucao";
import { ehPublica, listarPorFamilia, obterPagina, trilha } from "@/lib/conteudo";
import { dimensoesImagem, versaoWebp } from "@/lib/imagens";

const num = (v: string | number | undefined, padrao: number) => (v === undefined || v === "" ? padrao : Number(v));

type PropsCapaSolucoes = {
  titulo: string;
  /** Imagem do desktop (com o recorte de "pasta"). */
  imagem: string;
  /** Imagem do tablet e do celular. */
  imagemMobile?: string;
  /** Tamanho do título no desktop, em em (padrão 2.4). */
  tamanho?: string | number;
  /** Distância do título ao topo da imagem no desktop, em % da largura (padrão 9). */
  margemTopo?: string | number;
  /** Página dona da capa, para montar o breadcrumb (padrão: o próprio hub). */
  caminho?: string;
};

/** Capa do hub (mesmo desenho da capa das páginas de solução). Use com `semCapa: true` no cabeçalho. */
export async function CapaSolucoes({ titulo, imagem, imagemMobile, tamanho, margemTopo, caminho = "/solucoes/" }: PropsCapaSolucoes) {
  const pagina = await obterPagina(caminho.split("/").filter(Boolean));
  const itens = pagina ? await trilha(pagina) : [{ nome: "Início", caminho: "/" }];
  return <CapaSolucao trilha={itens} imagem={imagem} imagemMobile={imagemMobile} frase={titulo} tamanho={num(tamanho, 2.4)} margemTopo={num(margemTopo, 9)} />;
}

/** Texto de abertura do hub, em letra grande (1.4em; 1em no celular). */
export function TextoSolucoes({ children }: { children: ReactNode }) {
  return (
    <section className="fundo-ruido max-md:px-4 max-md:py-8">
      <div className="text-[1.4em] leading-[1.5] text-corpo max-md:text-base md:container-site md:py-[10px] [&_p]:mb-[0.9rem] [&_strong]:font-bold">{children}</div>
    </section>
  );
}

type PropsQuadroSolucoes = {
  /** Imagem de fundo de todos os cartões. */
  fundo: string;
  /** Abre as soluções em nova aba (como no site antigo). */
  novaAba?: boolean;
};

/**
 * Quadro com um cartão por página de solução (3 por linha), montado a partir do cabeçalho de cada
 * página da família "solucao" (`cartao.titulo`, `cartao.icone`, `cartao.ordem`). Solução nova
 * aparece aqui sozinha; páginas ocultas ficam de fora.
 */
export async function QuadroSolucoes({ fundo, novaAba }: PropsQuadroSolucoes) {
  const solucoes = (await listarPorFamilia("solucao"))
    .filter(ehPublica)
    .map((p) => ({ caminho: p.caminho, ...p.dados.cartao }))
    .sort((a, b) => (a.ordem ?? Infinity) - (b.ordem ?? Infinity) || a.titulo.localeCompare(b.titulo, "pt-BR"));
  const linhas: (typeof solucoes)[] = [];
  for (let i = 0; i < solucoes.length; i += 3) linhas.push(solucoes.slice(i, i + 3));
  const alvo = novaAba ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <section className="fundo-ruido py-8">
      <div className="flex flex-col gap-5 p-[10px] lg:container-site">
        {linhas.map((linha) => (
          <div key={linha[0].caminho} className="flex flex-col gap-5 md:flex-row">
            {linha.map((s) => {
              const { width, height } = dimensoesImagem(s.icone);
              return (
                <a
                  key={s.caminho}
                  href={s.caminho}
                  {...alvo}
                  className="flex min-h-[12em] flex-col justify-end rounded-2xl bg-[image:var(--fundo)] bg-cover bg-no-repeat p-4 text-corpo md:flex-[0_1_33%]"
                  style={{ ["--fundo" as string]: `url("${versaoWebp(fundo)}")` }}
                >
                  <span className="block font-sistema leading-6">
                    <Image src={s.icone} alt="" width={width} height={height} sizes="32px" className="inline-block h-auto w-8 align-middle" />
                  </span>
                  <span className="block pb-[0.9rem] font-sistema leading-6 italic">{s.titulo}</span>
                </a>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

type PropsBannerSolucoes = {
  href: string;
  /** Imagem do banner no tablet e no desktop (o botão já vem desenhado nela). */
  imagem: string;
  /** Fundo no celular (sem o botão desenhado; o botão vira um link de verdade). */
  imagemMobile: string;
  /** Texto do botão do celular. */
  botao: string;
  novaAba?: boolean;
  /** Título (`## ...`) e frase em Markdown, em branco sobre a imagem. */
  children: ReactNode;
};

/**
 * Banner de produto do hub. No tablet/desktop é a imagem inteira clicável com o texto por cima; no
 * celular, o texto sobre o fundo e um botão de contorno branco. A margem inferior negativa no
 * tablet/desktop compensa o respiro do formulário que vem depois (no WordPress ele encosta no banner).
 */
export function BannerSolucoes({ href, imagem, imagemMobile, botao, novaAba, children }: PropsBannerSolucoes) {
  const { width, height } = dimensoesImagem(imagem);
  const alvo = novaAba ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <section
      className="fundo-ruido max-md:bg-[image:var(--fundo-m)] max-md:bg-cover max-md:bg-no-repeat max-md:py-8 md:-mb-4 md:pt-8"
      style={{ ["--fundo-m" as string]: `url("${versaoWebp(imagemMobile)}")` }}
    >
      <div className="lg:container-site">
        <a href={href} {...alvo} className="relative block text-white max-md:p-[10px]">
          <div className="flex flex-col gap-5 max-md:text-center md:absolute md:top-0 md:left-0 md:z-[3] md:mt-24 md:ml-8 md:w-[28em] [&_h2]:text-[1.8em] [&_h2]:leading-none [&_h2]:font-medium [&_h2]:italic md:[&_h2]:text-[2.3em] [&_p]:mb-[0.9rem] [&_p]:text-[1.2em] [&_p]:leading-[1.5] md:[&_p]:text-[1.4em] [&_strong]:font-bold">
            {children}
          </div>
          <Image src={imagem} alt="" width={width} height={height} sizes="(max-width: 1160px) 100vw, 1140px" className="h-auto w-full max-md:hidden" />
        </a>
        <div className="mt-5 flex justify-center md:hidden">
          <a href={href} {...alvo} className="inline-flex rounded-[18px] border-[3px] border-white px-6 py-3 text-[1.1em] leading-none text-white italic">
            {botao}
          </a>
        </div>
      </div>
    </section>
  );
}
