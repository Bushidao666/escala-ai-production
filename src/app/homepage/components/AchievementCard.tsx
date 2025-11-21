'use client'

import { Sparkles, Clock, Trophy } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Achievement } from '../types'
import { getAchievementIcon, getRarityColors } from '../utils/achievementIcons'

interface AchievementCardProps {
  achievement: Achievement
  index?: number
  onClick?: () => void
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 60) return `${diffInMinutes}m atrás`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d atrás`
  return date.toLocaleDateString()
}

export function AchievementCard({ achievement, index = 0, onClick }: AchievementCardProps) {
  const IconComponent = getAchievementIcon(achievement.id)
  const rarityColors = getRarityColors(achievement.rarity)
  
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl p-4 cursor-pointer bg-brand-black border border-brand-gray-700/50",
        "transition-all duration-300 hover:border-brand-gray-600",
        achievement.is_new && "border-brand-neon-green/50"
      )}
    >
      {/* Badge de Nova Conquista */}
      {achievement.is_new && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-brand-neon-green/20 border border-brand-neon-green/50 rounded-full px-2 py-1">
          <Sparkles className="w-3 h-3 text-brand-neon-green" />
          <span className="text-xs font-medium text-brand-neon-green">NOVO</span>
        </div>
      )}
      
      {/* Featured Badge */}
      {achievement.is_featured && (
        <div className="absolute top-2 left-2 bg-amber-500/20 border border-amber-500/50 rounded-full p-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
        </div>
      )}
      
      {/* Ícone e Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={cn(
          "p-2 rounded-lg border",
          rarityColors.bg,
          rarityColors.border,
          rarityColors.text
        )}>
          <IconComponent className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-base mb-1 leading-tight">
            {achievement.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs font-medium uppercase tracking-wider px-2 py-1 rounded-full",
              rarityColors.bg,
              rarityColors.text
            )}>
              {achievement.rarity}
            </span>
            <span className="text-xs text-brand-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(achievement.unlocked_at)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Descrição */}
      <p className="text-sm text-brand-gray-400 leading-relaxed mb-3">
        {achievement.description}
      </p>
      
      {/* Footer com Pontos */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-neon-green" />
          <span className="text-xs text-brand-gray-500">Desbloqueada</span>
        </div>
        
        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-1">
          <Trophy className="w-3 h-3 text-amber-400" />
          <span className="text-xs font-medium text-amber-400">+{achievement.points} XP</span>
        </div>
      </div>
    </div>
  )
}

// Componente para mostrar próxima conquista em progresso
export function NextAchievementCard({ 
  name, 
  description, 
  progress, 
  maxProgress, 
  category 
}: {
  name: string
  description: string
  progress: number
  maxProgress: number
  category: string
}) {
  const IconComponent = getAchievementIcon(category)
  const progressPercentage = (progress / maxProgress) * 100
  
  return (
    <div className="bg-brand-black border border-dashed border-brand-gray-600 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-brand-gray-800/50 border border-brand-gray-600 text-brand-gray-400">
          <IconComponent className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-base">{name}</h3>
          <p className="text-xs text-brand-gray-500">Próxima conquista</p>
        </div>
      </div>
      
      <p className="text-sm text-brand-gray-400 mb-3">{description}</p>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-brand-gray-500">Progresso</span>
          <span className="text-white font-medium">{progress}/{maxProgress}</span>
        </div>
        <div className="w-full bg-brand-gray-800 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-brand-neon-green to-brand-neon-green-light h-2 rounded-full transition-all duration-1000"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  )
} 