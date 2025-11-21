import { UnifiedGalleryCard } from "@/entities/creative/ui/unified-gallery-card";
import { cn } from "@/shared/lib/utils";

type ViewMode = 'masonry' | 'grid' | 'list';

export function GalleryGrid({
  creatives,
  viewMode,
  selectedIds,
  favorites,
  handleSelectionChange,
  toggleFavorite,
  openLightbox
}: {
  creatives: any[];
  viewMode: ViewMode;
  selectedIds: string[];
  favorites: string[];
  handleSelectionChange: (id: string) => void;
  toggleFavorite: (id: string) => void;
  openLightbox: (item: any, index?: number) => void;
}) {
  return (
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
  );
}
