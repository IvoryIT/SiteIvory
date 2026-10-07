// Componentes MDX da família "pagina": blocos genéricos de seção + os exclusivos de cada página.
import type { ComponentType } from "react";
import { Secao } from "@/components/blocos/estrutura";
import { componentes as inicio } from "@/components/paginas/inicio/mdx";
import { componentes as comoFazemos } from "@/components/paginas/como-fazemos/mdx";
import { componentes as solucoes } from "@/components/paginas/solucoes/mdx";
import { componentes as cases } from "@/components/paginas/cases/mdx";
import { componentes as blog } from "@/components/paginas/blog/mdx";
import { componentes as carreiras } from "@/components/paginas/carreiras/mdx";
import { componentes as techradar } from "@/components/paginas/techradar/mdx";
import { componentes as legal } from "@/components/paginas/legal/mdx";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const componentesPagina: Record<string, ComponentType<any>> = {
  Secao,
  ...inicio,
  ...comoFazemos,
  ...solucoes,
  ...cases,
  ...blog,
  ...carreiras,
  ...techradar,
  ...legal,
};
