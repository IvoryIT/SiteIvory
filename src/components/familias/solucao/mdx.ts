// Componentes MDX exclusivos da família "solucao" (documentação das props em ./componentes.tsx).
import type { ComponentType } from "react";
import { BannerEbook, BlocoServico, Cartao, Diferencial, Diferenciais, GradeCartoes, Introducao, ListaServicos, QuadroImagem, Servico } from "./componentes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const componentesSolucao: Record<string, ComponentType<any>> = {
  Introducao,
  QuadroImagem,
  BlocoServico,
  GradeCartoes,
  Cartao,
  ListaServicos,
  Servico,
  Diferenciais,
  Diferencial,
  BannerEbook,
};
