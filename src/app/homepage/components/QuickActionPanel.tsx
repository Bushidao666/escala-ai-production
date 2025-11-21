'use client'

import { motion } from 'framer-motion'
import { Plus, Zap, Clock, Image, BarChart3, Settings, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { cn } from '@/shared/lib/utils'

const quickActions = [
  {
    id: 'create',
    title: 'Criar Criativo',
    icon: Plus,
    href: '/new',
    priority: 1
  },
  {
    id: 'queue',
    title: 'Fila',
    icon: Clock,
    href: '/queue', 
    priority: 2
  },
  {
    id: 'gallery',
    title: 'Galeria',
    icon: Image,
    href: '/gallery',
    priority: 3
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
    priority: 4
  },
  {
    id: 'settings',
    title: 'Configurações',
    icon: Settings,
    href: '/settings',
    priority: 5
  }
]

// Removido - agora usando estilo consistente para todos os botões

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

interface QuickActionPanelProps {
  queueCount?: number
  recentCount?: number
}

export function QuickActionPanel({ queueCount = 0, recentCount = 0 }: QuickActionPanelProps) {
  const getBadgeCount = (actionId: string) => {
    switch (actionId) {
      case 'queue':
        return queueCount > 0 ? queueCount : null
      case 'gallery': 
        return recentCount > 0 ? `${recentCount}` : null
      default:
        return null
    }
  }

  return (
    <Card className="card-glass-intense border-brand-gray-700/50 mb-8">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-brand-neon-green/20 rounded-xl blur-lg animate-glow-pulse"></div>
            <div className="relative bg-gradient-to-br from-brand-neon-green to-brand-neon-green-dark p-3 rounded-xl">
              <Zap className="w-6 h-6 text-brand-black" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Ações Rápidas
            </h2>
            <p className="text-brand-gray-400">
              Acesso direto às principais funcionalidades
            </p>
          </div>
        </div>

      {/* Grid de Ações */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 sm:grid-cols-5 gap-3"
      >
        {quickActions.map((action) => {
          const IconComponent = action.icon
          const badgeCount = getBadgeCount(action.id)
          const isMainAction = action.id === 'create'
          
          return (
            <motion.div
              key={action.id}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02, 
                y: -2,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={action.href}
                className={cn(
                  "block h-24 p-3 rounded-lg border transition-all duration-300 group relative overflow-hidden flex flex-col items-center justify-center text-center",
                  isMainAction 
                    ? 'text-white bg-gradient-to-br from-brand-neon-green/20 via-brand-neon-green/10 to-transparent border border-brand-neon-green/30 shadow-lg shadow-brand-neon-green/20' 
                    : 'text-brand-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-brand-gray-700/30 hover:via-brand-gray-600/20 hover:to-brand-gray-700/30 hover:border-brand-gray-600/30 border border-transparent'
                )}
              >
                {/* Badge de notificação */}
                {badgeCount && (
                  <motion.div 
                    className="absolute top-2 right-2 bg-brand-neon-green text-brand-black text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    {badgeCount}
                  </motion.div>
                )}
                
                {/* Ícone */}
                <div className={cn(
                  "mb-2 p-2 rounded-lg transition-all duration-300",
                  isMainAction 
                    ? 'bg-brand-neon-green/20 text-brand-neon-green' 
                    : 'bg-white/10 text-brand-gray-400 group-hover:text-brand-neon-green/70'
                )}>
                  <IconComponent className="w-4 h-4" />
                </div>
                
                {/* Título */}
                <h3 className={cn(
                  "text-xs font-medium transition-colors duration-300 leading-tight",
                  isMainAction ? 'text-white' : 'text-brand-gray-400 group-hover:text-white'
                )}>
                  {action.title}
                </h3>
                
                {/* Seta de navegação - só aparece no hover */}
                <div className={cn(
                  "absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-all duration-300",
                  isMainAction ? 'text-brand-neon-green' : 'text-brand-neon-green/70'
                )}>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-300" />
                </div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Footer com atalhos de teclado */}
      <motion.div 
        className="mt-6 pt-6 border-t border-brand-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-brand-gray-400">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-brand-gray-800 rounded text-brand-gray-300 font-mono">N</kbd>
            <span>Novo Criativo</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-brand-gray-800 rounded text-brand-gray-300 font-mono">G</kbd>
            <span>Galeria</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-brand-gray-800 rounded text-brand-gray-300 font-mono">Q</kbd>
            <span>Fila</span>
          </div>
        </div>
      </motion.div>
      </CardContent>
    </Card>
  )
} 