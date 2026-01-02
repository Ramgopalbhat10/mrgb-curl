# State Management Architecture

## Overview
Using Zustand for client state management and TanStack Query for server state management with TypeScript support and Zod validation.

## Store Structure

### Main App Store
```typescript
### Client State Store (Zustand)
```typescript
interface ClientState {
  // UI State
  activeRequestId: string | null;
  activeResponseTab: 'request' | 'response';
  activeRequestTab: 'params' | 'headers' | 'auth' | 'body';
  sidebarWidth: number;
  
  // Collections (client-side only)
  collections: Record<string, Collection>;
  
  // UI Actions
  setActiveRequest: (id: string | null) => void;
  setActiveResponseTab: (tab: 'request' | 'response') => void;
  setActiveRequestTab: (tab: 'params' | 'headers' | 'auth' | 'body') => void;
  setSidebarWidth: (width: number) => void;
  
  // Collection Actions
  createCollection: (name: string) => string;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;
}
```
```

## Store Implementation

### appStore.ts
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

interface Request {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body: string | null;
  bodyType: BodyType;
  queryParams: Record<string, string>;
  collectionId?: string;
  isDraft?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Response {
  id: string;
  requestId: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  contentType: string;
  size: number;
  time: number;
  cookies: Cookie[];
  timestamp: Date;
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  requests: string[];
  createdAt: Date;
  updatedAt: Date;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
type BodyType = 'json' | 'text' | 'form-data' | 'raw';

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        requests: {},
        activeRequestId: null,
        responses: {},
        activeResponseId: null,
        activeResponseTab: 'response',
        activeRequestTab: 'params',
        sidebarWidth: 280,
        collections: {},
        isLoading: false,
        error: null,

        // Request Actions
        createRequest: (request?: Partial<Request>) => {
          const id = generateId();
          const newRequest: Request = {
            id,
            name: request?.name || 'Untitled Request',
            method: request?.method || 'GET',
            url: request?.url || '',
            headers: request?.headers || {},
            body: request?.body || null,
            bodyType: request?.bodyType || 'json',
            queryParams: request?.queryParams || {},
            collectionId: request?.collectionId,
            isDraft: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...request,
          };

          set((state) => ({
            requests: { ...state.requests, [id]: newRequest },
            activeRequestId: id,
          }));

          return id;
        },

        updateRequest: (id: string, updates: Partial<Request>) => {
          set((state) => ({
            requests: {
              ...state.requests,
              [id]: {
                ...state.requests[id],
                ...updates,
                updatedAt: new Date(),
              },
            },
          }));
        },

        deleteRequest: (id: string) => {
          set((state) => {
            const { [id]: deleted, ...rest } = state.requests;
            return {
              requests: rest,
              activeRequestId: state.activeRequestId === id ? null : state.activeRequestId,
            };
          });
        },

        setActiveRequest: (id: string | null) => {
          set({ activeRequestId: id });
        },

        // Response Actions
        setResponse: (requestId: string, response: Response) => {
          set((state) => ({
            responses: { ...state.responses, [response.id]: response },
            activeResponseId: response.id,
          }));
        },

        clearResponse: (requestId: string) => {
          set((state) => {
            const responseId = Object.values(state.responses).find(
              (r) => r.requestId === requestId
            )?.id;
            
            if (responseId) {
              const { [responseId]: deleted, ...rest } = state.responses;
              return {
                responses: rest,
                activeResponseId: state.activeResponseId === responseId ? null : state.activeResponseId,
              };
            }
            return state;
          });
        },

        setActiveResponse: (id: string | null) => {
          set({ activeResponseId: id });
        },

        // UI Actions
        setActiveResponseTab: (tab: 'request' | 'response') => {
          set({ activeResponseTab: tab });
        },

        setActiveRequestTab: (tab: 'params' | 'headers' | 'auth' | 'body') => {
          set({ activeRequestTab: tab });
        },

        setSidebarWidth: (width: number) => {
          set({ sidebarWidth: Math.max(200, Math.min(400, width)) });
        },

        // Collection Actions
        createCollection: (name: string) => {
          const id = generateId();
          const newCollection: Collection = {
            id,
            name,
            requests: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set((state) => ({
            collections: { ...state.collections, [id]: newCollection },
          }));

          return id;
        },

        updateCollection: (id: string, updates: Partial<Collection>) => {
          set((state) => ({
            collections: {
              ...state.collections,
              [id]: {
                ...state.collections[id],
                ...updates,
                updatedAt: new Date(),
              },
            },
          }));
        },

        deleteCollection: (id: string) => {
          set((state) => {
            const { [id]: deleted, ...rest } = state.collections;
            
            // Remove collection reference from requests
            const updatedRequests = Object.values(state.requests).reduce((acc, req) => {
              if (req.collectionId === id) {
                acc[req.id] = { ...req, collectionId: undefined };
              } else {
                acc[req.id] = req;
              }
              return acc;
            }, {} as Record<string, Request>);

            return {
              collections: rest,
              requests: updatedRequests,
            };
          });
        },

        addRequestToCollection: (collectionId: string, requestId: string) => {
          set((state) => ({
            collections: {
              ...state.collections,
              [collectionId]: {
                ...state.collections[collectionId],
                requests: [...state.collections[collectionId].requests, requestId],
                updatedAt: new Date(),
              },
            },
            requests: {
              ...state.requests,
              [requestId]: {
                ...state.requests[requestId],
                collectionId,
                isDraft: false,
                updatedAt: new Date(),
              },
            },
          }));
        },

        removeRequestFromCollection: (collectionId: string, requestId: string) => {
          set((state) => ({
            collections: {
              ...state.collections,
              [collectionId]: {
                ...state.collections[collectionId],
                requests: state.collections[collectionId].requests.filter(id => id !== requestId),
                updatedAt: new Date(),
              },
            },
            requests: {
              ...state.requests,
              [requestId]: {
                ...state.requests[requestId],
                collectionId: undefined,
                isDraft: true,
                updatedAt: new Date(),
              },
            },
          }));
        },

        // Utility Actions
        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        setError: (error: string | null) => {
          set({ error });
        },

        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'app-store',
        partialize: (state) => ({
          requests: state.requests,
          collections: state.collections,
          sidebarWidth: state.sidebarWidth,
        }),
      }
    )
  )
);

## Selectors

### Server State (TanStack Query)
```typescript
// HTTP Request Queries
const useSendRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: executeHttpRequest,
    onSuccess: (response, variables) => {
      // Update cache with new response
      queryClient.setQueryData(['response', variables.id], response);
      // Invalidate responses list
      queryClient.invalidateQueries({ queryKey: ['responses'] });
    },
    onError: (error) => {
      // Handle error with toast/notification
      console.error('Request failed:', error);
    },
  });
};

const useResponses = () => {
  return useQuery({
    queryKey: ['responses'],
    queryFn: fetchResponsesFromStorage,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  });
};

const useRequest = (id: string) => {
  return useQuery({
    queryKey: ['request', id],
    queryFn: () => fetchRequestFromStorage(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!id,
  });
};

// Collections Queries
const useCollections = () => {
  return useQuery({
    queryKey: ['collections'],
    queryFn: fetchCollectionsFromStorage,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

const useCreateRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createRequestInStorage,
    onSuccess: (newRequest) => {
      queryClient.setQueryData(['request', newRequest.id], newRequest);
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
};

export const useActiveRequest = () => {
  return useAppStore((state) => {
    if (!state.activeRequestId) return null;
    return state.requests[state.activeRequestId];
  });
};

export const useRequestById = (id: string) => {
  return useAppStore((state) => state.requests[id]);
};

export const useRequestsByCollection = (collectionId: string) => {
  return useAppStore((state) => 
    Object.values(state.requests).filter(req => req.collectionId === collectionId)
  );
};

export const useDraftRequests = () => {
  return useAppStore((state) => 
    Object.values(state.requests).filter(req => req.isDraft)
  );
};
```

### Response Selectors
```typescript
export const useActiveResponse = () => {
  return useAppStore((state) => {
    if (!state.activeResponseId) return null;
    return state.responses[state.activeResponseId];
  });
};

export const useResponseByRequestId = (requestId: string) => {
  return useAppStore((state) => 
    Object.values(state.responses).find(resp => resp.requestId === requestId)
  );
};
```

### Collection Selectors
```typescript
export const useAllCollections = () => {
  return useAppStore((state) => Object.values(state.collections));
};

export const useCollectionById = (id: string) => {
  return useAppStore((state) => state.collections[id]);
};
```

## Hooks for Complex Operations

### useRequestActions Hook
```typescript
export const useRequestActions = () => {
  const {
    createRequest,
    updateRequest,
    deleteRequest,
    setActiveRequest,
  } = useAppStore();

  const duplicateRequest = (id: string) => {
    const original = useAppStore.getState().requests[id];
    if (original) {
      const newId = createRequest({
        ...original,
        name: `${original.name} (Copy)`,
        id: undefined,
      });
      setActiveRequest(newId);
      return newId;
    }
  };

  const sendRequest = async (id: string) => {
    const request = useAppStore.getState().requests[id];
    if (!request) return;

    try {
      useAppStore.getState().setLoading(true);
      useAppStore.getState().clearError();

      const response = await executeHttpRequest(request);
      useAppStore.getState().setResponse(id, response);
      
      // Update request with sent timestamp
      updateRequest(id, { 
        lastSentAt: new Date(),
        isDraft: false,
      });
    } catch (error) {
      useAppStore.getState().setError(error.message);
    } finally {
      useAppStore.getState().setLoading(false);
    }
  };

  return {
    createRequest,
    updateRequest,
    deleteRequest,
    setActiveRequest,
    duplicateRequest,
    sendRequest,
  };
};
```

### usePersistence Hook
```typescript
export const usePersistence = () => {
  const { requests, collections } = useAppStore();

  const exportData = () => {
    const data = {
      requests,
      collections,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `postman-clone-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          
          // Validate data structure
          if (!data.requests || !data.collections) {
            throw new Error('Invalid file format');
          }

          // Import collections first
          Object.values(data.collections).forEach((collection: any) => {
            useAppStore.getState().createCollection(collection.name);
          });

          // Then import requests
          Object.values(data.requests).forEach((request: any) => {
            useAppStore.getState().createRequest(request);
          });

          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      useAppStore.getState().requests = {};
      useAppStore.getState().collections = {};
      useAppStore.getState().responses = {};
      useAppStore.getState().activeRequestId = null;
      useAppStore.getState().activeResponseId = null;
    }
  };

  return {
    exportData,
    importData,
    clearAllData,
  };
};
```

## Performance Optimizations

### Selective Re-renders
- Use selectors to prevent unnecessary re-renders
- Separate UI state from data state
- Debounce rapid state updates

### Persistence Strategy
- Only persist essential data (requests, collections)
- Exclude responses from persistence (too large)
- Use partialize to minimize storage size
- Implement storage quota management

### Memory Management
- Limit response history (keep only last 50 responses)
- Clean up old responses periodically
- Implement response size limits
- Use weak references for temporary data

## Error Handling

### Global Error Boundary
```typescript
export const StoreErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary
      fallback={<ErrorDisplay />}
      onError={(error, errorInfo) => {
        console.error('Store error:', error, errorInfo);
        // Could send to error reporting service
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
```

### Error Recovery
- Auto-save draft before error occurs
- Implement undo/redo for critical operations
- Provide data recovery options
- Clear corrupted data automatically

## Testing Strategy

### Unit Tests
- Test all store actions
- Verify selector behavior
- Test persistence functions
- Mock external dependencies

### Integration Tests
- Test component-store interactions
- Verify data flow
- Test error scenarios
- Validate persistence

### Performance Tests
- Measure store performance with large datasets
- Test memory usage
- Verify re-render optimization
- Test persistence performance
