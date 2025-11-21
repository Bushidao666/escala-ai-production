"use client"

import React from 'react';
import { Checkbox } from "@/shared/ui/checkbox";
import { cn } from '@/shared/lib/utils';

// Um placeholder visual para ser usado enquanto a imagem real carrega.
const SkeletonLoader = () => (
  <div className="w-full h-full bg-brand-gray-800 animate-pulse" />
);

// Props para o CreativeCard
interface CreativeCardProps {
  creative: {
    id: string;
    title: string;
    result_url: string | null;
  };
  isSelected: boolean;
  onSelectionChange: (id: string) => void;
  onCardClick: () => void;
}

export function CreativeCard({ creative, isSelected, onSelectionChange, onCardClick }: CreativeCardProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = () => {
    setIsLoaded(true); // Para de mostrar o skeleton
    setIsError(true); // Mostra o ícone de erro
  };

  return (
    <div 
      className={cn(
        "relative group aspect-square rounded-lg overflow-hidden border bg-brand-gray-900 transition-all duration-300 cursor-pointer",
        isSelected ? "border-brand-neon-green/80" : "border-brand-gray-700",
        "hover:border-brand-neon-green/50 hover:shadow-2xl hover:shadow-brand-neon-green/10"
      )}
      onClick={onCardClick}
    >
      {/* Checkbox de Seleção (impede a propagação do clique para o container) */}
      <div 
        className={cn(
          "absolute top-3 left-3 z-20 transition-opacity duration-200",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelectionChange(creative.id)}
          className="bg-brand-black/50 border-brand-gray-500 data-[state=checked]:bg-brand-neon-green"
        />
      </div>

      {/* Imagem com Lazy Loading e Skeleton */}
      <div className="absolute inset-0 z-0">
        {!isLoaded && <SkeletonLoader />}
        
        {isError ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
            <p className="text-sm text-red-400">Erro ao carregar imagem</p>
          </div>
        ) : (
          <img
            src={creative.result_url || undefined}
            alt={`Criativo: ${creative.title}`}
            className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        )}
      </div>
      
      {/* Overlay com informações e ações (z-10 para ficar acima da imagem mas abaixo do checkbox) */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end pointer-events-none">
        <h3 className="text-white font-bold text-base truncate">{creative.title}</h3>
      </div>
    </div>
  );
} 