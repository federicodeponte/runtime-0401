# Execution Layer v0 - Simplified

**Product in one sentence:**
"Colab for Apps" - upload/import FastAPI projects → auto-generate Run Pages from OpenAPI → share safely.

## Core Simplifications for v0

### What We're Building
A minimal viable product that proves the core value:
1. Import OpenAPI JSON → instant Run Pages
2. Run endpoints through generated forms
3. Share links that work without leaking secrets

### What We're NOT Building (Yet)
- ❌ Full Modal integration (use local runner first)
- ❌ Database (use JSON files in `/data`)
- ❌ Authentication (owner-only assumed for now)
- ❌ Real secrets encryption (simple storage, mark owner-only)
- ❌ Advanced schema mapping (fallback to JSON editor)
- ❌ Context fetching (defer to later)
- ❌ Artifact upload to S3 (local files)

## Key Architectural Decisions

### 1. File-Based Persistence
```
/data/
  projects.json
  versions.json
  openapi/<versionId>.json
  runs/<runId>.json
  shares.json
  secrets/<projectId>.json
  artifacts/<runId>/
```

**Why:** Removes 50% of complexity. No DB setup, migrations, or connection pooling.

### 2. Two Sacred Contracts

**Contract 1: OpenAPI In**
- Input: Standard OpenAPI 3.x JSON
- Source: User paste/upload
- Used for: Generating endpoint list + forms

**Contract 2: RunEnvelope Out**
- Output: Standardized run result
- Used by: UI rendering, share pages, history
- Never changes between runner implementations

### 3. Local Runner → Modal Later
Start with Python subprocess that:
- Imports user's FastAPI app
- Calls endpoint in-process
- Returns RunEnvelope JSON

Same interface works for Modal later.

## Stack

**Frontend:**
- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS (minimal styling)
- No external UI libraries initially

**Backend:**
- Next.js API routes (file-based storage)
- Python runner subprocess (local execution)

**Storage:**
- JSON files in `/data`
- Upgrade path to PostgreSQL later

## Development Philosophy

### Single-Prompt Vertical Slices
Each prompt:
- ✅ Touches 2-5 files max
- ✅ Creates one working user flow
- ✅ Can be tested immediately
- ❌ No refactoring
- ❌ No premature abstraction
- ❌ No "let's also add..."

### Ground Rules for Every Prompt

**Header for Claude Code:**
```
Only create/edit the files listed.
No refactors, no renames, no new frameworks.
If a new helper is needed, put it in the file already being edited.
Keep it minimal and demo-first.
```

### Quality Gates
After each prompt:
1. **TypeScript compiles** - `npx tsc --noEmit`
2. **App runs** - `npm run dev`
3. **Feature works** - Manual test
4. **No console errors** - Check browser console

## The 12-Prompt Build Plan

Each prompt builds one working vertical slice:

1. **Repo skeleton + UI shell** - Nav, empty states
2. **Shared types** - RunEnvelope, contracts
3. **OpenAPI parsing** - List endpoints
4. **Form generation** - Schema → form fields
5. **UI: Demo mode** - Fixture-based explorer
6. **File storage** - JSON persistence helpers
7. **API: Import OpenAPI** - Upload flow
8. **UI: Project page** - Real endpoint list
9. **API: Run endpoint** - Mock runner + envelope
10. **Sharing** - Public run pages
11. **Secrets** - Owner-only env vars
12. **Real runner** - Local Python harness

## Success Metrics

**Demo-able in < 1 hour:**
- [ ] Paste OpenAPI JSON
- [ ] See endpoint list
- [ ] Fill form and run
- [ ] See result
- [ ] Share link works in incognito
- [ ] Run from share creates new run

**Technical quality:**
- [ ] TypeScript strict mode, no errors
- [ ] All routes return proper status codes
- [ ] Forms validate inputs
- [ ] Share pages hide owner-only data
- [ ] Runs persist to `/data`

## Critical Non-Goals

**Don't even think about:**
- Multiple user accounts (single owner assumed)
- Real authentication (later)
- Production hosting (local dev only)
- Scaling/performance (not yet)
- Advanced error handling (basic only)
- Comprehensive tests (manual QA)
- Documentation beyond this

## Next Steps

1. Review 00-OVERVIEW.md (this file)
2. Read 01-PROMPTS.md for exact Claude Code prompts
3. Read 02-CONTRACTS.md for type definitions
4. Read 03-FILE-STRUCTURE.md for repo layout
5. Execute prompts 1-12 in order
6. Test each slice before moving to next

## Upgrade Path to Full Version

This simplified v0 provides:
- ✅ Proven product concept
- ✅ Working vertical slices
- ✅ Clear contracts (easy to swap implementations)
- ✅ File-based → DB migration path
- ✅ Local runner → Modal migration path
- ✅ No auth → Real auth migration path

Each simplification is **intentional** and has a **clear upgrade path**.
