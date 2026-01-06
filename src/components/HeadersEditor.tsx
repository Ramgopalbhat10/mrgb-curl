import { cn } from '@/lib/utils'
import { Header } from '@/schemas'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface HeadersEditorProps {
	headers: Header[]
	onChange: (headers: Header[]) => void
	className?: string
}

// Common header presets
const COMMON_HEADERS = [
	{ key: 'Content-Type', value: 'application/json' },
	{ key: 'Content-Type', value: 'application/x-www-form-urlencoded' },
	{ key: 'Content-Type', value: 'multipart/form-data' },
	{ key: 'Accept', value: 'application/json' },
	{ key: 'Accept', value: '*/*' },
	{ key: 'Authorization', value: 'Bearer ' },
	{ key: 'Authorization', value: 'Basic ' },
	{ key: 'Cache-Control', value: 'no-cache' },
	{ key: 'User-Agent', value: 'MRGBCurl/1.0' },
]

export function HeadersEditor({ headers, onChange, className }: HeadersEditorProps) {
	const addHeader = () => {
		onChange([...headers, { key: '', value: '' }])
	}

	const updateHeader = (index: number, field: 'key' | 'value', newValue: string) => {
		const newHeaders = [...headers]
		newHeaders[index] = { ...newHeaders[index], [field]: newValue }
		onChange(newHeaders)
	}

	const removeHeader = (index: number) => {
		const newHeaders = headers.filter((_, i) => i !== index)
		onChange(newHeaders)
	}

	const addPresetHeader = (preset: { key: string; value: string }) => {
		onChange([...headers, { key: preset.key, value: preset.value }])
	}

	return (
		<div className={cn("", className)}>
			{/* Header rows */}
			<div className="">
				{headers.map((header, index) => (
					<div key={index} className="flex items-center gap-2 mb-2">
						<Input
							placeholder="Header name"
							value={header.key}
							onChange={(e) => updateHeader(index, 'key', e.target.value)}
							className="flex-1 font-mono text-xs h-8 border-0"
						/>
						<Input
							placeholder="Value"
							value={header.value}
							onChange={(e) => updateHeader(index, 'value', e.target.value)}
							className="flex-1 font-mono text-xs h-8 border-0"
						/>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => removeHeader(index)}
							className="p-2 text-muted-foreground hover:text-destructive"
						>
							<Trash2 className="h-3 w-3" />
						</Button>
					</div>
				))}
			</div>

			{/* Add header buttons */}
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={addHeader}
					className="h-6 text-xs"
				>
					<Plus className="h-3 w-3 mr-1" />
					Add Header
				</Button>

				<DropdownMenu>
					<DropdownMenuTrigger>
						<Button variant="outline" size="sm" className="h-6 text-xs">
							Presets
							<ChevronDown className="h-3 w-3 ml-1" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-64">
						{COMMON_HEADERS.map((preset, index) => (
							<DropdownMenuItem
								key={index}
								onClick={() => addPresetHeader(preset)}
								className="font-mono text-xs"
							>
								{preset.key}: {preset.value}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{headers.length === 0 && (
				<div className="text-sm text-muted-foreground py-4 text-center">
					No headers added. Click "Add Header" to add one.
				</div>
			)}
		</div>
	)
}
