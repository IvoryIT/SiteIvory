// Listagem de cases por setor da página /cases-de-sucesso-ivory/. Os cartões NÃO ficam no MDX:
// saem do cabeçalho de cada case (campos `cartao`, `categoria` e `ordem`) e dos cases que só
// existem dentro de um hub de setor (`casosDoHub`). Um case novo aparece aqui sozinho.
import { ehPublica, listarPorFamilia } from "@/lib/conteudo";
import { dimensoesImagem, versaoWebp } from "@/lib/imagens";
import { AbasCases, type AbaCases, type CartaoCase } from "./AbasCases";
import { TextoEmLinha } from "./TextoEmLinha";

/** Moldura do cartão (área clara arredondada com a seta verde), desenhada numa imagem. */
const MOLDURA = "/wp-content/uploads/2025/09/Group-574-1.png";

type Props = {
  /** Ordem das abas (setores). Categorias de cases que não estiverem aqui vão para o fim. */
  categorias?: string[];
  /** Título acima dos nomes das abas. */
  titulo?: string;
};

type Item = CartaoCase & { categoria: string; ordem: number };

export async function CasesListagem({ categorias = [], titulo = "Categorias" }: Props) {
  const itens: Item[] = [];
  const cartao = (c: { imagem: string; imagemAlt?: string; titulo: string; resumo?: string; tamanhoTitulo?: number }) => {
    const { width, height } = dimensoesImagem(c.imagem);
    return {
      imagem: c.imagem,
      largura: width,
      altura: height,
      imagemAlt: c.imagemAlt,
      titulo: c.titulo,
      resumo: c.resumo ? <TextoEmLinha texto={c.resumo} /> : undefined,
      tamanhoTitulo: c.tamanhoTitulo,
    };
  };

  for (const p of (await listarPorFamilia("case")).filter(ehPublica)) {
    itens.push({ href: p.caminho, categoria: p.dados.categoria, ordem: p.dados.ordem, ...cartao(p.dados.cartao) });
  }
  for (const s of (await listarPorFamilia("setor")).filter(ehPublica)) {
    for (const c of s.dados.casosDoHub) {
      itens.push({ href: `${s.caminho}#${c.ancora}`, categoria: c.categoria, ordem: c.ordem, ...cartao(c) });
    }
  }

  const nomes = [...categorias];
  for (const i of itens) if (!nomes.includes(i.categoria)) nomes.push(i.categoria);
  const abas: AbaCases[] = nomes
    .map((nome) => ({
      nome,
      cartoes: itens
        .filter((i) => i.categoria === nome)
        .sort((a, b) => a.ordem - b.ordem || a.titulo.localeCompare(b.titulo, "pt-BR"))
        .map((i): CartaoCase => ({ href: i.href, imagem: i.imagem, largura: i.largura, altura: i.altura, imagemAlt: i.imagemAlt, titulo: i.titulo, resumo: i.resumo, tamanhoTitulo: i.tamanhoTitulo })),
    }))
    .filter((a) => a.cartoes.length);

  return (
    <section className="fundo-ruido px-4 pt-12 md:pt-4 md:pb-8 lg:px-0 lg:pt-4 lg:pb-16">
      <div className="mx-auto lg:max-w-[1140px]">
        <AbasCases titulo={titulo} abas={abas} moldura={versaoWebp(MOLDURA)} />
      </div>
    </section>
  );
}
