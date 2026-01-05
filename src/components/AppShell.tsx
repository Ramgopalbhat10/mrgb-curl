import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { RequestPanel } from './RequestPanel'
import { ResponseViewer } from './ResponseViewer'
import { UrlBar } from './UrlBar'
import { HttpResponse, HttpMethod } from '@/schemas'
import { QueryErrorBoundary } from './QueryErrorBoundary'
import { useHttp } from '@/hooks/useHttp'

interface AppShellProps {
  className?: string
}

export function AppShell({ className }: AppShellProps) {
  const [url, setUrl] = useState('')
  const [method, setMethod] = useState<HttpMethod>('GET')
  const [currentResponse, setCurrentResponse] = useState<HttpResponse | null>(null)
  const [responseWidth, setResponseWidth] = useState(420)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const isDraggingRef = useRef(false)

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

  // Update response when data changes
  useEffect(() => {
    if (data) {
      setCurrentResponse(data)
    }
  }, [data])

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

  // Drag to resize
  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const minResponse = 320
      const minRequest = 320
      const maxResponse = Math.max(minResponse, rect.width - minRequest)
      const next = rect.right - event.clientX
      const clamped = Math.min(Math.max(next, minResponse), maxResponse)
      setResponseWidth(clamped)
    }

    const handlePointerUp = () => {
      if (!isDraggingRef.current) return
      isDraggingRef.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [])

  return (
    <div className={cn(
      "h-screen w-screen bg-background overflow-hidden",
      "flex",
      className
    )}>
      {/* Sidebar - Collections and History */}
      <Sidebar className="hidden lg:flex border-r border-sidebar-border/50 bg-sidebar" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Full-width URL Bar at Top */}
        <UrlBar
          url={url}
          method={method}
          onUrlChange={setUrl}
          onMethodChange={setMethod}
          onSend={handleSendRequest}
          isLoading={isLoading}
        />

        {/* Two-column layout: Request Panel + Response Viewer */}
        <div ref={containerRef} className="flex-1 flex min-h-0">
          {/* Request Panel - Left Column */}
          <QueryErrorBoundary>
            <RequestPanel
              method={method}
              error={error?.message || null}
              className="flex-1 min-w-0"
            />
          </QueryErrorBoundary>

          {/* Resizable Separator */}
          <div
            role="separator"
            aria-orientation="vertical"
            className="hidden lg:flex w-[3px] cursor-col-resize bg-border/30 hover:bg-primary/50 transition-colors"
            onPointerDown={(event) => {
              event.preventDefault()
              isDraggingRef.current = true
              document.body.style.cursor = 'col-resize'
              document.body.style.userSelect = 'none'
            }}
          />

          {/* Response Viewer - Right Column */}
          <ResponseViewer
            response={currentResponse}
            isLoading={isLoading}
            error={error?.message || null}
            method={method}
            style={{ width: responseWidth }}
            className="hidden lg:flex"
          />
        </div>
      </div>
    </div>
  )
}
