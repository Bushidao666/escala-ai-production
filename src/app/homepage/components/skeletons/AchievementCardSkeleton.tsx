import { cn } from '@/shared/lib/utils'

export function AchievementCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4',
        className,
      )}
    >
      <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-gray-700/50" />
      <div className="flex-grow space-y-2">
        <div className="h-4 w-4/5 animate-pulse rounded bg-gray-600/50" />
        <div className="h-3 w-3/5 animate-pulse rounded bg-gray-700/50" />
      </div>
    </div>
  )
} 