# File Structure - Execution Layer v0

Final repository structure after all 12 prompts are complete.

```
execution-layer-v0/
├── README.md
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── .gitignore
│
├── app/                              # Next.js App Router pages
│   ├── layout.tsx                    # Root layout with Nav
│   ├── page.tsx                      # Home/landing page
│   │
│   ├── projects/
│   │   ├── page.tsx                  # Projects list
│   │   └── [projectId]/
│   │       ├── page.tsx              # Project detail (endpoint list)
│   │       ├── run/
│   │       │   └── [endpointId]/
│   │       │       └── page.tsx      # Run Page (form + results)
│   │       ├── secrets/
│   │       │   └── page.tsx          # Secrets management (owner-only)
│   │       └── settings/
│   │           └── page.tsx          # Project settings (future)
│   │
│   ├── new/
│   │   └── page.tsx                  # Create project (upload OpenAPI)
│   │
│   ├── demo/
│   │   ├── page.tsx                  # Demo endpoint explorer
│   │   ├── openapi.json              # Fixture OpenAPI for demo
│   │   └── [endpointId]/
│   │       └── page.tsx              # Demo run page (no backend)
│   │
│   ├── s/
│   │   └── [shareId]/
│   │       └── page.tsx              # Public share page
│   │
│   └── api/                          # API routes
│       ├── projects/
│       │   ├── route.ts              # POST /api/projects (create)
│       │   └── [projectId]/
│       │       ├── route.ts          # GET /api/projects/:id
│       │       └── openapi/
│       │           └── route.ts      # GET /api/projects/:id/openapi
│       │
│       ├── versions/
│       │   └── route.ts              # POST /api/versions (create version)
│       │
│       ├── runs/
│       │   ├── route.ts              # POST /api/runs (execute endpoint)
│       │   └── [runId]/
│       │       └── route.ts          # GET /api/runs/:runId
│       │
│       ├── shares/
│       │   ├── route.ts              # POST /api/shares (create share link)
│       │   └── [shareId]/
│       │       └── route.ts          # GET /api/shares/:shareId
│       │
│       └── secrets/
│           └── route.ts              # GET/POST/DELETE /api/secrets
│
├── components/                       # React components
│   ├── Nav.tsx                       # Top navigation
│   ├── EndpointList.tsx              # Endpoint cards list
│   ├── FormRenderer.tsx              # OpenAPI → Form UI
│   ├── ResultViewer.tsx              # RunEnvelope → Result display
│   ├── ShareButton.tsx               # Share link creation button
│   └── ui/                           # Basic UI primitives (future)
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Card.tsx
│
├── lib/                              # Utilities and business logic
│   ├── contracts.ts                  # RunEnvelope type
│   ├── types.ts                      # Shared types (Project, Version, Run, Share)
│   │
│   ├── openapi/
│   │   ├── listEndpoints.ts          # Parse OpenAPI → EndpointMeta[]
│   │   ├── formModel.ts              # OpenAPI → FormModel
│   │   └── types.ts                  # OpenAPI-related types
│   │
│   ├── store/
│   │   ├── fsStore.ts                # File-based JSON storage
│   │   └── types.ts                  # Storage entity types
│   │
│   └── runner/
│       └── executeLocal.ts           # Wrapper for local Python runner
│
├── services/                         # Backend services
│   └── runner_local/
│       ├── run.py                    # Python CLI runner script
│       ├── requirements.txt          # Python dependencies
│       └── samples/
│           └── hello/
│               ├── main.py           # Sample FastAPI app
│               └── openapi.json      # Sample OpenAPI spec
│
├── data/                             # File-based storage (gitignored)
│   ├── projects.json                 # Array of projects
│   ├── versions.json                 # Array of versions
│   ├── shares.json                   # Array of shares
│   │
│   ├── openapi/
│   │   └── <versionId>.json          # OpenAPI specs per version
│   │
│   ├── runs/
│   │   └── <runId>.json              # Run records
│   │
│   ├── secrets/
│   │   └── <projectId>.json          # Secrets per project
│   │
│   ├── artifacts/
│   │   └── <runId>/
│   │       └── *.* (files)           # Artifacts per run
│   │
│   └── projects/
│       └── <projectId>/
│           └── code/                 # Uploaded project code (future)
│
├── public/                           # Static assets
│   └── favicon.ico
│
└── styles/                           # Global styles
    └── globals.css                   # Tailwind imports + custom styles
```

---

## File Ownership (Agent Mapping)

Based on the original 10-agent architecture, here's what each module owns:

### Frontend (UI/UX)
**Owned by: Agent 4 (UI Design) + Agent 5 (Run Page)**
```
components/
  Nav.tsx
  EndpointList.tsx
  FormRenderer.tsx
  ResultViewer.tsx
  ShareButton.tsx
  ui/

app/
  layout.tsx
  page.tsx
  projects/[projectId]/page.tsx
  projects/[projectId]/run/[endpointId]/page.tsx
  demo/
  s/[shareId]/page.tsx
```

### OpenAPI Processing
**Owned by: Agent 3 (FastAPI Loader)**
```
lib/openapi/
  listEndpoints.ts
  formModel.ts
  types.ts
```

### Data Layer
**Owned by: Agent 1 (Product Architect) + Agent 9 (Infra)**
```
lib/store/
  fsStore.ts
  types.ts

data/
  (all JSON files)
```

### API Layer
**Owned by: Agent 1 (Product Architect)**
```
app/api/
  projects/
  versions/
  runs/
  shares/
  secrets/
```

### Runner
**Owned by: Agent 2 (Runtime Kernel)**
```
services/runner_local/
  run.py
  requirements.txt
  samples/

lib/runner/
  executeLocal.ts
```

### Contracts
**Owned by: Agent 1 (Product Architect)**
```
lib/contracts.ts
lib/types.ts
```

### Sharing & Secrets
**Owned by: Agent 6 (Secrets) + Agent 7 (Sharing)**
```
app/api/shares/
app/api/secrets/
app/s/[shareId]/page.tsx
components/ShareButton.tsx
app/projects/[projectId]/secrets/page.tsx
```

---

## Data File Formats

### `/data/projects.json`
```json
[
  {
    "id": "proj_abc123",
    "name": "My API",
    "created_at": "2024-01-04T12:00:00Z",
    "latest_version_id": "ver_xyz789"
  }
]
```

### `/data/versions.json`
```json
[
  {
    "id": "ver_xyz789",
    "project_id": "proj_abc123",
    "created_at": "2024-01-04T12:05:00Z"
  }
]
```

### `/data/openapi/<versionId>.json`
```json
{
  "openapi": "3.0.0",
  "info": { "title": "My API", "version": "1.0.0" },
  "paths": {
    "/hello": {
      "get": {
        "summary": "Say hello",
        "parameters": [...]
      }
    }
  }
}
```

### `/data/runs/<runId>.json`
```json
{
  "id": "run_123",
  "version_id": "ver_xyz789",
  "endpoint_id": "GET /hello",
  "inputs": {
    "query": { "name": "Alice" },
    "body": null
  },
  "result": {
    "run_id": "run_123",
    "status": "success",
    "duration_ms": 234,
    "http_status": 200,
    "content_type": "application/json",
    "json": { "message": "Hello, Alice!" },
    "artifacts": [],
    "warnings": [],
    "redactions_applied": false
  },
  "created_at": "2024-01-04T12:10:00Z",
  "created_by": "owner"
}
```

### `/data/shares.json`
```json
[
  {
    "id": "share_abc",
    "version_id": "ver_xyz789",
    "endpoint_id": "GET /hello",
    "enabled": true,
    "created_at": "2024-01-04T12:15:00Z"
  }
]
```

### `/data/secrets/<projectId>.json`
```json
{
  "API_KEY": "sk-1234567890abcdef",
  "DATABASE_URL": "postgresql://localhost/db"
}
```

---

## .gitignore

```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# data directory (file-based storage)
/data

# Python
__pycache__/
*.py[cod]
*$py.class
venv/
.venv/
*.egg-info/

# IDE
.vscode/
.idea/
*.swp
*.swo
```

---

## Key File Purposes

| File | Purpose | Key Exports |
|------|---------|-------------|
| `lib/contracts.ts` | RunEnvelope type definition | `RunEnvelope`, `ArtifactRef` |
| `lib/types.ts` | Domain types | `Project`, `Version`, `Run`, `Share`, `EndpointMeta`, `FormModel`, `FormField` |
| `lib/openapi/listEndpoints.ts` | Parse OpenAPI paths | `listEndpoints(openapi): EndpointMeta[]` |
| `lib/openapi/formModel.ts` | Generate forms from schema | `generateFormModel(openapi, endpointId): FormModel` |
| `lib/store/fsStore.ts` | File-based CRUD operations | `createProject`, `getProject`, `createRun`, etc. |
| `lib/runner/executeLocal.ts` | Execute Python runner | `executeLocal(params): Promise<RunEnvelope>` |
| `services/runner_local/run.py` | Python runner CLI | Outputs RunEnvelope JSON to stdout |
| `components/FormRenderer.tsx` | Render dynamic forms | `<FormRenderer formModel={...} onSubmit={...} />` |
| `components/ResultViewer.tsx` | Display run results | `<ResultViewer envelope={...} />` |
| `components/EndpointList.tsx` | List endpoints | `<EndpointList endpoints={...} projectId={...} />` |

---

## Dependencies

### package.json (minimal)
```json
{
  "name": "execution-layer-v0",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

### services/runner_local/requirements.txt
```
fastapi==0.104.1
httpx==0.25.2
pydantic==2.5.0
```

---

## Migration to Production

When upgrading from file storage to database:

**Replace:**
- `/data/*.json` → PostgreSQL tables
- `fsStore.ts` → `dbStore.ts` (same interface)

**Keep unchanged:**
- All UI components
- All API route handlers (just swap fsStore → dbStore)
- Runner interface
- Contracts (RunEnvelope, OpenAPI)

**File structure stays the same**, just swap one module.
