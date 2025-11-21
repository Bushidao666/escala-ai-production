"use client";

import { useState, useCallback } from 'react';
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { 
  Eye, 
  Download,
  ChevronLeft,
  ChevronRight,
  Layers2,
  Share2,
  Heart
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { FORMAT_LABELS } from "@/modules/creative/dto/creative.schema";
import useEmblaCarousel from 'embla-carousel-react';

type Creative = {
  id: string;
  format: string;
  result_url?: string | null;
  status: 'draft' | 'queued' | 'processing' | 'completed' | 'failed';
};

type CreativeRequest = {
  id: string;
  title: string;
  creatives: Creative[];
  // Adicione outros campos de request se necessário
};

export function CreativeRequestGalleryCard({ 
  request,
  onOpenLightbox,
  isSelected,
  onSelectionChange,
  onToggleFavorite,
  isFavorite
}: { 
  request: CreativeRequest;
  onOpenLightbox: (imageIndex: number) => void;
  isSelected: boolean;
  onSelectionChange: (id: string, isRequest: boolean) => void;
  onToggleFavorite: (id: string, isRequest: boolean) => void;
  isFavorite: boolean;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useState(() => {
    if (!emblaApi) return;
    const onSelect = () => setActiveIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect) };
  });
  
  const completedCreatives = request.creatives.filter(c => c.status === 'completed' && c.result_url);

  if (completedCreatives.length === 0) {
    // Pode retornar um card de "processando" ou "falhou" aqui
    return null;
  }

  return (
    <Card 
      className={cn(
        "relative group rounded-xl overflow-hidden border bg-brand-gray-900/50 transition-all duration-300 break-inside-avoid mb-8",
        "hover:scale-[1.02] hover:shadow-2xl hover:shadow-brand-neon-green/20",
        isSelected ? "border-brand-neon-green ring-2 ring-brand-neon-green/30" : "border-brand-gray-700/50 hover:border-brand-neon-green/50"
      )}
    >
      <div className="absolute top-3 left-3 z-30 transition-all duration-300" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onSelectionChange(request.id, true)}
          className={cn(
            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
            isSelected ? "bg-brand-neon-green border-brand-neon-green" : "bg-black/50 border-white/30 hover:border-brand-neon-green/50"
          )}
        >
          {isSelected && <div className="w-3 h-3 bg-brand-black rounded-sm" />}
        </button>
      </div>

      <div ref={emblaRef} className="overflow-hidden relative">
        <div className="flex">
          {completedCreatives.map((creative, index) => (
            <div 
              key={creative.id} 
              className="relative flex-[0_0_100%] bg-brand-gray-800 cursor-pointer"
              onClick={() => onOpenLightbox(index)}
            >
              <img src={creative.result_url!} alt={request.title} className="w-full h-auto object-cover" />
              <div className="absolute bottom-2 right-2">
                <Badge className="bg-black/50 text-white backdrop-blur-sm border-white/20">
                  {FORMAT_LABELS[creative.format as keyof typeof FORMAT_LABELS]}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        {completedCreatives.length > 1 && (
          <>
            <Button onClick={scrollPrev} className="absolute left-2 top-1/2 -translate-y-1/2 btn-ghost h-9 w-9 p-0 rounded-full bg-black/40 hover:bg-black/60 z-10">
              <ChevronLeft />
            </Button>
            <Button onClick={scrollNext} className="absolute right-2 top-1/2 -translate-y-1/2 btn-ghost h-9 w-9 p-0 rounded-full bg-black/40 hover:bg-black/60 z-10">
              <ChevronRight />
            </Button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
              {completedCreatives.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === activeIndex ? "bg-white scale-125" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <CardContent className="p-4 bg-brand-gray-900/80 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold truncate">{request.title}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Layers2 className="w-4 h-4 text-brand-neon-green" />
              <span className="text-sm text-brand-gray-300">{completedCreatives.length} Formatos</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button 
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(request.id, true); }}
              className="btn-ghost h-9 w-9 p-0" title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
              <Heart className={cn("w-5 h-5", isFavorite ? "text-pink-500 fill-current" : "text-brand-gray-400 hover:text-pink-400")} />
            </Button>
            <Button className="btn-ghost h-9 w-9 p-0" title="Baixar todos (.zip)">
              <Download className="w-5 h-5 text-brand-gray-400 hover:text-white" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 