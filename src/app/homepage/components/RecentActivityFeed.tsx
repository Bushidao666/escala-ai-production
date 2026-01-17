'use client'

import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  User, 
  Palette, 
  CheckCircle, 
  Clock, 
  Trash2, 
  Edit3, 
  Upload, 
  Award,
  Activity,
  Calendar
} from 'lucide-react'
import { RecentActivity } from '../types'
import { cn } from '@/shared/lib/utils'

// SISTEMA DE SPACING HARMONIZADO
const SPACING = {
  xs: 2,    // 8px
  sm: 3,    // 12px
  md: 4,    // 16px
  lg: 5,    // 20px
  xl: 6,    // 24px
} as const

// SISTEMA DE HEIGHTS HARMONIZADO
const HEIGHTS = {
  activity_container: 'min-h-[200px]',     // Container principal
  header: 'h-[60px]',                      // Header compacto
  activity_item: 'h-[75px]',               // Item individual
} as const

const getActivityIcon = (action: string) => {
  switch (action) {
    case 'creative_created':
      return Palette
    case 'creative_completed':
      return CheckCircle
    case 'creative_deleted':
      return Trash2
    case 'creative_updated':
      return Edit3
    case 'upload_completed':
      return Upload
    case 'achievement_unlocked':
      return Award
    case 'profile_updated':
      return User
    default:
      return Activity
  }
}

const getActivityColor = (action: string) => {
  switch (action) {
    case 'creative_created':
      return 'text-blue-400'
    case 'creative_completed':
      return 'text-green-400'
    case 'creative_deleted':
      return 'text-red-400'
    case 'creative_updated':
      return 'text-yellow-400'
    case 'upload_completed':
      return 'text-purple-400'
    case 'achievement_unlocked':
      return 'text-brand-neon-green'
    case 'profile_updated':
      return 'text-orange-400'
    default:
      return 'text-brand-gray-400'
  }
}

const getActivityBgColor = (action: string) => {
  switch (action) {
    case 'creative_created':
      return 'bg-blue-500/10 border-blue-500/30'
    case 'creative_completed':
      return 'bg-green-500/10 border-green-500/30'
    case 'creative_deleted':
      return 'bg-red-500/10 border-red-500/30'
    case 'creative_updated':
      return 'bg-yellow-500/10 border-yellow-500/30'
    case 'upload_completed':
      return 'bg-purple-500/10 border-purple-500/30'
    case 'achievement_unlocked':
      return 'bg-brand-neon-green/10 border-brand-neon-green/30'
    case 'profile_updated':
      return 'bg-orange-500/10 border-orange-500/30'
    default:
      return 'bg-brand-gray-500/10 border-brand-gray-500/30'
  }
}

const getActionText = (action: string, metadata?: any) => {
  switch (action) {
    case 'creative_created':
      return 'Criativo iniciado'
    case 'creative_completed':
      return 'Criativo concluído'
    case 'creative_deleted':
      return 'Criativo removido'
    case 'creative_updated':
      return 'Criativo atualizado'
    case 'upload_completed':
      return 'Upload finalizado'
    case 'achievement_unlocked':
      return `Conquista desbloqueada: ${metadata?.achievement_name || 'Nova conquista'}`
    case 'profile_updated':
      return 'Perfil atualizado'
    default:
      return 'Atividade registrada'
  }
}

interface RecentActivityFeedProps {
  activities: RecentActivity[]
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className={cn(HEIGHTS.activity_container, "flex flex-col justify-center")}>
        <div className="text-center">
          <div className={cn("bg-brand-gray-800/50 rounded-lg w-fit mx-auto", `p-${SPACING.sm} mb-${SPACING.sm}`)}>
            <Activity className="w-6 h-6 text-brand-gray-500" />
          </div>
          <h3 className={cn("text-base font-semibold text-white", `mb-${SPACING.xs}`)}>
            Nenhuma atividade recente
          </h3>
          <p className="text-brand-gray-400 text-sm leading-tight">
            Suas atividades aparecerão aqui!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(HEIGHTS.activity_container, `space-y-${SPACING.md}`)}>
      {/* Header Compacto HARMONIZADO */}
      <div className={cn(HEIGHTS.header, "flex items-center justify-between")}>
        <div className={cn("flex items-center", `gap-${SPACING.sm}`)}>
          <div className={cn("bg-green-500/10 rounded-lg border border-green-500/30", `p-${SPACING.xs}`)}>
            <Activity className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white leading-tight">
              Atividade Recente
            </h3>
            <p className="text-brand-gray-400 text-sm leading-tight">
              Últimas {activities.length} ações
            </p>
          </div>
        </div>
        
        {/* Timestamp do último update */}
        <div className={cn("flex items-center text-brand-gray-500", `gap-${SPACING.xs}`)}>
          <Calendar className="w-3 h-3" />
          <span className="text-xs leading-tight">Atualizado agora</span>
        </div>
      </div>

      {/* Feed de Atividades HARMONIZADO */}
      <div className={cn(`space-y-${SPACING.xs}`)}>
        {activities.slice(0, 4).map((activity, index) => {
          const IconComponent = getActivityIcon(activity.action)
          const iconColor = getActivityColor(activity.action)
          const bgColor = getActivityBgColor(activity.action)
          const actionText = getActionText(activity.action, activity.metadata)
          
          return (
            <motion.div
              key={`${activity.id}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-center bg-brand-gray-800/50 border border-brand-gray-700/50 hover:border-brand-gray-600/50 transition-all duration-300 rounded-lg",
                HEIGHTS.activity_item,
                `gap-${SPACING.sm} p-${SPACING.sm}`
              )}
            >
              {/* Ícone da Atividade */}
              <div className={cn("rounded-lg flex-shrink-0 border", bgColor, `p-${SPACING.xs}`)}>
                <IconComponent className={cn("w-4 h-4", iconColor)} />
              </div>
              
              {/* Conteúdo Principal */}
              <div className="flex-1 min-w-0">
                <div className={cn("flex items-center justify-between", `mb-${SPACING.xs}`)}>
                  <h5 className="text-white font-medium text-sm leading-tight truncate">
                    {actionText}
                  </h5>
                  <span className="text-brand-gray-400 text-xs leading-tight flex-shrink-0">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </span>
                </div>
                
                {/* Metadata/Detalhes */}
                {activity.metadata?.creative_title && (
                  <p className="text-brand-gray-400 text-xs truncate leading-tight">
                    "{activity.metadata.creative_title}"
                  </p>
                )}
                
                {activity.metadata?.achievement_name && (
                  <p className="text-brand-neon-green text-xs truncate leading-tight">
                    +{activity.metadata.achievement_points || 0} XP
                  </p>
                )}
                
                {activity.metadata?.file_size && (
                  <p className="text-brand-gray-400 text-xs truncate leading-tight">
                    {formatFileSize(activity.metadata.file_size)}
                  </p>
                )}
              </div>
              
              {/* Status Indicator */}
              <div className={cn(
                "w-2 h-2 rounded-full flex-shrink-0",
                activity.action === 'creative_completed' ? 'bg-green-400 shadow-lg shadow-green-400/50' :
                activity.action === 'creative_created' ? 'bg-blue-400 shadow-lg shadow-blue-400/50' :
                activity.action === 'achievement_unlocked' ? 'bg-brand-neon-green shadow-lg shadow-brand-neon-green/50' :
                'bg-brand-gray-500'
              )} />
            </motion.div>
          )
        })}
      </div>

      {/* Indicador de mais atividades */}
      {activities.length > 4 && (
        <div className={cn("text-center pt-3 border-t border-brand-gray-700/50", `mt-${SPACING.md}`)}>
          <span className="text-brand-gray-500 text-xs leading-tight">
            +{activities.length - 4} atividades anteriores
          </span>
        </div>
      )}
    </div>
  )
}

// Helper function para formatar tamanho de arquivo
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
} 