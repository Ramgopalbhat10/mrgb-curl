import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SendButtonProps {
  onClick?: () => void
  disabled?: boolean
  isLoading?: boolean
  className?: string
}

export function SendButton({ 
  onClick, 
  disabled = false, 
  isLoading = false, 
  className 
}: SendButtonProps) {
  return (
    <Button 
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "bg-green-600 hover:bg-green-700 text-white",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "transition-colors duration-200",
        className
      )}
    >
      {isLoading && (
        <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {isLoading ? 'Sending...' : 'Send'}
    </Button>
  )
}
