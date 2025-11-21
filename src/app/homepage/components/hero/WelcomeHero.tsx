'use client'

import { motion } from 'framer-motion'
import { User, Plus, Grid3X3, Clock, Target, Flame, Trophy, Zap, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { UserStat } from '../../types'

interface WelcomeHeroProps {
  userName: string
  stats: UserStat
  queueCount?: number
}

function getTimeOfDay(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  if (hour < 22) return 'evening'
  return 'night'
}

function getPersonalizedGreeting(name: string, timeOfDay: string, stats: UserStat): string {
  const greetings = {
    morning: [
      `Bom dia, ${name}! Pronto para mais um dia criativo?`,
      `Olá, ${name}! Que tal começarmos com energia hoje?`,
      `Bom dia, ${name}! Suas ideias estão aguardando...`
    ],
    afternoon: [
      `Boa tarde, ${name}! Como está sua produtividade hoje?`,
      `Olá, ${name}! Hora de dar aquele gás criativo!`,
      `Boa tarde, ${name}! Vamos criar algo incrível?`
    ],
    evening: [
      `Boa noite, ${name}! Como foi seu dia criativo?`,
      `Olá, ${name}! Finalizando o dia com mais criações?`,
      `Boa noite, ${name}! Hora de relaxar ou criar mais um pouco?`
    ],
    night: [
      `Boa madrugada, ${name}! Inspiração noturna?`,
      `Olá, ${name}! Criatividade não tem hora, né?`,
      `Boa madrugada, ${name}! Cuidado para não exagerar!`
    ]
  }
  
  const messages = greetings[timeOfDay as keyof typeof greetings] || greetings.afternoon
  
  // Adiciona mensagens contextuais baseadas em estatísticas
  if (timeOfDay === 'morning' && stats.current_streak > 5) {
    messages.push(`Bom dia, ${name}! Sua sequência de ${stats.current_streak} dias é impressionante!`)
  }
  
  if (timeOfDay === 'afternoon' && stats.creatives_today === 0) {
    messages.push(`Boa tarde, ${name}! Ainda não criou nada hoje. Que tal começar?`)
  }
  
  if (timeOfDay === 'evening' && stats.creatives_today >= 3) {
    messages.push(`Boa noite, ${name}! Meta diária batida! Que tal descansar?`)
  }
  
  return messages[Math.floor(Math.random() * messages.length)]
}

function StatMini({ 
  icon: Icon, 
  label, 
  value, 
  target, 
  color = 'neon' 
}: { 
  icon: any, 
  label: string, 
  value: string | number, 
  target?: number,
  color?: 'neon' | 'success' | 'orange' | 'purple' 
}) {
  const colorClasses = {
    neon: 'text-brand-neon-green bg-brand-neon-green/10',
    success: 'text-green-400 bg-green-400/10',
    orange: 'text-orange-400 bg-orange-400/10',
    purple: 'text-purple-400 bg-purple-400/10'
  }
  
  const progress = target ? Math.min((Number(value) / target) * 100, 100) : 0
  
  return (
    <motion.div 
      className="glass rounded-xl p-4 hover:scale-105 transition-all duration-300"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-brand-gray-400 font-medium">{label}</p>
          <p className="text-lg font-bold text-white">{value}</p>
        </div>
      </div>
      
      {target && (
        <div className="w-full bg-brand-gray-800 rounded-full h-1.5">
          <motion.div 
            className={`h-1.5 rounded-full ${colorClasses[color].split(' ')[0].replace('text-', 'bg-')}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
      )}
    </motion.div>
  )
}

export function WelcomeHero({ userName, stats, queueCount = 0 }: WelcomeHeroProps) {
  const timeOfDay = getTimeOfDay()
  const greeting = getPersonalizedGreeting(userName, timeOfDay, stats)
  
  const timeColors = {
    morning: 'from-yellow-500/20 to-orange-500/20',
    afternoon: 'from-orange-500/20 to-red-500/20', 
    evening: 'from-purple-500/20 to-pink-500/20',
    night: 'from-blue-500/20 to-purple-500/20'
  }
  
  return (
    <motion.section 
      className={`glass-intense rounded-2xl p-8 mb-8 bg-gradient-to-br ${timeColors[timeOfDay as keyof typeof timeColors]}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header com Avatar e Saudação */}
      <div className="flex items-center gap-6 mb-8">
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="absolute inset-0 bg-brand-neon-green/30 rounded-full blur-xl animate-glow-pulse" />
          <div className="relative bg-gradient-to-br from-brand-neon-green to-brand-neon-green-dark p-5 rounded-full border border-brand-neon-green/50">
            <User className="w-8 h-8 text-brand-black" />
          </div>
        </motion.div>
        
        <div className="flex-1">
          <motion.h1 
            className="text-4xl font-bold text-white mb-2 leading-tight"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {greeting.split(userName)[0]}
            <span className="text-gradient-neon">{userName}</span>
            {greeting.split(userName)[1]}
          </motion.h1>
          <motion.p 
            className="text-brand-gray-300 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {stats.creatives_today > 0 
              ? `Você já criou ${stats.creatives_today} criativos hoje!` 
              : 'Vamos começar a criar algo incrível hoje!'
            }
          </motion.p>
        </div>
      </div>

      {/* Grid de Estatísticas Rápidas */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, staggerChildren: 0.1 }}
      >
        <StatMini
          icon={Zap}
          label="Hoje"
          value={stats.creatives_today}
          target={3}
          color="neon"
        />
        <StatMini
          icon={Target}
          label="Taxa de Sucesso"
          value={`${stats.success_rate}%`}
          color="success"
        />
        <StatMini
          icon={Flame}
          label="Sequência"
          value={`${stats.current_streak} dias`}
          color="orange"
        />
        <StatMini
          icon={Trophy}
          label={`Nível ${stats.user_level}`}
          value={`${stats.achievement_points} XP`}
          color="purple"
        />
      </motion.div>

      {/* Ações Rápidas */}
      <motion.div 
        className="flex flex-wrap gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Button className="btn-neon group" asChild>
          <Link href="/new">
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Criar Novo Criativo
          </Link>
        </Button>
        
        <Button variant="ghost" className="btn-ghost" asChild>
          <Link href="/gallery">
            <Grid3X3 className="w-5 h-5 mr-2" />
            Ver Galeria ({stats.total_creatives})
          </Link>
        </Button>
        
        {queueCount > 0 && (
          <Button variant="ghost" className="btn-ghost relative" asChild>
            <Link href="/queue">
              <Clock className="w-5 h-5 mr-2" />
              Fila de Processamento
              <motion.span 
                className="ml-2 bg-brand-neon-green text-brand-black px-2 py-1 rounded-full text-xs font-bold"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {queueCount}
              </motion.span>
            </Link>
          </Button>
        )}
        
        <Button variant="ghost" className="btn-ghost ml-auto group" asChild>
          <Link href="/analytics">
            Estatísticas Completas
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </Button>
      </motion.div>
    </motion.section>
  )
} 