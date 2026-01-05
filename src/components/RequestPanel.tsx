import { cn } from '@/lib/utils'

interface RequestPanelProps {
	method: string
	error: string | null
	className?: string
}

export function RequestPanel({ method, error, className }: RequestPanelProps) {
	return (
		<div className={cn(
			"flex flex-col bg-background",
			className
		)}>
			{/* Request Tabs */}
			<div className="flex items-center gap-1 px-4 py-2">
				<button className="px-3 py-1 text-sm font-medium text-foreground hover:bg-muted/50 rounded-sm">
					Params
				</button>
				<button className="px-3 py-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-sm">
					Headers
				</button>
				<button className="px-3 py-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-sm">
					Auth
				</button>
				<button className="px-3 py-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-sm">
					Body
				</button>
			</div>

			{/* Tab Content Area */}
			<div className="flex-1 overflow-auto p-4">
				<div className="text-sm text-muted-foreground">
					Query parameters will be displayed here
				</div>

				{/* Error Display */}
				{error && (
					<div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
						<div className="text-sm text-destructive">{error}</div>
					</div>
				)}

				<div className="mt-4 text-xs text-muted-foreground">
					Send request{' '}
					<kbd className="ml-1 px-1 py-0.5 text-[10px] font-mono">Ctrl</kbd>
					{' '}+{' '}
					<kbd className="px-1 py-0.5 text-[10px] font-mono">Enter</kbd>
				</div>
			</div>

			{/* Footer Status Bar */}
			<div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
				<div className="flex items-center gap-2">
					<span>None</span>
				</div>
			</div>
		</div>
	)
}
