import { cn } from '@/lib/utils'
import { HttpMethod } from '@/schemas'
import { UrlInput } from './UrlInput'
import { SendButton } from './SendButton'

interface UrlBarProps {
	url: string
	method: HttpMethod
	onUrlChange: (url: string) => void
	onMethodChange: (method: HttpMethod) => void
	onSend: () => void
	isLoading?: boolean
	className?: string
}

export function UrlBar({
	url,
	method,
	onUrlChange,
	onMethodChange,
	onSend,
	isLoading = false,
	className
}: UrlBarProps) {
	return (
		<div className={cn(
			"flex items-center gap-4 px-4 py-3 border-b border-border border-b-muted/50",
			className
		)}>
			<div className="flex-1 min-w-0">
				<UrlInput
					value={url}
					method={method}
					onUrlChange={onUrlChange}
					onMethodChange={onMethodChange}
				/>
			</div>
			<SendButton
				onClick={onSend}
				disabled={!url}
				isLoading={isLoading}
				className="shrink-0"
			/>
		</div>
	)
}
