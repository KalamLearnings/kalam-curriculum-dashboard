# Kalam Curriculum Dashboard

Internal tool for authoring Arabic learning curriculum.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: React 18, Tailwind CSS, Framer Motion
- **Data**: Supabase, TanStack Query
- **Drag & Drop**: dnd-kit

## Commands

```bash
npm run dev      # Start dev server on port 3001
npm run build    # Build (includes schema build)
npm run lint     # Run ESLint
```

## Project Structure

```
app/              # Next.js App Router pages
components/       # React components
lib/              # Utilities, hooks, API clients
packages/         # Local packages (curriculum-schemas)
```

## Conventions

- Use App Router patterns (server components by default)
- Prefer server components unless interactivity needed
- Use `"use client"` directive only when necessary
- Follow existing component patterns in `components/`

## Related Repos

- **mobile-app**: Consumes this curriculum
- **kalam-readers-backend**: API layer

## Context

This dashboard is used by curriculum authors (not end users). It manages:
- Lessons and activities
- Asset uploads
- Curriculum sequencing
