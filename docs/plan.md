# Postman-like Web Application - Development Plan

## Project Overview
A minimal Postman clone for personal use with a clean, multi-column interface for testing HTTP requests.

## Tech Stack
- **Framework**: TanStack Start
- **Async State Management**: @tanstack/react-query
- **UI Components**: Shadcn UI with @base-ui/react primitives
- **Validation**: Zod
- **Runtime**: Bun
- **Styling**: TailwindCSS
- **Icons**: Lucide React

## Core Requirements

### MVP Features
1. **HTTP Request Builder**
   - URL input field
   - HTTP method selector (GET, POST, PUT, DELETE, PATCH, etc.)
   - Headers management (add/remove/edit)
   - Body editor (JSON, raw text, form-data)
   - Query parameters management

2. **Response Display**
   - Formatted JSON response
   - Response headers
   - Request headers
   - Status code
   - Response time
   - Response size
   - Cookies display

3. **Tab Management**
   - Multiple request tabs
   - Tab creation, deletion, and naming
   - Active tab state management

4. **Sidebar Navigation**
   - Collections (basic structure)
   - Drafts section
   - Request history

## UI Layout Design

### Three-Column Layout
```
┌─────────────┬──────────────────┬─────────────────┐
│   Sidebar   │   Request Editor │   Response      │
│             │                  │   Display       │
│ Collections │                  │                 │
│ Drafts      │   URL Input      │   Request Tab   │
│ History     │   Method Select  │   Response Tab  │
│             │   Tabs (Params,  │   Headers       │
│             │   Headers, etc.) │   Body          │
│             │   Body Editor    │   Stats         │
│             │                  │                 │
└─────────────┴──────────────────┴─────────────────┘
```

### Component Breakdown

#### Left Sidebar (280px)
- **CollectionsList**: Folder structure for organizing requests
- **DraftsList**: Unsaved requests
- **HistoryList**: Recently sent requests
- **AddCollectionButton**: Create new collections

#### Middle Column (500px)
- **TabBar**: Request tabs with close buttons
- **UrlBar**: URL input and method selector
- **RequestTabs**: Params, Headers, Auth, Body, Pre-request Script
- **SendButton**: Execute HTTP request

#### Right Column (400px)
- **ResponseTabs**: Request/Response toggle
- **ResponseStatus**: Status code, time, size
- **ResponseBody**: Formatted JSON/raw response
- **HeadersPanel**: Request/Response headers
- **CookiesPanel**: Response cookies

## Data Models

### Request Model
```typescript
interface Request {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  headers: Record<string, string>;
  body: string | null;
  bodyType: 'json' | 'text' | 'form-data' | 'raw';
  queryParams: Record<string, string>;
  collectionId?: string;
  isDraft?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Response Model
```typescript
interface Response {
  id: string;
  requestId: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  contentType: string;
  size: number;
  time: number; // milliseconds
  cookies: Cookie[];
  timestamp: Date;
}
```

### Collection Model
```typescript
interface Collection {
  id: string;
  name: string;
  description?: string;
  requests: Request[];
  createdAt: Date;
  updatedAt: Date;
}
```

## State Management

### Client State (Zustand)
```typescript
interface ClientState {
  // UI State
  activeRequestId: string | null;
  activeResponseTab: 'request' | 'response';
  activeRequestTab: 'params' | 'headers' | 'auth' | 'body';
  sidebarWidth: number;
  
  // Collections
  collections: Record<string, Collection>;
  
  // UI Actions
  setActiveRequest: (id: string | null) => void;
  setActiveResponseTab: (tab: 'request' | 'response') => void;
  setActiveRequestTab: (tab: 'params' | 'headers' | 'auth' | 'body') => void;
  setSidebarWidth: (width: number) => void;
}
```

### Server State (TanStack Query)
```typescript
// HTTP Request Queries
const useSendRequest = () => {
  return useMutation({
    mutationFn: executeHttpRequest,
    onSuccess: (response, variables) => {
      // Handle successful request
      queryClient.invalidateQueries({ queryKey: ['responses'] });
    },
    onError: (error) => {
      // Handle error
    },
  });
};

const useResponses = () => {
  return useQuery({
    queryKey: ['responses'],
    queryFn: fetchResponses,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Collections Queries
const useCollections = () => {
  return useQuery({
    queryKey: ['collections'],
    queryFn: fetchCollections,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

## Component Architecture

### Core Components
1. **AppShell**: Main layout container
2. **Sidebar**: Left navigation panel
3. **RequestEditor**: Middle column request builder
4. **ResponseDisplay**: Right column response viewer
5. **UrlInput**: URL input and method selector
6. **HeadersEditor**: Dynamic headers management
7. **BodyEditor**: Multi-format body editor
8. **ResponseViewer**: Formatted response display

### Hooks
1. **useRequestState**: Client state management with Zustand
2. **useSendRequest**: TanStack Query mutation for HTTP requests
3. **useResponses**: TanStack Query for response data
4. **useCollections**: TanStack Query for collections
5. **useValidation**: Zod schema validation for forms and data

## HTTP Request Flow

1. **Request Validation (Zod)**
   - URL format validation with schema
   - Headers validation
   - Body schema validation
   - Method-body compatibility checks

2. **Request Execution (TanStack Query Mutation)**
   - Optimistic updates for UI
   - Request cancellation support
   - Automatic retry logic
   - Error boundary integration

3. **Response Processing (TanStack Query Cache)**
   - Automatic caching with stale-while-revalidate
   - Background refetching
   - Response parsing and validation
   - Metadata extraction

## Persistence Strategy

### Client State (Zustand + LocalStorage)
- UI preferences and settings
- Active tab states
- Sidebar configuration
- Temporary draft data

### Server State (TanStack Query + LocalStorage)
- Requests and collections
- Response history with pagination
- Request metadata
- Export/import functionality

### Validation Layer (Zod)
- Schema validation for all data (requests, responses, collections)
- Type-safe API responses
- Request/response validation (URL format, headers, JSON body)
- Storage data integrity
- Error handling and user feedback

**See [development-guide.md](./development-guide.md) for validation implementation patterns.**

## Development Phases

### Phase 1: Core Layout & Basic Request
- Three-column layout
- URL input and method selector
- Basic GET request execution
- Simple response display

### Phase 2: Request Building
- Headers management
- Query parameters
- Body editor (JSON/text)
- Tab management

### Phase 3: Response Features
- Formatted JSON display
- Headers and cookies display
- Status and timing information
- Response size calculation

### Phase 4: Organization & Persistence
- Collections and drafts
- LocalStorage persistence
- Request history
- Tab state management

### Phase 5: Polish & UX
- Keyboard shortcuts
- Dark/light theme
- Responsive design
- Error handling

## File Structure
```
src/
├── components/           # React components
│   ├── ui/                          # Shadcn UI components (auto-generated with @base-ui/react primitives)
│   ├── AppShell.tsx     # Main layout
│   ├── Sidebar/         # Left sidebar components
│   ├── RequestEditor/   # Request building components
│   ├── ResponseDisplay/ # Response display components
│   └── shared/          # Shared utility components
├── hooks/               # Custom React hooks
│   ├── useRequestState.ts    # Zustand state management
│   ├── useSendRequest.ts     # TanStack Query mutation
│   ├── useResponses.ts        # TanStack Query for responses
│   ├── useCollections.ts      # TanStack Query for collections
│   ├── useValidation.ts       # Zod validation hook
│   └── usePersistence.ts      # Storage operations
├── stores/              # Zustand stores
│   ├── clientStore.ts         # UI state management
│   └── selectors.ts           # Derived state selectors
├── types/               # TypeScript type definitions
│   ├── request.ts       # Request types
│   ├── response.ts      # Response types
│   ├── collection.ts    # Collection types
│   └── validation.ts    # Zod schemas and validation utilities
├── utils/               # Utility functions
│   ├── http.ts          # HTTP utilities
│   ├── storage.ts       # Storage helpers
│   ├── formatting.ts    # JSON formatting
│   └── validation.ts    # Zod validation schemas
├── styles/              # Global styles
│   └── globals.css      # Tailwind + custom styles
└── routes/              # File-based routing
    └── __root.tsx       # Root layout with QueryClient
```

**See [components-mapping.md](./components-mapping.md) for detailed component specifications and Shadcn UI integration.**

## Key Technical Decisions

1. **State Management**: Zustand for UI state, TanStack Query for server state
2. **HTTP Client**: Native fetch with TanStack Query wrapper
3. **Validation**: Zod schemas for type safety and validation
4. **Runtime**: Bun for development and production
5. **Component Library**: Shadcn UI with @base-ui/react primitives for consistent design system
6. **Data Flow**: Unidirectional with optimistic updates
7. **Error Handling**: Zod validation + TanStack Query error boundaries

## Performance Considerations

- Lazy load response bodies for large responses
- Debounce URL input validation
- Virtualize long lists in sidebar
- Optimize JSON parsing and formatting
- Implement response caching for repeated requests

## Security Notes

- Handle sensitive data in headers/body
- Sanitize response display
- Validate URLs before sending
- Handle CORS errors gracefully
- No persistence of sensitive auth data
