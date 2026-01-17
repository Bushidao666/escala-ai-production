import { Search, Sliders, ChevronLeft, ChevronRight, LayoutGrid, Filter, Settings, TrendingUp, Star, Heart, Grid3X3, List, SortDesc, Tag, Layers2, Palette, Calendar, Zap, RefreshCw, Download, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import { cn } from "@/shared/lib/utils";
import { SearchSuggestions } from "@/features/gallery-search/ui/search-suggestions";
import { GalleryFilters } from "@/views/gallery/ui/gallery.types";

type ViewMode = 'masonry' | 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'title' | 'status';

export function PremiumControlSidebar({
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
              <div className="flex justify-center mb-2">
                <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-brand-gray-600 to-transparent rounded-full"></div>
              </div>

              <div className="relative group mx-auto w-12 h-12 flex items-center justify-center">
                 <Search className="w-5 h-5 text-brand-neon-green" />
              </div>
              {/* ... other icons ... */}
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
              <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-gray-400 transition-colors duration-300" />
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

                <SearchSuggestions
                  query={searchQuery}
                  onSuggestionClick={handleSuggestionClick}
                  isVisible={showSearchSuggestions}
                />
              </div>
            </div>

            {/* View Mode */}
            <div className="space-y-4">
               <h2 className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider mb-4 px-3">Visualização</h2>
               <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => setViewMode('masonry')} className={cn("p-3 rounded-lg border border-transparent hover:bg-brand-gray-700/60", viewMode === 'masonry' && "btn-glass-active")}>
                     <LayoutGrid className="w-5 h-5 mx-auto mb-1" /><span className="text-xs">Masonry</span>
                  </button>
                  <button onClick={() => setViewMode('grid')} className={cn("p-3 rounded-lg border border-transparent hover:bg-brand-gray-700/60", viewMode === 'grid' && "btn-glass-active")}>
                     <Grid3X3 className="w-5 h-5 mx-auto mb-1" /><span className="text-xs">Grid</span>
                  </button>
                  <button onClick={() => setViewMode('list')} className={cn("p-3 rounded-lg border border-transparent hover:bg-brand-gray-700/60", viewMode === 'list' && "btn-glass-active")}>
                     <List className="w-5 h-5 mx-auto mb-1" /><span className="text-xs">Lista</span>
                  </button>
               </div>
            </div>

            {/* Filters */}
             <div className="space-y-4">
                <h2 className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider mb-4 px-3">Filtros</h2>
                <Button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className="w-full btn-ghost">
                    {showAdvancedFilters ? "Ocultar Filtros" : "Mostrar Filtros Avançados"}
                </Button>

                {showAdvancedFilters && (
                    <div className="space-y-4">
                        {/* Status */}
                        <div className="space-y-2">
                            <Label>Status</Label>
                            {['completed', 'processing', 'failed', 'draft'].map((status: any) => (
                                <div key={status} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={status}
                                        checked={filters.status?.includes(status)}
                                        onCheckedChange={(checked) => {
                                            const newStatus = checked
                                                ? [...(filters.status || []), status]
                                                : (filters.status || []).filter(s => s !== status);
                                            handleFilterChange({ status: newStatus as any });
                                        }}
                                    />
                                    <Label htmlFor={status} className="capitalize">{status}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
             </div>

             {/* Quick Actions */}
             {selectedIds.length > 0 && (
                 <div className="space-y-4 pt-4 border-t border-brand-gray-800/40">
                    <h2 className="text-xs font-bold text-brand-gray-500 uppercase">Ações</h2>
                    <Button onClick={handleDownloadSelected} disabled={isDownloading} className="w-full btn-ghost text-blue-400">
                        <Download className="w-4 h-4 mr-2" /> Baixar ({selectedIds.length})
                    </Button>
                    <Button onClick={handleDeleteSelected} disabled={isDeleting} className="w-full btn-ghost text-red-400">
                        <Trash2 className="w-4 h-4 mr-2" /> Excluir ({selectedIds.length})
                    </Button>
                 </div>
             )}

          </div>
        )}
      </div>
    </div>
  );
}
