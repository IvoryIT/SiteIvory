import Link from "next/link";
import type { ReactNode } from "react";
import { ehExterno } from "@/lib/site";
import { atributosNovaAba } from "./util";

const variantes = {
  /** Contorno azul; no hover enche de azul. */
  contorno: "border-azul text-azul hover:bg-azul hover:text-white",
  /** Laranja cheio; no hover vira azul. */
  laranja: "border-laranja bg-laranja text-white hover:border-azul hover:bg-azul",
  /** Azul cheio; no hover vira laranja. */
  azul: "border-azul bg-azul text-white hover:border-laranja hover:bg-laranja",
  /** Branco cheio com texto azul em negrito (sobre fundo azul); no hover fica só o contorno. */
  branco: "border-white bg-white text-left font-bold text-azul hover:bg-transparent hover:text-white",
  /** Pílula de contorno branco, sem itálico (sobre fundo azul); no hover enche de branco. */
  pilula: "border-white not-italic text-white hover:bg-white hover:text-azul",
};

type PropsBotao = {
  href: string;
  children: ReactNode;
  /** Estilo do botão (padrão: contorno azul). */
  variante?: keyof typeof variantes;
  /** Abre em nova aba. */
  novaAba?: boolean;
  /** Botão mais baixo (respiro vertical de meia letra em vez de 12px). */
  compacto?: boolean;
  /** Âncora do botão (para links do tipo #id). */
  id?: string;
};

/**
 * Botão das páginas montadas com seções (home, Como fazemos). Texto de 20px (17,6px no celular),
 * cantos de 18px e borda de 3px, como os botões do Elementor no site antigo.
 */
export function BotaoIvory({ href, children, variante = "contorno", novaAba, compacto, id }: PropsBotao) {
  const tamanho = variante === "branco" ? "text-[25.6px] max-md:text-[17.6px]" : "text-[20px] max-md:text-[17.6px]";
  const respiro = compacto || variante === "branco" || variante === "pilula" ? "py-[0.5em]" : "py-3";
  const classes = `inline-flex items-center rounded-[18px] border-[3px] px-6 italic leading-none transition-colors duration-300 ${respiro} ${tamanho} ${variantes[variante]}`;
  const externo = ehExterno(href) || href.startsWith("#");
  if (externo || novaAba) {
    return (
      <a id={id} href={href} className={classes} {...atributosNovaAba(novaAba || ehExterno(href))}>
        {children}
      </a>
    );
  }
  return (
    <Link id={id} href={href} className={classes}>
      {children}
    </Link>
  );
}
