# Execution Layer v0 - Build Prompts

Execute these prompts **in order** using Claude Code. Each prompt is self-contained and creates one working vertical slice.

## Ground Rules (Copy/paste before EVERY prompt)

```
IMPORTANT CONSTRAINTS:
- Only create/edit the files listed in this prompt
- No refactors, no renames, no new frameworks
- If a new helper is needed, put it in the file already being edited
- Keep it minimal and demo-first
- Use TypeScript strict mode
- Use Next.js App Router
```

---

## Prompt 1 — Repo Skeleton + UI Shell

**Goal:** Basic app with navigation and empty Projects page.

```
Create a Next.js 15 (App Router) TypeScript app with a minimal UI shell.

ONLY create/edit these files:
- package.json (if creating new)
- tsconfig.json (if creating new)
- app/layout.tsx
- app/page.tsx
- app/projects/page.tsx
- components/Nav.tsx
- tailwind.config.js (basic setup)

Requirements:
- Top header with product name "RunIt" and nav links: Home, Projects, New Project
- Use minimal Tailwind classes (keep it clean and calm)
- Home page: hero section with "Run FastAPI apps instantly. Shareable. No setup."
- Projects page: empty state "No projects yet" with "Create your first project" button linking to /new
- Design vibe: Linear × Cursor (calm, minimal, one primary CTA per page)

Acceptance:
- npm run dev works
- / loads with hero
- /projects shows empty state
- Navigation works
- TypeScript compiles with no errors
```

---

## Prompt 2 — Shared Types & Contracts

**Goal:** Define the two sacred contracts (OpenAPI in, RunEnvelope out).

```
Add shared TypeScript types for the core contracts.

ONLY create/edit:
- lib/contracts.ts
- lib/types.ts

Requirements:
- RunEnvelope interface with:
  - run_id: string
  - status: "success" | "error" | "timeout"
  - duration_ms: number
  - http_status: number
  - content_type: string
  - json?: any
  - text_preview?: string (first 10KB)
  - artifacts: ArtifactRef[]
  - warnings: string[]
  - redactions_applied: boolean
  - error_class?: string
  - error_message?: string
  - suggested_fix?: string

- ArtifactRef interface with:
  - name: string
  - size: number
  - mime: string
  - url: string

- EndpointMeta interface with:
  - id: string (format: "POST /path")
  - method: string
  - path: string
  - summary?: string
  - description?: string

- FormField interface with:
  - name: string
  - label: string
  - kind: "string" | "number" | "boolean" | "enum" | "json"
  - required: boolean
  - defaultValue?: any
  - options?: string[] (for enums)

- FormModel interface with:
  - endpoint_id: string
  - fields: FormField[]

- Keep dependency-free (no Zod yet)
- Export all types

Acceptance:
- TypeScript compiles
- No external dependencies added
- All types are exported
```

---

## Prompt 3 — OpenAPI Endpoint Listing

**Goal:** Parse OpenAPI JSON and extract endpoint list.

```
Implement OpenAPI endpoint listing utility.

ONLY create/edit:
- lib/openapi/listEndpoints.ts
- lib/openapi/types.ts

Requirements:
- Function: listEndpoints(openapi: any): EndpointMeta[]
- Support OpenAPI 3.x structure (paths[path][method])
- Generate endpoint id as: `${method.toUpperCase()} ${path}`
- Extract method, path, summary, description
- Skip non-HTTP method keys (parameters, servers, etc.)
- Handle missing/optional fields gracefully

Test with inline example:
```typescript
// Example OpenAPI to test with:
const exampleOpenAPI = {
  openapi: "3.0.0",
  paths: {
    "/hello": {
      get: {
        summary: "Say hello",
        description: "Returns a greeting"
      }
    },
    "/users/{id}": {
      get: {
        summary: "Get user by ID"
      },
      delete: {
        summary: "Delete user"
      }
    }
  }
};
// Should return 3 endpoints
```

Acceptance:
- Function compiles
- Works with example OpenAPI
- Returns correct EndpointMeta[]
- Handles missing fields without crashing
```

---

## Prompt 4 — Form Model Generation

**Goal:** Convert OpenAPI request schema to form fields.

```
Implement OpenAPI → FormModel generator for request parameters and body.

ONLY create/edit:
- lib/openapi/formModel.ts

Requirements:
- Function: generateFormModel(openapi: any, endpointId: string): FormModel
- Parse endpoint from paths using endpointId (e.g., "POST /users")
- Extract query parameters from parameters array
- Extract request body schema from requestBody.content["application/json"].schema
- Map JSON Schema types to FormField kinds:
  - string → "string"
  - number/integer → "number"
  - boolean → "boolean"
  - enum → "enum" (with options array)
  - object/array with depth > 2 → "json" (single field for entire body)
  - oneOf/anyOf/allOf → "json" (fallback)
- Set required based on schema.required array
- Use schema.default for defaultValue
- Use schema.description or title for label

Complexity fallback:
- If requestBody schema has oneOf/anyOf/allOf → return single field kind="json" named "body"
- If nested depth > 2 → return single field kind="json" named "body"

Test with inline examples:
```typescript
// Example 1: Simple query params
const openapi1 = {
  paths: {
    "/search": {
      get: {
        parameters: [
          {
            name: "query",
            in: "query",
            required: true,
            schema: { type: "string" }
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "number", default: 10 }
          }
        ]
      }
    }
  }
};

// Example 2: Request body with primitives
const openapi2 = {
  paths: {
    "/users": {
      post: {
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string" },
                  age: { type: "number" },
                  active: { type: "boolean", default: true }
                }
              }
            }
          }
        }
      }
    }
  }
};

// Example 3: Complex schema → JSON fallback
const openapi3 = {
  paths: {
    "/complex": {
      post: {
        requestBody: {
          content: {
            "application/json": {
              schema: {
                oneOf: [
                  { type: "object", properties: { a: { type: "string" } } },
                  { type: "object", properties: { b: { type: "number" } } }
                ]
              }
            }
          }
        }
      }
    }
  }
};
// Should return single field kind="json"
```

Acceptance:
- Handles all 3 examples correctly
- Generates proper FormField arrays
- Fallback to JSON editor works
- No crashes on missing fields
```

---

## Prompt 5 — Demo Mode UI (Fixture-Based)

**Goal:** Endpoint explorer + Run Page using a local fixture (no backend yet).

```
Build demo endpoint explorer and Run Page using a local OpenAPI fixture.

ONLY create/edit:
- app/demo/page.tsx (endpoint list)
- app/demo/[endpointId]/page.tsx (run page)
- app/demo/openapi.json (fixture file)
- components/EndpointList.tsx
- components/FormRenderer.tsx
- components/ResultViewer.tsx

Requirements:

openapi.json fixture:
- Include 2-3 endpoints with different param types
- At least one GET with query params
- At least one POST with request body

EndpointList component:
- Display endpoints with method badge (colored), path, summary
- Link to /demo/[encodedEndpointId] (URL-encode the endpoint id)
- Clean card-based layout

FormRenderer component:
- Render fields based on FormField[]
- Support kinds: string (input), number (input type=number), boolean (checkbox), enum (select), json (textarea)
- Show required indicator
- One "Run" button at bottom
- On submit: show mocked result below form

ResultViewer component:
- Display RunEnvelope results
- Success: green status pill, show JSON in collapsible pretty viewer
- Error: red status pill, show error_message
- Show duration_ms
- If artifacts: show download links (can be #)

Demo page behavior:
- List endpoints from fixture
- Click endpoint → navigate to run page
- Run page shows form
- Submit shows mocked RunEnvelope below (status="success", http_status=200, json={demo: "result"})

Design:
- Calm, Linear-style UI
- One primary CTA per page
- Method badges: GET (blue), POST (green), PUT (yellow), DELETE (red)

Acceptance:
- /demo shows endpoint list
- Clicking endpoint loads run page
- Form renders all field types
- Submit shows mocked result
- No backend calls (pure client-side demo)
```

---

## Prompt 6 — File-Based Storage Helpers

**Goal:** Simple JSON file persistence without database.

```
Implement file-based storage helpers for projects, versions, runs, shares.

ONLY create/edit:
- lib/store/fsStore.ts
- lib/store/types.ts

Requirements:

Data structures:
- Project: { id, name, created_at, latest_version_id? }
- Version: { id, project_id, openapi, created_at }
- Run: { id, version_id, endpoint_id, inputs, result, created_at, created_by }
- Share: { id, version_id, endpoint_id, enabled, created_at }

File locations:
- /data/projects.json (array of projects)
- /data/versions.json (array of versions)
- /data/openapi/<versionId>.json (individual OpenAPI specs)
- /data/runs/<runId>.json (individual run records)
- /data/shares.json (array of shares)

Functions to implement:
- createProject(name: string): Promise<Project>
- getProject(projectId: string): Promise<Project | null>
- listProjects(): Promise<Project[]>
- createVersion(projectId: string, openapi: any): Promise<Version>
- getVersion(versionId: string): Promise<Version | null>
- getVersionOpenAPI(versionId: string): Promise<any>
- createRun(versionId: string, endpointId: string, inputs: any, result: RunEnvelope, createdBy: string): Promise<Run>
- getRun(runId: string): Promise<Run | null>
- listRunsForVersion(versionId: string): Promise<Run[]>
- createShare(versionId: string, endpointId: string): Promise<Share>
- getShare(shareId: string): Promise<Share | null>

Implementation:
- Use Node.js fs/promises (readFile, writeFile, mkdir)
- Create /data directories if they don't exist
- Use JSON.parse/stringify
- Generate IDs with crypto.randomUUID()
- Handle file not found gracefully (return null or empty array)
- Make it synchronous-style async (no complex locking needed yet)

Error handling:
- Create directories on first write
- Return null if file doesn't exist
- Throw on JSON parse errors

Acceptance:
- Can create and read projects
- Can store OpenAPI separately
- Can create runs and shares
- TypeScript compiles
- /data directory auto-created
```

---

## Prompt 7 — API: Import OpenAPI

**Goal:** Upload OpenAPI JSON to create project + version.

```
Implement API routes to create projects and import OpenAPI.

ONLY create/edit:
- app/api/projects/route.ts (POST)
- app/api/projects/[projectId]/route.ts (GET)
- app/api/versions/route.ts (POST)
- app/new/page.tsx

Requirements:

POST /api/projects:
- Body: { name: string }
- Creates project using fsStore.createProject
- Returns: { project: Project }
- Status: 201 on success

GET /api/projects/[projectId]:
- Returns project + latest version info
- Returns: { project: Project, latestVersion?: Version }
- Status: 404 if not found

POST /api/versions:
- Body: { projectId: string, openapi: object }
- Validates OpenAPI has "openapi" field and "paths" object
- Creates version using fsStore.createVersion
- Updates project.latest_version_id
- Returns: { version: Version }
- Status: 400 if validation fails, 201 on success

/new page:
- Form with:
  - Project name input (required)
  - OpenAPI JSON textarea (required, placeholder with example)
  - "Create Project" button
- On submit:
  1. POST /api/projects with name
  2. POST /api/versions with projectId + parsed OpenAPI
  3. Redirect to /projects/[projectId]
- Show validation errors inline
- Parse JSON client-side before submit (show JSON parse error if invalid)

Design:
- Clean form, centered, max-width 800px
- Clear labels and helpful placeholders
- One primary CTA: "Create Project"
- Show loading state during submit

Acceptance:
- Can paste valid OpenAPI JSON
- Creates project + version
- Redirects to project page
- Shows validation errors
- Handles invalid JSON gracefully
```

---

## Prompt 8 — Project Page (Endpoint List)

**Goal:** Display project with endpoints from stored OpenAPI.

```
Build project page that loads stored OpenAPI and shows endpoint list.

ONLY create/edit:
- app/projects/[projectId]/page.tsx
- app/api/projects/[projectId]/openapi/route.ts (GET)

Requirements:

GET /api/projects/[projectId]/openapi:
- Load project + latest version
- Load OpenAPI using fsStore.getVersionOpenAPI
- Parse endpoints using listEndpoints utility
- Returns: { project: Project, version: Version, endpoints: EndpointMeta[] }
- Status: 404 if project/version not found

/projects/[projectId] page:
- Fetch from /api/projects/[projectId]/openapi
- Display:
  - Project name (h1)
  - Version ID (small, gray text)
  - Endpoint list using EndpointList component
  - Each endpoint links to /projects/[projectId]/run/[encodedEndpointId]
- If no version: show "No version yet. Import OpenAPI to get started."
- Loading state while fetching
- Error state if fetch fails

Design:
- Header with project name and breadcrumb (Home > Projects > [Name])
- Endpoint list: same style as demo mode
- "Share" button per endpoint (placeholder for now, shows alert)

Acceptance:
- After creating project on /new, /projects/[id] shows endpoints
- Clicking endpoint navigates to run page
- Shows proper loading and error states
- TypeScript compiles, no errors
```

---

## Prompt 9 — API: Run Endpoint (Mock Runner)

**Goal:** Execute endpoint with mock runner, return RunEnvelope.

```
Implement run endpoint API with mocked runner execution.

ONLY create/edit:
- app/api/runs/route.ts (POST)
- app/api/runs/[runId]/route.ts (GET)
- app/projects/[projectId]/run/[endpointId]/page.tsx

Requirements:

POST /api/runs:
- Body: { versionId: string, endpointId: string, inputs: any }
- Load OpenAPI for version
- Generate form model to validate inputs (basic check)
- Create mocked RunEnvelope:
  - run_id: generated UUID
  - status: "success"
  - duration_ms: random 100-3000
  - http_status: 200
  - content_type: "application/json"
  - json: { mocked: true, inputs: <echo inputs>, timestamp: <now> }
  - artifacts: []
  - warnings: []
  - redactions_applied: false
- Store run using fsStore.createRun (createdBy: "owner" for now)
- Returns: { run: Run }
- Status: 201 on success, 400 on validation errors

GET /api/runs/[runId]:
- Load run using fsStore.getRun
- Returns: { run: Run }
- Status: 404 if not found

/projects/[projectId]/run/[endpointId] page:
- Fetch project + OpenAPI + endpoints
- Find endpoint by endpointId (URL-decoded)
- Generate form model using generateFormModel
- Render form using FormRenderer
- On submit:
  - Collect form inputs
  - POST /api/runs with { versionId, endpointId, inputs }
  - Show result using ResultViewer below form
- Show run history (list of past runs for this endpoint)
- Each run in history: timestamp, status, duration, click to view result

Design:
- Form at top
- After first run: result appears below form
- Run history sidebar or below result
- Clear separation between form and results

Acceptance:
- Can submit form from real project page
- Receives mocked RunEnvelope
- Result displays properly
- Run persists to /data/runs
- Can view run history
- Multiple runs accumulate
```

---

## Prompt 10 — Sharing

**Goal:** Create share links for public run pages.

```
Add sharing functionality for endpoint Run Pages.

ONLY create/edit:
- app/api/shares/route.ts (POST, GET)
- app/s/[shareId]/page.tsx (public share page)
- components/ShareButton.tsx

Requirements:

POST /api/shares:
- Body: { versionId: string, endpointId: string }
- Create share using fsStore.createShare
- Returns: { share: Share, url: string }
- URL format: /s/[shareId]
- Status: 201 on success

GET /api/shares/[shareId] (use route handler):
- Load share using fsStore.getShare
- Returns: { share: Share }
- Status: 404 if not found or disabled

ShareButton component:
- Props: versionId, endpointId
- Shows "Share" button
- On click:
  - POST /api/shares
  - Copy share URL to clipboard
  - Show success message "Share link copied!"
- Design: secondary button style

/s/[shareId] page:
- Fetch share info
- Load version + OpenAPI
- Find endpoint
- Generate form model
- Render same Run Page UI (FormRenderer + ResultViewer)
- Key differences from owner page:
  - No "Share" button (already shared)
  - No run history sidebar
  - No project navigation
  - Header: "Shared by [Project Name] - [Endpoint]"
- Runs from share page also call POST /api/runs (createdBy: "anonymous")
- Show message: "This endpoint was shared with you. Running it creates a new run."

Security:
- Share pages cannot access /projects/* routes
- Shares have { enabled: true/false } field (support disabling later)
- Check share.enabled before rendering

Design:
- Same clean form UI
- Clear "Shared Endpoint" indicator
- No owner-only features visible

Acceptance:
- Click "Share" on run page copies URL
- Open /s/[shareId] in incognito
- Form renders and works
- Submit creates new run
- Run does not appear in owner's history (separate createdBy)
- TypeScript compiles
```

---

## Prompt 11 — Secrets (Owner-Only)

**Goal:** Store and inject secrets into runs (owner-only UI).

```
Add owner-only secrets management and injection into runs.

ONLY create/edit:
- app/api/secrets/route.ts (GET, POST, DELETE)
- app/projects/[projectId]/secrets/page.tsx
- lib/store/fsStore.ts (add secrets functions)

Requirements:

Add to fsStore.ts:
- setSecret(projectId: string, key: string, value: string): Promise<void>
- getSecrets(projectId: string): Promise<Record<string, string>>
- deleteSecret(projectId: string, key: string): Promise<void>
- Storage: /data/secrets/<projectId>.json as { key: value } object
- Note: Not encrypted yet, just stored as JSON (v0 simplification)

GET /api/secrets?projectId=:projectId:
- Load secrets using fsStore.getSecrets
- Return keys only, values masked: { secrets: Array<{ key: string, masked: string }> }
- masked format: first 4 chars + "****" (e.g., "sk-1****")
- Status: 200

POST /api/secrets:
- Body: { projectId: string, key: string, value: string }
- Validate key doesn't contain spaces or special chars (alphanumeric + underscore only)
- Save using fsStore.setSecret
- Returns: { success: true }
- Status: 201

DELETE /api/secrets:
- Body: { projectId: string, key: string }
- Delete using fsStore.deleteSecret
- Returns: { success: true }
- Status: 200

/projects/[projectId]/secrets page:
- List secrets (keys masked)
- Form to add new secret:
  - Key input (uppercase, underscore allowed)
  - Value input (password type, not masked while typing)
  - "Add Secret" button
- Each secret row:
  - Key name
  - Masked value (*****)
  - "Delete" button (confirm before delete)
- Show message: "Secrets are injected as environment variables and never shared."

Update app/api/runs/route.ts:
- Load secrets for version's project
- Include in mocked run metadata (don't return in response)
- Add comment: "// In real runner: inject as env vars"
- Ensure secrets never appear in run.result or response

Design:
- Tab navigation on project page: Endpoints | Secrets | Settings
- Secrets table: clean, minimal
- Add form: inline above table
- Delete: confirm dialog
- Warning box: "Secrets are owner-only and never shared via links"

Security checks:
- Share pages CANNOT access /api/secrets
- Secrets never in POST /api/runs response
- Mask values in GET /api/secrets

Acceptance:
- Can add secrets on secrets page
- Values are masked after save
- Can delete secrets
- Secrets loaded when creating runs (check server logs)
- Share pages cannot access secrets
- TypeScript compiles
```

---

## Prompt 12 — Real Runner (Local Python Harness)

**Goal:** Replace mock runner with real local Python subprocess execution.

```
Implement local Python runner that executes FastAPI apps and returns RunEnvelope.

ONLY create/edit:
- services/runner_local/run.py (new Python script)
- services/runner_local/requirements.txt
- app/api/runs/route.ts (update to call real runner)
- lib/runner/executeLocal.ts (wrapper for subprocess)

Requirements:

run.py script:
- CLI args:
  - --project-dir <path> (extracted FastAPI project directory)
  - --entrypoint <module:app> (e.g., "main:app")
  - --endpoint-id <endpointId> (e.g., "POST /users")
  - --inputs <json> (query params + request body)
  - --env <json> (secrets as key-value object)
  - --artifacts-dir <path> (where to collect artifacts)
- Execution:
  1. Parse endpoint-id to extract method and path
  2. Import FastAPI app from entrypoint
  3. Create httpx.AsyncClient with ASGITransport(app=app)
  4. Make request: client.request(method, path, params=..., json=...)
  5. Collect artifacts from artifacts-dir (if any files exist)
  6. Build RunEnvelope JSON
  7. Print JSON to stdout
- Error handling:
  - If import fails: return status="error", error_class="IMPORT_ERROR"
  - If request fails: return status="error", error_class="RUNTIME_ERROR"
  - Timeout after 60s: return status="timeout"
- Dependencies: fastapi, httpx, pydantic

executeLocal.ts:
- Function: executeLocal(params): Promise<RunEnvelope>
- Params: { projectDir, entrypoint, endpointId, inputs, env, artifactsDir }
- Implementation:
  1. Spawn child_process with run.py
  2. Pass args
  3. Capture stdout
  4. Parse JSON output as RunEnvelope
  5. Handle errors (non-zero exit code)
  6. Timeout after 60s
- Returns: RunEnvelope

Update app/api/runs/route.ts:
- Replace mocked RunEnvelope with call to executeLocal
- Extract project directory (for v0: require user to provide uploaded ZIP or use sample)
- For now: create /data/projects/<projectId>/code/ directory and expect code there
- Add validation: check if project directory exists
- If missing: return error "Project code not uploaded yet"
- Pass secrets as env object
- Create artifacts dir: /data/artifacts/<runId>/
- Call executeLocal with all params
- Store returned RunEnvelope in run record

Sample FastAPI app (create for testing):
- Create: services/runner_local/samples/hello/main.py
- Simple FastAPI app:
  ```python
  from fastapi import FastAPI
  from pydantic import BaseModel

  app = FastAPI()

  class User(BaseModel):
      name: str
      age: int

  @app.get("/hello")
  def hello(name: str = "World"):
      return {"message": f"Hello, {name}!"}

  @app.post("/users")
  def create_user(user: User):
      return {"created": user.dict()}
  ```

- Create OpenAPI fixture for this app
- Test running it locally

Acceptance:
- Install Python dependencies: pip install -r services/runner_local/requirements.txt
- run.py executes sample FastAPI app successfully
- Returns valid RunEnvelope JSON
- UI run page shows real response from FastAPI app
- Errors are handled gracefully
- Artifacts collection works (if files in artifacts-dir)
- TypeScript and Python both work
```

---

## Post-12 Next Steps (Not Prompts)

After completing all 12 prompts, you'll have:

✅ Working product demo (local)
✅ Import OpenAPI → Run Pages → Share
✅ Real FastAPI execution
✅ Secrets injection
✅ File-based persistence

**Next phases:**
1. **Modal Integration** - Swap executeLocal → executeModal (same contract)
2. **Real Auth** - Add authentication and user accounts
3. **Database Migration** - Replace file storage with PostgreSQL
4. **Context Fetching** - Add URL → context extraction
5. **Artifact Upload** - Upload to S3 instead of local files
6. **Production Hardening** - Error handling, validation, security

Each phase follows the same principle: **small vertical slices, clear contracts, working demos**.

---

## Debugging Tips

If any prompt fails:
1. Check TypeScript errors first: `npx tsc --noEmit`
2. Check Next.js dev server console
3. Check browser console
4. Verify files were created in correct locations
5. Check /data directory structure
6. For Python runner: test run.py directly with sample inputs

Common issues:
- File paths: Use absolute paths or path.join properly
- JSON parsing: Always try/catch when parsing user input
- Async/await: Don't forget await on async operations
- TypeScript strict mode: Properly type all function params and returns
