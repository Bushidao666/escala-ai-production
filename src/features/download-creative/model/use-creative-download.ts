import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { getSelectedCreativesForDownload } from '@/modules/gallery/application/actions';
import { 
  createOrganizedCreativesZip, 
  estimateZipSize, 
  type DownloadProgress, 
  type DownloadResult,
  type CreativeForDownload 
} from '@/shared/lib/zipUtils';

export interface UseCreativeDownloadReturn {
  // Estado do download
  isDownloading: boolean;
  progress: DownloadProgress | null;
  error: string | null;
  showModal: boolean;
  estimatedSize: string | null;
  
  // Função principal para iniciar download
  downloadSelectedCreatives: (selectedIds: string[]) => Promise<void>;
  
  // Função para estimar tamanho
  getEstimatedSize: (selectedIds: string[]) => Promise<string | null>;
  
  // Função para cancelar download
  cancelDownload: () => void;
  
  // Função para controlar modal
  setShowModal: (show: boolean) => void;
  
  // Função para resetar estado
  resetDownloadState: () => void;
}

/**
 * 📥 Hook customizado para download em lote de criativos
 * Gerencia todo o fluxo: busca → organização → ZIP → download
 */
export function useCreativeDownload(): UseCreativeDownloadReturn {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [estimatedSize, setEstimatedSize] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * 🎯 Função principal para download em lote
   */
  const downloadSelectedCreatives = useCallback(async (selectedIds: string[]) => {
    if (!selectedIds.length) {
      toast.error("Nenhum item selecionado para download");
      return;
    }

    if (isDownloading) {
      toast.warning("Download já em andamento");
      return;
    }

    // Criar AbortController para permitir cancelamento
    abortControllerRef.current = new AbortController();

    setIsDownloading(true);
    setError(null);
    setShowModal(true); // Mostrar modal de progresso
    setProgress({
      current: 0,
      total: 0,
      status: 'preparing',
      message: 'Preparando download...'
    });

    try {
      // 🔍 ETAPA 1: Buscar dados dos criativos selecionados
      toast.info(`🔍 Preparando download de ${selectedIds.length} itens...`, {
        description: "Verificando disponibilidade e coletando metadados"
      });

      const downloadData = await getSelectedCreativesForDownload(selectedIds);
      
      // Mostrar estatísticas do que será baixado
      const statsMessage = Object.entries(downloadData.statsByFormat)
        .map(([format, count]) => `${count} ${format}`)
        .join(', ');
      
      // 📏 Estimar tamanho do download
      const sizeEstimate = estimateZipSize(downloadData.creatives);
      setEstimatedSize(sizeEstimate);
      console.log(`📊 Tamanho estimado do ZIP: ${sizeEstimate}`);
      
      toast.success(`✅ ${downloadData.totalCount} criativos encontrados e validados`, {
        description: `📊 Distribuição: ${statsMessage} • Tamanho estimado: ${sizeEstimate}`
      });

      // 🗜️ ETAPA 2: Criar ZIP organizado
      const result: DownloadResult = await createOrganizedCreativesZip(
        downloadData.creatives,
        (progressUpdate) => {
          setProgress(progressUpdate);
          
          // Mostrar toast de progress para etapas importantes
          if (progressUpdate.status === 'downloading' && progressUpdate.current % 3 === 0) {
            const percent = Math.round((progressUpdate.current / progressUpdate.total) * 100);
            toast.info(`📥 Download ${percent}% • ${progressUpdate.current}/${progressUpdate.total}`, {
              description: progressUpdate.message || "Baixando imagens em alta qualidade"
            });
          } else if (progressUpdate.status === 'zipping') {
            toast.info("🗜️ Criando arquivo ZIP...", {
              description: "Organizando por formato e comprimindo"
            });
          }
        }
      );

      // 🎉 ETAPA 3: Mostrar resultado final
      if (result.success) {
        const successMessage = `🎉 ${result.downloadedCount} criativos baixados com sucesso!`;
        const zipSizeFormatted = result.zipSize ? formatFileSize(result.zipSize) : 'N/A';
        
        toast.success(successMessage, {
          description: `📁 ZIP organizado (${zipSizeFormatted}) salvo em Downloads • Organizado por formato`,
          duration: 6000
        });

        // Marcar como concluído no progress
        setProgress({
          current: result.downloadedCount,
          total: downloadData.totalCount,
          status: 'complete',
          message: 'Download concluído com sucesso!'
        });

        // Fechar modal automaticamente após 3 segundos
        setTimeout(() => {
          setShowModal(false);
        }, 3000);

        // Log detalhado para debug
        console.log("✅ Download concluído:", {
          downloadedCount: result.downloadedCount,
          failedCount: result.failedCount,
          zipSize: zipSizeFormatted,
          failedItems: result.failedItems
        });

        // Mostrar aviso sobre falhas, se houver
        if (result.failedCount > 0) {
          toast.warning(`${result.failedCount} itens falharam no download`, {
            description: "Verifique se as imagens estão acessíveis",
            duration: 4000
          });
        }
      } else {
        throw new Error(result.error || "Erro desconhecido durante o download");
      }

    } catch (error: any) {
      console.error("❌ Erro no download em lote:", error);
      
      const errorMessage = error.message || "Erro desconhecido durante o download";
      setError(errorMessage);
      
      toast.error("Falha no download", {
        description: errorMessage,
        duration: 6000
      });

      setProgress({
        current: 0,
        total: 0,
        status: 'error',
        message: 'Erro durante o download',
        error: errorMessage
      });

    } finally {
      setIsDownloading(false);
      abortControllerRef.current = null;
    }
  }, [isDownloading]);

  /**
   * 📏 Estima tamanho do download sem executar
   */
  const getEstimatedSize = useCallback(async (selectedIds: string[]): Promise<string | null> => {
    try {
      const downloadData = await getSelectedCreativesForDownload(selectedIds);
      return estimateZipSize(downloadData.creatives);
    } catch (error) {
      console.error("Erro ao estimar tamanho:", error);
      return null;
    }
  }, []);

  /**
   * ❌ Cancelar download em progresso
   */
  const cancelDownload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setIsDownloading(false);
    setShowModal(false);
    setProgress(null);
    setError(null);
    
    toast.info("Download cancelado pelo usuário");
  }, []);

  /**
   * 🔄 Reset do estado do download
   */
  const resetDownloadState = useCallback(() => {
    setIsDownloading(false);
    setProgress(null);
    setError(null);
    setShowModal(false);
    setEstimatedSize(null);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    isDownloading,
    progress,
    error,
    showModal,
    estimatedSize,
    downloadSelectedCreatives,
    getEstimatedSize,
    cancelDownload,
    setShowModal,
    resetDownloadState
  };
}

/**
 * 📏 Utilitário para formatar tamanho de arquivo
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * 🎯 Hook simplificado para casos básicos
 * Para uso quando só precisa da função de download sem estado complexo
 */
export function useSimpleCreativeDownload() {
  const { downloadSelectedCreatives, isDownloading } = useCreativeDownload();
  
  return {
    downloadCreatives: downloadSelectedCreatives,
    isDownloading
  };
} 