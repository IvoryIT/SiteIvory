// Componentes MDX exclusivos da página "solucoes" (família "pagina"; props em ./componentes.tsx).
import type { ComponentType } from "react";
import { BannerSolucoes, CapaSolucoes, QuadroSolucoes, TextoSolucoes } from "./componentes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const componentes: Record<string, ComponentType<any>> = { CapaSolucoes, TextoSolucoes, QuadroSolucoes, BannerSolucoes };
