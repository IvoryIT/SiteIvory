"use client";

import Image from "next/image";
import { useId, useState, type ReactNode } from "react";

export type CartaoCase = {
  href: string;
  imagem: string;
  largura: number;
  altura: number;
  imagemAlt?: string;
  titulo: string;
  /** Resumo já renderizado (negrito/itálico). */
  resumo?: ReactNode;
  /** Tamanho do título no desktop, em em (padrão 2). */
  tamanhoTitulo?: number;
};

export type AbaCases = { nome: string; cartoes: CartaoCase[] };

/**
 * Abas por setor da página /cases-de-sucesso-ivory/ (antigo widget "Abas aninhadas"). No
 * computador e no tablet os nomes ficam numa coluna à esquerda; no celular viram sanfona: cada
 * nome logo acima do próprio conteúdo. Todas as abas saem no HTML; só a ativa fica visível.
 */
export function AbasCases({ titulo, abas, moldura }: { titulo: string; abas: AbaCases[]; moldura: string }) {
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
            <button key={aba.nome} id={idAba(i)} type="button" role="tab" aria-selected={i === ativa} aria-controls={idPainel(i)} className={estiloNome(i)} onClick={() => setAtiva(i)}>
              {aba.nome}
            </button>
          ))}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        {abas.map((aba, i) => (
          <div key={aba.nome}>
            <button type="button" aria-expanded={i === ativa} aria-controls={idPainel(i)} className={`${estiloNome(i)} mb-[10px] md:hidden`} onClick={() => setAtiva(i)}>
              {aba.nome}
            </button>
            <div id={idPainel(i)} role="tabpanel" aria-labelledby={idAba(i)} hidden={i !== ativa} className="max-md:mb-[10px] md:p-[10px]">
              <div className="flex flex-wrap gap-5">
                {aba.cartoes.map((c) => (
                  <Cartao key={c.href} cartao={c} moldura={moldura} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Cartão de um case: foto (com o rótulo do setor desenhado), título e resumo. Abre em nova aba. */
function Cartao({ cartao, moldura }: { cartao: CartaoCase; moldura: string }) {
  return (
    <a
      href={cartao.href}
      target="_blank"
      rel="noopener"
      className="flex w-full flex-col bg-[image:var(--moldura)] bg-contain bg-bottom bg-no-repeat md:w-[24em]"
      style={{ ["--moldura" as string]: `url("${moldura}")` }}
    >
      {/* No celular o WordPress reserva só 236px para a foto e o texto sobe um pouco sobre ela. */}
      <div className="max-md:h-[236px]">
        <Image src={cartao.imagem} alt={cartao.imagemAlt ?? ""} width={cartao.largura} height={cartao.altura} sizes="(max-width: 767px) 100vw, 384px" className="relative h-auto w-full" />
      </div>
      <div className="relative px-4 pt-4 pb-12 md:pb-4 lg:pb-16">
        <p
          className="mb-[0.5em] text-[1.2rem] leading-none font-bold text-azul italic lg:text-[length:var(--tam)]"
          style={{ ["--tam" as string]: `${cartao.tamanhoTitulo ?? 2}rem` }}
        >
          {cartao.titulo}
        </p>
        {cartao.resumo && <p className="text-[0.8rem] leading-normal text-texto [&_em]:italic [&_strong]:font-bold">{cartao.resumo}</p>}
      </div>
    </a>
  );
}
