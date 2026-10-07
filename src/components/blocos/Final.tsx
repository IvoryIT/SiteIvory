import { BlocoContato, TopoRodape } from "./estrutura";

/** Fecho da página antes do rodapé (campo `final` do cabeçalho). */
export function Final({ tipo }: { tipo: "topo" | "contato" | "contato-sem-area" | "nenhum" }) {
  if (tipo === "nenhum") return null;
  if (tipo === "contato") return <BlocoContato variante="com-area" />;
  if (tipo === "contato-sem-area") return <BlocoContato variante="sem-area" />;
  return <TopoRodape />;
}
