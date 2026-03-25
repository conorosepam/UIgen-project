# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Setup (first time)
npm run setup          # install deps + Prisma generate + migrate

# Development
npm run dev            # Next.js dev server with Turbopack
npm run build          # Production build
npm run start          # Start production server

# Testing
npm test               # Run Vitest (watch mode)
npx vitest run         # Run tests once
npx vitest run src/__tests__/some.test.tsx  # Run single test file

# Database
npx prisma migrate dev # Create and apply new migration
npm run db:reset       # Reset database

# Linting
npx next lint          # ESLint via Next.js preset
```

## Environment

Copy `.env` and add `ANTHROPIC_API_KEY`. Without it, the app runs with a **mock LLM** that returns static component templates — useful for development without API costs.

## Architecture

UIGen is an AI-powered React component generator with live preview. Users describe components in a chat interface; Claude generates files into a virtual filesystem; an iframe renders them live.

### Request Flow

1. User sends a message → `POST /api/chat` (`src/app/api/chat/route.ts`)
2. Chat API streams a response from Claude Haiku (or mock) using Vercel AI SDK `streamText`
3. Claude calls tools: `str_replace_editor` (create/edit files) and `file_manager` (mkdir/rm)
4. On stream completion, chat history + file state are persisted to SQLite via Prisma
5. `FileSystemContext` emits a `refreshTrigger` → `PreviewFrame` reloads its sandboxed iframe

### Virtual File System

`src/lib/file-system.ts` is a pure in-memory filesystem — no disk writes. Files live in a JS object tree. The context (`src/lib/contexts/`) wraps this and broadcasts changes. The preview iframe uses `src/lib/transform/jsx-transformer.ts` (Babel standalone) to compile JSX and build an import map at runtime.

### AI Provider

`src/lib/provider.ts` exports either the real Anthropic client (Claude Haiku 4.5) or a `MockLanguageModel` when `ANTHROPIC_API_KEY` is absent. The mock simulates the same tool-call structure so UI/tool handling can be developed offline.

### Auth

JWT sessions stored in httpOnly cookies (7-day expiry). Server actions in `src/actions/index.ts` handle sign-up/sign-in/sign-out. Anonymous users can generate components; work is tracked in localStorage via `src/lib/anon-work-tracker.ts` and migrated to the database on sign-up.

### Database

Prisma + SQLite. Schema is defined in `prisma/schema.prisma` — reference it for data structure. Two models: `User` (email/password) and `Project` (name, messages JSON, data JSON). Projects store the full chat history and serialized virtual filesystem.

### Key Constraints from System Prompt

- Root file must be `/App.jsx`
- No HTML files — virtual FS only
- Components use React + Tailwind CSS
- Imports use `@/` alias (maps to `src/`)
- Max 40 AI steps per request (4 for mock)
