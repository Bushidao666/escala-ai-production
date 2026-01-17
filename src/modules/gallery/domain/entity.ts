import { z } from 'zod';
import { CreativeStatus, CreativeFormat } from "@/modules/creative/dto/creative.schema";

// Schema para os filtros da galeria, permitindo arrays
export const galleryFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.array(CreativeStatus).optional(),
  format: z.array(CreativeFormat).optional(),
  style: z.array(z.string()).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type GalleryFilters = z.infer<typeof galleryFiltersSchema>; 