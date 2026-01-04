import { cn } from '@/lib/utils'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn(
      "w-64 lg:w-80 bg-muted/30 border-r border-border p-4",
      "flex flex-col gap-4",
      "hidden md:flex",
      className
    )}>
      <div className="text-lg font-semibold text-foreground">
        Collections
      </div>
      <div className="text-sm text-muted-foreground">
        No collections yet
      </div>
      
      <div className="text-lg font-semibold text-foreground mt-6">
        History
      </div>
      <div className="text-sm text-muted-foreground">
        No request history
      </div>
    </div>
  )
}
