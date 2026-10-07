import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { dimensoesImagem, versaoWebp } from "@/lib/imagens";
import { CartaoVirar } from "./CartaoVirar";
import { separarFilhos } from "./util";

type PropsQuadroServico = {
  /** Ícone do serviço (mostrado com 32px de largura). */
  icone: string;
  /** Nome do serviço, na frente do cartão. */
  titulo: string;
  /** Lista em Markdown (`- item`) mostrada no verso. */
  children?: ReactNode;
};

/** Um serviço de `<InicioServicos>`. Só tem efeito dentro dele. */
export function InicioServico(props: PropsQuadroServico) {
  void props;
  return null;
}

type PropsServicosInicio = {
  /** Fundo da frente dos cartões (claro, com as linhas). */
  fundo: string;
  /** Fundo do verso dos cartões (azul, com as linhas). */
  fundoVerso: string;
  /** Conteúdo: `## título`, parágrafo de apoio e os `<InicioServico>`. */
  children: ReactNode;
};

const face = "flex h-full min-h-[192px] flex-col justify-end rounded-2xl bg-cover bg-no-repeat p-4";

/**
 * "Tecnologia que entende o seu negócio": título, texto e a grade de serviços em cartões de duas
 * faces (frente com ícone e nome; verso azul com a lista de entregas), três por linha.
 */
export function InicioServicos({ fundo, fundoVerso, children }: PropsServicosInicio) {
  const { quadros, resto } = separarFilhos(children, { quadros: InicioServico });
  const fundos = { "--frente": `url("${versaoWebp(fundo)}")`, "--verso": `url("${versaoWebp(fundoVerso)}")` } as CSSProperties;
  return (
    // Sem o "Acesse nosso blog" (só computador), o formulário de contato do fim da página encosta
    // 30px abaixo dos cartões; o bloco do formulário já traz 48px de respiro, daí os -18px.
    <section className="fundo-ruido pt-[10px] pb-[30px] max-lg:-mb-[18px] max-lg:pb-0">
      <div className="container-site" style={fundos}>
        <div
          className={[
            "flex flex-col gap-5 text-corpo max-md:text-center",
            "[&_h2]:mt-2 [&_h2]:mb-4 [&_h2]:text-[32px] [&_h2]:leading-[1.2] [&_h2]:font-medium [&_h2]:italic",
            "[&_p]:mt-5 [&_p]:mb-[14.4px] [&_p]:w-[70%] [&_p]:text-[20px] [&_p]:leading-[1.5] [&_p]:font-light",
            "max-md:[&_p]:mt-4 max-md:[&_p]:w-full max-md:[&_p]:text-base",
          ].join(" ")}
        >
          {resto}
        </div>
        <div className="mt-5 flex flex-wrap gap-5 p-[10px]">
          {quadros.map(({ props: q }) => {
            const { width, height } = dimensoesImagem(q.icone);
            return (
              <CartaoVirar
                key={q.titulo}
                className="w-[calc((100%_-_40px)/3)] max-md:w-full"
                frente={
                  <div className={`${face} bg-[image:var(--frente)]`}>
                    <div className="flex min-h-6 items-center self-start">
                      <Image src={q.icone} alt="" width={width} height={height} className="block h-auto w-8" />
                    </div>
                    <p className="mb-[14.4px] font-sistema text-base leading-6 text-corpo italic">{q.titulo}</p>
                  </div>
                }
                verso={
                  <div
                    className={`${face} bg-[image:var(--verso)] font-sistema text-[11.2px] leading-[11.2px] text-white max-md:justify-center max-md:text-base max-md:leading-4 [&_ul]:list-disc [&_p]:mb-[0.8em] [&_ul]:pl-10`}
                  >
                    {q.children}
                  </div>
                }
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
