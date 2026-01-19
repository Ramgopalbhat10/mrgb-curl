import {  useMemo, useState } from 'react'
import { Check, ChevronDown, ChevronRight, Copy, Download, MoreHorizontal, Search } from 'lucide-react'
import { JsonViewer } from './JsonViewer'
import type {CSSProperties} from 'react';
import type { Header, HttpResponse } from '@/schemas'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ResponseViewerProps {
  className?: string
  response?: HttpResponse | null
  isLoading?: boolean
  error?: string | null
  style?: CSSProperties
  method?: string
  requestHeaders?: Array<Header>
  requestBody?: string
  requestUrl?: string
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

// Parse cookies from Set-Cookie headers
function parseCookies(headers: Array<Header>): Array<{
  name: string
  value: string
  path?: string
  domain?: string
  expires?: string
  httpOnly?: boolean
  secure?: boolean
}> {
  return headers
    .filter(h => h.key.toLowerCase() === 'set-cookie')
    .map(h => {
      const parts = h.value.split(';').map(p => p.trim())
      const [nameValue, ...attrs] = parts
      const [name, value] = nameValue.split('=')

      const cookie: any = { name, value }
      attrs.forEach(attr => {
        const [key, val] = attr.split('=')
        const lowerKey = key.toLowerCase()
        if (lowerKey === 'path') cookie.path = val
        if (lowerKey === 'domain') cookie.domain = val
        if (lowerKey === 'expires') cookie.expires = val
        if (lowerKey === 'httponly') cookie.httpOnly = true
        if (lowerKey === 'secure') cookie.secure = true
      })
      return cookie
    })
}

type ViewMode = 'request' | 'response'
type ResponseTab = 'body' | 'headers' | 'cookies'

// Header row component with copy button
function HeaderRow({ headerKey, headerValue, minWidth }: { headerKey: string; headerValue: string; minWidth?: number }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(`${headerKey}: ${headerValue}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="group flex items-start gap-2 py-0.5">
      <span
        className="text-cyan-400 shrink-0 text-xs"
        style={minWidth ? { minWidth: `${minWidth}ch` } : undefined}
      >
        {headerKey}
      </span>
      <span className="text-foreground break-all text-xs flex-1">{headerValue}</span>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-opacity"
        title="Copy header"
      >
        {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
      </button>
    </div>
  )
}

export function ResponseViewer({
  className,
  response,
  isLoading,
  error,
  style,
  method = 'GET',
  requestHeaders = [],
  requestBody = '',
  requestUrl = '',
}: ResponseViewerProps) {
  const hasResponse = response && !isLoading && !error
  // Default to 'response' view mode
  const [viewMode, setViewMode] = useState<ViewMode>('response')
  const [activeTab, setActiveTab] = useState<ResponseTab>('body')
  const [headerSearch, setHeaderSearch] = useState('')
  const [copied, setCopied] = useState(false)
  const [collapsed, setCollapsed] = useState<number | boolean>(false)
  const [collapseKey, setCollapseKey] = useState(0)

  const parsedBody = useMemo(() => {
    if (!response) return null
    try {
      return JSON.parse(response.body)
    } catch {
      return null
    }
  }, [response])

  const filteredHeaders = useMemo(() => {
    if (!response) return []
    if (!headerSearch) return response.headers
    const lowerSearch = headerSearch.toLowerCase()
    return response.headers.filter(
      (h) => h.key.toLowerCase().includes(lowerSearch) || h.value.toLowerCase().includes(lowerSearch)
    )
  }, [response, headerSearch])

  const cookies = useMemo(() => {
    if (!response) return []
    return parseCookies(response.headers)
  }, [response])

  // Calculate max header key length for alignment
  const maxHeaderKeyLength = useMemo(() => {
    return filteredHeaders.reduce((max, h) => Math.max(max, h.key.length), 0)
  }, [filteredHeaders])

  // Calculate max request header key length for alignment
  const maxRequestHeaderKeyLength = useMemo(() => {
    return requestHeaders.reduce((max, h) => Math.max(max, h.key.length), 0)
  }, [requestHeaders])

  const handleCopy = (text?: string) => {
    const content = text || response?.body || ''
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveBody = () => {
    if (!response) return
    const blob = new Blob([response.body], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'response.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Extract path from URL for request display
  const requestPath = useMemo(() => {
    try {
      const urlObj = new URL(requestUrl)
      return urlObj.pathname + urlObj.search
    } catch {
      return requestUrl || '/'
    }
  }, [requestUrl])

  const responseTabs: Array<{ id: ResponseTab; label: string; count?: number }> = [
    { id: 'body', label: 'Body' },
    { id: 'headers', label: 'Headers', count: response?.headers.length },
    { id: 'cookies', label: 'Cookies', count: cookies.length },
  ]

  return (
    <div className={cn(
      "flex flex-col min-w-[280px] shrink-0 bg-background",
      className
    )} style={style}>
      {/* Header Row - Request/Response Toggle Buttons */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
        <button
          onClick={() => setViewMode('request')}
          className={cn(
            "px-2 py-1 text-sm rounded-sm transition-colors",
            viewMode === 'request'
              ? "bg-muted/50 text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          )}
        >
          Request <span className="font-bold text-primary">{method}</span>
        </button>
        <button
          onClick={() => setViewMode('response')}
          className={cn(
            "px-2 py-1 text-sm rounded-sm transition-colors",
            viewMode === 'response'
              ? "bg-muted/50 text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          )}
        >
          Response {hasResponse && response && (
            <span className={cn("font-bold", getStatusColor(response.status))}>
              {response.status}
            </span>
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
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

        {/* REQUEST VIEW */}
        {viewMode === 'request' && !isLoading && !error && (
          <div className="flex-1 overflow-auto p-4 font-mono response-scrollbar">
            {/* Request Line */}
            <div className="text-xs mb-4">
              <span className="text-muted-foreground">▸ </span>
              <span className="text-primary font-bold">{method}</span>
              <span className="text-foreground"> {requestPath} </span>
              <span className="text-muted-foreground">HTTP/1.1</span>
            </div>

            {/* Request Headers */}
            <div className="mb-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Request Headers</div>
              <div className="space-y-0.5">
                {requestHeaders.length > 0 ? (
                  requestHeaders.map((header, index) => (
                    <HeaderRow key={index} headerKey={header.key} headerValue={header.value} minWidth={maxRequestHeaderKeyLength} />
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground">No request headers</div>
                )}
              </div>
            </div>

            {/* Request Body */}
            {requestBody && (
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Request Body</div>
                <pre className="p-3 rounded-md border border-border bg-muted/20 overflow-x-auto text-xs">
                  {requestBody}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* RESPONSE VIEW */}
        {viewMode === 'response' && hasResponse && response && (
          <>
            {/* Tab Buttons with HTTP status */}
            <div className="flex items-center gap-1 px-4 py-2 border-b border-border shrink-0">
              {/* HTTP Status - moved here */}
              <span className="text-xs font-mono text-muted-foreground mr-2">
                HTTP/1.1 <span className={cn("font-bold", getStatusColor(response.status))}>{response.status}</span> {response.statusText}
              </span>

              {responseTabs.map((tab) => (
                <button
                  key={tab.id}
                  className={cn(
                    "px-2 py-1 text-sm font-medium rounded-sm transition-colors",
                    activeTab === tab.id
                      ? "text-foreground bg-muted/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  )}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-1 text-xs text-primary">({tab.count})</span>
                  )}
                </button>
              ))}

              {/* Right-aligned actions */}
              <div className="flex items-center gap-1 ml-auto">
                {/* Action Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="inline-flex items-center justify-center h-6 w-6 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-auto">
                    <DropdownMenuItem onClick={() => handleCopy()} className="text-xs whitespace-nowrap">
                      <Copy className="h-3 w-3 mr-2" />
                      Copy all
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      const headersText = response.headers.map(h => `${h.key}: ${h.value}`).join('\n')
                      handleCopy(headersText)
                    }} className="text-xs whitespace-nowrap">
                      <Copy className="h-3 w-3 mr-2" />
                      Copy headers
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopy(response.body)} className="text-xs whitespace-nowrap">
                      <Copy className="h-3 w-3 mr-2" />
                      Copy body
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSaveBody} className="text-xs whitespace-nowrap">
                      <Download className="h-3 w-3 mr-2" />
                      Save body...
                    </DropdownMenuItem>
                    {parsedBody && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => { setCollapsed(false); setCollapseKey(k => k + 1) }} className="text-xs whitespace-nowrap">
                          <ChevronDown className="h-3 w-3 mr-2" />
                          Expand all
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setCollapsed(1); setCollapseKey(k => k + 1) }} className="text-xs whitespace-nowrap">
                          <ChevronRight className="h-3 w-3 mr-2" />
                          Collapse all
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Quick Copy Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy()}
                  className="text-sm p-2"
                >
                  {copied ? (
                    <><Check className="h-3 w-3 mr-1" /> Copied</>
                  ) : (
                    <><Copy className="h-3 w-3 mr-1" /> Copy</>
                  )}
                </Button>
              </div>
            </div>

            {/* Body View */}
            {activeTab === 'body' && (
              <div className="flex-1 overflow-auto response-scrollbar p-2">
                {parsedBody ? (
                  <JsonViewer
                    key={collapseKey}
                    data={parsedBody}
                    collapsed={collapsed}
                  />
                ) : (
                  <pre className="font-mono text-xs whitespace-pre-wrap p-4">{response.body}</pre>
                )}
              </div>
            )}

            {/* Headers View */}
            {activeTab === 'headers' && (
              <div className="flex-1 overflow-auto p-4 response-scrollbar">
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input
                      placeholder="Filter headers..."
                      value={headerSearch}
                      onChange={(e) => setHeaderSearch(e.target.value)}
                      className="pl-7 h-7 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-0.5 font-mono">
                  {filteredHeaders.map((header, index) => (
                    <HeaderRow key={index} headerKey={header.key} headerValue={header.value} minWidth={maxHeaderKeyLength} />
                  ))}
                  {filteredHeaders.length === 0 && (
                    <div className="text-muted-foreground text-center py-4 text-xs">
                      No headers match your search
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cookies View */}
            {activeTab === 'cookies' && (
              <div className="flex-1 overflow-auto p-4 response-scrollbar">
                {cookies.length > 0 ? (
                  <div className="space-y-3">
                    {cookies.map((cookie, index) => (
                      <div key={index} className="p-3 rounded-md border border-border bg-muted/20">
                        <div className="font-mono text-xs">
                          <span className="text-cyan-400">{cookie.name}</span>
                          <span className="text-muted-foreground"> = </span>
                          <span className="text-green-400">{cookie.value}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                          {cookie.path && <span>Path: {cookie.path}</span>}
                          {cookie.domain && <span>Domain: {cookie.domain}</span>}
                          {cookie.expires && <span>Expires: {cookie.expires}</span>}
                          {cookie.httpOnly && <span className="text-orange-400">HttpOnly</span>}
                          {cookie.secure && <span className="text-green-400">Secure</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center py-4 text-sm">
                    No cookies in response
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {viewMode === 'response' && !hasResponse && !isLoading && !error && (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-sm text-muted-foreground">
              Send a request to see the response here
            </div>
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      {hasResponse && response && viewMode === 'response' && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-border text-xs text-muted-foreground shrink-0">
          <span className="font-mono">JSON</span>
          <span>
            {formatBytes(response.size)}, {formatTime(response.responseTime)}
          </span>
        </div>
      )}
    </div>
  )
}
