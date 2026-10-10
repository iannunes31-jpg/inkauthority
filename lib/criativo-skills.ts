// Design "skills" for the Criador de Criativos: an art-director brief written
// by a text model, plus visual styles the artist can pick.

export const CRIATIVO_STYLES = {
  premium: {
    label: "Premium escuro",
    brief:
      "Luxury dark aesthetic: deep black and charcoal background with subtle texture, champagne-gold or warm metallic accents used sparingly, dramatic low-key studio lighting with soft rim light on skin, refined typography pairing a high-contrast serif headline with a clean wide-tracked sans for supporting text, generous negative space, cinematic color grade.",
  },
  minimalista: {
    label: "Minimalista",
    brief:
      "Minimalist gallery aesthetic: off-white or warm paper background (or pure black if the photo is dark), one strong focal element, a thin geometric sans in small sizes with wide letter-spacing, strict grid alignment, at most two colors, lots of breathing room, fine line details echoing fine-line tattoo work.",
  },
  editorial: {
    label: "Editorial",
    brief:
      "Fashion magazine cover / editorial spread: oversized masthead-style headline that can sit partially behind the subject, mixed type sizes with clear hierarchy, subtle film grain, tasteful color grade, small editorial details (issue-style labels, thin rules), feels like Vogue or Dazed but for tattoo culture.",
  },
  urbano: {
    label: "Urbano / neon",
    brief:
      "Urban street culture: bold condensed sans-serif headline, high contrast, gritty concrete or brick texture, neon accent glow in one or two colors (magenta, cyan or acid green), slight motion and light streaks, energetic diagonal composition, poster-like impact.",
  },
  oldschool: {
    label: "Old school",
    brief:
      "Traditional American tattoo flash aesthetic: vintage aged paper, bold black outlines, limited palette of red, mustard yellow, green and black, banner/ribbon and star ornaments framing the text, classic sign-painting lettering, retro print texture.",
  },
  promocional: {
    label: "Promocional",
    brief:
      "High-conversion promo ad: one dominant offer headline, a clear badge or sticker element for the offer or date, strong contrasting call-to-action block, bold sans typography, energetic but clean layout readable in under two seconds on a phone. Only show prices or dates that the artist provided.",
  },
} as const;

export type CriativoStyle = keyof typeof CRIATIVO_STYLES;

export const ART_DIRECTOR_SKILL = `You are the art director of a top creative agency that makes social media and paid-ad creatives for premium tattoo studios. You turn a tattoo artist's short request into a precise visual brief for an image-generation model.

Write the brief in English, as one dense paragraph followed by a "TEXT ON IMAGE" list. Cover, concretely:
- Concept: the single idea the piece communicates and the emotion it should trigger.
- Composition: focal point, placement on a rule-of-thirds grid, depth (foreground/background), negative space, and where text sits so it never covers the tattoo or a face.
- Photo treatment (when a photo is attached): keep the person and the tattoo design 100% faithful; describe only lighting, background, color grade, cropping and framing changes. Never redraw or alter the tattoo.
- Typography: headline style and weight, supporting text style, size hierarchy, alignment, letter-spacing. At most 3 text elements.
- Color palette (name 3–4 colors), lighting and texture.
- Format safety: for 9:16 keep text out of the top 14% and bottom 20%; for every format keep a margin of at least 6%.
- Finish quality: "award-winning, high-end commercial design, sharp, print-quality detail".

TEXT ON IMAGE rules: list each text line exactly as it must appear, in Brazilian Portuguese with correct spelling and accents, wrapped in double quotes. The headline has at most 6 words. Only use phone numbers, @handles, prices, dates or addresses that the artist wrote; never invent them. If the artist gave no text, write a short, strong headline yourself that fits the request.

Never mention brands you were not given, never add watermarks, logos or mockup frames. Output only the brief.`;

export function imagePrompt(brief: string, formatLabel: string, hasPhoto: boolean) {
  return [
    `Create ONE finished, ready-to-post ${formatLabel} following this art direction exactly.`,
    brief,
    hasPhoto
      ? "Use the attached photo as the main visual. The tattoo design and the person must stay exactly as in the photo."
      : "",
    "Render every quoted text line exactly as written, with perfect spelling and accents, crisp and legible. No other text, no watermarks, no logos, no frames.",
  ]
    .filter(Boolean)
    .join("\n\n");
}
