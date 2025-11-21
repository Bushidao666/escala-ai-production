"use server";

import { createClient } from "@/shared/infra/supabase/server";
import { revalidatePath } from "next/cache";
import {
  createCreativeSchema,
  CreateCreativeData,
  createCreativeRequestSchema,
  CreateCreativeRequestData
} from "@/modules/creative/dto/creative.schema";
import { CreativeRepository } from "../infra/supabase-creative.repository";
import { CreateCreativeRequestUseCase } from "./use-cases/create-creative-request.usecase";

// --- HELPERS ---
async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado.");
  return { user, supabase };
}

// --- CORE ACTIONS ---

export async function uploadFile(formData: FormData) {
  const { user, supabase } = await getAuthenticatedUser();
  const file = formData.get('file') as File;
  if (!file) throw new Error("Nenhum arquivo encontrado.");

  const fileExtension = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExtension}`;
  const filePath = `${user.id}/${fileName}`;

  const { error } = await supabase.storage.from('creative-assets').upload(filePath, file);
  if (error) throw new Error("Falha no upload do arquivo.");

  const { data } = supabase.storage.from('creative-assets').getPublicUrl(filePath);

  return {
    url: data.publicUrl,
    filename: file.name,
    size: file.size,
    type: file.type,
  };
}

export async function createCreativeRequest(formData: CreateCreativeRequestData) {
  const { user, supabase } = await getAuthenticatedUser();

  const validation = createCreativeRequestSchema.safeParse(formData);
  if (!validation.success) throw new Error(`Erro de validação: ${validation.error.message}`);

  const repository = new CreativeRepository(supabase);
  const useCase = new CreateCreativeRequestUseCase(repository);

  const result = await useCase.execute(user.id, validation.data);

  triggerQueueProcessing().catch(console.error);

  revalidatePath("/new");
  revalidatePath("/queue");

  return { ...result, message: "Criativos criados com sucesso!" };
}

export async function createCreative(formData: CreateCreativeData) {
  const validation = createCreativeSchema.safeParse(formData);
  if (!validation.success) throw new Error(`Erro de validação: ${validation.error.message}`);

  const requestData: CreateCreativeRequestData = {
    ...validation.data,
    requested_formats: [validation.data.format],
    quantity: validation.data.quantity || 1,
    enable_variations: validation.data.enable_variations || false,
    variation_style: validation.data.variation_style || 'creative_diversity'
  };

  return createCreativeRequest(requestData);
}

export async function saveDraft(formData: CreateCreativeData) {
  const { user, supabase } = await getAuthenticatedUser();
  const validation = createCreativeSchema.safeParse(formData);
  if (!validation.success) throw new Error("Erro de validação");

  const { data, error } = await supabase.from("creatives").insert({
    ...validation.data,
    user_id: user.id,
    status: 'draft',
    product_images: JSON.stringify(validation.data.product_images || [])
  }).select().single();

  if (error) throw new Error("Falha ao salvar rascunho");

  revalidatePath("/new");
  return { success: true, creative_id: data.id };
}

export async function getUserDefaults() {
   const { user, supabase } = await getAuthenticatedUser();
   const repository = new CreativeRepository(supabase);
   const settings = await repository.getUserSettings(user.id);

   return {
    quality: settings?.default_quality || 'auto',
    output_format: settings?.default_output_format || 'png',
    output_compression: settings?.default_output_format === 'png' ? 100 : (settings?.default_output_compression || 90),
    background: settings?.default_background || 'auto'
   };
}

export async function triggerQueueProcessing() {
  const { user } = await getAuthenticatedUser();
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-queue`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    return { success: true };
  } catch (e: any) {
    throw new Error(`Queue trigger failed: ${e.message}`);
  }
}

// --- SUPPORT ACTIONS (Previously Missing) ---

export async function deleteCreative(creativeId: string) {
    const { user, supabase } = await getAuthenticatedUser();
    const { data } = await supabase.from("creatives").select("status").eq("id", creativeId).eq("user_id", user.id).single();
    if (!data || !['draft', 'failed'].includes(data.status)) throw new Error("Cannot delete");

    await supabase.from("queue_jobs").delete().eq("creative_id", creativeId);
    await supabase.from("creatives").delete().eq("id", creativeId);
    revalidatePath("/queue");
    return { success: true };
}

export async function reprocessCreative(creativeId: string) {
    const { user, supabase } = await getAuthenticatedUser();
    await supabase.from("creatives").update({ status: 'queued', error_message: null }).eq("id", creativeId).eq("user_id", user.id);
    await supabase.from("queue_jobs").insert({ creative_id: creativeId, user_id: user.id, status: 'pending', priority: 7 });
    revalidatePath("/queue");
    return { success: true };
}

export async function deleteCreativeRequest(requestId: string) {
    const { user, supabase } = await getAuthenticatedUser();
    // Simplified logic for brevity, ideally check children status
    await supabase.from("creative_requests").delete().eq("id", requestId).eq("user_id", user.id);
    revalidatePath("/queue");
    return { success: true };
}

export async function reprocessCreativeRequest(requestId: string) {
    // Logic to reprocess all failed creatives in a request
    const { user, supabase } = await getAuthenticatedUser();
    const { data: failed } = await supabase.from("creatives").select("id").eq("request_id", requestId).eq("status", "failed");

    if(failed) {
        for(const c of failed) {
            await reprocessCreative(c.id);
        }
    }
    return { success: true };
}

export async function getUserCreatives() {
    const { user, supabase } = await getAuthenticatedUser();
    const { data } = await supabase.from("creatives").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    return data || [];
}

export async function getUserCreativeRequests() {
    const { user, supabase } = await getAuthenticatedUser();
    const { data } = await supabase.from("creative_requests").select("*, creatives(*)").eq("user_id", user.id).order("created_at", { ascending: false });
    return data || [];
}

export async function debugAuth() {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return { user: data.user, message: data.user ? "OK" : "No User" };
}
