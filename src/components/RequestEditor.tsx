import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { HttpMethod } from '@/schemas'
import { UrlInput } from './UrlInput'
import { SendButton } from './SendButton'
import { useHttp } from '@/hooks/useHttp'

interface RequestEditorProps {
  className?: string
  onResponseReceived?: (response: any) => void
  onRequestStateChange?: (state: { isLoading: boolean; error: string | null }) => void
}

export function RequestEditor({ className, onResponseReceived, onRequestStateChange }: RequestEditorProps) {
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
  useEffect(() => {
    if (data && onResponseReceived) {
      onResponseReceived(data)
    }
  }, [data, onResponseReceived])

  useEffect(() => {
    if (onRequestStateChange) {
      onRequestStateChange({
        isLoading,
        error: error ? error.message : null,
      })
    }
  }, [isLoading, error, onRequestStateChange])

  return (
    <div className={cn(
      "flex-1 bg-background lg:border-r border-border",
      "flex flex-col min-w-0",
      className
    )}>
      <div className="flex items-center gap-3 border-b border-border p-2">
        <div className="flex-1 min-w-0">
          <UrlInput
            value={url}
            method={method}
            onUrlChange={setUrl}
            onMethodChange={setMethod}
          />
        </div>
        <SendButton 
          onClick={handleSendRequest}
          disabled={!url}
          isLoading={isLoading}
          className="shrink-0"
        />
      </div>
      
      <div className="flex-1 space-y-3 overflow-auto p-3">
        {/* Request Configuration Tabs */}
        <div className="flex items-center gap-4 border-b border-border pb-2 text-sm">
          <button className="px-2 py-1 text-sm font-medium text-foreground border-b-2 border-primary">
            Params
          </button>
          <button className="px-2 py-1 text-sm font-medium text-muted-foreground hover:text-foreground">
            Headers
          </button>
          <button className="px-2 py-1 text-sm font-medium text-muted-foreground hover:text-foreground">
            Body
          </button>
          <button className="px-2 py-1 text-sm font-medium text-muted-foreground hover:text-foreground">
            Auth
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="text-sm text-muted-foreground">
          Query parameters will be displayed here
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="text-xs text-destructive">
              {error.message}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Send request <kbd className="ml-1 rounded border border-border bg-muted/50 px-1 py-0.5 text-[10px] font-mono">Ctrl</kbd>{' '}
          + <kbd className="rounded border border-border bg-muted/50 px-1 py-0.5 text-[10px] font-mono">Enter</kbd>
        </div>
      </div>
    </div>
  )
}
