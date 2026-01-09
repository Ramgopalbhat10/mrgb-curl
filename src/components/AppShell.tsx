import { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { RequestPanel } from './RequestPanel'
import { ResponseViewer } from './ResponseViewer'
import { UrlBar } from './UrlBar'
import { TabBar } from './TabBar'
import { ThemeToggle } from './ThemeToggle'
import {
  KeyboardShortcutsModal,
  useKeyboardShortcuts,
} from './KeyboardShortcutsModal'
import {
  HttpResponse,
  HttpMethod,
  Header,
  QueryParam,
  RequestBody,
} from '@/schemas'
import { QueryErrorBoundary } from './QueryErrorBoundary'
import { useHttp } from '@/hooks/useHttp'
import { useRequestTabsStore } from '@/stores/requestTabsStore'
import { useCollectionsStore } from '@/stores/collectionsStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { AuthConfig } from './AuthEditor'
import { Keyboard, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AppShellProps {
  className?: string
}

export function AppShell({ className }: AppShellProps) {
  const [currentResponse, setCurrentResponse] = useState<HttpResponse | null>(
    null,
  )
  const [sidebarWidth, setSidebarWidth] = useState(256)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  // Start with 50% for response panel
  const [responseWidthPercent, setResponseWidthPercent] = useState(50)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const isDraggingResponseRef = useRef(false)
  const isDraggingSidebarRef = useRef(false)

  // Tab store
  const {
    tabs,
    activeTabId,
    updateTab,
    getActiveTab,
    setActiveTab,
    addTab,
    removeTab,
  } = useRequestTabsStore()

  // Collections store for history
  const { addToHistory, updateRequest } = useCollectionsStore()

  // Settings store for proxy mode
  const { proxyMode, setProxyMode } = useSettingsStore()

  // Initialize active tab if none
  useEffect(() => {
    if (!activeTabId && tabs.length > 0) {
      setActiveTab(tabs[0].id)
    }
  }, [activeTabId, tabs, setActiveTab])

  const activeTab = getActiveTab()

  // HTTP hook
  const { sendRequest, isLoading, error, data } = useHttp()

  // State handlers for active tab
  const getCollectionRequestId = (collectionRequestId?: string | null) => {
    if (!collectionRequestId) return null
    const parts = collectionRequestId.split(':')
    if (parts.length < 2) return null
    return parts[1]
  }

  const handleUrlChange = (url: string) => {
    if (activeTab) {
      const shouldMarkDirty = !activeTab.collectionRequestId
      const requestId = getCollectionRequestId(activeTab.collectionRequestId)
      // Only auto-rename if the tab has a default name or is unnamed
      const isDefaultName =
        !activeTab.name ||
        activeTab.name === 'New Request' ||
        activeTab.name === 'Untitled' ||
        activeTab.name === activeTab.url // Name was set from URL previously

      if (isDefaultName) {
        let tabName = url || 'Untitled'
        try {
          const urlObj = new URL(url)
          tabName = urlObj.hostname || url
        } catch {}
        updateTab(activeTab.id, { url, name: tabName }, shouldMarkDirty)
        if (requestId) {
          updateRequest(requestId, { url, name: tabName })
        }
      } else {
        // Preserve the existing name, only update URL
        updateTab(activeTab.id, { url }, shouldMarkDirty)
        if (requestId) {
          updateRequest(requestId, { url })
        }
      }
    }
  }

  const handleMethodChange = (method: HttpMethod) => {
    if (activeTab) {
      const shouldMarkDirty = !activeTab.collectionRequestId
      updateTab(activeTab.id, { method }, shouldMarkDirty)
      const requestId = getCollectionRequestId(activeTab.collectionRequestId)
      if (requestId) {
        updateRequest(requestId, { method })
      }
    }
  }

  const handleHeadersChange = (headers: Header[]) => {
    if (activeTab) {
      const shouldMarkDirty = !activeTab.collectionRequestId
      updateTab(activeTab.id, { headers }, shouldMarkDirty)
      const requestId = getCollectionRequestId(activeTab.collectionRequestId)
      if (requestId) {
        updateRequest(requestId, { headers })
      }
    }
  }

  const handleParamsChange = (params: QueryParam[]) => {
    if (activeTab) {
      const shouldMarkDirty = !activeTab.collectionRequestId
      updateTab(activeTab.id, { params }, shouldMarkDirty)
      const requestId = getCollectionRequestId(activeTab.collectionRequestId)
      if (requestId) {
        updateRequest(requestId, { params })
      }
    }
  }

  const handleBodyChange = (body: RequestBody | null) => {
    if (activeTab) {
      const shouldMarkDirty = !activeTab.collectionRequestId
      updateTab(activeTab.id, { body }, shouldMarkDirty)
      const requestId = getCollectionRequestId(activeTab.collectionRequestId)
      if (requestId) {
        updateRequest(requestId, { body: body || undefined })
      }
    }
  }

  const handleAuthChange = (auth: AuthConfig) => {
    if (activeTab) {
      const shouldMarkDirty = !activeTab.collectionRequestId
      updateTab(activeTab.id, { auth }, shouldMarkDirty)
    }
  }

  const handleSendRequest = useCallback(async () => {
    if (!activeTab?.url) return

    // Build headers including auth
    let headers = [...(activeTab.headers || [])]

    // Add auth headers
    if (activeTab.auth?.type === 'bearer' && activeTab.auth.bearer?.token) {
      headers.push({
        key: 'Authorization',
        value: `Bearer ${activeTab.auth.bearer.token}`,
      })
    } else if (activeTab.auth?.type === 'basic' && activeTab.auth.basic) {
      const { username, password } = activeTab.auth.basic
      const encoded = btoa(`${username}:${password}`)
      headers.push({ key: 'Authorization', value: `Basic ${encoded}` })
    } else if (
      activeTab.auth?.type === 'api-key' &&
      activeTab.auth.apiKey?.addTo === 'header'
    ) {
      headers.push({
        key: activeTab.auth.apiKey.key,
        value: activeTab.auth.apiKey.value,
      })
    }

    // Build URL with params
    let url = activeTab.url
    if (activeTab.params?.length) {
      try {
        const urlObj = new URL(activeTab.url)
        activeTab.params
          .filter((p) => p.enabled && p.key)
          .forEach((p) => {
            urlObj.searchParams.set(p.key, p.value)
          })
        url = urlObj.toString()
      } catch {
        // Invalid URL, use as-is
      }
    }

    try {
      const response = await sendRequest.mutateAsync({
        method: activeTab.method,
        url,
        headers: Object.fromEntries(headers.map((h) => [h.key, h.value])),
        body: activeTab.body?.content,
      })

      // Add to history on success
      if (response) {
        try {
          // Get hostname for the request name
          let requestName = activeTab.name || 'Request'
          try {
            requestName = new URL(activeTab.url).pathname || activeTab.url
          } catch {}

          addToHistory({
            requestId: activeTab.id,
            request: {
              id: activeTab.id,
              name: requestName,
              method: activeTab.method,
              url: activeTab.url,
              headers: activeTab.headers || [],
              params: activeTab.params || [],
              body: activeTab.body || undefined,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            response: response,
          })
        } catch (historyError) {
          console.error('Failed to add to history:', historyError)
        }
      }
    } catch (err) {
      // Error is handled by the hook
    }
  }, [activeTab, sendRequest, addToHistory])

  // Update response when data changes
  useEffect(() => {
    if (data) {
      setCurrentResponse(data)
    }
  }, [data])

  // Clear response when active tab changes
  useEffect(() => {
    setCurrentResponse(null)
  }, [activeTabId])

  // Keyboard shortcuts
  const { showShortcuts, setShowShortcuts } = useKeyboardShortcuts()

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Enter to send request
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        handleSendRequest()
      }
      // Ctrl+T to new tab
      if ((event.ctrlKey || event.metaKey) && event.key === 't') {
        event.preventDefault()
        addTab()
      }
      // Ctrl+W to close tab
      if ((event.ctrlKey || event.metaKey) && event.key === 'w') {
        event.preventDefault()
        if (activeTab) {
          removeTab(activeTab.id)
        }
      }
      // Ctrl+S to save request (prevent browser default)
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        // Mark as saved (clear dirty flag)
        if (activeTab) {
          updateTab(activeTab.id, { isDirty: false })
        }
      }
      // Ctrl+L to focus URL input
      if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
        event.preventDefault()
        const urlInput = document.querySelector(
          'input[placeholder*="URL"]',
        ) as HTMLInputElement
        if (urlInput) urlInput.focus()
      }
      // Ctrl+B to toggle sidebar
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault()
        setSidebarCollapsed((prev) => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeTab, addTab, removeTab, handleSendRequest, updateTab])

  // Drag to resize panels
  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()

      // Response resizing (percentage based)
      if (isDraggingResponseRef.current) {
        const availableWidth =
          rect.width - (sidebarCollapsed ? 40 : sidebarWidth)
        const responseWidth = rect.right - event.clientX
        const percent = (responseWidth / availableWidth) * 100
        const clamped = Math.min(Math.max(percent, 20), 80) // 20-80% range
        setResponseWidthPercent(clamped)
      }

      // Sidebar resizing
      if (isDraggingSidebarRef.current) {
        const minSidebar = 200
        const maxSidebar = 400
        const clamped = Math.min(
          Math.max(event.clientX, minSidebar),
          maxSidebar,
        )
        setSidebarWidth(clamped)
      }
    }

    const handlePointerUp = () => {
      if (isDraggingResponseRef.current || isDraggingSidebarRef.current) {
        isDraggingResponseRef.current = false
        isDraggingSidebarRef.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [sidebarWidth, sidebarCollapsed])

  return (
    <div
      ref={containerRef}
      className={cn(
        'h-screen w-screen bg-background overflow-hidden',
        'flex',
        className,
      )}
    >
      {/* Sidebar - Collections and History */}
      <div className="hidden lg:flex">
        <Sidebar
          className="border-r border-sidebar-border/50"
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
          width={sidebarWidth}
        />

        {/* Sidebar Resize Handle */}
        {!sidebarCollapsed && (
          <div
            role="separator"
            aria-orientation="vertical"
            className="w-0.75 cursor-col-resize bg-border/20 hover:bg-primary/50 transition-colors"
            onPointerDown={(event) => {
              event.preventDefault()
              isDraggingSidebarRef.current = true
              document.body.style.cursor = 'col-resize'
              document.body.style.userSelect = 'none'
            }}
          />
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tab Bar with Header Actions */}
        <div className="flex items-center border-b border-border bg-muted/30">
          <TabBar className="flex-1" />
          {/* Header Action Icons - aligned with tabs */}
          <div className="flex items-center gap-1 px-2 py-1.5 shrink-0">
            {/* Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex items-center justify-center h-7 w-7 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted/50"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuCheckboxItem
                  checked={proxyMode}
                  onClick={() => setProxyMode(!proxyMode)}
                  className="text-xs cursor-pointer"
                >
                  Proxy Mode
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShortcuts(true)}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              title="Keyboard shortcuts (Ctrl+/)"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Full-width URL Bar at Top */}
        <UrlBar
          url={activeTab?.url || ''}
          method={activeTab?.method || 'GET'}
          onUrlChange={handleUrlChange}
          onMethodChange={handleMethodChange}
          onSend={handleSendRequest}
          isLoading={isLoading}
        />

        {/* Two-column layout: Request Panel + Response Viewer */}
        <div className="flex-1 flex min-h-0">
          {/* Request Panel - Left Column */}
          <QueryErrorBoundary>
            <RequestPanel
              url={activeTab?.url || ''}
              method={activeTab?.method || 'GET'}
              headers={activeTab?.headers || []}
              params={activeTab?.params || []}
              body={activeTab?.body || null}
              auth={activeTab?.auth || { type: 'none' }}
              onUrlChange={handleUrlChange}
              onHeadersChange={handleHeadersChange}
              onParamsChange={handleParamsChange}
              onBodyChange={handleBodyChange}
              onAuthChange={handleAuthChange}
              error={error?.message || null}
              className="min-w-0"
              style={{ flex: `1 1 ${100 - responseWidthPercent}%` }}
            />
          </QueryErrorBoundary>

          {/* Resizable Separator */}
          <div
            role="separator"
            aria-orientation="vertical"
            className="hidden lg:flex w-0.75 cursor-col-resize bg-border/30 hover:bg-primary/50 transition-colors shrink-0"
            onPointerDown={(event) => {
              event.preventDefault()
              isDraggingResponseRef.current = true
              document.body.style.cursor = 'col-resize'
              document.body.style.userSelect = 'none'
            }}
          />

          {/* Response Viewer - Right Column */}
          <ResponseViewer
            response={currentResponse}
            isLoading={isLoading}
            error={error?.message || null}
            method={activeTab?.method || 'GET'}
            requestHeaders={activeTab?.headers || []}
            requestBody={activeTab?.body?.content || ''}
            requestUrl={activeTab?.url || ''}
            className="hidden lg:flex"
            style={{ flex: `1 1 ${responseWidthPercent}%` }}
          />
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        open={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  )
}
