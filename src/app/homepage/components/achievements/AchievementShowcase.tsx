'use client'

import { motion } from 'framer-motion'
import { Trophy, ChevronRight, Star, Calendar, Target, Award } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Achievement } from '../../types'
import { AchievementCard, NextAchievementCard } from '../AchievementCard'
import { getCategoryIcon } from '../../utils/achievementIcons'
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
  achievement_container: 'min-h-[200px]',     // Container principal
  header: 'h-[60px]',                         // Header compacto
  achievement_item: 'h-[80px]',               // Item individual
  stats_item: 'h-[70px]',                     // Stats compactos
  progress_item: 'h-[90px]',                  // Item de progresso
} as const

interface AchievementShowcaseProps {
  achievements: Achievement[]
  nextAchievements?: any[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
}

export function AchievementShowcase({ achievements, nextAchievements = [] }: AchievementShowcaseProps) {
  if (achievements.length === 0) {
    return (
      <div className={cn(HEIGHTS.achievement_container, "flex flex-col justify-center")}>
        <div className="text-center">
          <div className={cn("bg-brand-gray-800/50 rounded-lg w-fit mx-auto", `p-${SPACING.sm} mb-${SPACING.sm}`)}>
            <Trophy className="w-6 h-6 text-brand-gray-500" />
          </div>
          <h3 className={cn("text-base font-semibold text-white", `mb-${SPACING.xs}`)}>
            Nenhuma conquista ainda
          </h3>
          <p className={cn("text-brand-gray-400 text-sm", `mb-${SPACING.md}`)}>
            Continue criando para desbloquear conquistas!
          </p>
          <Button className="btn-neon text-sm" asChild>
            <Link href="/new">
              Criar Primeiro Criativo
            </Link>
          </Button>
        </div>
      </div>
    )
  }
  
  // Agrupa conquistas por categoria para estatísticas
  const achievementsByCategory = achievements.reduce((acc, achievement) => {
    const category = inferCategory(achievement.id)
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const recentAchievements = achievements.filter(a => a.is_new || a.is_featured).slice(0, 3)
  
  return (
    <div className={cn(HEIGHTS.achievement_container, `space-y-${SPACING.md}`)}>
      {/* Header Compacto HARMONIZADO */}
      <div className={cn(HEIGHTS.header, "flex items-center justify-between")}>
        <div className={cn("flex items-center", `gap-${SPACING.sm}`)}>
          <div className={cn("bg-purple-500/10 rounded-lg border border-purple-500/30", `p-${SPACING.xs}`)}>
            <Trophy className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white leading-tight">
              Conquistas ({achievements.length})
            </h3>
            <p className="text-brand-gray-400 text-sm leading-tight">
              {achievements.filter(a => a.is_new).length} novas
            </p>
          </div>
        </div>
        
        <Button variant="ghost" size="sm" className="btn-ghost text-xs" asChild>
          <Link href="/achievements">
            Ver Todas
            <ChevronRight className={cn("w-3 h-3", `ml-${SPACING.xs}`)} />
          </Link>
        </Button>
      </div>

      {/* Stats Rápidas HARMONIZADAS */}
      <div className={cn("grid grid-cols-2", `gap-${SPACING.xs}`)}>
        {Object.entries(achievementsByCategory).slice(0, 4).map(([category, count]) => {
          const IconComponent = getCategoryIcon(category)
          return (
            <div
              key={category}
              className={cn(
                "bg-brand-gray-800/50 border border-brand-gray-700/50 rounded-lg text-center flex flex-col justify-center",
                HEIGHTS.stats_item,
                `p-${SPACING.sm}`
              )}
            >
              <div className={cn("flex justify-center", `mb-${SPACING.xs}`)}>
                <IconComponent className="w-4 h-4 text-brand-neon-green" />
              </div>
              <p className="text-lg font-bold text-white leading-tight">{count}</p>
              <p className="text-xs text-brand-gray-400 capitalize leading-tight">{category}</p>
            </div>
          )
        })}
      </div>

      {/* Conquistas Recentes/Destacadas HARMONIZADAS */}
      {recentAchievements.length > 0 && (
        <div className={cn(`space-y-${SPACING.sm}`)}>
          <div className={cn("flex items-center", `gap-${SPACING.xs}`)}>
            <div className="w-1 h-4 bg-brand-neon-green rounded-full" />
            <h4 className="text-sm font-semibold text-white leading-tight">Recentes</h4>
          </div>
          
          <div className={cn(`space-y-${SPACING.xs}`)}>
            {recentAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex items-center bg-brand-gray-800/50 border border-brand-gray-700/50 hover:border-brand-neon-green/30 transition-all duration-300 rounded-lg",
                  HEIGHTS.achievement_item,
                  `gap-${SPACING.sm} p-${SPACING.sm}`
                )}
              >
                <div className={cn(
                  "rounded-lg flex-shrink-0 flex items-center justify-center",
                  achievement.rarity === 'legendary' ? 'bg-yellow-500/20 border border-yellow-500/50' :
                  achievement.rarity === 'epic' ? 'bg-purple-500/20 border border-purple-500/50' :
                  achievement.rarity === 'rare' ? 'bg-blue-500/20 border border-blue-500/50' :
                  'bg-green-500/20 border border-green-500/50',
                  `p-${SPACING.xs}`
                )}>
                  <Trophy className={cn(
                    "w-4 h-4",
                    achievement.rarity === 'legendary' ? 'text-yellow-400' :
                    achievement.rarity === 'epic' ? 'text-purple-400' :
                    achievement.rarity === 'rare' ? 'text-blue-400' :
                    'text-green-400'
                  )} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={cn("flex items-center", `gap-${SPACING.xs} mb-${SPACING.xs}`)}>
                    <h5 className="text-white font-medium text-sm truncate leading-tight">
                      {achievement.name}
                    </h5>
                    {achievement.is_new && (
                      <span className={cn(
                        "bg-brand-neon-green text-brand-black text-xs font-medium rounded-full",
                        `px-${SPACING.xs} py-0.5`
                      )}>
                        NOVO
                      </span>
                    )}
                  </div>
                  <p className="text-brand-gray-400 text-xs line-clamp-1 leading-tight">
                    {achievement.description}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-brand-neon-green font-medium text-xs leading-tight">
                      +{achievement.points} XP
                    </span>
                    <span className={cn(
                      "text-xs font-medium capitalize leading-tight",
                      achievement.rarity === 'legendary' ? 'text-yellow-400' :
                      achievement.rarity === 'epic' ? 'text-purple-400' :
                      achievement.rarity === 'rare' ? 'text-blue-400' :
                      'text-green-400'
                    )}>
                      {achievement.rarity}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Próximas Conquistas HARMONIZADAS */}
      {nextAchievements.length > 0 && (
        <div className={cn(`space-y-${SPACING.sm}`)}>
          <div className={cn("flex items-center", `gap-${SPACING.xs}`)}>
            <div className="w-1 h-4 bg-blue-400 rounded-full" />
            <h4 className="text-sm font-semibold text-white leading-tight">Próximas</h4>
          </div>
          
          <div className={cn(`space-y-${SPACING.xs}`)}>
            {nextAchievements.slice(0, 2).map((next, index) => (
              <div 
                key={index}
                className={cn(
                  "bg-brand-gray-800/50 border border-brand-gray-700/50 rounded-lg",
                  HEIGHTS.progress_item,
                  `p-${SPACING.sm}`
                )}
              >
                <div className={cn("flex items-center justify-between", `mb-${SPACING.xs}`)}>
                  <h5 className="text-white font-medium text-sm leading-tight">{next.name}</h5>
                  <span className="text-brand-gray-400 text-xs leading-tight">
                    {next.progress}/{next.maxProgress}
                  </span>
                </div>
                <div className={cn("w-full bg-brand-gray-700 rounded-full h-1.5", `mb-${SPACING.xs}`)}>
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(next.progress / next.maxProgress) * 100}%` }}
                  />
                </div>
                <p className="text-brand-gray-400 text-xs line-clamp-1 leading-tight">
                  {next.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action compacto HARMONIZADO */}
      {achievements.length > 3 && (
        <div className={cn("pt-3 border-t border-brand-gray-700/50 text-center", `mt-${SPACING.md}`)}>
          <Button variant="ghost" size="sm" className="btn-ghost text-xs" asChild>
            <Link href="/achievements">
              Ver mais {achievements.length - 3} conquistas
              <ChevronRight className={cn("w-3 h-3", `ml-${SPACING.xs}`)} />
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

// Helper para inferir categoria baseado no ID da conquista
function inferCategory(achievementId: string): string {
  if (achievementId.includes('creative') || achievementId.includes('first')) return 'creation'
  if (achievementId.includes('speed') || achievementId.includes('productivity') || achievementId.includes('streak')) return 'productivity' 
  if (achievementId.includes('quality') || achievementId.includes('perfect')) return 'quality'
  if (achievementId.includes('social') || achievementId.includes('share')) return 'engagement'
  if (achievementId.includes('achievement') || achievementId.includes('hunter')) return 'achievement'
  return 'special'
} 