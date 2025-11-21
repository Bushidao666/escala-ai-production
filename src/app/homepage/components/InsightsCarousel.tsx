'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  Lightbulb, 
  TrendingUp, 
  Flag, 
  AlertTriangle, 
  Trophy, 
  Zap,
  BarChart3,
  Info,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { Insight } from '../types'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

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
  insight_container: 'min-h-[200px]',     // Container principal
  insight_card: 'h-[160px]',              // Card do insight
  header: 'h-[60px]',                     // Header compacto
} as const

// Mapeamento de ícones para tipos de insight
const insightIconMap = {
  performance_tip: TrendingUp,
  milestone_reached: Flag, 
  suggestion: Lightbulb,
  trend_alert: AlertTriangle,
  achievement_available: Trophy,
  efficiency_boost: Zap,
  usage_pattern: BarChart3,
  default: Info
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 100 : -100,
    opacity: 0
  }),
}

interface IntelligentInsightsProps {
  insights: Insight[]
}

export function IntelligentInsights({ insights }: IntelligentInsightsProps) {
  const [[page, direction], setPage] = useState([0, 0])

  if (insights.length === 0) {
    return (
      <div className={cn(HEIGHTS.insight_container, "flex flex-col justify-center")}>
        <div className="text-center">
          <div className={cn("bg-brand-gray-800/50 rounded-lg w-fit mx-auto", `p-${SPACING.sm} mb-${SPACING.sm}`)}>
            <Lightbulb className="w-6 h-6 text-brand-gray-500" />
          </div>
          <h3 className={cn("text-base font-semibold text-white", `mb-${SPACING.xs}`)}>
            Nenhum insight disponível
          </h3>
          <p className="text-brand-gray-400 text-sm leading-tight">
            Continue criando para receber insights personalizados!
          </p>
        </div>
      </div>
    )
  }

  const insightIndex = ((page % insights.length) + insights.length) % insights.length
  const currentInsight = insights[insightIndex]
  
  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection])
  }

  const IconComponent = insightIconMap[currentInsight.type as keyof typeof insightIconMap] || insightIconMap.default

  return (
    <div className={cn(HEIGHTS.insight_container, `space-y-${SPACING.md}`)}>
      {/* Header Compacto HARMONIZADO */}
      <div className={cn(HEIGHTS.header, "flex items-center justify-between")}>
        <div className={cn("flex items-center", `gap-${SPACING.sm}`)}>
          <div className={cn("bg-brand-neon-green/10 rounded-lg border border-brand-neon-green/30", `p-${SPACING.xs}`)}>
            <Lightbulb className="w-5 h-5 text-brand-neon-green" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white leading-tight">Insights</h3>
            <p className="text-brand-gray-400 text-sm leading-tight">Análises personalizadas</p>
          </div>
        </div>
        
        {/* Indicador de posição compacto */}
        {insights.length > 1 && (
          <div className={cn("flex items-center", `gap-${SPACING.xs}`)}>
            {insights.map((_, index) => (
              <button
                key={index}
                onClick={() => setPage([index, index > insightIndex ? 1 : -1])}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === insightIndex ? "bg-brand-neon-green" : "bg-brand-gray-600 hover:bg-brand-gray-500"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Insight Card Compacto HARMONIZADO */}
      <div className={cn(
        "relative bg-brand-gray-800/50 border border-brand-gray-700/50 rounded-lg overflow-hidden",
        HEIGHTS.insight_card
      )}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className={cn("absolute inset-0", `p-${SPACING.md}`)}
          >
            <div className="h-full flex flex-col">
              <div className={cn("flex items-start", `gap-${SPACING.sm} mb-${SPACING.sm}`)}>
                {/* Ícone do Insight */}
                <div className={cn("bg-brand-neon-green/10 rounded-lg border border-brand-neon-green/30 flex-shrink-0", `p-${SPACING.xs}`)}>
                  <IconComponent className="w-4 h-4 text-brand-neon-green" />
                </div>
                
                {/* Categoria */}
                <span className={cn(
                  "text-xs font-medium uppercase tracking-wider rounded-full bg-brand-neon-green/10 text-brand-neon-green border border-brand-neon-green/30",
                  `px-${SPACING.xs} py-1`
                )}>
                  {currentInsight.category}
                </span>
              </div>
              
              <div className="flex-1 flex flex-col">
                {/* Título */}
                <h4 className={cn("text-white font-semibold text-sm leading-tight", `mb-${SPACING.xs}`)}>
                  {currentInsight.title}
                </h4>
                
                {/* Descrição */}
                <p className={cn("text-brand-gray-300 text-xs leading-relaxed line-clamp-3 flex-1", `mb-${SPACING.sm}`)}>
                  {currentInsight.description}
                </p>
                
                {/* CTA */}
                {currentInsight.action_text && currentInsight.action_url && (
                  <div className="mt-auto">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={cn("btn-ghost text-xs h-auto", `p-${SPACING.xs}`)}
                      asChild
                    >
                      <Link href={currentInsight.action_url}>
                        {currentInsight.action_text}
                        <ArrowRight className={cn("w-3 h-3", `ml-${SPACING.xs}`)} />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Controles de Navegação HARMONIZADOS */}
        {insights.length > 1 && (
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none">
            <button
              className={cn(
                "pointer-events-auto rounded-lg bg-brand-gray-800/80 border border-brand-gray-600/50 text-brand-gray-400 hover:text-white hover:bg-brand-gray-700/80 transition-all duration-200",
                `p-${SPACING.xs} -ml-${SPACING.xs}`
              )}
              onClick={() => paginate(-1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <button
              className={cn(
                "pointer-events-auto rounded-lg bg-brand-gray-800/80 border border-brand-gray-600/50 text-brand-gray-400 hover:text-white hover:bg-brand-gray-700/80 transition-all duration-200",
                `p-${SPACING.xs} -mr-${SPACING.xs}`
              )}
              onClick={() => paginate(1)}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 