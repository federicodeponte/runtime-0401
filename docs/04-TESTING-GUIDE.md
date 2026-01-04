# Testing Guide - Execution Layer v0

Manual testing checklist for each prompt. Run these tests before moving to the next prompt.

---

## Prompt 1: Repo Skeleton + UI Shell

### Test Steps
1. **Install and run:**
   ```bash
   npm install
   npm run dev
   ```
   ✅ No errors, dev server starts on http://localhost:3000

2. **Home page (/):**
   - ✅ Shows "RunIt" branding
   - ✅ Hero section with tagline
   - ✅ Nav links: Home, Projects, New Project

3. **Projects page (/projects):**
   - ✅ Shows "No projects yet" empty state
   - ✅ "Create your first project" button links to /new

4. **Navigation:**
   - ✅ Clicking "Projects" navigates to /projects
   - ✅ Clicking "RunIt" logo navigates to /
   - ✅ /new link exists (404 ok for now)

5. **TypeScript:**
   ```bash
   npx tsc --noEmit
   ```
   ✅ No errors

6. **Design check:**
   - ✅ Clean, minimal UI
   - ✅ Readable fonts, good spacing
   - ✅ Not cluttered or dashboard-like

---

## Prompt 2: Shared Types & Contracts

### Test Steps
1. **TypeScript compilation:**
   ```bash
   npx tsc --noEmit
   ```
   ✅ No errors

2. **Import types in any file:**
   ```typescript
   import { RunEnvelope, EndpointMeta, FormModel } from '@/lib/contracts';
   import { Project, Version, Run, Share } from '@/lib/types';
   ```
   ✅ All imports resolve

3. **Type structure check:**
   - ✅ RunEnvelope has all required fields
   - ✅ FormField supports all kinds (string, number, boolean, enum, json)
   - ✅ No external dependencies (pure TypeScript)

---

## Prompt 3: OpenAPI Endpoint Listing

### Test Steps
1. **Create test file:**
   ```typescript
   // lib/openapi/__test__.ts
   import { listEndpoints } from './listEndpoints';

   const testOpenAPI = {
     openapi: "3.0.0",
     paths: {
       "/hello": {
         get: { summary: "Say hello" }
       },
       "/users/{id}": {
         get: { summary: "Get user" },
         delete: { summary: "Delete user" }
       }
     }
   };

   const endpoints = listEndpoints(testOpenAPI);
   console.log(endpoints);
   // Expected: 3 endpoints with correct ids, methods, paths
   ```

2. **Run test:**
   ```bash
   npx ts-node lib/openapi/__test__.ts
   ```
   ✅ Outputs 3 endpoints:
   - GET /hello
   - GET /users/{id}
   - DELETE /users/{id}

3. **Edge cases:**
   - ✅ Empty paths object → returns []
   - ✅ Missing summary → endpoint still included
   - ✅ Non-HTTP keys ignored (parameters, servers, etc.)

---

## Prompt 4: Form Model Generation

### Test Steps
1. **Create test file:**
   ```typescript
   // lib/openapi/formModel.__test__.ts
   import { generateFormModel } from './formModel';

   // Test 1: Query params
   const openapi1 = {
     paths: {
       "/search": {
         get: {
           parameters: [
             { name: "query", in: "query", required: true, schema: { type: "string" } },
             { name: "limit", in: "query", schema: { type: "number", default: 10 } }
           ]
         }
       }
     }
   };
   console.log('Test 1:', generateFormModel(openapi1, "GET /search"));

   // Test 2: Request body
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
                     age: { type: "number" }
                   }
                 }
               }
             }
           }
         }
       }
     }
   };
   console.log('Test 2:', generateFormModel(openapi2, "POST /users"));

   // Test 3: Complex schema (oneOf) → fallback
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
   console.log('Test 3:', generateFormModel(openapi3, "POST /complex"));
   ```

2. **Run test:**
   ```bash
   npx ts-node lib/openapi/formModel.__test__.ts
   ```

3. **Verify outputs:**
   - ✅ Test 1: 2 fields (query: string, limit: number with default 10)
   - ✅ Test 2: 2 fields (name: string required, age: number optional)
   - ✅ Test 3: 1 field (kind="json", name="body")

---

## Prompt 5: Demo Mode UI

### Test Steps
1. **Navigate to /demo:**
   - ✅ Page loads
   - ✅ Shows endpoint list from fixture
   - ✅ Each endpoint has method badge, path, summary

2. **Click endpoint:**
   - ✅ Navigates to /demo/[encodedEndpointId]
   - ✅ Form renders with correct fields
   - ✅ Required fields marked

3. **Fill form and submit:**
   - ✅ Fields validate client-side
   - ✅ Submit shows mocked result below form
   - ✅ Result displays: status pill, duration, JSON viewer

4. **Multiple submissions:**
   - ✅ Can submit multiple times
   - ✅ Each submission updates result

5. **Design check:**
   - ✅ Clean form layout
   - ✅ Method badges colored (GET=blue, POST=green, etc.)
   - ✅ Result viewer: collapsible JSON, easy to read

---

## Prompt 6: File-Based Storage

### Test Steps
1. **Import and test:**
   ```typescript
   // lib/store/__test__.ts
   import {
     createProject,
     getProject,
     createVersion,
     getVersionOpenAPI,
     createRun,
     createShare
   } from './fsStore';

   async function test() {
     // Create project
     const project = await createProject("Test API");
     console.log('Project:', project);

     // Get project
     const retrieved = await getProject(project.id);
     console.log('Retrieved:', retrieved);

     // Create version
     const openapi = { openapi: "3.0.0", paths: {} };
     const version = await createVersion(project.id, openapi);
     console.log('Version:', version);

     // Get OpenAPI
     const spec = await getVersionOpenAPI(version.id);
     console.log('OpenAPI:', spec);

     // Create run
     const mockEnvelope = {
       run_id: "test",
       status: "success" as const,
       duration_ms: 100,
       http_status: 200,
       content_type: "application/json",
       json: { test: true },
       artifacts: [],
       warnings: [],
       redactions_applied: false
     };
     const run = await createRun(version.id, "GET /test", {}, mockEnvelope, "owner");
     console.log('Run:', run);

     // Create share
     const share = await createShare(version.id, "GET /test");
     console.log('Share:', share);
   }

   test();
   ```

2. **Run test:**
   ```bash
   npx ts-node lib/store/__test__.ts
   ```

3. **Verify:**
   - ✅ Creates /data directory
   - ✅ Creates projects.json, versions.json, shares.json
   - ✅ Creates /data/openapi/<versionId>.json
   - ✅ Creates /data/runs/<runId>.json
   - ✅ All files contain valid JSON
   - ✅ IDs are UUIDs

---

## Prompt 7: API Import OpenAPI

### Test Steps
1. **Navigate to /new:**
   - ✅ Form loads
   - ✅ Project name input
   - ✅ OpenAPI JSON textarea with placeholder

2. **Paste valid OpenAPI:**
   ```json
   {
     "openapi": "3.0.0",
     "info": { "title": "Test API", "version": "1.0.0" },
     "paths": {
       "/hello": {
         "get": {
           "summary": "Say hello",
           "parameters": [
             { "name": "name", "in": "query", "schema": { "type": "string", "default": "World" } }
           ]
         }
       }
     }
   }
   ```

3. **Submit form:**
   - ✅ No errors
   - ✅ Redirects to /projects/[projectId]
   - ✅ URL contains valid project ID

4. **Error handling:**
   - ✅ Empty project name → shows error
   - ✅ Invalid JSON → shows "Invalid JSON" error
   - ✅ Missing "openapi" field → shows validation error

5. **Verify files:**
   ```bash
   ls data/
   ls data/openapi/
   ```
   - ✅ projects.json updated
   - ✅ versions.json updated
   - ✅ OpenAPI saved in data/openapi/

---

## Prompt 8: Project Page

### Test Steps
1. **After creating project, check URL:**
   - ✅ /projects/[projectId] loads
   - ✅ Shows project name
   - ✅ Shows version ID (small gray text)

2. **Endpoint list:**
   - ✅ Lists all endpoints from OpenAPI
   - ✅ Each endpoint has method badge, path, summary
   - ✅ Clicking endpoint navigates to /projects/[projectId]/run/[endpointId]

3. **Loading state:**
   - ✅ Shows loading indicator while fetching

4. **Error state:**
   - ✅ /projects/invalid-id shows 404 or error message

5. **No version case:**
   - Delete latest_version_id from project in data/projects.json
   - ✅ Shows "No version yet" message

---

## Prompt 9: API Run Endpoint

### Test Steps
1. **Navigate to run page:**
   - ✅ /projects/[projectId]/run/GET%20%2Fhello loads
   - ✅ Form renders with correct fields
   - ✅ Default values pre-filled

2. **Submit form:**
   - ✅ Form submits to /api/runs
   - ✅ Result appears below form
   - ✅ Status shows "success"
   - ✅ Duration shown
   - ✅ JSON response displays
   - ✅ Mocked response echoes inputs

3. **Run history:**
   - ✅ After first run, "Run History" section appears
   - ✅ Shows timestamp, status, duration
   - ✅ Click run in history → shows that result

4. **Multiple runs:**
   - Submit 3 times with different inputs
   - ✅ Each creates new run
   - ✅ History shows all 3

5. **Verify files:**
   ```bash
   ls data/runs/
   ```
   - ✅ 3 JSON files created
   - ✅ Each contains full run record

---

## Prompt 10: Sharing

### Test Steps
1. **On run page:**
   - ✅ "Share" button visible
   - ✅ Click Share → shows success message
   - ✅ Share URL copied to clipboard

2. **Open share URL:**
   - Copy URL from clipboard
   - Open in incognito window: /s/[shareId]
   - ✅ Page loads
   - ✅ Shows "Shared by [Project Name]" header
   - ✅ Form renders (same as owner run page)
   - ✅ No "Share" button visible
   - ✅ No run history visible

3. **Run from share page:**
   - Fill form and submit
   - ✅ Creates new run
   - ✅ Result displays
   - ✅ Run does NOT appear in owner's history

4. **Verify files:**
   ```bash
   cat data/shares.json
   ls data/runs/
   ```
   - ✅ Share record created with correct version_id and endpoint_id
   - ✅ Run from share has created_by="anonymous"

5. **Share validation:**
   - Change share.enabled to false in shares.json
   - Reload share page
   - ✅ Shows "This link has been disabled" message

---

## Prompt 11: Secrets

### Test Steps
1. **Navigate to secrets page:**
   - /projects/[projectId]/secrets
   - ✅ Page loads
   - ✅ Shows "Add Secret" form
   - ✅ Shows warning: "Secrets are owner-only and never shared"

2. **Add secret:**
   - Key: API_KEY
   - Value: sk-1234567890abcdef
   - ✅ Submit succeeds
   - ✅ Value is masked in list: "sk-1****"

3. **Add multiple secrets:**
   - DATABASE_URL: postgresql://localhost/db
   - STRIPE_KEY: sk_test_abc123
   - ✅ All secrets listed
   - ✅ All values masked

4. **Delete secret:**
   - Click delete on API_KEY
   - ✅ Confirm dialog appears
   - ✅ After confirm, secret removed from list

5. **Verify files:**
   ```bash
   cat data/secrets/[projectId].json
   ```
   - ✅ Secrets stored (plaintext for v0, ok)
   - ✅ Deleted secrets removed

6. **Share page check:**
   - Open /s/[shareId] in incognito
   - Try to navigate to /projects/[projectId]/secrets
   - ✅ Returns 403 or redirects (owner-only protection)

7. **Run with secrets:**
   - Add console.log in app/api/runs/route.ts to log loaded secrets
   - Submit run from run page
   - Check server console
   - ✅ Secrets loaded for project
   - ✅ Secrets NOT in response payload

---

## Prompt 12: Real Runner

### Test Steps
1. **Python setup:**
   ```bash
   cd services/runner_local
   python3 -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```
   ✅ Dependencies install successfully

2. **Test run.py directly:**
   ```bash
   python run.py \
     --project-dir ./samples/hello \
     --entrypoint main:app \
     --endpoint-id "GET /hello" \
     --inputs '{"query": {"name": "Alice"}}' \
     --env '{}' \
     --artifacts-dir ./test-artifacts
   ```
   ✅ Outputs valid JSON RunEnvelope
   ✅ Status: "success"
   ✅ JSON contains response from FastAPI app

3. **Test with POST endpoint:**
   ```bash
   python run.py \
     --project-dir ./samples/hello \
     --entrypoint main:app \
     --endpoint-id "POST /users" \
     --inputs '{"body": {"name": "Bob", "age": 30}}' \
     --env '{}' \
     --artifacts-dir ./test-artifacts
   ```
   ✅ Returns created user object

4. **Test error handling:**
   ```bash
   python run.py \
     --project-dir ./invalid-path \
     --entrypoint main:app \
     --endpoint-id "GET /hello" \
     --inputs '{}' \
     --env '{}' \
     --artifacts-dir ./test-artifacts
   ```
   ✅ Status: "error"
   ✅ error_class: "IMPORT_ERROR"
   ✅ error_message is user-friendly

5. **UI integration:**
   - Copy samples/hello to /data/projects/[projectId]/code/
   - Create project with hello OpenAPI
   - Navigate to run page
   - Submit form
   - ✅ Real response from FastAPI app
   - ✅ Result displays correctly
   - ✅ No "mocked: true" in response

6. **Artifacts test:**
   - Modify hello/main.py to write file to /artifacts/test.txt
   - Run endpoint
   - ✅ Artifact appears in result
   - ✅ Download link works
   - ✅ File contains expected content

---

## Full E2E Test (All Prompts Complete)

### Happy Path
1. **Create project:**
   - Navigate to /new
   - Paste valid OpenAPI
   - Submit
   - ✅ Redirects to project page

2. **Explore endpoints:**
   - ✅ Endpoints listed
   - Click first endpoint
   - ✅ Run page loads

3. **Add secrets:**
   - Navigate to /projects/[id]/secrets
   - Add API_KEY secret
   - ✅ Secret saved and masked

4. **Run endpoint:**
   - Fill form
   - Submit
   - ✅ Real response from FastAPI
   - ✅ Result displays
   - ✅ Run saved to history

5. **Share endpoint:**
   - Click Share
   - ✅ URL copied
   - Open in incognito
   - ✅ Share page works
   - Submit from share page
   - ✅ Creates new run (not in owner history)

6. **Verify secrets not leaked:**
   - Check run result JSON
   - Check share page source
   - ✅ No secrets in any response

### Error Cases
1. **Invalid OpenAPI:**
   - Paste invalid JSON
   - ✅ Shows JSON parse error

2. **Missing endpoint:**
   - Navigate to /projects/[id]/run/INVALID
   - ✅ Shows "Endpoint not found" error

3. **Runner failure:**
   - Delete project code directory
   - Try to run endpoint
   - ✅ Shows IMPORT_ERROR
   - ✅ Suggested fix displayed

---

## Automated Checks

Before considering v0 complete, run:

```bash
# TypeScript
npx tsc --noEmit

# Build
npm run build

# Start
npm start

# Manual smoke test
# - Create project
# - Run endpoint
# - Share link
# All work without errors
```

---

## Success Criteria

✅ **All 12 prompts completed**
✅ **All manual tests pass**
✅ **No TypeScript errors**
✅ **App builds successfully**
✅ **Demo-able in < 5 minutes**
✅ **Share links work in incognito**
✅ **Secrets never leak**
✅ **Real FastAPI execution works**

**If all checked: v0 is complete and ready for Modal migration!**
