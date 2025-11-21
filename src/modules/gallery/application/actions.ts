"use server";

import { createClient } from "@/shared/infra/supabase/server";
import { GalleryRepository } from "../infra/supabase-gallery.repository";
import { GetGalleryItemsUseCase } from "./use-cases/get-gallery-items.usecase";

// --- ACTIONS ---

export async function getCreativesForGallery(filters: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado.");

  const repository = new GalleryRepository(supabase);
  const useCase = new GetGalleryItemsUseCase(repository);

  // Adaptação temporária: O UseCase retorna todos os items.
  // Em refatoração futura, passar filtros para o UseCase.
  // A View espera `{ data, count }`.
  const items = await useCase.execute(user.id);

  // Mapear para o formato esperado pela view unificada (fallback logic do actions antigo)
  // O repositório já retorna 'creatives' completed.
  // A lógica antiga fazia union de 'requests' e 'creatives'.
  // Para manter compatibilidade SEM quebrar a view complexa:

  const unifiedData = items.map((item: any) => ({ ...item, type: 'creative' }));

  return {
    data: unifiedData,
    count: unifiedData.length
  };
}

export async function deleteCreative(creativeId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    await supabase.from("creatives").delete().eq("id", creativeId).eq("user_id", user.id);
    return { success: true };
}
