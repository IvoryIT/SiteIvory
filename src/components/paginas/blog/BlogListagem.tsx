import { ehPublica, listarPorFamilia } from "@/lib/conteudo";
import { AbasBlog, type AbaBlog, type CartaoBlog } from "./AbasBlog";

/** Cartão que não vem de um artigo (ex.: o IA Tech Radar na aba "E-books"). Entra no início da aba. */
export type CartaoExtra = CartaoBlog & { aba: string };

type Props = {
  /** Texto acima das abas (ex.: "Categorias"). */
  titulo: string;
  /** Nome da primeira aba, que mostra todos os artigos (ex.: "Ver todos"). */
  todos: string;
  /** Demais abas, na ordem em que aparecem. Cada artigo entra nas abas listadas em `categorias` no cabeçalho dele. */
  abas: string[];
  /**
   * Ordem manual dos cartões (caminhos dos artigos), herdada do WordPress. Artigos fora da lista
   * (os novos) entram antes dela, do mais recente para o mais antigo (`publicadoEm`).
   */
  ordem?: string[];
  /** Cartões que não são artigos. */
  extras?: CartaoExtra[];
};

const comBarra = (c: string) => (c.endsWith("/") ? c : `${c}/`);

/**
 * Listagem do /blog/ com abas por categoria. Monta-se sozinha a partir das páginas da família
 * "artigo": cada artigo usa o `cartao` (imagem, rótulo, título) e as `categorias` do seu cabeçalho.
 */
export async function BlogListagem({ titulo, todos, abas, ordem = [], extras = [] }: Props) {
  const artigos = (await listarPorFamilia("artigo")).filter(ehPublica);
  const posicao = new Map(ordem.map((c, i) => [comBarra(c), i]));

  artigos.sort((a, b) => {
    const pa = posicao.get(a.caminho);
    const pb = posicao.get(b.caminho);
    if (pa === undefined && pb === undefined) {
      return new Date(b.dados.publicadoEm).getTime() - new Date(a.dados.publicadoEm).getTime() || a.caminho.localeCompare(b.caminho);
    }
    if (pa === undefined) return -1;
    if (pb === undefined) return 1;
    return pa - pb;
  });

  const cartaoDe = (a: (typeof artigos)[number]): CartaoBlog => ({
    href: a.caminho,
    imagem: a.dados.cartao.imagem,
    imagemAlt: a.dados.cartao.imagemAlt,
    rotulo: a.dados.cartao.rotulo,
    titulo: a.dados.cartao.titulo,
    resumo: a.dados.cartao.resumo,
  });

  const extrasDa = (aba: string): CartaoBlog[] =>
    extras.filter((e) => e.aba === aba).map((e) => ({ href: e.href, imagem: e.imagem, imagemAlt: e.imagemAlt, rotulo: e.rotulo, titulo: e.titulo, resumo: e.resumo }));

  const listaAbas: AbaBlog[] = [
    { nome: todos, cartoes: [...extrasDa(todos), ...artigos.map(cartaoDe)] },
    ...abas.map((aba) => ({
      nome: aba,
      cartoes: [...extrasDa(aba), ...artigos.filter((a) => a.dados.categorias.includes(aba)).map(cartaoDe)],
    })),
  ];

  return (
    <section className="fundo-ruido px-4 pt-12 md:pt-4 lg:px-0 lg:pb-8">
      <div className="lg:container-site">
        <AbasBlog titulo={titulo} abas={listaAbas} />
      </div>
    </section>
  );
}
