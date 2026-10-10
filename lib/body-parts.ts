// Body regions the artist can price individually for Dante.
export const BODY_PART_GROUPS: { group: string; parts: { key: string; label: string }[] }[] = [
  {
    group: "Braços",
    parts: [
      { key: "braco_externo", label: "Braço — parte externa" },
      { key: "braco_interno", label: "Braço — parte interna" },
      { key: "antebraco_externo", label: "Antebraço — parte externa" },
      { key: "antebraco_interno", label: "Antebraço — parte interna" },
      { key: "ombro", label: "Ombro" },
      { key: "cotovelo", label: "Cotovelo" },
    ],
  },
  {
    group: "Mãos e pés",
    parts: [
      { key: "mao", label: "Mão" },
      { key: "dedos", label: "Dedos" },
      { key: "punho", label: "Punho" },
      { key: "pe", label: "Pé" },
      { key: "tornozelo", label: "Tornozelo" },
    ],
  },
  {
    group: "Pernas",
    parts: [
      { key: "coxa_frente", label: "Coxa — frente" },
      { key: "coxa_tras", label: "Coxa — parte de trás" },
      { key: "coxa_lateral", label: "Coxa — lateral" },
      { key: "joelho", label: "Joelho" },
      { key: "canela", label: "Canela" },
      { key: "panturrilha", label: "Panturrilha" },
    ],
  },
  {
    group: "Tronco",
    parts: [
      { key: "peito", label: "Peito" },
      { key: "barriga", label: "Barriga" },
      { key: "costela", label: "Costela" },
      { key: "clavicula", label: "Clavícula" },
      { key: "costas_superior", label: "Costas — parte superior / escápula" },
      { key: "lombar", label: "Lombar" },
      { key: "quadril", label: "Quadril" },
    ],
  },
  {
    group: "Cabeça e pescoço",
    parts: [
      { key: "cabeca", label: "Cabeça" },
      { key: "rosto", label: "Rosto" },
      { key: "atras_orelha", label: "Atrás da orelha" },
      { key: "pescoco", label: "Pescoço" },
      { key: "nuca", label: "Nuca" },
    ],
  },
  {
    group: "Fechamentos (peças grandes)",
    parts: [
      { key: "braco_fechado", label: "Braço fechado" },
      { key: "antebraco_fechado", label: "Antebraço fechado" },
      { key: "perna_fechada", label: "Perna fechada" },
      { key: "frente_completa", label: "Frente completa (peito + barriga)" },
      { key: "costas_completas", label: "Costas completas" },
    ],
  },
];

export const BODY_PART_LABELS: Record<string, string> = Object.fromEntries(
  BODY_PART_GROUPS.flatMap((g) => g.parts.map((p) => [p.key, p.label]))
);

export const CURRENCIES = [
  { code: "BRL", label: "Real (R$)" },
  { code: "USD", label: "Dólar americano (US$)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "GBP", label: "Libra esterlina (£)" },
  { code: "CAD", label: "Dólar canadense (C$)" },
  { code: "AUD", label: "Dólar australiano (A$)" },
  { code: "CHF", label: "Franco suíço (CHF)" },
  { code: "JPY", label: "Iene (¥)" },
  { code: "ARS", label: "Peso argentino" },
  { code: "CLP", label: "Peso chileno" },
  { code: "COP", label: "Peso colombiano" },
  { code: "MXN", label: "Peso mexicano" },
  { code: "PYG", label: "Guarani paraguaio" },
  { code: "UYU", label: "Peso uruguaio" },
] as const;

export function formatMoney(value: number, currency = "BRL") {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value);
  } catch {
    return `${currency} ${value}`;
  }
}
