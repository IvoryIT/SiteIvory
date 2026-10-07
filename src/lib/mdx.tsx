// Compila o corpo MDX de uma página com a lista fechada de componentes da família dela.
// É a segunda trava do padrão: componente fora da lista, HTML solto ou atributo de estilo
// (`style`, `className`) fazem o build falhar com uma mensagem que diz o que usar no lugar.
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import type { ComponentType } from "react";

/** Tags HTML aceitas dentro do conteúdo (todo o resto precisa ser componente). */
const HTML_PERMITIDO = new Set(["br", "sup", "sub"]);
const ATRIBUTOS_PROIBIDOS = new Set(["style", "className", "class"]);

type No = { type: string; name?: string | null; attributes?: { type: string; name?: string }[]; children?: No[]; position?: { start: { line: number } } };

export function validarJsx(permitidos: Set<string>, arquivo: string) {
  return () => (arvore: No) => {
    const visitar = (no: No) => {
      if ((no.type === "mdxJsxFlowElement" || no.type === "mdxJsxTextElement") && no.name) {
        const linha = no.position?.start.line ?? "?";
        const ehHtml = /^[a-z]/.test(no.name);
        if (ehHtml && !HTML_PERMITIDO.has(no.name)) {
          throw new Error(`${arquivo}:${linha}: <${no.name}> não é permitido no conteúdo. Use Markdown ou um componente do molde.`);
        }
        if (!ehHtml && !permitidos.has(no.name)) {
          throw new Error(`${arquivo}:${linha}: <${no.name}> não existe para esta família de página. Componentes permitidos: ${[...permitidos].sort().join(", ")}.`);
        }
        for (const a of no.attributes ?? []) {
          if (a.type === "mdxJsxAttribute" && a.name && ATRIBUTOS_PROIBIDOS.has(a.name)) {
            throw new Error(`${arquivo}:${linha}: o atributo "${a.name}" não é permitido. Estilo vem do componente, não do conteúdo.`);
          }
        }
      }
      no.children?.forEach(visitar);
    };
    visitar(arvore);
  };
}

/** Componentes de texto em linha que, sozinhos numa linha, ainda são um parágrafo. */
const EM_LINHA = new Set(["Azul"]);

function inlineViraParagrafo() {
  return (arvore: No) => {
    const visitar = (no: No) => {
      no.children = no.children?.map((filho) =>
        filho.type === "mdxJsxFlowElement" && filho.name && EM_LINHA.has(filho.name)
          ? ({ type: "paragraph", children: [{ ...filho, type: "mdxJsxTextElement" }] } as No)
          : filho,
      );
      no.children?.forEach(visitar);
    };
    visitar(arvore);
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function compilarMdx(fonte: string, componentes: Record<string, ComponentType<any>>, arquivo: string) {
  const { default: Conteudo } = await evaluate(fonte, {
    ...runtime,
    remarkPlugins: [remarkGfm, validarJsx(new Set(Object.keys(componentes)), arquivo), inlineViraParagrafo],
  });
  return <Conteudo components={componentes as never} />;
}
