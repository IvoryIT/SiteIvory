import type { ReactNode } from "react";
import { Capa } from "@/components/blocos/estrutura";
import { Final } from "@/components/blocos/Final";
import type { ItemBreadcrumb } from "@/lib/conteudo";
import type { FrontmatterPagina } from "@/lib/esquema";

/**
 * Molde livre (home, institucionais, hubs e páginas legais): capa opcional, seções do MDX
 * na ordem em que aparecem e o fecho definido em `final` (padrão: topo do rodapé).
 */
export function ModeloPagina({ dados, trilha, children }: { dados: FrontmatterPagina; trilha: ItemBreadcrumb[]; children: ReactNode }) {
  return (
    <>
      {!dados.semCapa && (
        <Capa
          trilha={trilha}
          semBreadcrumb={dados.semBreadcrumb}
          imagem={dados.capa}
          imagemMobile={dados.capaMobile}
          imagemTablet={dados.capaTablet}
          titulo={dados.tituloCapa ?? dados.titulo}
          tamanhoTitulo={dados.tamanhoTitulo}
          estiloTitulo={dados.capaTitulo}
        />
      )}
      {children}
      <Final tipo={dados.final ?? "topo"} />
    </>
  );
}
