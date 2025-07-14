"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { 
  createCreativeSchema, 
  type CreateCreativeData,
  // 🚀 NOVAS IMPORTAÇÕES para múltiplos formatos
  createCreativeRequestSchema,
  type CreateCreativeRequestData
} from "@/lib/schemas/creative";

/**
 * Faz o upload de um arquivo para o Supabase Storage e retorna um objeto completo do tipo `UploadedImage`, incluindo `url`, `filename`, `size` e `type`.
 * O bucket 'creative-assets' deve ter políticas RLS que permitam o upload
 * com base no user_id no path do arquivo.
 */
export async function uploadFile(formData: FormData) {
  console.log("\n--- [ACTION START: uploadFile] ---");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const file = formData.get('file') as File;
  if (!file) {
    throw new Error("Nenhum arquivo encontrado no formulário.");
  }

  const fileExtension = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExtension}`;
  
  // Caminho do arquivo inclui o user_id para segurança RLS
  const filePath = `${user.id}/${fileName}`;
  
  console.log(`Uploading file to: creative-assets/${filePath}`);

  const { error: uploadError } = await supabase.storage
    .from('creative-assets')
    .upload(filePath, file);

  if (uploadError) {
    console.error("uploadFile: Storage upload failed:", uploadError);
    throw new Error("Falha no upload do arquivo.");
  }
  
  // Obtém a URL pública permanente do arquivo que acabamos de enviar
  const { data } = supabase.storage
    .from('creative-assets')
    .getPublicUrl(filePath);
    
  console.log(`File uploaded successfully. Public URL: ${data.publicUrl}`);
  console.log("--- [ACTION END: uploadFile] ---\n");

  // Retorna um objeto completo, compatível com a interface UploadedImage
  return { 
    url: data.publicUrl,
    filename: file.name,
    size: file.size,
    type: file.type,
  };
}

/**
 * Busca as configurações do usuário para usar como padrões
 */
export async function getUserDefaults() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { data: settings, error } = await supabase
    .from("user_settings")
    .select(`
      default_quality,
      default_output_format,
      default_output_compression,
      default_background
    `)
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Erro ao buscar configurações do usuário:", error);
    // Retorna padrões se não encontrar configurações
    return {
      quality: 'auto' as const,
      output_format: 'png' as const,
      output_compression: 90,
      background: 'auto' as const,
    };
  }

  return {
    quality: (settings?.default_quality as any) || 'auto',
    output_format: (settings?.default_output_format as any) || 'png',
    output_compression: settings?.default_output_compression || 90,
    background: (settings?.default_background as any) || 'auto',
  };
}

/**
 * Salva um criativo como rascunho
 */
export async function saveDraft(formData: CreateCreativeData) {
  console.log("\n--- [ACTION START: saveDraft] ---");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("saveDraft: User not authenticated.");
    throw new Error("Usuário não autenticado.");
  }

  console.log(`User ID: ${user.id}`);

  // Valida os dados do formulário
  const validationResult = createCreativeSchema.safeParse(formData);
  
  if (!validationResult.success) {
    const errorMessages = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    console.error("saveDraft: Validation failed.", errorMessages);
    throw new Error(`Erro de validação: ${errorMessages}`);
  }

  const creativeData = {
    ...validationResult.data,
    user_id: user.id,
    status: 'draft' as const,
    product_images: JSON.stringify(validationResult.data.product_images || []),
  };

  console.log("Data to be saved as draft:", JSON.stringify(creativeData, null, 2));

  const { data, error } = await supabase
    .from("creatives")
    .insert(creativeData)
    .select()
    .single();

  if (error) {
    console.error("saveDraft: DATABASE OPERATION FAILED:", error);
    throw new Error("Não foi possível salvar o rascunho.");
  }

  console.log(`Draft saved successfully with ID: ${data.id}`);
  console.log("--- [ACTION END: saveDraft] ---\n");
  
  revalidatePath("/new");
  revalidatePath("/queue");
  
  return { success: true, creative_id: data.id };
}

/**
 * Cria um criativo e adiciona à fila de processamento
 */
export async function createCreative(formData: CreateCreativeData) {
  console.log("\n--- [ACTION START: createCreative] ---");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("createCreative: User not authenticated.");
    throw new Error("Usuário não autenticado.");
  }

  console.log(`User ID: ${user.id}`);

  // Valida os dados do formulário
  const validationResult = createCreativeSchema.safeParse(formData);
  
  if (!validationResult.success) {
    const errorMessages = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    console.error("createCreative: Validation failed.", errorMessages);
    throw new Error(`Erro de validação: ${errorMessages}`);
  }

  const creativeData = {
    ...validationResult.data,
    user_id: user.id,
    status: 'queued' as const,
    product_images: JSON.stringify(validationResult.data.product_images || []),
  };

  console.log("Data to be saved:", JSON.stringify(creativeData, null, 2));

  // Inicia transação para criar criativo + job na fila
  const { data: creative, error: creativeError } = await supabase
    .from("creatives")
    .insert(creativeData)
    .select()
    .single();

  if (creativeError) {
    console.error("createCreative: Failed to create creative:", creativeError);
    throw new Error("Não foi possível criar o criativo.");
  }

  console.log(`Creative created successfully with ID: ${creative.id}`);

  // Cria job na fila de processamento
  const { error: jobError } = await supabase
    .from("queue_jobs")
    .insert({
      creative_id: creative.id,
      user_id: user.id,
      status: 'pending',
      priority: 5, // Prioridade padrão
    });

  if (jobError) {
    console.error("createCreative: Failed to create queue job:", jobError);
    
    // Rollback: remove o criativo criado se falhar ao criar o job
    await supabase
      .from("creatives")
      .delete()
      .eq("id", creative.id);
    
    throw new Error("Não foi possível adicionar o criativo à fila de processamento.");
  }

  console.log("Queue job created successfully");

  // 🚀 Auto-trigger do processamento
  try {
    console.log("Auto-triggering queue processing...");
    await triggerQueueProcessing();
    console.log("Queue processing triggered successfully");
  } catch (error) {
    console.warn("Failed to auto-trigger processing, will need manual trigger:", error);
    // Não falhamos a criação se o trigger automático falhar
  }

  console.log("--- [ACTION END: createCreative] ---\n");

  revalidatePath("/new");
  revalidatePath("/queue");
  
  // Redireciona para a fila para acompanhar o processamento
  redirect("/queue");
}

/**
 * Atualiza um criativo existente
 */
export async function updateCreative(creativeId: string, formData: Partial<CreateCreativeData>) {
  console.log("\n--- [ACTION START: updateCreative] ---");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("updateCreative: User not authenticated.");
    throw new Error("Usuário não autenticado.");
  }

  console.log(`User ID: ${user.id}, Creative ID: ${creativeId}`);

  // Valida os dados do formulário (parcial)
  const validationResult = createCreativeSchema.partial().safeParse(formData);
  
  if (!validationResult.success) {
    const errorMessages = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    console.error("updateCreative: Validation failed.", errorMessages);
    throw new Error(`Erro de validação: ${errorMessages}`);
  }

  const updateData = {
    ...validationResult.data,
    updated_at: new Date().toISOString(),
  };

  // Se há product_images, converte para JSON
  if (updateData.product_images) {
    (updateData as any).product_images = JSON.stringify(updateData.product_images);
  }

  console.log("Data to be updated:", JSON.stringify(updateData, null, 2));

  const { data, error } = await supabase
    .from("creatives")
    .update(updateData)
    .eq("id", creativeId)
    .eq("user_id", user.id) // Garante que o usuário só pode atualizar seus próprios criativos
    .select()
    .single();

  if (error) {
    console.error("updateCreative: DATABASE OPERATION FAILED:", error);
    throw new Error("Não foi possível atualizar o criativo.");
  }

  if (!data) {
    throw new Error("Criativo não encontrado ou você não tem permissão para editá-lo.");
  }

  console.log(`Creative updated successfully: ${data.id}`);
  console.log("--- [ACTION END: updateCreative] ---\n");

  revalidatePath("/new");
  revalidatePath("/queue");
  revalidatePath("/gallery");
  
  return { success: true, creative: data };
}

/**
 * Lista os criativos do usuário com filtros
 */
export async function getUserCreatives(filters: {
  status?: string;
  format?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  let query = supabase
    .from("creatives")
    .select(`
      *,
      queue_jobs (
        id,
        status,
        priority,
        attempts,
        error_message,
        processing_started_at,
        processing_completed_at,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .is('request_id', null)
    .order("created_at", { ascending: false });

  // Aplica filtros
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  
  if (filters.format) {
    query = query.eq("format", filters.format);
  }

  // Paginação
  const limit = filters.limit || 20;
  const offset = filters.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error("getUserCreatives: Error fetching creatives:", error);
    throw new Error("Não foi possível carregar os criativos.");
  }

  return data || [];
}

/**
 * Remove um criativo (somente se for rascunho ou falhou)
 */
export async function deleteCreative(creativeId: string) {
  console.log("\n--- [ACTION START: deleteCreative] ---");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  console.log(`User ID: ${user.id}, Creative ID: ${creativeId}`);

  // Verifica se o criativo pode ser removido (somente draft ou failed)
  const { data: creative, error: fetchError } = await supabase
    .from("creatives")
    .select("id, status")
    .eq("id", creativeId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !creative) {
    throw new Error("Criativo não encontrado.");
  }

  if (!['draft', 'failed'].includes(creative.status || '')) {
    throw new Error("Somente rascunhos e criativos com falha podem ser removidos.");
  }

  // Remove jobs da fila relacionados
  await supabase
    .from("queue_jobs")
    .delete()
    .eq("creative_id", creativeId);

  // Remove o criativo
  const { error: deleteError } = await supabase
    .from("creatives")
    .delete()
    .eq("id", creativeId)
    .eq("user_id", user.id);

  if (deleteError) {
    console.error("deleteCreative: DATABASE OPERATION FAILED:", deleteError);
    throw new Error("Não foi possível remover o criativo.");
  }

  console.log(`Creative deleted successfully: ${creativeId}`);
  console.log("--- [ACTION END: deleteCreative] ---\n");

  revalidatePath("/new");
  revalidatePath("/queue");
  revalidatePath("/gallery");

  return { success: true };
}

/**
 * Reprocessa um criativo que falhou
 */
export async function reprocessCreative(creativeId: string) {
  console.log("\n--- [ACTION START: reprocessCreative] ---");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  console.log(`User ID: ${user.id}, Creative ID: ${creativeId}`);

  // Atualiza o status do criativo para 'queued'
  const { error: updateError } = await supabase
    .from("creatives")
    .update({ 
      status: 'queued',
      error_message: "",
      updated_at: new Date().toISOString()
    })
    .eq("id", creativeId)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("reprocessCreative: Failed to update creative status:", updateError);
    throw new Error("Não foi possível atualizar o status do criativo.");
  }

  // Cria novo job na fila
  const { error: jobError } = await supabase
    .from("queue_jobs")
    .insert({
      creative_id: creativeId,
      user_id: user.id,
      status: 'pending',
      priority: 7, // Prioridade alta para reprocessamento
    });

  if (jobError) {
    console.error("reprocessCreative: Failed to create queue job:", jobError);
    throw new Error("Não foi possível adicionar o criativo à fila de processamento.");
  }

  console.log("Creative queued for reprocessing successfully");
  console.log("--- [ACTION END: reprocessCreative] ---\n");

  revalidatePath("/queue");
  revalidatePath("/gallery");

  return { success: true };
}

/**
 * Função de debug para verificar autenticação
 */
export async function debugAuth() {
  const supabase = await createClient();
  
  // Verifica o usuário pelo getUser
  const { data: { user }, error } = await supabase.auth.getUser();
  
  console.log("Debug Auth - User:", user);
  console.log("Debug Auth - Error:", error);
  
  return {
    user,
    error,
    message: user ? "Usuário autenticado" : "Usuário não autenticado"
  };
}

/**
 * Aciona o processamento da fila manualmente
 */
export async function triggerQueueProcessing() {
  console.log("\n--- [ACTION START: triggerQueueProcessing] ---");
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }
  
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-queue`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`Queue processing failed: ${result.error || response.statusText}`);
    }

    console.log("Queue processing triggered successfully:", result);
    console.log("--- [ACTION END: triggerQueueProcessing] ---\n");
    
    revalidatePath("/queue");
    return { success: true, result };
    
  } catch (error: any) {
    console.error("triggerQueueProcessing: Error:", error);
    console.log("--- [ACTION END: triggerQueueProcessing] ---\n");
    throw new Error(`Não foi possível acionar o processamento: ${error.message}`);
  }
}

// 🚀 ===== ETAPA 2: NOVAS ACTIONS PARA MÚLTIPLOS FORMATOS =====
// Estas actions mantêm compatibilidade total com o código existente

/**
 * ✨ NOVA: Cria uma solicitação de múltiplos formatos
 * Esta função cria 1 creative_request + N creatives (1 por formato) + N queue_jobs
 */
export async function createCreativeRequest(formData: CreateCreativeRequestData) {
  console.log("\n--- [🚀 ACTION START: createCreativeRequest] ---");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("createCreativeRequest: User not authenticated.");
    throw new Error("Usuário não autenticado.");
  }

  console.log(`User ID: ${user.id}`);
  console.log(`Requested formats: ${formData.requested_formats.join(", ")}`);

  // Valida os dados do formulário
  const validationResult = createCreativeRequestSchema.safeParse(formData);
  
  if (!validationResult.success) {
    const errorMessages = validationResult.error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
    console.error("createCreativeRequest: Validation failed.", errorMessages);
    throw new Error(`Erro de validação: ${errorMessages}`);
  }

  const requestData = {
    ...validationResult.data,
    user_id: user.id,
    status: 'pending' as const,
    product_images: JSON.stringify(validationResult.data.product_images || []),
  };

  console.log("Request data to be saved:", JSON.stringify(requestData, null, 2));

  // 🎯 ETAPA 1: Criar o creative_request
  const { data: creativeRequest, error: requestError } = await supabase
    .from("creative_requests")
    .insert(requestData)
    .select()
    .single();

  if (requestError) {
    console.error("createCreativeRequest: Failed to create request:", requestError);
    throw new Error("Não foi possível criar a solicitação.");
  }

  console.log(`Creative request created successfully with ID: ${creativeRequest.id}`);

  // 🎯 ETAPA 2: Buscar configurações padrão do usuário
  const userDefaults = await getUserDefaults();

  // 🎯 ETAPA 3: Criar um creative para cada formato solicitado
  const createdCreatives = [];
  const createdJobs = [];

  for (const format of validationResult.data.requested_formats) {
    console.log(`Creating creative for format: ${format}`);

         // Dados do creative individual (baseado no request)
     const creativeData = {
       title: `${requestData.title} - ${format}`,
       description: requestData.description || undefined,
       prompt: requestData.prompt,
       style: requestData.style || "Moderno",
       primary_color: requestData.primary_color || undefined,
       secondary_color: requestData.secondary_color || undefined,
       headline: requestData.headline || undefined,
       sub_headline: requestData.sub_headline || undefined,
       cta_text: requestData.cta_text || undefined,
       logo_url: requestData.logo_url || undefined,
       product_images: requestData.product_images,
      format: format,
      // Aplicar configurações padrão do usuário
      quality: userDefaults.quality,
      output_format: userDefaults.output_format,
      output_compression: userDefaults.output_compression,
      background: userDefaults.background,
      // Metadados
      user_id: user.id,
      request_id: creativeRequest.id, // 🔗 Link para o request
      status: 'queued' as const,
    };

    // Criar o creative
    const { data: creative, error: creativeError } = await supabase
      .from("creatives")
      .insert(creativeData)
      .select()
      .single();

    if (creativeError) {
      console.error(`Failed to create creative for format ${format}:`, creativeError);
      // Em caso de erro, fazemos rollback dos criativos já criados
      await rollbackCreativeRequest(creativeRequest.id, createdCreatives);
      throw new Error(`Não foi possível criar o criativo para o formato ${format}.`);
    }

    createdCreatives.push(creative);
    console.log(`Creative created for ${format}: ${creative.id}`);

    // Criar job na fila para este creative
    const { data: job, error: jobError } = await supabase
      .from("queue_jobs")
      .insert({
        creative_id: creative.id,
        user_id: user.id,
        status: 'pending',
        priority: 5,
      })
      .select()
      .single();

    if (jobError) {
      console.error(`Failed to create queue job for creative ${creative.id}:`, jobError);
      // Rollback em caso de erro
      await rollbackCreativeRequest(creativeRequest.id, createdCreatives);
      throw new Error(`Não foi possível adicionar o criativo ${format} à fila de processamento.`);
    }

    createdJobs.push(job);
    console.log(`Queue job created for ${format}: ${job.id}`);
  }

  // 🎯 ETAPA 4: Atualizar status do request para 'processing'
  await supabase
    .from("creative_requests")
    .update({ status: 'processing' })
    .eq("id", creativeRequest.id);

  console.log(`Created ${createdCreatives.length} creatives and ${createdJobs.length} queue jobs`);

  // 🚀 ETAPA 5: Auto-trigger do processamento
  try {
    console.log("Auto-triggering queue processing...");
    await triggerQueueProcessing();
    console.log("Queue processing triggered successfully");
  } catch (error) {
    console.warn("Failed to auto-trigger processing, will need manual trigger:", error);
    // Não falhamos a criação se o trigger automático falhar
  }

  console.log("--- [🚀 ACTION END: createCreativeRequest] ---\n");

  revalidatePath("/new");
  revalidatePath("/queue");
  
  // Redireciona para a fila para acompanhar o processamento
  redirect("/queue");
}

/**
 * 🚀 NOVA: Cria múltiplas variações de um criativo sem redirect automático
 * Permite ao usuário continuar criando outros criativos rapidamente
 */
export async function createCreativeVariations(formData: CreateCreativeData) {
  console.log("\n--- [🚀 ACTION START: createCreativeVariations] ---");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("createCreativeVariations: User not authenticated.");
    throw new Error("Usuário não autenticado.");
  }

  console.log(`User ID: ${user.id}`);
  console.log(`Creating ${formData.quantity} variation(s)`);

  // Valida os dados do formulário
  const validationResult = createCreativeSchema.safeParse(formData);
  
  if (!validationResult.success) {
    const errorMessages = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    console.error("createCreativeVariations: Validation failed.", errorMessages);
    throw new Error(`Erro de validação: ${errorMessages}`);
  }

  // 🎯 CORREÇÃO: Remover o campo 'quantity' do objeto antes de salvar no DB
  const { quantity, ...creativeBaseData } = validationResult.data;
  const createdCreatives = [];
  const createdJobs = [];

  // Criar múltiplas variações
  for (let i = 1; i <= quantity; i++) {
    const variationTitle = quantity > 1 
      ? `${creativeBaseData.title} - Variação ${i}`
      : creativeBaseData.title;

    const creativeData = {
      ...creativeBaseData, // Usar o objeto sem o campo 'quantity'
      title: variationTitle,
      user_id: user.id,
      status: 'queued' as const,
      product_images: JSON.stringify(creativeBaseData.product_images || []),
    };

    console.log(`Creating variation ${i}/${quantity}: ${variationTitle}`);

    // Criar o criativo
    const { data: creative, error: creativeError } = await supabase
      .from("creatives")
      .insert(creativeData)
      .select()
      .single();

    if (creativeError) {
      console.error(`Failed to create variation ${i}:`, creativeError);
      // Em caso de erro, tentamos fazer rollback dos já criados
      await rollbackCreatives(createdCreatives);
      throw new Error(`Não foi possível criar a variação ${i}.`);
    }

    createdCreatives.push(creative);
    console.log(`Creative variation ${i} created with ID: ${creative.id}`);

    // Criar job na fila para este creative
    const { data: job, error: jobError } = await supabase
      .from("queue_jobs")
      .insert({
        creative_id: creative.id,
        user_id: user.id,
        status: 'pending',
        priority: 5,
      })
      .select()
      .single();

    if (jobError) {
      console.error(`Failed to create queue job for variation ${i}:`, jobError);
      // Rollback em caso de erro
      await rollbackCreatives(createdCreatives);
      throw new Error(`Não foi possível adicionar a variação ${i} à fila de processamento.`);
    }

    createdJobs.push(job);
    console.log(`Queue job created for variation ${i}: ${job.id}`);
  }

  console.log(`Successfully created ${createdCreatives.length} creative variations and ${createdJobs.length} queue jobs`);

  // 🚀 Auto-trigger do processamento
  try {
    console.log("Auto-triggering queue processing...");
    await triggerQueueProcessing();
    console.log("Queue processing triggered successfully");
  } catch (error) {
    console.warn("Failed to auto-trigger processing, will need manual trigger:", error);
    // Não falhamos a criação se o trigger automático falhar
  }

  console.log("--- [🚀 ACTION END: createCreativeVariations] ---\n");

  revalidatePath("/new");
  revalidatePath("/queue");
  
  // 🎯 PRINCIPAL DIFERENÇA: NÃO faz redirect automático
  // Retorna informações sobre o que foi criado
  return { 
    success: true, 
    created_count: createdCreatives.length,
    creative_ids: createdCreatives.map(c => c.id),
    job_ids: createdJobs.map(j => j.id)
  };
}

/**
 * Utilitário para fazer rollback de criativos em caso de erro
 */
async function rollbackCreatives(creatives: any[]) {
  if (creatives.length === 0) return;
  
  const supabase = await createClient();
  const creativeIds = creatives.map(c => c.id);
  
  console.log(`Rolling back ${creativeIds.length} creatives: ${creativeIds.join(", ")}`);
  
  await supabase
    .from("creatives")
    .delete()
    .in("id", creativeIds);
    
  console.log("Rollback completed");
}

/**
 * Função auxiliar para rollback em caso de erro
 */
async function rollbackCreativeRequest(requestId: string, createdCreatives: any[]) {
  console.log(`Rolling back creative request ${requestId}...`);
  const supabase = await createClient();

  // Remove todos os queue_jobs dos criativos criados
  for (const creative of createdCreatives) {
    await supabase
      .from("queue_jobs")
      .delete()
      .eq("creative_id", creative.id);
  }

  // Remove todos os criativos criados
  await supabase
    .from("creatives")
    .delete()
    .eq("request_id", requestId);

  // Remove o request
  await supabase
    .from("creative_requests")
    .delete()
    .eq("id", requestId);

  console.log("Rollback completed");
}

/**
 * ✨ NOVA: Lista as solicitações de múltiplos formatos do usuário
 */
export async function getUserCreativeRequests(filters: {
  status?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  let query = supabase
    .from("creative_requests")
    .select(`
      *,
      creatives (
        id,
        format,
        status,
        generated_image_url,
        result_url,
        error_message,
        processing_time_ms,
        processed_at,
        created_at,
        queue_jobs (
          id,
          status,
          priority,
          attempts,
          error_message,
          processing_started_at,
          processing_completed_at
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Aplica filtros
  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  // Paginação
  const limit = filters.limit || 20;
  const offset = filters.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error("getUserCreativeRequests: Error fetching requests:", error);
    throw new Error("Não foi possível carregar as solicitações.");
  }

  return data || [];
}

/**
 * ✨ NOVA: Atualiza o status de um creative_request baseado nos status dos creatives filhos
 */
export async function updateCreativeRequestStatus(requestId: string) {
  const supabase = await createClient();

  // Busca todos os criativos relacionados ao request
  const { data: creatives, error } = await supabase
    .from("creatives")
    .select("status")
    .eq("request_id", requestId);

  if (error || !creatives || creatives.length === 0) {
    return;
  }

     // Conta os status
   const statusCounts = creatives.reduce((acc, creative) => {
     const status = creative.status || 'pending';
     acc[status] = (acc[status] || 0) + 1;
     return acc;
   }, {} as Record<string, number>);

  // Determina o status agregado
  let aggregatedStatus: 'pending' | 'processing' | 'completed' | 'partial' | 'failed';

  if (statusCounts.failed === creatives.length) {
    aggregatedStatus = 'failed'; // Todos falharam
  } else if (statusCounts.completed === creatives.length) {
    aggregatedStatus = 'completed'; // Todos concluídos
  } else if (statusCounts.completed > 0 && (statusCounts.failed > 0 || statusCounts.processing > 0)) {
    aggregatedStatus = 'partial'; // Alguns concluídos, outros não
  } else if (statusCounts.processing > 0) {
    aggregatedStatus = 'processing'; // Pelo menos um processando
  } else {
    aggregatedStatus = 'pending'; // Todos pendentes
  }

  // Atualiza o status do request
  await supabase
    .from("creative_requests")
    .update({ 
      status: aggregatedStatus,
      updated_at: new Date().toISOString()
    })
    .eq("id", requestId);

  console.log(`Updated request ${requestId} status to: ${aggregatedStatus}`);
}

/**
 * ✨ NOVA: Reprocessa todos os criativos falhos de um request
 */
export async function reprocessCreativeRequest(requestId: string) {
  console.log("\n--- [🚀 ACTION START: reprocessCreativeRequest] ---");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  console.log(`User ID: ${user.id}, Request ID: ${requestId}`);

  // Busca todos os criativos falhos do request
  const { data: failedCreatives, error: fetchError } = await supabase
    .from("creatives")
    .select("id")
    .eq("request_id", requestId)
    .eq("user_id", user.id)
    .eq("status", "failed");

  if (fetchError) {
    console.error("reprocessCreativeRequest: Error fetching failed creatives:", fetchError);
    throw new Error("Não foi possível buscar os criativos falhos.");
  }

  if (!failedCreatives || failedCreatives.length === 0) {
    return { success: true, message: "Nenhum criativo falho encontrado." };
  }

  console.log(`Found ${failedCreatives.length} failed creatives to reprocess`);

  // Reprocessa cada criativo falho
  for (const creative of failedCreatives) {
    await reprocessCreative(creative.id);
  }

  // Atualiza o status do request
  await updateCreativeRequestStatus(requestId);

  console.log("--- [🚀 ACTION END: reprocessCreativeRequest] ---\n");

  revalidatePath("/queue");
  revalidatePath("/gallery");

  return { 
    success: true, 
    message: `${failedCreatives.length} criativo(s) adicionado(s) à fila de reprocessamento.` 
  };
}

/**
 * ✨ NOVA: Remove um creative_request e todos os criativos relacionados
 * (somente se todos estiverem em status que permite remoção)
 */
export async function deleteCreativeRequest(requestId: string) {
  console.log("\n--- [🚀 ACTION START: deleteCreativeRequest] ---");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  console.log(`User ID: ${user.id}, Request ID: ${requestId}`);

  // Verifica se o request pode ser removido
  const { data: request, error: requestError } = await supabase
    .from("creative_requests")
    .select("id, status")
    .eq("id", requestId)
    .eq("user_id", user.id)
    .single();

  if (requestError || !request) {
    throw new Error("Solicitação não encontrada.");
  }

  // Busca todos os criativos relacionados
  const { data: creatives, error: creativesError } = await supabase
    .from("creatives")
    .select("id, status")
    .eq("request_id", requestId);

  if (creativesError) {
    throw new Error("Não foi possível verificar os criativos relacionados.");
  }

  // Verifica se todos os criativos podem ser removidos
  const canDelete = creatives.every(creative => 
    ['draft', 'failed'].includes(creative.status || '')
  );

  if (!canDelete) {
    throw new Error("Somente solicitações com todos os criativos em rascunho ou falha podem ser removidas.");
  }

  // Remove todos os queue_jobs relacionados
  for (const creative of creatives) {
    await supabase
      .from("queue_jobs")
      .delete()
      .eq("creative_id", creative.id);
  }

  // Remove todos os criativos relacionados
  await supabase
    .from("creatives")
    .delete()
    .eq("request_id", requestId);

  // Remove o request
  const { error: deleteError } = await supabase
    .from("creative_requests")
    .delete()
    .eq("id", requestId)
    .eq("user_id", user.id);

  if (deleteError) {
    console.error("deleteCreativeRequest: DATABASE OPERATION FAILED:", deleteError);
    throw new Error("Não foi possível remover a solicitação.");
  }

  console.log(`Creative request deleted successfully: ${requestId}`);
  console.log("--- [🚀 ACTION END: deleteCreativeRequest] ---\n");

  revalidatePath("/new");
  revalidatePath("/queue");
  revalidatePath("/gallery");

  return { success: true };
}

/**
 * 🆕 FUNÇÃO DE CORREÇÃO: Corrige requests com status incorreto
 * Verifica todos os requests do usuário e corrige os que têm status inconsistente
 */
export async function fixInconsistentRequestStatuses() {
  console.log("\n--- [🔧 ACTION START: fixInconsistentRequestStatuses] ---");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  console.log(`User ID: ${user.id}`);

  // Busca todos os requests do usuário com seus criativos
  const { data: requests, error } = await supabase
    .from("creative_requests")
    .select(`
      id,
      title,
      status,
      creatives (id, status)
    `)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching requests:", error);
    throw new Error("Não foi possível buscar as solicitações.");
  }

  if (!requests || requests.length === 0) {
    return { success: true, message: "Nenhuma solicitação encontrada." };
  }

  console.log(`Found ${requests.length} requests to check`);

  let correctedCount = 0;
  const corrections = [];

  for (const request of requests) {
    const creatives = request.creatives as any[];
    
    if (!creatives || creatives.length === 0) {
      console.log(`Request ${request.id} has no creatives, skipping`);
      continue;
    }

    // Calcula status correto
    const total = creatives.length;
    const completed = creatives.filter(c => c.status === 'completed').length;
    const failed = creatives.filter(c => c.status === 'failed').length;
    const processing = creatives.filter(c => c.status === 'processing').length;
    const queued = creatives.filter(c => c.status === 'queued').length;

    let correctStatus: 'pending' | 'processing' | 'completed' | 'partial' | 'failed';

    if (failed === total) {
      correctStatus = 'failed';
    } else if (completed === total) {
      correctStatus = 'completed';
    } else if (completed > 0 && failed > 0 && (completed + failed) === total) {
      correctStatus = 'partial';
    } else if (processing > 0 || queued > 0) {
      correctStatus = 'processing';
    } else {
      correctStatus = 'pending';
    }

    // Verifica se precisa corrigir
    if (request.status !== correctStatus) {
      console.log(`🔧 Correcting request ${request.id}: ${request.status} -> ${correctStatus}`);
      console.log(`   Status breakdown: completed=${completed}, failed=${failed}, processing=${processing}, queued=${queued}, total=${total}`);

      const { error: updateError } = await supabase
        .from("creative_requests")
        .update({
          status: correctStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", request.id);

      if (updateError) {
        console.error(`Failed to update request ${request.id}:`, updateError);
        corrections.push({
          requestId: request.id,
          title: request.title,
          error: updateError.message
        });
      } else {
        correctedCount++;
        corrections.push({
          requestId: request.id,
          title: request.title,
          oldStatus: request.status,
          newStatus: correctStatus,
          breakdown: { completed, failed, processing, queued, total }
        });
      }
    } else {
      console.log(`✅ Request ${request.id} status is correct: ${request.status}`);
    }
  }

  console.log(`Fixed ${correctedCount} requests with inconsistent status`);
  console.log("--- [🔧 ACTION END: fixInconsistentRequestStatuses] ---\n");

  revalidatePath("/queue");
  revalidatePath("/gallery");

  return { 
    success: true, 
    correctedCount,
    corrections,
    message: `${correctedCount} solicitação(ões) corrigida(s).`
  };
}

/**
 * 🆕 FUNÇÃO INTELIGENTE: Monitora e corrige status de um request específico
 * Esta função pode ser chamada pelo realtime quando detectar mudanças
 */
export async function smartUpdateRequestStatus(requestId: string) {
  console.log(`\n--- [🧠 ACTION START: smartUpdateRequestStatus] ---`);
  console.log(`Request ID: ${requestId}`);

  try {
    await updateCreativeRequestStatus(requestId);
    revalidatePath("/queue");
    revalidatePath("/gallery");
    return { success: true };
  } catch (error: any) {
    console.error("smartUpdateRequestStatus error:", error);
    return { success: false, error: error.message };
  } finally {
    console.log("--- [🧠 ACTION END: smartUpdateRequestStatus] ---\n");
  }
} 