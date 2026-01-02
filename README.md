# Postman Clone - HTTP Client for Personal Use

A minimal Postman-like web application built for personal use with a clean, multi-column interface for testing HTTP requests.

## 🚀 Features

- **HTTP Request Builder**: URL input, method selector, headers, body editor
- **Response Display**: Formatted JSON, headers, cookies, status codes, timing
- **Tab Management**: Multiple request tabs with persistence
- **Collections**: Organize requests in collections
- **Dark Theme**: Minimal UI with dark/light theme support

## 🛠 Tech Stack

- **Framework**: TanStack Start
- **Async State**: @tanstack/react-query
- **UI Components**: Shadcn UI with @base-ui/react primitives
- **Validation**: Zod
- **Runtime**: Bun
- **Styling**: TailwindCSS
- **State Management**: Zustand + TanStack Query

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Shadcn UI components
│   ├── Sidebar/         # Left navigation
│   ├── RequestEditor/   # Request builder
│   ├── ResponseDisplay/ # Response viewer
│   └── shared/          # Shared utilities
├── hooks/               # Custom hooks
├── stores/              # Zustand stores
├── types/               # TypeScript types
├── utils/               # Utility functions
└── routes/              # File-based routing
```

## 🏃‍♂️ Getting Started

### Prerequisites
- Bun 1.0+

### Installation
```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

### Build
```bash
# Build for production
bun run build

# Preview production build
bun run preview
```

## 📚 Documentation

Detailed documentation is available in the `docs/` folder:

- [`docs/plan.md`](./docs/plan.md) - Project architecture and specifications
- [`docs/tasks.md`](./docs/tasks.md) - Development task breakdown
- [`docs/components-mapping.md`](./docs/components-mapping.md) - UI components specification
- [`docs/development-guide.md`](./docs/development-guide.md) - Setup and implementation guide
- [`docs/state-management.md`](./docs/state-management.md) - State architecture

## 🎯 Development Phases

1. **Phase 1**: Core layout and basic HTTP requests
2. **Phase 2**: Request building features (headers, body, params)
3. **Phase 3**: Response display features
4. **Phase 4**: Organization and persistence
5. **Phase 5**: Polish and UX improvements

## 📄 License

MIT License - see LICENSE file for details.
