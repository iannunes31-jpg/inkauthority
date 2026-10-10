// Structured artist profile shown in Dante's settings and injected into its prompt.
export const ARTIST_INFO_FIELDS = [
  { key: "artist_name", label: "Nome do tatuador", placeholder: "Ex: Ana Souza" },
  { key: "city", label: "Cidade e país", placeholder: "Ex: Rio de Janeiro, Brasil" },
  { key: "languages", label: "Idiomas de atendimento", placeholder: "Ex: Português, inglês e espanhol" },
  { key: "experience", label: "Tempo de experiência", placeholder: "Ex: 8 anos tatuando" },
  { key: "specialties", label: "Especialidades", placeholder: "Ex: Fineline, floral, realismo preto e cinza" },
  { key: "refused_styles", label: "Estilos que não realiza", placeholder: "Ex: Old school, cover-up, tatuagem em rosto" },
  { key: "socials", label: "Redes sociais", placeholder: "Ex: @ana.tattoo no Instagram e TikTok" },
  { key: "portfolio", label: "Portfólio (link)", placeholder: "Ex: https://..." },
] as const;

export const POSITIONING_OPTIONS = [
  {
    key: "versatil",
    label: "Profissional versátil, que atende diferentes estilos",
    prompt:
      "Posicionamento: profissional versatil. Acolha ideias de estilos variados, mostre flexibilidade e seguranca tecnica, e ajude o cliente a definir o melhor estilo para a ideia dele.",
  },
  {
    key: "premium",
    label: "Artista premium, especializado em projetos exclusivos",
    prompt:
      "Posicionamento: artista premium. Valorize a autoria, a exclusividade e o processo criativo; seja elegante e seletivo, foque em projetos autorais e nunca entre em negociacao de desconto ou comparacao com outros estudios.",
  },
  {
    key: "acessivel",
    label: "Profissional acessível, com atendimento descontraído",
    prompt:
      "Posicionamento: profissional acessivel. Seja leve, proximo e descontraido, use uma linguagem simples e deixe o cliente a vontade, sem formalidade.",
  },
] as const;

export type ArtistInfo = Partial<Record<(typeof ARTIST_INFO_FIELDS)[number]["key"] | "positioning", string>>;
