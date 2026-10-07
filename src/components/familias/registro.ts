// Lista fechada de componentes que o conteúdo MDX de cada família pode usar.
// Componente que não está aqui faz o build falhar (ver src/lib/mdx.tsx).
// Para criar um componente novo, use a skill `novo-componente`.
import type { ComponentType } from "react";
import type { Familia } from "@/lib/esquema";
import { Azul, Botao, Divisor, Imagem, TextoComImagem } from "@/components/conteudo/basicos";
import { componentesCase } from "./case/mdx";
import { componentesSetor } from "./setor/mdx";
import { componentesSolucao } from "./solucao/mdx";
import { componentesPagina } from "./pagina/mdx";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Mapa = Record<string, ComponentType<any>>;

const basicos: Mapa = { Azul, Botao, Divisor, Imagem, TextoComImagem };

export const componentesPorFamilia: Record<Familia, Mapa> = {
  artigo: { ...basicos },
  case: { ...basicos, ...componentesCase },
  setor: { ...basicos, ...componentesSetor },
  solucao: { ...basicos, ...componentesSolucao },
  pagina: { ...basicos, ...componentesPagina },
};
