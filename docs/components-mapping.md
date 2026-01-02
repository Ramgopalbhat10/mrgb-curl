# Components Mapping - Shadcn UI Integration

## File Hierarchy & Component Mapping

```
src/components/
├── ui/                          # Shadcn UI components (auto-generated with @base-ui/react primitives)
│   ├── button.tsx               # @shadcn/button
│   ├── input.tsx                # @shadcn/input
│   ├── select.tsx               # @shadcn/select
├── AppShell.tsx                 # Main layout wrapper
├── Sidebar/
│   ├── index.tsx                # Sidebar container
│   ├── CollectionsList.tsx      # Collections tree view
│   ├── DraftsList.tsx           # Draft requests list
│   ├── HistoryList.tsx          # Request history
│   └── AddCollectionButton.tsx  # Add new collection
├── RequestEditor/
│   ├── index.tsx                # Request editor container
│   ├── TabBar.tsx               # Request tabs (multiple requests)
│   ├── UrlInput/
│   │   ├── index.tsx            # URL input container
│   │   ├── MethodSelector.tsx   # HTTP method dropdown
│   │   └── UrlField.tsx         # URL text input
│   ├── RequestTabs/
│   │   ├── index.tsx            # Request tabs container
│   │   ├── ParamsEditor.tsx     # Query parameters editor
│   │   ├── HeadersEditor.tsx    # Headers table editor
│   │   ├── AuthEditor.tsx       # Authentication settings
│   │   └── BodyEditor.tsx       # Request body editor
│   └── SendButton.tsx           # Send request button
├── ResponseDisplay/
│   ├── index.tsx                # Response display container
│   ├── ResponseTabs.tsx         # Request/Response tabs
│   ├── RequestView.tsx          # Sent request details
│   ├── ResponseView.tsx         # Response content
│   ├── ResponseStatus.tsx       # Status, time, size info
│   ├── ResponseViewer.tsx       # Formatted response body
│   ├── HeadersPanel.tsx         # Response headers table
│   └── CookiesPanel.tsx         # Response cookies list
└── shared/
    ├── ResizablePanel.tsx       # Custom resizable sidebar
    ├── JsonEditor.tsx           # JSON editor with validation
    ├── StatusBadge.tsx          # HTTP status badge
    └── LoadingSpinner.tsx       # Custom loading states
```

## Component Specifications

### AppShell
**Shadcn Components**: None (layout wrapper)
**Purpose**: Main application layout with three columns
**Styles**: 
- Flex container with min-height: 100vh
- Dark theme support
- Responsive breakpoints
**Interactions**: 
- Handles window resize
- Manages sidebar collapse on mobile
- Provides QueryClient context

### Sidebar
**Shadcn Components**: `sidebar`, `button`, `separator`, `scroll-area`
**Purpose**: Navigation panel for collections and history
**Styles**:
- Fixed width (280px default, resizable 200-400px)
- Border right, background color
- Collapsible on mobile
**Interactions**:
- Drag to resize width
- Click collection to expand/collapse
- Click request to select
- Add new collection button

#### CollectionsList
**Shadcn Components**: `sidebar-menu`, `button`, `badge`
**Styles**:
- Tree structure with indentation
- Folder icons for collections
- Request count badges
**Interactions**:
- Expand/collapse collections
- Drag-drop to reorder
- Right-click context menu
- Double-click to rename

#### DraftsList
**Shadcn Components**: `sidebar-menu`, `badge`
**Styles**:
- Document icons
- Grayed out text for unsaved
- Draft count indicator
**Interactions**:
- Click to open draft
- Delete draft button
- Auto-save indicator

#### HistoryList
**Shadcn Components**: `sidebar-menu`, `badge`
**Styles**:
- Clock icons
- Timestamp display
- Method color coding
**Interactions**:
- Click to reopen request
- Clear history button
- Search/filter history

### RequestEditor
**Shadcn Components**: `card`, `tabs`, `separator`
**Purpose**: Middle column for building HTTP requests
**Styles**:
- Flexible width (500px min)
- Card-based sections
- Tab navigation
**Interactions**:
- Tab switching
- Form validation
- Auto-save drafts

#### TabBar
**Shadcn Components**: `tabs`, `button`, `badge`
**Styles**:
- Horizontal scrollable tabs
- Close buttons on tabs
- Active tab highlighting
- New tab button
**Interactions**:
- Add new request tab
- Close tab (with unsaved warning)
- Switch between tabs
- Drag to reorder tabs

#### UrlInput
**Shadcn Components**: `input`, `select`, `button`
**Styles**:
- Method selector (80px width)
- URL input field (monospace font)
- Validation error states
- Send button integration
**Interactions**:
- Method selection
- URL typing with validation
- Enter key to send
- Paste URL support

##### MethodSelector
**Shadcn Components**: `select`
**Styles**:
- Color-coded by method
- Compact dropdown
- Method-specific colors
**Interactions**:
- Dropdown selection
- Keyboard navigation
- Method validation

##### UrlField
**Shadcn Components**: `input`, `tooltip`
**Styles**:
- Monospace font
- Full width
- Error state styling
- Placeholder text
**Interactions**:
- Real-time URL validation
- Paste support
- Focus/blur events
- Error tooltip

#### RequestTabs
**Shadcn Components**: `tabs`, `card`, `separator`
**Styles**:
- Underline tab style
- Content padding
- Active tab indicator
**Interactions**:
- Tab switching
- Keyboard navigation
- Content persistence

##### ParamsEditor
**Shadcn Components**: `table`, `input`, `button`, `checkbox`
**Styles**:
- Key-value table
- Add/remove buttons
- Bulk edit mode
- Enable/disable toggles
**Interactions**:
- Add parameter row
- Remove parameter
- Edit key/value
- Enable/disable parameter
- URL synchronization

##### HeadersEditor
**Shadcn Components**: `table`, `input`, `button`, `switch`, `dropdown-menu`
**Styles**:
- Compact table layout
- Editable cells
- Header presets
- Enable/disable switches
**Interactions**:
- Add header row
- Remove header
- Edit header name/value
- Enable/disable header
- Apply preset headers
- Bulk edit mode

##### AuthEditor
**Shadcn Components**: `tabs`, `input`, `select`, `switch`
**Styles**:
- Auth type tabs
- Form fields
- Help text
- Toggle switches
**Interactions**:
- Select auth type
- Fill auth credentials
- Toggle auth on/off
- Test authentication

##### BodyEditor
**Shadcn Components**: `tabs`, `textarea`, `select`, `input`
**Styles**:
- Body type selector
- JSON editor
- Raw text area
- Form data table
**Interactions**:
- Select body type
- Edit JSON with validation
- Edit raw text
- Add form data fields
- Format JSON button

#### SendButton
**Shadcn Components**: `button`, `spinner`
**Styles**:
- Primary green button
- Loading state with spinner
- Disabled state
- Hover effects
**Interactions**:
- Click to send request
- Show loading state
- Disable during request
- Keyboard shortcut (Ctrl+Enter)

### ResponseDisplay
**Shadcn Components**: `card`, `tabs`, `separator`, `scroll-area`
**Purpose**: Right column for showing request/response data
**Styles**:
- Flexible width (400px min)
- Card-based layout
- Tab navigation
- Scrollable content
**Interactions**:
- Tab switching
- Copy content
- Download response
- Search in response

#### ResponseTabs
**Shadcn Components**: `tabs`
**Styles**:
- Card style tabs
- Content switching
- Active state
**Interactions**:
- Switch between request/response
- Keyboard navigation
- Tab persistence

#### RequestView
**Shadcn Components**: `card`, `table`, `badge`, `button`
**Styles**:
- Request details table
- Method badge
- Copy buttons
- Monospace fonts
**Interactions**:
- View sent request
- Copy request details
- Export request
- Show/hide headers

#### ResponseView
**Shadcn Components**: `card`, `scroll-area`, `button`
**Styles**:
- Response body display
- Syntax highlighting
- Copy/download buttons
- Search functionality
**Interactions**:
- View formatted response
- Copy response body
- Download as file
- Search in response
- Format JSON

#### ResponseStatus
**Shadcn Components**: `badge`, `separator`
**Styles**:
- Status code badge
- Time and size display
- Color-coded status
- Compact layout
**Interactions**:
- Click to copy status
- Show detailed timing
- View response size
- Status explanations

#### ResponseViewer
**Shadcn Components**: `textarea`, `scroll-area`, `button`
**Styles**:
- Monospace font
- Syntax highlighting
- Line numbers
- Search bar
**Interactions**:
- View response body
- Copy to clipboard
- Search text
- Format JSON
- Toggle line numbers

#### HeadersPanel
**Shadcn Components**: `table`, `scroll-area`, `button`, `input`
**Styles**:
- Headers table
- Sortable columns
- Filter input
- Copy all button
**Interactions**:
- View response headers
- Sort by name/value
- Filter headers
- Copy all headers
- Search headers

#### CookiesPanel
**Shadcn Components**: `table`, `badge`, `button`
**Styles**:
- Cookies table
- Attribute badges
- Domain/path info
- Expiry display
**Interactions**:
- View response cookies
- Copy cookie value
- Show cookie details
- Filter cookies

### Shared Components

#### ResizablePanel
**Shadcn Components**: None (custom)
**Purpose**: Resizable sidebar panel
**Styles**:
- Resize handle on right
- Smooth resizing
- Min/max width limits
- Cursor changes
**Interactions**:
- Drag to resize
- Double-click to reset
- Keyboard resize
- Persist width

#### JsonEditor
**Shadcn Components**: `textarea`, `button`, `tooltip`
**Purpose**: JSON editor with validation
**Styles**:
- Monospace font
- Syntax highlighting
- Error indicators
- Format button
**Interactions**:
- Edit JSON with validation
- Format JSON
- Validate on type
- Show error messages

#### StatusBadge
**Shadcn Components**: `badge`
**Purpose**: HTTP status code display
**Styles**:
- Color-coded by range
- Status text
- Hover effects
- Compact size
**Interactions**:
- Click to copy status
- Show status meaning
- Color coding

#### LoadingSpinner
**Base UI Components**: `spinner`, `skeleton`
**Purpose**: Loading state indicators
**Styles**:
- Overlay spinner
- Skeleton screens
- Progress indicators
- Smooth animations
**Interactions**:
- Show during requests
- Skeleton loading
- Progress feedback
- Cancel operations

## Component Dependencies

### Core Dependencies
- `@base-ui/react` - All UI components (imported as subpaths)
- `class-variance-authority` - Variant styling
- `clsx` - Conditional classes
- `tailwind-merge` - Style merging
- `lucide-react` - Icons

**BaseUI Import Examples:**
```typescript
import { Popover } from '@base-ui/react/popover';
import { Dialog } from '@base-ui/react/dialog';
import { Select } from '@base-ui/react/select';
import { Tabs } from '@base-ui/react/tabs';
```

### Custom Hooks
- `useValidation` - Zod validation
- `useRequestState` - Zustand state
- `useSendRequest` - TanStack Query
- `useLocalStorage` - Persistence
- `useKeyboardShortcuts` - Keyboard events

### Utility Functions
- `cn()` - Class name merging
- `formatJson()` - JSON formatting
- `parseHeaders()` - Header parsing
- `validateUrl()` - URL validation
- `calculateSize()` - Response size

## Styling Patterns

### Color Scheme
- Primary: Blue (hsl(221 83% 53%))
- Success: Green (hsl(142 76% 36%))
- Warning: Yellow (hsl(38 92% 50%))
- Error: Red (hsl(0 84% 60%))
- Muted: Gray (hsl(210 40% 98%))

### Typography
- Sans-serif: UI elements, labels
- Monospace: Code, URLs, JSON
- Sizes: xs(12px), sm(14px), base(16px), lg(18px)

### Spacing
- 4px grid system
- Component padding: 16px
- Section gaps: 24px
- Item spacing: 8px

### Borders
- Radius: 6px (default), 8px (cards)
- Width: 1px
- Color: hsl(var(--border))

## Interaction Patterns

### Hover States
- Buttons: Background color change
- Rows: Subtle highlight
- Cards: Lift effect
- Tabs: Underline animation

### Focus States
- Ring: 2px, hsl(var(--ring))
- Offset: 2px
- Outline: None (accessibility handled by ring)

### Loading States
- Buttons: Spinner + opacity
- Tables: Skeleton rows
- Content: Shimmer effect
- Overlays: Semi-transparent

### Error States
- Borders: Red color
- Text: Error message
- Background: Tinted red
- Icons: Warning symbol

## Accessibility Features

### Keyboard Navigation
- Tab order: Logical flow
- Shortcuts: Ctrl+Enter, Ctrl+T, Ctrl+W
- Focus: Visible indicators
- Skip links: Main content

### Screen Reader Support
- Labels: Descriptive text
- Roles: Semantic HTML
- States: Loading/error announcements
- Structure: Headings hierarchy

### Visual Accessibility
- Contrast: WCAG AA compliant
- Focus: High visibility
- Text: Respects browser zoom
- Color: Not only indicator

## Performance Considerations

### Component Optimization
- Memo: Expensive components
- Callback: Stable references
- Lazy: Heavy components
- Virtual: Large lists

### State Management
- Selective: Re-render prevention
- Debounce: Input validation
- Cache: Response data
- Cleanup: Event listeners

### Bundle Size
- Tree-shaking: Unused components
- Code-splitting: Route chunks
- Dynamic: Heavy features
- Compression: Build optimization
