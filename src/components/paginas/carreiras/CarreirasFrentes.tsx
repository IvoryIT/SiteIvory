import { Children, type ReactNode } from "react";
import { TituloCarreiras } from "./CarreirasMotivos";

type PropsFrentes = {
  /** Início do título (ex.: "Nossas frentes de"). */
  titulo: string;
  /** Palavra final do título, em azul e negrito (ex.: "impacto"). */
  destaque?: string;
  children: ReactNode;
};

/**
 * "Nossas frentes de impacto": caixa clara com as frentes em duas colunas (metade dos itens em cada,
 * na ordem); no tablet e no celular vira uma coluna só.
 */
export function CarreirasFrentes({ titulo, destaque, children }: PropsFrentes) {
  const itens = Children.toArray(children);
  const metade = Math.ceil(itens.length / 2);
  const colunas = [itens.slice(0, metade), itens.slice(metade)];
  return (
    <section className="fundo-ruido px-4 pt-12 md:pt-4 md:pb-8 lg:px-0 lg:py-4">
      <div className="flex flex-col gap-5 rounded-[2em] border-2 border-white bg-white/44 p-4 md:p-8 lg:container-site">
        <TituloCarreiras centralizarNoCelular>
          {titulo} {destaque && <strong className="font-bold text-azul italic">{destaque}</strong>}
        </TituloCarreiras>
        <div className="flex flex-col lg:flex-row lg:gap-8">
          {colunas.map((coluna, i) => (
            <div key={i} className={`flex flex-1 flex-col ${i === 0 ? "[&>*:last-child]:max-md:border-b-2!" : ""}`}>
              {coluna}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Uma frente: título em azul, uma linha em branco e o texto. */
export function CarreirasFrente({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[11em] flex-col justify-center border-b-2 border-linha last:border-b-0 max-md:py-4">
      <div className="text-base leading-normal font-medium text-corpo italic md:text-[1.1em]">
        <p className="mb-[1.5em] font-bold text-azul">{titulo}</p>
        {children}
      </div>
    </div>
  );
}
