import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { HttpMethod } from '@/schemas'
import { UrlInput } from './UrlInput'
import { SendButton } from './SendButton'
import { useHttp } from '@/hooks/useHttp'

interface RequestEditorProps {
  className?: string
  onResponseReceived?: (response: any) => void
}

export function RequestEditor({ className, onResponseReceived }: RequestEditorProps) {
  const [url, setUrl] = useState('')
  const [method, setMethod] = useState<HttpMethod>('GET')
  const { sendRequest, isLoading, error, data } = useHttp()

  const handleSendRequest = async () => {
    if (!url) return

    try {
      await sendRequest.mutateAsync({
        method,
        url,
        headers: {},
        body: method !== 'GET' ? '{}' : undefined,
      })
    } catch (err) {
      // Error is handled by the hook
    }
  }

  // Keyboard shortcut support (Ctrl+Enter)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        handleSendRequest()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [url, method])

  // Update parent component when response is received
  if (data && onResponseReceived) {
    onResponseReceived(data)
  }

  return (
    <div className={cn(
      "flex-1 bg-background border-r border-border",
      "flex flex-col",
      "w-full",
      className
    )}>
      <div className="p-4 border-b border-border">
        <div className="text-lg font-semibold text-foreground">
          Request Editor
        </div>
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        {/* URL Input Section */}
        <div className="space-y-4">
          <UrlInput
            value={url}
            method={method}
            onUrlChange={setUrl}
            onMethodChange={setMethod}
          />
        </div>

        {/* Request Configuration Tabs */}
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground font-medium">
            Request Configuration
          </div>
          
          {/* Tab Headers */}
          <div className="flex gap-4 border-b border-border">
            <button className="px-3 py-2 text-sm font-medium text-foreground border-b-2 border-primary">
              Params
            </button>
            <button className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              Headers
            </button>
            <button className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              Body
            </button>
            <button className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              Auth
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Query parameters will be displayed here
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="text-sm text-destructive">
              {error.message}
            </div>
          </div>
        )}

        {/* Send Button Section */}
        <div className="pt-4">
          <SendButton 
            onClick={handleSendRequest}
            disabled={!url}
            isLoading={isLoading}
          />
          <div className="text-xs text-muted-foreground mt-2">
            Press Ctrl+Enter to send request
          </div>
        </div>
      </div>
    </div>
  )
}
