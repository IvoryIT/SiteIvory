// Componentes MDX exclusivos da página "techradar" (família "pagina").
// Os nomes levam o prefixo "TechRadar" porque todas as páginas da família dividem a mesma lista.
import { TechRadarCapa } from "./TechRadarCapa";
import { TechRadarCompartilhe, TechRadarRede } from "./TechRadarCompartilhe";
import { TechRadarContribuidores, TechRadarPessoa } from "./TechRadarContribuidores";
import { TechRadarImagem } from "./TechRadarImagem";
import { TechRadarQuadrante, TechRadarQuadrantes, TechRadarTexto } from "./TechRadarTexto";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const componentes: Record<string, import("react").ComponentType<any>> = {
  TechRadarCapa,
  TechRadarTexto,
  TechRadarQuadrantes,
  TechRadarQuadrante,
  TechRadarImagem,
  TechRadarContribuidores,
  TechRadarPessoa,
  TechRadarCompartilhe,
  TechRadarRede,
};
