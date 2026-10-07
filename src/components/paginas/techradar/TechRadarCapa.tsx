import { Capa } from "@/components/blocos/estrutura";
import { obterPagina, trilha } from "@/lib/conteudo";

type Props = {
  /** Imagem da capa, com o título já desenhado nela. */
  imagem: string;
  imagemMobile?: string;
  /** Título da página: vai para o <h1> só para leitores de tela e buscadores (o visual é o da imagem). */
  titulo: string;
  /** URL desta página (ex.: "/techradar/"), usada para montar o breadcrumb. */
  caminho: string;
};

/**
 * Capa cuja imagem já traz o título desenhado (ex.: "IA tech radar"). Usa a <Capa> comum com o
 * título invisível; a página precisa de `semCapa: true` no cabeçalho para não ter capa dupla.
 */
export async function TechRadarCapa({ imagem, imagemMobile, titulo, caminho }: Props) {
  const pagina = await obterPagina(caminho.split("/").filter(Boolean));
  const itens = pagina ? await trilha(pagina) : [{ nome: "Início", caminho: "/" }];
  return <Capa trilha={itens} imagem={imagem} imagemMobile={imagemMobile} titulo={<span className="sr-only">{titulo}</span>} />;
}
