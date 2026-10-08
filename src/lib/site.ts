// Dados fixos do site: identidade, menu, contatos e endereços.
// Alterar aqui muda o cabeçalho, o rodapé e os dados estruturados (JSON-LD) de todas as páginas.

export const site = {
  nome: "Ivory",
  url: "https://ivoryit.com.br",
  slogan: "IA. Nossa sexta marcha.",
  descricao:
    "Desenvolvimento de software com IA agêntica no Brasil para automatizar processos, integrar sistemas e impulsionar o crescimento das empresas.",
  logo: "/wp-content/uploads/2025/09/logo.png",
  whatsapp: "https://wa.me/5511976009997",
  // Botão flutuante do WhatsApp (no WordPress vinha do pop-up do RD Station).
  whatsappAtendimento: "https://wa.me/553195040450",
  telefone: "+55 (31) 2552-1605",
  emailCurriculos: "genteegestao@ivoryit.com.br",
  redes: [
    { nome: "Instagram", url: "https://www.instagram.com/ivory_it/", icone: "/wp-content/uploads/2025/09/Group-318.png" },
    { nome: "LinkedIn", url: "https://www.linkedin.com/company/ivoryit/", icone: "/wp-content/uploads/2025/09/Group-317.png" },
  ],
  enderecos: [
    { cidade: "Betim", linhas: ["Rua Gervásio Lara, 240, Brasiléia", "| CEP: 32.600-288"] },
    { cidade: "Belo Horizonte", linhas: ["Av. do Contorno, 6594, 7º andar,", "Savassi | CEP: 32.600-288"] },
    { cidade: "São Paulo", linhas: ["Rua Alexandre Dumas, 1711 – 5º andar", "– Birmann 11 Chácara Santo Antônio", "| CEP: 04717-004"] },
  ],
} as const;

/**
 * Ferramentas de medição (IDs públicos, aparecem no HTML de qualquer forma).
 * Iguais às do WordPress: GTM do Complianz, tag do Google do Site Kit e Clarity.
 */
export const medicao = {
  gtm: "GTM-NXDV4Z3L",
  googleTag: "GT-WKTSL2QR",
  clarity: "tydcrnewsu",
  /**
   * opt-out: mede desde a entrada e o visitante pode negar (comportamento atual do WordPress).
   * opt-in: só mede depois do "Aceitar" (mais conservador perante a LGPD).
   */
  modoConsentimento: "opt-out" as "opt-out" | "opt-in",
};

export type ItemMenu = { rotulo: string; href: string; filhos?: ItemMenu[]; destaque?: boolean };

export const menuPrincipal: ItemMenu[] = [
  { rotulo: "Como fazemos", href: "/como-fazemos/" },
  { rotulo: "Cases", href: "/cases-de-sucesso-ivory/" },
  {
    rotulo: "Soluções",
    href: "/solucoes/",
    filhos: [
      { rotulo: "Outsourcing", href: "/solucoes/solucoes-outsourcing/" },
      { rotulo: "Agents de IA", href: "/solucoes/solucoes-agents-ia/" },
      { rotulo: "Dados", href: "/solucoes/solucoes-dados/" },
      { rotulo: "IA Multimodal", href: "/solucoes/solucoes-ia-multimodal/" },
      { rotulo: "Modern work", href: "/solucoes/solucoes-modern-work/" },
      { rotulo: "Cloud", href: "/solucoes/solucoes-cloud/" },
      { rotulo: "SAP", href: "/solucoes/solucoes-sap/" },
    ],
  },
  { rotulo: "Blog", href: "/blog/" },
  { rotulo: "Carreiras", href: "/carreiras/" },
  { rotulo: "Entre em contato", href: site.whatsapp, destaque: true },
];

export const menuRodape: ItemMenu[] = [
  { rotulo: "Soluções", href: "/solucoes/" },
  { rotulo: "Cases", href: "/cases-de-sucesso-ivory/" },
  { rotulo: "Carreiras", href: "/carreiras/" },
  { rotulo: "Contato", href: site.whatsapp },
  { rotulo: "Portal de Privacidade", href: "/portal-de-privacidade/" },
];

/** Link externo abre em nova aba (substitui o snippet "abrir-outra-aba" do WordPress). */
export function ehExterno(href: string) {
  return /^https?:\/\//.test(href) && !href.startsWith(site.url);
}
