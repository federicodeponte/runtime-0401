# Execution Layer v0 - Simplified

**"Colab for Apps"** - Upload FastAPI projects → auto-generate Run Pages from OpenAPI → share safely.

## Quick Start

This is a **simplified v0** built with 12 single-prompt vertical slices. No complexity, no database (yet), no Modal (yet).

### Prerequisites
- Node.js 20+
- Python 3.11+
- npm or pnpm

### Installation

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies for local runner
cd services/runner_local
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ../..

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## What This Version Does

✅ **Import OpenAPI JSON** → Instant endpoint explorer
✅ **Auto-generate forms** from request schemas
✅ **Execute FastAPI apps locally** (real Python runner)
✅ **Share endpoints** via public links
✅ **Manage secrets** (owner-only, never shared)
✅ **Run history** per endpoint
✅ **Artifact collection** from `/artifacts` directory

## What This Version Does NOT Do (Yet)

❌ Database (uses JSON files in `/data`)
❌ Modal integration (local Python subprocess only)
❌ Authentication (single owner assumed)
❌ Secrets encryption (plaintext storage for v0)
❌ Advanced schema mapping (complex schemas → JSON editor)
❌ Context fetching
❌ Production deployment
❌ Real-time logs

## Architecture

**Stack:**
- Frontend: Next.js 15 (App Router) + TypeScript + Tailwind
- Backend: Next.js API routes + file-based JSON storage
- Runner: Python subprocess (FastAPI in-process execution)

**Key Contracts:**
1. **OpenAPI In** - Standard OpenAPI 3.x JSON (user uploads)
2. **RunEnvelope Out** - Standardized run result (always same shape)

**Storage:**
```
/data/
  projects.json          # Array of projects
  versions.json          # Array of versions
  shares.json            # Array of shares
  openapi/<versionId>.json
  runs/<runId>.json
  secrets/<projectId>.json
  artifacts/<runId>/...
```

## User Flows

### 1. Create Project
1. Navigate to `/new`
2. Paste OpenAPI JSON
3. Submit
4. View endpoint list

### 2. Run Endpoint
1. Click endpoint from list
2. Fill auto-generated form
3. Submit
4. See real response from FastAPI app

### 3. Share Endpoint
1. Click "Share" on run page
2. Copy URL
3. Open in incognito
4. Anyone can run without seeing secrets

## Documentation

- **[00-OVERVIEW.md](./00-OVERVIEW.md)** - Project philosophy & simplifications
- **[01-PROMPTS.md](./01-PROMPTS.md)** - 12 build prompts (copy/paste for Claude Code)
- **[02-CONTRACTS.md](./02-CONTRACTS.md)** - OpenAPI In, RunEnvelope Out
- **[03-FILE-STRUCTURE.md](./03-FILE-STRUCTURE.md)** - Complete repo layout
- **[04-TESTING-GUIDE.md](./04-TESTING-GUIDE.md)** - Manual test checklist

## Build Instructions

Execute prompts 1-12 from **[01-PROMPTS.md](./01-PROMPTS.md)** in order using Claude Code.

Each prompt:
- Touches 2-5 files max
- Creates one working vertical slice
- Can be tested immediately
- No refactoring, no premature abstraction

After each prompt, run:
```bash
npx tsc --noEmit  # Check TypeScript
npm run dev       # Test in browser
```

## Sample FastAPI App

A sample app is included at `services/runner_local/samples/hello/main.py`:

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

OpenAPI for this app is at `services/runner_local/samples/hello/openapi.json`.

## Upgrade Path

This simplified v0 provides clear upgrade paths:

**File storage → Database:**
- Replace `lib/store/fsStore.ts` with `lib/store/dbStore.ts`
- Keep same interface, swap one module

**Local runner → Modal:**
- Replace `lib/runner/executeLocal.ts` with `lib/runner/executeModal.ts`
- Same RunEnvelope contract, different backend

**No auth → Real auth:**
- Add authentication middleware
- Update API routes to check user
- Add user context to all operations

Each simplification is **intentional** and **has a clear migration path**.

## Design Philosophy

**Single-Prompt Vertical Slices:**
- Each feature: 2-5 files, fully working
- No "let's also add..." scope creep
- Test before moving to next

**Two Sacred Contracts:**
- OpenAPI 3.x → Form generation
- RunEnvelope → UI rendering
- Never change, easy to swap implementations

**Demo-First:**
- Every slice must be demo-able
- Working > perfect
- Manual QA > comprehensive tests (for v0)

## Development Workflow

```bash
# 1. Start dev server
npm run dev

# 2. In another terminal, activate Python env
cd services/runner_local
source venv/bin/activate

# 3. Test Python runner directly
python run.py \
  --project-dir ./samples/hello \
  --entrypoint main:app \
  --endpoint-id "GET /hello" \
  --inputs '{"query": {"name": "Alice"}}' \
  --env '{}' \
  --artifacts-dir ./test-artifacts

# 4. Make changes, refresh browser
# 5. Run TypeScript check
npx tsc --noEmit
```

## Common Issues

**Python runner fails:**
- Check Python venv is activated
- Check dependencies installed: `pip install -r requirements.txt`
- Check project code exists at expected path

**TypeScript errors:**
- Run `npx tsc --noEmit` to see all errors
- Check imports use `@/` path alias
- Check all types are exported

**Share links don't work:**
- Check share record exists in `/data/shares.json`
- Check share.enabled is true
- Check version_id and endpoint_id are correct

**Secrets leak:**
- Check secrets never in API response
- Check secrets never in RunEnvelope.json field
- Check share pages can't access /api/secrets

## Success Metrics

Demo-able in **< 5 minutes:**
- ✅ Paste OpenAPI JSON
- ✅ See endpoint list
- ✅ Fill form and run
- ✅ See real response
- ✅ Share link works
- ✅ Run from share creates new run

**Technical quality:**
- ✅ TypeScript strict mode, no errors
- ✅ All routes return proper status codes
- ✅ Forms validate inputs
- ✅ Share pages hide owner-only data
- ✅ Runs persist correctly

## Contributing

This is a v0 prototype. Contributions should:
- Follow single-prompt vertical slice philosophy
- Not add complexity (databases, auth, etc.) until v0 is complete
- Include manual test steps
- Keep contracts unchanged

## License

MIT

## Next Steps

After completing v0:
1. **Modal Integration** - Replace local runner with Modal
2. **Database Migration** - PostgreSQL instead of files
3. **Real Authentication** - User accounts and sessions
4. **Context Fetching** - URL → structured data extraction
5. **Production Hardening** - Error handling, validation, security
6. **Advanced Features** - Streaming, WebSockets, GPU support

Each phase: same vertical slice approach, clear contracts, working demos.

---

**Built with the philosophy: "Working > Perfect, Demo-able > Comprehensive, Simple > Complex"**
