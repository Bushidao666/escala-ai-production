"use server";

import { createClient } from "@/shared/infra/supabase/server";
import { GalleryRepository } from "../infra/supabase-gallery.repository";
import { GetGalleryItemsUseCase } from "./use-cases/get-gallery-items.usecase";
import { GalleryItem } from "../domain/entities";

// --- ACTIONS ---

export async function getCreativesForGallery(filters: any): Promise<{ data: GalleryItem[]; count: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado.");

  const repository = new GalleryRepository(supabase);
  const useCase = new GetGalleryItemsUseCase(repository);

  const items = await useCase.execute(user.id);

  const unifiedData: GalleryItem[] = items.map((item: any) => ({
    id: item.id,
    title: item.title || "Untitled",
    prompt: item.prompt || "",
    status: item.status || "completed",
    style: item.style || "Modern",
    format: item.format || "1:1",
    result_url: item.result_url || null,
    created_at: item.created_at,
    error_message: item.error_message || null,
    primary_color: item.primary_color || null,
    secondary_color: item.secondary_color || null,
    logo_url: item.logo_url || null,
    product_images: item.product_images ? (typeof item.product_images === 'string' ? JSON.parse(item.product_images) : item.product_images) : [],
    type: 'creative'
  }));

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

export async function getSelectedCreativesForDownload(selectedIds: string[]) {
    const supabase = await createClient();
    const { data } = await supabase.from("creatives").select("*").in("id", selectedIds);

    // Mocking complex logic for now to satisfy build
    return {
        creatives: data || [],
        totalCount: data?.length || 0,
        statsByFormat: {},
        selectedCount: selectedIds.length
    };
}
