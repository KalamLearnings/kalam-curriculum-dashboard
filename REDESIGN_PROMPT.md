# Redesign Implementation Prompt

Copy everything below this line and paste it as your first message to a new Claude Code session:

---

I need you to implement a complete UI redesign of this dashboard. Before doing anything, read these two documents thoroughly:

1. `REDESIGN.md` - The full design document with context, architecture, and plan
2. `REDESIGN_IMPLEMENTATION.md` - The technical guide with code examples and testing setup

## Context

This is the Kalam Curriculum Dashboard - an internal tool for creating Arabic learning curriculum. The users are **extremely non-technical** (curriculum authors, educators). The current UI has:

- 111 React components with massive duplication
- 45+ inline button styles, 35+ inline input styles
- No component library (raw Tailwind)
- Minimal environment awareness (users accidentally edit production)
- No tests

## Your Mission

Rebuild the UI using shadcn/ui with these priorities:

1. **Non-technical users first** - Clear labels, visual pickers, confirmations for destructive actions
2. **Environment awareness** - Users must always know if they're in DEV (safe) or PROD (live data)
3. **Component consolidation** - Replace duplicated components with shared ones
4. **Add tests** - Unit tests for components, integration tests for flows

## Implementation Order

Follow the phases in REDESIGN.md:

**Phase 1: Foundation (do this first)**
- Initialize shadcn/ui
- Install base components (button, input, dialog, card, etc.)
- Configure theme colors
- Create `EnvironmentBanner` component

**Phase 2: Component Consolidation**
- Create shared components: `SearchInput`, `CategoryFilter`, `MediaCard`, `MediaGrid`, `EmptyState`, `FormField`
- Migrate Assets page as proof of concept

**Phase 3: Layout & Navigation**
- Redesign dashboard layout with prominent environment indicator
- Improve sidebar and navigation

**Phase 4: Curriculum Editor**
- Activity type visual picker
- Activity wizard (step-by-step flow)
- Preview panel

**Phase 5: Testing & Polish**
- Add Vitest + Testing Library
- Write tests for all new components
- Accessibility audit

## Critical Things to Preserve

1. **Environment system** - `lib/stores/environmentStore.ts` and `lib/supabase/client.ts` handle DEV/PROD switching. Don't break this.
2. **Auth flow** - OTP login with per-environment sessions
3. **API patterns** - `lib/api/curricula.ts` handles all backend calls
4. **Activity forms** - Keep the 28 activity form components in `components/curriculum/forms/`, just update them to use new base inputs
5. **AIEffects** - Keep `components/ui/AIEffects.tsx` as-is (it's already polished)

## Commands

```bash
npm run dev      # Start dev server on port 3001
npm run build    # Build (includes schema build)
npm run lint     # Run ESLint
npm test         # Run tests (after you set up Vitest)
```

## Start Now

Begin with Phase 1. Initialize shadcn/ui and install the base components. After each major step, test that the app still works by running `npm run dev` and checking the UI.

Work methodically. Commit after each working milestone. Ask me if anything in the design docs is unclear.
