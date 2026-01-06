import { useSettingsStore } from '@/stores/settingsStore'
import { Sun, Moon, Monitor } from 'lucide-react'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
	const { theme, setTheme } = useSettingsStore()

	const getIcon = () => {
		switch (theme) {
			case 'light':
				return <Sun className="h-4 w-4" />
			case 'dark':
				return <Moon className="h-4 w-4" />
			default:
				return <Monitor className="h-4 w-4" />
		}
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className="inline-flex items-center justify-center h-7 w-7 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted/50"
			>
				{getIcon()}
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => setTheme('light')}>
					<Sun className="h-4 w-4 mr-2" />
					Light
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('dark')}>
					<Moon className="h-4 w-4 mr-2" />
					Dark
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('system')}>
					<Monitor className="h-4 w-4 mr-2" />
					System
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
