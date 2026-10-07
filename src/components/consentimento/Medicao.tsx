import Script from "next/script";
import { medicao } from "@/lib/site";

/**
 * Google Tag Manager + tag do Google com o Consent Mode v2. O estado inicial depende de
 * `medicao.modoConsentimento`; o banner (Consentimento.tsx) atualiza conforme a escolha.
 * O Clarity é carregado pelo banner, só com consentimento de estatística.
 */
export function Medicao() {
  const padrao = medicao.modoConsentimento === "opt-in" ? "denied" : "granted";
  const inicial = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
var salvo = null;
try { salvo = JSON.parse(localStorage.getItem("ivory-consentimento") || "null"); } catch (e) {}
var est = salvo ? (salvo.estatisticas ? "granted" : "denied") : "${padrao}";
var mkt = salvo ? (salvo.marketing ? "granted" : "denied") : "${padrao}";
gtag("consent", "default", {
  analytics_storage: est,
  ad_storage: mkt,
  ad_user_data: mkt,
  ad_personalization: mkt,
  functionality_storage: "granted",
  security_storage: "granted",
  wait_for_update: 500
});
gtag("js", new Date());
gtag("config", "${medicao.googleTag}");
`;
  return (
    <>
      {/* No App Router, beforeInteractive é válido no layout raiz (onde este componente é usado). */}
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
      <Script id="consentimento-padrao" strategy="beforeInteractive">
        {inicial}
      </Script>
      <Script id="google-tag" src={`https://www.googletagmanager.com/gtag/js?id=${medicao.googleTag}`} strategy="afterInteractive" />
      <Script id="gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${medicao.gtm}');`}
      </Script>
    </>
  );
}
