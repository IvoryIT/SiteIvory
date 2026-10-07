import type { ReactNode } from "react";

/**
 * Estilo dos textos legais, igual ao do WordPress: fonte do sistema (não a Poppins), títulos
 * do tema Hello e links no rosa padrão do tema (#cc3366), que não faz parte da paleta da marca.
 */
const estiloDocumento = [
  "[&_p]:mb-[0.9rem]",
  "[&>h2]:mt-2 [&>h2]:mb-4 [&>h2]:text-[2rem] [&>h2]:leading-[1.2] [&>h2]:font-medium",
  "[&>h3]:mt-2 [&>h3]:mb-4 [&>h3]:text-[1.75rem] [&>h3]:leading-[1.2] [&>h3]:font-bold",
  "[&>h4]:mt-2 [&>h4]:mb-4 [&>h4]:text-[1.5rem] [&>h4]:leading-[1.2] [&>h4]:font-bold",
  "[&_ul]:list-disc [&_ul]:pl-10 [&_ol]:list-decimal [&_ol]:pl-10",
  "[&_strong]:font-bold [&_em]:italic",
  "[&_a]:text-link-legal [&_a:hover]:text-link-legal-hover",
  "[&_table]:mb-[0.9rem] [&_table]:w-full [&_td]:border [&_td]:border-borda-tabela [&_td]:p-2 [&_th]:border [&_th]:border-borda-tabela [&_th]:p-2 [&_th]:text-left",
].join(" ");

/**
 * Página de texto legal (política de privacidade, portal de privacidade, política de cookies):
 * título centralizado e o texto corrido em Markdown, sem capa nem breadcrumb.
 */
export function LegalDocumento({ titulo, children }: { titulo?: string; children: ReactNode }) {
  return (
    <section className="fundo-ruido px-4 pt-24 pb-20 font-sistema text-base leading-normal text-corpo md:pt-32 md:pb-28 lg:px-0 lg:pt-40 lg:pb-0">
      <div className="flex flex-col gap-5 lg:container-site">
        {titulo && <h1 className="text-center text-[2rem] leading-none font-medium">{titulo}</h1>}
        <div className={estiloDocumento}>{children}</div>
      </div>
    </section>
  );
}

/**
 * Parágrafo centralizado (ex.: a frase de boas-vindas do Portal de Privacidade). Em página sem
 * `titulo`, a frase vem como `# …` e vira o H1 com a mesma cara de parágrafo em negrito.
 */
export function LegalCentralizado({ children }: { children: ReactNode }) {
  return <div className="text-center [&>h1]:mb-[0.9rem] [&>h1]:font-bold">{children}</div>;
}
