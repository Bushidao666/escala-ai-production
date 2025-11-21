"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from '@/shared/infra/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Play,
  Pause,
  RefreshCw,
  Eye,
  Download,
  Trash2,
  AlertTriangle,
  Timer,
  Activity,
  TrendingUp,
  Zap,
  FileImage,
  Calendar,
  BarChart3,
  Filter,
  Search,
  MoreHorizontal,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Clock4,
  CheckCircle2,
  AlertCircle,
  XOctagon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  Share2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { getUserCreatives, reprocessCreative, deleteCreative, triggerQueueProcessing, getUserCreativeRequests, fixInconsistentRequestStatuses } from "../new/actions";
import { FORMAT_LABELS } from "@/modules/creative/dto/creative.schema";
import { UnifiedCreativeCard } from "./UnifiedCreativeCard";
import { useSupabaseRealtime } from '@/shared/hooks/useSupabaseRealtime';
import { Tables } from '@/shared/infra/supabase/supabase.types';

// Types baseados nos tipos oficiais do Supabase
type QueueCreative = Tables<'creatives'> & {
  queue_jobs?: Tables<'queue_jobs'>[];
};

type QueueCreativeRequest = Tables<'creative_requests'> & {
  creatives: QueueCreative[];
};

// Union type para items unificados
type QueueItem = QueueCreative | QueueCreativeRequest;

const STATUS_CONFIG = {
  draft: {
    label: "Rascunho",
    shortLabel: "Draft",
    color: "bg-brand-gray-700/50 text-brand-gray-400 border-brand-gray-600/50",
    icon: Clock4,
    description: "Salvo como rascunho",
    gradient: "from-brand-gray-700 to-brand-gray-800"
  },
  queued: {
    label: "Na Fila",
    shortLabel: "Queued",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: Clock,
    description: "Aguardando processamento",
    gradient: "from-blue-500/20 to-blue-600/20"
  },
  processing: {
    label: "Processando",
    shortLabel: "Processing",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    icon: Loader2,
    description: "IA gerando criativo...",
    gradient: "from-yellow-500/20 to-amber-500/20"
  },
  completed: {
    label: "Concluído",
    shortLabel: "Done",
    color: "bg-brand-neon-green/20 text-brand-neon-green border-brand-neon-green/30",
    icon: CheckCircle2,
    description: "Criativo gerado com sucesso",
    gradient: "from-brand-neon-green/20 to-green-500/20"
  },
  failed: {
    label: "Falhou",
    shortLabel: "Failed",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: XOctagon,
    description: "Erro durante o processamento",
    gradient: "from-red-500/20 to-red-600/20"
  }
};

// Modal de Preview Premium
function CreativePreviewModal({ creative, isOpen, onClose }: {
  creative: QueueCreative;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const statusConfig = STATUS_CONFIG[creative.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;

  const handleDownload = async () => {
    if (!creative.result_url) return;

    setIsDownloading(true);
    try {
      // Fetch da imagem como blob
      const response = await fetch(creative.result_url);
      if (!response.ok) throw new Error('Falha ao baixar imagem');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Criar link de download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${creative.title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpar URL do blob
      window.URL.revokeObjectURL(url);

      toast.success("Download concluído!", {
        description: `${creative.title} foi baixado com sucesso`
      });
    } catch (error) {
      toast.error("Erro no download", {
        description: "Não foi possível baixar o criativo"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyUrl = () => {
    if (creative.result_url) {
      navigator.clipboard.writeText(creative.result_url);
      toast.success("URL copiada!", {
        description: "Link do criativo copiado para a área de transferência"
      });
    }
  };

  const handleShare = () => {
    if (navigator.share && creative.result_url) {
      navigator.share({
        title: creative.title,
        text: `Confira este criativo: ${creative.title}`,
        url: creative.result_url,
      });
    } else {
      handleCopyUrl();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-brand-gray-900/95 border-brand-gray-700/50 backdrop-blur-xl">
        <div className="flex flex-col h-full">

          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b border-brand-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl border flex items-center justify-center",
                  "bg-gradient-to-br", statusConfig.gradient,
                  statusConfig.color.includes('border-') ? statusConfig.color.split(' ').find(c => c.includes('border-')) : "border-brand-gray-700"
                )}>
                  <statusConfig.icon className={cn(
                    "w-6 h-6",
                    creative.status === 'completed' && 'text-brand-neon-green',
                    creative.status === 'failed' && 'text-red-400',
                    creative.status === 'processing' && 'text-yellow-400',
                    creative.status === 'queued' && 'text-blue-400',
                    creative.status === 'draft' && 'text-brand-gray-400'
                  )} />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-white">
                    {creative.title}
                  </DialogTitle>
                  <DialogDescription className="text-brand-gray-400 mt-1">
                    {FORMAT_LABELS[creative.format as keyof typeof FORMAT_LABELS]} • {statusConfig.label}
                  </DialogDescription>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {creative.result_url && (
                  <>
                    <Button
                      onClick={handleShare}
                      className="btn-ghost h-10 w-10 p-0"
                      title="Compartilhar"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>

                    <Button
                      onClick={handleCopyUrl}
                      className="btn-ghost h-10 w-10 p-0"
                      title="Copiar URL"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>

                    <Button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="btn-neon h-10 px-4"
                    >
                      {isDownloading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      {isDownloading ? "Baixando..." : "Download"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">

            {/* Image Preview */}
            <div className="flex-1 flex items-center justify-center bg-brand-gray-900/50 relative">
              {creative.result_url ? (
                <div className="relative max-w-full max-h-full">
                  {isImageLoading && !imageError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="w-8 h-8 text-brand-neon-green animate-spin" />
                        <span className="text-brand-gray-400">Carregando imagem...</span>
                      </div>
                    </div>
                  )}

                  {imageError ? (
                    <div className="flex flex-col items-center space-y-4 p-8">
                      <AlertCircle className="w-16 h-16 text-red-400" />
                      <div className="text-center">
                        <h3 className="text-white font-semibold mb-2">Erro ao carregar imagem</h3>
                        <p className="text-brand-gray-400">Não foi possível exibir o criativo</p>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={creative.result_url}
                      alt={creative.title}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                      onLoad={() => setIsImageLoading(false)}
                      onError={() => {
                        setIsImageLoading(false);
                        setImageError(true);
                      }}
                      style={{ display: isImageLoading ? 'none' : 'block' }}
                    />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4 p-8">
                  <FileImage className="w-16 h-16 text-brand-gray-600" />
                  <div className="text-center">
                    <h3 className="text-white font-semibold mb-2">Preview não disponível</h3>
                    <p className="text-brand-gray-400">O criativo ainda não foi processado</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar com detalhes */}
            <div className="w-80 bg-brand-gray-900/80 border-l border-brand-gray-700/50 p-6 overflow-y-auto">
              <div className="space-y-6">

                {/* Status */}
                <div>
                  <h4 className="text-white font-semibold mb-3">Status</h4>
                  <Badge className={cn("text-sm", statusConfig.color)}>
                    {statusConfig.label}
                  </Badge>
                  <p className="text-brand-gray-400 text-sm mt-2">
                    {statusConfig.description}
                  </p>
                </div>

                {/* Prompt */}
                <div>
                  <h4 className="text-white font-semibold mb-3">Prompt</h4>
                  <p className="text-brand-gray-400 text-sm leading-relaxed">
                    {creative.prompt}
                  </p>
                </div>

                {/* Detalhes técnicos */}
                <div>
                  <h4 className="text-white font-semibold mb-3">Detalhes</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-brand-gray-500">Formato:</span>
                      <span className="text-white">
                        {FORMAT_LABELS[creative.format as keyof typeof FORMAT_LABELS]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-gray-500">Criado:</span>
                      <span className="text-white">
                        {new Date(creative.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-gray-500">Atualizado:</span>
                      <span className="text-white">
                        {new Date(creative.updated_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Jobs info */}
                {creative.queue_jobs && creative.queue_jobs.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-3">Processamento</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-brand-gray-500">Tentativas:</span>
                        <span className="text-white">{creative.queue_jobs[0].attempts}</span>
                      </div>
                      {creative.queue_jobs[0].processing_started_at && (
                        <div className="flex justify-between">
                          <span className="text-brand-gray-500">Iniciado:</span>
                          <span className="text-white">
                            {new Date(creative.queue_jobs[0].processing_started_at).toLocaleTimeString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Error details */}
                {creative.status === 'failed' && creative.error_message && (
                  <div>
                    <h4 className="text-red-400 font-semibold mb-3 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Erro
                    </h4>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="text-red-300 text-sm leading-relaxed">
                        {creative.error_message}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function QueuePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [previewCreative, setPreviewCreative] = useState<QueueCreative | null>(null);
  const [isFixingStatuses, setIsFixingStatuses] = useState(false);
  const [autoFixCount, setAutoFixCount] = useState(0);

  // Estado dos dados
  const [creatives, setCreatives] = useState<QueueCreative[]>([]);
  const [creativeRequests, setCreativeRequests] = useState<QueueCreativeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Efeito para buscar o ID do usuário uma vez
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    fetchUser();
  }, []);

  // Função para carregar dados (sempre busca todos os dados)
  const loadData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);

      // 🆕 Sempre buscar TODOS os dados, filtro será client-side
      const [creativesData, requestsData] = await Promise.all([
        getUserCreatives({}), // Sem filtros - busca tudo
        getUserCreativeRequests({} as any), // Sem filtros - busca tudo
      ]);

      setCreatives(creativesData as any);
      setCreativeRequests(requestsData as any);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, []); // 🆕 Removido filterStatus da dependência

  // Função de refresh
  const forceRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData(false);
    setIsRefreshing(false);
  }, [loadData]);

  // 🆕 Handler para mudanças de status de criativos
  const onCreativeStatusChange = useCallback((creativeId: string, requestId: string | null, newStatus: string) => {
    if (requestId) {
      console.log(`🔔 Creative ${creativeId} in request ${requestId} changed to ${newStatus}`);
      toast.info(`Criativo atualizado`, {
        description: `Status alterado para ${newStatus}`,
        duration: 3000,
      });
    }
  }, []);

  // 🆕 Handler para execução automática de correções
  const onAutoFixExecuted = useCallback((correctedCount: number) => {
    console.log(`🤖 Auto-fix executed: ${correctedCount} corrections`);
    setAutoFixCount(prev => prev + correctedCount);

    if (correctedCount > 0) {
      toast.success(`${correctedCount} status corrigido(s) automaticamente`, {
        description: "Sistema de auto-correção ativo",
        duration: 4000,
        action: {
          label: "Visualizar",
          onClick: () => forceRefresh()
        }
      });
    }
  }, [forceRefresh]);

  // Memoize handlers and config to prevent re-renders
  const onUpdate = useCallback(() => {
    console.log('🔄 Realtime update - refreshing data');
    forceRefresh();
  }, [forceRefresh]);

  const realtimeHandlers = useMemo(() => ({
    onUpdate,
    onCreativeStatusChange,
    onAutoFixExecuted
  }), [onUpdate, onCreativeStatusChange, onAutoFixExecuted]);

  const realtimeConfig = useMemo(() => ({
    enabled: true,
    enableDebugLogs: true,
    enableSmartStatusUpdates: true,
    enableAutoFix: true,
    autoFixInterval: 5
  }), []);

  // Hook realtime com props estáveis
  const { isConnected, executeAutoFix } = useSupabaseRealtime(userId, realtimeHandlers, realtimeConfig);

  // Carregar dados iniciais
  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId, loadData]);

  // 🆕 Calcular estatísticas incluindo requests (status agregado)
  const stats = useMemo(() => {
    // Criativos individuais
    const individualCreatives = creatives;

    // Criativos de requests (para contar no total geral)
    const requestCreatives = creativeRequests.flatMap(r => r.creatives);

    // Total de criativos individuais
    const totalCreatives = individualCreatives.length + requestCreatives.length;

    // Total de "items" (criativos individuais + requests como items únicos)
    const totalItems = individualCreatives.length + creativeRequests.length;

    return {
      total: totalCreatives, // Contagem total de criativos
      totalItems: totalItems, // Contagem total de items na interface

      // Contagens por status (incluindo criativos de requests)
      queued: individualCreatives.filter(c => c.status === 'queued').length +
             requestCreatives.filter(c => c.status === 'queued').length,
      processing: individualCreatives.filter(c => c.status === 'processing').length +
                 requestCreatives.filter(c => c.status === 'processing').length +
                 creativeRequests.filter(r => r.status === 'processing').length, // requests em processamento
      completed: individualCreatives.filter(c => c.status === 'completed').length +
                requestCreatives.filter(c => c.status === 'completed').length +
                creativeRequests.filter(r => r.status === 'completed').length, // requests completos
      failed: individualCreatives.filter(c => c.status === 'failed').length +
             requestCreatives.filter(c => c.status === 'failed').length +
             creativeRequests.filter(r => r.status === 'failed').length, // requests falhados
      draft: individualCreatives.filter(c => c.status === 'draft').length +
            requestCreatives.filter(c => c.status === 'draft').length,

      // Contagens específicas de requests por status
      requests: {
        pending: creativeRequests.filter(r => r.status === 'pending').length,
        processing: creativeRequests.filter(r => r.status === 'processing').length,
        completed: creativeRequests.filter(r => r.status === 'completed').length,
        partial: creativeRequests.filter(r => r.status === 'partial').length,
        failed: creativeRequests.filter(r => r.status === 'failed').length
      }
    };
  }, [creatives, creativeRequests]);

  // 🆕 Type guard para distinguir entre Creative e CreativeRequest
  const isCreativeRequest = (item: QueueItem): item is QueueCreativeRequest => {
    return 'requested_formats' in item && Array.isArray((item as any).creatives);
  };

  // 🆕 Função para verificar se um item corresponde ao filtro
  const itemMatchesFilter = (item: QueueItem): boolean => {
    if (filterStatus === "all") return true;

    if (isCreativeRequest(item)) {
      // Para requests, mapeia status especiais para filtros
      switch (filterStatus) {
        case "processing":
          return item.status === 'processing' || item.status === 'pending';
        case "completed":
          return item.status === 'completed' || item.status === 'partial';
        case "failed":
          return item.status === 'failed';
        case "queued":
          return false; // Requests não têm status 'queued'
        case "draft":
          return false; // Requests não têm status 'draft'
        default:
          return item.status === filterStatus;
      }
    } else {
      // Para criativos individuais, verifica o status direto
      return item.status === filterStatus;
    }
  };

  // 🆕 Função unificada para combinar criativos individuais e requests
  const getAllItems = (): QueueItem[] => {
    const items: QueueItem[] = [];

    // Adiciona requests (múltiplos formatos) - já filtrados
    const filteredRequestsForUnified = creativeRequests.filter(itemMatchesFilter);
    items.push(...filteredRequestsForUnified);

    // Adiciona criativos individuais (que não pertencem a nenhum request) - já filtrados
    const filteredCreativesForUnified = creatives.filter(itemMatchesFilter);
    items.push(...filteredCreativesForUnified);

    // Ordena por data de criação (mais recente primeiro)
    return items.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
  };

  const allItems = getAllItems();

  // Reprocessar criativo
  const handleReprocess = async (creativeId: string) => {
    try {
      await reprocessCreative(creativeId);
      toast.success("Criativo adicionado à fila novamente");
      if (forceRefresh) forceRefresh();
    } catch (error: any) {
      toast.error("Erro ao reprocessar", {
        description: error.message
      });
    }
  };

  // Deletar criativo
  const handleDelete = async (creativeId: string) => {
    try {
      await deleteCreative(creativeId);
      toast.success("Criativo removido");
      if (forceRefresh) forceRefresh();
    } catch (error: any) {
      toast.error("Erro ao remover", {
        description: error.message
      });
    }
  };

  // Processar fila
  const handleProcessQueue = async () => {
    setIsProcessingQueue(true);
    try {
      toast.info("Acionando processamento da fila...", {
        description: "Iniciando processamento de criativos pendentes"
      });
      await triggerQueueProcessing();
      toast.success("Processamento acionado com sucesso!", {
        description: "A fila será processada em instantes"
      });
      setTimeout(() => { if (forceRefresh) forceRefresh(); }, 2000);
    } catch (error: any) {
      toast.error("Erro ao acionar processamento", {
        description: error.message
      });
    } finally {
      setIsProcessingQueue(false);
    }
  };

  // Download inteligente
  const handleSmartDownload = async (creative: QueueCreative) => {
    if (!creative.result_url) return;

    try {
      toast.info("Iniciando download...", {
        description: `Baixando ${creative.title}`
      });

      // Fetch da imagem como blob
      const response = await fetch(creative.result_url);
      if (!response.ok) throw new Error('Falha ao baixar imagem');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Criar link de download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${creative.title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpar URL do blob
      window.URL.revokeObjectURL(url);

      toast.success("Download concluído!", {
        description: `${creative.title} foi baixado com sucesso`
      });
    } catch (error) {
      toast.error("Erro no download", {
        description: "Não foi possível baixar o criativo"
      });
    }
  };

  // Calcular progresso baseado no status
  const getProgress = (creative: QueueCreative) => {
    switch (creative.status) {
      case 'draft': return 0;
      case 'queued': return 25;
      case 'processing': return 75;
      case 'completed': return 100;
      case 'failed': return 100;
      default: return 0;
    }
  };

  const successRate = stats.total > 0 ? Math.round((stats.completed / (stats.completed + stats.failed)) * 100) || 0 : 0;
  const activeJobs = stats.queued + stats.processing;

  // 🆕 Handler para correção manual de status (agora como backup)
  const handleFixStatuses = async () => {
    setIsFixingStatuses(true);
    try {
      // Usa a nova função de auto-fix via Edge Function
      const result = await executeAutoFix();

      if (result.correctedCount > 0) {
        toast.success(`${result.correctedCount} solicitação(ões) corrigida(s)!`, {
          description: "Correção manual executada com sucesso"
        });

        // Log detalhado no console para debug
        console.log('🔧 Manual fix applied:', result);

        // Refresh data
        forceRefresh();
      } else {
        toast.info("Nenhuma correção necessária", {
          description: "Todos os status estão corretos"
        });
      }
    } catch (error: any) {
      toast.error("Erro ao corrigir status", {
        description: error.message
      });
    } finally {
      setIsFixingStatuses(false);
    }
  };

  if (isLoading) {
  return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-brand-neon-green/20 rounded-full blur-xl animate-glow-pulse"></div>
            <div className="relative w-20 h-20 border-4 border-brand-neon-green/20 border-t-brand-neon-green rounded-full animate-spin"></div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">Carregando Dashboard</h3>
            <p className="text-brand-gray-400">Sincronizando dados da fila...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header Premium */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-neon-green/20 rounded-2xl blur-xl animate-glow-pulse"></div>
                <div className="relative bg-gradient-to-br from-brand-neon-green via-brand-neon-green to-brand-neon-green-dark p-4 rounded-2xl shadow-lg">
                  <Activity className="w-7 h-7 text-brand-black" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  <Timer className="w-5 h-5 mr-3 text-brand-neon-green" />
                  Fila de Processamento
                </h1>
                <div className="text-brand-gray-400 text-lg mt-1 flex items-center">
                  Acompanhe o status dos seus criativos em tempo real
                  <span className="ml-3 flex items-center">
                    <div className={cn(
                      "w-2 h-2 rounded-full animate-pulse mr-2",
                      isConnected ? "bg-brand-neon-green" : "bg-red-500"
                    )}></div>
                    {isConnected ? 'Sistema Inteligente Ativo' : 'Reconectando...'}
                    {autoFixCount > 0 && (
                      <span className="ml-2 px-2 py-1 bg-brand-neon-green/20 text-brand-neon-green text-xs rounded-full">
                        {autoFixCount} correções automáticas
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleFixStatuses}
                disabled={isFixingStatuses}
                className="btn-ghost border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                title="Correção manual de backup - o sistema já corrige automaticamente"
              >
                {isFixingStatuses ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <AlertTriangle className="w-4 h-4 mr-2" />
                )}
                {isFixingStatuses ? "Corrigindo..." : "Backup Fix"}
              </Button>

              <Button onClick={forceRefresh} disabled={isRefreshing} className="btn-ghost">
                <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
                Atualizar
              </Button>

              <Button onClick={handleProcessQueue} disabled={isProcessingQueue} className="btn-neon">
                {isProcessingQueue ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isProcessingQueue ? "Processando..." : "Processar Fila"}
              </Button>
            </div>
          </div>



          {/* Dashboard de Métricas */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            {/* Total */}
            <Card className="card-glass-intense border-brand-gray-700/50 hover:border-brand-neon-green/30 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                    <div className="text-brand-gray-400 text-sm">Total</div>
                  </div>
                  <FileImage className="w-8 h-8 text-brand-gray-500" />
                </div>
              </CardContent>
            </Card>

            {/* Ativos */}
            <Card className="card-glass-intense border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">{activeJobs}</div>
                    <div className="text-brand-gray-400 text-sm">Ativos</div>
                  </div>
                  <Activity className="w-8 h-8 text-yellow-400" />
                </div>
                {activeJobs > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-brand-gray-800 rounded-full h-1.5">
                      <div
                        className="bg-yellow-400 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((activeJobs / stats.total) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Processando */}
            <Card className="card-glass-intense border-blue-500/30 hover:border-blue-400/50 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{stats.processing}</div>
                    <div className="text-brand-gray-400 text-sm">Processando</div>
                  </div>
                  <Loader2 className={cn("w-8 h-8 text-blue-400", stats.processing > 0 && "animate-spin")} />
                </div>
              </CardContent>
            </Card>

            {/* Concluídos */}
            <Card className="card-glass-intense border-brand-neon-green/30 hover:border-brand-neon-green/50 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-brand-neon-green">{stats.completed}</div>
                    <div className="text-brand-gray-400 text-sm">Concluídos</div>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-brand-neon-green" />
                </div>
              </CardContent>
            </Card>

            {/* Taxa de Sucesso */}
            <Card className="card-glass-intense border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-400">{successRate}%</div>
                    <div className="text-brand-gray-400 text-sm">Sucesso</div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            {/* Falharam */}
            <Card className="card-glass-intense border-red-500/30 hover:border-red-400/50 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
                    <div className="text-brand-gray-400 text-sm">Falharam</div>
                  </div>
                  <XOctagon className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros Premium */}
          <Card className="card-glass-intense border-brand-gray-700/50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-brand-gray-400" />
                    <span className="text-white font-medium text-sm">Filtros:</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "all", label: "Todos", count: stats.totalItems },
                      { key: "queued", label: "Na Fila", count: stats.queued },
                      {
                        key: "processing",
                        label: "Processando",
                        count: stats.processing + stats.requests.pending // Inclui pending
                      },
                      {
                        key: "completed",
                        label: "Concluídos",
                        count: stats.completed + stats.requests.partial // Inclui partial
                      },
                      { key: "failed", label: "Falharam", count: stats.failed },
                      { key: "draft", label: "Rascunhos", count: stats.draft }
                    ].map(filter => (
                      <Button
                        key={filter.key}
                        onClick={() => setFilterStatus(filter.key)}
                        className={cn(
                          "h-9 px-4 text-sm transition-all duration-300",
                          filterStatus === filter.key
                            ? "bg-brand-neon-green/20 text-brand-neon-green border-brand-neon-green/30 hover:bg-brand-neon-green/30"
                            : "btn-ghost hover:bg-brand-gray-700/50"
                        )}
                      >
                        {filter.label}
                        {filter.count > 0 && (
                          <Badge className="ml-2 bg-brand-gray-700/50 text-white text-xs px-1.5 py-0.5">
                            {filter.count}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-brand-gray-400 text-sm">
                    {allItems.length} {allItems.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista Unificada de Criativos */}
        <div className="space-y-4">
          {allItems.length === 0 ? (
            <Card className="card-glass-intense border-brand-gray-700/50">
              <CardContent className="p-16 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-brand-gray-600/20 rounded-full blur-xl"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-brand-gray-700 to-brand-gray-800 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="w-10 h-10 text-brand-gray-500" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  {filterStatus === "all"
                    ? "Nenhum criativo encontrado"
                    : `Nenhum criativo ${STATUS_CONFIG[filterStatus as keyof typeof STATUS_CONFIG]?.label.toLowerCase() || filterStatus}`
                  }
                </h3>
                <p className="text-brand-gray-400 text-lg max-w-md mx-auto">
                  {filterStatus === "all"
                    ? "Você ainda não criou nenhum criativo. Que tal começar criando seu primeiro?"
                    : `Não há criativos com status "${STATUS_CONFIG[filterStatus as keyof typeof STATUS_CONFIG]?.label || filterStatus}" no momento.`
                  }
                </p>
                {filterStatus === "all" && (
                  <Button className="btn-neon mt-6" onClick={() => window.location.href = '/new'}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Criar Primeiro Criativo
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* 🆕 Renderização Unificada */}
              {allItems.map((item) => (
                <UnifiedCreativeCard
                  key={item.id}
                  item={item}
                  onUpdate={forceRefresh}
                  onPreview={setPreviewCreative}
                />
              ))}
            </>
          )}
        </div>

        {/* Footer Info */}
        {allItems.length > 0 && (
          <Card className="card-glass-intense border-brand-gray-700/50 mt-8">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-6 text-sm text-brand-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-brand-neon-green rounded-full animate-pulse"></div>
                  <span>Atualização automática a cada 5 segundos</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Dashboard em tempo real</span>
                </div>
                <span>•</span>
                <span>{allItems.length} de {stats.total} criativos exibidos</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview Modal */}
        {previewCreative && (
          <CreativePreviewModal
            creative={previewCreative}
            isOpen={!!previewCreative}
            onClose={() => setPreviewCreative(null)}
          />
        )}
      </div>
    </div>
  );
}