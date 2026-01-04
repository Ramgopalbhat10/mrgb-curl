import { useState } from 'react'
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

  const handleResponseReceived = (response: HttpResponse) => {
    setCurrentResponse(response)
    setIsLoading(false)
    setError(null)
  }

  return (
    <div className={cn(
      "h-screen w-screen bg-background overflow-hidden",
      "flex flex-col lg:flex-row",
      className
    )}>
      {/* Sidebar - Collections and History */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Request Editor - Middle Column */}
        <QueryErrorBoundary>
          <RequestEditor onResponseReceived={handleResponseReceived} />
        </QueryErrorBoundary>
        
        {/* Response Viewer - Right Column */}
        <ResponseViewer 
          response={currentResponse}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  )
}
