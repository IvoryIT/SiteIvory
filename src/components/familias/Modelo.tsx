// Escolhe o molde de página pela família declarada no cabeçalho do MDX.
import { Capa, TopoRodape, type ItemInsight } from "@/components/blocos/estrutura";
import { lerBloco, trilha, type Pagina } from "@/lib/conteudo";
import { compilarMdx } from "@/lib/mdx";
import { ModeloArtigo } from "./artigo/ModeloArtigo";
import { ModeloCase } from "./case/ModeloCase";
import { ModeloSetor } from "./setor/ModeloSetor";
import { ModeloSolucao } from "./solucao/ModeloSolucao";
import { ModeloPagina } from "./pagina/ModeloPagina";
import { componentesPorFamilia } from "./registro";

export async function Modelo({ pagina }: { pagina: Pagina }) {
  const itens = await trilha(pagina);
  const conteudo = await compilarMdx(pagina.corpo, componentesPorFamilia[pagina.dados.familia], pagina.arquivo);
  const d = pagina.dados;

  switch (d.familia) {
    case "artigo": {
      const insights = await lerBloco<ItemInsight[]>("insights-recentes");
      return (
        <ModeloArtigo dados={d} trilha={itens} insights={insights}>
          {conteudo}
        </ModeloArtigo>
      );
    }
    case "case":
      return (
        <ModeloCase dados={d} trilha={itens}>
          {conteudo}
        </ModeloCase>
      );
    case "setor":
      return (
        <ModeloSetor dados={d} trilha={itens} caminho={pagina.caminho}>
          {conteudo}
        </ModeloSetor>
      );
    case "solucao":
      return (
        <ModeloSolucao dados={d} trilha={itens}>
          {conteudo}
        </ModeloSolucao>
      );
    case "pagina":
      return (
        <ModeloPagina dados={d} trilha={itens}>
          {conteudo}
        </ModeloPagina>
      );
    default:
      return (
        <>
          <Capa trilha={itens} titulo={(d as { titulo: string }).titulo} />
          {conteudo}
          <TopoRodape />
        </>
      );
  }
}
