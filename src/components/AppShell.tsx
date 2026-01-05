import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { RequestEditor } from './RequestEditor'
import { ResponseViewer } from './ResponseViewer'
import { HttpResponse } from '@/schemas'
import { QueryErrorBoundary } from './QueryErrorBoundary'

interface AppShellProps {
  className?: string
}

export function AppShell({ className }: AppShellProps) {
  const [currentResponse, setCurrentResponse] = useState<HttpResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [responseWidth, setResponseWidth] = useState(360)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const isDraggingRef = useRef(false)

  const handleResponseReceived = (response: HttpResponse) => {
    setCurrentResponse(response)
    setIsLoading(false)
    setError(null)
  }

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const minResponse = 280
      const minRequest = 420
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
      "flex flex-col lg:flex-row",
      className
    )}>
      {/* Sidebar - Collections and History */}
      <Sidebar className="hidden lg:flex" />

      {/* Main Content Area */}
      <div ref={containerRef} className="flex min-w-0 flex-1 flex-col lg:flex-row">
        {/* Request Editor - Middle Column */}
        <QueryErrorBoundary>
          <RequestEditor
            onResponseReceived={handleResponseReceived}
            onRequestStateChange={({ isLoading: loadingState, error: requestError }) => {
              setIsLoading(loadingState)
              setError(requestError)
            }}
          />
        </QueryErrorBoundary>

        <div
          role="separator"
          aria-orientation="vertical"
          className="hidden lg:flex w-1 cursor-col-resize bg-border/40 hover:bg-border/70 transition-colors"
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
          error={error}
          style={{ width: responseWidth }}
        />
      </div>
    </div>
  )
}
