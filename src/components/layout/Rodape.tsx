import Image from "next/image";
import Link from "next/link";
import { BotaoPreferenciasCookies } from "@/components/consentimento/Consentimento";
import { ehExterno, menuRodape, site } from "@/lib/site";

const titulo = "text-[1.2em] leading-[1.5] font-bold italic text-azul";

export function Rodape() {
  return (
    <footer className="relative">
      {/* Faixa com a textura de fundo e, dentro, o painel branco na coluna de 1140px, colado no
          bloco anterior (o template do Elementor, sem a otimização do LiteSpeed). */}
      <div className="relative fundo-ruido">
      {/* Manchas em degradê (imagem "section-bg") por cima do rodapé e do bloco anterior, ancoradas
          embaixo e na largura toda, como o elemento decorativo do template; não recebem cliques. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[2]">
        <Image src="/wp-content/uploads/2025/09/section-bg.svg.png" alt="" width={1216} height={871} sizes="100vw" className="h-auto w-full" />
      </div>
      <div className="mx-auto w-full max-w-[1140px] bg-white fundo-ruido pt-12 pb-4 text-center md:px-8 md:pt-4 md:pb-12 md:text-left">
        {/* Colunas como no Elementor: laterais com 50% (60% à esquerda no tablet) e a do meio com 100%,
            todas encolhendo na proporção (flex-shrink), o que dá ~240/518/258px na coluna de 1140px. */}
        <div className="flex flex-col gap-5 p-[10px] md:flex-row">
          <div className="flex flex-col items-center justify-center gap-4 md:w-[60%] md:items-start lg:w-1/2">
            <Image src={site.logo} alt="Logo da Ivory" width={121} height={26} className="h-auto w-[121px]" />
            <p className="mb-[14px] text-[1.2em] leading-[1.5] font-semibold italic text-azul">{site.slogan}</p>
          </div>

          <div className="border-linha/50 md:w-full md:border-x-2 md:px-8">
            <p className={`${titulo} mb-[9px] md:mb-7`}>Entre em contato:</p>
            <p className="text-[1.2em] leading-[1.5] font-medium text-azul">{site.telefone}</p>
            <p className={`${titulo} mt-7`}>Endereços:</p>
            {site.enderecos.map((e) => (
              <div key={e.cidade} className="mt-[18px] md:mt-[26px]">
                <p className="text-[1.1em] leading-[1.5] font-medium italic text-azul">{e.cidade}</p>
                {e.linhas.map((l) => (
                  <p key={l} className="text-[0.8em] leading-[1.5] text-azul">
                    {l}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center gap-4 md:w-1/2 md:items-start md:pl-8">
            <p className={`${titulo} mb-[9px]`}>Ivory:</p>
            <nav aria-label="Rodapé" className="flex flex-col gap-4">
              {menuRodape.map((item) =>
                ehExterno(item.href) ? (
                  <a key={item.rotulo} href={item.href} target="_blank" rel="noopener noreferrer" className="text-[1.2em] leading-none italic text-azul">
                    {item.rotulo}
                  </a>
                ) : (
                  <Link key={item.rotulo} href={item.href} className="text-[1.2em] leading-none italic text-azul">
                    {item.rotulo}
                  </Link>
                ),
              )}
            </nav>
            <p className={`${titulo} mt-[19px]`}>Conecte-se:</p>
            <div className="flex justify-center gap-4 md:justify-start">
              {site.redes.map((r) => (
                <a key={r.nome} href={r.url} target="_blank" rel="noopener noreferrer" aria-label={r.nome}>
                  <Image src={r.icone} alt={r.nome} width={32} height={32} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>

      <div className="bg-texto">
        <div className="p-4 lg:container-site lg:pl-8">
          <p className="text-[11px] leading-none text-white">
            Copyright 2024 Ivory. Todos os direitos reservados.{" "}
            <BotaoPreferenciasCookies className="ml-2 cursor-pointer text-white/70 underline" />
          </p>
        </div>
      </div>
    </footer>
  );
}
