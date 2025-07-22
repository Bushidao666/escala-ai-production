"use client";

import { Button } from '@/components/ui/button';
import { Trash2, X, Download, Loader2 } from 'lucide-react';

interface ActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDelete: () => void;
  onDownload: () => void;
  isDeleting: boolean;
  isDownloading: boolean;
  estimatedSize?: string | null;
}

export function ActionBar({ 
  selectedCount, 
  onClearSelection, 
  onDelete,
  onDownload,
  isDeleting,
  isDownloading,
  estimatedSize
}: ActionBarProps) {
  // A barra só é renderizada se houver itens selecionados
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="sticky top-4 z-20 w-full">
      <div className="max-w-2xl mx-auto p-2 flex items-center justify-between bg-brand-neon-green/90 text-brand-black rounded-lg shadow-2xl shadow-brand-neon-green/20 backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg px-2">{selectedCount}</span>
          <div>
            <p className="font-semibold">
              {selectedCount > 1 ? 'itens selecionados' : 'item selecionado'}
            </p>
            {estimatedSize && (
              <p className="text-xs text-brand-black/70 font-medium">
                Tamanho estimado: {estimatedSize}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={onDownload}
            disabled={isDownloading || isDeleting}
            className="bg-blue-600 text-white hover:bg-blue-700 h-9 px-3 transition-all duration-200 disabled:opacity-50"
            title={`Baixar ${selectedCount} criativos em ZIP organizado por formato`}
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Baixando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                ZIP ({selectedCount})
              </>
            )}
          </Button>
          
          <Button
            onClick={onDelete}
            disabled={isDeleting || isDownloading}
            className="bg-brand-black text-red-400 hover:bg-brand-gray-900 h-9 px-3 transition-all duration-200 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </>
            )}
          </Button>
          
          <Button
            onClick={onClearSelection}
            disabled={isDownloading || isDeleting}
            className="bg-transparent hover:bg-brand-black/20 h-9 w-9 p-0 transition-all duration-200 disabled:opacity-50"
            title="Limpar seleção"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
} 