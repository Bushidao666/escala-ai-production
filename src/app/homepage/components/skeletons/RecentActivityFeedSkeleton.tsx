import { cn } from '@/shared/lib/utils'

function ActivityItemSkeleton() {
  return (
    <div className="flex items-start gap-4 p-3">
      <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-gray-700/50" />
      <div className="w-full flex-grow space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-gray-600/50" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-gray-700/50" />
      </div>
    </div>
  )
}

export function RecentActivityFeedSkeleton({
  className,
}: {
  className?: string
}) {
  return (
    <div className={cn('space-y-4', className)}>
      <ActivityItemSkeleton />
      <ActivityItemSkeleton />
      <ActivityItemSkeleton />
    </div>
  )
} 