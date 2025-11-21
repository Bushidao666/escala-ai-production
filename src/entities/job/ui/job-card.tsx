"use client";

import { useState } from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { Button } from "@/shared/ui/button";
import { 
  FileImage,
  Clock,
  Loader2,
  CheckCircle2,
  XOctagon,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Trash2,
  Eye,
  Download,
  Clock4,
  AlertCircle,
  Calendar,
  Timer,
  Activity
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { FORMAT_LABELS } from "@/modules/creative/dto/creative.schema";
import { reprocessCreative, deleteCreative, reprocessCreativeRequest, deleteCreativeRequest } from "../new/actions";
import { Tables } from '@/shared/infra/supabase/supabase.types';

// Types
type Creative = Tables<'creatives'> & {
  queue_jobs?: Tables<'queue_jobs'>[];
};

type CreativeRequest = Tables<'creative_requests'> & {
  creatives: Creative[];
};

// Props do componente unificado
interface UnifiedCreativeCardProps {
  item: Creative | CreativeRequest;
  onUpdate: () => void;
  onPreview?: (creative: Creative) => void;
}

// Type guard para distinguir entre Creative e CreativeRequest
function isCreativeRequest(item: Creative | CreativeRequest): item is CreativeRequest {
  return 'requested_formats' in item && Array.isArray((item as any).creatives);
}

// Configuração de status para requests
const REQUEST_STATUS_CONFIG = {
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

// Configuração de status para criativos individuais
const CREATIVE_STATUS_CONFIG = {
  draft: {
    label: "Rascunho",
    color: "bg-brand-gray-700/50 text-brand-gray-400 border-brand-gray-600/50",
    icon: Clock4,
    gradient: "from-brand-gray-700 to-brand-gray-800"
  },
  queued: {
    label: "Na Fila",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: Clock,
    gradient: "from-blue-500/20 to-blue-600/20"
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
  failed: {
    label: "Falhou",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: XOctagon,
    gradient: "from-red-500/20 to-red-600/20"
  }
};

export function UnifiedCreativeCard({ item, onUpdate, onPreview }: UnifiedCreativeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Determina se é um request ou criativo individual
  const isRequest = isCreativeRequest(item);

  // 🎯 RENDERIZAÇÃO PARA CREATIVE REQUEST (Múltiplos Formatos)
  if (isRequest) {
    const request = item as CreativeRequest;
    const currentStatus = request.status || 'pending';
    const statusConfig = REQUEST_STATUS_CONFIG[currentStatus];
    const StatusIcon = statusConfig.icon;
    
    // 🆕 CÁLCULOS DETALHADOS DE PROGRESSO
    const completedCount = request.creatives.filter(c => c.status === 'completed').length;
    const processingCount = request.creatives.filter(c => c.status === 'processing').length;
    const queuedCount = request.creatives.filter(c => c.status === 'queued').length;
    const failedCount = request.creatives.filter(c => c.status === 'failed').length;
    const totalCount = request.creatives.length;
    
    // Progresso baseado em completados + processando parcialmente + falhados
    const progressValue = totalCount > 0 ? 
      ((completedCount * 100) + (processingCount * 75) + (failedCount * 100)) / (totalCount * 100) * 100 : 0;
    
    // 🎯 STATUS DETALHADO PARA MELHOR UX
    const getDetailedStatus = () => {
      if (totalCount === 0) return { label: "Vazio", description: "Nenhum criativo" };
      
      if (completedCount === totalCount) {
        return { 
          label: "Concluído", 
          description: `${completedCount}/${totalCount} criativos gerados`,
          color: "text-brand-neon-green"
        };
      }
      
      if (failedCount === totalCount) {
        return { 
          label: "Falhou", 
          description: `${failedCount}/${totalCount} criativos falharam`,
          color: "text-red-400"
        };
      }
      
      if (completedCount + failedCount === totalCount) {
        return { 
          label: "Parcial", 
          description: `${completedCount}/${totalCount} concluídos, ${failedCount} falharam`,
          color: "text-blue-400"
        };
      }
      
      // Em progresso
      const finishedCount = completedCount + failedCount;
      if (processingCount > 0) {
        return { 
          label: "Processando", 
          description: `${completedCount}/${totalCount} concluídos, ${processingCount} processando`,
          color: "text-yellow-400"
        };
      }
      
      if (finishedCount > 0) {
        return { 
          label: "Processando", 
          description: `${completedCount}/${totalCount} concluídos, ${queuedCount} na fila`,
          color: "text-yellow-400"
        };
      }
      
      return { 
        label: "Na Fila", 
        description: `${totalCount} criativos aguardando processamento`,
        color: "text-blue-400"
      };
    };
    
    const detailedStatus = getDetailedStatus();

    const handleReprocess = async () => {
      setIsActionLoading(true);
      try {
        await reprocessCreativeRequest(request.id);
        toast.success("Solicitação enviada para reprocessamento!");
        onUpdate();
      } catch (error: any) {
        toast.error("Erro ao reprocessar", { description: error.message });
      } finally {
        setIsActionLoading(false);
      }
    };

    const handleDelete = async () => {
      if (confirm(`Tem certeza que deseja excluir "${request.title}" e todos os seus criativos?`)) {
        setIsActionLoading(true);
        try {
          await deleteCreativeRequest(request.id);
          toast.success("Solicitação excluída com sucesso!");
          onUpdate();
        } catch (error: any) {
          toast.error("Erro ao excluir", { description: error.message });
        } finally {
          setIsActionLoading(false);
        }
      }
    };

    return (
      <Card className="card-glass-intense border-brand-gray-700/50 hover:border-brand-neon-green/30 transition-all duration-500 group">
        <CardContent className="p-6">
          {/* Header do Request */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                {/* Status Icon com gradiente */}
                <div className="relative">
                  <div className={cn(
                    "absolute inset-0 rounded-xl blur-md transition-all duration-300",
                    currentStatus === 'completed' && "bg-brand-neon-green/20",
                    currentStatus === 'processing' && "bg-yellow-500/20",
                    currentStatus === 'failed' && "bg-red-500/20",
                    currentStatus === 'partial' && "bg-blue-500/20"
                  )}></div>
                  <div className={cn(
                    "relative w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-300",
                    "bg-gradient-to-br", statusConfig.gradient,
                    statusConfig.color
                  )}>
                    <StatusIcon className={cn(
                      "w-6 h-6 transition-all duration-300",
                      currentStatus === 'processing' && 'animate-spin'
                    )} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-white truncate group-hover:text-brand-neon-green transition-colors duration-300">
                    {request.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={cn("text-xs font-medium", statusConfig.color)}>
                      <StatusIcon className={cn("w-3 h-3 mr-1", 
                        (processingCount > 0) && 'animate-spin'
                      )} />
                      {detailedStatus.label}
                    </Badge>
                    
                    {/* Progresso Detalhado */}
                    {processingCount > 0 && (
                      <Badge className="text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                        {processingCount} processando
                      </Badge>
                    )}
                    
                    {completedCount > 0 && (
                      <Badge className="text-xs bg-brand-neon-green/10 text-brand-neon-green border-brand-neon-green/30">
                        {completedCount}/{totalCount} ✓
                      </Badge>
                    )}
                    
                    <span className="text-brand-gray-400 text-sm">
                      • {totalCount} formato{totalCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {/* Descrição Detalhada */}
                  <p className={cn("text-sm mt-1", detailedStatus.color)}>
                    {detailedStatus.description}
                  </p>
                </div>
              </div>

              {/* Formatos solicitados */}
              <div className="flex items-center flex-wrap gap-2 mb-4">
                {request.requested_formats.map(format => (
                  <Badge key={format} className="bg-brand-gray-700/50 text-brand-gray-300 border-brand-gray-600/50 text-xs">
                    {FORMAT_LABELS[format as keyof typeof FORMAT_LABELS] || format}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {(failedCount > 0) && (
                <Button onClick={handleReprocess} disabled={isActionLoading} className="btn-ghost h-9 px-3">
                  {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  <span className="ml-2 text-xs">Reprocessar</span>
                </Button>
              )}
              <Button onClick={handleDelete} disabled={isActionLoading} className="btn-ghost text-red-400 hover:text-red-400 hover:bg-red-500/10 h-9 w-9 p-0">
                {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </Button>
              <Button onClick={() => setIsExpanded(!isExpanded)} className="btn-ghost h-9 w-9 p-0">
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Barra de Progresso */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-brand-gray-400 mb-2">
              <span className="font-medium">{completedCount} de {totalCount} concluídos</span>
              <span className="font-mono">{Math.round(progressValue)}%</span>
            </div>
            <Progress value={progressValue} className="h-2 bg-brand-gray-800/50" />
          </div>

          {/* Grid de Criativos (Expansível) */}
          {isExpanded && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {request.creatives.map(creative => {
                const CreativeStatusIcon = CREATIVE_STATUS_CONFIG[creative.status as keyof typeof CREATIVE_STATUS_CONFIG]?.icon || Clock;
                return (
                  <div key={creative.id} className="group/item relative rounded-lg border border-brand-gray-700 overflow-hidden aspect-square flex flex-col items-center justify-center bg-brand-gray-800/50">
                    {creative.status === 'completed' && creative.result_url ? (
                      <img 
                        src={creative.result_url} 
                        alt={creative.format || 'Creative'} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/item:scale-105" 
                      />
                    ) : (
                      <div className="flex flex-col items-center text-brand-gray-500">
                        <CreativeStatusIcon className={cn("w-8 h-8", creative.status === 'processing' && 'animate-spin')} />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-3 flex flex-col justify-end">
                      <div className="flex items-center justify-between">
                        <Badge className="text-xs bg-black/50 text-white backdrop-blur-sm border-white/20">
                          {FORMAT_LABELS[(creative.format || 'post_1080x1080') as keyof typeof FORMAT_LABELS]}
                        </Badge>
                        <Badge className={cn("text-xs bg-black/50 backdrop-blur-sm border-white/20", 
                          creative.status === 'completed' && 'text-green-400',
                          creative.status === 'failed' && 'text-red-400',
                        )}>
                          {CREATIVE_STATUS_CONFIG[creative.status as keyof typeof CREATIVE_STATUS_CONFIG]?.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions overlay */}
                    {creative.status === 'completed' && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 space-x-2">
                        <Button 
                          className="btn-ghost h-9 w-9 p-0 text-white hover:text-brand-neon-green" 
                          onClick={() => onPreview?.(creative)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button className="btn-ghost h-9 w-9 p-0 text-white hover:text-brand-neon-green">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    
                    {/* Error message overlay */}
                    {creative.status === 'failed' && creative.error_message && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">
                        <p className="text-red-400 text-xs text-center leading-tight">
                          {creative.error_message}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // 🎯 RENDERIZAÇÃO PARA CRIATIVO INDIVIDUAL (Formato Único)
  const creative = item as Creative;
  const statusConfig = CREATIVE_STATUS_CONFIG[creative.status as keyof typeof CREATIVE_STATUS_CONFIG] || CREATIVE_STATUS_CONFIG.draft;
  const StatusIcon = statusConfig.icon;
  const latestJob = creative.queue_jobs?.[0];

  const getProgress = () => {
    switch (creative.status) {
      case 'draft': return 0;
      case 'queued': return 25;
      case 'processing': return 75;
      case 'completed': return 100;
      case 'failed': return 100;
      default: return 0;
    }
  };

  // 🆕 STATUS DETALHADO PARA CRIATIVOS INDIVIDUAIS
  const getIndividualDetailedStatus = () => {
    switch (creative.status) {
      case 'completed':
        return {
          label: statusConfig.label,
          description: "Criativo gerado com sucesso",
          color: "text-brand-neon-green"
        };
      case 'processing':
        return {
          label: statusConfig.label,
          description: "IA gerando criativo...",
          color: "text-yellow-400"
        };
      case 'queued':
        return {
          label: statusConfig.label,
          description: "Aguardando processamento",
          color: "text-blue-400"
        };
      case 'failed':
        return {
          label: statusConfig.label,
          description: creative.error_message || "Erro durante o processamento",
          color: "text-red-400"
        };
      case 'draft':
        return {
          label: statusConfig.label,
          description: "Salvo como rascunho",
          color: "text-brand-gray-400"
        };
      default:
        return {
          label: statusConfig.label,
          description: "Status desconhecido",
          color: "text-brand-gray-400"
        };
    }
  };

  const individualDetailedStatus = getIndividualDetailedStatus();

  const handleReprocess = async () => {
    setIsActionLoading(true);
    try {
      await reprocessCreative(creative.id);
      toast.success("Criativo adicionado à fila novamente");
      onUpdate();
    } catch (error: any) {
      toast.error("Erro ao reprocessar", { description: error.message });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Tem certeza que deseja excluir "${creative.title}"?`)) {
      setIsActionLoading(true);
      try {
        await deleteCreative(creative.id);
        toast.success("Criativo removido");
        onUpdate();
      } catch (error: any) {
        toast.error("Erro ao remover", { description: error.message });
      } finally {
        setIsActionLoading(false);
      }
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
    } catch (error) {
      toast.error("Erro no download", {
        description: "Não foi possível baixar o criativo"
      });
    }
  };

  return (
    <Card className="card-glass-intense border-brand-gray-700/50 hover:border-brand-neon-green/30 transition-all duration-500 group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          
          {/* Informações Principais */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start space-x-4">
              
              {/* Status Icon */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className={cn(
                    "absolute inset-0 rounded-xl blur-md transition-all duration-300",
                    creative.status === 'completed' && "bg-brand-neon-green/20",
                    creative.status === 'processing' && "bg-yellow-500/20",
                    creative.status === 'failed' && "bg-red-500/20",
                    creative.status === 'queued' && "bg-blue-500/20"
                  )}></div>
                  <div className={cn(
                    "relative w-14 h-14 rounded-xl border flex items-center justify-center transition-all duration-300",
                    "bg-gradient-to-br", statusConfig.gradient,
                    statusConfig.color
                  )}>
                    <StatusIcon className={cn(
                      "w-7 h-7 transition-all duration-300",
                      creative.status === 'processing' && 'animate-spin'
                    )} />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                
                {/* Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-xl font-semibold text-white truncate group-hover:text-brand-neon-green transition-colors duration-300">
                    {creative.title}
                  </h3>
                  <Badge className={cn("text-sm", statusConfig.color)}>
                    <StatusIcon className={cn("w-3 h-3 mr-1", 
                      creative.status === 'processing' && 'animate-spin'
                    )} />
                    {individualDetailedStatus.label}
                  </Badge>
                  <Badge className="bg-brand-gray-700/50 text-brand-gray-300 border-brand-gray-600/50 text-xs">
                    {FORMAT_LABELS[(creative.format || 'post_1080x1080') as keyof typeof FORMAT_LABELS] || creative.format || 'Formato'}
                  </Badge>
                </div>

                {/* Status Detalhado */}
                <p className={cn("text-sm mb-3", individualDetailedStatus.color)}>
                  {individualDetailedStatus.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-brand-gray-400 mb-2">
                    <span>{individualDetailedStatus.label}</span>
                    <span className="font-mono">{getProgress()}%</span>
                  </div>
                  <Progress value={getProgress()} className="h-1.5 bg-brand-gray-800/50" />
                </div>

                {/* Preview Image */}
                {creative.result_url && (
                  <div className="mb-4">
                    <img 
                      src={creative.result_url} 
                      alt={creative.title}
                      className="w-32 h-32 object-cover rounded-lg border border-brand-gray-700 cursor-pointer hover:scale-105 transition-transform duration-300"
                      onClick={() => onPreview?.(creative)}
                    />
                  </div>
                )}

                {/* Metadata */}
                <div className="text-sm text-brand-gray-400 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Criado: {new Date(creative.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  {latestJob && (
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4" />
                      <span>Tentativas: {latestJob.attempts || 0}</span>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {creative.status === 'failed' && creative.error_message && (
                  <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-red-300 text-sm">{creative.error_message}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-2">
            {creative.status === 'completed' && creative.result_url && (
              <>
                <Button onClick={() => onPreview?.(creative)} className="btn-ghost h-9 w-9 p-0">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button onClick={handleDownload} className="btn-ghost h-9 w-9 p-0">
                  <Download className="w-4 h-4" />
                </Button>
              </>
            )}
            
            {creative.status === 'failed' && (
              <Button onClick={handleReprocess} disabled={isActionLoading} className="btn-ghost h-9 w-9 p-0">
                {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              </Button>
            )}
            
            {['draft', 'failed'].includes(creative.status || '') && (
              <Button onClick={handleDelete} disabled={isActionLoading} className="btn-ghost text-red-400 hover:text-red-400 hover:bg-red-500/10 h-9 w-9 p-0">
                {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 