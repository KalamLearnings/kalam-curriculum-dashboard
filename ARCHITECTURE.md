# Curriculum Dashboard Architecture

## Overview

This document describes the **proposed architecture** for the refactored curriculum dashboard. The current implementation has deep route nesting and duplicated logic. This refactor flattens the structure into a **single-page editor** with **three panels** and **drag-drop reordering**.

---

## Current State (Before Refactor)

```
app/(dashboard)/curricula/
├── page.tsx                                      # List all curricula
├── new/page.tsx                                  # Create curriculum form
├── [id]/
│   ├── page.tsx                                  # List topics (table)
│   ├── edit/page.tsx                             # ✅ NEW (just added)
│   └── topics/
│       ├── new/page.tsx                          # Create topic form
│       ├── [topicId]/
│       │   ├── page.tsx                          # List nodes (table)
│       │   ├── edit/page.tsx                     # Edit topic (duplicates new form)
│       │   └── nodes/
│       │       ├── new/page.tsx                  # Create node form
│       │       ├── [nodeId]/
│       │       │   ├── page.tsx                  # List activities (table)
│       │       │   ├── edit/page.tsx             # Edit node (duplicates new form)
│       │       │   └── activities/
│       │       │       ├── new/page.tsx          # Create activity form
│       │       │       └── [activityId]/
│       │       │           └── edit/page.tsx     # Edit activity (duplicates new form)
│       │       │           └── page.tsx          # Activity detail (unused)
```

**Problems**:
- 6-level deep routes (hard to navigate)
- Every `/edit` page duplicates the entire form from `/new`
- No drag-drop reordering
- No optimistic updates
- Fetch logic repeated in every `page.tsx`

---

## Proposed State (After Refactor)

```
app/(dashboard)/curricula/
├── page.tsx                        # List all curricula (SSR, unchanged)
└── [id]/
    └── page.tsx                    # 🎯 NEW: Single-page editor (CSR)

components/curriculum/
├── CurriculumEditor.tsx            # Main container (3-panel layout)
├── TopicsList.tsx                  # Left panel (clickable list)
├── NodesList.tsx                   # Center panel (drag-drop)
├── NodeDetails.tsx                 # Right panel (slide-over)
├── ArticlesList.tsx                # Inside NodeDetails (drag-drop)
├── DirtyActionsBar.tsx             # Bottom bar (Save/Cancel)
└── forms/
    ├── TopicForm.tsx               # Extracted form (shared by new/edit)
    ├── NodeForm.tsx                # Extracted form (shared by new/edit)
    └── ArticleForm.tsx             # Extracted form (shared by new/edit)

lib/
├── schemas/curriculum.ts           # ✅ Zod validation schemas
├── api/curricula.ts                # ✅ Type-safe API client
├── utils/reorder.ts                # ✅ Pure reorder functions
├── utils/reorder.test.ts           # ✅ Unit tests
└── hooks/
    ├── useCurriculum.ts            # React Query: fetch curriculum + topics
    ├── useNodes.ts                 # React Query: fetch/reorder nodes
    └── useArticles.ts              # React Query: fetch/reorder articles
```

**Benefits**:
- 1 route instead of 20+ routes
- Forms extracted (no duplication)
- Drag-drop with keyboard support
- Optimistic updates with rollback
- Testable pure functions

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. User visits /curricula/curr-123                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Server Component (page.tsx)                             │
│     - Fetches curriculum data via Server Action            │
│     - Passes initialData to Client Component                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  3. CurriculumEditor (Client Component)                     │
│     - Uses React Query to cache data                        │
│     - Manages selectedTopicId, selectedNodeId               │
│     - Tracks dirty state for unsaved changes                │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┬───────────────┐
         │                       │               │
         ▼                       ▼               ▼
┌──────────────┐     ┌───────────────┐   ┌──────────────┐
│ TopicsList   │     │  NodesList    │   │ NodeDetails  │
│              │     │               │   │              │
│ - Click topic│────▶│ - Drag nodes  │   │ - Edit node  │
│              │     │ - Mark dirty  │   │ - Drag arts  │
└──────────────┘     └───────┬───────┘   └──────┬───────┘
                             │                   │
                             │                   │
                             ▼                   ▼
                     ┌────────────────────────────────┐
                     │  DirtyActionsBar               │
                     │  - Disabled until dirty        │
                     │  - Click Save → Batch API call │
                     └────────────────────────────────┘
```

---

## Component Hierarchy

```
<Providers>  ← React Query, Toaster
  <RootLayout>
    <CurriculumEditor curriculumId="curr-123">

      {/* Left Panel (240px fixed) */}
      <TopicsList
        topics={topics}
        selectedId={selectedTopicId}
        onSelect={setSelectedTopicId}
      />

      {/* Center Panel (flex-1) */}
      <NodesList
        nodes={nodes}
        onReorder={(newOrder) => {
          setDirty(true);
          setPendingOrder(newOrder);
        }}
        onSelectNode={setSelectedNodeId}
      />

      {/* Right Panel (slide-over 400px) */}
      {selectedNodeId && (
        <NodeDetails
          nodeId={selectedNodeId}
          onClose={() => setSelectedNodeId(null)}
        >
          <ArticlesList
            articles={articles}
            onReorder={(newOrder) => {
              setDirty(true);
              setPendingArticleOrder(newOrder);
            }}
          />
        </NodeDetails>
      )}

      {/* Bottom Bar */}
      {isDirty && (
        <DirtyActionsBar
          changeCount={changes.length}
          onSave={handleBatchSave}
          onCancel={handleCancel}
        />
      )}

    </CurriculumEditor>
  </RootLayout>
</Providers>
```

---

## State Management Strategy

### Server State (React Query)

**Queries**:
- `useCurriculum(id)` → Fetch curriculum + topics
- `useNodes(curriculumId, topicId)` → Fetch nodes for a topic
- `useArticles(nodeId)` → Fetch articles for a node

**Mutations**:
- `useReorderNodes()` → POST `/nodes/reorder` with optimistic update
- `useReorderArticles()` → POST `/articles/reorder` with optimistic update
- `useCreateNode()` → POST `/nodes`
- `useUpdateNode()` → PUT `/nodes/{id}`
- `useDeleteNode()` → DELETE `/nodes/{id}`

**Cache Keys**:
```typescript
['curriculum', curriculumId]
['topics', curriculumId]
['nodes', curriculumId, topicId]
['articles', nodeId]
```

### Local State (React useState)

```typescript
const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
const [isDirty, setIsDirty] = useState(false);
const [pendingOrder, setPendingOrder] = useState<Node[]>([]);
```

**Dirty State Detection**:
```typescript
const isDirty = useMemo(() => {
  return hasChanges(originalNodes, pendingOrder);
}, [originalNodes, pendingOrder]);
```

---

## API Endpoints

### Existing Endpoints (Keep As-Is)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/curriculum/list` | List all curricula |
| GET | `/curriculum/{id}` | Get single curriculum |
| POST | `/curriculum` | Create curriculum |
| PUT | `/curriculum/{id}` | Update curriculum |
| DELETE | `/curriculum/{id}` | Delete curriculum |
| GET | `/curriculum/{id}/topics` | List topics |
| GET | `/curriculum/{id}/topics/{topicId}` | Get single topic |
| POST | `/curriculum/{id}/topics` | Create topic |
| PUT | `/curriculum/{id}/topics/{topicId}` | Update topic |
| DELETE | `/curriculum/{id}/topics/{topicId}` | Delete topic |
| GET | `/curriculum/{id}/topics/{topicId}/nodes` | List nodes |
| POST | `/curriculum/{id}/topics/{topicId}/nodes` | Create node |
| PUT | `/curriculum/{id}/topics/{topicId}/nodes/{nodeId}` | Update node |
| DELETE | `/curriculum/{id}/topics/{topicId}/nodes/{nodeId}` | Delete node |

### New Endpoints (To Implement)

| Method | Path | Purpose | Request Body |
|--------|------|---------|--------------|
| **POST** | `/curriculum/{id}/topics/{topicId}/nodes/reorder` | **Batch reorder nodes** | `{ items: [{ id, sequence_number }] }` |
| **POST** | `/curriculum/{id}/nodes/{nodeId}/articles/reorder` | **Batch reorder articles** | `{ items: [{ id, sequence_number }] }` |

**Example Request**:
```json
POST /curriculum/curr-123/topics/topic-456/nodes/reorder

{
  "items": [
    { "id": "node-1", "sequence_number": 3 },
    { "id": "node-2", "sequence_number": 1 },
    { "id": "node-3", "sequence_number": 2 }
  ]
}
```

**Implementation**:
```typescript
// Backend handler
export async function reorderNodes(
  curriculumId: string,
  topicId: string,
  body: { items: Array<{ id: string; sequence_number: number }> }
) {
  // Validate with Zod
  const { items } = BatchReorderSchema.parse(body);

  // Update in parallel
  await Promise.all(
    items.map(item =>
      supabase
        .from('curriculum_nodes')
        .update({ sequence_number: item.sequence_number })
        .eq('id', item.id)
        .eq('topic_id', topicId)  // Security check
    )
  );

  return { success: true };
}
```

---

## Drag-Drop Implementation

### Library: dnd-kit

**Why dnd-kit?**
- Built for React
- Keyboard accessible out of the box
- Supports multiple drag strategies (vertical, horizontal, grid)
- Lightweight (30KB gzipped)

### Example: NodesList with Drag-Drop

```tsx
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export function NodesList({ nodes, onReorder }: Props) {
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const reordered = reorderItems(nodes, active.id, over.id);
    onReorder(reordered);  // Triggers dirty state + mutation
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={nodes} strategy={verticalListSortingStrategy}>
        {nodes.map(node => (
          <SortableNode key={node.id} node={node} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

### Keyboard Support

**dnd-kit** provides keyboard navigation by default:

- **Tab** → Focus next item
- **Space** → Grab item
- **Arrow Up/Down** → Move item
- **Space** → Drop item
- **Escape** → Cancel drag

---

## Optimistic Updates & Rollback

### Flow

```
1. User drags Node 2 above Node 1
2. UI updates INSTANTLY (optimistic)
3. API call starts in background
4. On success: Confirm UI state, show toast
5. On error: ROLLBACK to previous state, show error toast
```

### Implementation

```tsx
export function useReorderNodes(curriculumId: string, topicId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BatchReorder) => reorderNodes(curriculumId, topicId, data),

    onMutate: async (newData) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ['nodes', curriculumId, topicId] });

      // Snapshot previous state
      const previous = queryClient.getQueryData(['nodes', curriculumId, topicId]);

      // Optimistic update
      queryClient.setQueryData(['nodes', curriculumId, topicId], (old: Node[]) =>
        old.map(node => {
          const update = newData.items.find(item => item.id === node.id);
          return update ? { ...node, sequence_number: update.sequence_number } : node;
        })
      );

      return { previous };
    },

    onError: (err, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(['nodes', curriculumId, topicId], context.previous);
      toast.error('Failed to save. Changes reverted.');
    },

    onSuccess: () => {
      toast.success('Saved successfully');
    },
  });
}
```

---

## Security Considerations

### Input Validation

**Client Side** (Zod):
```typescript
const result = BatchReorderSchema.safeParse(payload);
if (!result.success) {
  // Show validation errors
}
```

**Server Side** (Zod):
```typescript
export async function reorderNodes(topicId: string, body: unknown) {
  const { items } = BatchReorderSchema.parse(body);  // Throws on invalid input
  // ...
}
```

### Authorization

**Check ownership**:
```typescript
// Ensure user owns the curriculum
const { data: curriculum } = await supabase
  .from('curricula')
  .select('created_by')
  .eq('id', curriculumId)
  .single();

if (curriculum.created_by !== userId) {
  throw new Error('Unauthorized');
}
```

**Check node belongs to topic**:
```typescript
await supabase
  .from('curriculum_nodes')
  .update({ sequence_number })
  .eq('id', nodeId)
  .eq('topic_id', topicId);  // ✅ Prevents cross-topic manipulation
```

---

## Performance Optimizations

### 1. Code Splitting

```tsx
// Lazy load NodeDetails (only when needed)
const NodeDetails = dynamic(() => import('./NodeDetails'), {
  loading: () => <Skeleton />,
});
```

### 2. React Query Stale Time

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,  // Cache for 1 minute
      refetchOnWindowFocus: false,
    },
  },
});
```

### 3. Virtualized Lists (Optional)

For curricula with 100+ nodes, use `react-virtual`:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const rowVirtualizer = useVirtualizer({
  count: nodes.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 60,
});
```

### 4. Debounced Saves

```tsx
const debouncedSave = useDebouncedCallback(() => {
  mutate(pendingOrder);
}, 500);
```

---

## Accessibility

### Keyboard Navigation

- ✅ **Tab** → Navigate between topics, nodes, actions
- ✅ **Enter/Space** → Select item
- ✅ **Arrow Keys** → Move focus (drag mode)
- ✅ **Escape** → Cancel drag, close panel
- ✅ **Cmd+S** → Save changes

### Screen Readers

```tsx
<div
  role="button"
  aria-label={`Node ${node.sequence_number}: ${node.title.en}`}
  aria-grabbed={isDragging}
  tabIndex={0}>
  {node.title.en}
</div>
```

### Focus Management

```tsx
// Auto-focus Save button when dirty
useEffect(() => {
  if (isDirty && saveButtonRef.current) {
    saveButtonRef.current.focus();
  }
}, [isDirty]);
```

---

## Error Handling

### Network Errors

```tsx
if (error) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <h3 className="font-semibold text-red-800">Failed to load nodes</h3>
      <p className="text-sm text-red-600">{error.message}</p>
      <button onClick={() => refetch()}>Retry</button>
    </div>
  );
}
```

### Validation Errors

```tsx
const { mutate, error } = useCreateNode();

if (error instanceof ZodError) {
  return (
    <ul>
      {error.errors.map(err => (
        <li key={err.path.join('.')}>{err.message}</li>
      ))}
    </ul>
  );
}
```

### Global Error Boundary

```tsx
// app/error.tsx
'use client';

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-gray-600">{error.message}</p>
        <button onClick={reset}>Try again</button>
      </div>
    </div>
  );
}
```

---

## Testing Strategy

### Unit Tests (Utilities)

```bash
✅ lib/utils/reorder.test.ts
   - reorderItems()
   - getChangedItems()
   - hasChanges()
   - moveItemByKeyboard()
```

### Integration Tests (Components)

```typescript
// components/curriculum/NodesList.test.tsx
test('reorders nodes on drag-drop', async () => {
  const { getByText } = render(<NodesList nodes={mockNodes} />);

  // Simulate drag
  fireEvent.dragStart(getByText('Node 1'));
  fireEvent.drop(getByText('Node 3'));

  // Assert order changed
  expect(getByText('Node 1')).toHaveAttribute('data-sequence', '3');
});
```

### E2E Tests (Playwright)

```typescript
// e2e/curriculum-editor.spec.ts
test('saves reordered nodes', async ({ page }) => {
  await page.goto('/curricula/curr-1');
  await page.click('text=Alif');

  // Drag node
  await page.locator('text=Node 1').dragTo(page.locator('text=Node 3'));

  // Save
  await page.click('text=Save Changes');

  // Assert success
  await expect(page.locator('text=Saved successfully')).toBeVisible();
});
```

---

## Migration Checklist

- [ ] Install dependencies (`@dnd-kit`, `@tanstack/react-query`, `zod`)
- [ ] Set up React Query provider
- [ ] Create hooks (`useNodes`, `useReorderNodes`)
- [ ] Build `NodesList` with drag-drop
- [ ] Build `TopicsList`, `NodeDetails`, `ArticlesList`
- [ ] Build `DirtyActionsBar`
- [ ] Assemble `CurriculumEditor`
- [ ] Implement backend `/reorder` endpoints
- [ ] Add error boundaries
- [ ] Write tests
- [ ] Delete old nested routes
- [ ] Update documentation

---

## Summary

This refactor transforms a **20-file deep-nested route structure** into a **single-page editor** with:

✅ **3-panel layout** (Topics | Nodes | Details)
✅ **Drag-drop reordering** with keyboard support
✅ **Optimistic updates** with rollback on error
✅ **Batch save** to reduce API calls
✅ **Extracted forms** (no duplication)
✅ **Type-safe API** client with Zod validation
✅ **Unit tests** for all reorder logic

**Next Steps**: Implement React Query hooks and UI components (see `REFACTOR_GUIDE.md`).
