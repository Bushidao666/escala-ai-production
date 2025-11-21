import { cn } from '@/shared/lib/utils'

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-white/5 p-4',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-700/50" />
        <div className="h-5 w-5 animate-pulse rounded-md bg-gray-700/50" />
      </div>
      <div className="mt-2 h-8 w-1/3 animate-pulse rounded bg-gray-600/50" />
    </div>
  )
} 