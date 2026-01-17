import { GalleryRepository } from "../../infra/supabase-gallery.repository";

export class GetGalleryItemsUseCase {
  constructor(private repository: GalleryRepository) {}

  async execute(userId: string) {
    // Aqui poderíamos adicionar filtros, ordenação e lógica complexa de busca
    // Por enquanto, apenas repassamos para o repositório
    return await this.repository.getItems(userId);
  }
}
