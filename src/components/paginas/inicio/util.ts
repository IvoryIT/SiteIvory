// Utilitários dos componentes da home e da "Como fazemos".
import { Children, isValidElement, type ReactElement, type ReactNode } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Componente = (props: any) => ReactNode;

/**
 * Separa os filhos vindos do MDX: os elementos de cada componente pedido saem em listas próprias
 * (na ordem do conteúdo) e o resto (títulos, parágrafos, listas em Markdown) sai em `resto`.
 * O MDX entrega os componentes registrados com a mesma referência de função, então dá para
 * comparar pelo tipo.
 */
export function separarFilhos<T extends Record<string, Componente>>(children: ReactNode, tipos: T) {
  const chaves = Object.keys(tipos) as (keyof T)[];
  const grupos = Object.fromEntries(chaves.map((k) => [k, []])) as unknown as { [K in keyof T]: ReactElement<Parameters<T[K]>[0]>[] };
  const resto: ReactNode[] = [];
  Children.toArray(children).forEach((filho) => {
    if (isValidElement(filho)) {
      const chave = chaves.find((k) => filho.type === (tipos[k] as unknown));
      if (chave) {
        (grupos[chave] as ReactElement[]).push(filho);
        return;
      }
    }
    if (typeof filho === "string" && !filho.trim()) return;
    resto.push(filho);
  });
  return { ...grupos, resto };
}

/** Primeiro elemento de uma lista cujo tipo é a tag HTML pedida (ex.: o "## título" do MDX). */
export function separarTag(filhos: ReactNode[], tag: string) {
  const i = filhos.findIndex((f) => isValidElement(f) && f.type === tag);
  if (i < 0) return { tag: null as ReactNode, resto: filhos };
  return { tag: filhos[i], resto: [...filhos.slice(0, i), ...filhos.slice(i + 1)] };
}

/** Atributos de link que abre em nova aba (antiga classe `abrir-outra-aba` do WordPress). */
export function atributosNovaAba(novaAba?: boolean) {
  return novaAba ? { target: "_blank", rel: "noopener noreferrer" } : {};
}
