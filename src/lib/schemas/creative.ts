import { z } from 'zod';

// Enums baseados na estrutura do Supabase
export const CreativeStatus = z.enum(['draft', 'queued', 'processing', 'completed', 'failed']);
export const CreativeFormat = z.enum(['9:16', '1:1', '16:9', '4:3', '3:4']);
export const ImageQuality = z.enum(['auto', 'high', 'medium', 'low']);
export const OutputFormat = z.enum(['png', 'jpeg', 'webp']);
export const BackgroundType = z.enum(['auto', 'transparent', 'opaque']);

// 🚀 NOVOS ENUMS PARA MÚLTIPLOS FORMATOS
export const CreativeRequestStatus = z.enum(['pending', 'processing', 'completed', 'partial', 'failed']);

// Schema para upload de imagens de produto
export const ProductImageSchema = z.object({
  url: z.string().url(),
  filename: z.string(),
  size: z.number(),
  type: z.string(),
});

// Schema principal para criação de criativos (INDIVIDUAL - mantido para compatibilidade)
export const createCreativeSchema = z.object({
  // Dados básicos
  title: z.string()
    .min(3, "Título deve ter pelo menos 3 caracteres")
    .max(100, "Título deve ter no máximo 100 caracteres"),
  
  description: z.string()
    .max(1000, "Descrição deve ter no máximo 1000 caracteres")
    .optional()
    .or(z.literal("")),
  
  prompt: z.string()
    .min(10, "Descrição do criativo deve ter pelo menos 10 caracteres")
    .max(5000, "Descrição do criativo deve ter no máximo 5000 caracteres"),

  // Estilo e aparência
  style: z.string()
    .max(50, "Estilo deve ter no máximo 50 caracteres")
    .optional()
    .or(z.literal(""))
    .default("Moderno"),

  // Cores (formato HEX)
  primary_color: z.string()
    .refine((val) => val === "" || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val), "Cor primária deve estar no formato HEX (#000000)")
    .optional()
    .or(z.literal("")),
  
  secondary_color: z.string()
    .refine((val) => val === "" || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val), "Cor secundária deve estar no formato HEX (#000000)")
    .optional()
    .or(z.literal("")),

  // Textos do criativo
  headline: z.string()
    .max(60, "Headline deve ter no máximo 60 caracteres")
    .optional()
    .or(z.literal("")),
  
  sub_headline: z.string()
    .max(120, "Sub-headline deve ter no máximo 120 caracteres")
    .optional()
    .or(z.literal("")),
  
  cta_text: z.string()
    .max(25, "Texto do CTA deve ter no máximo 25 caracteres")
    .optional()
    .or(z.literal("")),

  // Formato e qualidade
  format: CreativeFormat.default('1:1'),
  quality: ImageQuality.default('auto'),
  output_format: OutputFormat.default('png'),
  output_compression: z.number()
    .int()
    .min(0, "Compressão deve ser no mínimo 0")
    .max(100, "Compressão deve ser no máximo 100")
    .default(90),
  background: BackgroundType.default('auto'),

  // Imagens (URLs serão definidas após upload)
  logo_url: z.string()
    .refine((val) => val === "" || z.string().url().safeParse(val).success, "URL do logo inválida")
    .optional()
    .or(z.literal("")),
  product_images: z.array(ProductImageSchema).default([]),

  // 🚀 NOVO: Quantidade de variações do mesmo criativo
  quantity: z.number()
    .int("Quantidade deve ser um número inteiro")
    .min(1, "Quantidade deve ser pelo menos 1")
    .max(10, "Máximo 10 variações por vez")
    .default(1),
});

// 🚀 NOVO: Schema para criação de solicitações de MÚLTIPLOS FORMATOS
export const createCreativeRequestSchema = z.object({
  // Dados básicos (similares ao schema individual)
  title: z.string()
    .min(3, "Título deve ter pelo menos 3 caracteres")
    .max(100, "Título deve ter no máximo 100 caracteres"),
  
  description: z.string()
    .max(1000, "Descrição deve ter no máximo 1000 caracteres")
    .optional()
    .or(z.literal("")),
  
  prompt: z.string()
    .min(10, "Descrição do criativo deve ter pelo menos 10 caracteres")
    .max(5000, "Descrição do criativo deve ter no máximo 5000 caracteres"),

  // Estilo e aparência
  style: z.string()
    .max(50, "Estilo deve ter no máximo 50 caracteres")
    .optional()
    .or(z.literal(""))
    .default("Moderno"),

  // Cores (formato HEX)
  primary_color: z.string()
    .refine((val) => val === "" || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val), "Cor primária deve estar no formato HEX (#000000)")
    .optional()
    .or(z.literal("")),
  
  secondary_color: z.string()
    .refine((val) => val === "" || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val), "Cor secundária deve estar no formato HEX (#000000)")
    .optional()
    .or(z.literal("")),

  // Textos do criativo
  headline: z.string()
    .max(60, "Headline deve ter no máximo 60 caracteres")
    .optional()
    .or(z.literal("")),
  
  sub_headline: z.string()
    .max(120, "Sub-headline deve ter no máximo 120 caracteres")
    .optional()
    .or(z.literal("")),
  
  cta_text: z.string()
    .max(25, "Texto do CTA deve ter no máximo 25 caracteres")
    .optional()
    .or(z.literal("")),

  // Imagens (URLs serão definidas após upload)
  logo_url: z.string()
    .refine((val) => val === "" || z.string().url().safeParse(val).success, "URL do logo inválida")
    .optional()
    .or(z.literal("")),
  product_images: z.array(ProductImageSchema).default([]),

  // 🎯 PRINCIPAL DIFERENÇA: Array de formatos ao invés de único formato
  requested_formats: z.array(CreativeFormat)
    .min(1, "Selecione pelo menos um formato")
    .max(5, "Máximo 5 formatos por solicitação")
    .refine(
      (formats) => new Set(formats).size === formats.length, 
      "Não é possível selecionar o mesmo formato duas vezes"
    ),
});

// Schema para atualização (todos os campos opcionais exceto ID)
export const updateCreativeSchema = z.object({
  id: z.string().uuid("ID inválido"),
}).merge(createCreativeSchema.partial());

// Schema para filtros de busca
export const creativeFiltersSchema = z.object({
  status: CreativeStatus.optional(),
  format: CreativeFormat.optional(),
  quality: ImageQuality.optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().max(50).default(20),
  offset: z.number().int().min(0).default(0),
});

// 🚀 NOVO: Schema para filtros de creative requests
export const creativeRequestFiltersSchema = z.object({
  status: CreativeRequestStatus.optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().max(50).default(20),
  offset: z.number().int().min(0).default(0),
});

// Tipos TypeScript inferidos (MANTIDOS para compatibilidade)
export type CreateCreativeData = z.infer<typeof createCreativeSchema>;
export type UpdateCreativeData = z.infer<typeof updateCreativeSchema>;
export type CreativeFilters = z.infer<typeof creativeFiltersSchema>;
export type ProductImage = z.infer<typeof ProductImageSchema>;

// 🚀 NOVOS TIPOS para múltiplos formatos
export type CreateCreativeRequestData = z.infer<typeof createCreativeRequestSchema>;
export type CreativeRequestFilters = z.infer<typeof creativeRequestFiltersSchema>;

// Mapeamento de formatos para tamanhos da OpenAI API
export const FORMAT_TO_SIZE_MAP = {
  '9:16': '1024x1536',  // Stories
  '1:1': '1024x1024',   // Feed
  '16:9': '1536x1024',  // Google
  '4:3': '1024x768',    // Não está na API padrão, usar 1024x1024
  '3:4': '768x1024',    // Não está na API padrão, usar 1024x1536
} as const;

// Labels amigáveis para os formatos
export const FORMAT_LABELS = {
  '9:16': 'Stories (9:16)',
  '1:1': 'Feed (1:1)', 
  '16:9': 'Google (16:9)',
  '4:3': 'Google Vertical (4:3)',
  '3:4': 'Instagram Reels (3:4)',
} as const;

// 🚀 NOVO: Configurações pré-definidas para múltiplos formatos
export const MULTI_FORMAT_PRESETS = {
  instagram: {
    name: "Instagram Complete",
    description: "Stories + Feed + Reels",
    formats: ['9:16', '1:1', '3:4'] as const,
    icon: "📸"
  },
  google: {
    name: "Google Ads Complete", 
    description: "Horizontal + Vertical",
    formats: ['16:9', '4:3'] as const,
    icon: "🔍"
  },
  all: {
    name: "Todos os Formatos",
    description: "Stories + Feed + Google",
    formats: ['9:16', '1:1', '16:9'] as const,
    icon: "🎯"
  }
} as const;

// Estilos predefinidos para seleção - EXPANDIDO com novos estilos
export const CREATIVE_STYLES = [
  // 📋 ESTILOS ORIGINAIS (mantidos para compatibilidade)
  'Minimalista',
  'Moderno',
  'Elegante', 
  'Divertido',
  'Profissional',
  'Vintage',
  'Futurista',
  'Artístico',
  'Corporativo',
  'Casual',
  
  // 🎨 NOVOS ESTILOS ADICIONADOS
  'Pin-up',
  'GTA San Andreas',
  'GTA V', 
  'Anime',
  'Pixel Art',
  'RPG Medieval',
  'Velho Oeste',
  'Cyberpunk',
  'Arcade',
  'Vaporwave',
  'Synthwave',
  'Noir',
  'Caótico Criativo',
  'Terror',
  'Reconfortante',
  'Surrealista',
  'Corporate Clean',
  'Grunge',
  'Oriental Tradicional',
  'Nórdico'
] as const;

// Valores padrão para novo criativo INDIVIDUAL (mantido para compatibilidade)
export const defaultCreativeValues: CreateCreativeData = {
  title: "",
  prompt: "",
  description: "",
  style: "Moderno",
  format: '1:1',
  quality: 'auto',
  output_format: 'png',
  output_compression: 90,
  background: 'auto',
  primary_color: "",
  secondary_color: "",
  logo_url: "",
  product_images: [],
  headline: "",
  sub_headline: "",
  cta_text: "",
  quantity: 1,
};

// 🚀 NOVO: Valores padrão para creative request (múltiplos formatos)
export const defaultCreativeRequestValues: CreateCreativeRequestData = {
  title: "",
  prompt: "",
  description: "",
  style: "Moderno",
  primary_color: "",
  secondary_color: "",
  logo_url: "",
  product_images: [],
  headline: "",
  sub_headline: "",
  cta_text: "",
  requested_formats: ['1:1'], // Default: apenas Feed
}; 