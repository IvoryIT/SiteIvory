import type { ReactNode } from "react";
import { Capa } from "@/components/blocos/estrutura";
import { Final } from "@/components/blocos/Final";
import { listarPorFamilia, type ItemBreadcrumb } from "@/lib/conteudo";
import type { FrontmatterSetor } from "@/lib/esquema";
import { NavegacaoSetores } from "./blocos";

/**
 * Molde dos hubs de setor: capa com o nome do setor, os cases do setor (faixas do MDX, cada uma
 * aberta por um <CaseDoHub>), setas para o setor anterior/próximo e o formulário de contato.
 */
export async function ModeloSetor({ dados, trilha, children, caminho }: { dados: FrontmatterSetor; trilha: ItemBreadcrumb[]; children: ReactNode; caminho: string }) {
  const setores = (await listarPorFamilia("setor")).sort((a, b) => a.dados.ordem - b.dados.ordem);
  const i = setores.findIndex((s) => s.caminho === caminho);
  const vizinho = (j: number) => {
    const s = setores[(j + setores.length) % setores.length];
    return { caminho: s.caminho, nome: s.dados.titulo };
  };
  return (
    <div className="group/caso" data-centralizar>
      <Capa
        trilha={trilha}
        imagem={dados.capa}
        imagemMobile={dados.capaMobile}
        imagemTablet={dados.capaTablet}
        titulo={dados.titulo}
        pesoTitulo={700}
        estiloTitulo={dados.capaTitulo}
      />
      {children}
      {setores.length > 1 && i >= 0 && <NavegacaoSetores anterior={vizinho(i - 1)} proximo={vizinho(i + 1)} />}
      <Final tipo={dados.final ?? "contato"} />
    </div>
  );
}
