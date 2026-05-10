# Kalam Curriculum Dashboard - Complete Redesign

## Executive Summary

This document outlines a complete UI redesign of the Kalam Curriculum Dashboard, migrating from raw Tailwind CSS to shadcn/ui while prioritizing the needs of **extremely non-technical users** (curriculum authors, educators).

**Goal**: Transform a developer-friendly tool into an intuitive, foolproof authoring experience.

---

## Table of Contents

1. [Project Context](#project-context)
2. [Current Architecture](#current-architecture)
3. [User Personas & Pain Points](#user-personas--pain-points)
4. [Design Principles](#design-principles)
5. [Technical Foundation](#technical-foundation)
6. [Component Migration Plan](#component-migration-plan)
7. [New Component Library](#new-component-library)
8. [Page-by-Page Redesign](#page-by-page-redesign)
9. [Implementation Phases](#implementation-phases)
10. [File Structure](#file-structure)
11. [Testing Checklist](#testing-checklist)

---

## Project Context

### What is this dashboard?

An internal tool for creating Arabic learning curriculum for the Kalam Kids mobile app. Curriculum authors use it to:

- Create **Curricula** (series of lessons)
- Organize **Topics** (one per Arabic letter: أ, ب, ت, etc.)
- Build **Nodes** (intro, lesson, practice, review stages)
- Design **Activities** (37+ interactive exercise types)
- Manage **Assets** (images), **Audio** (sound files), **Words** (vocabulary)

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | TanStack Query + Zustand |
| Backend | Supabase (Edge Functions + Storage) |
| Drag & Drop | dnd-kit |
| Animation | Framer Motion |

### Environment System

The dashboard connects to **two separate Supabase instances**:

| Environment | Purpose | Visual Indicator |
|-------------|---------|------------------|
| **DEV** | Safe testing, experiments | Amber/Yellow |
| **PROD** | Live data used by real users | Red (danger) |

**Critical**: Users must always know which environment they're in. Accidental PROD edits affect real children using the app.

---

## Current Architecture

### Directory Structure

```
app/
  (auth)/login/page.tsx          # OTP login flow
  (dashboard)/layout.tsx         # Sidebar + env switcher (619 lines!)
  (dashboard)/curricula/         # Curriculum management
  (dashboard)/assets/            # Image library
  (dashboard)/audio/             # Audio library
  (dashboard)/words/             # Vocabulary management
  (dashboard)/books/             # Book management
  (dashboard)/templates/         # Activity templates
  (dashboard)/promo-codes/       # Promo code management

components/
  ui/                            # 5 base components (Modal, AIEffects, etc.)
  curriculum/                    # Curriculum editing (14 components)
  curriculum/forms/              # Activity forms (28 components)
  curriculum/forms/shared/       # Shared form components (7)
  curriculum/tree/               # Tree view (4 components)
  assets/                        # Asset management (7 components)
  audio/                         # Audio management (7 components)
  words/                         # Word management (4 components)
  promo-codes/                   # Promo codes (2 components)

lib/
  api/curricula.ts               # API client (543 lines)
  services/assetService.ts       # Asset CRUD
  services/audioService.ts       # Audio CRUD
  hooks/                         # React Query hooks
  stores/environmentStore.ts     # DEV/PROD state (Zustand)
  supabase/client.ts             # Environment-aware Supabase client
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         DASHBOARD                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────┐    ┌─────────────────┐    ┌─────────────────┐  │
│  │  Zustand   │───▶│  Environment    │───▶│  Supabase       │  │
│  │  Store     │    │  Store          │    │  Client         │  │
│  │            │    │  (dev/prod)     │    │  (cached/env)   │  │
│  └────────────┘    └─────────────────┘    └─────────────────┘  │
│                                                   │              │
│  ┌────────────┐    ┌─────────────────┐           │              │
│  │  React     │◀───│  TanStack       │◀──────────┘              │
│  │  Components│    │  Query          │                          │
│  └────────────┘    └─────────────────┘                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
     ┌─────────────────┐           ┌─────────────────┐
     │   DEV Supabase  │           │  PROD Supabase  │
     │                 │           │                 │
     │  Edge Functions │           │  Edge Functions │
     │  Storage Buckets│           │  Storage Buckets│
     │  PostgreSQL     │           │  PostgreSQL     │
     └─────────────────┘           └─────────────────┘
```

### Authentication Flow

1. User enters username (without domain)
2. System appends `@kalamkidslearning.com`
3. Supabase sends OTP via email
4. User enters 6-digit code
5. Session stored in localStorage as `kalam-auth-{env}`
6. Token auto-refreshes 60s before expiry

### API Architecture

All API calls go through `lib/api/curricula.ts`:

```typescript
async function fetchWithAuth<T>(path: string, options?: RequestInit): Promise<T>
```

- Automatically gets auth token from current environment
- Refreshes token if near expiry
- Routes to correct Supabase instance based on environment
- Returns `data.data` or `data` from response

**Key Endpoints**:
- `/curriculum/list/all` - All curricula (including drafts)
- `/curriculum/{id}/topics` - Topics in curriculum
- `/curriculum/{id}/topics/{topicId}/nodes` - Nodes in topic
- `/curriculum/{id}/nodes/{nodeId}/activities` - Activities in node
- `/ai/generate-topic` - AI topic generation
- `/tts` - Text-to-speech generation

---

## User Personas & Pain Points

### Primary User: Curriculum Author

**Profile**: Non-technical educator, may not speak Arabic fluently, needs to create engaging activities for children learning Arabic.

**Current Pain Points**:

| Problem | Example | Impact |
|---------|---------|--------|
| Environment confusion | "Did I just edit production?" | High - affects live users |
| Activity type overwhelm | 37 types in a dropdown | Medium - slows creation |
| Arabic letter complexity | Choosing letter forms | High - errors in content |
| Technical jargon | `{{letter_name}}` syntax | Medium - intimidating |
| Hidden states | No feedback during save | Low - anxiety |
| No undo | Deleted wrong activity | High - lost work |
| Nested navigation | Topic > Node > Activity | Medium - lost context |

### Secondary User: Content Manager

**Profile**: Reviews content created by authors, publishes to production.

**Additional Needs**:
- Bulk operations (publish multiple topics)
- Content comparison (DEV vs PROD)
- Activity preview (see how it looks in app)

---

## Design Principles

### 1. Environment Awareness is Paramount

```
┌────────────────────────────────────────────────────────────────┐
│ ⚠️  PRODUCTION MODE - Changes affect live users               │
│ [Switch to DEV]                                                │
└────────────────────────────────────────────────────────────────┘
```

- PROD: Red banner always visible, confirmation dialogs for all changes
- DEV: Subtle yellow indicator, free editing

### 2. Visual Over Text

Instead of:
```
<select>
  <option>show_letter_or_word</option>
  <option>tap_letter_in_word</option>
  ...
</select>
```

Use:
```
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│  [أ]    │ │  [tap]  │ │ [trace] │ │ [drag]  │
│  Show   │ │  Find   │ │  Write  │ │  Match  │
│  Letter │ │  Letter │ │  Letter │ │  Items  │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

### 3. Guided Workflows

Instead of: "Fill out this form"

Use: Step-by-step wizard with progress indicator

```
Step 1 of 4: Choose Activity Type
━━━━━━━━━━○○○○

[Visual grid of activity types with icons and descriptions]

[← Back]                                    [Next: Configure →]
```

### 4. Clear Feedback

| Action | Current | Redesign |
|--------|---------|----------|
| Save | Spinner | "Saving..." → "Saved!" with checkmark |
| Delete | Nothing | "Deleted. [Undo]" toast |
| Error | Console log | Red banner with plain English |
| Loading | Spinner | Skeleton + "Loading activities..." |

### 5. Contextual Help

Every complex field gets a tooltip:

```
Target Letter [?]
┌────────────────────────────────────────┐
│ The Arabic letter the child needs to   │
│ find in this activity. This should     │
│ match the topic's letter.              │
└────────────────────────────────────────┘
```

### 6. Preview Before Commit

For activities, show a phone mockup preview:

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   ┌──────────────────┐    ┌───────────────────────────────┐ │
│   │  Form Fields     │    │  📱 Preview                   │ │
│   │                  │    │  ┌─────────────────────────┐  │ │
│   │  Type: Tap       │    │  │                         │  │ │
│   │  Word: كلب       │    │  │   Find the letter ب    │  │ │
│   │  Letter: ب       │    │  │                         │  │ │
│   │                  │    │  │      ك  ـلـ  ب         │  │ │
│   │                  │    │  │                         │  │ │
│   └──────────────────┘    │  └─────────────────────────┘  │ │
│                           └───────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## Technical Foundation

### shadcn/ui Setup

shadcn/ui is a collection of reusable components built on Radix UI + Tailwind. Components are copied into your project, not installed as dependencies.

**Why shadcn/ui?**
- Already using Tailwind
- Radix gives us accessibility for free
- Full control over component code
- Great for admin dashboards

### Required shadcn/ui Components

| Component | Use Case |
|-----------|----------|
| `button` | All buttons (primary, secondary, danger, ghost) |
| `input` | Text inputs |
| `textarea` | Multiline inputs |
| `select` | Dropdowns |
| `checkbox` | Boolean inputs |
| `dialog` | Modals, confirmations |
| `sheet` | Slide-out panels |
| `tabs` | Category filters |
| `card` | Media cards, info cards |
| `badge` | Tags, status indicators |
| `tooltip` | Help text |
| `toast` | Notifications (via sonner) |
| `command` | Search/command palette |
| `skeleton` | Loading states |
| `alert` | Warnings, errors |
| `avatar` | User indicators |
| `dropdown-menu` | Context menus |
| `form` | Form validation (react-hook-form integration) |

### Theme Configuration

```typescript
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        // Environment colors
        'env-dev': {
          DEFAULT: '#F59E0B', // amber-500
          light: '#FEF3C7',   // amber-100
          dark: '#B45309',    // amber-700
        },
        'env-prod': {
          DEFAULT: '#DC2626', // red-600
          light: '#FEE2E2',   // red-100
          dark: '#991B1B',    // red-800
        },
        // Brand colors
        primary: {
          DEFAULT: '#7C3AED', // violet-600 (Kalam purple)
          // ... shades
        },
      },
    },
  },
}
```

### CSS Variables (for shadcn/ui)

```css
/* app/globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 262.1 83.3% 57.8%;       /* violet-600 */
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 262.1 83.3% 57.8%;
    --radius: 0.5rem;
  }
}
```

---

## Component Migration Plan

### Current Duplication Analysis

| Pattern | Current Files | Occurrences | New Component |
|---------|--------------|-------------|---------------|
| Primary button | Inline | 30+ | `<Button>` |
| Secondary button | Inline | 20+ | `<Button variant="outline">` |
| Danger button | Inline | 7 | `<Button variant="destructive">` |
| Text input | `FormField.tsx` | 35+ | `<Input>` |
| Textarea | `FormField.tsx` | 15+ | `<Textarea>` |
| Select dropdown | `FormField.tsx` | 20+ | `<Select>` |
| Modal | `Modal.tsx` | 10+ | `<Dialog>` |
| Confirm modal | `ConfirmModal.tsx`, `ConfirmationModal.tsx` | 2 | `<AlertDialog>` |
| Search input | `AssetSearchBar.tsx`, `AudioSearchBar.tsx` | 2 | `<SearchInput>` |
| Category filter | `AssetCategoryFilter.tsx`, `AudioCategoryFilter.tsx` | 2 | `<ToggleGroup>` |
| Media card | `AssetCard.tsx`, `AudioCard.tsx`, `WordCard.tsx` | 3 | `<MediaCard>` |
| Media grid | `AssetGrid.tsx`, `AudioGrid.tsx`, `WordGrid.tsx` | 3 | `<MediaGrid>` |
| Upload modal | `AssetUploadModal.tsx`, `AudioUploadModal.tsx` | 2 | `<UploadDialog>` |
| Loading spinner | Inline | 15+ | `<Skeleton>` |
| Empty state | Inline | 12+ | `<EmptyState>` |

### Migration Priority

**Phase 1: Foundation** (Week 1)
- [ ] Set up shadcn/ui CLI
- [ ] Configure theme (colors, radius, fonts)
- [ ] Install base components: Button, Input, Textarea, Select, Checkbox
- [ ] Install Dialog, AlertDialog, Sheet
- [ ] Install Card, Badge, Tooltip
- [ ] Install Skeleton, Toast (sonner already installed)
- [ ] Create `<EnvironmentBanner>` component

**Phase 2: Consolidation** (Week 1-2)
- [ ] Create `<SearchInput>` (combines Asset/AudioSearchBar)
- [ ] Create `<CategoryFilter>` (combines Asset/AudioCategoryFilter)
- [ ] Create `<MediaCard>` (combines Asset/Audio/WordCard)
- [ ] Create `<MediaGrid>` (combines Asset/Audio/WordGrid)
- [ ] Create `<UploadDialog>` (combines Asset/AudioUploadModal)
- [ ] Create `<ConfirmDialog>` (replaces ConfirmModal, ConfirmationModal)
- [ ] Create `<EmptyState>` (standardize empty states)
- [ ] Create `<FormField>` wrapper (shadcn form + label + hint)

**Phase 3: Page Redesign** (Week 2-3)
- [ ] Redesign dashboard layout with prominent environment indicator
- [ ] Redesign Assets page using new components
- [ ] Redesign Audio page using new components
- [ ] Redesign Words page using new components
- [ ] Redesign Curricula list page
- [ ] Redesign Curriculum editor (tree view)
- [ ] Redesign Activity form modal (wizard flow)

**Phase 4: Polish** (Week 3-4)
- [ ] Add activity type visual picker
- [ ] Add activity preview panel
- [ ] Add undo support for deletions
- [ ] Add keyboard shortcuts
- [ ] Add contextual help tooltips
- [ ] Accessibility audit

---

## New Component Library

### Base Components (from shadcn/ui)

Located in `components/ui/` - installed via shadcn CLI.

### Custom Components

Located in `components/shared/` - built on top of shadcn/ui.

#### EnvironmentBanner

```typescript
// components/shared/environment-banner.tsx

interface EnvironmentBannerProps {
  environment: 'dev' | 'prod';
  onSwitch: () => void;
}

// Sticky banner at top of dashboard
// DEV: Amber background, subtle
// PROD: Red background, warning icon, "Changes affect live users"
```

#### MediaCard

```typescript
// components/shared/media-card.tsx

interface MediaCardProps {
  type: 'image' | 'audio' | 'word';
  id: string;
  name: string;
  previewUrl?: string;
  tags?: string[];
  category?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  // Audio-specific
  duration?: number;
  onPlay?: () => void;
  isPlaying?: boolean;
}

// Unified card for all media types
// Visual differences based on type
// Consistent selection, delete, hover behaviors
```

#### MediaGrid

```typescript
// components/shared/media-grid.tsx

interface MediaGridProps<T> {
  items: T[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  emptyIcon?: string;
  selectedId?: string;
  onSelect?: (item: T) => void;
  onDelete?: (id: string) => void;
  selectable?: boolean;
  deletable?: boolean;
  renderCard: (item: T, props: CardProps) => React.ReactNode;
}

// Generic grid with loading, error, empty states
// Consistent responsive breakpoints
```

#### SearchInput

```typescript
// components/shared/search-input.tsx

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  loading?: boolean;
}

// Search icon, clear button, debounced onChange
// Loading spinner when searching
```

#### CategoryFilter

```typescript
// components/shared/category-filter.tsx

interface CategoryFilterProps<T extends string> {
  categories: Array<{ value: T; label: string; icon?: string; count?: number }>;
  selected?: T;
  onChange: (value: T | undefined) => void;
  color?: 'blue' | 'purple' | 'green';
}

// Horizontal scrollable tabs
// "All" option + category options
// Pill style with counts
```

#### ActivityTypePicker

```typescript
// components/shared/activity-type-picker.tsx

interface ActivityTypePickerProps {
  value?: string;
  onChange: (type: string) => void;
}

// Visual grid of activity types
// Icons, labels, descriptions
// Categorized: Introduction, Writing, Tap, Drag, etc.
// Search/filter capability
```

#### ActivityWizard

```typescript
// components/curriculum/activity-wizard.tsx

// Step 1: Choose activity type (visual picker)
// Step 2: Configure activity (type-specific form)
// Step 3: Preview (phone mockup)
// Step 4: Confirm & save

// Progress indicator at top
// Back/Next navigation
// Save at any step (with validation)
```

#### FormField (Enhanced)

```typescript
// components/shared/form-field.tsx

interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  tooltip?: string;  // NEW: contextual help
  children: React.ReactNode;
}

// Label with optional required indicator
// Hint text below
// Error state
// Tooltip icon with help text
```

---

## Page-by-Page Redesign

### Login Page

**Current**: Simple form with DEV/PROD toggle

**Redesign**:
- Larger, more prominent environment selector
- Environment description ("DEV: Safe for testing", "PROD: Live data")
- Company branding
- Remember last environment choice

### Dashboard Layout

**Current**: Collapsible sidebar, small env indicator at bottom

**Redesign**:
```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️  PRODUCTION MODE                          [Switch to DEV →] │
└─────────────────────────────────────────────────────────────────┘
┌────────┬────────────────────────────────────────────────────────┐
│        │                                                        │
│  Logo  │  Page Content                                          │
│        │                                                        │
│ ────── │                                                        │
│        │                                                        │
│ Curric │                                                        │
│ Books  │                                                        │
│ Assets │                                                        │
│ Audio  │                                                        │
│ Words  │                                                        │
│ Codes  │                                                        │
│        │                                                        │
│ ────── │                                                        │
│        │                                                        │
│ User   │                                                        │
│        │                                                        │
└────────┴────────────────────────────────────────────────────────┘
```

- Sticky environment banner (PROD only, or subtle for DEV)
- Sidebar always shows current section
- Breadcrumb navigation for deep pages
- User menu with environment info

### Assets/Audio/Words Pages

**Current**: Separate but nearly identical implementations

**Redesign**:
- Unified `MediaLibraryPage` component
- Consistent layout:
  ```
  ┌─────────────────────────────────────────────────────────────┐
  │  📦 Asset Library                              [+ Upload]   │
  │  Upload once, use everywhere                                │
  ├─────────────────────────────────────────────────────────────┤
  │  [🔍 Search...]                                             │
  │                                                             │
  │  [All] [Letters] [Animals] [Fruits] [Colors] [Shapes]  →   │
  ├─────────────────────────────────────────────────────────────┤
  │                                                             │
  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
  │  │     │ │     │ │     │ │     │ │     │ │     │          │
  │  │ 🍎  │ │ 🐱  │ │ أ   │ │ 🔵  │ │ 🌟  │ │ ... │          │
  │  │     │ │     │ │     │ │     │ │     │ │     │          │
  │  │Apple│ │ Cat │ │Alif │ │Blue │ │Star │ │     │          │
  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘          │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
  ```

### Curriculum Editor

**Current**: Three-panel list view OR tree view

**Redesign**:
- Default to tree view (more intuitive)
- Improved tree visualization:
  ```
  📚 Curriculum: Arabic Letters Level 1
  │
  ├─ 📖 Topic: Letter Alif (أ)
  │   ├─ 🎬 Introduction
  │   │   ├─ Show Letter
  │   │   └─ Play Sound
  │   ├─ 📝 Lesson 1
  │   │   ├─ Trace Letter
  │   │   ├─ Find Letter
  │   │   └─ Build Word
  │   └─ 🎯 Practice
  │       └─ Multiple Choice
  │
  └─ 📖 Topic: Letter Ba (ب)
      └─ ...
  ```
- Click to expand/collapse
- Drag to reorder
- Right-click context menu
- Inline quick actions (add, edit, delete)

### Activity Form

**Current**: Long scrolling form in modal

**Redesign**: Multi-step wizard

```
Step 1: Choose Type
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│     أ       │ │    👆      │ │     ✏️      │
│  Show       │ │   Find     │ │   Write     │
│  Letter     │ │   Letter   │ │   Letter    │
│             │ │            │ │             │
│ Display a   │ │ Tap the    │ │ Trace the   │
│ letter or   │ │ target     │ │ letter      │
│ word        │ │ letter     │ │ shape       │
└─────────────┘ └─────────────┘ └─────────────┘

[Cancel]                          [Next: Configure →]
```

```
Step 2: Configure
━━━━━━━━○━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────┐
│                                             │
│  Instruction (English) *                    │
│  ┌─────────────────────────────────────┐   │
│  │ Find the letter ب in the word       │   │
│  └─────────────────────────────────────┘   │
│  [🔊 Generate Audio]                        │
│                                             │
│  Target Word *                              │
│  ┌─────────────────────────────────────┐   │
│  │ كلب                                 │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Target Letter *                            │
│  [ك] [ل] [ب] ← Click letter in word        │
│        ↑ selected                           │
│                                             │
└─────────────────────────────────────────────┘

[← Back]                        [Next: Preview →]
```

```
Step 3: Preview
━━━━━━━━━━━━━━○━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────┐
│                                             │
│     📱 How it looks in the app              │
│                                             │
│     ┌───────────────────────────┐          │
│     │                           │          │
│     │   🔊 "Find the letter ب"  │          │
│     │                           │          │
│     │       ك   ل   ب          │          │
│     │                           │          │
│     │                           │          │
│     └───────────────────────────┘          │
│                                             │
└─────────────────────────────────────────────┘

[← Back]                     [Create Activity ✓]
```

---

## Implementation Phases

### Phase 1: Foundation (3-4 days)

**Goal**: Set up shadcn/ui and create base components

**Tasks**:
1. Initialize shadcn/ui: `npx shadcn@latest init`
2. Install base components (button, input, dialog, etc.)
3. Configure theme colors (brand purple, env amber/red)
4. Create `<EnvironmentBanner>`
5. Create enhanced `<FormField>`
6. Test with one existing page (Assets)

**Success Criteria**: Assets page works with new button/input components

### Phase 2: Component Consolidation (4-5 days)

**Goal**: Replace duplicated components with unified versions

**Tasks**:
1. Create `<MediaCard>` (unified asset/audio/word card)
2. Create `<MediaGrid>` (unified grid with states)
3. Create `<SearchInput>` (with debounce)
4. Create `<CategoryFilter>` (tab-style filter)
5. Create `<UploadDialog>` (unified upload modal)
6. Create `<ConfirmDialog>` (unified confirmation)
7. Migrate Assets page completely
8. Migrate Audio page completely
9. Migrate Words page completely

**Success Criteria**: All three media pages use shared components

### Phase 3: Layout & Navigation (3-4 days)

**Goal**: Redesign dashboard layout with prominent environment awareness

**Tasks**:
1. Redesign `(dashboard)/layout.tsx`
2. Add sticky environment banner
3. Improve sidebar navigation
4. Add breadcrumb navigation
5. Redesign login page
6. Add keyboard shortcuts (Cmd+K for search)

**Success Criteria**: User always knows which environment they're in

### Phase 4: Curriculum Editor (5-6 days)

**Goal**: Improve curriculum editing experience

**Tasks**:
1. Create `<ActivityTypePicker>` (visual grid)
2. Create `<ActivityWizard>` (step-by-step flow)
3. Create `<ActivityPreview>` (phone mockup)
4. Redesign tree view with better visuals
5. Add context menus for tree items
6. Add undo support for deletions
7. Improve drag-and-drop feedback

**Success Criteria**: Creating an activity is intuitive for non-technical users

### Phase 5: Polish & Testing (3-4 days)

**Goal**: Refine UX and ensure quality

**Tasks**:
1. Add tooltips for all complex fields
2. Improve error messages
3. Add loading skeletons everywhere
4. Accessibility audit (keyboard nav, screen readers)
5. Performance optimization
6. User testing with curriculum authors
7. Bug fixes based on feedback

**Success Criteria**: Curriculum authors can use dashboard without developer help

---

## File Structure

### New Structure After Redesign

```
components/
  ui/                          # shadcn/ui components (auto-generated)
    button.tsx
    input.tsx
    textarea.tsx
    select.tsx
    checkbox.tsx
    dialog.tsx
    alert-dialog.tsx
    sheet.tsx
    tabs.tsx
    card.tsx
    badge.tsx
    tooltip.tsx
    skeleton.tsx
    command.tsx
    dropdown-menu.tsx
    form.tsx
    
  shared/                      # Custom shared components
    environment-banner.tsx
    search-input.tsx
    category-filter.tsx
    media-card.tsx
    media-grid.tsx
    upload-dialog.tsx
    confirm-dialog.tsx
    empty-state.tsx
    form-field.tsx
    page-header.tsx
    
  curriculum/                  # Curriculum-specific components
    activity-type-picker.tsx
    activity-wizard.tsx
    activity-preview.tsx
    curriculum-tree.tsx
    topic-card.tsx
    node-card.tsx
    activity-card.tsx
    letter-picker.tsx          # Redesigned Arabic letter picker
    word-picker.tsx
    
  curriculum/forms/            # Activity form components (keep, refactor)
    index.tsx
    [activity-type]-form.tsx   # 28 activity type forms
    shared/                    # Shared form pieces
    
  layout/                      # Layout components
    sidebar.tsx
    breadcrumbs.tsx
    user-menu.tsx
    
  ai/                          # AI-specific components (keep)
    ai-effects.tsx
    ai-button.tsx
    generate-topic-modal.tsx
```

### Files to Delete After Migration

```
components/ui/ConfirmModal.tsx       # → alert-dialog
components/ui/ConfirmationModal.tsx  # → alert-dialog
components/ui/Modal.tsx              # → dialog
components/assets/AssetSearchBar.tsx # → shared/search-input
components/audio/AudioSearchBar.tsx  # → shared/search-input
components/assets/AssetCategoryFilter.tsx # → shared/category-filter
components/audio/AudioCategoryFilter.tsx  # → shared/category-filter
components/assets/AssetUploadModal.tsx    # → shared/upload-dialog
components/audio/AudioUploadModal.tsx     # → shared/upload-dialog
```

---

## Testing Strategy

### Overview

The current codebase has minimal tests. As part of this redesign, we'll add comprehensive testing:

| Test Type | Tool | Coverage Target |
|-----------|------|-----------------|
| Unit Tests | Vitest + Testing Library | 80% for components |
| Integration Tests | Vitest + Testing Library | Critical user flows |
| E2E Tests | Playwright | Login, CRUD, env switching |

**See `REDESIGN_IMPLEMENTATION.md` for detailed test setup and examples.**

### Key Testing Priorities

1. **Environment awareness** - Verify DEV vs PROD behavior differences
2. **Component interactions** - Button clicks, form submissions, selections
3. **Loading/Error states** - Graceful handling of async operations
4. **Accessibility** - Keyboard navigation, screen reader support

---

## Testing Checklist

### Functional Testing

- [ ] Login with OTP works for both DEV and PROD
- [ ] Environment switch requires re-auth if no session
- [ ] Query cache clears on environment switch
- [ ] All CRUD operations work (create, read, update, delete)
- [ ] Drag and drop reordering works
- [ ] File upload works (images, audio)
- [ ] AI topic generation works
- [ ] TTS audio generation works
- [ ] Activity preview shows correct data

### Environment Testing

- [ ] DEV indicator is visible but subtle
- [ ] PROD indicator is prominent and clear
- [ ] Confirmation dialogs appear for PROD destructive actions
- [ ] Cannot accidentally bulk delete in PROD
- [ ] Session persists correctly per environment

### Accessibility Testing

- [ ] All interactive elements are keyboard accessible
- [ ] Focus states are visible
- [ ] Screen reader announces important changes
- [ ] Color contrast meets WCAG AA
- [ ] Modals trap focus correctly
- [ ] Error messages are announced

### User Experience Testing

- [ ] Non-technical user can create an activity without help
- [ ] User always knows which environment they're in
- [ ] Loading states are clear
- [ ] Error messages are understandable
- [ ] Undo works for accidental deletions
- [ ] Activity preview matches actual app behavior

---

## Appendix

### A. Activity Types Reference

| Type | Label | Category |
|------|-------|----------|
| `show_letter_or_word` | Show Letter/Word | Introduction |
| `tap_letter_in_word` | Find Letter in Word | Tap |
| `trace_letter` | Trace Letter | Writing |
| `pop_balloons_with_letter` | Pop Balloons | Tap |
| `break_time_minigame` | Break Time | Misc |
| `build_word_from_letters` | Build Word | Drag |
| `multiple_choice_question` | Multiple Choice | Tap |
| `drag_items_to_target` | Drag to Target | Drag |
| `catch_fish_with_letter` | Catch Fish | Catch |
| `add_pizza_toppings_with_letter` | Pizza Toppings | Feeding |
| ... | (37+ total) | ... |

### B. Arabic Letter Forms

Each Arabic letter has 4 forms:
- **Isolated**: ب (standalone)
- **Initial**: بـ (start of word)
- **Medial**: ـبـ (middle of word)
- **Final**: ـب (end of word)

The letter picker must support selecting specific forms.

### C. Localization Structure

All user-facing text uses:
```typescript
interface LocalizedText {
  en: string;        // English (required)
  ar?: string;       // Arabic (optional)
  audio_url?: string; // TTS audio URL
}
```

### D. API Error Codes

| Error | Meaning | User Message |
|-------|---------|--------------|
| `NOT_AUTHENTICATED_FOR_ENV` | No session for environment | "Please sign in to {env}" |
| `HTTP 401` | Token expired | "Session expired. Please sign in again." |
| `HTTP 403` | No permission | "You don't have permission for this action." |
| `HTTP 404` | Not found | "{resource} not found." |
| `HTTP 500` | Server error | "Something went wrong. Please try again." |

---

## Getting Started

1. Read this entire document
2. Run the existing dashboard locally: `npm run dev`
3. Explore the current UI to understand user flows
4. Start with Phase 1: shadcn/ui setup
5. Test each component as you build it
6. Commit frequently with descriptive messages

**Questions?** Check the existing code in these key files:
- `lib/stores/environmentStore.ts` - Environment management
- `lib/supabase/client.ts` - Supabase client setup
- `lib/api/curricula.ts` - API patterns
- `components/curriculum/forms/index.tsx` - Activity form registry
