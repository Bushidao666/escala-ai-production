export const CREATIVE_STYLES = [
  "Minimalista",
  "Moderno",
  "Corporativo",
  "Criativo/Artístico",
  "Elegante",
  "Divertido",
  "Tecnológico",
  "Luxo",
  "Retrô",
  "Futurista"
] as const;

/**
 * Aplica variações ao prompt baseado no estilo selecionado
 */
export function applyVariationToPrompt(
  originalPrompt: string,
  variationStyle: string,
  index: number,
  total: number
): string {
  const basePrompt = originalPrompt.trim();

  switch (variationStyle) {
    case 'creative_diversity':
      const diversityPrefixes = [
        "Creative interpretation: ",
        "Artistic vision: ",
        "Unique perspective: ",
        "Alternative view: ",
        "Fresh take: ",
        "Bold interpretation: ",
        "Innovative approach: ",
        "Modern twist: "
      ];
      const prefixIndex = (index - 1) % diversityPrefixes.length;
      return `${diversityPrefixes[prefixIndex]}${basePrompt}`;

    case 'prompt_variations':
      const promptModifiers = [
        ", with vibrant colors and dynamic composition",
        ", featuring soft lighting and elegant atmosphere",
        ", with bold contrasts and energetic feel",
        ", showcasing minimalist design and clean aesthetics",
        ", incorporating rich textures and warm tones",
        ", with dramatic lighting and cinematic quality",
        ", featuring playful elements and joyful mood",
        ", with sophisticated styling and premium feel"
      ];
      const modifierIndex = (index - 1) % promptModifiers.length;
      return `${basePrompt}${promptModifiers[modifierIndex]}`;

    case 'style_variations':
      // A variação será aplicada no campo 'style' do creative, não no prompt
      return basePrompt;

    default:
      return basePrompt;
  }
}

/**
 * Seleciona um estilo aleatório para variações
 */
export function getRandomStyleForVariation(originalStyle: string, index: number, excludeOriginal: boolean = true): string {
  const availableStyles = excludeOriginal
    ? CREATIVE_STYLES.filter(style => style !== originalStyle)
    : [...CREATIVE_STYLES];

  const selectedIndex = (index - 1) % availableStyles.length;
  return availableStyles[selectedIndex];
}
