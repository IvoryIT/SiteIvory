"use client";

import Image from "next/image";
import { useId, useState } from "react";

export type CartaoBlog = {
  href: string;
  /** Imagem do cartão inteiro (a moldura, a foto e a seta verde já vêm desenhadas nela). */
  imagem: string;
  imagemAlt?: string;
  /** Linha pequena acima do título (ex.: "Coluna do CEO", "E-book"). */
  rotulo?: string;
  titulo: string;
  /** Linha abaixo do título, em fonte menor. */
  resumo?: string;
};

export type AbaBlog = { nome: string; cartoes: CartaoBlog[] };

/**
 * Abas do /blog/ (antigo widget "Abas aninhadas" do Elementor). No computador e no tablet os nomes
 * ficam numa coluna à esquerda; no celular viram sanfona: cada nome logo acima do próprio conteúdo.
 * Todas as abas saem no HTML (boas para SEO); só a ativa fica visível.
 */
export function AbasBlog({ titulo, abas }: { titulo: string; abas: AbaBlog[] }) {
  const [ativa, setAtiva] = useState(0);
  const base = useId();
  const idAba = (i: number) => `${base}-aba-${i}`;
  const idPainel = (i: number) => `${base}-painel-${i}`;

  const estiloNome = (i: number) =>
    `block w-full cursor-pointer text-left text-[20px] leading-[30px] font-medium transition-colors hover:text-vinho ${i === ativa ? "text-vinho" : "text-texto"}`;

  return (
    <div className="flex flex-col md:flex-row md:gap-[10px]">
      <div className="md:w-[240px] md:shrink-0">
        <p className="pb-[0.8em] text-[20px] leading-[30px] font-semibold text-azul italic">{titulo}</p>
        <div role="tablist" aria-orientation="vertical" className="mt-[10px] flex flex-col gap-[10px] max-md:hidden">
          {abas.map((aba, i) => (
            <button
              key={aba.nome}
              id={idAba(i)}
              type="button"
              role="tab"
              aria-selected={i === ativa}
              aria-controls={idPainel(i)}
              className={estiloNome(i)}
              onClick={() => setAtiva(i)}
            >
              {aba.nome}
            </button>
          ))}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        {abas.map((aba, i) => (
          <div key={aba.nome}>
            {/* No celular o nome da aba fica acima do conteúdo dela, como uma sanfona. */}
            <button
              type="button"
              aria-expanded={i === ativa}
              aria-controls={idPainel(i)}
              className={`${estiloNome(i)} md:hidden ${i > 0 ? "mt-[10px]" : ""}`}
              onClick={() => setAtiva(i)}
            >
              {aba.nome}
            </button>
            <div
              id={idPainel(i)}
              role="tabpanel"
              aria-labelledby={idAba(i)}
              hidden={i !== ativa}
              className="max-md:mt-[10px] md:p-[10px]"
            >
              <div className="flex flex-wrap justify-end gap-5">
                {aba.cartoes.map((c) => (
                  <CartaoDoBlog key={c.href} cartao={c} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Cartão de um artigo: a imagem desenha o cartão; o texto fica na área clara abaixo da foto. Abre em nova aba. */
function CartaoDoBlog({ cartao }: { cartao: CartaoBlog }) {
  return (
    <a
      href={cartao.href}
      target="_blank"
      rel="noopener"
      className="relative isolate block min-h-[21em] w-[21em] pt-[11.5em] pr-[3em] pl-[1em] md:min-h-[23em] md:w-[24em] md:pt-[14em] md:pl-[1.2em]"
    >
      <Image src={cartao.imagem} alt={cartao.imagemAlt ?? ""} fill sizes="(max-width: 767px) 336px, 384px" className="-z-10 object-contain object-left-top" />
      {cartao.rotulo && <p className="mb-[0.8em] text-[0.8em] leading-[1.1] text-texto italic">{cartao.rotulo}</p>}
      <p className="mb-[0.6em] text-[1.1em] leading-[1.2] font-bold text-azul italic">{cartao.titulo}</p>
      {cartao.resumo && <p className="mb-[0.8em] text-base leading-[1.1] text-azul">{cartao.resumo}</p>}
    </a>
  );
}
