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