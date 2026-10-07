// Componentes MDX da família "solucao". Reproduzem os blocos do Elementor das páginas
// /solucoes/solucoes-*/ (medidas tiradas do WordPress em 1440, 768 e 390 px).
//
// Convenção dos textos: o editor do Elementor dá margem inferior de 0.9rem a todo parágrafo,
// inclusive o último, e a altura dos cartões depende disso (o texto é centralizado na vertical).
// Por isso os blocos de texto abaixo usam `TEXTO_COM_MARGEM`, que dá o mesmo resultado tanto para
// conteúdo em linha (`<Cartao>texto</Cartao>`) quanto para parágrafos Markdown.
import Image from "next/image";
import { Children, isValidElement, type ReactNode } from "react";
import { LinkInteligente } from "@/components/conteudo/basicos";
import { dimensoesImagem, versaoWebp } from "@/lib/imagens";

const TEXTO_COM_MARGEM = "pb-[0.9rem] [&_p]:mb-[0.9rem] [&_p:last-child]:mb-0";

/**
 * Ícone com as dimensões reais do arquivo. Fica numa linha de texto (alinhado ao meio), como o widget
 * de imagem do Elementor: ícones mais baixos que a linha ganham a altura da linha.
 */
function Icone({ src, alt, className }: { src: string; alt: string; className: string }) {
  const { width, height } = dimensoesImagem(src);
  return (
    <span className="block font-sistema text-base leading-6">
      <Image src={src} alt={alt} width={width} height={height} sizes="48px" className={`inline-block align-middle ${className}`} />
    </span>
  );
}

/** Fundo de imagem para cartões: "cobrir" ajusta a imagem ao cartão; "original" mostra a imagem no tamanho real, a partir do canto. */
function fundo(imagem: string, ajuste: "cobrir" | "original") {
  return {
    style: { ["--fundo" as string]: `url("${versaoWebp(imagem)}")` },
    className: `bg-[image:var(--fundo)] ${ajuste === "cobrir" ? "bg-cover bg-center bg-no-repeat" : ""}`,
  };
}

// --------------------------------------------------------------------------- introdução

type PropsIntroducao = {
  /** Ícone da solução, acima do texto (48px no desktop, 32px no celular). */
  icone?: string;
  iconeAlt?: string;
  /** Parágrafos sem espaço entre si (como no formato "Problema / Solução"). Padrão: espaçados. */
  compacto?: boolean;
  /** Texto em Markdown (parágrafos, listas, <Azul>). */
  children: ReactNode;
};

/** Ícone + texto de abertura logo abaixo da capa, em letra grande (1.4em). */
export function Introducao({ icone, iconeAlt = "", compacto, children }: PropsIntroducao) {
  return (
    <section className="fundo-ruido">
      <div className="container-site py-[10px]">
        {icone && (
          <div className="mb-4">
            <Icone src={icone} alt={iconeAlt} className="h-auto w-[3em] max-md:w-[2em]" />
          </div>
        )}
        <div
          className={`text-[1.4em] leading-[1.5] text-corpo max-md:text-base [&_li]:list-item [&_strong]:font-bold [&_ul]:list-disc [&_ul]:pl-10 ${compacto ? "[&_p]:mb-0" : "[&_p]:mb-[0.9rem]"}`}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------- imagem em quadro branco

/** Imagem larga (diagrama, galeria de logos) dentro de um quadro branco de cantos arredondados. */
export function QuadroImagem({ src, alt }: { src: string; /** Descreva a imagem. */ alt: string }) {
  const { width, height } = dimensoesImagem(src);
  return (
    <section className="fundo-ruido py-8 max-md:p-4">
      <div className="lg:container-site">
        <div className="rounded-[2em] bg-white p-8 max-md:p-4">
          <Image src={src} alt={alt} width={width} height={height} sizes="(max-width: 1160px) 100vw, 1076px" className="h-auto w-full" />
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------- bloco de serviço + grade de cartões

type PropsBlocoServico = {
  /** Nome do serviço (coluna da esquerda, azul). */
  titulo: string;
  /** Descrição em Markdown (coluna da direita, separada por uma linha vertical). */
  children: ReactNode;
};

/** Título à esquerda (40%) + descrição à direita. Costuma vir seguido de uma <GradeCartoes>. */
export function BlocoServico({ titulo, children }: PropsBlocoServico) {
  return (
    <section className="fundo-ruido px-4 pt-4 pb-4 md:pt-8 md:pb-5 lg:px-0">
      <div className="lg:container-site">
        <div className="flex flex-col gap-5 py-4 md:flex-row md:items-center">
          <div className="max-md:text-center md:flex-[0_1_40%] lg:pt-8 lg:pb-6">
            <h2 className="pb-[0.9rem] text-[1.8em] leading-[1.5] font-semibold text-azul">{titulo}</h2>
          </div>
          <div className="leading-6 text-corpo max-md:text-center md:flex-[0_1_60%] md:border-l md:border-linha md:pt-8 md:pb-6 md:pl-8 lg:flex-[0_1_100%]">
            <div className={TEXTO_COM_MARGEM}>{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Grade de cartões: 3 por linha no desktop (a última linha não estica), linhas incompletas esticam no tablet, 1 por linha no celular. */
export function GradeCartoes({ children }: { /** Uma sequência de <Cartao>. */ children: ReactNode }) {
  return (
    <section className="fundo-ruido px-4 pb-8 lg:px-0">
      <div className="lg:container-site">
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-5">{children}</div>
      </div>
    </section>
  );
}

const CARTAO = "flex min-h-[10em] flex-col justify-center rounded-2xl px-4 pt-4 text-center lg:px-8 lg:pt-8 lg:pb-4 lg:text-left";

type PropsCartao = {
  /** Com imagem, vira o cartão de destaque (fundo com a imagem e texto branco em negrito). */
  imagem?: string;
  /** Como a imagem preenche o cartão (padrão "cobrir"). */
  ajuste?: "cobrir" | "original";
  /** Texto do cartão (Markdown curto). */
  children: ReactNode;
};

/** Cartão da <GradeCartoes>: destaque (com imagem) ou item (fundo branco translúcido). */
export function Cartao({ imagem, ajuste = "cobrir", children }: PropsCartao) {
  const f = imagem ? fundo(imagem, ajuste) : undefined;
  return (
    <div className={`${CARTAO} md:flex-[0_0_calc((100%-40px)/3)] md:max-lg:grow ${f ? f.className : "bg-white/50"}`} style={f?.style}>
      <div className={`${TEXTO_COM_MARGEM} ${f ? "text-[1.4em] leading-[1.5] font-bold text-white" : "leading-6 text-texto"}`}>{children}</div>
    </div>
  );
}

// --------------------------------------------------------------------------- lista de serviços (40% / 60%)

type PropsListaServicos = {
  /** Título acima da lista (ex.: "Nossos Serviços"). */
  titulo?: string;
  /** Texto do botão abaixo da lista. */
  chamada?: string;
  /** Destino do botão (links externos abrem em nova aba). */
  chamadaHref?: string;
  /** Uma sequência de <Servico>; os lados se alternam sozinhos (destaque à esquerda, depois à direita...). */
  children: ReactNode;
};

/** Lista de serviços em linhas: cartão de destaque (40%) + descrição (60%), alternando os lados. */
export function ListaServicos({ titulo, chamada, chamadaHref, children }: PropsListaServicos) {
  return (
    <section className="fundo-ruido px-4 pt-4 pb-8 md:pt-8 lg:px-0 lg:pb-0">
      <div className="flex flex-col gap-5 lg:container-site">
        {titulo && <h2 className="pb-[0.9rem] text-[1.8em] leading-[1.5] font-semibold text-azul max-md:text-center">{titulo}</h2>}
        <div className="flex flex-col gap-5">{children}</div>
        {chamada && chamadaHref && (
          <div className="mt-8">
            <LinkInteligente href={chamadaHref} className="botao text-[1.4em]">
              {chamada}
            </LinkInteligente>
          </div>
        )}
      </div>
    </section>
  );
}

type PropsServico = {
  /** Nome do serviço, em branco sobre a imagem. */
  titulo: string;
  /** Imagem de fundo do cartão de destaque. */
  imagem: string;
  ajuste?: "cobrir" | "original";
  /** Descrição curta em Markdown. */
  children: ReactNode;
};

/** Uma linha da <ListaServicos>. */
export function Servico({ titulo, imagem, ajuste = "cobrir", children }: PropsServico) {
  const f = fundo(imagem, ajuste);
  return (
    <div className="group flex flex-col gap-4 md:flex-row md:gap-5">
      <div className={`${CARTAO} md:flex-[0_1_40%] ${f.className}`} style={f.style}>
        <p className={`${TEXTO_COM_MARGEM} text-[1.4em] leading-[1.5] font-bold text-white`}>{titulo}</p>
      </div>
      <div className={`${CARTAO} bg-white/50 group-even:order-first md:flex-[0_1_60%]`}>
        <div className={`${TEXTO_COM_MARGEM} text-[1.2em] leading-[1.5] text-texto`}>{children}</div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------- diferenciais (faixa creme)

type PropsDiferencial = {
  /** Ícone pequeno (24px) acima do texto. */
  icone?: string;
  iconeAlt?: string;
  children: ReactNode;
};

/** Item da faixa <Diferenciais>. */
export function Diferencial({ icone, iconeAlt = "", children }: PropsDiferencial) {
  return (
    <div className="p-8">
      {icone && (
        <div className="mb-4">
          <Icone src={icone} alt={iconeAlt} className="h-auto w-6" />
        </div>
      )}
      <div className={`font-sistema text-[1.1em] leading-[1.5] text-corpo [&_strong]:font-bold ${TEXTO_COM_MARGEM}`}>{children}</div>
    </div>
  );
}

/**
 * Faixa creme com um título (Markdown `## ...`) e itens <Diferencial> em grade 2 x N, separados por
 * linhas finas. No WordPress esta faixa usa a fonte do sistema, não a Poppins.
 */
export function Diferenciais({ children }: { children: ReactNode }) {
  const itens: ReactNode[] = [];
  const cabecalho: ReactNode[] = [];
  Children.forEach(children, (filho) => {
    if (isValidElement(filho) && filho.type === Diferencial) itens.push(filho);
    else cabecalho.push(filho);
  });
  return (
    <section className="bg-creme fundo-ruido pt-4 md:py-8">
      <div className="max-md:p-4 lg:container-site">
        <div className="mb-5 font-sistema text-[2em] leading-[1.5] font-medium text-corpo max-lg:text-center md:text-[2.5em] [&_em]:italic [&_h2]:pb-[0.9rem] [&_strong]:font-bold">
          {cabecalho}
        </div>
        <div className="grid border-linha md:grid-cols-2 md:p-8 [&>*]:border-linha max-md:[&>*:not(:last-child)]:border-b md:[&>*:nth-child(-n+2)]:border-b md:[&>*:nth-child(even)]:border-l md:[&>*:nth-child(n+3)]:border-t md:[&>*:nth-child(odd)]:border-r">
          {itens}
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------- banner de e-book

type PropsBannerEbook = {
  /** Fundo do desktop (com o recorte desenhado). */
  imagem: string;
  /** Fundo do tablet e do celular. */
  imagemMobile?: string;
  /** Linha pequena acima do título (ex.: "E-book"). */
  rotulo?: string;
  titulo: string;
  subtitulo?: string;
  /** Texto do botão (ex.: "BAIXE AGORA"). */
  botao: string;
  /** Destino do botão (página de download). */
  href: string;
  /** Respiro de 2em abaixo do banner no desktop. */
  respiro?: boolean;
};

/** Banner de material rico: textos em branco à esquerda e botão de contorno branco à direita (centralizado no tablet/celular). */
export function BannerEbook({ imagem, imagemMobile, rotulo, titulo, subtitulo, botao, href, respiro }: PropsBannerEbook) {
  const desktop = versaoWebp(imagem);
  const mobile = imagemMobile ? versaoWebp(imagemMobile) : desktop;
  return (
    <section className={`fundo-ruido md:max-lg:pb-8 lg:pt-8 ${respiro ? "lg:pb-8" : ""}`}>
      <div className="lg:container-site">
        <div
          className="relative flex min-h-[20em] flex-col justify-center bg-[image:var(--m)] bg-cover bg-no-repeat px-8 py-12 text-center text-white lg:bg-[image:var(--d)] lg:bg-contain lg:pt-8 lg:pr-0 lg:pb-10 lg:pl-12 lg:text-left"
          style={{ ["--d" as string]: `url("${desktop}")`, ["--m" as string]: `url("${mobile}")` }}
        >
          <div className="flex flex-col gap-5">
            {rotulo && <p className="pb-[0.9rem] text-[1.6em] leading-[1.5] italic">{rotulo}</p>}
            <p className="text-[1.6em] leading-[1.5] font-bold italic md:text-[2.2em] lg:w-1/2">{titulo}</p>
            {subtitulo && <p className="pb-[0.9rem] text-[1.3em] leading-[1.5] font-light lg:w-[30%]">{subtitulo}</p>}
          </div>
          <LinkInteligente
            href={href}
            className="inline-flex items-center justify-center self-center rounded-[18px] border-[3px] border-white px-6 py-3 text-[1.2em] leading-none tracking-[0.3em] text-white italic transition-colors hover:bg-white hover:text-azul md:text-[20px] lg:absolute lg:top-[calc(50%-4px)] lg:right-32 lg:-translate-y-1/2"
          >
            {botao}
          </LinkInteligente>
        </div>
      </div>
    </section>
  );
}
