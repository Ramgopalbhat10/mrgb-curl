import { cn } from '@/lib/utils'
import { HttpResponse } from '@/schemas'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ResponseViewerProps {
  className?: string
  response?: HttpResponse | null
  isLoading?: boolean
  error?: string | null
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
  error 
}: ResponseViewerProps) {
  const hasResponse = response && !isLoading && !error

  return (
    <div className={cn(
      "w-96 lg:w-[400px] bg-muted/10",
      "flex flex-col",
      "hidden lg:flex",
      className
    )}>
      <div className="p-4 border-b border-border">
        <div className="text-lg font-semibold text-foreground">
          Response
        </div>
      </div>
      
      <div className="flex-1 p-4">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-muted-foreground">Loading response...</div>
          </div>
        )}

        {error && (
          <Card className="border-destructive">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-destructive">{error}</div>
            </CardContent>
          </Card>
        )}

        {hasResponse && (
          <div className="space-y-4">
            {/* Status and Metadata */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className={cn("font-mono", getStatusTextColor(response.status))}
                  >
                    {response.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {response.statusText}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Time: {formatTime(response.responseTime)}</span>
                  <span>Size: {formatBytes(response.size)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {response.timestamp.toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>

            {/* Response Headers */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Headers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 overflow-auto">
                  <div className="space-y-1">
                    {response.headers.map((header, index) => (
                      <div key={index} className="text-xs">
                        <span className="font-medium text-muted-foreground">
                          {header.key}:
                        </span>{' '}
                        <span className="font-mono">{header.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Body */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Body</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 overflow-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap wrap-break-word">
                    {formatJson(response.body)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!hasResponse && !isLoading && !error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-muted-foreground text-center">
              Send a request to see the response here
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
