// Componentes MDX exclusivos da família "case" (os hubs de setor usam os mesmos).
import type { ComponentType } from "react";
import { Bloco, Chamada, Depoimento, Destaque, Destaques, Faixa, Item, Letreiro, Lista, TextoImagem } from "./blocos";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const componentesCase: Record<string, ComponentType<any>> = {
  Faixa,
  Bloco,
  TextoImagem,
  Destaques,
  Destaque,
  Lista,
  Item,
  Depoimento,
  Letreiro,
  Chamada,
};
