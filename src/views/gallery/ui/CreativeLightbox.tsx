"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  X,
  Copy,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Palette,
  Heart,
  Share2,
  Maximize2,
  Minimize2,
  Eye,
  Zap,
  Settings,
  ExternalLink,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Info,
  Clock,
  Layers2,
  CheckCircle2,
  XOctagon,
  Loader2,
  Play,
  Pause,
  Monitor,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { toast } from "sonner";
import { cn } from '@/shared/lib/utils';
import { FORMAT_LABELS } from '@/modules/creative/dto/creative.schema';

// Tipagem otimizada para o lightbox
type CreativeForLightbox = {
  id: string;
  title: string;
  prompt: string;
  result_url: string | null;
  status: string;
  style?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  format?: string | null;
  error_message?: string | null;
  created_at?: string;
};

interface CreativeLightboxProps {
  images: CreativeForLightbox[];
  startIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}

// Configurações de status seguindo o padrão do projeto
const STATUS_CONFIG = {
  completed: { 
    label: "Concluído", 
    color: "bg-brand-neon-green/20 text-brand-neon-green border-brand-neon-green/30", 
    icon: CheckCircle2
  },
  processing: { 
    label: "Processando", 
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30", 
    icon: Loader2
  },
  failed: { 
    label: "Falhou", 
    color: "bg-red-500/20 text-red-400 border-red-500/30", 
    icon: XOctagon
  },
  draft: { 
    label: "Rascunho", 
    color: "bg-brand-gray-500/20 text-brand-gray-400 border-brand-gray-500/30", 
    icon: Clock
  },
};

export function CreativeLightbox({ images, startIndex, isOpen, onClose, onDelete }: CreativeLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isImageError, setIsImageError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [showMetadata, setShowMetadata] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const creative = images[currentIndex];
  const statusConfig = STATUS_CONFIG[creative?.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
  const StatusIcon = statusConfig.icon;

  // Navegação por teclado
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        handleNavigate('prev');
        break;
      case 'ArrowRight':
        e.preventDefault();
        handleNavigate('next');
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
        break;
      case '+':
      case '=':
        e.preventDefault();
        setZoom(prev => Math.min(prev + 0.25, 3));
        break;
      case '-':
        e.preventDefault();
        setZoom(prev => Math.max(prev - 0.25, 0.25));
        break;
      case '0':
        e.preventDefault();
        setZoom(1);
        setRotation(0);
        break;
      case 'r':
      case 'R':
        e.preventDefault();
        setRotation(prev => (prev + 90) % 360);
        break;
      case ' ':
        e.preventDefault();
        setIsAutoPlay(!isAutoPlay);
        break;
      case 'i':
      case 'I':
        e.preventDefault();
        setShowMetadata(!showMetadata);
        break;
      case 'h':
      case 'H':
        e.preventDefault();
        setIsFavorite(!isFavorite);
        break;
    }
  }, [isOpen, isFullscreen, isAutoPlay, showMetadata, isFavorite, onClose]);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlay && images.length > 1) {
      autoPlayIntervalRef.current = setInterval(() => {
        handleNavigate('next');
      }, 3000);
    } else {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    }

    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, [isAutoPlay, images.length]);

  // Event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Reset states when image changes
  useEffect(() => {
    setIsImageLoaded(false);
    setIsImageError(false);
    setZoom(1);
    setRotation(0);
  }, [currentIndex]);

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % images.length
      : (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(newIndex);
  };

  const handleCopyPrompt = async () => {
    if (creative.prompt) {
      try {
        await navigator.clipboard.writeText(creative.prompt);
        toast.success("Prompt copiado!", {
          description: "O prompt foi copiado para a área de transferência"
        });
      } catch {
        toast.error("Erro ao copiar prompt");
      }
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share && creative.result_url) {
        await navigator.share({
          title: creative.title,
          text: creative.prompt,
          url: creative.result_url,
        });
      } else {
        await navigator.clipboard.writeText(creative.result_url || '');
        toast.success("Link copiado!", {
          description: "URL copiada para compartilhamento"
        });
      }
    } catch {
      toast.error("Erro ao compartilhar");
    }
  };

  const handleDownload = async () => {
    if (!creative.result_url) return;
    
    try {
      const response = await fetch(creative.result_url);
      if (!response.ok) throw new Error('Falha ao baixar imagem');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${creative.title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      
      toast.success("Download concluído!", {
        description: `${creative.title} foi baixado com sucesso`
      });
    } catch {
      toast.error("Erro no download");
    }
  };

  const handleDelete = () => {
    onDelete(creative.id);
    onClose();
  };

  if (!creative) return null;

  const progress = images.length > 1 ? ((currentIndex + 1) / images.length) * 100 : 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-7xl h-[95vh] p-0 border-brand-gray-700/50 bg-brand-black backdrop-blur-xl overflow-hidden",
        "animate-in zoom-in-95 fade-in-0 duration-300 ease-out"
      )}>
        
        {/* Header Minimalista */}
        <div className="relative border-b border-brand-gray-700/50 bg-brand-gray-800/50 backdrop-blur-sm">
          {/* Progress Bar */}
          {images.length > 1 && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-gray-700/50">
              <div 
                className="h-full bg-brand-neon-green transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-brand-neon-green/10 p-2 rounded-lg border border-brand-neon-green/30">
                <Eye className="w-5 h-5 text-brand-neon-green" />
              </div>
              <div>
                <DialogTitle asChild>
                  <h2 className="text-xl font-semibold text-white">
                    Visualizar Criativo
                  </h2>
                </DialogTitle>
                {images.length > 1 && (
                  <p className="text-brand-gray-400 text-sm">
                    {currentIndex + 1} de {images.length}
                  </p>
                )}
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-2">
              {/* Auto-play control */}
              {images.length > 1 && (
                <Button
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className={cn(
                    "btn-ghost w-10 h-10 p-0 transition-all duration-300",
                    isAutoPlay ? "bg-brand-neon-green/20 text-brand-neon-green" : "hover:bg-brand-gray-700/50"
                  )}
                  title={isAutoPlay ? "Pausar slideshow" : "Iniciar slideshow"}
                >
                  {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              )}
              
              {/* Metadata toggle */}
              <Button
                onClick={() => setShowMetadata(!showMetadata)}
                className={cn(
                  "btn-ghost w-10 h-10 p-0 transition-all duration-300",
                  showMetadata ? "bg-blue-500/20 text-blue-400" : "hover:bg-brand-gray-700/50"
                )}
                title="Alternar informações"
              >
                <Info className="w-4 h-4" />
              </Button>
              
              {/* Fullscreen toggle */}
              <Button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="btn-ghost w-10 h-10 p-0 hover:bg-brand-gray-700/50 transition-all duration-300"
                title={isFullscreen ? "Sair do fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              
              {/* Close button */}
              <Button
                onClick={onClose}
                className="btn-ghost w-10 h-10 p-0 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className={cn(
          "relative grid transition-all duration-500 h-[calc(95vh-88px)]",
          isFullscreen ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-3"
        )}>
          
          {/* Image Section */}
          <div className={cn(
            "relative bg-brand-black flex items-center justify-center group",
            isFullscreen ? "col-span-1" : "xl:col-span-2"
          )}>

            {creative.result_url ? (
              <div className="relative max-w-full max-h-full group/image flex items-center justify-center">
                {/* Loading state */}
                {!isImageLoaded && !isImageError && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="relative">
                      <div className="absolute inset-0 bg-brand-neon-green/20 rounded-full blur-xl animate-pulse"></div>
                      <div className="relative w-16 h-16 border-4 border-brand-gray-700/30 border-t-brand-neon-green rounded-full animate-spin"></div>
                    </div>
                  </div>
                )}
                
                {/* Error state */}
                {isImageError && (
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30">
                      <XOctagon className="w-12 h-12 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-red-400 mb-2">Erro ao carregar imagem</h3>
                      <p className="text-brand-gray-400">A imagem não pôde ser carregada</p>
                    </div>
                  </div>
                )}
                
                {/* Main image */}
                <img 
                  ref={imageRef}
                  src={creative.result_url} 
                  alt={creative.title} 
                  className={cn(
                    "max-w-full max-h-full object-contain rounded-lg shadow-xl transition-all duration-500 ease-out",
                    isImageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95",
                    "transform-gpu"
                  )}
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: 'transform 0.3s ease-out, opacity 0.5s ease-out'
                  }}
                  onLoad={() => setIsImageLoaded(true)}
                  onError={() => setIsImageError(true)}
                />
                
                {/* Image overlay controls */}
                <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/5 transition-all duration-300 rounded-lg pointer-events-none">
                  {/* Zoom controls */}
                  <div className="absolute top-4 left-4 flex flex-col space-y-2 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 pointer-events-auto">
                    <Button
                      onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
                      className="btn-ghost w-10 h-10 p-0 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20"
                    >
                      <ZoomIn className="w-4 h-4 text-white" />
                    </Button>
                    <Button
                      onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.25))}
                      className="btn-ghost w-10 h-10 p-0 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20"
                    >
                      <ZoomOut className="w-4 h-4 text-white" />
                    </Button>
                    <Button
                      onClick={() => setRotation(prev => (prev + 90) % 360)}
                      className="btn-ghost w-10 h-10 p-0 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20"
                    >
                      <RotateCw className="w-4 h-4 text-white" />
                    </Button>
                    {(zoom !== 1 || rotation !== 0) && (
                      <Button
                        onClick={() => { setZoom(1); setRotation(0); }}
                        className="btn-ghost w-10 h-10 p-0 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20"
                      >
                        <Monitor className="w-4 h-4 text-white" />
                      </Button>
                    )}
                  </div>

                  {/* Bottom action bar */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between opacity-0 group-hover/image:opacity-100 transition-all duration-300 pointer-events-auto">
                    <div className="flex items-center space-x-2">
                      <Button 
                        onClick={() => setIsFavorite(!isFavorite)}
                        className={cn(
                          "btn-ghost bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border border-white/20 px-3 py-2 transition-all duration-300",
                          isFavorite && "bg-pink-500/30 border-pink-500/50 text-pink-300"
                        )}
                      >
                        <Heart className={cn("w-4 h-4 mr-2", isFavorite && "fill-current")} />
                        {isFavorite ? "Favoritado" : "Favoritar"}
                      </Button>
                      <Button 
                        onClick={handleShare} 
                        className="btn-ghost bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border border-white/20 px-3 py-2"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Compartilhar
                      </Button>
                    </div>
                    
                    <Button 
                      onClick={handleDownload}
                      className="btn-neon px-4 py-2"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto bg-brand-gray-700/50 rounded-full flex items-center justify-center border border-brand-gray-600/50">
                  <Sparkles className="w-12 h-12 text-brand-gray-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-brand-gray-400 mb-2">Imagem não disponível</h3>
                  <p className="text-brand-gray-500">Este criativo ainda não possui uma imagem gerada</p>
                </div>
              </div>
            )}

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button 
                    onClick={() => handleNavigate('prev')} 
                    className="w-12 h-12 p-0 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 backdrop-blur-sm transition-all duration-300"
                  >
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </Button>
                </div>
                
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button 
                    onClick={() => handleNavigate('next')} 
                    className="w-12 h-12 p-0 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 backdrop-blur-sm transition-all duration-300"
                  >
                    <ArrowRight className="w-5 h-5 text-white" />
                  </Button>
                </div>
              </>
            )}

            {/* Image counter overlay */}
            {images.length > 1 && (
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/20">
                  <span className="text-white text-sm">
                    {currentIndex + 1} / {images.length}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Unificada */}
          {!isFullscreen && showMetadata && (
            <div className="xl:col-span-1 border-l border-brand-gray-700/50 bg-brand-black">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <Card className="card-glass-intense border-brand-gray-700/50">
                    <CardContent className="p-6 space-y-8">
                      
                      {/* Informações do Criativo */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="bg-brand-neon-green/10 p-2 rounded-lg border border-brand-neon-green/30">
                            <Eye className="w-5 h-5 text-brand-neon-green" />
                          </div>
                          <h3 className="text-lg font-semibold text-white">{creative.title}</h3>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={cn("text-sm font-medium px-3 py-1.5 border", statusConfig.color)}>
                            <StatusIcon className={cn("w-4 h-4 mr-2", creative.status === 'processing' && 'animate-spin')} />
                            {statusConfig.label}
                          </Badge>
                          
                          {creative.format && (
                            <Badge className="bg-brand-gray-700/50 text-brand-gray-300 border-brand-gray-600/50 text-sm px-3 py-1.5">
                              📐 {FORMAT_LABELS[creative.format as keyof typeof FORMAT_LABELS] || creative.format}
                            </Badge>
                          )}
                          
                          {creative.style && (
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-sm px-3 py-1.5">
                              🎨 {creative.style}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Divisor */}
                      <div className="border-t border-brand-gray-700/50"></div>
                      
                      {/* Prompt Section */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Sparkles className="w-5 h-5 text-brand-neon-green" />
                          <h4 className="text-lg font-semibold text-white">Prompt Utilizado</h4>
                        </div>
                        <div className="bg-brand-gray-800/50 rounded-lg p-4 border border-brand-gray-700/50">
                          <p className="text-brand-gray-300 text-sm leading-relaxed">{creative.prompt}</p>
                        </div>
                        <Button 
                          onClick={handleCopyPrompt} 
                          className="w-full btn-ghost hover:bg-brand-neon-green/10 hover:text-brand-neon-green transition-all duration-300"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar Prompt
                        </Button>
                      </div>

                      {/* Visual Details */}
                      {(creative.primary_color || creative.secondary_color) && (
                        <>
                          <div className="border-t border-brand-gray-700/50"></div>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <Palette className="w-5 h-5 text-brand-neon-green" />
                              <h4 className="text-lg font-semibold text-white">Detalhes Visuais</h4>
                            </div>
                            <div className="space-y-3">
                              {creative.primary_color && (
                                <div className="flex items-center justify-between p-3 bg-brand-gray-800/50 rounded-lg border border-brand-gray-700/50">
                                  <span className="text-brand-gray-400 text-sm">Cor Primária</span>
                                  <div className="flex items-center space-x-2">
                                    <div 
                                      className="w-5 h-5 rounded-full border-2 border-white/20"
                                      style={{ backgroundColor: creative.primary_color }}
                                    ></div>
                                    <span className="text-white text-sm font-mono">{creative.primary_color}</span>
                                  </div>
                                </div>
                              )}
                              {creative.secondary_color && (
                                <div className="flex items-center justify-between p-3 bg-brand-gray-800/50 rounded-lg border border-brand-gray-700/50">
                                  <span className="text-brand-gray-400 text-sm">Cor Secundária</span>
                                  <div className="flex items-center space-x-2">
                                    <div 
                                      className="w-5 h-5 rounded-full border-2 border-white/20"
                                      style={{ backgroundColor: creative.secondary_color }}
                                    ></div>
                                    <span className="text-white text-sm font-mono">{creative.secondary_color}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Error Message */}
                      {creative.error_message && (
                        <>
                          <div className="border-t border-brand-gray-700/50"></div>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <XOctagon className="w-5 h-5 text-red-400" />
                              <h4 className="text-lg font-semibold text-red-400">Erro Detectado</h4>
                            </div>
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                              <p className="text-red-300 text-sm leading-relaxed">{creative.error_message}</p>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Divisor */}
                      <div className="border-t border-brand-gray-700/50"></div>

                      {/* Actions */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Settings className="w-5 h-5 text-brand-neon-green" />
                          <h4 className="text-lg font-semibold text-white">Ações</h4>
                        </div>
                        <div className="space-y-3">
                          {creative.result_url && (
                            <a href={creative.result_url} target="_blank" rel="noopener noreferrer" className="block">
                              <Button className="w-full btn-ghost hover:bg-blue-500/10 hover:text-blue-400 transition-all duration-300">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Abrir em Nova Aba
                              </Button>
                            </a>
                          )}
                          <Button 
                            onClick={handleDelete} 
                            className="w-full btn-ghost text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir Criativo
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 