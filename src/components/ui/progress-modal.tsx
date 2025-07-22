import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Check, 
  X, 
  FileDown, 
  Image as ImageIcon,
  RefreshCw,
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DownloadProgress } from '@/lib/utils/zipUtils';

interface ProgressModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  progress: DownloadProgress | null;
  selectedCount: number;
  estimatedSize?: string | null;
  onCancel?: () => void;
}

export function ProgressModal({
  isOpen,
  onOpenChange,
  progress,
  selectedCount,
  estimatedSize,
  onCancel
}: ProgressModalProps) {
  const getProgressPercentage = () => {
    if (!progress || progress.total === 0) return 0;
    return Math.round((progress.current / progress.total) * 100);
  };

  const getStatusIcon = () => {
    if (!progress) return <RefreshCw className="w-5 h-5 animate-spin" />;
    
    switch (progress.status) {
      case 'preparing':
        return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />;
      case 'downloading':
        return <Download className="w-5 h-5 animate-pulse text-brand-neon-green" />;
      case 'zipping':
        return <FileDown className="w-5 h-5 animate-bounce text-purple-500" />;
      case 'complete':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <RefreshCw className="w-5 h-5 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    if (!progress) return 'bg-gray-500';
    
    switch (progress.status) {
      case 'preparing':
        return 'bg-blue-500';
      case 'downloading':
        return 'bg-brand-neon-green';
      case 'zipping':
        return 'bg-purple-500';
      case 'complete':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    if (!progress) return 'Preparando...';
    
    switch (progress.status) {
      case 'preparing':
        return 'Preparando download...';
      case 'downloading':
        return `Baixando arquivos... (${progress.current}/${progress.total})`;
      case 'zipping':
        return 'Criando arquivo ZIP...';
      case 'complete':
        return 'Download concluído!';
      case 'error':
        return 'Erro no download';
      default:
        return 'Processando...';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-neon-green/30 rounded-full blur animate-pulse"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-brand-neon-green to-emerald-400 rounded-full flex items-center justify-center">
                {getStatusIcon()}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Download em Progresso</h3>
              <p className="text-sm text-brand-gray-300">
                {selectedCount} criativos selecionados
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-brand-gray-300">
                {getStatusText()}
              </span>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-white border-0",
                  getStatusColor()
                )}
              >
                {getProgressPercentage()}%
              </Badge>
            </div>
            
            <Progress 
              value={getProgressPercentage()} 
              className="h-3"
            />
            
            {progress?.message && (
              <p className="text-xs text-brand-gray-400 italic">
                {progress.message}
              </p>
            )}
          </div>

          {/* Informações do Download */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-brand-gray-800/50 rounded-lg border border-brand-gray-700/50">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-brand-neon-green" />
              <div>
                <p className="text-xs text-brand-gray-400">Arquivos</p>
                <p className="text-sm font-medium text-white">
                  {progress?.current || 0}/{progress?.total || selectedCount}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <FolderOpen className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-xs text-brand-gray-400">Tamanho</p>
                <p className="text-sm font-medium text-white">
                  {estimatedSize || 'Calculando...'}
                </p>
              </div>
            </div>
          </div>

          {/* Status específico de erro */}
          {progress?.status === 'error' && progress.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p className="text-sm text-red-400 font-medium">
                  Erro no download
                </p>
              </div>
              <p className="text-xs text-red-300 mt-1">
                {progress.error}
              </p>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex items-center justify-between pt-2">
            {progress?.status === 'complete' ? (
              <Button
                onClick={() => onOpenChange(false)}
                className="w-full btn-neon"
              >
                <Check className="w-4 h-4 mr-2" />
                Fechar
              </Button>
            ) : progress?.status === 'error' ? (
              <div className="flex space-x-2 w-full">
                <Button
                  onClick={() => onOpenChange(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Fechar
                </Button>
                <Button
                  onClick={onCancel}
                  className="flex-1 btn-neon"
                >
                  Tentar Novamente
                </Button>
              </div>
            ) : (
              <Button
                onClick={onCancel}
                variant="outline"
                className="w-full"
                disabled={!onCancel}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar Download
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 