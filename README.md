# Execution Layer v0 - Simplified

**✅ Prompt 1: Repo Skeleton + UI Shell - COMPLETE**
**✅ Prompt 2: Shared Types & Contracts - COMPLETE**

"Colab for Apps" - Upload FastAPI projects → auto-generate Run Pages from OpenAPI → share safely.

## Status: Types & Contracts Defined 🎉

### What's Working
- ✅ Next.js 15 + TypeScript + Tailwind CSS 3 setup
- ✅ Clean navigation with "RunIt" branding
- ✅ Home page with hero section and feature cards
- ✅ Projects page with empty state
- ✅ Shared TypeScript types (lib/contracts.ts, lib/types.ts)
- ✅ Two sacred contracts defined: OpenAPI In → RunEnvelope Out
- ✅ TypeScript strict mode compiles with no errors
- ✅ Dev server running on http://localhost:3000

### File Structure Created
```
runtime-0401/
├── README.md (this file)
├── README-GUIDE.md (full guide)
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── .gitignore
├── app/
│   ├── layout.tsx          ✅ Root layout with Nav
│   ├── page.tsx             ✅ Landing page
│   ├── projects/
│   │   └── page.tsx         ✅ Projects list (empty state)
│   └── globals.css
├── components/
│   └── Nav.tsx              ✅ Navigation component
├── lib/
│   ├── contracts.ts         ✅ RunEnvelope, ArtifactRef, EndpointMeta, FormModel
│   └── types.ts             ✅ Project, Version, Run, Share
└── docs/
    ├── 00-OVERVIEW.md
    ├── 01-PROMPTS.md        (12 prompts total)
    ├── 02-CONTRACTS.md
    ├── 03-FILE-STRUCTURE.md
    └── 04-TESTING-GUIDE.md
```

## Design Philosophy ✨

**Clean & Calm UI:**
- Linear × Cursor aesthetic
- One primary CTA per page
- No cluttered dashboards
- Readable fonts, good spacing

**Tech Stack:**
- Next.js 15.1.4 (App Router)
- React 19
- TypeScript 5.7 (strict mode)
- Tailwind CSS 3.4

## Testing Checklist ✅

**Prompt 1 Acceptance Criteria:**
- [x] npm run dev works
- [x] / loads with hero and feature cards
- [x] /projects shows empty state with CTA
- [x] Navigation works (Home, Projects, New Project links)
- [x] TypeScript compiles with no errors
- [x] Clean, minimal UI (not dashboard-like)

**Prompt 2 Acceptance Criteria:**
- [x] lib/contracts.ts created with RunEnvelope types
- [x] lib/types.ts created with domain types
- [x] TypeScript compiles with no errors
- [x] Types can be imported from other files

## Next Steps

Execute **Prompt 3** from `docs/01-PROMPTS.md`:

```
Add file-based storage layer.

Files to create:
- lib/storage.ts (loadProjects, saveProject, loadVersion, etc.)
- data/.gitkeep (create /data directory)

This implements JSON file persistence for projects, versions, runs, shares.
```

## Quick Commands

```bash
# Dev server (already running)
npm run dev

# TypeScript check
npx tsc --noEmit

# Build (when ready)
npm run build

# Type check
npm run type-check
```

## Development Server

Currently running at: **http://localhost:3000**

**Pages available:**
- `/` - Landing page with hero
- `/projects` - Projects list (empty state)
- `/new` - Not yet created (404 for now)

## Documentation

- **README-GUIDE.md** - Complete project guide
- **docs/00-OVERVIEW.md** - Philosophy & simplifications
- **docs/01-PROMPTS.md** - All 12 build prompts
- **docs/02-CONTRACTS.md** - Type definitions
- **docs/03-FILE-STRUCTURE.md** - Repo layout
- **docs/04-TESTING-GUIDE.md** - Testing checklist

---

**Built with: Single-prompt vertical slices, minimal complexity, demo-first approach** 🚀

**Progress: 2/12 prompts complete** (16.7%)
- Prompt 1: Repo Skeleton ✅
- Prompt 2: Types & Contracts ✅
