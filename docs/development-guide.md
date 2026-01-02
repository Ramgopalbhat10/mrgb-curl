# Development Guide

## Getting Started

### Prerequisites
- Bun 1.0+ 
- Git
- VS Code (recommended)

### Project Setup
```bash
# Clone the repository
git clone <repository-url>
cd mrgb-curl

# Install dependencies with Bun
bun install

# Start development server
bun run dev
```

### Environment Setup
```bash
# Create environment file
cp .env.example .env.local

# Add any required environment variables
# (For MVP, minimal setup needed)
```

## Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Commit Convention
```
feat: add new feature
fix: fix bug
refactor: code refactoring
style: formatting changes
docs: documentation
test: add tests
chore: build process or dependency updates
```

### Code Style
- Use TypeScript strict mode
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful variable names
- Add JSDoc comments for complex functions

## File Structure

```
src/
├── components/           # React components
│   ├── ui/              # Shadcn UI components (auto-generated with @base-ui/react primitives)
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

## Dependency Management

### Required Dependencies
```bash
# Core framework
bun add @tanstack/start @tanstack/react-query

# UI components and styling
bun add @shadcn/ui tailwindcss class-variance-authority clsx tailwind-merge

# Validation and types
bun add zod

# Icons and utilities
bun add lucide-react @base-ui/react

# Note: BaseUI components are imported as subpaths:
# import { Popover } from '@base-ui/react/popover';
# import { Dialog } from '@base-ui/react/dialog';
# import { Select } from '@base-ui/react/select';
# etc.

# State management
bun add zustand

# Development dependencies
bun add -d @types/node eslint prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

### Shadcn UI Setup
```bash
# Initialize Shadcn UI
bunx shadcn-ui@latest init

# Add required components
bunx shadcn-ui@latest add button input select tabs card badge table textarea scroll-area dropdown-menu separator sidebar sheet dialog popover tooltip switch checkbox label skeleton spinner
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "bun run @tanstack/start dev",
    "build": "bun run @tanstack/start build",
    "preview": "bun run @tanstack/start preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write ."
  }
}
```

### Component Template
```typescript
// components/Example/Example.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { z } from 'zod';

// Zod schema for props
const ExamplePropsSchema = z.object({
  className: z.string().optional(),
  children: z.any(),
});

type ExampleProps = z.infer<typeof ExamplePropsSchema>;

export const Example: React.FC<ExampleProps> = ({ 
  className, 
  children 
}) => {
  return (
    <div className={cn('example-component', className)}>
      {children}
    </div>
  );
};
```

### Hook Template
```typescript
// hooks/useExample.ts
import { useState, useCallback } from 'react';
import { useAppStore } from '@/stores/clientStore';
import { z } from 'zod';

export const useExample = () => {
  const [state, setState] = useState();
  const { someStoreValue } = useAppStore();

  const doSomething = useCallback(() => {
    // Implementation with Zod validation
    const schema = z.object({ /* ... */ });
    const result = schema.safeParse(data);
    if (!result.success) {
      // Handle validation error
      return;
    }
    // Continue with validated data
  }, [someStoreValue]);

  return {
    state,
    doSomething,
  };
};
```

## Validation Patterns

### Zod Schema Examples
```typescript
// URL validation
const UrlSchema = z.string().url().min(1).max(2048);

// HTTP method validation
const HttpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);

// Headers validation
const HeadersSchema = z.record(z.string().min(1), z.string().max(8192));

// JSON body validation
const JsonBodySchema = z.string().refine(
  (json) => {
    try {
      JSON.parse(json);
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Invalid JSON format' }
);
```

### React Hook Integration
```typescript
// useValidation hook
import { useState, useCallback } from 'react';
import { z } from 'zod';

export const useValidation = <T extends z.ZodSchema>(
  schema: T,
  initialValues: z.infer<T>
) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((data: z.infer<T>) => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const errorMap = result.error.issues.reduce((acc, issue) => {
        if (issue.path.length > 0) {
          acc[issue.path.join('.')] = issue.message;
        }
        return acc;
      }, {} as Record<string, string>);
      setErrors(errorMap);
      return false;
    }
    setErrors({});
    return true;
  }, [schema]);

  return { values, errors, validate, setValues };
};
```

## State Management Patterns

### Reading State
```typescript
// Direct access (simple cases)
const requests = useAppStore((state) => state.requests);

// Using selectors (complex cases)
const activeRequest = useActiveRequest();

// Multiple values (optimize with shallow compare)
const { isLoading, error } = useAppStore(
  (state) => ({ isLoading: state.isLoading, error: state.error }),
  shallow
);
```

### Updating State
```typescript
// Direct action
const { createRequest } = useAppStore();
const newId = createRequest({ name: 'New Request' });

// Custom hook
const { sendRequest } = useRequestActions();
await sendRequest(requestId);
```

## HTTP Request Implementation

### HTTP Client
```typescript
// utils/http.ts
export interface HttpRequestOptions {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
}

export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
  size: number;
}

export const executeHttpRequest = async (
  options: HttpRequestOptions
): Promise<HttpResponse> => {
  const startTime = performance.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);

    const response = await fetch(options.url, {
      method: options.method,
      headers: options.headers,
      body: options.body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const endTime = performance.now();
    const time = Math.round(endTime - startTime);

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const body = await response.text();
    const size = new Blob([body]).size;

    return {
      status: response.status,
      statusText: response.statusText,
      headers,
      body,
      time,
      size,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};
```

## Styling Guidelines

### TailwindCSS Usage
```typescript
// Use utility classes for styling
<div className="flex flex-col gap-4 p-4 border rounded-lg">

// Use cn() for conditional classes
import { cn } from '@/lib/utils';

const buttonClass = cn(
  'px-4 py-2 rounded',
  variant === 'primary' && 'bg-blue-500 text-white',
  variant === 'secondary' && 'bg-gray-200',
  disabled && 'opacity-50 cursor-not-allowed'
);
```

### Component Styling
- Use semantic HTML elements
- Apply consistent spacing (4px grid)
- Use design tokens from Tailwind config
- Ensure responsive design
- Test with dark/light themes

## Testing Strategy

### Unit Testing
```typescript
// __tests__/components/Example.test.tsx
import { render, screen } from '@testing-library/react';
import { Example } from '@/components/Example';

describe('Example', () => {
  it('renders correctly', () => {
    render(<Example>Hello World</Example>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
```

### Integration Testing
```typescript
// __tests__/hooks/useRequest.test.ts
import { renderHook, act } from '@testing-library/react';
import { useRequestActions } from '@/hooks/useRequestActions';

describe('useRequestActions', () => {
  it('creates a new request', () => {
    const { result } = renderHook(() => useRequestActions());
    
    act(() => {
      result.current.createRequest({ name: 'Test Request' });
    });
    
    // Assertions
  });
});
```

## Performance Optimization

### React Performance
```typescript
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Complex rendering */}</div>;
});

// Use useMemo for expensive calculations
const processedData = useMemo(() => {
  return data.map(item => expensiveCalculation(item));
}, [data]);

// Use useCallback for stable function references
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);
```

### State Performance
```typescript
// Use selectors to prevent unnecessary re-renders
const activeRequest = useAppStore((state) => 
  state.requests[state.activeRequestId]
);

// Batch state updates
const updateMultipleFields = (id: string, updates: Partial<Request>) => {
  useAppStore.setState((state) => ({
    requests: {
      ...state.requests,
      [id]: { ...state.requests[id], ...updates }
    }
  }));
};
```

## Debugging

### React DevTools
- Install React DevTools browser extension
- Use Profiler to identify performance issues
- Inspect component props and state

### Zustand DevTools
```typescript
// Store includes devtools middleware
export const useAppStore = create<AppState>()(
  devtools(
    persist(/* ... */),
    { name: 'app-store' }
  )
);
```

### Console Debugging
```typescript
// Add debug logging
console.log('Request sent:', request);
console.log('Response received:', response);

// Use debug conditions
if (process.env.NODE_ENV === 'development') {
  console.debug('Debug info:', data);
}
```

## Deployment

### Build Process
```bash
# Build for production
bun run build

# Preview production build
bun run preview

# Type checking
bun run type-check

# Linting
bun run lint

# Format code
bun run format
```

### Environment Variables
```bash
# .env.production
VITE_APP_NAME=Postman Clone
VITE_API_BASE_URL=https://api.example.com
VITE_ENABLE_ANALYTICS=false
```

### Static Hosting
- Build outputs to `dist/` folder
- Can be deployed to Vercel, Netlify, or GitHub Pages
- No server-side rendering required for MVP

## Common Issues & Solutions

### CORS Issues
- Use browser CORS extension for development
- Implement proxy server for production if needed
- Handle CORS errors gracefully in UI

### Large Responses
- Implement response size limits
- Use virtualization for large JSON
- Add pagination for response display

### Storage Limits
- Monitor localStorage quota
- Implement storage cleanup
- Use IndexedDB for large data

### Memory Leaks
- Clean up event listeners
- Cancel HTTP requests on unmount
- Use WeakMap for temporary data

## Best Practices

### Code Organization
- Group related files together
- Use barrel exports for clean imports
- Keep components focused and small
- Separate business logic from UI

### Error Handling
- Use try-catch for async operations
- Provide user-friendly error messages
- Implement error boundaries
- Log errors for debugging

### Accessibility
- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation
- Test with screen readers

### Security
- Validate user inputs
- Sanitize response data
- Handle sensitive data carefully
- Implement CSP headers

## Resources

### Documentation
- [TanStack Start Docs](https://tanstack.com/start/latest)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Shadcn UI Docs](https://ui.shadcn.com/)
- [BaseUI Docs](https://base-ui.com/react)
- [Zod Docs](https://zod.dev/)
- [Bun Docs](https://bun.sh/docs)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

### Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [TailwindCSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [TypeScript Importer](https://marketplace.visualstudio.com/items?itemName=pmneo.tsimporter)
- [Bun VSCode Extension](https://marketplace.visualstudio.com/items?itemName=oven.bun)

### Inspiration
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [HTTPie](https://httpie.io/)
- [Thunder Client](https://www.thunderclient.com/)
