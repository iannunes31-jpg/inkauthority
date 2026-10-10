// Countries Dante can tell apart by the client's phone prefix (WhatsApp numbers arrive as E.164 digits).
export const COUNTRIES = [
  { code: "BR", name: "Brasil", ddi: "55", currency: "BRL" },
  { code: "PT", name: "Portugal", ddi: "351", currency: "EUR" },
  { code: "US", name: "Estados Unidos / Canadá", ddi: "1", currency: "USD" },
  { code: "GB", name: "Reino Unido", ddi: "44", currency: "GBP" },
  { code: "IE", name: "Irlanda", ddi: "353", currency: "EUR" },
  { code: "FR", name: "França", ddi: "33", currency: "EUR" },
  { code: "DE", name: "Alemanha", ddi: "49", currency: "EUR" },
  { code: "IT", name: "Itália", ddi: "39", currency: "EUR" },
  { code: "ES", name: "Espanha", ddi: "34", currency: "EUR" },
  { code: "NL", name: "Holanda", ddi: "31", currency: "EUR" },
  { code: "BE", name: "Bélgica", ddi: "32", currency: "EUR" },
  { code: "CH", name: "Suíça", ddi: "41", currency: "CHF" },
  { code: "AT", name: "Áustria", ddi: "43", currency: "EUR" },
  { code: "SE", name: "Suécia", ddi: "46", currency: "EUR" },
  { code: "NO", name: "Noruega", ddi: "47", currency: "EUR" },
  { code: "DK", name: "Dinamarca", ddi: "45", currency: "EUR" },
  { code: "PL", name: "Polônia", ddi: "48", currency: "EUR" },
  { code: "AR", name: "Argentina", ddi: "54", currency: "ARS" },
  { code: "CL", name: "Chile", ddi: "56", currency: "CLP" },
  { code: "UY", name: "Uruguai", ddi: "598", currency: "UYU" },
  { code: "PY", name: "Paraguai", ddi: "595", currency: "PYG" },
  { code: "CO", name: "Colômbia", ddi: "57", currency: "COP" },
  { code: "PE", name: "Peru", ddi: "51", currency: "USD" },
  { code: "MX", name: "México", ddi: "52", currency: "MXN" },
  { code: "JP", name: "Japão", ddi: "81", currency: "JPY" },
  { code: "AU", name: "Austrália", ddi: "61", currency: "AUD" },
  { code: "IL", name: "Israel", ddi: "972", currency: "USD" },
  { code: "AE", name: "Emirados Árabes", ddi: "971", currency: "USD" },
  { code: "AO", name: "Angola", ddi: "244", currency: "USD" },
  { code: "MZ", name: "Moçambique", ddi: "258", currency: "USD" },
] as const;

// "OTHER" = any foreign country without its own rule.
export const OTHER_COUNTRIES = "OTHER";

export type CountryRule = { country: string; currency: string; factor: number; instructions: string };
export type CountrySettings = { home: string; rules: CountryRule[] };

export function countryName(code: string) {
  if (code === OTHER_COUNTRIES) return "Outros países";
  return COUNTRIES.find((c) => c.code === code)?.name ?? code;
}

/** Longest DDI match, e.g. "351..." is Portugal, not a "3x" country. */
export function countryFromPhone(phoneDigits: string) {
  const digits = phoneDigits.replace(/\D/g, "");
  return [...COUNTRIES].sort((a, b) => b.ddi.length - a.ddi.length).find((c) => digits.startsWith(c.ddi)) ?? null;
}
