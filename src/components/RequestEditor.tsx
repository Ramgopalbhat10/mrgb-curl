import { useEffect, useState } from 'react'
import { UrlInput } from './UrlInput'
import { SendButton } from './SendButton'
import type { HttpMethod } from '@/schemas'
import { cn } from '@/lib/utils'
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
      "flex-1 bg-background",
      "flex flex-col min-w-0",
      className
    )}>
      {/* URL Bar Row */}
      <div className="flex items-center gap-3 px-4 py-3">
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

      {/* Request Tabs Row */}
      <div className="flex items-center gap-1 px-4 py-1 border-b border-border">
        <button className="px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50 rounded-sm">
          Params
        </button>
        <button className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-sm">
          Headers
        </button>
        <button className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-sm">
          Auth
        </button>
        <button className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-sm">
          Body
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
  )
}
