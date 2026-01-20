import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useEffect, useState } from 'react'
import type {
  Header,
  HttpMethod,
  HttpResponse,
  QueryParam,
  RequestBody,
} from '@/schemas'

// Request tab data
interface RequestTabData {
  id: string
  name: string
  url: string
  method: HttpMethod
  headers: Array<Header>
  params: Array<QueryParam>
  body: RequestBody | null
  auth: {
    type: 'none' | 'basic' | 'bearer' | 'api-key'
    basic?: { username: string; password: string }
    bearer?: { token: string }
    apiKey?: { key: string; value: string; addTo: 'header' | 'query' }
  }
  isDirty: boolean
  collectionRequestId?: string // Track which collection request this tab is for
  response?: HttpResponse | null // Store response for this tab
}

interface RequestTabsState {
  tabs: Array<RequestTabData>
  activeTabId: string | null
  _hasHydrated: boolean

  // Actions
  addTab: () => void
  removeTab: (id: string) => void
  setActiveTab: (id: string) => void
  updateTab: (
    id: string,
    updates: Partial<RequestTabData>,
    markDirty?: boolean,
  ) => void
  renameTab: (id: string, name: string) => void
  getActiveTab: () => RequestTabData | undefined
  setHasHydrated: (state: boolean) => void
  openCollectionRequest: (
    collectionRequestId: string,
    data: Partial<RequestTabData>,
  ) => void
  findTabByCollectionRequest: (
    collectionRequestId: string,
  ) => RequestTabData | undefined
  setTabResponse: (id: string, response: HttpResponse | null) => void
}

// Generate unique ID
const generateId = () =>
  `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// Create default tab
const createDefaultTab = (): RequestTabData => ({
  id: generateId(),
  name: 'New Request',
  url: '',
  method: 'GET',
  headers: [],
  params: [],
  body: null,
  auth: { type: 'none' },
  isDirty: false,
})

// Create the initial default tab ONCE to ensure consistent IDs
const initialDefaultTab = createDefaultTab()

export const useRequestTabsStore = create<RequestTabsState>()(
  persist(
    (set, get) => ({
      tabs: [initialDefaultTab],
      activeTabId: initialDefaultTab.id,
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set((currentState) => {
          const update: Partial<RequestTabsState> = { _hasHydrated: state }
          // Ensure activeTabId is valid when hydration completes
          if (
            state &&
            !currentState.activeTabId &&
            currentState.tabs.length > 0
          ) {
            update.activeTabId = currentState.tabs[0].id
          } else if (
            state &&
            currentState.activeTabId &&
            !currentState.tabs.find((t) => t.id === currentState.activeTabId)
          ) {
            // If activeTabId points to a non-existent tab, use the first tab
            update.activeTabId = currentState.tabs[0].id
          }
          return update
        })
      },

      addTab: () => {
        const newTab = createDefaultTab()
        set((state) => ({
          tabs: [...state.tabs, newTab],
          activeTabId: newTab.id,
        }))
      },

      removeTab: (id: string) => {
        const state = get()
        const tabIndex = state.tabs.findIndex((t) => t.id === id)

        if (state.tabs.length === 1) {
          // Don't remove the last tab, reset it instead
          const newTab = createDefaultTab()
          set({ tabs: [newTab], activeTabId: newTab.id })
          return
        }

        const newTabs = state.tabs.filter((t) => t.id !== id)
        let newActiveId = state.activeTabId

        // If we're removing the active tab, select a new one
        if (state.activeTabId === id) {
          if (tabIndex > 0) {
            newActiveId = newTabs[tabIndex - 1].id
          } else {
            newActiveId = newTabs[0].id
          }
        }

        set({ tabs: newTabs, activeTabId: newActiveId })
      },

      setActiveTab: (id: string) => {
        set({ activeTabId: id })
      },

      updateTab: (
        id: string,
        updates: Partial<RequestTabData>,
        markDirty: boolean = true,
      ) => {
        set((state) => ({
          tabs: state.tabs.map((tab) => {
            if (tab.id !== id) return tab
            const { isDirty, ...rest } = updates
            const nextIsDirty =
              typeof isDirty === 'boolean'
                ? isDirty
                : markDirty
                  ? true
                  : tab.isDirty
            return { ...tab, ...rest, isDirty: nextIsDirty }
          }),
        }))
      },

      renameTab: (id: string, name: string) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === id ? { ...tab, name } : tab,
          ),
        }))
      },

      getActiveTab: () => {
        const state = get()
        return (
          state.tabs.find((t) => t.id === state.activeTabId) || state.tabs[0]
        )
      },

      findTabByCollectionRequest: (collectionRequestId: string) => {
        const state = get()
        return state.tabs.find(
          (t) => t.collectionRequestId === collectionRequestId,
        )
      },

      openCollectionRequest: (
        collectionRequestId: string,
        data: Partial<RequestTabData>,
      ) => {
        const state = get()
        // Check if tab already exists for this collection request
        const existingTab = state.tabs.find(
          (t) => t.collectionRequestId === collectionRequestId,
        )

        if (existingTab) {
          // Switch to existing tab and sync saved data
          set((prevState) => ({
            tabs: prevState.tabs.map((tab) =>
              tab.id === existingTab.id
                ? { ...tab, ...data, collectionRequestId, isDirty: false }
                : tab,
            ),
            activeTabId: existingTab.id,
          }))
        } else {
          // Create new tab for this collection request
          const newTab: RequestTabData = {
            ...createDefaultTab(),
            ...data,
            collectionRequestId,
            isDirty: false, // Not dirty since it's from a saved collection
          }
          set((prevState) => ({
            tabs: [...prevState.tabs, newTab],
            activeTabId: newTab.id,
          }))
        }
      },

      setTabResponse: (id: string, response: HttpResponse | null) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === id ? { ...tab, response } : tab,
          ),
        }))
      },
    }),
    {
      name: 'mrgb-curl-tabs',
      partialize: (state) => ({
        tabs: state.tabs.map((tab) => {
          const { response, ...rest } = tab
          return rest
        }),
        activeTabId: state.activeTabId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true
          // Ensure activeTabId is valid immediately after rehydration
          if (!state.activeTabId && state.tabs.length > 0) {
            state.activeTabId = state.tabs[0].id
          } else if (
            state.activeTabId &&
            !state.tabs.find((t) => t.id === state.activeTabId)
          ) {
            // If activeTabId points to a non-existent tab, use the first tab
            state.activeTabId = state.tabs[0].id
          }
        }
      },
    },
  ),
)

// Hook to ensure hydration on client side
export function useHydratedStore() {
  const [isHydrated, setIsHydrated] = useState(false)
  const hasHydrated = useRequestTabsStore((state) => state._hasHydrated)

  useEffect(() => {
    // Wait for next tick to ensure localStorage is read
    const timeout = setTimeout(() => {
      setIsHydrated(true)
    }, 0)
    return () => clearTimeout(timeout)
  }, [])

  return isHydrated || hasHydrated
}
