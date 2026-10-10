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

export type ArtistInfo = Partial<Record<(typeof ARTIST_INFO_FIELDS)[number]["key"] | "positioning" | "greeting" | (typeof TRAITS)[number]["key"], string>>;

// Communication traits the artist picks; each option becomes a line in Dante's prompt.
export const TRAITS = [
  {
    key: "formality",
    label: "Formalidade",
    options: [
      { value: "informal", label: "Informal", prompt: "Seja informal: linguagem de conversa, proxima, pode usar girias leves." },
      { value: "equilibrada", label: "Equilibrada", prompt: "Tom equilibrado: cordial e proximo, sem girias e sem formalidade excessiva." },
      { value: "formal", label: "Formal", prompt: "Seja formal e polido: linguagem cuidada, sem girias." },
    ],
  },
  {
    key: "length",
    label: "Extensão das mensagens",
    options: [
      { value: "curtas", label: "Curtas", prompt: "Mensagens curtas: 1 a 2 frases, direto ao ponto." },
      { value: "medias", label: "Médias", prompt: "Mensagens medias: no maximo um paragrafo curto." },
      { value: "detalhadas", label: "Detalhadas", prompt: "Mensagens detalhadas: explique com mais contexto quando for util, sem enrolar." },
    ],
  },
  {
    key: "emojis",
    label: "Uso de emojis",
    options: [
      { value: "nunca", label: "Nunca", prompt: "Nunca use emojis." },
      { value: "moderado", label: "Moderado", prompt: "Use no maximo 1 emoji por mensagem, so quando combinar." },
      { value: "frequente", label: "Frequente", prompt: "Use emojis com frequencia para deixar a conversa leve." },
    ],
  },
  {
    key: "approach",
    label: "Abordagem comercial",
    options: [
      { value: "consultiva", label: "Consultiva", prompt: "Abordagem consultiva: faca perguntas, entenda o objetivo do cliente e oriente antes de conduzir ao fechamento." },
      { value: "objetiva", label: "Objetiva", prompt: "Abordagem objetiva: va direto ao que o cliente precisa e conduza rapido ao proximo passo." },
    ],
  },
  {
    key: "language_level",
    label: "Linguagem",
    options: [
      { value: "simples", label: "Simples", prompt: "Linguagem simples, sem termos tecnicos." },
      { value: "tecnica", label: "Técnica", prompt: "Pode usar termos tecnicos de tatuagem (fineline, blackwork, sombreado, agulhas...), explicando quando necessario." },
    ],
  },
  {
    key: "proactivity",
    label: "Proatividade",
    options: [
      { value: "baixa", label: "Baixa", prompt: "Proatividade baixa: responda o que foi perguntado, sem puxar novos assuntos." },
      { value: "media", label: "Média", prompt: "Proatividade media: responda e sugira o proximo passo." },
      { value: "alta", label: "Alta", prompt: "Proatividade alta: antecipe duvidas, sugira ideias e o proximo passo em toda mensagem." },
    ],
  },
  {
    key: "audio",
    label: "Uso de áudios",
    options: [
      { value: "transcrever", label: "Transcrever e responder", prompt: "Quando o cliente mandar audio, ouca, entenda o que ele disse e responda normalmente." },
      { value: "pedir_texto", label: "Pedir para escrever", prompt: "Se o cliente mandar audio, peca com gentileza para ele escrever a mensagem." },
    ],
  },
] as const;

export function traitPrompts(info: Record<string, string | undefined>) {
  return TRAITS.map((t) => t.options.find((o) => o.value === info[t.key])?.prompt).filter(Boolean) as string[];
}
