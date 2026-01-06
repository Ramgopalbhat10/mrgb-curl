import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { QueryParam } from '@/schemas'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2 } from 'lucide-react'

interface ParamsEditorProps {
	params: QueryParam[]
	url: string
	onChange: (params: QueryParam[]) => void
	onUrlChange?: (url: string) => void
	className?: string
}

// Parse URL to extract query parameters
function parseUrlParams(url: string): QueryParam[] {
	try {
		const urlObj = new URL(url)
		const params: QueryParam[] = []
		urlObj.searchParams.forEach((value, key) => {
			params.push({ key, value, enabled: true })
		})
		return params
	} catch {
		return []
	}
}

// Build URL with query parameters
function buildUrlWithParams(baseUrl: string, params: QueryParam[]): string {
	try {
		const urlObj = new URL(baseUrl)
		// Clear existing params
		urlObj.search = ''
		// Add enabled params
		params.filter(p => p.enabled && p.key).forEach(p => {
			urlObj.searchParams.append(p.key, p.value)
		})
		return urlObj.toString()
	} catch {
		return baseUrl
	}
}

export function ParamsEditor({ params, url, onChange, onUrlChange, className }: ParamsEditorProps) {
	const [isInitialized, setIsInitialized] = useState(false)

	// Parse URL on mount to sync params
	useEffect(() => {
		if (!isInitialized && url) {
			const parsedParams = parseUrlParams(url)
			if (parsedParams.length > 0) {
				onChange(parsedParams)
			}
			setIsInitialized(true)
		}
	}, [url, isInitialized, onChange])

	const addParam = () => {
		onChange([...params, { key: '', value: '', enabled: true }])
	}

	const updateParam = (index: number, field: keyof QueryParam, newValue: string | boolean) => {
		const newParams = [...params]
		newParams[index] = { ...newParams[index], [field]: newValue }
		onChange(newParams)

		// Sync with URL
		if (onUrlChange) {
			const newUrl = buildUrlWithParams(url, newParams)
			onUrlChange(newUrl)
		}
	}

	const removeParam = (index: number) => {
		const newParams = params.filter((_, i) => i !== index)
		onChange(newParams)

		// Sync with URL
		if (onUrlChange) {
			const newUrl = buildUrlWithParams(url, newParams)
			onUrlChange(newUrl)
		}
	}

	const toggleParam = (index: number) => {
		updateParam(index, 'enabled', !params[index].enabled)
	}

	return (
		<div className={cn("", className)}>
			{/* Parameter rows */}
			<div className="">
				{params.map((param, index) => (
					<div key={index} className="flex items-center gap-2 mb-2">
						<Checkbox
							checked={param.enabled}
							onCheckedChange={() => toggleParam(index)}
							className="h-4 w-4"
						/>
						<Input
							placeholder="Parameter name"
							value={param.key}
							onChange={(e) => updateParam(index, 'key', e.target.value)}
							className={cn(
								"flex-1 font-mono text-xs h-8 border-0",
								!param.enabled && "opacity-50"
							)}
							disabled={!param.enabled}
						/>
						<Input
							placeholder="Value"
							value={param.value}
							onChange={(e) => updateParam(index, 'value', e.target.value)}
							className={cn(
								"flex-1 font-mono text-xs h-8 border-0",
								!param.enabled && "opacity-50"
							)}
							disabled={!param.enabled}
						/>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => removeParam(index)}
							className="p-2 text-muted-foreground hover:text-destructive"
						>
							<Trash2 className="h-3 w-3" />
						</Button>
					</div>
				))}
			</div>

			{/* Add parameter button */}
			<Button
				variant="outline"
				size="sm"
				onClick={addParam}
				className="h-6 text-xs"
			>
				<Plus className="h-3 w-3 mr-1" />
				Add Parameter
			</Button>

			{params.length === 0 && (
				<div className="text-sm text-muted-foreground py-4 text-center">
					No query parameters. Click "Add Parameter" to add one.
				</div>
			)}
		</div>
	)
}
