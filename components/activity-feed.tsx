import { ActivityItem } from './dashboard-types'

type ActivityFeedProps = {
  items: ActivityItem[]
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="space-y-2.5 font-mono-ui text-xs">
      {items.map((item) => (
        <div key={item.id} className="flex items-start">
          <span className="mr-3 shrink-0 text-[#8194ba]">{item.time}</span>
          <span
            className={
              item.status === 'success'
                ? 'text-[#b6c4e2]'
                : item.status === 'warning'
                  ? 'text-[#f3c27b]'
                  : 'animate-pulse text-[#93bbff]'
            }
          >
            {item.status === 'loading' ? '> ' : ''}
            {item.text}
          </span>
        </div>
      ))}
    </div>
  )
}
