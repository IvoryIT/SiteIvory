// Componentes MDX exclusivos das páginas legais (família "pagina"): política de privacidade,
// portal de privacidade e política de cookies. Prefixo "Legal" porque a família divide a lista.
import { LegalCookies, LegalServicoCookie } from "./LegalCookies";
import { LegalCentralizado, LegalDocumento } from "./LegalDocumento";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const componentes: Record<string, import("react").ComponentType<any>> = {
  LegalDocumento,
  LegalCentralizado,
  LegalCookies,
  LegalServicoCookie,
};
