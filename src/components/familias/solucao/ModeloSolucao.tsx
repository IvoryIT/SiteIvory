import type { ReactNode } from "react";
import { Final } from "@/components/blocos/Final";
import type { ItemBreadcrumb } from "@/lib/conteudo";
import type { FrontmatterSolucao } from "@/lib/esquema";
import { CapaSolucao } from "./CapaSolucao";

/**
 * Molde das páginas de solução: capa com a frase (cabeçalho), blocos do MDX na ordem em que
 * aparecem (Introducao, QuadroImagem, BlocoServico + GradeCartoes, ListaServicos, Diferenciais,
 * BannerEbook) e o fecho definido em `final` (padrão: formulário de contato com "Área de atuação").
 */
export function ModeloSolucao({ dados, trilha, children }: { dados: FrontmatterSolucao; trilha: ItemBreadcrumb[]; children: ReactNode }) {
  return (
    <>
      <CapaSolucao
        trilha={trilha}
        imagem={dados.capa}
        imagemMobile={dados.capaMobile}
        imagemTablet={dados.capaTablet}
        posicao={dados.capaPosicao}
        frase={dados.frase}
        cor={dados.corFrase}
        largura={dados.larguraFrase}
      />
      {children}
      <Final tipo={dados.final ?? "contato"} />
    </>
  );
}
