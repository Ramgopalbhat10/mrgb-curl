import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Collection,
  HttpRequest,
  RequestHistory,
  HttpResponse,
} from '@/schemas'

interface CollectionsState {
  collections: Collection[]
  requests: Map<string, HttpRequest>
  history: RequestHistory[]

  // Collection actions
  addCollection: (name: string, description?: string) => void
  updateCollection: (id: string, updates: Partial<Collection>) => void
  deleteCollection: (id: string) => void

  // Request actions
  saveRequest: (
    collectionId: string,
    request: Omit<HttpRequest, 'id' | 'createdAt' | 'updatedAt'>,
  ) => string
  updateRequest: (id: string, updates: Partial<HttpRequest>) => void
  deleteRequest: (id: string) => void
  getRequest: (id: string) => HttpRequest | undefined

  // History actions
  addToHistory: (entry: Omit<RequestHistory, 'id' | 'timestamp'>) => void
  clearHistory: () => void
  searchHistory: (query: string) => RequestHistory[]
}

const generateId = () =>
  `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

const buildHistoryKey = (request: Pick<HttpRequest, 'url' | 'params'>) => {
  const serializedParams = (request.params || [])
    .filter((param) => param.enabled !== false && param.key)
    .map((param) => `${param.key}=${param.value ?? ''}`)
    .sort()
    .join('&')

  return `${request.url}::${serializedParams}`
}

// Truncate response body for history storage (max 10KB)
const truncateResponseBody = (response: HttpResponse): HttpResponse => {
  const maxBodySize = 10 * 1024 // 10KB
  if (response.body && response.body.length > maxBodySize) {
    return {
      ...response,
      body:
        response.body.slice(0, maxBodySize) + '\n... [truncated for storage]',
    }
  }
  return response
}

export const useCollectionsStore = create<CollectionsState>()(
  persist(
    (set, get) => ({
      collections: [],
      requests: new Map(),
      history: [],

      addCollection: (name: string, description?: string) => {
        const newCollection: Collection = {
          id: generateId(),
          name,
          description,
          requests: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          collections: [...state.collections, newCollection],
        }))
      },

      updateCollection: (id: string, updates: Partial<Collection>) => {
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c,
          ),
        }))
      },

      deleteCollection: (id: string) => {
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== id),
        }))
      },

      saveRequest: (collectionId: string, request) => {
        const id = generateId()
        const newRequest: HttpRequest = {
          ...request,
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        set((state) => {
          const newRequests = new Map(state.requests)
          newRequests.set(id, newRequest)

          return {
            requests: newRequests,
            collections: state.collections.map((c) =>
              c.id === collectionId
                ? { ...c, requests: [...c.requests, id], updatedAt: new Date() }
                : c,
            ),
          }
        })

        return id
      },

      updateRequest: (id: string, updates: Partial<HttpRequest>) => {
        set((state) => {
          const newRequests = new Map(state.requests)
          const existing = newRequests.get(id)
          if (existing) {
            newRequests.set(id, {
              ...existing,
              ...updates,
              updatedAt: new Date(),
            })
          }
          return { requests: newRequests }
        })
      },

      deleteRequest: (id: string) => {
        set((state) => {
          const newRequests = new Map(state.requests)
          newRequests.delete(id)
          return {
            requests: newRequests,
            collections: state.collections.map((c) => ({
              ...c,
              requests: c.requests.filter((r) => r !== id),
            })),
          }
        })
      },

      getRequest: (id: string) => {
        return get().requests.get(id)
      },

      addToHistory: (entry) => {
        // Truncate large response bodies before storing
        const truncatedResponse = truncateResponseBody(entry.response)
        const currentHistory = get().history
        const nextKey = buildHistoryKey(entry.request)
        const existingIndex = currentHistory.findIndex(
          (item) => buildHistoryKey(item.request) === nextKey,
        )

        if (existingIndex >= 0) {
          const existingEntry = currentHistory[existingIndex]
          const updatedEntry: RequestHistory = {
            ...existingEntry,
            ...entry,
            response: truncatedResponse,
            timestamp: new Date(),
          }
          const nextHistory = [
            updatedEntry,
            ...currentHistory.filter((_, index) => index !== existingIndex),
          ]
          set(() => ({
            history: nextHistory.slice(0, 50),
          }))
          return
        }

        const newEntry: RequestHistory = {
          ...entry,
          response: truncatedResponse,
          id: generateId(),
          timestamp: new Date(),
        }
        set((state) => ({
          // Keep last 50 in memory (reduced from 100)
          history: [newEntry, ...state.history].slice(0, 50),
        }))
      },

      clearHistory: () => {
        set({ history: [] })
      },

      searchHistory: (query: string) => {
        const state = get()
        if (!query) return state.history
        const lowerQuery = query.toLowerCase()
        return state.history.filter(
          (h) =>
            h.request.url.toLowerCase().includes(lowerQuery) ||
            h.request.name.toLowerCase().includes(lowerQuery),
        )
      },
    }),
    {
      name: 'mrgb-curl-collections',
      partialize: (state) => ({
        collections: state.collections,
        requests: Array.from(state.requests.entries()),
        // Only persist last 30 history entries to reduce storage
        history: state.history.slice(0, 30),
      }),
      merge: (persisted: any, current) => ({
        ...current,
        collections: persisted?.collections || [],
        requests: new Map(persisted?.requests || []),
        history: persisted?.history || [],
      }),
    },
  ),
)
