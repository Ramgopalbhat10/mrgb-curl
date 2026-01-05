import { cn } from '@/lib/utils'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn(
      "w-64 lg:w-72 bg-muted/30 border-r border-border p-3",
      "flex flex-col gap-3",
      "hidden md:flex",
      className
    )}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        Collections
      </div>
      <div className="text-sm text-muted-foreground">
        No collections yet
      </div>
      
      <div className="text-xs uppercase tracking-wide text-muted-foreground mt-4">
        Drafts
      </div>
      <div className="text-sm text-muted-foreground">
        No drafts yet
      </div>
      
      <div className="text-xs uppercase tracking-wide text-muted-foreground mt-4">
        History
      </div>
      <div className="text-sm text-muted-foreground">
        No request history
      </div>
    </div>
  )
}
