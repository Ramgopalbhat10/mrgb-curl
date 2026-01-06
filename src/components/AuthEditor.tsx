import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

type AuthType = 'none' | 'basic' | 'bearer' | 'api-key'

interface AuthConfig {
	type: AuthType
	basic?: { username: string; password: string }
	bearer?: { token: string }
	apiKey?: { key: string; value: string; addTo: 'header' | 'query' }
}

interface AuthEditorProps {
	auth: AuthConfig
	onChange: (auth: AuthConfig) => void
	className?: string
}

const AUTH_TYPES: { value: AuthType; label: string }[] = [
	{ value: 'none', label: 'No Auth' },
	{ value: 'basic', label: 'Basic Auth' },
	{ value: 'bearer', label: 'Bearer Token' },
	{ value: 'api-key', label: 'API Key' },
]

export function AuthEditor({ auth, onChange, className }: AuthEditorProps) {
	const handleTypeChange = (type: AuthType) => {
		onChange({
			type,
			basic: type === 'basic' ? { username: '', password: '' } : undefined,
			bearer: type === 'bearer' ? { token: '' } : undefined,
			apiKey: type === 'api-key' ? { key: '', value: '', addTo: 'header' } : undefined,
		})
	}

	return (
		<div className={cn("", className)}>
			{/* Auth type selector */}
			<div className="">
				<Label className="text-sm font-medium mb-2">Authorization Type</Label>
				<Select value={auth.type} onValueChange={(value) => value && handleTypeChange(value as AuthType)}>
					<SelectTrigger className="w-48 h-6">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{AUTH_TYPES.map((type) => (
							<SelectItem key={type.value} value={type.value}>
								{type.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Basic Auth */}
			{auth.type === 'basic' && (
				<div className="space-y-3 p-4 mt-2 rounded-md border border-border bg-muted/20">
					<div className="space-y-2">
						<Label className="text-sm">Username</Label>
						<Input
							placeholder="Enter username"
							value={auth.basic?.username || ''}
							onChange={(e) => onChange({
								...auth,
								basic: { ...auth.basic!, username: e.target.value }
							})}
							className="h-8 border-0"
						/>
					</div>
					<div className="space-y-2">
						<Label className="text-sm">Password</Label>
						<Input
							type="password"
							placeholder="Enter password"
							value={auth.basic?.password || ''}
							onChange={(e) => onChange({
								...auth,
								basic: { ...auth.basic!, password: e.target.value }
							})}
							className="h-8 border-0"
						/>
					</div>
				</div>
			)}

			{/* Bearer Token */}
			{auth.type === 'bearer' && (
				<div className="space-y-3 p-4 mt-2 rounded-md border border-border bg-muted/20">
					<div className="space-y-2">
						<Label className="text-sm">Token</Label>
						<Input
							placeholder="Enter bearer token"
							value={auth.bearer?.token || ''}
							onChange={(e) => onChange({
								...auth,
								bearer: { token: e.target.value }
							})}
							className="h-8 border-0 font-mono"
						/>
					</div>
				</div>
			)}

			{/* API Key */}
			{auth.type === 'api-key' && (
				<div className="space-y-3 p-4 mt-2 rounded-md border border-border bg-muted/20">
					<div className="space-y-2">
						<Label className="text-sm">Key</Label>
						<Input
							placeholder="e.g., X-API-Key"
							value={auth.apiKey?.key || ''}
							onChange={(e) => onChange({
								...auth,
								apiKey: { ...auth.apiKey!, key: e.target.value }
							})}
							className="h-8 border-0 font-mono"
						/>
					</div>
					<div className="space-y-2">
						<Label className="text-sm">Value</Label>
						<Input
							placeholder="Enter API key value"
							value={auth.apiKey?.value || ''}
							onChange={(e) => onChange({
								...auth,
								apiKey: { ...auth.apiKey!, value: e.target.value }
							})}
							className="h-8 border-0 font-mono"
						/>
					</div>
					<div className="space-y-2">
						<Label className="text-sm">Add to</Label>
						<Select
							value={auth.apiKey?.addTo || 'header'}
							onValueChange={(value) => value && onChange({
								...auth,
								apiKey: { ...auth.apiKey!, addTo: value as 'header' | 'query' }
							})}
						>
							<SelectTrigger className="w-32 h-9">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="header">Header</SelectItem>
								<SelectItem value="query">Query Params</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			)}

			{auth.type === 'none' && (
				<div className="text-sm text-muted-foreground py-4 text-center">
					This request does not use any authorization.
				</div>
			)}
		</div>
	)
}

export type { AuthConfig, AuthType }
