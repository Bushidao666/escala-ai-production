import { z } from 'zod';

export const settingsSchema = z.object({
  openai_api_key: z.string().trim().startsWith('sk-', { message: "Chave da API inválida. Deve começar com 'sk-'." }).min(51, { message: "Chave da API parece curta demais." }),
  model: z.string(),
  default_quality: z.enum(["auto", "high", "medium", "low"]),
  default_output_format: z.enum(["png", "jpeg", "webp"]),
  default_output_compression: z.number().min(0).max(100),
  default_background: z.enum(["auto", "transparent", "opaque"]),
  default_moderation: z.enum(["auto", "low"]),
  timeout: z.number().int().min(5000, { message: "Timeout mínimo de 5000ms." }).max(120000, { message: "Timeout máximo de 120000ms." }),
  retries: z.number().int().min(0).max(5),
  theme: z.enum(["dark", "light"]),
  language: z.enum(["pt-BR", "en-US"]),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

export const defaultSettings: SettingsFormData = {
  openai_api_key: "",
  model: "gpt-image-1",
  default_quality: "high",
  default_output_format: "png",
  default_output_compression: 85,
  default_background: "auto",
  default_moderation: "auto",
  timeout: 30000,
  retries: 3,
  theme: "dark",
  language: "pt-BR",
}; 