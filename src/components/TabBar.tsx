import { useState } from 'react'
import { Check, Pencil, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRequestTabsStore } from '@/stores/requestTabsStore'
import { useCollectionsStore } from '@/stores/collectionsStore'

interface TabBarProps {
  className?: string
}

export function TabBar({ className }: TabBarProps) {
  const { tabs, activeTabId, addTab, removeTab, setActiveTab, renameTab } =
    useRequestTabsStore()
  const { updateRequest } = useCollectionsStore()
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const startEditing = (tabId: string, currentName: string) => {
    setEditingTabId(tabId)
    setEditName(currentName)
  }

  const saveEdit = (tabId: string) => {
    const trimmedName = editName.trim()
    if (trimmedName) {
      const tab = tabs.find((item) => item.id === tabId)
      const collectionRequestId = tab?.collectionRequestId
      const requestId = collectionRequestId
        ? collectionRequestId.split(':')[1]
        : null
      renameTab(tabId, trimmedName)
      if (requestId) {
        updateRequest(requestId, { name: trimmedName })
      }
    }
    setEditingTabId(null)
    setEditName('')
  }

  const cancelEdit = () => {
    setEditingTabId(null)
    setEditName('')
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1 px-2 py-1 overflow-x-auto',
        className,
      )}
    >
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(
            'group flex items-center gap-1 px-2 py-1 text-sm rounded-sm cursor-pointer transition-colors min-w-0',
            'hover:bg-muted/50',
            activeTabId === tab.id
              ? 'bg-background text-foreground'
              : 'text-muted-foreground',
          )}
          onClick={() => setActiveTab(tab.id)}
        >
          {/* Method badge */}
          <span
            className={cn(
              'font-bold text-[10px] uppercase tracking-wide shrink-0',
              tab.method === 'GET' && 'text-green-500',
              tab.method === 'POST' && 'text-blue-500',
              tab.method === 'PUT' && 'text-orange-500',
              tab.method === 'PATCH' && 'text-purple-500',
              tab.method === 'DELETE' && 'text-red-500',
            )}
          >
            {tab.method}
          </span>

          {/* Tab name - editable */}
          {editingTabId === tab.id ? (
            <div className="flex items-center gap-1">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit(tab.id)
                  if (e.key === 'Escape') cancelEdit()
                }}
                onClick={(e) => e.stopPropagation()}
                className="h-5 w-32 text-xs px-1"
                autoFocus
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  saveEdit(tab.id)
                }}
                className="p-0.5 text-primary hover:bg-muted/50 rounded"
              >
                <Check className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <>
              <span className="max-w-32 truncate text-xs">{tab.name}</span>
              {tab.isDirty && <span className="text-primary shrink-0">•</span>}

              {/* Edit button - visible on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  startEditing(tab.id, tab.name)
                }}
                className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-opacity"
                title="Rename"
              >
                <Pencil className="h-3 w-3" />
              </button>
            </>
          )}

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              removeTab(tab.id)
            }}
            className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}

      <Button
        variant="ghost"
        size="sm"
        onClick={addTab}
        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground shrink-0"
        title="New tab (Ctrl+T)"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
