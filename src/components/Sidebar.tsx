import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Folder,
  FolderOpen,
  Clock,
  ChevronRight,
  ChevronDown,
  Trash2,
  MoreHorizontal,
  Search,
  Copy,
  Pencil,
  Download,
  CopyPlus,
  PanelLeftClose,
  PanelLeftOpen,
  ExternalLink,
  FolderInput,
} from 'lucide-react'
import { useCollectionsStore } from '@/stores/collectionsStore'
import { useRequestTabsStore } from '@/stores/requestTabsStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'

interface SidebarProps {
  className?: string
  isCollapsed?: boolean
  onToggle?: () => void
  width?: number
}

export function Sidebar({ className, isCollapsed = false, onToggle, width }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    collections: true,
    drafts: true,
    history: true,
  })
  const [expandedCollections, setExpandedCollections] = useState<Record<string, boolean>>({})
  const [newCollectionName, setNewCollectionName] = useState('')
  const [isAddingCollection, setIsAddingCollection] = useState(false)
  const [addingRequestToCollection, setAddingRequestToCollection] = useState<string | null>(null)
  const [newRequestName, setNewRequestName] = useState('')
  const [historySearch, setHistorySearch] = useState('')

  const { collections, history, addCollection, deleteCollection, saveRequest, searchHistory, clearHistory, getRequest, deleteRequest } = useCollectionsStore()
  const { tabs, addTab, updateTab, setActiveTab, removeTab, renameTab, activeTabId } = useRequestTabsStore()

  // Get active tab's collectionRequestId for highlighting
  const activeTab = tabs.find(t => t.id === activeTabId)
  const activeCollectionRequestId = activeTab?.collectionRequestId

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const toggleCollection = (id: string) => {
    setExpandedCollections((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleAddCollection = () => {
    if (newCollectionName.trim()) {
      addCollection(newCollectionName.trim())
      setNewCollectionName('')
      setIsAddingCollection(false)
    }
  }

  const handleAddRequestToCollection = (collectionId: string) => {
    if (newRequestName.trim()) {
      saveRequest(collectionId, {
        name: newRequestName.trim(),
        method: 'GET',
        url: '',
        headers: [],
        params: [],
        body: undefined,
      })
      setNewRequestName('')
      setAddingRequestToCollection(null)
    }
  }

  const handleNewDraft = () => {
    addTab()
    const newTabId = useRequestTabsStore.getState().tabs.at(-1)?.id
    if (newTabId) {
      updateTab(newTabId, { name: 'Untitled' })
      setActiveTab(newTabId)
    }
  }

  const drafts = tabs.filter((t) => t.isDirty)
  const filteredHistory = historySearch ? searchHistory(historySearch) : history.slice(0, 20)

  const handleHistoryItemClick = (item: any) => {
    addTab()
    const newTabId = useRequestTabsStore.getState().tabs.at(-1)?.id
    if (newTabId) {
      updateTab(newTabId, {
        name: item.request.name || 'From History',
        url: item.request.url,
        method: item.request.method,
        headers: item.request.headers,
        params: item.request.params || [],
        body: item.request.body || null,
      })
      setActiveTab(newTabId)
    }
  }

  const handleDraftClick = (draft: any) => {
    setActiveTab(draft.id)
  }

  const handleDuplicateDraft = (draft: any) => {
    addTab()
    const newTabId = useRequestTabsStore.getState().tabs.at(-1)?.id
    if (newTabId) {
      updateTab(newTabId, {
        name: `${draft.name} (Copy)`,
        url: draft.url,
        method: draft.method,
        headers: draft.headers || [],
        params: draft.params || [],
        body: draft.body || null,
      })
      setActiveTab(newTabId)
    }
  }

  const handleDeleteDraft = (draftId: string) => {
    removeTab(draftId)
  }

  const handleRenameDraft = (draft: any) => {
    const newName = prompt('Enter new name:', draft.name)
    if (newName?.trim()) {
      renameTab(draft.id, newName.trim())
    }
  }

  const handleMoveToCollection = (request: any, collectionId: string) => {
    saveRequest(collectionId, {
      name: request.name || request.url || 'Moved Request',
      method: request.method,
      url: request.url,
      headers: request.headers || [],
      params: request.params || [],
      body: request.body,
    })
  }

  const copyAsCurl = (request: any) => {
    const headers = request.headers?.map((h: any) => `-H "${h.key}: ${h.value}"`).join(' ') || ''
    const body = request.body?.content ? `-d '${request.body.content}'` : ''
    const curl = `curl -X ${request.method} "${request.url}" ${headers} ${body}`.trim()
    navigator.clipboard.writeText(curl)
  }

  const handleExport = (request: any) => {
    const data = JSON.stringify(request, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${request.name || 'request'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleOpenCollectionRequest = (collectionId: string, requestId: string, request: any) => {
    // Use the store's openCollectionRequest which handles tab reuse
    const { openCollectionRequest: openRequest } = useRequestTabsStore.getState()
    openRequest(`${collectionId}:${requestId}`, {
      name: request.name,
      url: request.url,
      method: request.method,
      headers: request.headers,
      params: request.params || [],
      body: request.body || null,
    })
  }

  if (isCollapsed) {
    return (
      <div className={cn(
        "w-10 flex flex-col items-center py-3 bg-sidebar",
        className
      )}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary"
          title="Expand sidebar"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden bg-sidebar text-sidebar-foreground",
        className
      )}
      style={{ width: width || 256 }}
    >
      {/* Header with toggle */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-sidebar-border shrink-0">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Explorer</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary"
          title="Collapse sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-1 sidebar-scrollbar">
        {/* Collections Section */}
        <div className="space-y-1">
          <div
            role="button"
            tabIndex={0}
            onClick={() => toggleSection('collections')}
            onKeyDown={(e) => e.key === 'Enter' && toggleSection('collections')}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {expandedSections.collections ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            Collections
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-5 w-5 p-0 hover:bg-secondary"
              onClick={(e) => {
                e.stopPropagation()
                setIsAddingCollection(true)
              }}
              title="New collection"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {expandedSections.collections && (
            <div className="space-y-0.5 ml-2">
              {isAddingCollection && (
                <div className="flex items-center gap-1 py-1">
                  <Input
                    placeholder="Collection name"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddCollection()
                      if (e.key === 'Escape') setIsAddingCollection(false)
                    }}
                    className="h-7 text-xs"
                    autoFocus
                  />
                  <Button size="sm" className="h-7 px-2" onClick={handleAddCollection}>
                    Add
                  </Button>
                </div>
              )}

              {collections.length === 0 && !isAddingCollection && (
                <div className="text-xs text-muted-foreground py-2 px-2">
                  No collections yet
                </div>
              )}

              {collections.map((collection) => (
                <div key={collection.id} className="space-y-0.5">
                  <div className="flex items-center gap-1 group">
                    <button
                      onClick={() => toggleCollection(collection.id)}
                      className="flex items-center gap-2 flex-1 px-2 py-1.5 text-sm rounded-sm hover:bg-secondary"
                    >
                      {expandedCollections[collection.id] ? (
                        <FolderOpen className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="truncate">{collection.name}</span>
                      {collection.requests.length > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          {collection.requests.length}
                        </span>
                      )}
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="h-6 w-6 inline-flex items-center justify-center opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-sm"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-auto">
                        <DropdownMenuItem
                          onClick={() => setAddingRequestToCollection(collection.id)}
                          className="text-xs whitespace-nowrap"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add request
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive text-xs whitespace-nowrap"
                          onClick={() => deleteCollection(collection.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {expandedCollections[collection.id] && (
                    <div className="ml-4 space-y-0.5">
                      {addingRequestToCollection === collection.id && (
                        <div className="flex items-center gap-1 py-1">
                          <Input
                            placeholder="Request name"
                            value={newRequestName}
                            onChange={(e) => setNewRequestName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddRequestToCollection(collection.id)
                              if (e.key === 'Escape') setAddingRequestToCollection(null)
                            }}
                            className="h-6 text-xs"
                            autoFocus
                          />
                        </div>
                      )}

                      {/* Display collection requests */}
                      {collection.requests.map((requestId) => {
                        const request = getRequest(requestId)
                        if (!request) return null

                        const isActive = activeCollectionRequestId === `${collection.id}:${requestId}`

                        return (
                          <div key={requestId} className="group flex items-center gap-1">
                            <button
                              onClick={() => handleOpenCollectionRequest(collection.id, requestId, request)}
                              className={cn(
                                "flex items-center gap-2 flex-1 px-2 py-1 text-sm rounded-sm text-left",
                                isActive
                                  ? "bg-secondary text-foreground"
                                  : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <span className={cn(
                                "text-[10px] font-bold uppercase shrink-0 w-8",
                                request.method === 'GET' && "text-green-500",
                                request.method === 'POST' && "text-blue-500",
                                request.method === 'PUT' && "text-orange-500",
                                request.method === 'DELETE' && "text-red-500",
                              )}>
                                {request.method.slice(0, 3)}
                              </span>
                              <span className="truncate text-xs">{request.name || request.url}</span>
                            </button>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                className="h-5 w-5 inline-flex items-center justify-center opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-sm"
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-auto">
                                <DropdownMenuItem onClick={() => handleOpenCollectionRequest(collection.id, requestId, request)} className="text-xs whitespace-nowrap">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Open
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => copyAsCurl(request)} className="text-xs whitespace-nowrap">
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy as cURL
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport(request)} className="text-xs whitespace-nowrap">
                                  <Download className="h-4 w-4 mr-2" />
                                  Export...
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => deleteRequest(requestId)}
                                  className="text-destructive text-xs whitespace-nowrap"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )
                      })}

                      {collection.requests.length === 0 && addingRequestToCollection !== collection.id && (
                        <div className="text-xs text-muted-foreground py-1 px-2">
                          No requests
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drafts Section */}
        <div className="space-y-1 mt-4">
          <div
            role="button"
            tabIndex={0}
            onClick={() => toggleSection('drafts')}
            onKeyDown={(e) => e.key === 'Enter' && toggleSection('drafts')}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {expandedSections.drafts ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            Drafts
            {drafts.length > 0 && (
              <span className="text-primary font-medium ml-1">{drafts.length}</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-5 w-5 p-0 hover:bg-secondary"
              onClick={(e) => {
                e.stopPropagation()
                handleNewDraft()
              }}
              title="New draft"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {expandedSections.drafts && (
            <div className="space-y-0.5 ml-2">
              {drafts.length === 0 ? (
                <div className="text-xs text-muted-foreground py-2 px-2">
                  No unsaved drafts
                </div>
              ) : (
                drafts.map((draft) => (
                  <div key={draft.id} className="group flex items-center gap-1">
                    <button
                      onClick={() => handleDraftClick(draft)}
                      className="flex items-center gap-2 flex-1 min-w-0 px-2 py-1 text-sm rounded-sm hover:bg-secondary text-left overflow-hidden"
                    >
                      <span className={cn(
                        "text-[10px] w-8 font-bold uppercase shrink-0",
                        draft.method === 'GET' && "text-green-500",
                        draft.method === 'POST' && "text-blue-500",
                        draft.method === 'PUT' && "text-orange-500",
                        draft.method === 'DELETE' && "text-red-500",
                      )}>
                        {draft.method}
                      </span>
                      <span className="truncate text-xs min-w-0">{draft.name || draft.url || 'Untitled'}</span>
                      <span className="text-primary shrink-0 ml-auto">•</span>
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="h-5 w-5 inline-flex items-center justify-center opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-sm"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-auto">
                        <DropdownMenuItem onClick={() => handleDraftClick(draft)} className="text-xs whitespace-nowrap">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRenameDraft(draft)} className="text-xs whitespace-nowrap">
                          <Pencil className="h-4 w-4 mr-2" />
                          Rename...
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateDraft(draft)} className="text-xs whitespace-nowrap">
                          <CopyPlus className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {collections.length > 0 && (
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="text-xs whitespace-nowrap">
                              <FolderInput className="h-4 w-4 mr-2" />
                              Move to Collection
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {collections.map((col) => (
                                <DropdownMenuItem
                                  key={col.id}
                                  onClick={() => handleMoveToCollection(draft, col.id)}
                                  className="text-xs whitespace-nowrap"
                                >
                                  <Folder className="h-4 w-4 mr-2" />
                                  {col.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                        )}
                        <DropdownMenuItem onClick={() => copyAsCurl(draft)} className="text-xs whitespace-nowrap">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy as cURL
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport(draft)} className="text-xs whitespace-nowrap">
                          <Download className="h-4 w-4 mr-2" />
                          Export...
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteDraft(draft.id)}
                          className="text-destructive text-xs whitespace-nowrap"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* History Section */}
        <div className="space-y-1 mt-4 flex-1 flex flex-col min-h-0">
          <div
            role="button"
            tabIndex={0}
            onClick={() => toggleSection('history')}
            onKeyDown={(e) => e.key === 'Enter' && toggleSection('history')}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {expandedSections.history ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            History
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-5 px-1 text-[10px] hover:bg-secondary"
                onClick={(e) => {
                  e.stopPropagation()
                  clearHistory()
                }}
                title="Clear history"
              >
                Clear
              </Button>
            )}
          </div>

          {expandedSections.history && (
            <div className="flex-1 flex flex-col min-h-0 ml-2">
              <div className="relative mb-2">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Search history..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="h-7 pl-7 text-xs"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-0.5">
                {filteredHistory.length === 0 ? (
                  <div className="text-xs text-muted-foreground py-2 px-2">
                    No request history
                  </div>
                ) : (
                  filteredHistory.map((item) => (
                    <div key={item.id} className="group flex items-center gap-1">
                      <button
                        onClick={() => handleHistoryItemClick(item)}
                        className="flex items-center gap-2 flex-1 px-2 py-1 text-sm rounded-sm hover:bg-secondary text-left min-w-0"
                      >
                        <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className={cn(
                          "text-[10px] font-bold uppercase shrink-0 w-8",
                          item.request.method === 'GET' && "text-green-500",
                          item.request.method === 'POST' && "text-blue-500",
                          item.request.method === 'PUT' && "text-orange-500",
                          item.request.method === 'DELETE' && "text-red-500",
                        )}>
                          {item.request.method}
                        </span>
                        <span className="truncate text-xs">{item.request.url}</span>
                        <span className={cn(
                          "text-[10px] shrink-0 ml-auto",
                          item.response.status >= 200 && item.response.status < 300 && "text-green-500",
                          item.response.status >= 400 && "text-red-500",
                        )}>
                          {item.response.status}
                        </span>
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="h-5 w-5 inline-flex items-center justify-center opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-sm"
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-auto">
                          <DropdownMenuItem onClick={() => handleHistoryItemClick(item)} className="text-xs whitespace-nowrap">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {collections.length > 0 && (
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="text-xs whitespace-nowrap">
                                <FolderInput className="h-4 w-4 mr-2" />
                                Move to Collection
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {collections.map((col) => (
                                  <DropdownMenuItem
                                    key={col.id}
                                    onClick={() => handleMoveToCollection(item.request, col.id)}
                                    className="text-xs whitespace-nowrap"
                                  >
                                    <Folder className="h-4 w-4 mr-2" />
                                    {col.name}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                          )}
                          <DropdownMenuItem onClick={() => copyAsCurl(item.request)} className="text-xs whitespace-nowrap">
                            <Copy className="h-4 w-4 mr-2" />
                            Copy as cURL
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport(item.request)} className="text-xs whitespace-nowrap">
                            <Download className="h-4 w-4 mr-2" />
                            Export...
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
