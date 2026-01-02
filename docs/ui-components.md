# UI Components Specification

## Component Hierarchy

```
App
├── AppShell
│   ├── Sidebar
│   │   ├── CollectionsList
│   │   ├── DraftsList
│   │   ├── HistoryList
│   │   └── AddCollectionButton
│   ├── RequestEditor
│   │   ├── TabBar
│   │   │   └── RequestTab
│   │   ├── UrlInput
│   │   │   ├── MethodSelector
│   │   │   └── UrlField
│   │   ├── RequestTabs
│   │   │   ├── ParamsEditor
│   │   │   ├── HeadersEditor
│   │   │   ├── AuthEditor
│   │   │   └── BodyEditor
│   │   └── SendButton
│   └── ResponseDisplay
│       ├── ResponseTabs
│       │   ├── RequestView
│       │   └── ResponseView
│       ├── ResponseStatus
│       ├── ResponseViewer
│       ├── HeadersPanel
│       └── CookiesPanel
└── ThemeProvider
```

## Component Specifications

### AppShell
**Purpose**: Main layout container with three-column structure
**Props**: None
**State**: None
**Features**:
- Responsive three-column layout
- Minimum/maximum widths for columns
- Collapsible sidebar on mobile
- QueryClient provider for TanStack Query

```typescript
interface AppShellProps {
  children: React.ReactNode;
}
```

### Sidebar
**Purpose**: Left navigation panel for collections and history
**Props**:
```typescript
interface SidebarProps {
  collections: Collection[];
  drafts: Request[];
  history: Request[];
  activeRequest?: string;
  onSelectRequest: (id: string) => void;
  onCreateCollection: () => void;
}
```

### RequestEditor
**Purpose**: Middle column for building HTTP requests
**Props**:
```typescript
interface RequestEditorProps {
  request: Request;
  isActive: boolean;
  onUpdateRequest: (updates: Partial<Request>) => void;
  onSendRequest: () => void;
  isLoading: boolean;
  validationErrors?: ValidationError[];
}
```

### ResponseDisplay
**Purpose**: Right column for showing request/response data
**Props**:
```typescript
interface ResponseDisplayProps {
  request: Request;
  response?: Response;
  activeTab: 'request' | 'response';
  onTabChange: (tab: 'request' | 'response') => void;
}
```

## Detailed Component Specs

### UrlInput Component
**Location**: RequestEditor/UrlInput
**Purpose**: URL input with HTTP method selector
**Props**:
```typescript
interface UrlInputProps {
  method: HttpMethod;
  url: string;
  onMethodChange: (method: HttpMethod) => void;
  onUrlChange: (url: string) => void;
  onSend: () => void;
  disabled?: boolean;
  validationError?: string;
}
```

**Features**:
- Dropdown for HTTP methods
- Text input for URL
- Zod URL validation with visual feedback
- Enter key to send request
- Auto-focus on URL field
- Real-time validation feedback

### MethodSelector Component
**Location**: RequestEditor/UrlInput/MethodSelector
**Purpose**: Dropdown for selecting HTTP method
**Props**:
```typescript
interface MethodSelectorProps {
  value: HttpMethod;
  onChange: (method: HttpMethod) => void;
  disabled?: boolean;
}
```

**Methods**: GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
**Styling**: Color-coded by method type (GET=green, POST=blue, etc.)

### HeadersEditor Component
**Location**: RequestEditor/RequestTabs/HeadersEditor
**Purpose**: Dynamic headers management
**Props**:
```typescript
interface HeadersEditorProps {
  headers: Record<string, string>;
  onChange: (headers: Record<string, string>) => void;
  validationErrors?: Record<string, string>;
}
```

**Features**:
- Add/remove header rows
- Key-value input fields
- Zod header validation
- Common header presets
- Bulk edit mode
- Enable/disable individual headers
- Real-time validation feedback

### BodyEditor Component
**Location**: RequestEditor/RequestTabs/BodyEditor
**Purpose**: Multi-format request body editor
**Props**:
```typescript
interface BodyEditorProps {
  body: string;
  bodyType: BodyType;
  onChange: (body: string, bodyType: BodyType) => void;
  method: HttpMethod;
  validationError?: string;
}
```

**Body Types**: json, text, form-data, raw
**Features**:
- JSON validation with Zod schema
- Syntax highlighting
- Method-body compatibility checks
- Character count
- Auto-resize textarea
- Real-time validation feedback

### ResponseViewer Component
**Location**: ResponseDisplay/ResponseViewer
**Purpose**: Formatted response display
**Props**:
```typescript
interface ResponseViewerProps {
  body: string;
  contentType: string;
  status: number;
  isLoading?: boolean;
  error?: string;
}
```

**Features**:
- JSON syntax highlighting
- Raw text display
- HTML preview (for text/html)
- Image display (for image types)
- Download response button
- Copy to clipboard
- Line numbers
- Search within response
- Loading and error states from TanStack Query

### TabBar Component
**Location**: RequestEditor/TabBar
**Purpose**: Request tabs management
**Props**:
```typescript
interface TabBarProps {
  tabs: Request[];
  activeTab: string;
  onTabChange: (id: string) => void;
  onTabClose: (id: string) => void;
  onNewTab: () => void;
  onTabRename: (id: string, name: string) => void;
}
```

**Features**:
- Horizontal scrolling for many tabs
- Close buttons on tabs
- Active tab highlighting
- New tab button
- Tab renaming (double-click)
- Drag to reorder tabs

### ResponseStatus Component
**Location**: ResponseDisplay/ResponseStatus
**Purpose**: Display response metadata
**Props**:
```typescript
interface ResponseStatusProps {
  status: number;
  statusText: string;
  time: number;
  size: number;
  timestamp: Date;
}
```

**Features**:
- Status code with color coding
- Response time in milliseconds
- File size with appropriate units
- Timestamp with relative time
- Copy request details

## Shadcn UI Components Usage

### Components to Use Directly
- `Button` - Send button, tab buttons, action buttons
- `Input` - URL input, header key/value inputs
- `Select` - Method selector, body type selector
- `Textarea` - Body editor, raw response display
- `Tabs` - Request/response tabs, params/headers/body tabs
- `Table` - Headers display, cookies display
- `Card` - Section containers
- `Badge` - Status codes, method indicators
- `DropdownMenu` - Context menus, action menus
- `Separator` - Visual separators
- `ScrollArea` - Scrollable content areas

### Components to Extend
- `Dialog` - Settings, export/import modals
- `Popover` - Header presets, method info
- `Tooltip` - Button tooltips, status explanations
- `Switch` - Enable/disable headers
- `Checkbox` - Bulk selection options

## Design System

### Colors
```css
/* Status Code Colors */
.status-2xx { color: var(--success); }
.status-3xx { color: var(--warning); }
.status-4xx { color: var(--destructive); }
.status-5xx { color: var(--destructive); }

/* Method Colors */
.method-get { color: var(--success); }
.method-post { color: var(--primary); }
.method-put { color: var(--warning); }
.method-delete { color: var(--destructive); }
.method-patch { color: var(--warning); }
```

### Typography
- **Monospace**: Code, URLs, JSON, headers
- **Sans-serif**: UI labels, buttons, navigation
- **Font sizes**: 
  - Small: 12px (metadata, timestamps)
  - Normal: 14px (body text, inputs)
  - Large: 16px (headings, labels)

### Spacing
- **Component padding**: 16px
- **Section gaps**: 24px
- **Item spacing**: 8px
- **Border radius**: 6px (default), 8px (cards)

### Animations
- **Tab transitions**: 150ms ease-in-out
- **Button hover**: 100ms ease-out
- **Loading states**: 300ms fade-in
- **Error states**: 200ms shake animation

## Responsive Design

### Breakpoints
- **Mobile**: < 768px (single column, stacked layout)
- **Tablet**: 768px - 1024px (two columns, collapsible sidebar)
- **Desktop**: > 1024px (three columns, full layout)

### Mobile Adaptations
- Sidebar becomes slide-out drawer
- Request editor takes full width
- Response display slides up from bottom
- Tab bar becomes scrollable horizontally

## Accessibility

### Keyboard Navigation
- Tab order follows visual layout
- All interactive elements focusable
- Keyboard shortcuts for common actions
- Focus management in modals

### Screen Reader Support
- Semantic HTML elements
- ARIA labels for custom components
- Status announcements for loading/errors
- Descriptive text for icons

### Visual Accessibility
- High contrast mode support
- Focus indicators clearly visible
- Text respects browser zoom settings
- Color not used as only indicator
