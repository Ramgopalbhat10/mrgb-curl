import { useMemo, useState, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import { HttpResponse } from '@/schemas'
import { Badge } from '@/components/ui/badge'

interface ResponseViewerProps {
  className?: string
  response?: HttpResponse | null
  isLoading?: boolean
  error?: string | null
  style?: CSSProperties
}

function getStatusTextColor(status: number): string {
  if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400'
  if (status >= 300 && status < 400) return 'text-yellow-600 dark:text-yellow-400'
  if (status >= 400 && status < 500) return 'text-orange-600 dark:text-orange-400'
  if (status >= 500) return 'text-red-600 dark:text-red-400'
  return 'text-gray-600 dark:text-gray-400'
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

function formatJson(json: string): string {
  try {
    return JSON.stringify(JSON.parse(json), null, 2)
  } catch {
    return json
  }
}

export function ResponseViewer({ 
  className, 
  response, 
  isLoading, 
  error,
  style
}: ResponseViewerProps) {
  const hasResponse = response && !isLoading && !error
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body')
  const statusLabel = isLoading
    ? 'Loading'
    : error
      ? 'Error'
      : hasResponse && response
        ? `${response.status}`
        : 'Idle'
  const statusTone = error
    ? 'text-destructive'
    : isLoading
      ? 'text-muted-foreground'
      : hasResponse && response
        ? getStatusTextColor(response.status)
        : 'text-muted-foreground'

  const formattedBody = useMemo(() => {
    if (!response) return ''
    return formatJson(response.body)
  }, [response])

  const bodyLines = useMemo(() => {
    if (!formattedBody) return ['']
    return formattedBody.split('\n')
  }, [formattedBody])

  return (
    <div className={cn(
      "flex flex-col min-w-[280px] shrink-0 bg-muted/10",
      "hidden lg:flex",
      className
    )} style={style}>
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="text-sm font-semibold text-foreground">Response</div>
        <Badge
          variant="secondary"
          className={cn(
            "text-xs font-mono",
            statusTone
          )}
        >
          {statusLabel}
        </Badge>
      </div>
      
      <div className="flex-1 space-y-3 overflow-auto p-3">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-muted-foreground">Loading response...</div>
          </div>
        )}

        {error && (
          <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="text-xs text-destructive">{error}</div>
          </div>
        )}

        {hasResponse && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono">HTTP</span>
              <Badge 
                variant="secondary" 
                className={cn("font-mono", getStatusTextColor(response.status))}
              >
                {response.status}
              </Badge>
              <span>{response.statusText}</span>
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>Time: <span className="font-mono text-foreground">{formatTime(response.responseTime)}</span></span>
              <span>Size: <span className="font-mono text-foreground">{formatBytes(response.size)}</span></span>
              <span>At: <span className="font-mono text-foreground">{response.timestamp.toLocaleTimeString()}</span></span>
            </div>

            <div className="flex items-center gap-4 border-b border-border pb-2 text-sm">
              <button
                className={cn(
                  "px-2 py-1 text-sm font-medium",
                  activeTab === 'body'
                    ? "text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setActiveTab('body')}
              >
                Body
              </button>
              <button
                className={cn(
                  "px-2 py-1 text-sm font-medium",
                  activeTab === 'headers'
                    ? "text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setActiveTab('headers')}
              >
                Headers
              </button>
            </div>

            {activeTab === 'headers' && (
              <div className="h-64 overflow-auto rounded-md border border-border bg-background/60">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-background/80 text-muted-foreground">
                    <tr>
                      <th className="px-2 py-1 text-left font-medium">Header</th>
                      <th className="px-2 py-1 text-left font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {response.headers.map((header, index) => (
                      <tr key={index} className="border-t border-border/60">
                        <td className="px-2 py-1 text-muted-foreground">{header.key}</td>
                        <td className="px-2 py-1 font-mono text-foreground">{header.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'body' && (
              <div className="h-64 overflow-auto rounded-md border border-border bg-background/60">
                <div className="grid grid-cols-[auto_1fr] text-xs font-mono">
                  <div className="select-none border-r border-border/60 bg-muted/30 px-2 py-2 text-right text-muted-foreground">
                    {bodyLines.map((_, index) => (
                      <div key={index} className="leading-5">
                        {index + 1}
                      </div>
                    ))}
                  </div>
                  <div className="px-2 py-2 text-foreground">
                    {bodyLines.map((line, index) => (
                      <div key={index} className="leading-5 whitespace-pre">
                        {line || ' '}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!hasResponse && !isLoading && !error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-muted-foreground">
              Send a request to see the response here
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
