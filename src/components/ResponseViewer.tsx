import { useMemo, useState, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import { HttpResponse } from '@/schemas'

interface ResponseViewerProps {
  className?: string
  response?: HttpResponse | null
  isLoading?: boolean
  error?: string | null
  style?: CSSProperties
  method?: string
}

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return 'text-green-500'
  if (status >= 300 && status < 400) return 'text-yellow-500'
  if (status >= 400 && status < 500) return 'text-orange-500'
  if (status >= 500) return 'text-red-500'
  return 'text-muted-foreground'
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

// Simple JSON syntax highlighting
function highlightJson(json: string): React.ReactNode[] {
  try {
    const parsed = JSON.parse(json)
    const formatted = JSON.stringify(parsed, null, 2)
    const lines = formatted.split('\n')

    return lines.map((line, i) => {
      // Highlight different JSON parts
      const highlighted = line
        .replace(/"([^"]+)":/g, '<span class="text-cyan-400">"$1"</span>:') // keys
        .replace(/: "([^"]*)"/g, ': <span class="text-green-400">"$1"</span>') // string values
        .replace(/: (\d+)/g, ': <span class="text-purple-400">$1</span>') // numbers
        .replace(/: (true|false)/g, ': <span class="text-orange-400">$1</span>') // booleans
        .replace(/: (null)/g, ': <span class="text-red-400">$1</span>') // null

      return (
        <div key={i} className="leading-5 whitespace-pre" dangerouslySetInnerHTML={{ __html: highlighted || ' ' }} />
      )
    })
  } catch {
    return [<div key={0} className="text-foreground whitespace-pre">{json}</div>]
  }
}

export function ResponseViewer({
  className,
  response,
  isLoading,
  error,
  style,
  method = 'GET'
}: ResponseViewerProps) {
  const hasResponse = response && !isLoading && !error
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body')

  const formattedBody = useMemo(() => {
    if (!response) return ''
    try {
      return JSON.stringify(JSON.parse(response.body), null, 2)
    } catch {
      return response.body
    }
  }, [response])

  const bodyLines = useMemo(() => {
    if (!formattedBody) return ['']
    return formattedBody.split('\n')
  }, [formattedBody])

  return (
    <div className={cn(
      "flex flex-col min-w-[280px] shrink-0 bg-background",
      className
    )} style={style}>
      {/* Header Row - Request GET / Response 200 tabs */}
      <div className="flex items-center gap-2 px-4 py-2">
        <span className="text-sm text-muted-foreground">Request</span>
        <span className="text-sm font-bold text-primary">{method}</span>
        <span className="text-sm text-muted-foreground ml-4">Response</span>
        {hasResponse && response && (
          <span className={cn("text-sm font-bold", getStatusColor(response.status))}>
            {response.status}
          </span>
        )}
      </div>

      {/* Tabs Row - aligned with request tabs */}
      <div className="flex items-center gap-1 px-4 py-1">
        {hasResponse && response && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mr-auto">
            <span className="font-mono">HTTP/1.1</span>
            <span className={cn("font-bold", getStatusColor(response.status))}>
              {response.status}
            </span>
            <span className="text-foreground">{response.statusText}</span>
            <span className="text-muted-foreground">({response.headers.length} headers)</span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {isLoading && (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-sm text-muted-foreground">Loading response...</div>
          </div>
        )}

        {error && (
          <div className="p-4">
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="text-sm text-destructive">{error}</div>
            </div>
          </div>
        )}

        {hasResponse && response && (
          <div className="h-full flex flex-col">
            {/* Tab Buttons */}
            <div className="flex items-center gap-1 px-4 py-2">
              <button
                className={cn(
                  "px-3 py-1 text-sm font-medium rounded-sm",
                  activeTab === 'body'
                    ? "text-foreground bg-muted/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
                onClick={() => setActiveTab('body')}
              >
                Body
              </button>
              <button
                className={cn(
                  "px-3 py-1 text-sm font-medium rounded-sm",
                  activeTab === 'headers'
                    ? "text-foreground bg-muted/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
                onClick={() => setActiveTab('headers')}
              >
                Headers
              </button>
            </div>

            {/* Headers View */}
            {activeTab === 'headers' && (
              <div className="flex-1 overflow-auto p-4">
                <div className="space-y-1 font-mono text-sm">
                  {response.headers.map((header, index) => (
                    <div key={index} className="flex gap-4">
                      <span className="text-cyan-400 underline underline-offset-2 decoration-dotted cursor-help shrink-0">
                        {header.key}
                      </span>
                      <span className="text-foreground break-all">
                        {header.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Body View */}
            {activeTab === 'body' && (
              <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-[auto_1fr] text-sm font-mono">
                  {/* Line Numbers */}
                  <div className="select-none px-3 py-3 text-right text-muted-foreground">
                    {bodyLines.map((_, index) => (
                      <div key={index} className="leading-5">
                        {index + 1}
                      </div>
                    ))}
                  </div>
                  {/* Code Content */}
                  <div className="px-3 py-3 overflow-x-auto">
                    {highlightJson(response.body)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!hasResponse && !isLoading && !error && (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-sm text-muted-foreground">
              Send a request to see the response here
            </div>
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      {hasResponse && response && (
        <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
          <span className="font-mono">JSON</span>
          <span>
            {formatBytes(response.size)}, {formatTime(response.responseTime)}
          </span>
        </div>
      )}
    </div>
  )
}
