// Componentes MDX da família "setor" (hubs de cases). São os mesmos blocos dos cases, com o
// visual dos hubs (estilo "hub"), mais a abertura de cada case (<CaseDoHub>).
import { createElement, type ComponentType } from "react";
import { Bloco, Chamada, Depoimento, Destaque, Destaques, Faixa, Item, Letreiro, Lista, TextoImagem } from "../case/blocos";
import { CaseDoHub } from "./blocos";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noHub = (C: ComponentType<any>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Envolto = (props: any) => createElement(C, { ...props, estilo: "hub" });
  Envolto.displayName = `${C.name}Hub`;
  return Envolto;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const componentesSetor: Record<string, ComponentType<any>> = {
  Faixa,
  Bloco: noHub(Bloco),
  TextoImagem,
  Destaques: noHub(Destaques),
  Destaque: noHub(Destaque),
  Lista,
  Item,
  Depoimento: noHub(Depoimento),
  Letreiro,
  Chamada: noHub(Chamada),
  CaseDoHub,
};
