// Componentes MDX exclusivos da página "inicio" (família "pagina").
// Os nomes são únicos no site inteiro: o mapa da família "pagina" junta os de todas as páginas.
import { BotaoIvory } from "./BotaoIvory";
import { InicioCapa } from "./InicioCapa";
import { InicioCarrossel, InicioSlide } from "./InicioCarrossel";
import { InicioBlog } from "./InicioBlog";
import { InicioServico, InicioServicos } from "./InicioServicos";
import { InicioLogo, InicioSolucoes } from "./InicioSolucoes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const componentes: Record<string, import("react").ComponentType<any>> = {
  BotaoIvory,
  InicioCapa,
  InicioSolucoes,
  InicioLogo,
  InicioCarrossel,
  InicioSlide,
  InicioServicos,
  InicioServico,
  InicioBlog,
};
