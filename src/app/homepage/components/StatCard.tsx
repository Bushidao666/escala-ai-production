'use client'

import { IconProps } from '@radix-ui/react-icons'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<IconProps>
  className?: string
  valueClassName?: string
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function StatCard({
  title,
  value,
  icon: Icon,
  className,
  valueClassName,
}: StatCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-4 shadow-lg backdrop-blur-lg transition-all duration-300 hover:border-white/20 hover:shadow-2xl',
        className,
      )}
    >
      {/* Glow effect */}
      <div className="absolute -top-1/2 -left-1/2 h-full w-full animate-glow-rotate bg-gradient-to-r from-green-400/20 via-cyan-400/20 to-blue-400/20 opacity-0 transition-opacity duration-500 group-hover:opacity-50" />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-300">{title}</p>
          <Icon className="h-5 w-5 text-gray-400 transition-colors group-hover:text-white" />
        </div>
        <p
          className={cn(
            'mt-2 text-3xl font-bold text-white transition-colors group-hover:text-green-300',
            valueClassName,
          )}
        >
          {value}
        </p>
      </div>
    </motion.div>
  )
} 