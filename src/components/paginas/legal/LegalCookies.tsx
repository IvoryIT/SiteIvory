import type { ReactNode } from "react";

/**
 * Declaração de cookies no formato do documento gerado pelo plugin Complianz no WordPress:
 * coluna de até 800px, texto em 14px e títulos (de seção e subseção) em 22px.
 */
export function LegalCookies({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-[800px] text-[14px] leading-normal [&>h2]:mt-[15px] [&>h2]:mb-[10px] [&>h2]:pb-[10px] [&>h2]:text-[22px] [&>h2]:font-medium [&>h2]:leading-[1.2] [&>h3]:mt-[15px] [&>h3]:mb-[10px] [&>h3]:pb-[10px] [&>h3]:text-[22px] [&>h3]:font-medium [&>h3]:leading-[1.2] [&_h4]:mt-[10px] [&_h4]:mb-[5px] [&_h4]:text-[14px] [&_h4]:font-bold [&_ul]:mb-[15px] [&_ul]:ml-[15px] [&>p:first-child]:mt-0 [&_a]:underline">
      {children}
    </div>
  );
}

type Props = {
  /** Nome do serviço (ex.: "Google Analytics"). */
  nome: string;
  /** Finalidades, mostradas à direita (ex.: "Estatísticas, Marketing"). */
  finalidades: string;
  /** Detalhes que aparecem ao abrir: uso, compartilhamento e a tabela de cookies. */
  children: ReactNode;
};

/** Serviço da lista "Cookies inseridos": linha cinza que abre os detalhes ao ser clicada. */
export function LegalServicoCookie({ nome, finalidades, children }: Props) {
  return (
    <details className="group bg-cinza-claro/25">
      {/* Mesma grade do Complianz: nome | finalidades | (2 colunas vazias) | seta. */}
      <summary className="my-[5px] grid cursor-pointer list-none grid-cols-[2fr_auto_0_auto_25px] items-center gap-[15px] bg-cinza-claro/50 px-[10px] py-[5px] [&::-webkit-details-marker]:hidden">
        <h3 className="px-[5px] text-[18px] leading-[1.2] font-medium">{nome}</h3>
        <span className="text-right text-[14px]">{finalidades}</span>
        <span />
        <span />
        <svg aria-hidden viewBox="0 0 24 24" className="m-[3px] size-[18px] transition-transform duration-500 group-open:rotate-180">
          <path d="M3 8.5l9 9 9-9" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="px-[15px] pt-2 pb-[15px]">{children}</div>
    </details>
  );
}
