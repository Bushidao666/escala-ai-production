import { cn } from '@/shared/lib/utils'

export function InsightsCarouselSkeleton({
  className,
}: {
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative h-48 w-full animate-pulse rounded-xl border border-white/10 bg-purple-900/10',
        className,
      )}
    >
      <div className="flex h-full flex-col items-center justify-center space-y-2">
        <div className="h-10 w-10 rounded-full bg-yellow-500/10" />
        <div className="h-5 w-1/3 rounded-lg bg-gray-700/50" />
        <div className="h-4 w-4/5 rounded-lg bg-gray-700/50" />
        <div className="h-9 w-24 rounded-lg bg-gray-700/50" />
      </div>
    </div>
  )
} 