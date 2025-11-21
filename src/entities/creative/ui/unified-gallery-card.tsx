"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { 
  Eye, 
  Download,
  Heart,
  Share2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Layers2,
  Sparkles,
  Palette,
  Calendar,
  Zap,
  CheckCircle2,
  Clock,
  XOctagon,
  Loader2,
  Archive,
  Copy,
  ExternalLink,
  Play,
  Pause,
  Maximize2
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { FORMAT_LABELS } from "@/modules/creative/dto/creative.schema";
import { toast } from "sonner";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

// Types para o componente unificado
type Creative = {
  id: string;
  title: string;
  prompt: string;
  format: string;
  result_url?: string | null;
  status: 'draft' | 'queued' | 'processing' | 'completed' | 'failed';
  style?: string;
  primary_color?: string | null;
  secondary_color?: string | null;
  error_message?: string | null;
  created_at: string;
};

type CreativeRequest = {
  id: string;
  title: string;
  prompt: string;
  status: string;
  style?: string;
  primary_color?: string | null;
  secondary_color?: string | null;
  created_at: string;
  requested_formats: string[];
  creatives: Creative[];
};

type UnifiedItem = (Creative & { type: 'creative' }) | (CreativeRequest & { type: 'request' });

interface UnifiedGalleryCardProps {
  item: UnifiedItem;
  viewMode: 'masonry' | 'grid' | 'list';
  isSelected: boolean;
  isFavorite: boolean;
  onSelectionChange: (id: string, isRequest?: boolean) => void;
  onToggleFavorite: (id: string, isRequest?: boolean) => void;
  onPreview: (item: UnifiedItem, creativeIndex?: number) => void;
  onDownload?: (creative: Creative) => void;
  className?: string;
}

// Configurações de status
const STATUS_CONFIG = {
  draft: { 
    label: "Rascunho", 
    color: "bg-gray-500/20 text-gray-400 border-gray-500/30", 
    icon: Clock,
    gradient: "from-gray-500/20 to-gray-600/20"
  },
  queued: { 
    label: "Na Fila", 
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30", 
    icon: Clock,
    gradient: "from-blue-500/20 to-blue-600/20"
  },
  pending: { 
    label: "Pendente", 
    color: "bg-gray-500/20 text-gray-400 border-gray-500/30", 
    icon: Clock,
    gradient: "from-gray-500/20 to-gray-600/20"
  },
  processing: { 
    label: "Processando", 
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", 
    icon: Loader2,
    gradient: "from-yellow-500/20 to-amber-500/20"
  },
  completed: { 
    label: "Concluído", 
    color: "bg-brand-neon-green/20 text-brand-neon-green border-brand-neon-green/30", 
    icon: CheckCircle2,
    gradient: "from-brand-neon-green/20 to-green-500/20"
  },
  partial: { 
    label: "Parcial", 
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30", 
    icon: CheckCircle2,
    gradient: "from-blue-500/20 to-blue-600/20"
  },
  failed: { 
    label: "Falhou", 
    color: "bg-red-500/20 text-red-400 border-red-500/30", 
    icon: XOctagon,
    gradient: "from-red-500/20 to-red-600/20"
  },
};

// Type guard para verificar se é request
function isCreativeRequest(item: UnifiedItem): item is CreativeRequest & { type: 'request' } {
  return item.type === 'request';
}

// Componente para carousel de imagens
function ImageCarousel({ 
  creatives, 
  onImageClick,
  onCreativePreview,
  className 
}: { 
  creatives: Creative[];
  onImageClick: (index: number) => void;
  onCreativePreview: (creative: Creative) => void;
  className?: string;
}) {
  const autoplayPlugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'start',
    skipSnaps: false
  }, [autoplayPlugin.current]);
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const toggleAutoplay = useCallback(() => {
    const autoplay = autoplayPlugin.current;
    if (autoplay) {
      if (isPlaying) {
        autoplay.stop();
      } else {
        autoplay.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    return () => emblaApi.off('select', onSelect);
  }, [emblaApi]);

  const completedCreatives = creatives.filter(c => c.status === 'completed' && c.result_url);

  if (completedCreatives.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-brand-gray-800/50 text-brand-gray-500",
        className
      )}>
        <div className="text-center space-y-2">
          <Sparkles className="w-8 h-8 mx-auto opacity-50" />
          <p className="text-sm">Processando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative group/carousel", className)}>
      {/* Carousel principal */}
      <div ref={emblaRef} className="overflow-hidden rounded-xl">
        <div className="flex">
          {completedCreatives.map((creative, index) => (
            <div 
              key={creative.id} 
              className="relative flex-[0_0_100%] cursor-pointer group/image"
              onClick={() => onImageClick(index)}
            >
              <img 
                src={creative.result_url!} 
                alt={`${creative.format} - ${FORMAT_LABELS[creative.format as keyof typeof FORMAT_LABELS]}`}
                className="w-full h-full object-cover transition-all duration-500 group-hover/image:scale-105" 
              />
              
              {/* Overlay com informações */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-all duration-300">
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-black/60 text-white backdrop-blur-sm border-white/20 text-xs">
                      {FORMAT_LABELS[creative.format as keyof typeof FORMAT_LABELS]}
                    </Badge>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreativePreview(creative);
                      }}
                      className="btn-ghost h-8 w-8 p-0 bg-black/40 hover:bg-black/60 backdrop-blur-sm"
                    >
                      <Maximize2 className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controles do carousel */}
      {completedCreatives.length > 1 && (
        <>
          {/* Botões de navegação */}
          <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 pointer-events-none">
            <Button 
              onClick={scrollPrev} 
              className="btn-ghost h-9 w-9 p-0 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 pointer-events-auto"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </Button>
            <Button 
              onClick={scrollNext} 
              className="btn-ghost h-9 w-9 p-0 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 pointer-events-auto"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </Button>
          </div>

          {/* Indicadores */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300">
            {completedCreatives.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300 hover:scale-125",
                  index === selectedIndex ? "bg-white scale-125" : "bg-white/50"
                )}
              />
            ))}
          </div>

          {/* Controle de autoplay */}
          <div className="absolute top-3 right-3 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300">
            <Button 
              onClick={toggleAutoplay}
              className="btn-ghost h-8 w-8 p-0 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20"
            >
              {isPlaying ? 
                <Pause className="w-4 h-4 text-white" /> : 
                <Play className="w-4 h-4 text-white" />
              }
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// Componente principal unificado
export function UnifiedGalleryCard({
  item,
  viewMode,
  isSelected,
  isFavorite,
  onSelectionChange,
  onToggleFavorite,
  onPreview,
  onDownload,
  className
}: UnifiedGalleryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isImageError, setIsImageError] = useState(false);

  const isRequest = isCreativeRequest(item);
  const statusConfig = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
  const StatusIcon = statusConfig.icon;

  // Cálculos para requests
  const completedCount = isRequest ? item.creatives.filter(c => c.status === 'completed').length : 0;
  const totalCount = isRequest ? item.creatives.length : 1;
  const progress = isRequest ? (totalCount > 0 ? (completedCount / totalCount) * 100 : 0) : 
    (item.status === 'completed' ? 100 : item.status === 'processing' ? 75 : item.status === 'queued' ? 25 : 0);

  // Handlers
  const handleCardClick = () => {
    onPreview(item, 0);
  };

  const handleImageClick = (creativeIndex: number) => {
    onPreview(item, creativeIndex);
  };

  const handleCreativePreview = (creative: Creative) => {
    // Encontrar o índice do criativo na lista de criativos completados
    const completedCreatives = isRequest ? item.creatives.filter(c => c.status === 'completed' && c.result_url) : [];
    const index = completedCreatives.findIndex(c => c.id === creative.id);
    onPreview(item, index >= 0 ? index : 0);
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: item.title,
        text: item.prompt,
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copiado para compartilhamento!");
      }
    } catch (error) {
      toast.error("Erro ao compartilhar");
    }
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(item.prompt);
      toast.success("Prompt copiado!");
    } catch (error) {
      toast.error("Erro ao copiar prompt");
    }
  };

  // Renderização para modo lista
  if (viewMode === 'list') {
    return (
      <Card 
        className={cn(
          "card-glass-intense border-brand-gray-700/30 hover:border-brand-neon-green/50 transition-all duration-500 group relative overflow-hidden cursor-pointer",
          isSelected && "border-brand-neon-green ring-2 ring-brand-neon-green/30",
          className
        )}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Gradiente de fundo dinâmico */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          "bg-gradient-to-r", statusConfig.gradient
        )}></div>
        
        <CardContent className="relative p-6">
          <div className="flex items-center space-x-6">
            
            {/* Checkbox de seleção premium */}
            <div className="flex-shrink-0 relative" onClick={(e) => e.stopPropagation()}>
              <div className={cn(
                "absolute inset-0 rounded-xl transition-all duration-300",
                isSelected ? "bg-brand-neon-green/20 scale-110 blur-sm" : ""
              )}></div>
              <button
                onClick={() => onSelectionChange(item.id, isRequest)}
                className={cn(
                  "relative w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-300 hover:scale-105",
                  isSelected 
                    ? "bg-brand-neon-green border-brand-neon-green shadow-lg shadow-brand-neon-green/30" 
                    : "bg-brand-gray-800/50 border-brand-gray-600 hover:border-brand-neon-green/50 backdrop-blur-sm"
                )}
              >
                {isSelected && <div className="w-4 h-4 bg-brand-black rounded-lg" />}
              </button>
            </div>

            {/* Preview de imagem com efeitos premium */}
            <div className="relative w-24 h-24 flex-shrink-0 group/preview">
              {/* Efeitos de brilho múltiplas camadas */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-neon-green/30 via-cyan-400/20 to-purple-500/20 rounded-2xl blur-lg opacity-0 group-hover/preview:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-brand-neon-green/20 rounded-2xl blur opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative w-full h-full rounded-2xl overflow-hidden border border-brand-gray-700/50 group-hover/preview:border-brand-neon-green/50 transition-all duration-300">
                {isRequest ? (
                  <ImageCarousel 
                    creatives={item.creatives}
                    onImageClick={handleImageClick}
                    onCreativePreview={handleCreativePreview}
                    className="w-full h-full"
                  />
                ) : (
                  <>
                    {!isImageLoaded && !isImageError && (
                      <div className="w-full h-full bg-gradient-to-br from-brand-gray-800 to-brand-gray-900 animate-pulse flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-brand-gray-600 animate-spin" />
                      </div>
                    )}
                    
                    {isImageError ? (
                      <div className="w-full h-full bg-gradient-to-br from-brand-gray-800 to-brand-gray-900 flex items-center justify-center">
                        <Eye className="w-8 h-8 text-brand-gray-600" />
                      </div>
                    ) : (
                      <img
                        src={item.result_url || undefined}
                        alt={item.title}
                        className={cn(
                          "w-full h-full object-cover transition-all duration-500",
                          isImageLoaded ? 'opacity-100' : 'opacity-0',
                          isHovered && "scale-110"
                        )}
                        onLoad={() => setIsImageLoaded(true)}
                        onError={() => setIsImageError(true)}
                      />
                    )}
                  </>
                )}
              </div>
              
              {/* Indicador de status premium */}
              <div className="absolute -top-2 -right-2 z-10">
                <div className="relative">
                  <div className={cn(
                    "absolute inset-0 rounded-full blur-sm transition-all duration-300",
                    statusConfig.gradient.replace('from-', 'bg-').split(' ')[0] + '/50'
                  )}></div>
                  <div className={cn(
                    "relative w-7 h-7 rounded-full border-3 border-brand-gray-900 shadow-xl flex items-center justify-center",
                    "bg-gradient-to-br", statusConfig.gradient
                  )}>
                    <StatusIcon className={cn(
                      "w-4 h-4 text-white transition-all duration-300",
                      item.status === 'processing' && 'animate-spin'
                    )} />
                  </div>
                </div>
              </div>

              {/* Badge para múltiplos formatos */}
              {isRequest && (
                <div className="absolute -bottom-2 -left-2 z-10">
                  <Badge className="bg-brand-neon-green/90 text-brand-black border-brand-neon-green text-xs font-bold px-2 py-1">
                    <Layers2 className="w-3 h-3 mr-1" />
                    {totalCount}
                  </Badge>
                </div>
              )}
            </div>

            {/* Conteúdo principal */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-xl truncate group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-brand-neon-green group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-300">
                    {item.title}
                  </h3>
                  <p className="text-brand-gray-300 text-base truncate mt-1 leading-relaxed group-hover:text-brand-gray-200 transition-colors duration-300">
                    {item.prompt}
                  </p>
                </div>
                
                {/* Paleta de cores */}
                {(item.primary_color || item.secondary_color) && (
                  <div className="flex items-center space-x-1 ml-4">
                    {item.primary_color && (
                      <div 
                        className="w-5 h-5 rounded-full border-2 border-white/20 shadow-lg hover:scale-110 transition-transform duration-200"
                        style={{ backgroundColor: item.primary_color }}
                        title={`Cor primária: ${item.primary_color}`}
                      />
                    )}
                    {item.secondary_color && (
                      <div 
                        className="w-5 h-5 rounded-full border-2 border-white/20 shadow-lg hover:scale-110 transition-transform duration-200"
                        style={{ backgroundColor: item.secondary_color }}
                        title={`Cor secundária: ${item.secondary_color}`}
                      />
                    )}
                  </div>
                )}
              </div>
              
              {/* Metadados e badges */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge className={cn("text-xs font-medium px-3 py-1.5 border transition-all duration-300", statusConfig.color)}>
                    <StatusIcon className={cn("w-3 h-3 mr-1", item.status === 'processing' && 'animate-spin')} />
                    {statusConfig.label}
                  </Badge>
                  
                  {isRequest ? (
                    <div className="flex items-center space-x-2 text-sm text-brand-gray-400">
                      <Badge className="bg-brand-gray-800/60 px-3 py-1 rounded-lg border border-brand-gray-700/50 hover:border-brand-neon-green/30 transition-colors duration-300">
                        <Layers2 className="w-3 h-3 mr-1" />
                        {completedCount}/{totalCount} Formatos
                      </Badge>
                      <Badge className="bg-brand-gray-800/60 px-3 py-1 rounded-lg border border-brand-gray-700/50 hover:border-brand-neon-green/30 transition-colors duration-300">
                        🎨 {item.style}
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-sm text-brand-gray-400">
                      <Badge className="bg-brand-gray-800/60 px-3 py-1 rounded-lg border border-brand-gray-700/50 hover:border-brand-neon-green/30 transition-colors duration-300">
                        📐 {FORMAT_LABELS[item.format as keyof typeof FORMAT_LABELS]}
                      </Badge>
                      <Badge className="bg-brand-gray-800/60 px-3 py-1 rounded-lg border border-brand-gray-700/50 hover:border-brand-neon-green/30 transition-colors duration-300">
                        🎨 {item.style}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-brand-gray-500">
                  {new Date(item.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>

              {/* Barra de progresso para requests */}
              {isRequest && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-brand-gray-400">
                    <span>Progresso</span>
                    <span className="font-mono">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-brand-gray-800/50" />
                </div>
              )}
            </div>

            {/* Ações premium */}
            <div className="flex-shrink-0 flex items-center space-x-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(item.id, isRequest);
                }}
                className={cn(
                  "btn-ghost w-12 h-12 p-0 transition-all duration-300 group/btn",
                  isFavorite
                    ? "bg-pink-500/20 text-pink-400 hover:bg-pink-500/30"
                    : "hover:bg-pink-500/10 hover:text-pink-400"
                )}
                title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              >
                <Heart className={cn(
                  "w-5 h-5 group-hover/btn:scale-110 transition-all duration-200",
                  isFavorite && "fill-current"
                )} />
              </Button>
              
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                className="btn-ghost w-12 h-12 p-0 hover:bg-blue-500/10 hover:text-blue-400 transition-all duration-300 group/btn"
                title="Compartilhar"
              >
                <Share2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform duration-200" />
              </Button>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyPrompt();
                }}
                className="btn-ghost w-12 h-12 p-0 hover:bg-green-500/10 hover:text-green-400 transition-all duration-300 group/btn"
                title="Copiar prompt"
              >
                <Copy className="w-5 h-5 group-hover/btn:scale-110 transition-transform duration-200" />
              </Button>
              
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
                className="btn-ghost w-12 h-12 p-0 hover:bg-brand-neon-green/10 hover:text-brand-neon-green transition-all duration-300 group/btn border border-brand-gray-700/50 hover:border-brand-neon-green/50"
                title="Visualizar"
              >
                <Eye className="w-5 h-5 group-hover/btn:scale-110 transition-transform duration-200" />
              </Button>
              
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  // Menu de mais ações
                }}
                className="btn-ghost w-12 h-12 p-0 hover:bg-brand-gray-700/50 transition-all duration-300 group/btn"
                title="Mais opções"
              >
                <MoreHorizontal className="w-5 h-5 group-hover/btn:scale-110 transition-transform duration-200" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Renderização para modos grid e masonry
  return (
    <div 
      className={cn(
        "relative group rounded-xl overflow-hidden border bg-brand-gray-900/50 backdrop-blur-sm transition-all duration-500 cursor-pointer",
        "hover:scale-[1.02] hover:shadow-2xl hover:shadow-brand-neon-green/20",
        isSelected ? "border-brand-neon-green ring-2 ring-brand-neon-green/30" : "border-brand-gray-700/50 hover:border-brand-neon-green/50",
        viewMode === 'masonry' ? "break-inside-avoid mb-8 xl:mb-10 2xl:mb-12" : "aspect-square",
        className
      )}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Checkbox de seleção */}
      <div 
        className={cn(
          "absolute top-3 left-3 z-30 transition-all duration-300",
          isSelected ? "opacity-100 scale-100" : "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onSelectionChange(item.id, isRequest)}
          className={cn(
            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 backdrop-blur-sm",
            isSelected 
              ? "bg-brand-neon-green border-brand-neon-green shadow-lg shadow-brand-neon-green/50" 
              : "bg-black/50 border-white/30 hover:border-brand-neon-green/50"
          )}
        >
          {isSelected && <div className="w-3 h-3 bg-brand-black rounded-sm" />}
        </button>
      </div>

      {/* Ações rápidas */}
      <div className={cn(
        "absolute top-3 right-3 z-30 flex space-x-1 transition-all duration-300",
        isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      )}>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id, isRequest);
          }}
          className="w-8 h-8 bg-black/50 hover:bg-pink-500/20 rounded-lg flex items-center justify-center transition-colors backdrop-blur-sm"
          title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Heart 
            className={cn(
              "w-4 h-4 transition-all duration-300",
              isFavorite 
                ? "text-pink-500 fill-pink-500 scale-110" 
                : "text-white hover:text-pink-400"
            )}
          />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleShare();
          }}
          className="w-8 h-8 bg-black/50 hover:bg-blue-500/20 rounded-lg flex items-center justify-center transition-colors backdrop-blur-sm"
        >
          <Share2 className="w-4 h-4 text-white hover:text-blue-400" />
        </button>
        {isRequest && (
          <button className="w-8 h-8 bg-black/50 hover:bg-brand-neon-green/20 rounded-lg flex items-center justify-center transition-colors backdrop-blur-sm">
            <Layers2 className="w-4 h-4 text-white hover:text-brand-neon-green" />
          </button>
        )}
      </div>

      {/* Container de imagem */}
      <div className="relative overflow-hidden h-full">
        {isRequest ? (
          <ImageCarousel 
            creatives={item.creatives}
            onImageClick={handleImageClick}
            onCreativePreview={handleCreativePreview}
            className={cn(
              "w-full",
              viewMode === 'masonry' ? "h-auto min-h-[240px]" : "h-full"
            )}
          />
        ) : (
          <>
            {!isImageLoaded && (
              <div className={cn(
                "w-full bg-brand-gray-800 animate-pulse flex items-center justify-center",
                viewMode === 'masonry' ? "h-64" : "h-full absolute inset-0"
              )}>
                <Sparkles className="w-8 h-8 text-brand-gray-600" />
              </div>
            )}
            
            {isImageError ? (
              <div className={cn(
                "w-full flex flex-col items-center justify-center text-center p-8 bg-brand-gray-800/50",
                viewMode === 'masonry' ? "h-64" : "h-full absolute inset-0"
              )}>
                <Eye className="w-12 h-12 text-brand-gray-600 mb-2" />
                <p className="text-sm text-red-400">Erro ao carregar</p>
              </div>
            ) : (
              <img
                src={item.result_url || undefined}
                alt={item.title}
                className={cn(
                  "w-full object-cover transition-all duration-700",
                  isImageLoaded ? 'opacity-100' : 'opacity-0',
                  isHovered && "scale-110",
                  viewMode === 'masonry' ? "h-auto" : "h-full"
                )}
                onLoad={() => setIsImageLoaded(true)}
                onError={() => setIsImageError(true)}
                loading="lazy"
              />
            )}
          </>
        )}
      </div>
      
      {/* Overlay com informações */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-all duration-500",
        isHovered ? "opacity-100" : "opacity-0"
      )}>
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-lg mb-1 truncate">
                {item.title}
              </h3>
              <p className="text-brand-gray-300 text-sm line-clamp-2 mb-2">
                {item.prompt}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge className={cn("text-xs font-medium", statusConfig.color)}>
                <StatusIcon className={cn("w-3 h-3 mr-1", item.status === 'processing' && 'animate-spin')} />
                {statusConfig.label}
              </Badge>
              
              {isRequest ? (
                <Badge className="bg-brand-neon-green/20 text-brand-neon-green border-brand-neon-green/30 text-xs">
                  <Layers2 className="w-3 h-3 mr-1" />
                  {completedCount}/{totalCount}
                </Badge>
              ) : (
                <Badge className="bg-brand-neon-green/20 text-brand-neon-green border-brand-neon-green/30 text-xs">
                  {FORMAT_LABELS[item.format as keyof typeof FORMAT_LABELS]}
                </Badge>
              )}
            </div>
            
            <div className="text-xs text-brand-gray-400">
              {new Date(item.created_at).toLocaleDateString('pt-BR')}
            </div>
          </div>

          {/* Barra de progresso compacta */}
          {isRequest && progress < 100 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-brand-gray-400">
                <span>Progresso</span>
                <span className="font-mono">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1 bg-brand-gray-800/50" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 