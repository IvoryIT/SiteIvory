"use client";

import { useEffect, useId, useState, type MouseEvent, type ReactNode } from "react";

const EVENTO = "ivory:cartao-virado";

/** Mouse de verdade (computador): vira no hover, por CSS. Em tela de toque, vira no toque. */
function temHover() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

type PropsCartaoVirar = {
  /** Face mostrada normalmente. */
  frente: ReactNode;
  /** Face mostrada no hover (mouse) ou depois do primeiro toque (celular/tablet). */
  verso: ReactNode;
  /** Link do cartão (opcional). Em tela de toque, o primeiro toque vira e o segundo navega. */
  href?: string;
  novaAba?: boolean;
  /** Texto para leitores de tela quando o cartão é um link só de imagens. */
  rotulo?: string;
  className?: string;
};

/**
 * Cartão de duas faces (antigo script "quadro-dinamico" q1..q17 do WordPress): no computador a
 * frente dá lugar ao verso enquanto o mouse está em cima; em tela de toque o toque vira o
 * cartão (e desvira os outros).
 */
export function CartaoVirar({ frente, verso, href, novaAba, rotulo, className = "" }: PropsCartaoVirar) {
  const id = useId();
  const [virado, setVirado] = useState(false);

  // Só um cartão virado por vez (como o "resetarTodos" do script antigo).
  useEffect(() => {
    const outro = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== id) setVirado(false);
    };
    window.addEventListener(EVENTO, outro);
    return () => window.removeEventListener(EVENTO, outro);
  }, [id]);

  function aoClicar(e: MouseEvent) {
    if (temHover()) return;
    if (href && virado) return; // segundo toque: segue o link
    e.preventDefault();
    const novo = !virado;
    setVirado(novo);
    if (novo) window.dispatchEvent(new CustomEvent(EVENTO, { detail: id }));
  }

  const faces = (
    <>
      <div className="h-full group-hover/virar:hidden group-data-[virado=sim]/virar:hidden">{frente}</div>
      <div className="hidden h-full group-hover/virar:block group-data-[virado=sim]/virar:block">{verso}</div>
    </>
  );
  const classes = `group/virar block ${className}`;
  if (href) {
    return (
      <a href={href} aria-label={rotulo} className={classes} data-virado={virado ? "sim" : undefined} onClick={aoClicar} {...(novaAba ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {faces}
      </a>
    );
  }
  return (
    <div className={classes} data-virado={virado ? "sim" : undefined} onClick={aoClicar}>
      {faces}
    </div>
  );
}
