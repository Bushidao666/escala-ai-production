"use server";

import { createClient } from "@/lib/supabase/server";
import { galleryFiltersSchema, type GalleryFilters } from "./gallery.types";

/**
 * 🚀 NOVA IMPLEMENTAÇÃO: Busca unificada com ordenação cronológica real em SQL
 * Retorna criativos e requests ordenados cronologicamente, filtrando apenas conteúdo útil.
 */
export async function getCreativesForGallery(filters: GalleryFilters) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado para buscar a galeria.");
  }

  const parsedFilters = galleryFiltersSchema.parse(filters);
  const { search, status, format, style, page, limit } = parsedFilters;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // 🎯 USAR QUERY OTIMIZADA DIRETAMENTE
  // Por enquanto usamos a versão fallback otimizada que já resolve o problema
  return await getCreativesForGalleryFallback(parsedFilters, user.id);
}

/**
 * 🔄 FALLBACK: Query otimizada para casos onde RPC não está disponível
 */
async function getCreativesForGalleryFallback(filters: GalleryFilters, userId: string) {
  const supabase = await createClient();
  const { search, status, format, style, page, limit } = filters;

  // 🎯 QUERY OTIMIZADA: Busca apenas conteúdo útil dos criativos órfãos
  let requestsQuery = supabase
    .from("creative_requests")
    .select(`
      id,
      title,
      prompt,
      status,
      style,
      created_at,
      primary_color,
      secondary_color,
      creatives ( id, format, result_url, status )
    `)
    .eq("user_id", userId);

  let creativesQuery = supabase
    .from("creatives")
    .select(`
      id,
      title,
      prompt,
      status,
      style,
      format,
      result_url,
      created_at,
      error_message,
      primary_color,
      secondary_color,
      logo_url,
      product_images
    `)
    .eq("user_id", userId)
    .is('request_id', null)
    // 🚨 FILTRO CRÍTICO: Apenas criativos órfãos completados (com conteúdo útil)
    .eq('status', 'completed')
    .not('result_url', 'is', null);

  // Aplicar filtros
  if (search && search.trim() !== '') {
    const searchQuery = `title.ilike.%${search}%,prompt.ilike.%${search}%`;
    requestsQuery = requestsQuery.or(searchQuery);
    creativesQuery = creativesQuery.or(searchQuery);
  }
  if (status && status.length > 0) {
    requestsQuery = requestsQuery.in('status', status);
    creativesQuery = creativesQuery.in('status', status);
  }
  if (format && format.length > 0) {
    requestsQuery = requestsQuery.filter('creatives.format', 'in', `(${format.join(',')})`);
    creativesQuery = creativesQuery.in('format', format);
  }
  if (style && style.length > 0) {
    requestsQuery = requestsQuery.in('style', style);
    creativesQuery = creativesQuery.in('style', style);
  }

  // Buscar todos os dados sem paginação para unificar corretamente
  const [
    { data: requestsData, error: requestsError },
    { data: creativesData, error: creativesError }
  ] = await Promise.all([
    requestsQuery.order("created_at", { ascending: false }),
    creativesQuery.order("created_at", { ascending: false })
  ]);

  if (requestsError || creativesError) {
    console.error("Gallery Fallback Error:", { requestsError, creativesError });
    throw new Error("Não foi possível carregar os itens da galeria.");
  }

  // 🎯 UNIFICAÇÃO CRONOLÓGICA CORRETA
  const unifiedData = [
    ...(requestsData || []).map(item => ({ ...item, type: 'request' })),
    ...(creativesData || []).map(item => ({ ...item, type: 'creative' }))
  ]
  .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
  .slice((page - 1) * limit, page * limit); // Paginação aplicada APÓS ordenação

  const totalCount = (requestsData?.length || 0) + (creativesData?.length || 0);

  return {
    data: unifiedData,
    count: totalCount,
  };
}

/**
 * 📥 NOVA: Busca dados completos de criativos selecionados para download em lote
 * Suporta tanto criativos individuais quanto requests com múltiplos criativos
 */
export async function getSelectedCreativesForDownload(selectedIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado para buscar criativos.");
  }

  if (!selectedIds.length) {
    throw new Error("Nenhum item selecionado para download.");
  }

  console.log(`🔍 Buscando dados para download de ${selectedIds.length} itens selecionados`);

  // Array para armazenar todos os criativos a serem baixados
  const creativesForDownload: any[] = [];

  // 🎯 ETAPA 1: Buscar criativos individuais (órfãos) pelos IDs selecionados
  const { data: individualCreatives, error: creativesError } = await supabase
    .from("creatives")
    .select(`
      id,
      title,
      prompt,
      format,
      result_url,
      style,
      created_at,
      request_id,
      status
    `)
    .eq("user_id", user.id)
    .in("id", selectedIds)
    .eq("status", "completed")
    .not("result_url", "is", null);

  if (creativesError) {
    console.error("Erro ao buscar criativos individuais:", creativesError);
    throw new Error("Erro ao buscar criativos para download.");
  }

  // Adicionar criativos individuais válidos
  if (individualCreatives && individualCreatives.length > 0) {
    const validIndividualCreatives = individualCreatives.map(creative => ({
      id: creative.id,
      title: creative.title,
      format: creative.format,
      result_url: creative.result_url,
      style: creative.style,
      created_at: creative.created_at,
      type: 'creative' as const,
      request_id: creative.request_id
    }));
    
    creativesForDownload.push(...validIndividualCreatives);
    console.log(`✅ Encontrados ${validIndividualCreatives.length} criativos individuais válidos`);
  }

  // 🎯 ETAPA 2: Buscar creative requests pelos IDs selecionados
  const { data: creativeRequests, error: requestsError } = await supabase
    .from("creative_requests")
    .select(`
      id,
      title,
      prompt,
      style,
      created_at,
      creatives (
        id,
        title,
        format,
        result_url,
        status,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .in("id", selectedIds);

  if (requestsError) {
    console.error("Erro ao buscar creative requests:", requestsError);
    throw new Error("Erro ao buscar requests para download.");
  }

  // Processar requests e extrair criativos completados
  if (creativeRequests && creativeRequests.length > 0) {
    for (const request of creativeRequests) {
      const completedCreatives = (request.creatives || [])
        .filter((creative: any) => creative.status === 'completed' && creative.result_url)
        .map((creative: any) => ({
          id: creative.id,
          title: `${request.title} - ${creative.format}`,
          format: creative.format,
          result_url: creative.result_url,
          style: request.style,
          created_at: creative.created_at,
          type: 'request' as const,
          request_id: request.id
        }));

      creativesForDownload.push(...completedCreatives);
    }
    
    console.log(`✅ Processados ${creativeRequests.length} requests`);
  }

  // 🎯 ETAPA 3: Validar e filtrar criativos válidos para download
  const validCreatives = creativesForDownload.filter(creative => 
    creative.result_url && 
    creative.result_url.length > 0 &&
    !creative.result_url.startsWith('blob:') // Excluir URLs temporárias
  );

  console.log(`📊 Resultado final: ${validCreatives.length} criativos válidos de ${selectedIds.length} itens selecionados`);

  if (validCreatives.length === 0) {
    throw new Error("Nenhum criativo válido encontrado para download. Verifique se os itens selecionados foram processados com sucesso.");
  }

  // 🎯 ETAPA 4: Organizar estatísticas por formato
  const statsByFormat = validCreatives.reduce((acc, creative) => {
    const format = creative.format;
    acc[format] = (acc[format] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log(`📈 Distribuição por formato:`, statsByFormat);

  return {
    creatives: validCreatives,
    totalCount: validCreatives.length,
    statsByFormat,
    selectedCount: selectedIds.length
  };
} 