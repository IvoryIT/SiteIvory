// Componentes MDX exclusivos da página "carreiras" (família "pagina").
// Os nomes levam o prefixo "Carreiras" porque todas as páginas da família dividem a mesma lista.
import { CarreirasBeneficio, CarreirasBeneficios } from "./CarreirasBeneficios";
import { CarreirasCartao, CarreirasCartoes } from "./CarreirasCartoes";
import { CarreirasCurriculo } from "./CarreirasCurriculo";
import { CarreirasFrente, CarreirasFrentes } from "./CarreirasFrentes";
import { CarreirasMotivo, CarreirasMotivos } from "./CarreirasMotivos";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const componentes: Record<string, import("react").ComponentType<any>> = {
  CarreirasCartoes,
  CarreirasCartao,
  CarreirasCurriculo,
  CarreirasMotivos,
  CarreirasMotivo,
  CarreirasBeneficios,
  CarreirasBeneficio,
  CarreirasFrentes,
  CarreirasFrente,
};
