// Schema do cabeçalho (frontmatter) de cada página. É a primeira trava do padrão: página que
// não obedece não entra no build. Limites de SEO (tamanho de título e descrição) são checados
// à parte por `npm run verificar`, que explica o problema em vez de só quebrar.
import { z } from "zod";

const caminhoImagem = z
  .string()
  .regex(/^\/(wp-content\/uploads|imagens)\/.+\.(png|jpe?g|webp|svg|gif|avif)$/i, "Imagem precisa estar em /imagens/ ou /wp-content/uploads/ e ter extensão de imagem");

export const seoSchema = z.object({
  /** Conteúdo da tag <title>. */
  titulo: z.string().min(1),
  /** Meta description. */
  descricao: z.string().min(1),
  /** Imagem de compartilhamento (Open Graph). Padrão: capa da página ou imagem do site. */
  imagem: caminhoImagem.optional(),
  /** Palavra-chave foco (só documentação; não vai para o HTML). */
  palavraChave: z.string().optional(),
  noindex: z.boolean().optional(),
});

const base = z.object({
  /** Título visível (H1). */
  titulo: z.string().min(1),
  /** Nome da página no breadcrumb. Padrão: o título. */
  breadcrumb: z.string().optional(),
  seo: seoSchema,
  publicadoEm: z.coerce.date(),
  atualizadoEm: z.coerce.date().optional(),
  /** ID da página no WordPress antigo (mantém os redirects de /?p=ID). */
  wpId: z.number().int().optional(),
  /** Página fora do sitemap, do llms.txt e das listagens; continua acessível pela URL. */
  oculta: z.boolean().optional(),
  /**
   * O que fecha a página antes do rodapé:
   *   topo      -> faixa branca arredondada (padrão das páginas institucionais)
   *   contato   -> formulário de contato com "Área de atuação"
   *   contato-sem-area -> formulário de contato sem "Área de atuação"
   *   nenhum    -> o próprio conteúdo já fecha a página
   * Cada família tem um padrão; só preencha para fugir dele.
   */
  final: z.enum(["topo", "contato", "contato-sem-area", "nenhum"]).optional(),
});

/** Ajustes do título da capa por dispositivo (reproduz as configurações do Elementor). */
const capaTitulo = z
  .object({
    entrelinha: z.number().positive().optional(),
    tamanhoTablet: z.number().positive().optional(),
    tamanhoMobile: z.number().positive().optional(),
    margemTopo: z.string().regex(/^\d+(\.\d+)?(em|%|px)$/).optional(),
    margemEsquerda: z.string().regex(/^\d+(\.\d+)?(em|%|px)$/).optional(),
    largura: z.string().regex(/^\d+(\.\d+)?%$/).optional(),
    alinharMobile: z.enum(["esquerda", "centro"]).optional(),
    italico: z.boolean().optional(),
  })
  .optional();

/** Cartão usado nas listagens (blog, hubs de cases, "Insights recentes"). */
const cartao = z.object({
  imagem: caminhoImagem,
  titulo: z.string().min(1),
  rotulo: z.string().optional(),
  resumo: z.string().optional(),
  imagemAlt: z.string().optional(),
});

export const artigoSchema = base.extend({
  familia: z.literal("artigo"),
  /** Imagem de fundo da capa (faixa com o título). */
  capa: caminhoImagem,
  /** Imagem da capa no celular, quando diferente. */
  capaMobile: caminhoImagem.optional(),
  /** Imagem da capa no tablet, quando diferente da do celular. */
  capaTablet: caminhoImagem.optional(),
  /** Tamanho do título na capa, em em (padrão 2.4). */
  tamanhoTitulo: z.number().positive().optional(),
  capaTitulo,
  cartao,
  /** Abas da página /blog/ em que o artigo aparece. */
  categorias: z.array(z.string()).default([]),
});

/**
 * Case de sucesso. O título (`titulo`) aparece na capa: o trecho até o primeiro ":" sai em
 * destaque (azul, negrito itálico) e o resto em texto escuro, como no WordPress.
 */
export const caseSchema = base.extend({
  familia: z.literal("case"),
  /** Slug do hub do setor (ex.: "cases-mineracao"). */
  setor: z.string().min(1),
  /** Título do setor mostrado acima do case (ex.: "Cases de Mineração"). */
  setorTitulo: z.string().min(1),
  /** Aba de /cases-de-sucesso-ivory/ em que o cartão do case aparece (ex.: "Logística"). */
  categoria: z.string().min(1),
  /** Posição do cartão dentro da aba (menor primeiro). */
  ordem: z.number().int().default(100),
  /** Imagem da capa (faixa arredondada no topo do case). */
  imagem: caminhoImagem,
  imagemAlt: z.string().optional(),
  /** Selo com os logos do cliente + Ivory, sobre o canto da capa. */
  logo: caminhoImagem.optional(),
  logoAlt: z.string().optional(),
  /** Largura do logo dentro do selo, em em (padrão 8.5). */
  logoLargura: z.number().positive().optional(),
  /** Selo no celular: "esquerda" (padrão), "centro" (selo maior e centralizado) ou "oculto". */
  logoCelular: z.enum(["esquerda", "centro", "oculto"]).optional(),
  /** No celular, títulos e textos centralizados (padrão: alinhados à esquerda). */
  centralizarNoCelular: z.boolean().optional(),
  /** Cartão do case em /cases-de-sucesso-ivory/. `resumo` aceita **negrito** e _itálico_. */
  cartao: cartao.extend({
    /** Tamanho do título do cartão, em em (padrão 2; reduza para títulos longos). */
    tamanhoTitulo: z.number().positive().optional(),
  }),
});

/** Case que existe só dentro do hub do setor (sem página própria). */
const caseDoHub = cartao.extend({
  /** Aba de /cases-de-sucesso-ivory/ em que o cartão aparece. */
  categoria: z.string().min(1),
  /** Posição do cartão dentro da aba (menor primeiro). */
  ordem: z.number().int().default(100),
  /** Âncora do case dentro do hub (o `id` da <Faixa>), destino do cartão. */
  ancora: z.string().min(1),
  tamanhoTitulo: z.number().positive().optional(),
});

/** Hub de cases de um setor (ex.: /cases-de-sucesso-ivory/cases-mineracao/). */
export const setorSchema = base.extend({
  familia: z.literal("setor"),
  /** Imagem da capa no desktop (já com o recorte de "pasta" desenhado). */
  capa: caminhoImagem,
  /** Imagem da capa no tablet e no celular. */
  capaMobile: caminhoImagem.optional(),
  /** Imagem da capa no tablet, quando diferente da do celular. */
  capaTablet: caminhoImagem.optional(),
  /** Ajustes do título da capa por dispositivo. */
  capaTitulo,
  /** Posição do setor na navegação entre setores (setas no fim da página; a lista é circular). */
  ordem: z.number().int(),
  /** Cases sem página própria, mostrados só neste hub, que também ganham cartão em /cases-de-sucesso-ivory/. */
  casosDoHub: z.array(caseDoHub).default([]),
});

export const solucaoSchema = base.extend({
  familia: z.literal("solucao"),
  /** Imagem de fundo da capa no desktop (já com o recorte de "pasta" desenhado na imagem). */
  capa: caminhoImagem,
  /** Imagem da capa no celular (retangular, sem o recorte). Padrão: a mesma do desktop. */
  capaMobile: caminhoImagem.optional(),
  /** Imagem da capa no tablet, quando diferente da do celular. */
  capaTablet: caminhoImagem.optional(),
  /** Recorte da imagem da capa no tablet e no celular: "centro" (padrão) ou "topo". */
  capaPosicao: z.enum(["centro", "topo"]).optional(),
  /** Frase da capa (é o H1 da página). Cada linha vira um parágrafo. */
  frase: z.string().min(1),
  /** Cor da frase: "clara" (branca, sobre imagem escura) ou "escura" (sobre imagem clara). */
  corFrase: z.enum(["clara", "escura"]).default("clara"),
  /** Largura da frase no desktop, em % da capa (padrão 90; use menos para quebrar antes do desenho da imagem). */
  larguraFrase: z.number().min(10).max(100).optional(),
  /** Cartão da solução no quadro da página /solucoes/ (montado sozinho a partir daqui). */
  cartao: z.object({
    /** Nome curto da solução no cartão. */
    titulo: z.string().min(1),
    /** Ícone (traço preto, ~48px) mostrado acima do nome. */
    icone: caminhoImagem,
    /** Posição no quadro (1 = primeiro). Soluções sem ordem vão para o fim, em ordem alfabética. */
    ordem: z.number().int().positive().optional(),
  }),
});

/** Páginas montadas livremente com seções (home, institucionais, hubs, legais). */
export const paginaSchema = base.extend({
  familia: z.literal("pagina"),
  /** Imagem da capa (faixa com o título). Sem ela, a capa mostra só o título. */
  capa: caminhoImagem.optional(),
  capaMobile: caminhoImagem.optional(),
  capaTablet: caminhoImagem.optional(),
  /** Título exibido na capa, quando diferente do título da página. */
  tituloCapa: z.string().optional(),
  tamanhoTitulo: z.number().positive().optional(),
  capaTitulo,
  /** Sem capa: o conteúdo MDX começa direto (ex.: home, que tem capa própria). */
  semCapa: z.boolean().optional(),
  /** Esconde o breadcrumb. */
  semBreadcrumb: z.boolean().optional(),
});

export const frontmatterSchema = z.discriminatedUnion("familia", [artigoSchema, caseSchema, setorSchema, solucaoSchema, paginaSchema]);

export type Frontmatter = z.infer<typeof frontmatterSchema>;
export type Familia = Frontmatter["familia"];
export type FrontmatterArtigo = z.infer<typeof artigoSchema>;
export type FrontmatterCase = z.infer<typeof caseSchema>;
export type FrontmatterSetor = z.infer<typeof setorSchema>;
export type FrontmatterSolucao = z.infer<typeof solucaoSchema>;
export type FrontmatterPagina = z.infer<typeof paginaSchema>;
