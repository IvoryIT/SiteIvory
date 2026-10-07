import type { ReactNode } from "react";
import { Capa, Compartilhe, InsightsRecentes, TopoRodape, type ItemInsight } from "@/components/blocos/estrutura";
import type { ItemBreadcrumb } from "@/lib/conteudo";
import type { FrontmatterArtigo } from "@/lib/esquema";

/**
 * Molde dos artigos do blog: capa com título, texto em blocos separados por divisores,
 * "Compartilhe", "Insights recentes" e o topo do rodapé.
 */
export function ModeloArtigo({ dados, trilha, children, insights }: { dados: FrontmatterArtigo; trilha: ItemBreadcrumb[]; children: ReactNode; insights: ItemInsight[] }) {
  return (
    <>
      <Capa
        trilha={trilha}
        imagem={dados.capa}
        imagemMobile={dados.capaMobile}
        imagemTablet={dados.capaTablet}
        titulo={dados.titulo}
        tamanhoTitulo={dados.tamanhoTitulo}
        estiloTitulo={dados.capaTitulo}
      />
      {/* No celular o divisor do Elementor não tem margem: quando ele fecha o texto, o COMPARTILHE vem logo abaixo. */}
      <section className="fundo-ruido pt-12 pb-4 md:pt-4 max-md:has-[>div>hr:last-child]:pb-0">
        {/* Coluna flex, como o container do Elementor: margens de blocos vizinhos não colapsam. */}
        <div className="container-site texto-rico flex flex-col max-md:px-[6px] max-md:text-base max-md:[&>hr:last-child]:mb-0">{children}</div>
      </section>
      <Compartilhe />
      <InsightsRecentes itens={insights} />
      <TopoRodape />
    </>
  );
}
