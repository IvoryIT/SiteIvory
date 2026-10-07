// Componentes MDX exclusivos da página "como-fazemos" (família "pagina").
// Os nomes são únicos no site inteiro: o mapa da família "pagina" junta os de todas as páginas.
import { BotaoIvory } from "@/components/paginas/inicio/BotaoIvory";
import { ComoFazemosCapacidade, ComoFazemosCapacidades } from "./ComoFazemosCapacidades";
import { ComoFazemosChamada } from "./ComoFazemosChamada";
import { ComoFazemosEtapa, ComoFazemosEtapas } from "./ComoFazemosEtapas";
import { ComoFazemosIndicador, ComoFazemosIndicadores } from "./ComoFazemosIndicadores";
import { ComoFazemosIntro } from "./ComoFazemosIntro";
import { ComoFazemosModelo, ComoFazemosModelos } from "./ComoFazemosModelos";
import { ComoFazemosCliente, ComoFazemosPilar, ComoFazemosQualidade } from "./ComoFazemosQualidade";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const componentes: Record<string, import("react").ComponentType<any>> = {
  BotaoIvory,
  ComoFazemosIntro,
  ComoFazemosChamada,
  ComoFazemosEtapas,
  ComoFazemosEtapa,
  ComoFazemosIndicadores,
  ComoFazemosIndicador,
  ComoFazemosModelos,
  ComoFazemosModelo,
  ComoFazemosQualidade,
  ComoFazemosCliente,
  ComoFazemosPilar,
  ComoFazemosCapacidades,
  ComoFazemosCapacidade,
};
