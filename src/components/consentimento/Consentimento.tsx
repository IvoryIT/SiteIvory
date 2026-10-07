"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { medicao } from "@/lib/site";

/**
 * Banner de consentimento de cookies (substitui o Complianz). Mesmos botões e textos:
 * Aceitar, Negar e Ver preferências (Funcional sempre ativo; Estatísticas; Marketing).
 * A escolha fica em localStorage e é repassada ao Google Consent Mode v2 e ao Clarity.
 */

type Escolha = { estatisticas: boolean; marketing: boolean; data: string };
const CHAVE = "ivory-consentimento";
const EVENTO_SALVO = "ivory:consentimento-salvo";
const EVENTO_REABRIR = "ivory:consentimento";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[] };
  }
}

// Escolha salva, lida como "fonte externa" (sem divergência entre o HTML do servidor e o navegador).
function assinar(aviso: () => void) {
  window.addEventListener("storage", aviso);
  window.addEventListener(EVENTO_SALVO, aviso);
  return () => {
    window.removeEventListener("storage", aviso);
    window.removeEventListener(EVENTO_SALVO, aviso);
  };
}
function lerBruto(): string | null {
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}
function interpretar(bruto: string | null): Escolha | null {
  try {
    return bruto ? (JSON.parse(bruto) as Escolha) : null;
  } catch {
    return null;
  }
}
const nada = () => () => {};

function carregarClarity() {
  if (document.getElementById("clarity")) {
    window.clarity?.("consent");
    return;
  }
  const w = window as unknown as Record<string, unknown>;
  w.clarity =
    w.clarity ||
    function (...args: unknown[]) {
      ((w.clarity as { q?: unknown[] }).q = (w.clarity as { q?: unknown[] }).q || []).push(args);
    };
  const s = document.createElement("script");
  s.id = "clarity";
  s.async = true;
  s.src = `https://www.clarity.ms/tag/${medicao.clarity}`;
  document.head.appendChild(s);
}

/** `medir`: carrega as ferramentas de medição (só em produção; ver layout.tsx). */
export function Consentimento({ medir }: { medir: boolean }) {
  const montado = useSyncExternalStore(nada, () => true, () => false);
  const bruto = useSyncExternalStore(assinar, lerBruto, () => null);
  const salvo = interpretar(bruto);
  const [reaberto, setReaberto] = useState(false);
  const [preferencias, setPreferencias] = useState(false);
  const [estatisticas, setEstatisticas] = useState(true);
  const [marketing, setMarketing] = useState(true);

  // Clarity: carrega com consentimento de estatística (ou no modo opt-out, até o visitante negar).
  useEffect(() => {
    if (!medir) return;
    const permite = salvo ? salvo.estatisticas : medicao.modoConsentimento === "opt-out";
    if (permite) carregarClarity();
    else window.clarity?.("consent", false);
  }, [medir, salvo]);

  // Reabrir pelo link "Preferências de cookies" do rodapé.
  useEffect(() => {
    const reabrir = () => {
      const atual = interpretar(lerBruto());
      if (atual) {
        setEstatisticas(atual.estatisticas);
        setMarketing(atual.marketing);
      }
      setPreferencias(true);
      setReaberto(true);
    };
    window.addEventListener(EVENTO_REABRIR, reabrir);
    return () => window.removeEventListener(EVENTO_REABRIR, reabrir);
  }, []);

  function salvar(e: Pick<Escolha, "estatisticas" | "marketing">) {
    const escolha: Escolha = { ...e, data: new Date().toISOString() };
    try {
      localStorage.setItem(CHAVE, JSON.stringify(escolha));
    } catch {
      /* navegação privada: vale só para esta visita */
    }
    const est = e.estatisticas ? "granted" : "denied";
    const mkt = e.marketing ? "granted" : "denied";
    window.gtag?.("consent", "update", { analytics_storage: est, ad_storage: mkt, ad_user_data: mkt, ad_personalization: mkt });
    window.dispatchEvent(new Event(EVENTO_SALVO));
    setReaberto(false);
    setPreferencias(false);
  }

  if (!montado || (salvo && !reaberto)) return null;

  const botao = "h-[45px] flex-1 rounded-md px-2.5 text-[15px] leading-5 font-medium italic transition-colors";
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consentimento-titulo"
      className="fixed inset-x-0 bottom-0 z-[60] rounded-t-xl bg-white p-5 text-[#222] shadow-[0_0_10px_rgba(0,0,0,0.25)] md:inset-x-auto md:right-6 md:bottom-6 md:w-[526px] md:rounded-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <p id="consentimento-titulo" className="flex-1 text-center text-[15px] leading-6 font-medium">
          Gerenciar o consentimento
        </p>
        <button type="button" aria-label="Fechar" onClick={() => salvar({ estatisticas, marketing })} className="text-xl leading-none">
          ✕
        </button>
      </div>
      <p className="mt-4 text-[12px] leading-[18px]">
        Para fornecer as melhores experiências, usamos tecnologias como cookies para armazenar e/ou acessar informações do dispositivo. O consentimento para essas
        tecnologias nos permitirá processar dados como comportamento de navegação ou IDs exclusivos neste site. Não consentir ou retirar o consentimento pode afetar
        negativamente certos recursos e funções.
      </p>

      {preferencias && (
        <div className="mt-4 space-y-2 text-[13px]">
          <div className="flex items-center justify-between rounded-md bg-[#f9f9f9] px-3 py-2">
            <span className="font-medium">Funcional</span>
            <span className="text-[12px] text-[#555]">Sempre ativo</span>
          </div>
          <label className="flex items-center justify-between rounded-md bg-[#f9f9f9] px-3 py-2">
            <span className="font-medium">Estatísticas</span>
            <input type="checkbox" checked={estatisticas} onChange={(e) => setEstatisticas(e.target.checked)} />
          </label>
          <label className="flex items-center justify-between rounded-md bg-[#f9f9f9] px-3 py-2">
            <span className="font-medium">Marketing</span>
            <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
          </label>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2.5 md:flex-row">
        <button type="button" onClick={() => salvar({ estatisticas: true, marketing: true })} className={`${botao} bg-[#1e73be] text-white hover:bg-[#165a95]`}>
          Aceitar
        </button>
        <button type="button" onClick={() => salvar({ estatisticas: false, marketing: false })} className={`${botao} border border-[#f2f2f2] bg-[#f9f9f9] hover:bg-[#eee]`}>
          Negar
        </button>
        {preferencias ? (
          <button type="button" onClick={() => salvar({ estatisticas, marketing })} className={`${botao} border border-[#f2f2f2] bg-[#f9f9f9] text-[#333] hover:bg-[#eee]`}>
            Salvar preferências
          </button>
        ) : (
          <button type="button" onClick={() => setPreferencias(true)} className={`${botao} border border-[#f2f2f2] bg-[#f9f9f9] text-[#333] hover:bg-[#eee]`}>
            Ver preferências
          </button>
        )}
      </div>
      <p className="mt-3 flex justify-center gap-3 text-[12px]">
        <Link href="/politica-de-cookies/" className="text-[#1e73be] underline">
          Política de cookies
        </Link>
        <Link href="/portal-de-privacidade/" className="text-[#1e73be] underline">
          Portal de privacidade
        </Link>
      </p>
    </div>
  );
}

/** Link para reabrir o banner (rodapé). */
export function BotaoPreferenciasCookies({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(EVENTO_REABRIR))}>
      Preferências de cookies
    </button>
  );
}
