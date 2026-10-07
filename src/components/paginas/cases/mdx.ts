// Componentes MDX exclusivos da página /cases-de-sucesso-ivory/ (família "pagina").
// Os nomes levam o prefixo "Cases" porque todas as páginas da família dividem a mesma lista.
import { CasesDepoimento, CasesDepoimentos } from "./CasesDepoimentos";
import { CasesListagem } from "./CasesListagem";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const componentes: Record<string, import("react").ComponentType<any>> = {
  CasesListagem,
  CasesDepoimentos,
  CasesDepoimento,
};
