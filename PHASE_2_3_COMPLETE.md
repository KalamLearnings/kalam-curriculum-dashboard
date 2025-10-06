# Phase 2 & 3 Implementation Complete

**Status**: ✅ Phase 2 (Backend) and Phase 3 (React Query Hooks) are ready to use

---

## 📦 What's Been Delivered

### Phase 2: Backend (Batch Reorder Endpoints)

✅ **File**: `kalam-readers-backend/supabase/functions/curriculum/BATCH_REORDER_PATCH.md`

This patch file contains all the code you need to add to your backend:

1. **New Type**: `BatchReorderRequest`
2. **Validator**: `validateBatchReorder()`
3. **Service Functions**:
   - `reorderNodes()` - Batch update nodes with permission checks
   - `reorderArticles()` - Batch update activities with permission checks
4. **API Endpoints**:
   - `POST /curriculum/:id/topics/:topicId/nodes/reorder`
   - `POST /curriculum/:id/nodes/:nodeId/activities/reorder`

**Security Features**:
- ✅ Verifies user owns the curriculum before allowing reorder
- ✅ Ensures items belong to correct parent (topic/node)
- ✅ Validates all input with detailed error messages
- ✅ Updates in parallel for performance

---

### Phase 3: React Query Hooks

✅ **Files Created**:
1. `lib/hooks/useCurriculum.ts` - Curriculum CRUD hooks
2. `lib/hooks/useNodes.ts` - Node operations + **batch reorder with optimistic updates**

**Key Features**:
- ✅ **Optimistic Updates** - UI updates instantly before server responds
- ✅ **Automatic Rollback** - Reverts changes if server call fails
- ✅ **Toast Notifications** - Success/error feedback
- ✅ **Cache Management** - Automatic invalidation and refetching
- ✅ **Type Safety** - Full TypeScript support with Zod schemas

---

## 🚀 Quick Start

### Step 1: Apply Backend Patches

Open `kalam-readers-backend/supabase/functions/curriculum/BATCH_REORDER_PATCH.md` and follow the instructions to add:

1. Add `BatchReorderRequest` to `types.ts`
2. Add `validateBatchReorder()` to `validators.ts`
3. Add `reorderNodes()` and `reorderActivities()` to `service.ts`
4. Add the two POST endpoints to `index.ts`

### Step 2: Restart Supabase Function

```bash
cd /Users/salehqadan/Projects/Kalam/kalam-readers-backend

# Kill existing process
pkill -f "supabase functions serve"

# Restart
supabase functions serve --no-verify-jwt
```

### Step 3: Test Backend with curl

```bash
# Get your auth token
TOKEN="your-token-here"

# Test reorder nodes
curl -X POST \
  "http://localhost:54321/functions/v1/curriculum/CURR_ID/topics/TOPIC_ID/nodes/reorder" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"id": "node-uuid-1", "sequence_number": 2},
      {"id": "node-uuid-2", "sequence_number": 1}
    ]
  }'

# Expected response:
# {"data": {"message": "2 nodes reordered successfully"}}
```

### Step 4: Install Frontend Dependencies

```bash
cd /Users/salehqadan/Projects/Kalam/kalam-curriculum-dashboard

npm install @tanstack/react-query sonner
```

### Step 5: Set Up React Query Provider

Create `app/providers.tsx`:

```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

Wrap your app in `app/layout.tsx`:

```tsx
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

---

## 💡 Usage Examples

### Example 1: Fetch Nodes

```tsx
'use client';

import { useNodes } from '@/lib/hooks/useNodes';

export function NodesList({ curriculumId, topicId }: Props) {
  const { data: nodes, isLoading, error } = useNodes(curriculumId, topicId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {nodes?.map(node => (
        <li key={node.id}>{node.title.en}</li>
      ))}
    </ul>
  );
}
```

### Example 2: Reorder Nodes (Optimistic Update)

```tsx
'use client';

import { useState } from 'react';
import { useNodes, useReorderNodes } from '@/lib/hooks/useNodes';
import { reorderItems } from '@/lib/utils/reorder';

export function NodesList({ curriculumId, topicId }: Props) {
  const { data: nodes } = useNodes(curriculumId, topicId);
  const { mutate: reorder } = useReorderNodes(curriculumId, topicId);

  const [localNodes, setLocalNodes] = useState(nodes);

  function handleDragEnd(activeId: string, overId: string) {
    // Reorder locally
    const reordered = reorderItems(localNodes, activeId, overId);
    setLocalNodes(reordered);

    // Send to server (optimistic update + rollback on error)
    reorder({
      items: reordered.map(n => ({ id: n.id, sequence_number: n.sequence_number }))
    });
  }

  return (
    <div>
      {localNodes?.map(node => (
        <div key={node.id}>{node.title.en}</div>
      ))}
    </div>
  );
}
```

**What Happens**:
1. User drags Node 2 above Node 1
2. UI updates **instantly** (optimistic update)
3. API call happens in background
4. On success: Toast "Nodes reordered successfully"
5. On error: UI **reverts** to original order + Toast "Failed to reorder. Changes reverted."

### Example 3: Create Node

```tsx
'use client';

import { useCreateNode } from '@/lib/hooks/useNodes';

export function CreateNodeForm({ curriculumId, topicId }: Props) {
  const { mutate: createNode, isPending } = useCreateNode();

  function handleSubmit(formData: any) {
    createNode({
      curriculumId,
      topicId,
      data: {
        title: { en: formData.title, ar: formData.titleAr },
        sequence_number: 1,
        type: 'lesson',
      },
    });
  }

  return (
    <button onClick={handleSubmit} disabled={isPending}>
      {isPending ? 'Creating...' : 'Create Node'}
    </button>
  );
}
```

---

## 🔍 How Optimistic Updates Work

### The Flow

```
1. User drags item
   ↓
2. Update local state (instant UI change)
   ↓
3. useMutation.onMutate → Update React Query cache
   ↓
4. API call starts (in background)
   ↓
5a. SUCCESS:
    - useMutation.onSuccess → Invalidate cache
    - Toast "Saved successfully"
    - UI stays as-is
   ↓
5b. ERROR:
    - useMutation.onError → Rollback cache
    - Toast "Failed. Changes reverted."
    - UI returns to previous state
```

### The Code (from `useNodes.ts`)

```typescript
export function useReorderNodes(curriculumId: string, topicId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => reorderNodes(curriculumId, topicId, data),

    // STEP 1: Optimistic update (runs before API call)
    onMutate: async (newData) => {
      // Save current state for rollback
      const previousNodes = queryClient.getQueryData(['nodes', curriculumId, topicId]);

      // Update cache optimistically
      queryClient.setQueryData(['nodes', curriculumId, topicId], (old) =>
        old.map(node => {
          const update = newData.items.find(item => item.id === node.id);
          return update ? { ...node, sequence_number: update.sequence_number } : node;
        })
      );

      return { previousNodes }; // Save for rollback
    },

    // STEP 2a: Rollback on error
    onError: (error, newData, context) => {
      queryClient.setQueryData(['nodes', curriculumId, topicId], context.previousNodes);
      toast.error('Failed to reorder. Changes reverted.');
    },

    // STEP 2b: Confirm on success
    onSuccess: () => {
      toast.success('Saved successfully');
    },
  });
}
```

---

## 📚 API Reference

### Hooks

| Hook | Purpose | Returns |
|------|---------|---------|
| `useNodes(curriculumId, topicId)` | Fetch nodes | `{ data, isLoading, error }` |
| `useCreateNode()` | Create node | `{ mutate, isPending }` |
| `useUpdateNode()` | Update node | `{ mutate, isPending }` |
| `useDeleteNode()` | Delete node | `{ mutate, isPending }` |
| `useReorderNodes(curriculumId, topicId)` | Batch reorder | `{ mutate, isPending }` |

### Backend Endpoints

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/curriculum/:id/topics/:topicId/nodes/reorder` | POST | `{ items: [{ id, sequence_number }] }` | `{ message: "N nodes reordered" }` |
| `/curriculum/:id/nodes/:nodeId/activities/reorder` | POST | `{ items: [{ id, sequence_number }] }` | `{ message: "N activities reordered" }` |

---

## 🧪 Testing

### Test Optimistic Updates

1. **Open React Query Devtools** (appears in bottom-right)
2. Drag a node to reorder
3. **Watch the cache update instantly**
4. **Simulate error**: Kill the Supabase function during drag
5. **See rollback**: UI reverts + error toast

### Test Backend

```bash
# Valid request
curl -X POST "http://localhost:54321/functions/v1/curriculum/CURR/topics/TOPIC/nodes/reorder" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items": [{"id": "node-1", "sequence_number": 2}]}'

# Invalid (should return 400)
curl -X POST ".../reorder" -d '{}' # Missing items
curl -X POST ".../reorder" -d '{"items": [{"id": "x", "sequence_number": -1}]}' # Invalid number
```

---

## 🎯 Next Steps

Now that Phase 2 & 3 are complete, you can:

1. **Apply the backend patches** (see `BATCH_REORDER_PATCH.md`)
2. **Build the NodesList component** with drag-drop (see `REFACTOR_GUIDE.md` Phase 4)
3. **Use the hooks** in your components
4. **Test optimistic updates** in the browser

**Or**, if you want me to continue with **Phase 4** (UI components with drag-drop), just let me know!

---

## 📝 Files Created

| File | Purpose |
|------|---------|
| `lib/schemas/curriculum.ts` | ✅ Zod schemas |
| `lib/utils/reorder.ts` | ✅ Pure reorder functions |
| `lib/utils/reorder.test.ts` | ✅ Unit tests |
| `lib/api/curricula.ts` | ✅ API client |
| `lib/hooks/useCurriculum.ts` | ✅ Curriculum hooks |
| `lib/hooks/useNodes.ts` | ✅ Node hooks + batch reorder |
| `BATCH_REORDER_PATCH.md` | ✅ Backend implementation guide |
| `REFACTOR_GUIDE.md` | ✅ Full refactor plan |
| `ARCHITECTURE.md` | ✅ System architecture docs |

---

**Status**: ✅ Phases 1-3 Complete
**Next**: Phase 4 (UI Components with Drag-Drop) - Ready when you are!
