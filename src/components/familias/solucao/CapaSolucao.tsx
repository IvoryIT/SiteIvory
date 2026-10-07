// Capa das páginas de solução (e do hub /solucoes/): breadcrumbs + faixa com imagem de fundo e a
// frase da página. Reproduz a capa do Elementor dessas páginas, que difere da `Capa` comum em três
// pontos: a frase pode ser escura (sobre imagem clara), tem largura própria no desktop e, no tablet,
// fica em 1.6em (a `Capa` comum mantém o tamanho do desktop).
import { Breadcrumbs } from "@/components/blocos/Breadcrumbs";
import type { ItemBreadcrumb } from "@/lib/conteudo";
import { versaoWebp } from "@/lib/imagens";

export type PropsCapaSolucao = {
  trilha: ItemBreadcrumb[];
  /** Imagem do desktop (já com o recorte de "pasta" desenhado). */
  imagem: string;
  /** Imagem do celular (retangular). Padrão: a do desktop. */
  imagemMobile?: string;
  /** Imagem do tablet. Padrão: a do celular. */
  imagemTablet?: string;
  /** Recorte da imagem no tablet/celular. */
  posicao?: "centro" | "topo";
  /** Frase (H1). Cada linha vira um parágrafo. */
  frase: string;
  cor?: "clara" | "escura";
  /** Largura da frase no desktop, em % (padrão 90). */
  largura?: number;
  /** Tamanho da frase no desktop, em em (padrão 2). */
  tamanho?: number;
  /** Distância da frase ao topo da imagem no desktop, em % da largura (padrão 7). */
  margemTopo?: number;
};

export function CapaSolucao({ trilha, imagem, imagemMobile, imagemTablet, posicao = "centro", frase, cor = "clara", largura = 90, tamanho = 2, margemTopo = 7 }: PropsCapaSolucao) {
  const desktop = versaoWebp(imagem);
  const mobile = imagemMobile ? versaoWebp(imagemMobile) : desktop;
  const tablet = imagemTablet ? versaoWebp(imagemTablet) : mobile;
  const linhas = frase.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return (
    <section className="fundo-ruido pt-24 pb-8 lg:pt-40">
      <div className="lg:container-site">
        <Breadcrumbs itens={trilha} />
        <div
          className="mt-5 flex min-h-[10em] flex-col justify-center bg-[image:var(--capa-m)] bg-cover bg-[position:var(--pos)] bg-no-repeat px-4 pt-4 md:min-h-[4em] md:bg-[image:var(--capa-t)] md:px-8 md:pt-8 md:pb-4 lg:min-h-[22em] lg:justify-start lg:bg-[image:var(--capa)] lg:bg-contain lg:bg-[position:0_0] lg:p-[10px]"
          style={{
            ["--capa" as string]: `url("${desktop}")`,
            ["--capa-t" as string]: `url("${tablet}")`,
            ["--capa-m" as string]: `url("${mobile}")`,
            ["--pos" as string]: posicao === "topo" ? "0 0" : "center left",
          }}
        >
          <h1
            className={`text-center text-[1.4em] leading-[1.5] font-medium md:text-[1.6em] lg:mt-[var(--mt)] lg:ml-[2%] lg:w-[var(--largura)] lg:text-left lg:text-[length:var(--tamanho)] ${cor === "clara" ? "text-white" : "text-texto"}`}
            style={{ ["--tamanho" as string]: `${tamanho}em`, ["--largura" as string]: `${largura}%`, ["--mt" as string]: `${margemTopo}%` }}
          >
            {linhas.map((l, i) => (
              <span key={i} className="mb-[0.9rem] block">
                {l}
              </span>
            ))}
          </h1>
        </div>
      </div>
    </section>
  );
}
