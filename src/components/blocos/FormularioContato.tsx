"use client";

import Image from "next/image";
import { useState, useSyncExternalStore, type FormEvent } from "react";
import { site } from "@/lib/site";

/**
 * Formulário de contato que envia o lead ao motor de score do Marketing.
 * O navegador posta em /api/lead/ (mesmo domínio); a Vercel repassa à function
 * `lead-receiver` (ver next.config.ts). Contrato: README do repositório
 * MKT_function_lead_receiver_processor, seção "Contrato da Landing Page".
 *
 * Variantes (iguais aos formulários do WPForms que substitui):
 *   com-area  -> antigo formulário 342 (com "Área de atuação")
 *   sem-area  -> antigo formulário 5854
 */

const CAMPANHA = "site_institucional";
const UTMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;
/**
 * UTMs que viram campo de opções no Pipedrive: só vão com os valores que existem lá (as options
 * de PIPEDRIVE_CUSTOM_FIELD_UTM_SOURCE em produção). Valor fora da lista derruba o deal no motor
 * (PipedriveAdapter repassa o valor cru), então segue em `<utm>_original`, que só a análise e a
 * tabela Leads leem. Mesma regra do plugin ivory-motor-score e do scoring_prompt da campanha
 * `site_institucional`. utm_medium ainda não tem options levantadas: vai sempre como original.
 * Criou uma option nova no Pipedrive? Inclua aqui no mesmo dia.
 */
const UTMS_PERMITIDAS: Partial<Record<(typeof UTMS)[number], string[]>> = {
  utm_source: ["meta", "linkedin", "lp"],
  utm_medium: [],
};
// Mesma regra de e-mail do motor (src/lib/validate.ts).
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Campo = { nome: string; rotulo: string; obrigatorio?: boolean; tipo?: "text" | "email" | "tel" | "textarea"; largura?: "metade" | "inteira" };

const camposBase: Campo[] = [
  { nome: "nome", rotulo: "Nome", obrigatorio: true },
  { nome: "email", rotulo: "E-mail", obrigatorio: true, tipo: "email" },
  { nome: "empresa", rotulo: "Empresa" },
  { nome: "telefone", rotulo: "Telefone", tipo: "tel" },
  { nome: "cargo", rotulo: "Cargo" },
];

type Estado = "pronto" | "enviando" | "enviado" | "erro" | "invalido";

// Sorteio da foto feito uma vez no navegador (no servidor sai a primeira), sem divergência na hidratação.
let sorteio: number | null = null;
const nada = () => () => {};
function useSorteio(quantidade: number) {
  return useSyncExternalStore(nada, () => (sorteio ??= Math.floor(Math.random() * Math.max(quantidade, 1))), () => 0);
}

export function FormularioContato({
  variante = "com-area",
  titulo = "Leve sua operação para a próxima marcha!",
  fotos,
}: {
  variante?: "com-area" | "sem-area";
  titulo?: string;
  /** Fotos sorteadas ao lado do formulário (antigo shortcode [imagem_random]). */
  fotos: { src: string; width: number; height: number }[];
}) {
  const [estado, setEstado] = useState<Estado>("pronto");
  const [mensagemErro, setMensagemErro] = useState("");
  // No WordPress o sorteio era a cada carregamento (shortcode [imagem_random]).
  const foto = fotos[useSorteio(fotos.length)] ?? fotos[0];

  const campos: Campo[] = [
    ...camposBase,
    ...(variante === "com-area" ? [{ nome: "area_atuacao", rotulo: "Área de atuação" }] : []),
    { nome: "mensagem", rotulo: "Mensagem", tipo: "textarea", largura: "inteira" },
  ];

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const form = evento.currentTarget;
    const dados = new FormData(form);
    if (dados.get("site_url")) return; // campo-isca preenchido: robô

    const email = String(dados.get("email") ?? "").trim();
    if (!String(dados.get("nome") ?? "").trim() || !EMAIL_VALIDO.test(email)) {
      setEstado("invalido");
      setMensagemErro("Preencha nome e um e-mail válido.");
      return;
    }

    const payload: Record<string, string> = {
      campaign_id: CAMPANHA,
      formulario_id: variante === "com-area" ? "342" : "5854",
      pagina_titulo: document.title,
      pagina_url: window.location.href,
    };
    if (document.referrer) payload.url_referer = document.referrer;
    for (const c of campos) {
      const v = String(dados.get(c.nome) ?? "").trim();
      if (v) payload[c.nome] = v;
    }
    const params = new URLSearchParams(window.location.search);
    for (const u of UTMS) {
      const v = params.get(u)?.trim();
      if (!v) continue;
      const permitidas = UTMS_PERMITIDAS[u];
      if (!permitidas) payload[u] = v;
      else if (permitidas.includes(v.toLowerCase())) payload[u] = v.toLowerCase();
      else payload[`${u}_original`] = v;
    }

    setEstado("enviando");
    try {
      const resposta = await fetch("/api/lead/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (resposta.status === 202 || resposta.ok) {
        setEstado("enviado");
        form.reset();
        return;
      }
      setEstado(resposta.status === 400 ? "invalido" : "erro");
      setMensagemErro(resposta.status === 400 ? "Revise os campos e tente novamente." : "");
    } catch {
      setEstado("erro");
    }
  }

  return (
    <div id="contato" className="flex flex-col gap-0 lg:flex-row lg:gap-16">
      <div className="lg:w-[627px] lg:shrink-0">
        <p className="mb-[14px] text-center text-[22px] leading-[1.5] font-medium text-azul italic md:text-left">{titulo}</p>
        {estado === "enviado" ? (
          <p className="text-base leading-6 text-corpo" role="status">
            Obrigado por nos contatar! Entraremos em contato em breve.
          </p>
        ) : (
          <form onSubmit={enviar} noValidate className="flex flex-wrap gap-[0.8em]">
            {campos.map((c) => (
              <div key={c.nome} className={`min-w-[200px] ${c.largura === "inteira" ? "basis-full" : "flex-[1_1_48%]"}`}>
                <label htmlFor={`f-${variante}-${c.nome}`} className="mb-px block text-[14px] leading-[19px] text-black/85">
                  {c.rotulo}
                  {c.obrigatorio && <span className="text-erro"> *</span>}
                </label>
                {c.tipo === "textarea" ? (
                  <textarea
                    id={`f-${variante}-${c.nome}`}
                    name={c.nome}
                    rows={4}
                    className="block h-[120px] w-full rounded-[12px] border border-black/25 bg-transparent p-[14px] text-base outline-none focus:border-azul"
                  />
                ) : (
                  <input
                    id={`f-${variante}-${c.nome}`}
                    name={c.nome}
                    type={c.tipo ?? "text"}
                    required={c.obrigatorio}
                    autoComplete={c.nome === "nome" ? "name" : c.nome === "email" ? "email" : c.nome === "telefone" ? "tel" : c.nome === "empresa" ? "organization" : c.nome === "cargo" ? "organization-title" : "off"}
                    className="block h-[43px] w-full rounded-[12px] border border-black/25 bg-transparent px-[14px] text-base outline-none focus:border-azul"
                  />
                )}
              </div>
            ))}
            {/* Campo-isca invisível: pessoas não preenchem, robôs sim. */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Não preencha este campo
                <input type="text" name="site_url" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <div className="basis-full">
              <button
                type="submit"
                disabled={estado === "enviando"}
                className="mt-[25px] h-[41px] rounded-[68px] bg-laranja px-[25px] font-sistema text-[17px] leading-none font-medium text-white italic transition-colors hover:bg-azul disabled:opacity-60"
              >
                {estado === "enviando" ? "Enviando..." : "Enviar"}
              </button>
              {(estado === "erro" || estado === "invalido") && (
                <p role="alert" className="mt-3 text-sm text-erro">
                  {estado === "invalido" ? mensagemErro : (
                    <>
                      Não conseguimos enviar agora. Tente novamente em instantes ou fale com a gente pelo{" "}
                      <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="underline">
                        WhatsApp
                      </a>
                      .
                    </>
                  )}
                </p>
              )}
            </div>
          </form>
        )}
      </div>
      {foto && (
        <div className="pt-8 text-center lg:flex-1">
          <Image
            src={foto.src}
            alt="Pessoa do time da Ivory"
            width={foto.width}
            height={foto.height}
            sizes="(max-width: 1024px) 90vw, 321px"
            style={{ maxWidth: foto.width }}
            className="inline-block h-auto w-full rounded-[32px] align-middle"
          />
        </div>
      )}
    </div>
  );
}
