# MedTransparency — Frontend

React 19 + TypeScript frontend for the MedTransparency healthcare pricing platform.

---

## Tech Stack

| | Version |
|---|---|
| React | 19 |
| TypeScript | 6 |
| Vite | 8 |
| Tailwind CSS | 4 |
| React Router | 6 |
| TanStack React Query | 5 |
| Zustand | 5 |
| React Hook Form | 7 |
| Zod | 4 |
| Framer Motion | 12 |
| Recharts | 3 |
| Axios | 1 |
| Lucide React | latest |

---

## Getting Started

```bash
npm install
npm run dev
```

Runs at `http://localhost:5173`. Requires the backend to be running at `http://localhost:8000`.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
src/
├── api/                  # Axios API client functions
│   ├── client.ts         # Axios instance with base URL and interceptors
│   ├── auth.ts
│   ├── search.ts
│   ├── procedures.ts
│   ├── regions.ts
│   ├── hospitals.ts
│   ├── submissions.ts
│   └── alerts.ts
│
├── components/
│   ├── ai/               # AI chat components
│   │   ├── ChatBubble.tsx        # Message bubble with markdown rendering
│   │   ├── ToolCallCard.tsx      # Animated tool execution card
│   │   └── StethoscopeAvatar.tsx
│   ├── charts/
│   │   ├── OutcomeScore.tsx      # Outcome score display
│   │   └── CostRangeBar.tsx      # Min/avg/max cost bar
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Layout.tsx
│   │   └── Footer.tsx
│   ├── search/
│   │   ├── FilterPanel.tsx       # Sidebar filter controls
│   │   └── ResultCard.tsx        # Hospital result card
│   └── ui/               # Shared primitives
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Spinner.tsx
│       ├── Badge.tsx
│       └── Card.tsx
│
├── pages/
│   ├── Landing.tsx
│   ├── Search.tsx
│   ├── ProcedureDetail.tsx
│   ├── RegionOverview.tsx
│   ├── Contribute.tsx
│   ├── AIConsultation.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Profile.tsx
│   ├── Settings.tsx
│   └── About.tsx
│
├── store/
│   ├── searchStore.ts    # Search filters + cross-component trigger
│   └── authStore.ts      # JWT token + user state
│
├── types/
│   └── index.ts          # Shared TypeScript interfaces
│
└── utils/
    └── formatCurrency.ts # USD formatting helpers
```

---

## State Management

**Zustand** is used for two global stores:

- `searchStore` — holds search filters and a `triggerSearch()` action that increments a counter used as a React Query key. This allows components like `ResultCard` to trigger a new search without prop-drilling.
- `authStore` — holds the JWT access token and decoded user info. Persisted to `localStorage`.

**TanStack React Query** handles all server state (fetching, caching, refetching). Cache is keyed by filters + triggerCount so searches are deduplicated automatically.

---

## AI Consultation

The agentic AI page connects to the backend `/api/v1/ai/agent` SSE endpoint. Events are parsed from the stream:

| Event | What happens in the UI |
|---|---|
| `tool_start` | Animated tool card appears with a spinner |
| `tool_result` | Card updates with result summary and checkmark |
| `answer` | Full formatted answer renders at once |
| `done` | Loading state cleared |

Markdown in AI responses is rendered inline (headings, bold, lists) via a custom block parser in `ChatBubble.tsx`.
