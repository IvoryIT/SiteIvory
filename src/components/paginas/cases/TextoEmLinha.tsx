import type { ReactNode } from "react";

/**
 * Markdown curto de uma linha (resumo de cartão): **negrito** e _itálico_, aninháveis.
 * Usado onde o texto vem de um campo do cabeçalho, e não do corpo MDX.
 */
export function TextoEmLinha({ texto }: { texto: string }) {
  return <>{analisar(texto.replace(/<\/?Azul>/g, ""))}</>;
}

function analisar(texto: string): ReactNode[] {
  const saida: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|(?<![\p{L}\p{N}])_(.+?)_(?![\p{L}\p{N}])/gu;
  let ultimo = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    if (m.index > ultimo) saida.push(texto.slice(ultimo, m.index));
    const k = `${m.index}`;
    saida.push(m[1] !== undefined ? <strong key={k}>{analisar(m[1])}</strong> : <em key={k}>{analisar(m[2])}</em>);
    ultimo = m.index + m[0].length;
  }
  if (ultimo < texto.length) saida.push(texto.slice(ultimo));
  return saida;
}
