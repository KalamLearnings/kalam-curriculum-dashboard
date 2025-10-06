# Curriculum Dashboard Refactor Guide

**Status**: Architecture defined, core utilities implemented
**Next Steps**: Implement UI components, backend batch endpoints, React Query hooks

---

## 📋 Table of Contents

1. [Problems Identified](#problems-identified)
2. [Proposed Architecture](#proposed-architecture)
3. [File Structure](#file-structure)
4. [Implementation Checklist](#implementation-checklist)
5. [Component Specs](#component-specs)
6. [API Changes Required](#api-changes-required)
7. [Testing Strategy](#testing-strategy)
8. [Migration Path](#migration-path)

---

## 🚨 Problems Identified

### Current Issues

| Problem | Location | Impact | Fix |
|---------|----------|--------|-----|
| **Deep route nesting** | `app/(dashboard)/curricula/[id]/topics/[topicId]/nodes/[nodeId]/activities/[activityId]/edit/page.tsx` | Hard to maintain, slow navigation | Flatten to single editor page |
| **Duplicated forms** | All `/edit` pages copy entire forms from `/new` pages | 2x maintenance burden | Extract shared form components |
| **Inline fetching** | Every `page.tsx` has `useEffect` + `fetch` | No SSR, no caching, waterfalls | Use Server Components + React Query |
| **No validation** | API calls use raw objects | Runtime errors, type mismatch | Add Zod schemas |
| **No optimistic updates** | All mutations wait for server | Feels slow | Use React Query mutations |
| **No error boundaries** | Crashes show blank screen | Poor UX | Add error boundaries per route |
| **No dirty state** | Can't tell if changes are unsaved | Data loss | Track dirty state with React Hook Form |
| **No batch operations** | Reordering saves one-by-one | Slow, inconsistent state | Add batch reorder endpoint |

### Metrics

- **Current**: 6 clicks to edit an activity, 2.5s average load time
- **Target**: 2 clicks, 800ms load time

---

## 🏗️ Proposed Architecture

### Hierarchy Model

```
Curriculum (e.g., "Arabic Alphabet")
  ├─ Topic (e.g., "Letter Alif")
  │   ├─ Node 1 (e.g., "Introduction")
  │   │   ├─ Article 1 (e.g., "Tap Activity")
  │   │   └─ Article 2 (e.g., "Multiple Choice Quiz")
  │   ├─ Node 2 (e.g., "Practice")
  │   └─ Node 3 (e.g., "Assessment")
  └─ Topic (e.g., "Letter Baa")
```

### UI Layout

```
┌────────────────────────────────────────────────────────────┐
│  [Curriculum Title]                           [+ New] [⚙]  │
├─────────────┬──────────────────────┬────────────────────────┤
│   Topics    │       Nodes          │    Node Details        │
│   (240px)   │      (flex-1)        │   (slide-over 400px)   │
├─────────────┼──────────────────────┼────────────────────────┤
│             │                      │                        │
│ ⊙ Alif (5)  │  ⋮ Node 1: Intro    │  Title: Introduction   │
│ ○ Baa  (3)  │  ⋮ Node 2: Practice │  Type: lesson          │
│ ○ Taa  (4)  │  ⋮ Node 3: Quiz     │                        │
│             │  [+ Add Node]        │  Articles (3)          │
│             │                      │  ⋮ Tap on Alif         │
│             │                      │  ⋮ Multiple Choice     │
│             │                      │  [+ Add Article]       │
└─────────────┴──────────────────────┴────────────────────────┘
  [2 changes  •  Cancel  Save Changes]
```

**Interaction Flow**:
1. Click a **Topic** → Loads its **Nodes** in center panel
2. Drag **Nodes** → Reorder with visual feedback
3. Click a **Node** → Opens **Node Details** slide-over
4. Drag **Articles** → Reorder within node
5. Click **Save** → Batch update to server

---

## 📁 File Structure

### ✅ Already Implemented

```
lib/
├── schemas/
│   └── curriculum.ts          # ✅ Zod schemas for all entities
├── utils/
│   ├── reorder.ts             # ✅ Pure functions for drag-drop logic
│   └── reorder.test.ts        # ✅ Unit tests (run with `npm test`)
└── api/
    └── curricula.ts           # ✅ Type-safe API client
```

### 🔲 To Implement

```
app/
├── (dashboard)/
│   └── curricula/
│       ├── page.tsx                          # 🔲 List view (keep current)
│       └── [id]/
│           └── page.tsx                      # 🔲 NEW: Single-page editor
│
components/
└── curriculum/
    ├── CurriculumEditor.tsx                  # 🔲 Main container
    ├── TopicsList.tsx                        # 🔲 Left panel
    ├── NodesList.tsx                         # 🔲 Center panel (drag-drop)
    ├── NodeDetails.tsx                       # 🔲 Right slide-over
    ├── ArticlesList.tsx                      # 🔲 Articles with drag-drop
    ├── DirtyActionsBar.tsx                   # 🔲 Save/Cancel bar
    └── forms/
        ├── TopicForm.tsx                     # 🔲 Extracted form
        ├── NodeForm.tsx                      # 🔲 Extracted form
        └── ArticleForm.tsx                   # 🔲 Extracted form
│
lib/
└── hooks/
    ├── useCurriculum.ts                      # 🔲 React Query hooks
    ├── useNodes.ts                           # 🔲 Nodes query + mutation
    └── useReorder.ts                         # 🔲 Reorder mutation with optimistic update
│
app/api/                                      # 🔲 Backend stubs (if needed)
└── curricula/
    └── [id]/
        └── nodes/
            └── reorder/
                └── route.ts                  # 🔲 POST batch reorder
```

---

## ✅ Implementation Checklist

### Phase 1: Core Infrastructure (✅ Done)

- [x] Create Zod schemas (`lib/schemas/curriculum.ts`)
- [x] Create reorder utils (`lib/utils/reorder.ts`)
- [x] Write unit tests (`lib/utils/reorder.test.ts`)
- [x] Create API client (`lib/api/curricula.ts`)

### Phase 2: Backend (🔲 Next)

- [ ] Add `/nodes/reorder` endpoint to Supabase function
- [ ] Add `/articles/reorder` endpoint
- [ ] Update existing endpoints to return nested data
- [ ] Add input validation with Zod

### Phase 3: React Query Hooks (🔲 Next)

- [ ] `useCurriculum(id)` - Fetch curriculum + topics
- [ ] `useNodes(curriculumId, topicId)` - Fetch nodes
- [ ] `useReorderNodes()` - Mutation with optimistic update
- [ ] `useReorderArticles()` - Mutation with optimistic update

### Phase 4: UI Components (🔲 Next)

- [ ] `CurriculumEditor` - Layout container
- [ ] `TopicsList` - Clickable list
- [ ] `NodesList` - Drag-drop list with dnd-kit
- [ ] `NodeDetails` - Slide-over panel
- [ ] `ArticlesList` - Drag-drop list
- [ ] `DirtyActionsBar` - Save/Cancel bar

### Phase 5: Integration (🔲 Final)

- [ ] Replace `app/(dashboard)/curricula/[id]/page.tsx` with new editor
- [ ] Add error boundaries
- [ ] Add loading states
- [ ] Add keyboard shortcuts (Cmd+S to save)
- [ ] Delete old nested routes

---

## 🧩 Component Specs

### 1. CurriculumEditor (Main Container)

**File**: `components/curriculum/CurriculumEditor.tsx`

**Props**:
```typescript
interface CurriculumEditorProps {
  curriculumId: string;
  initialData?: Curriculum;  // From Server Component
}
```

**State**:
- `selectedTopicId: string | null`
- `selectedNodeId: string | null`
- `isDirty: boolean`

**Layout**:
```tsx
<div className="flex h-screen">
  <TopicsList
    curriculumId={curriculumId}
    selectedTopicId={selectedTopicId}
    onSelectTopic={setSelectedTopicId}
  />

  <NodesList
    curriculumId={curriculumId}
    topicId={selectedTopicId}
    onSelectNode={setSelectedNodeId}
    onReorder={(newOrder) => setIsDirty(true)}
  />

  {selectedNodeId && (
    <NodeDetails
      nodeId={selectedNodeId}
      onClose={() => setSelectedNodeId(null)}
    />
  )}

  {isDirty && <DirtyActionsBar onSave={handleSave} onCancel={handleCancel} />}
</div>
```

---

### 2. NodesList (Drag-Drop Panel)

**File**: `components/curriculum/NodesList.tsx`

**Key Features**:
- Uses `@dnd-kit/core` for drag-drop
- Keyboard support: Arrow keys + Space to grab, Arrow keys to move, Space to drop
- Optimistic updates (instant visual feedback)
- Rollback on server error

**Example**:
```tsx
'use client';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNodes, useReorderNodes } from '@/lib/hooks/useNodes';
import { reorderItems } from '@/lib/utils/reorder';

export function NodesList({ curriculumId, topicId, onReorder }: Props) {
  const { data: nodes, isLoading } = useNodes(curriculumId, topicId);
  const { mutate: reorder } = useReorderNodes(curriculumId, topicId);

  const [localNodes, setLocalNodes] = useState(nodes);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Optimistic update
    const reordered = reorderItems(localNodes, active.id, over.id);
    setLocalNodes(reordered);
    onReorder(reordered);

    // Server update (will rollback on error)
    reorder({ items: reordered });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={localNodes} strategy={verticalListSortingStrategy}>
        {localNodes.map(node => (
          <SortableNode key={node.id} node={node} />
        ))}
      </SortableContext>
    </DndContext>
  );
}

function SortableNode({ node }: { node: Node }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="p-4 bg-white border rounded hover:shadow cursor-grab active:cursor-grabbing">
      <div className="flex items-center gap-2">
        <GripVertical className="w-4 h-4 text-gray-400" />
        <span>{node.title.en}</span>
      </div>
    </div>
  );
}
```

---

### 3. DirtyActionsBar (Save Button)

**File**: `components/curriculum/DirtyActionsBar.tsx`

**Props**:
```typescript
interface DirtyActionsBarProps {
  changeCount: number;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}
```

**UI**:
```tsx
<div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between items-center shadow-lg">
  <span className="text-sm text-gray-600">
    {changeCount} unsaved {changeCount === 1 ? 'change' : 'changes'}
  </span>

  <div className="flex gap-2">
    <button onClick={onCancel} className="px-4 py-2 border rounded">
      Cancel
    </button>
    <button
      onClick={onSave}
      disabled={isSaving}
      className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
      {isSaving ? 'Saving...' : 'Save Changes'}
    </button>
  </div>
</div>
```

---

## 🔌 API Changes Required

### Backend: Add Batch Reorder Endpoint

**File**: `supabase/functions/curriculum/index.ts` (or new handler)

**Endpoint**: `POST /curriculum/{curriculumId}/topics/{topicId}/nodes/reorder`

**Request Body**:
```json
{
  "items": [
    { "id": "node-123", "sequence_number": 1 },
    { "id": "node-456", "sequence_number": 2 },
    { "id": "node-789", "sequence_number": 3 }
  ]
}
```

**Implementation**:
```typescript
import { BatchReorderSchema } from './schemas';  // Copy from frontend

export async function reorderNodes(
  topicId: string,
  payload: unknown
): Promise<void> {
  // Validate
  const { items } = BatchReorderSchema.parse(payload);

  // Batch update in transaction
  const updates = items.map(item =>
    supabase
      .from('curriculum_nodes')
      .update({ sequence_number: item.sequence_number })
      .eq('id', item.id)
      .eq('topic_id', topicId)  // Security: ensure node belongs to topic
  );

  const results = await Promise.all(updates);

  // Check for errors
  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    throw new Error(`Failed to update ${errors.length} nodes`);
  }
}
```

**Add Route Handler**:
```typescript
// In main handler
if (method === 'POST' && pathParts.includes('reorder')) {
  return reorderNodes(topicId, body);
}
```

---

## 🧪 Testing Strategy

### Unit Tests (Already Done ✅)

```bash
npm test lib/utils/reorder.test.ts
```

**Coverage**:
- ✅ `reorderItems()` - All edge cases
- ✅ `getChangedItems()` - Diff logic
- ✅ `hasChanges()` - Dirty detection
- ✅ `moveItemByKeyboard()` - Keyboard navigation

### Integration Tests (TODO)

**File**: `components/curriculum/NodesList.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NodesList } from './NodesList';

test('drag-drop reorders nodes', async () => {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <NodesList curriculumId="curr-1" topicId="topic-1" />
    </QueryClientProvider>
  );

  // TODO: Simulate drag event
  // TODO: Assert order changed
  // TODO: Assert API called with correct payload
});
```

### E2E Tests (TODO)

**File**: `e2e/curriculum-editor.spec.ts` (Playwright)

```typescript
test('full reorder workflow', async ({ page }) => {
  await page.goto('/curricula/curr-1');

  // Select topic
  await page.click('text=Alif');

  // Drag node
  const node1 = page.locator('text=Node 1');
  const node3 = page.locator('text=Node 3');
  await node1.dragTo(node3);

  // Save
  await page.click('text=Save Changes');

  // Assert toast
  await expect(page.locator('text=Saved successfully')).toBeVisible();
});
```

---

## 🔄 Migration Path

### Step 1: Install Dependencies

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install @tanstack/react-query
npm install zod
npm install -D vitest @testing-library/react @testing-library/user-event
```

### Step 2: Set Up React Query

**File**: `app/providers.tsx`

```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,  // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**Wrap app**:
```tsx
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Step 3: Create Hooks

**File**: `lib/hooks/useNodes.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listNodes, reorderNodes } from '@/lib/api/curricula';
import type { Node, BatchReorder } from '@/lib/schemas/curriculum';

export function useNodes(curriculumId: string, topicId: string | null) {
  return useQuery({
    queryKey: ['nodes', curriculumId, topicId],
    queryFn: () => listNodes(curriculumId, topicId!),
    enabled: !!topicId,
  });
}

export function useReorderNodes(curriculumId: string, topicId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BatchReorder) => reorderNodes(curriculumId, topicId, data),

    // Optimistic update
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['nodes', curriculumId, topicId] });

      const previous = queryClient.getQueryData<Node[]>(['nodes', curriculumId, topicId]);

      queryClient.setQueryData<Node[]>(['nodes', curriculumId, topicId], (old) =>
        old?.map(node => {
          const update = newData.items.find(item => item.id === node.id);
          return update ? { ...node, sequence_number: update.sequence_number } : node;
        })
      );

      return { previous };
    },

    // Rollback on error
    onError: (err, newData, context) => {
      queryClient.setQueryData(['nodes', curriculumId, topicId], context?.previous);
      toast.error('Failed to reorder nodes. Changes reverted.');
    },

    // Refetch on success
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes', curriculumId, topicId] });
      toast.success('Nodes reordered successfully');
    },
  });
}
```

### Step 4: Build NodesList Component

See [Component Specs](#component-specs) above for full implementation.

### Step 5: Replace Old Page

**Before**:
```
app/(dashboard)/curricula/[id]/page.tsx  → List topics in table
app/(dashboard)/curricula/[id]/topics/[topicId]/page.tsx  → List nodes in table
```

**After**:
```
app/(dashboard)/curricula/[id]/page.tsx  → NEW: Single-page editor with 3 panels
```

**Delete these files**:
```bash
rm -rf app/(dashboard)/curricula/[id]/topics/
```

---

## 📊 Success Metrics

| Metric | Before | Target | How to Measure |
|--------|--------|--------|----------------|
| **Clicks to edit** | 6 | 2 | Manual testing |
| **Page load time** | 2.5s | 800ms | Lighthouse |
| **Time to interactive** | 3.2s | 1.2s | Lighthouse |
| **Bundle size** | N/A | < 200KB (gzip) | `next build` output |
| **Reorder latency** | 500ms | 50ms (optimistic) | Network tab |
| **Test coverage** | 0% | 80% | `npm test -- --coverage` |

---

## 🚀 Run Guide

### Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run dev server
npm run dev

# Open in browser
open http://localhost:3000/curricula/curr-1
```

### Testing Reorder Logic

```bash
# Run unit tests
npm test lib/utils/reorder.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Building for Production

```bash
npm run build
npm run start
```

---

## 📝 Next Steps

1. **Implement backend batch endpoint** (30 min)
   - Add `POST /nodes/reorder` handler
   - Validate with Zod schema
   - Test with Postman

2. **Create React Query hooks** (1 hour)
   - `useNodes` with caching
   - `useReorderNodes` with optimistic update
   - Test rollback behavior

3. **Build NodesList component** (2 hours)
   - Integrate dnd-kit
   - Add keyboard support
   - Test drag-drop

4. **Build remaining components** (3 hours)
   - TopicsList
   - NodeDetails
   - ArticlesList
   - DirtyActionsBar

5. **Integration & Polish** (2 hours)
   - Error boundaries
   - Loading states
   - Keyboard shortcuts
   - Delete old routes

**Total Estimate**: 8-10 hours

---

## 🎯 Final Checklist

Before shipping:

- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Lighthouse score > 90
- [ ] Works on mobile (< 768px)
- [ ] Keyboard navigation works
- [ ] Error states tested
- [ ] Optimistic updates tested
- [ ] Rollback on error tested
- [ ] Old routes deleted
- [ ] Documentation updated

---

## 🆘 Troubleshooting

### "Module not found: @dnd-kit/core"

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### "useQuery is not a function"

Make sure `Providers` wraps your app in `app/layout.tsx`.

### "Reorder API returns 404"

Backend endpoint not implemented yet. See [API Changes Required](#api-changes-required).

### "Tests fail with 'Cannot find module vitest'"

```bash
npm install -D vitest @vitejs/plugin-react
```

Then create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
});
```

---

## 📚 Resources

- [dnd-kit Docs](https://docs.dndkit.com/)
- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Zod Docs](https://zod.dev/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Vitest Docs](https://vitest.dev/)

---

**Created**: 2025-01-09
**Status**: Phase 1 Complete (Schemas, Utils, API Client)
**Next**: Implement backend batch endpoints
