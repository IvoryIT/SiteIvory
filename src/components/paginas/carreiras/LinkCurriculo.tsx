"use client";

import type { CSSProperties, ReactNode } from "react";
import { site } from "@/lib/site";

/**
 * Link para o e-mail de currículos que, ao ser clicado, também mostra o endereço num alerta
 * (comportamento herdado do WordPress, onde nem todo visitante tem um programa de e-mail configurado).
 */
export function LinkCurriculo({ aviso, className, style, children }: { aviso: string; className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <a href={`mailto:${site.emailCurriculos}`} className={className} style={style} onClick={() => window.alert(`${aviso} ${site.emailCurriculos}`)}>
      {children}
    </a>
  );
}
