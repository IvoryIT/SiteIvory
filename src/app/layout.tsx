import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Poppins } from "next/font/google";
import { Consentimento } from "@/components/consentimento/Consentimento";
import { Medicao } from "@/components/consentimento/Medicao";
import { Cabecalho } from "@/components/layout/Cabecalho";
import { Rodape } from "@/components/layout/Rodape";
import { site } from "@/lib/site";
import "./globals.css";

// Fontes servidas pelo próprio site (o next/font baixa no build): nada é pedido ao Google
// no navegador do visitante, o que dispensa declarar o Google Fonts no banner de cookies.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.nome} — Desenvolvimento de Software com IA Agêntica | Brasil`, template: `%s` },
  description: site.descricao,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fff6df",
};

// Medição (GTM, Google tag, Clarity) só no site publicado: preview e ambiente local não
// poluem os relatórios de produção.
const MEDIR = process.env.VERCEL_ENV === "production";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} ${hanken.variable}`}>
      <body>
        {MEDIR && <Medicao />}
        <Cabecalho />
        <main>{children}</main>
        <Rodape />
        <Consentimento medir={MEDIR} />
      </body>
    </html>
  );
}
