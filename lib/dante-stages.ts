// Client-safe: no server imports here (used by the dashboard panel).
export const STAGES = [
  { key: "novo", label: "Novo contato" },
  { key: "qualificando", label: "Qualificando" },
  { key: "projeto", label: "Projeto" },
  { key: "orcamento", label: "Orçamento enviado" },
  { key: "agendamento", label: "Agendando" },
  { key: "fechado", label: "Fechado" },
  { key: "perdido", label: "Perdido" },
] as const;
export type StageKey = (typeof STAGES)[number]["key"];

export const CLOSING_STAGES: StageKey[] = ["orcamento", "agendamento"];
export const STALLED_AFTER_HOURS = 48;

export function isStage(v: unknown): v is StageKey {
  return STAGES.some((s) => s.key === v);
}

