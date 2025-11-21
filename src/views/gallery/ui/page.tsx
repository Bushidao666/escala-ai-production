"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";
import { getCreativesForGallery } from "@/modules/gallery/application/actions";
import { deleteCreative } from "@/modules/gallery/application/actions";
import { type GalleryFilters } from "./gallery.types";
import { CreativeLightbox } from "./CreativeLightbox";
import { useCreativeDownload } from "@/features/download-creative/model/use-creative-download";
import { ProgressModal } from "@/shared/ui/progress-modal";
import { FORMAT_LABELS } from "@/modules/creative/dto/creative.schema";

// Widgets
import { PremiumControlSidebar } from "@/widgets/gallery-controls";
import { GalleryGrid } from "@/widgets/gallery-grid";
import { FloatingFilterBar } from "@/features/gallery-filters";

// Icons
import {
  GalleryVertical,
  Sparkles,
  Plus,
  RefreshCw,
  Heart,
  Eye,
  Star,
  Sliders
} from "lucide-react";

// Types
type ViewMode = 'masonry' | 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'title' | 'status';
type GalleryItem = any; // Using any for now to match existing loose typing in original file

export default function GalleryPage() {
  // Core State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [creatives, setCreatives] = useState<GalleryItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeCreativeIndex, setActiveCreativeIndex] = useState<number | null>(null);

  // Filters State
  const [filters, setFilters] = useState<GalleryFilters>({
    page: 1,
    limit: 20,
    search: '',
    status: [],
    format: [],
  });

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Download Hook
  const {
    downloadSelectedCreatives,
    isDownloading,
    progress,
    showModal,
    estimatedSize,
    setShowModal,
    cancelDownload
  } = useCreativeDownload();

  // Handlers
  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]);
    toast.success(favorites.includes(id) ? "Removido dos favoritos" : "Adicionado aos favoritos");
  };

  const loadCreatives = useCallback(async (currentFilters: GalleryFilters, append = false) => {
    if (!append) setIsLoading(true);
    try {
      const { data, count } = await getCreativesForGallery(currentFilters);
      if (append) {
        setCreatives(prev => [...prev, ...data]);
      } else {
        setCreatives(data);
      }
      setTotalCount(count);
      setHasMore(data.length === currentFilters.limit);
    } catch (error) {
      console.error("Falha ao carregar criativos:", error);
      toast.error("Erro ao carregar criativos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadCreatives(filters); }, [filters, loadCreatives]);

  // Infinite Scroll
  useEffect(() => {
    if (!hasMore || isLoading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const nextPage = Math.floor(creatives.length / filters.limit) + 1;
          loadCreatives({ ...filters, page: nextPage }, true);
        }
      },
      { threshold: 0.1 }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, creatives.length, filters, loadCreatives]);

  // Actions
  const handleFilterChange = (newFilterValues: Partial<GalleryFilters>) => {
    setFilters({ ...filters, ...newFilterValues, page: 1 });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    handleFilterChange({ search: query });
    setShowSearchSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
    if (searchInputRef.current) searchInputRef.current.value = suggestion;
  };

  const handleSelectionChange = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    const allIds = creatives.map(c => c.id);
    setSelectedIds(selectedIds.length === allIds.length ? [] : allIds);
  };

  const handleDeleteSelected = async () => {
    setIsDeleting(true);
    try {
      await Promise.all(selectedIds.map(id => deleteCreative(id)));
      toast.success("Criativos excluídos!");
      setSelectedIds([]);
      loadCreatives({ ...filters, page: 1 });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadSelected = async () => {
    if (!selectedIds.length) return toast.warning("Selecione itens");
    try { await downloadSelectedCreatives(selectedIds); } catch (e) { console.error(e); }
  };

  const allLightboxImages = useMemo(() => {
      return creatives.flatMap(item =>
        item.type === 'request'
          ? item.creatives.filter((c: any) => c.status === 'completed' && c.result_url).map((c: any) => ({ ...c, title: item.title }))
          : item.result_url ? [item] : []
      );
  }, [creatives]);

  const openLightbox = (item: any, index = 0) => {
      // Simple implementation for now
      setLightboxOpen(true);
  };

  // Active Filters Calculation
  const activeFilters = useMemo(() => {
    const list: any[] = [];
    if (searchQuery) list.push({ key: 'search', label: 'Busca', value: searchQuery });
    filters.status?.forEach(s => list.push({ key: 'status', label: 'Status', value: s }));
    filters.format?.forEach(f => list.push({ key: 'format', label: 'Formato', value: FORMAT_LABELS[f as keyof typeof FORMAT_LABELS] || f }));
    return list;
  }, [searchQuery, filters]);

  const handleClearFilter = (key: string, value: string) => {
     if (key === 'search') {
         setSearchQuery('');
         handleFilterChange({ search: '' });
     } else if (key === 'status') {
         handleFilterChange({ status: filters.status?.filter(s => s !== value) });
     } else if (key === 'format') {
        // logic simplification
        handleFilterChange({ format: filters.format?.filter(f => (FORMAT_LABELS[f as keyof typeof FORMAT_LABELS] || f) !== value) });
     }
  };

  const handleClearAllFilters = () => {
      setSearchQuery('');
      setFilters({ page: 1, limit: 20, search: '', status: [], format: [] });
  };

  return (
    <div className="min-h-screen relative">
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-all duration-500 animate-in fade-in-0"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <PremiumControlSidebar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchInputRef={searchInputRef}
        showSearchSuggestions={showSearchSuggestions}
        setShowSearchSuggestions={setShowSearchSuggestions}
        handleSearch={handleSearch}
        handleSuggestionClick={handleSuggestionClick}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        showAdvancedFilters={showAdvancedFilters}
        setShowAdvancedFilters={setShowAdvancedFilters}
        filters={filters}
        handleFilterChange={handleFilterChange}
        totalCount={totalCount}
        selectedIds={selectedIds}
        favorites={favorites}
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        handleSelectAll={handleSelectAll}
        handleDeleteSelected={handleDeleteSelected}
        isDeleting={isDeleting}
        handleDownloadSelected={handleDownloadSelected}
        isDownloading={isDownloading}
      />

      <div className={cn("transition-all duration-500 p-4 lg:p-6 xl:p-8", sidebarCollapsed ? "mr-16" : "mr-80 xl:mr-96 2xl:mr-[420px]")}>
         <div className="max-w-none mx-auto">
            {/* Header Section */}
            <header className="mb-10">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-6">
                     <div className="relative bg-gradient-to-br from-brand-neon-green via-emerald-400 to-brand-neon-green-dark p-5 rounded-3xl shadow-2xl border border-brand-neon-green/20">
                        <GalleryVertical className="w-8 h-8 text-brand-black drop-shadow-lg" />
                     </div>
                     <div>
                        <h1 className="text-5xl font-black text-white tracking-tight">Galeria Premium</h1>
                        <div className="flex items-center space-x-6 text-sm mt-3">
                           <div className="flex items-center space-x-2 bg-brand-gray-800/50 px-3 py-1.5 rounded-full border border-brand-gray-700/50">
                              <span className="text-brand-gray-300">{totalCount} criativos</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center space-x-3">
                     <Button className="btn-neon h-12 px-8" onClick={() => window.location.href = '/new'}>
                        <Plus className="w-5 h-5 mr-2" /> Novo Criativo
                     </Button>
                  </div>
               </div>
            </header>

            {/* Main Grid */}
            <main>
               {isLoading && creatives.length === 0 ? (
                  <div className="text-center py-20 text-white">Carregando...</div>
               ) : creatives.length === 0 ? (
                  <div className="text-center py-20 text-white">Galeria Vazia</div>
               ) : (
                  <GalleryGrid
                     creatives={creatives}
                     viewMode={viewMode}
                     selectedIds={selectedIds}
                     favorites={favorites}
                     handleSelectionChange={handleSelectionChange}
                     toggleFavorite={toggleFavorite}
                     openLightbox={openLightbox}
                  />
               )}
               <div ref={loadMoreRef} className="h-10" />
            </main>

            {/* Floating Filters */}
            <FloatingFilterBar
               activeFilters={activeFilters}
               onClearFilter={handleClearFilter}
               onClearAll={handleClearAllFilters}
               totalResults={totalCount}
            />

            {/* Modals */}
            <ProgressModal
               isOpen={showModal}
               onOpenChange={setShowModal}
               progress={progress}
               selectedCount={selectedIds.length}
               estimatedSize={estimatedSize}
               onCancel={cancelDownload}
            />

            {lightboxOpen && (
                <CreativeLightbox
                    isOpen={lightboxOpen}
                    images={allLightboxImages}
                    startIndex={activeCreativeIndex ?? 0}
                    onClose={() => setLightboxOpen(false)}
                    onDelete={async (id) => {
                        await deleteCreative(id);
                        setLightboxOpen(false);
                        loadCreatives(filters);
                    }}
                />
            )}
         </div>
      </div>
    </div>
  );
}
