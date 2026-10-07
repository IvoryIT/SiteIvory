import type { ReactNode } from "react";
import { dimensoesImagem } from "@/lib/imagens";
import { InicioCarrosselCliente } from "./InicioCarrosselCliente";
import { separarFilhos } from "./util";

type PropsSlideSetor = {
  /** Imagem do slide (já traz a aba com o nome do setor desenhada). */
  imagem: string;
  alt: string;
  /** Para onde o clique no slide leva. */
  href: string;
};

/** Um slide de `<InicioCarrossel>`. Só tem efeito dentro dele. */
export function InicioSlide(props: PropsSlideSetor) {
  void props;
  return null;
}

/**
 * Faixa com o carrossel de cases por setor (imagens de 240px, 4 por vez no computador, 3 no
 * tablet e 1 no celular), troca automática e bolinhas. Cada `<InicioSlide>` é um slide.
 */
export function InicioCarrossel({ children, rotulo = "Cases por setor" }: { children: ReactNode; rotulo?: string }) {
  const { slides } = separarFilhos(children, { slides: InicioSlide });
  const itens = slides.map(({ props: s }) => {
    const { width, height } = dimensoesImagem(s.imagem);
    return { src: s.imagem, alt: s.alt, href: s.href, largura: width, altura: height };
  });
  return (
    <section className="fundo-ruido pt-[10px] pb-[46px] max-lg:pt-12 max-lg:pb-9 max-md:pt-8">
      <div className="mx-auto max-w-[1140px] px-[10px] max-lg:px-0">
        <InicioCarrosselCliente itens={itens} rotulo={rotulo} />
      </div>
    </section>
  );
}
