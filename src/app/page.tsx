'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getDashboardData, DashboardData, getRecentCreatives } from './homepage/actions'
import { createClient } from '@/shared/infra/supabase/client'
import { User } from '@supabase/supabase-js'
import { IntelligentInsights } from './homepage/components/InsightsCarousel'
import { RecentActivityFeed } from './homepage/components/RecentActivityFeed'
import { AchievementShowcase } from './homepage/components/achievements/AchievementShowcase'
import { DashboardSkeleton } from './homepage/components/skeletons/DashboardSkeleton'
import { RecentCreative } from './homepage/types'
import { 
  Palette, Clock, TrendingUp, Grid3X3, ChevronRight, Zap, Target, Flame, Trophy, 
  Plus, Image, BarChart3, Settings, Calendar, Star, Award, Activity, Users,
  Lightbulb, Sparkles, PlayCircle, CheckCircle, Timer, Rocket, RefreshCw,
  Keyboard, ArrowUp
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { cn } from '@/shared/lib/utils'

// SISTEMA DE SPACING UNIFICADO
const SPACING = {
  // Unidade base: 4px (rem * 4)
  xs: 2,    // 8px  - micro spacing
  sm: 3,    // 12px - small spacing
  md: 4,    // 16px - medium spacing (base)
  lg: 5,    // 20px - large spacing
  xl: 6,    // 24px - extra large spacing
  xxl: 8,   // 32px - section spacing
  xxxl: 12  // 48px - major section spacing
} as const

// SISTEMA DE HEIGHTS UNIFICADO
const HEIGHTS = {
  stat_card: 'h-[120px]',           // Stats cards altura fixa
  action_button: 'h-16',            // Botões de ação altura fixa
  card_header: 'h-[72px]',          // Headers padronizados
  column_min: 'min-h-[400px]',      // Altura mínima das colunas
  creative_item: 'aspect-square',   // Grid de criações
  section: 'min-h-[280px]'          // Seções internas mínimas
} as const

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

// Componente Sticky Action Bar Premium
function StickyActionBar({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div className={cn(
        "flex items-center bg-brand-black/90 backdrop-blur-xl border border-brand-gray-700/50 rounded-xl shadow-2xl shadow-black/50",
        `gap-${SPACING.sm} p-${SPACING.md}`
      )}>
        <Button size="sm" className="btn-neon" asChild>
          <Link href="/new">
            <Plus className="w-4 h-4 mr-2" />
            Criar
          </Link>
        </Button>
        
        <Button size="sm" variant="ghost" className="btn-ghost" asChild>
          <Link href="/queue">
            <Clock className="w-4 h-4" />
          </Link>
        </Button>
        
        <Button size="sm" variant="ghost" className="btn-ghost" asChild>
          <Link href="/gallery">
            <Image className="w-4 h-4" />
          </Link>
        </Button>
        
        <Button 
          size="sm" 
          variant="ghost" 
          className="btn-ghost"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  )
}

// Componente Hero Stats Premium - HARMONIZADO
function HeroStatsSection({ data }: { data: DashboardData }) {
  const stats = [
    {
      label: 'Criativos Hoje',
      value: data.stats.creatives_today,
      icon: Zap,
      color: 'text-brand-neon-green',
      bgColor: 'bg-brand-neon-green/10',
      trend: '+12%'
    },
    {
      label: 'Taxa de Sucesso',
      value: `${data.stats.success_rate}%`,
      icon: Target,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      trend: '+3%'
    },
    {
      label: 'Sequência',
      value: `${data.stats.current_streak} dias`,
      icon: Flame,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
      trend: data.stats.current_streak > 0 ? `+${data.stats.current_streak}` : '0'
    },
    {
      label: 'XP Total',
      value: data.stats.achievement_points,
      icon: Trophy,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      trend: '+45'
    },
    {
      label: 'Nível',
      value: data.stats.user_level,
      icon: Star,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      trend: data.stats.user_level > 1 ? `Lv.${data.stats.user_level}` : 'Novo'
    },
    {
      label: 'Total',
      value: data.stats.total_completed,
      icon: CheckCircle,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      trend: `${data.stats.total_completed}`
    }
  ]

  return (
    <div className={cn("grid grid-cols-6", `gap-${SPACING.md}`)}>
      {stats.map((stat, index) => {
        const IconComponent = stat.icon
        return (
          <motion.div
            key={stat.label}
            variants={sectionVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            className="group"
          >
            <Card className={cn(
              "card-glass-intense border-brand-gray-700/50 overflow-hidden",
              HEIGHTS.stat_card
            )}>
              <CardContent className={cn("relative", `p-${SPACING.md}`)}>
                {/* Background Glow Effect */}
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  stat.bgColor.replace('/10', '/5')
                )} />
                
                <div className="relative h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300",
                      stat.bgColor,
                      "group-hover:scale-110"
                    )}>
                      <IconComponent className={cn("w-5 h-5", stat.color)} />
                    </div>
                    
                    <span className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full",
                      stat.bgColor,
                      stat.color
                    )}>
                      {stat.trend}
                    </span>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-2xl font-bold text-white mb-1 group-hover:text-shadow-sm transition-all duration-300 leading-tight">
                      {stat.value}
                    </p>
                    <p className="text-sm text-brand-gray-400 group-hover:text-brand-gray-300 transition-colors duration-300 leading-tight">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

// Ações Rápidas Premium - HARMONIZADO
function QuickActionsBar() {
  const actions = [
    {
      title: 'Novo Criativo',
      href: '/new',
      icon: Plus,
      primary: true,
      description: 'Criar agora',
      shortcut: 'N'
    },
    {
      title: 'Galeria',
      href: '/gallery',
      icon: Image,
      description: 'Explorar',
      shortcut: 'G'
    },
    {
      title: 'Fila',
      href: '/queue',
      icon: Clock,
      description: 'Processos',
      shortcut: 'Q'
    },
    {
      title: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      description: 'Métricas',
      shortcut: 'A'
    },
    {
      title: 'Configurações',
      href: '/settings',
      icon: Settings,
      description: 'Ajustar',
      shortcut: 'S'
    }
  ]

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return
      
      const action = actions.find(a => a.shortcut?.toLowerCase() === e.key.toLowerCase())
      if (action) {
        e.preventDefault()
        window.location.href = action.href
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <div className={cn("flex items-center", `gap-${SPACING.sm}`)}>
      {actions.map((action, index) => {
        const IconComponent = action.icon
        return (
          <motion.div
            key={action.title}
            variants={sectionVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              asChild
              className={cn(
                "rounded-xl transition-all duration-300 relative group",
                HEIGHTS.action_button,
                `px-${SPACING.xl}`,
                action.primary 
                  ? "btn-neon text-white" 
                  : "btn-ghost border-brand-gray-600/50"
              )}
            >
              <Link href={action.href}>
                {/* Keyboard Shortcut Indicator */}
                {action.shortcut && (
                  <kbd className="absolute -top-2 -right-2 w-5 h-5 bg-brand-gray-800 border border-brand-gray-600 rounded text-xs flex items-center justify-center text-brand-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {action.shortcut}
                  </kbd>
                )}
                
                <div className={cn("flex items-center", `gap-${SPACING.sm}`)}>
                  <div className={cn(
                    "p-2 rounded-lg transition-transform duration-300 group-hover:scale-110",
                    action.primary 
                      ? "bg-brand-neon-green/20" 
                      : "bg-brand-gray-800/50"
                  )}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm leading-tight">{action.title}</p>
                    <p className="text-xs opacity-70 leading-tight">{action.description}</p>
                  </div>
                </div>
              </Link>
            </Button>
          </motion.div>
        )
      })}
      
      {/* Keyboard Shortcuts Indicator */}
      <motion.div
        variants={sectionVariants}
        className={cn("flex items-center text-brand-gray-500", `ml-${SPACING.md} gap-${SPACING.xs}`)}
      >
        <Keyboard className="w-4 h-4" />
        <span className="text-xs">Atalhos habilitados</span>
      </motion.div>
    </div>
  )
}

// Grid de Criações Compacto - HARMONIZADO
function CompactCreativesGrid({ creatives, onRefresh }: { 
  creatives: RecentCreative[], 
  onRefresh: () => void 
}) {
  if (creatives.length === 0) {
    return (
      <Card className="card-glass-intense border-brand-gray-700/50">
        <CardContent className={cn("text-center", `p-${SPACING.xl}`)}>
          <div className={cn("bg-brand-gray-800/50 rounded-lg w-fit mx-auto", `p-${SPACING.sm} mb-${SPACING.md}`)}>
            <Palette className="w-8 h-8 text-brand-gray-500" />
          </div>
          <h3 className={cn("text-lg font-semibold text-white", `mb-${SPACING.xs}`)}>
            Suas primeiras criações
          </h3>
          <p className={cn("text-brand-gray-400", `mb-${SPACING.md}`)}>
            Comece criando seu primeiro criativo!
          </p>
          <Button className="btn-neon" asChild>
            <Link href="/new">
              <Plus className="w-4 h-4 mr-2" />
              Criar Agora
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-glass-intense border-brand-gray-700/50">
      <CardHeader className={cn(HEIGHTS.card_header, `pb-${SPACING.sm}`)}>
        <div className="flex items-center justify-between h-full">
          <div className={cn("flex items-center", `gap-${SPACING.sm}`)}>
            <div className={cn("bg-brand-neon-green/10 rounded-lg border border-brand-neon-green/30", `p-${SPACING.xs}`)}>
              <Palette className="w-5 h-5 text-brand-neon-green" />
            </div>
            <div>
              <CardTitle className="text-lg text-white leading-tight">Criações Recentes</CardTitle>
              <p className="text-brand-gray-400 text-sm leading-tight">{creatives.length} criativos</p>
            </div>
          </div>
          
          <div className={cn("flex items-center", `gap-${SPACING.xs}`)}>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("btn-ghost", `p-${SPACING.xs}`)}
              onClick={onRefresh}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" size="sm" className="btn-ghost" asChild>
              <Link href="/gallery">
                Ver Todas
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className={cn("grid grid-cols-4", `gap-${SPACING.sm}`)}>
          {creatives.slice(0, 8).map((creative, index) => (
            <motion.div
              key={creative.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className={cn(
                "group relative rounded-lg overflow-hidden border border-brand-gray-700 hover:border-brand-neon-green/50 transition-all duration-300 cursor-pointer",
                HEIGHTS.creative_item
              )}
            >
              {creative.result_url ? (
                <img 
                  src={creative.result_url} 
                  alt={creative.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-brand-gray-800">
                  <Timer className="w-6 h-6 text-brand-gray-500 animate-pulse" />
                </div>
              )}
              
              <div className={cn(
                "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end",
                `p-${SPACING.sm}`
              )}>
                <h4 className="text-white font-semibold text-sm truncate">
                  {creative.title}
                </h4>
                <div className={cn("flex items-center justify-between", `mt-${SPACING.xs}`)}>
                  <span className="text-brand-gray-300 text-xs">
                    {creative.format}
                  </span>
                  <div className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    creative.status === 'completed' ? 'bg-green-400 shadow-lg shadow-green-400/50' : 
                    creative.status === 'processing' ? 'bg-blue-400 animate-pulse' : 'bg-gray-400'
                  )} />
                </div>
              </div>

              {/* Processing Indicator */}
              {creative.status === 'processing' && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)
  const [recentCreatives, setRecentCreatives] = useState<RecentCreative[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showStickyBar, setShowStickyBar] = useState(false)

  const supabase = createClient()

  const refreshData = async () => {
    try {
      const [dashboardData, creativesData] = await Promise.all([
        getDashboardData(),
        getRecentCreatives()
      ])
      setData(dashboardData)
      setRecentCreatives(creativesData)
    } catch (err) {
      console.error('Failed to refresh data:', err)
    }
  }

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        const session = await supabase.auth.getSession()
        if (session.data.session?.user) {
          setUser(session.data.session.user)
          await refreshData()
        } else {
          setError('Usuário não autenticado.')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao carregar dados.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  // Scroll detection for sticky bar
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 200)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`homepage_updates_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats',
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          console.log('Stats updated, refreshing data...')
          await refreshData()
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'creatives',
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          console.log('Creatives updated, refreshing...')
          const creativesData = await getRecentCreatives()
          setRecentCreatives(creativesData)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <motion.div 
        className="flex h-screen w-full items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Card className="card-glass-intense border-red-500/20 max-w-md">
          <CardContent className={cn("text-center", `p-${SPACING.xxl}`)}>
            <div className={cn("bg-red-500/10 rounded-full w-fit mx-auto", `p-${SPACING.md} mb-${SPACING.md}`)}>
              <TrendingUp className="w-8 h-8 text-red-400" />
            </div>
            <h2 className={cn("text-xl font-semibold text-red-400", `mb-${SPACING.xs}`)}>
              Erro ao carregar dados
            </h2>
            <p className={cn("text-brand-gray-400", `mb-${SPACING.md}`)}>
              {error}
            </p>
            <Button 
              className="btn-neon"
              onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (!data) {
    return (
      <motion.div 
        className="flex h-screen w-full items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Card className="card-glass-intense border-brand-gray-700/50 max-w-md">
          <CardContent className={cn("text-center", `p-${SPACING.xxl}`)}>
            <div className={cn("bg-brand-gray-800 rounded-full w-fit mx-auto", `p-${SPACING.md} mb-${SPACING.md}`)}>
              <Grid3X3 className="w-8 h-8 text-brand-gray-500" />
            </div>
            <h2 className={cn("text-xl font-semibold text-white", `mb-${SPACING.xs}`)}>
              Nenhum dado disponível
            </h2>
            <p className="text-brand-gray-400">
              Aguarde enquanto carregamos seus dados...
            </p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário'

  return (
    <>
      <motion.div 
        className={cn("space-y-6", `p-${SPACING.xl}`)}
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section Premium - HARMONIZADO */}
        <motion.section 
          variants={sectionVariants} 
          className={cn("space-y-6", `mb-${SPACING.xxl}`)}
        >
          {/* Header + Welcome */}
          <div className="flex items-center justify-between">
            <div className={cn("flex items-center", `space-x-${SPACING.md}`)}>
              <div className="relative">
                <div className="absolute inset-0 bg-brand-neon-green/20 rounded-xl blur-lg animate-glow-pulse"></div>
                <div className={cn("relative bg-gradient-to-br from-brand-neon-green to-brand-neon-green-dark rounded-xl", `p-${SPACING.sm}`)}>
                  <Rocket className="w-7 h-7 text-brand-black" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white leading-tight">
                  Bem-vindo de volta, <span className="text-gradient-neon">{userName}</span>
                </h1>
                <p className={cn("text-brand-gray-400 text-lg leading-relaxed", `mt-${SPACING.xs}`)}>
                  {data.stats.creatives_today > 0 
                    ? `Você já criou ${data.stats.creatives_today} criativos hoje! Continue assim.` 
                    : 'Pronto para criar algo incrível hoje?'
                  }
                </p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <QuickActionsBar />
          </div>

          {/* Stats Cards Premium */}
          <HeroStatsSection data={data} />
        </motion.section>

        {/* Main Content Grid - Tri Column HARMONIZADO */}
        <motion.section 
          variants={sectionVariants} 
          className={cn("grid grid-cols-12", `gap-${SPACING.xl} mb-${SPACING.xxl}`)}
        >
          {/* Coluna 1: Insights + Próximas Ações */}
          <div className={cn("col-span-4", `space-y-${SPACING.xl}`)}>
            <Card className={cn("card-glass-intense border-brand-gray-700/50", HEIGHTS.column_min)}>
              <CardContent className={cn(`p-${SPACING.xl}`)}>
                <IntelligentInsights insights={data.insights} />
              </CardContent>
            </Card>
            
            {/* Próximas Ações Sugeridas */}
            <Card className={cn("card-glass-intense border-brand-gray-700/50", HEIGHTS.section)}>
              <CardHeader className={HEIGHTS.card_header}>
                <div className={cn("flex items-center", `gap-${SPACING.sm}`)}>
                  <div className={cn("bg-blue-500/10 rounded-lg border border-blue-500/30", `p-${SPACING.xs}`)}>
                    <Lightbulb className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white leading-tight">Próximas Ações</CardTitle>
                    <p className="text-brand-gray-400 text-sm leading-tight">Sugestões personalizadas</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className={cn("pt-0", `space-y-${SPACING.sm}`)}>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    "rounded-lg bg-brand-gray-800/50 border border-brand-gray-700/50 hover:border-brand-neon-green/30 transition-all duration-300 cursor-pointer",
                    `p-${SPACING.sm}`
                  )}
                >
                  <div className={cn("flex items-center", `gap-${SPACING.sm}`)}>
                    <PlayCircle className="w-5 h-5 text-brand-neon-green" />
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm leading-tight">Processar Fila</p>
                      <p className="text-brand-gray-400 text-xs leading-tight">3 itens aguardando</p>
                    </div>
                  </div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    "rounded-lg bg-brand-gray-800/50 border border-brand-gray-700/50 hover:border-purple-400/30 transition-all duration-300 cursor-pointer",
                    `p-${SPACING.sm}`
                  )}
                >
                  <div className={cn("flex items-center", `gap-${SPACING.sm}`)}>
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm leading-tight">Revisar Analytics</p>
                      <p className="text-brand-gray-400 text-xs leading-tight">Dados semanais disponíveis</p>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna 2: Atividade + Progresso */}
          <div className={cn("col-span-4", `space-y-${SPACING.xl}`)}>
            <Card className={cn("card-glass-intense border-brand-gray-700/50", HEIGHTS.column_min)}>
              <CardHeader className={HEIGHTS.card_header}>
                <div className={cn("flex items-center", `gap-${SPACING.sm}`)}>
                  <div className={cn("bg-green-500/10 rounded-lg border border-green-500/30", `p-${SPACING.xs}`)}>
                    <Activity className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white leading-tight">Atividade Recente</CardTitle>
                    <p className="text-brand-gray-400 text-sm leading-tight">Últimas ações do sistema</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <RecentActivityFeed activities={data.recent_activity} />
              </CardContent>
            </Card>

            {/* Progresso do Usuário */}
            <Card className={cn("card-glass-intense border-brand-gray-700/50", HEIGHTS.section)}>
              <CardHeader className={HEIGHTS.card_header}>
                <div className={cn("flex items-center", `gap-${SPACING.sm}`)}>
                  <div className={cn("bg-yellow-500/10 rounded-lg border border-yellow-500/30", `p-${SPACING.xs}`)}>
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white leading-tight">Seu Progresso</CardTitle>
                    <p className="text-brand-gray-400 text-sm leading-tight">Nível {data.stats.user_level}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className={cn("pt-0", `space-y-${SPACING.md}`)}>
                <div className={cn(`space-y-${SPACING.xs}`)}>
                  <div className="flex justify-between text-sm">
                    <span className="text-white">XP para próximo nível</span>
                    <span className="text-brand-gray-400">
                      {data.stats.achievement_points} / {(data.stats.user_level + 1) * 100}
                    </span>
                  </div>
                  <div className="w-full bg-brand-gray-800 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      className="bg-gradient-to-r from-brand-neon-green to-brand-neon-green-light h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${Math.min((data.stats.achievement_points % 100), 100)}%` 
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
                
                <div className={cn("grid grid-cols-2", `gap-${SPACING.sm}`)}>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      "text-center rounded-lg bg-brand-gray-800/50 border border-brand-gray-700/50 hover:border-brand-neon-green/30 transition-all duration-300",
                      `p-${SPACING.sm}`
                    )}
                  >
                    <p className="text-2xl font-bold text-white leading-tight">{data.stats.creatives_this_week}</p>
                    <p className="text-xs text-brand-gray-400 leading-tight">Esta Semana</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      "text-center rounded-lg bg-brand-gray-800/50 border border-brand-gray-700/50 hover:border-brand-neon-green/30 transition-all duration-300",
                      `p-${SPACING.sm}`
                    )}
                  >
                    <p className="text-2xl font-bold text-white leading-tight">{data.stats.creatives_this_month}</p>
                    <p className="text-xs text-brand-gray-400 leading-tight">Este Mês</p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna 3: Conquistas + Stats */}
          <div className={cn("col-span-4", `space-y-${SPACING.xl}`)}>
            <Card className={cn("card-glass-intense border-brand-gray-700/50", HEIGHTS.column_min)}>
              <CardContent className={cn(`p-${SPACING.xl}`)}>
                <AchievementShowcase 
                  achievements={data.recent_achievements}
                  nextAchievements={[]}
                />
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Criações Recentes - Seção Completa */}
        <motion.section variants={sectionVariants}>
          <CompactCreativesGrid 
            creatives={recentCreatives} 
            onRefresh={refreshData}
          />
        </motion.section>
      </motion.div>

      {/* Sticky Action Bar */}
      <StickyActionBar isVisible={showStickyBar} />
    </>
  )
}
