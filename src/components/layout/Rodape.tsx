import Image from "next/image";
import Link from "next/link";
import { BotaoPreferenciasCookies } from "@/components/consentimento/Consentimento";
import { ehExterno, menuRodape, site } from "@/lib/site";

const titulo = "text-[1.2em] leading-[1.5] font-bold italic text-azul";

export function Rodape() {
  return (
    <footer className="relative">
      {/* Faixa creme de ~22px acima e abaixo do bloco branco, como no WordPress. */}
      <div className="fundo-ruido py-[22px]">
      <div className="bg-white fundo-ruido pt-12 pb-4 text-center md:px-8 md:pt-4 md:pb-12 md:text-left">
        <div className="flex flex-col gap-5 p-[10px] md:flex-row">
          <div className="flex flex-col items-center justify-center gap-4 md:w-[24.4%] md:shrink-0 md:items-start lg:w-[316px]">
            <Image src={site.logo} alt="Logo da Ivory" width={121} height={26} className="h-auto w-[121px]" />
            <p className="mb-[14px] text-[1.2em] leading-[1.5] font-semibold italic text-azul">{site.slogan}</p>
          </div>

          <div className="border-linha md:flex-1 md:border-x md:px-8">
            <p className={`${titulo} mb-[9px] md:mb-7`}>Entre em contato:</p>
            <p className="text-[1.2em] leading-[1.5] font-medium text-azul">{site.telefone}</p>
            <p className={`${titulo} mt-7`}>Endereços:</p>
            {site.enderecos.map((e) => (
              <div key={e.cidade} className="mt-[26px]">
                <p className="text-[1.1em] leading-[1.5] font-medium italic text-azul">{e.cidade}</p>
                {e.linhas.map((l) => (
                  <p key={l} className="text-[0.8em] leading-[1.5] text-azul">
                    {l}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center gap-4 md:w-[23.1%] md:shrink-0 md:items-start md:pl-8 lg:w-[333px]">
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
