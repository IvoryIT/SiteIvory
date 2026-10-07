import type { ReactNode } from "react";
import { BotaoIvory } from "@/components/paginas/inicio/BotaoIvory";
import { separarFilhos } from "@/components/paginas/inicio/util";

/** Um cliente (pílula com link) de `<ComoFazemosQualidade>`. Só tem efeito dentro dele. */
export function ComoFazemosCliente(props: { href: string; novaAba?: boolean; children: ReactNode }) {
  void props;
  return null;
}

/** Um pilar de `<ComoFazemosQualidade>`: `### título` e texto em Markdown. Só tem efeito dentro dele. */
export function ComoFazemosPilar(props: { children: ReactNode }) {
  void props;
  return null;
}

type PropsQualidade = {
  /** Etiqueta pequena acima do título. */
  etiqueta?: string;
  /** Frase acima das pílulas de clientes (ex.: "Já entregamos para"). */
  tituloClientes?: string;
  /**
   * Conteúdo: `## título`, parágrafo de apoio, `<ComoFazemosCliente>`s, `<ComoFazemosPilar>`es e, por último, um
   * `<BotaoIvory variante="branco">` que ocupa a última casa da grade de pilares.
   */
  children: ReactNode;
};

/** Bordas da grade de pilares (3 colunas no computador, 1 no tablet e no celular). */
function bordas(i: number, pilares: number, casas: number) {
  const c: string[] = [];
  if (i % 3 < 2) c.push("lg:border-r");
  if (i < Math.ceil(casas / 3) * 3 - 3) c.push("lg:border-b");
  c.push("md:max-lg:border-b");
  // No celular o último pilar não tem fio (como no site antigo).
  if (i < pilares - 1) c.push("max-md:border-b");
  return c.join(" ");
}

/**
 * Bloco azul de cantos bem arredondados: etiqueta, título, texto, clientes em pílulas e a grade
 * de pilares separados por fios brancos, com o botão na última casa.
 */
export function ComoFazemosQualidade({ etiqueta, tituloClientes, children }: PropsQualidade) {
  const { clientes, pilares, botoes, resto } = separarFilhos(children, { clientes: ComoFazemosCliente, pilares: ComoFazemosPilar, botoes: BotaoIvory });
  return (
    <section className="fundo-ruido pb-8 md:max-lg:px-4 md:max-lg:pt-4 max-md:pt-4">
      <div className="mx-auto max-w-[1140px] rounded-[64px] bg-azul p-12 text-white max-md:rounded-[32px] max-md:p-0 max-md:pb-8">
        <div className="py-4 pr-4 max-md:p-8">
          <div
            className={[
              "flex flex-col",
              "[&_h2]:mb-[14.4px] [&_h2]:text-[38.4px] [&_h2]:leading-[1.2] [&_h2]:font-normal max-md:[&_h2]:text-[25.6px]",
              "[&_h2+p]:mt-[28.8px] [&_h2+p]:mb-[72px] [&_h2+p]:text-[28.8px] [&_h2+p]:leading-[1.2] [&_h2+p]:font-light",
              "max-md:[&_h2+p]:mt-[19.2px] max-md:[&_h2+p]:mb-[52.8px] max-md:[&_h2+p]:text-[19.2px]",
            ].join(" ")}
          >
            {etiqueta && <p className="text-[19.2px] leading-[1.5] font-light italic max-md:text-[12.8px]">{etiqueta}</p>}
            {resto}
          </div>
          {tituloClientes && (
            <p className="relative mb-[14.4px] text-[28.8px] leading-[1.2] font-light before:absolute before:left-0 before:h-[2px] before:w-[6em] before:-translate-y-[1em] before:bg-white before:content-[''] max-md:text-[19.2px]">
              {tituloClientes}
            </p>
          )}
          {clientes.length > 0 && (
            // Numa linha só (as pílulas encolhem um pouco se faltar espaço); no celular quebram linha.
            <div className="flex gap-[12.8px] max-md:flex-wrap">
              {clientes.map(({ props: c }) => (
                <div key={c.href} className="min-w-0">
                  <BotaoIvory href={c.href} variante="pilula" novaAba={c.novaAba}>
                    {c.children}
                  </BotaoIvory>
                </div>
              ))}
            </div>
          )}
          {(pilares.length > 0 || botoes.length > 0) && (
            <div className="mt-16 grid grid-cols-3 p-4 max-lg:grid-cols-1 md:max-lg:pb-0 max-md:mt-24 max-md:p-0">
              {pilares.map(({ props: p }, i) => (
                <div
                  key={i}
                  className={`border-white/50 p-8 max-md:mb-4 max-md:p-0 max-md:pb-4 [&_h3]:mb-[14.4px] [&_h3]:text-[24px] [&_h3]:leading-[1.5] [&_h3]:font-bold max-md:[&_h3]:text-[19.2px] [&_p]:mb-[14.4px] [&_p]:text-[22.4px] [&_p]:leading-[1.5] max-md:[&_p]:text-[19.2px] ${bordas(i, pilares.length, pilares.length + botoes.length)}`}
                >
                  {p.children}
                </div>
              ))}
              {botoes.map((b, i) => (
                <div key={`b${i}`} className="flex items-center justify-center p-8 md:max-lg:pb-0 max-md:justify-start max-md:p-0">
                  {b}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
