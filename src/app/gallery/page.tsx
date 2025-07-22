"use client";

import { 
  GalleryVertical, 
  Grid3X3, 
  LayoutGrid, 
  List, 
  Search, 
  Filter, 
  SortDesc, 
  Download, 
  Trash2, 
  Eye, 
  Heart, 
  Sparkles,
  Zap,
  Palette,
  Calendar,
  Tag,
  TrendingUp,
  X,
  ChevronDown,
  RefreshCw,
  Plus,
  Settings,
  Star,
  ChevronLeft,
  ChevronRight,
  Layers2,
  Sliders
} from "lucide-react";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getCreativesForGallery } from "@/app/gallery/actions";
import { deleteCreative } from "@/app/new/actions";
import { type GalleryFilters } from "./gallery.types";
import { CreativeLightbox } from "./CreativeLightbox";
import { UnifiedGalleryCard } from "./UnifiedGalleryCard";
import { useCreativeDownload } from "@/hooks/useCreativeDownload";
import { ProgressModal } from "@/components/ui/progress-modal";


import { FORMAT_LABELS } from "@/lib/schemas/creative";

interface Creative {
  id: string;
  title: string;
  prompt: string;
  status: string;
  style: string;
  format: string;
  result_url: string | null;
  created_at: string;
  error_message: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
  product_images: any[] | null;
}

type ViewMode = 'masonry' | 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'title' | 'status';

// Tipos unificados para a galeria
type GalleryItem = (Creative & { type: 'creative' }) | (any & { type: 'request' });

// Search Suggestions Component
function SearchSuggestions({ 
  query, 
  onSuggestionClick, 
  isVisible 
}: { 
  query: string; 
  onSuggestionClick: (suggestion: string) => void;
  isVisible: boolean;
}) {
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    
    const baseSuggestions = [
      'moderno', 'vintage', 'minimalista', 'colorido', 'elegante',
      'campanha', 'produto', 'social media', 'instagram', 'facebook',
      'verão', 'inverno', 'natal', 'black friday', 'promoção'
    ];
    
    return baseSuggestions
      .filter(s => s.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }, [query]);

  if (!isVisible || suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-brand-gray-900/95 border border-brand-gray-700/50 rounded-lg backdrop-blur-xl shadow-2xl">
      <div className="p-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="w-full text-left px-3 py-2 text-sm text-brand-gray-300 hover:bg-brand-neon-green/10 hover:text-brand-neon-green rounded-md transition-colors duration-200"
          >
            <Search className="w-3 h-3 inline mr-2" />
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}



// Epic Premium Sidebar Component
function PremiumControlSidebar({
  searchQuery,
  setSearchQuery,
  searchInputRef,
  showSearchSuggestions,
  setShowSearchSuggestions,
  handleSearch,
  handleSuggestionClick,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  showAdvancedFilters,
  setShowAdvancedFilters,
  filters,
  handleFilterChange,
  totalCount,
  selectedIds,
  favorites,
  previewMode,
  setPreviewMode,
  sidebarCollapsed,
  setSidebarCollapsed,
  handleSelectAll,
  handleDeleteSelected,
  isDeleting,
  handleDownloadSelected,
  isDownloading
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  showSearchSuggestions: boolean;
  setShowSearchSuggestions: (show: boolean) => void;
  handleSearch: (query: string) => void;
  handleSuggestionClick: (suggestion: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (show: boolean) => void;
  filters: GalleryFilters;
  handleFilterChange: (filters: Partial<GalleryFilters>) => void;
  totalCount: number;
  selectedIds: string[];
  favorites: string[];
  previewMode: boolean;
  setPreviewMode: (preview: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  handleSelectAll: () => void;
  handleDeleteSelected: () => void;
  isDeleting: boolean;
  handleDownloadSelected: () => void;
  isDownloading: boolean;
}) {
  return (
    <div className={cn(
      "sidebar-glass fixed top-0 right-0 h-screen bg-brand-black/60 backdrop-blur-xl border-l border-brand-gray-800/60 transition-all duration-300 ease-in-out shadow-2xl shadow-black/20 z-40 overflow-hidden overflow-x-hidden",
      sidebarCollapsed 
        ? "w-20 min-w-20" 
        : "w-80 min-w-80 xl:w-96 xl:min-w-96 2xl:w-[420px] 2xl:min-w-[420px]"
    )}>
      {/* Epic Multi-layer Background - Matching Navigation Sidebar */}
      
      {/* Sidebar Content */}
      <div className="relative h-full flex flex-col">
        
        {/* Sidebar Header */}
        <div className={cn(
          "border-b border-brand-gray-800/40 backdrop-blur-sm",
          sidebarCollapsed ? "p-4" : "p-6"
        )}>
          {sidebarCollapsed ? (
            /* Minimized Header Layout */
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-brand-neon-green/30 rounded-2xl blur-xl animate-glow-pulse group-hover:bg-brand-neon-green/40 transition-colors duration-300"></div>
                <div className="relative bg-gradient-to-br from-brand-neon-green via-brand-neon-green to-brand-neon-green-dark p-3 rounded-2xl shadow-lg shadow-brand-neon-green/25 border border-brand-neon-green/20 group-hover:scale-105 transition-transform duration-200">
                  <Sliders className="w-6 h-6 text-brand-black drop-shadow-sm" />
                </div>
              </div>
              
              {/* Control Indicator for Minimized State */}
              <div className="relative group">
                <div className="w-10 h-10 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-xl flex items-center justify-center border border-white/20 shadow-lg shadow-black/10 hover:bg-white/15 hover:border-white/30 transition-all duration-200 hover:scale-105 cursor-pointer">
                  <Filter className="w-5 h-5 text-brand-neon-green" />
                </div>
                {/* Tooltip for controls info */}
                <div className="fixed right-24 top-1/2 transform -translate-y-1/2 bg-brand-black/95 text-white text-sm rounded-xl px-4 py-3 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 backdrop-blur-xl border border-brand-gray-600/60 shadow-2xl shadow-black/40 z-[9999] min-w-max">
                  <div className="relative">
                    <p className="font-semibold text-white">Controles da Galeria</p>
                    <p className="text-xs text-brand-gray-400 mt-1">Busca, filtros e configurações</p>
                  </div>
                  {/* Mini-modal arrow */}
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-8 border-transparent border-l-brand-black/95"></div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-l from-brand-neon-green/10 to-transparent rounded-xl opacity-50"></div>
                </div>
              </div>
              
              {/* Toggle Button for Minimized State */}
              <Button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                size="sm"
                variant="ghost"
                className="text-brand-gray-400 hover:text-white hover:bg-white/15 p-2.5 rounded-xl w-10 h-10 transition-all duration-200 hover:scale-105 border border-transparent hover:border-white/20 shadow-sm hover:shadow-lg hover:shadow-black/20"
                title="Expandir controles (Clique ou ⌘+B)"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            /* Expanded Header Layout */
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-brand-neon-green/30 rounded-2xl blur-xl animate-glow-pulse group-hover:bg-brand-neon-green/40 transition-colors duration-300"></div>
                  <div className="relative bg-gradient-to-br from-brand-neon-green via-brand-neon-green to-brand-neon-green-dark p-3.5 rounded-2xl shadow-lg shadow-brand-neon-green/25 border border-brand-neon-green/20">
                    <Sliders className="w-7 h-7 text-brand-black drop-shadow-sm" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h1 className="text-xl font-bold leading-none">
                    <span className="text-gradient-neon">Controles</span>{" "}
                    <span className="text-white">Pro</span>
                  </h1>
                  <p className="text-brand-gray-400 text-sm font-medium leading-none">
                    Busca, filtros e configurações
                  </p>
                </div>
              </div>
              
              {/* Toggle Button for Expanded State */}
              <Button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                size="sm"
                variant="ghost"
                className="text-brand-gray-400 hover:text-white hover:bg-white/10 p-2.5 rounded-xl transition-all duration-200 hover:scale-105"
                title="Recolher controles (Clique ou ⌘+B)"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Minimized Sidebar Indicators */}
        {sidebarCollapsed && (
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {/* Minimized navigation title indicator */}
              <div className="flex justify-center mb-2">
                <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-brand-gray-600 to-transparent rounded-full"></div>
              </div>
              
              {/* Search Quick Access */}
              <div className="relative group">
                <div className="w-12 h-12 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-xl flex items-center justify-center border border-white/20 shadow-lg shadow-black/10 hover:bg-white/15 hover:border-white/30 transition-all duration-200 hover:scale-105 cursor-pointer mx-auto">
                  <Search className="w-5 h-5 text-brand-neon-green" />
                </div>
                {/* Mini-modal tooltip */}
                <div className="fixed right-24 top-1/2 transform -translate-y-1/2 bg-brand-black/95 text-white text-sm rounded-xl px-5 py-4 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 backdrop-blur-xl border border-brand-gray-600/60 shadow-2xl shadow-black/40 z-[9999] min-w-max">
                  <div className="relative space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-brand-neon-green/20 to-brand-neon-green/10 border border-brand-neon-green/30">
                        <Search className="w-4 h-4 text-brand-neon-green" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Busca Inteligente</p>
                        <p className="text-xs text-brand-gray-400">Pesquisar criativos</p>
                      </div>
                    </div>
                  </div>
                  {/* Mini-modal arrow */}
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-8 border-transparent border-l-brand-black/95"></div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-l from-brand-neon-green/10 to-transparent rounded-xl opacity-50"></div>
                </div>
              </div>

              {/* View Mode Quick Access */}
              <div className="relative group">
                <div className="w-12 h-12 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-xl flex items-center justify-center border border-white/20 shadow-lg shadow-black/10 hover:bg-white/15 hover:border-white/30 transition-all duration-200 hover:scale-105 cursor-pointer mx-auto">
                  <LayoutGrid className="w-5 h-5 text-brand-neon-green" />
                </div>
                {/* Mini-modal tooltip */}
                <div className="fixed right-24 top-1/2 transform -translate-y-1/2 bg-brand-black/95 text-white text-sm rounded-xl px-5 py-4 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 backdrop-blur-xl border border-brand-gray-600/60 shadow-2xl shadow-black/40 z-[9999] min-w-max">
                  <div className="relative space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-brand-neon-green/20 to-brand-neon-green/10 border border-brand-neon-green/30">
                        <LayoutGrid className="w-4 h-4 text-brand-neon-green" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Visualização</p>
                        <p className="text-xs text-brand-gray-400">Modos de exibição</p>
                      </div>
                    </div>
                  </div>
                  {/* Mini-modal arrow */}
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-8 border-transparent border-l-brand-black/95"></div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-l from-brand-neon-green/10 to-transparent rounded-xl opacity-50"></div>
                </div>
              </div>

              {/* Filters Quick Access */}
              <div className="relative group">
                <div className="w-12 h-12 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-xl flex items-center justify-center border border-white/20 shadow-lg shadow-black/10 hover:bg-white/15 hover:border-white/30 transition-all duration-200 hover:scale-105 cursor-pointer mx-auto">
                  <Filter className="w-5 h-5 text-brand-neon-green" />
                </div>
                {/* Mini-modal tooltip */}
                <div className="fixed right-24 top-1/2 transform -translate-y-1/2 bg-brand-black/95 text-white text-sm rounded-xl px-5 py-4 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 backdrop-blur-xl border border-brand-gray-600/60 shadow-2xl shadow-black/40 z-[9999] min-w-max">
                  <div className="relative space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-brand-neon-green/20 to-brand-neon-green/10 border border-brand-neon-green/30">
                        <Filter className="w-4 h-4 text-brand-neon-green" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Filtros Avançados</p>
                        <p className="text-xs text-brand-gray-400">Status, formato e cores</p>
                      </div>
                    </div>
                  </div>
                  {/* Mini-modal arrow */}
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-8 border-transparent border-l-brand-black/95"></div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-l from-brand-neon-green/10 to-transparent rounded-xl opacity-50"></div>
                </div>
              </div>

              {/* Settings Quick Access */}
              <div className="relative group">
                <div className="w-12 h-12 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-xl flex items-center justify-center border border-white/20 shadow-lg shadow-black/10 hover:bg-white/15 hover:border-white/30 transition-all duration-200 hover:scale-105 cursor-pointer mx-auto">
                  <Settings className="w-5 h-5 text-brand-neon-green" />
                </div>
                {/* Mini-modal tooltip */}
                <div className="fixed right-24 top-1/2 transform -translate-y-1/2 bg-brand-black/95 text-white text-sm rounded-xl px-5 py-4 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 backdrop-blur-xl border border-brand-gray-600/60 shadow-2xl shadow-black/40 z-[9999] min-w-max">
                  <div className="relative space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-brand-neon-green/20 to-brand-neon-green/10 border border-brand-neon-green/30">
                        <Settings className="w-4 h-4 text-brand-neon-green" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Configurações</p>
                        <p className="text-xs text-brand-gray-400">Modo preview e mais</p>
                      </div>
                    </div>
                  </div>
                  {/* Mini-modal arrow */}
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-8 border-transparent border-l-brand-black/95"></div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-l from-brand-neon-green/10 to-transparent rounded-xl opacity-50"></div>
                </div>
              </div>
            </div>
          </nav>
        )}

        {/* Sidebar Body */}
        {!sidebarCollapsed && (
          <div className={cn(
            "flex-1 overflow-y-auto space-y-8 animate-in slide-in-from-right-4 duration-300",
            sidebarCollapsed ? "p-4" : "p-5"
          )}>
            
            {/* Search Section */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider mb-4 px-3">
                Busca
              </h2>
              <div className="flex items-center space-x-3 group">
                <div className="relative rounded-lg transition-all duration-300 border shadow-sm p-2 bg-brand-gray-800/70 border-brand-gray-700/70 text-brand-gray-400 group-hover:bg-brand-gray-700/90 group-hover:border-brand-gray-600/90 group-hover:text-white">
                  <Search className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-white">Busca Inteligente</h3>
              </div>
              
              <div className="relative">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-neon-green/20 via-cyan-400/20 to-blue-500/20 rounded-xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-gray-400 group-focus-within:text-brand-neon-green transition-colors duration-300" />
                    <Input
                      ref={searchInputRef}
                      placeholder="🔍 Buscar criativos..."
                      className="input-glass pl-11 pr-4 h-12 text-white border-brand-gray-600/50 focus:border-brand-neon-green/50 transition-all duration-300"
                      value={searchQuery}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchQuery(value);
                        setShowSearchSuggestions(value.length > 0);
                        if (value.length === 0) {
                          handleSearch('');
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch(searchQuery);
                        }
                      }}
                      onFocus={() => setShowSearchSuggestions(searchQuery.length > 0)}
                      onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                    />
                  </div>
                </div>
                
                <SearchSuggestions
                  query={searchQuery}
                  onSuggestionClick={handleSuggestionClick}
                  isVisible={showSearchSuggestions}
                />
              </div>
            </div>

            {/* Stats Section */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider mb-4 px-3">
                Estatísticas
              </h2>
              <div className="flex items-center space-x-3 group">
                <div className="relative rounded-lg transition-all duration-300 border shadow-sm p-2 bg-brand-gray-800/70 border-brand-gray-700/70 text-brand-gray-400 group-hover:bg-brand-gray-700/90 group-hover:border-brand-gray-600/90 group-hover:text-white">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-white">Estatísticas</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-brand-gray-800/50 rounded-xl p-4 border border-brand-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-brand-gray-400 text-sm">Total</p>
                      <p className="text-2xl font-bold text-white">{totalCount}</p>
                    </div>
                    <div className="w-2 h-2 bg-brand-neon-green rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                {selectedIds.length > 0 && (
                  <div className="bg-brand-neon-green/10 rounded-xl p-4 border border-brand-neon-green/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-brand-neon-green text-sm">Selecionados</p>
                        <p className="text-2xl font-bold text-brand-neon-green">{selectedIds.length}</p>
                      </div>
                      <Star className="w-5 h-5 text-brand-neon-green" />
                    </div>
                  </div>
                )}
                
                {favorites.length > 0 && (
                  <div className="bg-pink-500/10 rounded-xl p-4 border border-pink-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-pink-400 text-sm">Favoritos</p>
                        <p className="text-2xl font-bold text-pink-400">{favorites.length}</p>
                      </div>
                      <Heart className="w-5 h-5 text-pink-400" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* View Mode Section */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider mb-4 px-3">
                Visualização
              </h2>
              <div className="flex items-center space-x-3 group">
                <div className="relative rounded-lg transition-all duration-300 border shadow-sm p-2 bg-brand-gray-800/70 border-brand-gray-700/70 text-brand-gray-400 group-hover:bg-brand-gray-700/90 group-hover:border-brand-gray-600/90 group-hover:text-white">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-white">Visualização</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setViewMode('masonry')}
                  className={cn(
                    "p-3 rounded-lg transition-all duration-300 group relative text-center border border-transparent",
                    "hover:bg-brand-gray-700/60",
                    viewMode === 'masonry' && "btn-glass-active"
                  )}
                  title="Vista Masonry (Pinterest)"
                >
                  <LayoutGrid className={cn("w-5 h-5 mx-auto mb-1 transition-colors", viewMode !== 'masonry' && "text-brand-gray-400 group-hover:text-white")} />
                  <span className="text-xs font-medium">Masonry</span>
                </button>
                
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-3 rounded-lg transition-all duration-300 group relative text-center border border-transparent",
                    "hover:bg-brand-gray-700/60",
                    viewMode === 'grid' && "btn-glass-active"
                  )}
                  title="Vista Grid (Tradicional)"
                >
                  <Grid3X3 className={cn("w-5 h-5 mx-auto mb-1 transition-colors", viewMode !== 'grid' && "text-brand-gray-400 group-hover:text-white")} />
                  <span className="text-xs font-medium">Grid</span>
                </button>
                
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-3 rounded-lg transition-all duration-300 group relative text-center border border-transparent",
                    "hover:bg-brand-gray-700/60",
                    viewMode === 'list' && "btn-glass-active"
                  )}
                  title="Vista Lista (Compacta)"
                >
                  <List className={cn("w-5 h-5 mx-auto mb-1 transition-colors", viewMode !== 'list' && "text-brand-gray-400 group-hover:text-white")} />
                  <span className="text-xs font-medium">Lista</span>
                </button>
              </div>
            </div>

            {/* Sort Section */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider mb-4 px-3">
                Ordenação
              </h2>
              <div className="flex items-center space-x-3 group">
                <div className="relative rounded-lg transition-all duration-300 border shadow-sm p-2 bg-brand-gray-800/70 border-brand-gray-700/70 text-brand-gray-400 group-hover:bg-brand-gray-700/90 group-hover:border-brand-gray-600/90 group-hover:text-white">
                  <SortDesc className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-white">Ordenação</h3>
              </div>
              
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="input-glass h-12 border-brand-gray-600/50">
                  <SortDesc className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-brand-gray-800 border-brand-gray-700">
                  <SelectItem value="newest">📅 Mais recentes</SelectItem>
                  <SelectItem value="oldest">⏰ Mais antigos</SelectItem>
                  <SelectItem value="title">🔤 Por título</SelectItem>
                  <SelectItem value="status">📊 Por status</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider mb-4 px-3">
                    Filtros
                  </h2>
                  <div className="flex items-center space-x-3 group">
                    <div className="relative rounded-lg transition-all duration-300 border shadow-sm p-2 bg-brand-gray-800/70 border-brand-gray-700/70 text-brand-gray-400 group-hover:bg-brand-gray-700/90 group-hover:border-brand-gray-600/90 group-hover:text-white">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Filtros Avançados</h3>
                  </div>
                </div>
                <Button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={cn(
                    "btn-ghost h-8 px-3 text-xs transition-all duration-300",
                    showAdvancedFilters 
                      ? "bg-brand-neon-green/10 text-brand-neon-green" 
                      : "text-brand-gray-400 hover:text-white"
                  )}
                >
                  <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", showAdvancedFilters && "rotate-180")} />
                </Button>
              </div>

              {showAdvancedFilters && (
                <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                  
                  {/* Status Filters */}
                  <div className="space-y-3">
                    <Label className="text-brand-gray-300 font-medium flex items-center">
                      <Tag className="w-4 h-4 mr-2" />
                      Status
                    </Label>
                    <div className="space-y-2">
                      {['completed', 'processing', 'failed', 'draft'].map((status: any) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox 
                            id={status}
                            checked={filters.status?.includes(status) || false}
                            onCheckedChange={(checked) => {
                              const newStatus = checked 
                                ? [...(filters.status || []), status as any]
                                : (filters.status || []).filter(s => s !== status);
                              handleFilterChange({ status: newStatus as any });
                            }}
                            className="border-brand-gray-600"
                          />
                          <Label htmlFor={status} className="text-sm text-brand-gray-300 capitalize cursor-pointer">
                            {status === 'completed' && '✅ Completo'}
                            {status === 'processing' && '⚡ Processando'}
                            {status === 'failed' && '❌ Falhou'}
                            {status === 'draft' && '📝 Rascunho'}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Format Filters */}
                  <div className="space-y-3">
                    <Label className="text-brand-gray-300 font-medium flex items-center">
                      <Layers2 className="w-4 h-4 mr-2" />
                      Formato
                    </Label>
                    <div className="space-y-2">
                      {['1:1', '16:9', '9:16', '4:3'].map((format: any) => (
                        <div key={format} className="flex items-center space-x-2">
                          <Checkbox 
                            id={format}
                            checked={filters.format?.includes(format) || false}
                            onCheckedChange={(checked) => {
                              const newFormat = checked 
                                ? [...(filters.format || []), format as any]
                                : (filters.format || []).filter(f => f !== format);
                              handleFilterChange({ format: newFormat as any });
                            }}
                            className="border-brand-gray-600"
                          />
                          <Label htmlFor={format} className="text-sm text-brand-gray-300 cursor-pointer">
                            📐 {format}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Color Filters */}
                  <div className="space-y-3">
                    <Label className="text-brand-gray-300 font-medium flex items-center">
                      <Palette className="w-4 h-4 mr-2" />
                      Cores Dominantes
                    </Label>
                    <div className="grid grid-cols-6 gap-2">
                      {['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'].map((color) => (
                        <button
                          key={color}
                          className="w-8 h-8 rounded-full border-2 border-brand-gray-600 hover:border-white transition-colors duration-200 hover:scale-110 transform"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="space-y-3">
                    <Label className="text-brand-gray-300 font-medium flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Período
                    </Label>
                    <div className="space-y-1">
                      {['Hoje', 'Esta semana', 'Este mês', 'Este ano'].map((period) => (
                        <button
                          key={period}
                          className="block w-full text-left text-sm text-brand-gray-300 hover:text-white py-2 px-3 rounded-lg hover:bg-brand-gray-700/50 transition-colors"
                        >
                          🗓️ {period}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Section */}
            {selectedIds.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-brand-gray-800/40">
                <h2 className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider mb-4 px-3">
                  Ações Rápidas
                </h2>
                <div className="flex items-center space-x-3 group">
                  <div className="relative rounded-lg transition-all duration-300 border shadow-sm p-2 bg-brand-gray-800/70 border-brand-gray-700/70 text-brand-gray-400 group-hover:bg-brand-gray-700/90 group-hover:border-brand-gray-600/90 group-hover:text-white">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Ações Rápidas</h3>
                </div>
                
                <div className="space-y-2">
                  <Button
                    onClick={handleSelectAll}
                    className="w-full btn-ghost h-10 justify-start"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    {selectedIds.length === totalCount ? 'Desmarcar todos' : 'Selecionar todos'}
                  </Button>
                  
                  <Button
                    onClick={handleDownloadSelected}
                    disabled={isDownloading || selectedIds.length === 0}
                    className="w-full btn-ghost text-blue-400 hover:bg-blue-500/10 h-10 justify-start disabled:opacity-50"
                    title={`Baixar ${selectedIds.length} criativos em ZIP organizado por formato`}
                  >
                    {isDownloading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Baixando ZIP...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Baixar ZIP ({selectedIds.length})
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleDeleteSelected}
                    disabled={isDeleting || isDownloading}
                    className="w-full btn-ghost text-red-400 hover:bg-red-500/10 h-10 justify-start disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Excluir ({selectedIds.length})
                  </Button>
                </div>
              </div>
            )}

            {/* Settings Section */}
            <div className="space-y-4 pt-4 border-t border-brand-gray-800/40">
              <h2 className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider mb-4 px-3">
                Configurações
              </h2>
              <div className="flex items-center space-x-3 group">
                <div className="relative rounded-lg transition-all duration-300 border shadow-sm p-2 bg-brand-gray-800/70 border-brand-gray-700/70 text-brand-gray-400 group-hover:bg-brand-gray-700/90 group-hover:border-brand-gray-600/90 group-hover:text-white">
                  <Settings className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-white">Configurações</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-brand-gray-300">Modo Preview</Label>
                  <Button
                    onClick={() => setPreviewMode(!previewMode)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all duration-300 relative border",
                      previewMode 
                        ? "bg-transparent border-brand-neon-green/50 backdrop-blur-sm" 
                        : "bg-brand-gray-700 border-brand-gray-600"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full transition-all duration-300 absolute top-1",
                      previewMode 
                        ? "bg-brand-neon-green translate-x-7 shadow-lg shadow-brand-neon-green/50" 
                        : "bg-white translate-x-1"
                    )}></div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Ultra Premium Floating Filter Bar Component
function FloatingFilterBar({ 
  activeFilters, 
  onClearFilter, 
  onClearAll,
  totalResults 
}: {
  activeFilters: Array<{ key: string; label: string; value: string }>;
  onClearFilter: (key: string, value: string) => void;
  onClearAll: () => void;
  totalResults: number;
}) {
  if (activeFilters.length === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-500">
      {/* Epic Multi-layer Background */}
      <div className="relative">
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-neon-green via-cyan-400 to-purple-500 rounded-2xl blur-xl opacity-40 animate-glow-pulse"></div>
        
        {/* Middle Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-neon-green/50 to-cyan-400/50 rounded-2xl blur-lg opacity-60"></div>
        
        {/* Main Card */}
        <Card className="relative card-glass-intense border-brand-gray-700/30 shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Premium Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-neon-green/10 via-transparent to-cyan-400/10"></div>
          
          <CardContent className="relative p-6">
            <div className="flex items-center space-x-6">
              
              {/* Enhanced Results Counter */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-brand-neon-green/30 rounded-xl blur animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-brand-neon-green to-emerald-400 p-2 rounded-xl">
                    <Filter className="w-5 h-5 text-brand-black" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-white font-bold text-lg">
                    {totalResults.toLocaleString()}
                  </span>
                  <p className="text-brand-gray-300 text-xs font-medium">
                    {totalResults === 1 ? 'resultado' : 'resultados'}
                  </p>
                </div>
              </div>
              
              {/* Vertical Separator */}
              <div className="h-12 w-px bg-gradient-to-b from-transparent via-brand-gray-600 to-transparent"></div>
              
              {/* Enhanced Filter Chips */}
              <div className="flex items-center space-x-3 max-w-2xl overflow-x-auto scrollbar-hide">
                {activeFilters.map((filter, index) => (
                  <div key={`${filter.key}-${filter.value}-${index}`} className="relative group">
                    {/* Chip Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-neon-green/30 to-cyan-400/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <Badge className="relative bg-gradient-to-r from-brand-neon-green/20 to-cyan-400/20 text-white border border-brand-neon-green/40 flex items-center space-x-2 pr-2 py-2 px-3 text-sm font-medium hover:scale-105 transition-all duration-300">
                      <span className="text-brand-neon-green font-semibold">{filter.label}:</span>
                      <span>{filter.value}</span>
                      <button
                        onClick={() => onClearFilter(filter.key, filter.value)}
                        className="ml-2 hover:bg-red-500/20 hover:text-red-400 rounded-full p-1 transition-all duration-200 group/close"
                        title="Remover filtro"
                      >
                        <X className="w-3.5 h-3.5 group-hover/close:rotate-90 transition-transform duration-200" />
                      </button>
                    </Badge>
                  </div>
                ))}
              </div>
              
              {/* Vertical Separator */}
              <div className="h-12 w-px bg-gradient-to-b from-transparent via-brand-gray-600 to-transparent"></div>
              
              {/* Enhanced Clear All Button */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Button
                  onClick={onClearAll}
                  className="relative btn-ghost h-11 px-6 border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-300 transition-all duration-300 font-medium"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Tudo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main Gallery Page Component
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
  
  // 📥 Download Hook
  const { 
    downloadSelectedCreatives, 
    isDownloading, 
    progress, 
    showModal,
    estimatedSize,
    setShowModal,
    cancelDownload,
    getEstimatedSize 
  } = useCreativeDownload();
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

  // Favorite handlers
  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
    // Here you would typically save to localStorage or backend
    toast.success(
      favorites.includes(id) 
        ? "Removido dos favoritos" 
        : "Adicionado aos favoritos"
    );
  };

  // Load creatives with infinite scroll support
  const loadCreatives = useCallback(async (currentFilters: GalleryFilters, append = false) => {
    if (!append) setIsLoading(true);
    
    try {
      const { data, count } = await getCreativesForGallery(currentFilters);
      const itemsData = data as GalleryItem[];
      
      if (append) {
        setCreatives(prev => [...prev, ...itemsData]);
      } else {
        setCreatives(itemsData);
      }
      
      setTotalCount(count);
      setHasMore(itemsData.length === currentFilters.limit);
    } catch (error) {
      console.error("Falha ao carregar criativos:", error);
      toast.error("Erro ao carregar criativos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadCreatives(filters);
  }, [filters, loadCreatives]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search focus
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // Cmd/Ctrl + R for refresh
      if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        e.preventDefault();
        loadCreatives({ ...filters, page: 1 });
      }
      
      // Cmd/Ctrl + B for toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed(!sidebarCollapsed);
      }
      
      // Escape to clear search
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchQuery('');
        setFilters(prev => ({ ...prev, search: '', page: 1 }));
        if (searchInputRef.current) {
          searchInputRef.current.value = '';
          searchInputRef.current.blur();
        }
      }
      
      // Easter egg: Cmd/Ctrl + Shift + G for gallery celebration
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        toast.success("🎉 Galeria Premium Ativada!", { 
          description: "Você descobriu o modo celebração!" 
        });
        // Add a subtle screen flash effect
        document.body.style.animation = 'flash 0.3s ease-in-out';
        setTimeout(() => {
          document.body.style.animation = '';
        }, 300);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [filters, loadCreatives]);

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const nextPage = Math.floor(creatives.length / filters.limit) + 1;
          const nextFilters = { ...filters, page: nextPage };
          loadCreatives(nextFilters, true);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, creatives.length, filters, loadCreatives]);

  // Handle filter changes
  const handleFilterChange = (newFilterValues: Partial<GalleryFilters>) => {
    const newFilters = { ...filters, ...newFilterValues, page: 1 };
    setFilters(newFilters);
  };

  // Handle view mode change with smooth scroll
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    // Smooth scroll to top when changing view mode
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    handleFilterChange({ search: query });
    setShowSearchSuggestions(false);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
    if (searchInputRef.current) {
      searchInputRef.current.value = suggestion;
    }
  };

  // Selection handlers
  const handleSelectionChange = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allIds = creatives.map(c => c.id);
    setSelectedIds(selectedIds.length === allIds.length ? [] : allIds);
  };

  // Delete handlers
  const handleDeleteSelected = async () => {
    setIsDeleting(true);
    toast.info(`Excluindo ${selectedIds.length} criativo(s)...`);
    
    try {
      await Promise.all(selectedIds.map(id => deleteCreative(id)));
      toast.success("Criativos excluídos com sucesso!");
      setSelectedIds([]);
      loadCreatives({ ...filters, page: 1 });
    } catch (error: any) {
      toast.error("Erro ao excluir criativos", { description: error.message });
    } finally {
      setIsDeleting(false);
    }
  };

  // 📥 Download handler
  const handleDownloadSelected = async () => {
    if (selectedIds.length === 0) {
      toast.warning("Selecione ao menos um criativo para download");
      return;
    }

    try {
      await downloadSelectedCreatives(selectedIds);
      // Success handling is done by the hook via toasts
    } catch (error: any) {
      console.error("Erro no download:", error);
      // Error handling is done by the hook via toasts
    }
  };

  const allLightboxImages = useMemo(() => {
    return creatives.flatMap(item => 
      item.type === 'request'
        ? item.creatives.filter((c: any) => c.status === 'completed' && c.result_url).map((c: any) => ({ ...c, title: item.title }))
        : item.result_url ? [item] : []
    );
  }, [creatives]);

  const openLightbox = (item: GalleryItem, creativeIndex = 0) => {
    let globalIndex = -1;
    if (item.type === 'request') {
      const creativeId = item.creatives[creativeIndex]?.id;
      if (creativeId) {
        globalIndex = allLightboxImages.findIndex(img => img.id === creativeId);
      }
    } else {
      globalIndex = allLightboxImages.findIndex(img => img.id === item.id);
    }

    if (globalIndex !== -1) {
      setActiveCreativeIndex(globalIndex);
      setLightboxOpen(true);
    }
  };

  // Lightbox handlers
  const closeLightbox = () => {
    setLightboxOpen(false);
    setActiveCreativeIndex(null);
  };

  // Active filters for floating bar
  const activeFilters = useMemo(() => {
    const filters_array: Array<{ key: string; label: string; value: string }> = [];
    
    if (searchQuery) {
      filters_array.push({ key: 'search', label: 'Busca', value: searchQuery });
    }
    
    filters.status?.forEach(status => {
      filters_array.push({ key: 'status', label: 'Status', value: status });
    });
    
    filters.format?.forEach(format => {
      filters_array.push({ key: 'format', label: 'Formato', value: FORMAT_LABELS[format as keyof typeof FORMAT_LABELS] || format });
    });
    
    return filters_array;
  }, [searchQuery, filters.status, filters.format]);

  // Clear filter handlers
  const handleClearFilter = (key: string, value: string) => {
    if (key === 'search') {
      setSearchQuery('');
      handleFilterChange({ search: '' });
      if (searchInputRef.current) {
        searchInputRef.current.value = '';
      }
    } else if (key === 'status') {
      const newStatus = filters.status?.filter(s => s !== value) || [];
      handleFilterChange({ status: newStatus });
    } else if (key === 'format') {
      const newFormat = filters.format?.filter(f => (FORMAT_LABELS[f as keyof typeof FORMAT_LABELS] || f) !== value) || [];
      handleFilterChange({ format: newFormat });
    }
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setFilters({
      page: 1,
      limit: 20,
      search: '',
      status: [],
      format: [],
    });
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Backdrop Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-all duration-500 animate-in fade-in-0"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
      
      {/* Premium Control Sidebar */}
      <PremiumControlSidebar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchInputRef={searchInputRef}
        showSearchSuggestions={showSearchSuggestions}
        setShowSearchSuggestions={setShowSearchSuggestions}
        handleSearch={handleSearch}
        handleSuggestionClick={handleSuggestionClick}
        viewMode={viewMode}
        setViewMode={handleViewModeChange}
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

      {/* Main Content Area */}
      <div className={cn(
        "transition-all duration-500 p-4 lg:p-6 xl:p-8",
        sidebarCollapsed 
          ? "mr-16" 
          : "mr-80 xl:mr-96 2xl:mr-[420px]"
      )}>
        <div className="max-w-none mx-auto">
        
        {/* Ultra Premium Header */}
        <header className="mb-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              {/* Epic Icon with Multi-layer Glow */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-neon-green via-cyan-400 to-blue-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-700 animate-glow-pulse"></div>
                <div className="absolute inset-0 bg-brand-neon-green/30 rounded-3xl blur-xl animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-brand-neon-green via-emerald-400 to-brand-neon-green-dark p-5 rounded-3xl shadow-2xl border border-brand-neon-green/20 backdrop-blur-sm group-hover:scale-105 transition-transform duration-300">
                  <GalleryVertical className="w-8 h-8 text-brand-black drop-shadow-lg" />
                </div>
              </div>
              
              {/* Enhanced Title Section */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <h1 className="text-5xl font-black text-transparent bg-gradient-to-r from-white via-brand-neon-green to-cyan-400 bg-clip-text tracking-tight">
                    Galeria
                  </h1>
                  <div className="relative">
                    <span className="text-5xl font-black text-transparent bg-gradient-to-r from-brand-neon-green via-emerald-400 to-cyan-400 bg-clip-text">
                      Premium
                    </span>
                    <div className="absolute -top-1 -right-8">
                      <div className="w-3 h-3 bg-gradient-to-r from-brand-neon-green to-cyan-400 rounded-full animate-pulse shadow-lg shadow-brand-neon-green/50"></div>
                    </div>
                  </div>
                </div>
                <p className="text-brand-gray-300 text-xl font-medium tracking-wide">
                  Explore, organize e gerencie seus criativos com 
                  <span className="text-brand-neon-green font-semibold ml-1">excelência absoluta</span>
                </p>
                
                {/* Stats Mini Bar */}
                <div className="flex items-center space-x-6 text-sm mt-3">
                  <div className="flex items-center space-x-2 bg-brand-gray-800/50 px-3 py-1.5 rounded-full border border-brand-gray-700/50">
                    <div className="w-2 h-2 bg-brand-neon-green rounded-full animate-pulse"></div>
                    <span className="text-brand-gray-300">{totalCount} criativos</span>
                  </div>
                  {selectedIds.length > 0 && (
                    <div className="flex items-center space-x-2 bg-brand-neon-green/10 px-3 py-1.5 rounded-full border border-brand-neon-green/30">
                      <Star className="w-3 h-3 text-brand-neon-green" />
                      <span className="text-brand-neon-green font-medium">{selectedIds.length} selecionados</span>
                    </div>
                  )}
                  {favorites.length > 0 && (
                    <div className="flex items-center space-x-2 bg-pink-500/10 px-3 py-1.5 rounded-full border border-pink-500/30">
                      <Heart className="w-3 h-3 text-pink-400" />
                      <span className="text-pink-400 font-medium">{favorites.length} favoritos</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex items-center space-x-3">
              {/* Quick Actions */}
              <div className="flex items-center space-x-2 bg-brand-gray-800/30 backdrop-blur-sm rounded-xl p-1 border border-brand-gray-700/50">
                <Button 
                  className="btn-ghost h-10 w-10 p-0 hover:bg-brand-gray-700/50 transition-all duration-300" 
                  title="Modo Preview"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  <Eye className={cn("w-4 h-4", previewMode ? "text-brand-neon-green" : "text-brand-gray-400")} />
                </Button>
                <Button 
                  className="btn-ghost h-10 w-10 p-0 hover:bg-brand-gray-700/50 transition-all duration-300" 
                  title="Favoritos"
                >
                  <Heart className="w-4 h-4 text-brand-gray-400 hover:text-pink-400 transition-colors" />
                </Button>
                <Button 
                  className={cn(
                    "btn-ghost h-10 w-10 p-0 transition-all duration-300",
                    sidebarCollapsed 
                      ? "hover:bg-brand-neon-green/10 hover:text-brand-neon-green" 
                      : "hover:bg-brand-gray-700/50"
                  )}
                  title={sidebarCollapsed ? "Abrir controles" : "Controles abertos"}
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  <Sliders className={cn("w-4 h-4 transition-colors", sidebarCollapsed ? "text-brand-neon-green" : "text-brand-gray-400")} />
                </Button>
              </div>

              {/* Primary Actions */}
              <Button className="btn-ghost h-12 px-5 hover:bg-brand-gray-700/50 transition-all duration-300 border border-brand-gray-700/50 backdrop-blur-sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sincronizar
              </Button>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-neon-green via-emerald-400 to-cyan-400 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                <Button className="relative btn-neon h-12 px-8 text-base font-semibold shadow-2xl hover:shadow-brand-neon-green/25 transition-all duration-300" onClick={() => window.location.href = '/new'}>
                  <Plus className="w-5 h-5 mr-2" />
                  Novo Criativo
                </Button>
              </div>
            </div>
          </div>

                  </header>

        {/* Main Content */}
        <main>
          {isLoading && creatives.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              {/* Epic Loading Animation */}
              <div className="relative mb-8">
                {/* Multi-layer Glow Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-neon-green via-cyan-400 to-purple-500 rounded-full blur-2xl opacity-30 animate-glow-pulse"></div>
                <div className="absolute inset-0 bg-brand-neon-green/40 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute inset-0 bg-brand-neon-green/60 rounded-full blur-lg animate-ping"></div>
                
                {/* Main Spinner */}
                <div className="relative w-24 h-24 border-4 border-brand-gray-800/20 border-t-brand-neon-green border-r-cyan-400 border-b-purple-500 rounded-full animate-spin"></div>
                
                {/* Inner Spinner */}
                <div className="absolute inset-4 border-2 border-brand-gray-800/20 border-l-brand-neon-green rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                
                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-brand-neon-green animate-pulse" />
                </div>
              </div>
              
              {/* Enhanced Loading Text */}
              <div className="text-center space-y-3">
                <h3 className="text-3xl font-bold text-transparent bg-gradient-to-r from-white via-brand-neon-green to-cyan-400 bg-clip-text">
                  Carregando Galeria Premium
                </h3>
                <p className="text-brand-gray-300 text-lg font-medium">
                  Preparando seus criativos incríveis...
                </p>
                
                {/* Loading Progress Dots */}
                <div className="flex items-center justify-center space-x-2 mt-6">
                  <div className="w-3 h-3 bg-brand-neon-green rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          ) : creatives.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Card className="card-glass-intense border-brand-gray-700/30 max-w-2xl mx-auto overflow-hidden">
                {/* Epic Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gray-900/50 via-brand-gray-800/30 to-brand-gray-900/50"></div>
                
                <CardContent className="relative p-16 text-center">
                  {/* Epic Empty State Icon */}
                  <div className="relative mb-8">
                    {/* Multi-layer Effects */}
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-gray-600/20 via-brand-gray-500/10 to-brand-gray-600/20 rounded-full blur-2xl"></div>
                    <div className="absolute inset-0 bg-brand-gray-600/30 rounded-full blur-xl animate-pulse"></div>
                    
                    <div className="relative w-32 h-32 bg-gradient-to-br from-brand-gray-700 via-brand-gray-800 to-brand-gray-900 rounded-full flex items-center justify-center mx-auto border border-brand-gray-600/50 shadow-2xl">
                      <div className="relative">
                        <div className="absolute inset-0 bg-brand-gray-500/20 rounded-full blur animate-pulse"></div>
                        <GalleryVertical className="relative w-16 h-16 text-brand-gray-400" />
                      </div>
                    </div>
                    
                    {/* Floating Elements */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-brand-gray-600 to-brand-gray-700 rounded-full flex items-center justify-center animate-bounce">
                      <Sparkles className="w-4 h-4 text-brand-gray-400" />
                    </div>
                    <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-brand-gray-600 to-brand-gray-700 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}>
                      <Plus className="w-3 h-3 text-brand-gray-400" />
                    </div>
                  </div>
                  
                  {/* Enhanced Empty State Text */}
                  <div className="space-y-4 mb-8">
                    <h3 className="text-4xl font-black text-transparent bg-gradient-to-r from-white via-brand-gray-300 to-brand-gray-400 bg-clip-text">
                      Galeria Vazia
                    </h3>
                    <p className="text-brand-gray-300 text-xl max-w-lg mx-auto leading-relaxed">
                      Sua jornada criativa começa aqui! Crie seu primeiro criativo e transforme ideias em 
                      <span className="text-brand-neon-green font-semibold ml-1">obras-primas visuais</span>.
                    </p>
                  </div>
                  
                  {/* Enhanced CTA Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-neon-green via-emerald-400 to-cyan-400 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                      <Button className="relative btn-neon h-14 px-8 text-lg font-bold shadow-2xl hover:shadow-brand-neon-green/25 transition-all duration-300" onClick={() => window.location.href = '/new'}>
                        <Sparkles className="w-6 h-6 mr-3" />
                        Criar Primeiro Criativo
                      </Button>
                    </div>
                    
                    <Button className="btn-ghost h-14 px-8 text-lg border border-brand-gray-600/50 hover:border-brand-gray-500/50 transition-all duration-300" onClick={() => window.location.reload()}>
                      <RefreshCw className="w-5 h-5 mr-3" />
                      Atualizar Galeria
                    </Button>
                  </div>
                  
                  {/* Quick Tips */}
                  <div className="mt-8 pt-8 border-t border-brand-gray-700/50">
                    <p className="text-brand-gray-400 text-sm mb-4 font-medium">💡 Dicas rápidas:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-brand-gray-500">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-brand-neon-green" />
                        <span>IA poderosa para criação</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Palette className="w-4 h-4 text-cyan-400" />
                        <span>Estilos personalizáveis</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Download className="w-4 h-4 text-purple-400" />
                        <span>Download em alta qualidade</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className={cn(
              viewMode === 'masonry' ? "columns-1 lg:columns-2 xl:columns-3 2xl:columns-4 gap-8" : 
              viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" :
              "space-y-6"
            )}>
              {creatives.map((item) => (
                <UnifiedGalleryCard
                      key={item.id}
                  item={item}
                  viewMode={viewMode}
                      isSelected={selectedIds.includes(item.id)}
                      isFavorite={favorites.includes(item.id)}
                  onSelectionChange={(id) => handleSelectionChange(id)}
                  onToggleFavorite={(id) => toggleFavorite(id)}
                  onPreview={(selectedItem, creativeIndex) => openLightbox(selectedItem, creativeIndex)}
                />
              ))}
            </div>
          )}
          <div ref={loadMoreRef} className="h-10" />
        </main>

        {/* Enhanced Floating Filter Bar */}
        {activeFilters.length > 0 && (
          <FloatingFilterBar
            activeFilters={activeFilters}
            onClearFilter={handleClearFilter}
            onClearAll={handleClearAllFilters}
            totalResults={totalCount}
          />
        )}

        {/* Progress Modal for Downloads */}
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
            onClose={closeLightbox}
            onDelete={async (id) => {
              try {
                await deleteCreative(id);
                toast.success("Criativo excluído com sucesso!");
                closeLightbox();
                loadCreatives({ ...filters, page: 1 });
              } catch (error: any) {
                toast.error("Erro ao excluir criativo", { description: error.message });
              }
            }}
          />
        )}
        </div>
      </div>
    </div>
  );
} 