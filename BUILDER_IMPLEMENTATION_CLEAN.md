# Curriculum Builder - Clean Architecture Implementation

## Existing Components & Patterns to Reuse

### ✅ Components to Reuse (NO CHANGES)

| Component | Location | Usage in Builder |
|-----------|----------|------------------|
| `Modal` | `components/ui/Modal.tsx` | Reference only (we're going full-screen) |
| `EmptyState` | `components/curriculum/shared/EmptyState.tsx` | "No activity selected" state |
| `ListItem` | `components/curriculum/shared/ListItem.tsx` | Tree navigation items |
| `FormField`, `TextInput`, etc. | `components/curriculum/forms/FormField.tsx` | All form inputs |
| `getActivityFormComponent()` | `components/curriculum/forms/index.tsx` | Dynamic form rendering |
| Activity Forms | `components/curriculum/forms/*Form.tsx` | Reuse ALL 11+ form components |

### ✅ Hooks to Reuse (NO CHANGES)

| Hook | Location | Usage |
|------|----------|-------|
| `useCurriculum()` | `lib/hooks/useCurriculum.ts` | Fetch curriculum tree |
| `useActivities()` | `lib/hooks/useActivities.ts` | Fetch node activities |
| `useUpdateActivity()` | `lib/hooks/useActivities.ts` | Save activity changes |
| `useCreateActivity()` | `lib/hooks/useActivities.ts` | Create new activities |
| `useDeleteActivity()` | `lib/hooks/useActivities.ts` | Delete activities |

### ✅ Utilities to Reuse

| Utility | Location | Usage |
|---------|----------|-------|
| `clsx` | package.json (installed) | Conditional classNames |
| `tailwind-merge` | package.json (installed) | Merge Tailwind classes |
| Icons | `lucide-react` | All icons |
| Toasts | `sonner` | Success/error messages |

### ✅ Existing Patterns to Follow

**Styling**:
```tsx
// Button pattern (existing)
className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"

// Layout pattern (existing)
className="flex items-center gap-2"

// Border pattern (existing)
className="border-b border-gray-200"

// Selected state (existing)
className={viewMode === 'tree' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}
```

**Icon Usage**:
```tsx
import { Plus, Pencil, Trash2, X } from 'lucide-react';
<Plus className="w-4 h-4" />
```

**Toast Usage**:
```tsx
import { toast } from 'sonner';
toast.success('Activity saved successfully');
toast.error('Failed to save activity');
```

---

## New Components to Create (MINIMAL)

### 1. Create `lib/utils.ts` (cn utility)

**Purpose**: Utility for conditional classNames (standard pattern)

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 2. Create `app/(dashboard)/curricula/[id]/builder/page.tsx`

**Purpose**: Main builder route with 3-panel layout

**Reuses**:
- `useCurriculum()` - fetch data
- `useActivities()` - fetch activities
- `useUpdateActivity()` - save changes
- `EmptyState` - when no activity selected
- `getActivityFormComponent()` - dynamic forms
- All form components

**New Code**: Only layout structure

```typescript
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useCurriculum } from '@/lib/hooks/useCurriculum';
import { useActivities } from '@/lib/hooks/useActivities';
import { useUpdateActivity } from '@/lib/hooks/useActivities';
import { EmptyState } from '@/components/curriculum/shared/EmptyState';
import { getActivityFormComponent } from '@/components/curriculum/forms';
import type { Article, ArticleType } from '@/lib/schemas/curriculum';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function CurriculumBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const curriculumId = params.id as string;

  // State
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'intro' as ArticleType,
    instructionEn: '',
    instructionAr: '',
    config: {}
  });

  // Data fetching (REUSE existing hooks)
  const { data: curriculum, isLoading: loadingCurriculum } = useCurriculum(curriculumId);
  const { data: activities } = useActivities(curriculumId, selectedNodeId);
  const { mutate: updateActivity, isPending: isSaving } = useUpdateActivity();

  // Get current activity
  const currentActivity = activities?.find(a => a.id === selectedActivityId);

  // Load activity data into form when selected
  const handleActivitySelect = (activity: Article, nodeId: string) => {
    setSelectedActivityId(activity.id);
    setSelectedNodeId(nodeId);
    setFormData({
      type: activity.type,
      instructionEn: activity.instruction.en,
      instructionAr: activity.instruction.ar,
      config: activity.config || {}
    });
  };

  // Save handler
  const handleSave = () => {
    if (!selectedActivityId || !selectedNodeId) return;

    updateActivity({
      curriculumId,
      nodeId: selectedNodeId,
      activityId: selectedActivityId,
      data: {
        type: formData.type,
        instruction: {
          en: formData.instructionEn,
          ar: formData.instructionAr
        },
        config: formData.config
      }
    });
  };

  if (loadingCurriculum) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Get dynamic form component (REUSE existing)
  const ActivityFormComponent = getActivityFormComponent(formData.type);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="h-14 border-b flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/curricula/${curriculumId}`)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-base font-semibold">
            {curriculum?.title || 'Curriculum Builder'}
          </h1>
        </div>

        <button
          onClick={handleSave}
          disabled={!selectedActivityId || isSaving}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors",
            selectedActivityId && !isSaving
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </header>

      {/* 3-Panel Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Navigation Tree */}
        <aside className="w-[280px] border-r bg-gray-50 overflow-y-auto">
          <NavigationTree
            curriculum={curriculum}
            selectedActivityId={selectedActivityId}
            onActivitySelect={handleActivitySelect}
          />
        </aside>

        {/* CENTER: Form */}
        <main className="flex-1 overflow-y-auto p-6">
          {!selectedActivityId ? (
            <EmptyState
              message="Select an activity from the tree to start editing"
            />
          ) : (
            <div className="max-w-3xl mx-auto">
              <ActivityEditor
                formData={formData}
                onChange={setFormData}
                ActivityFormComponent={ActivityFormComponent}
              />
            </div>
          )}
        </main>

        {/* RIGHT: Preview */}
        <aside className="w-[420px] border-l bg-gray-50 overflow-y-auto p-6">
          <PreviewPanel formData={formData} />
        </aside>
      </div>
    </div>
  );
}

// --- Internal Components (Same File) ---

interface NavigationTreeProps {
  curriculum: any;
  selectedActivityId: string | null;
  onActivitySelect: (activity: Article, nodeId: string) => void;
}

function NavigationTree({ curriculum, selectedActivityId, onActivitySelect }: NavigationTreeProps) {
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => {
      const next = new Set(prev);
      next.has(topicId) ? next.delete(topicId) : next.add(topicId);
      return next;
    });
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId);
      return next;
    });
  };

  // REUSE: Similar pattern to existing tree view
  return (
    <div className="p-4">
      <h2 className="text-xs font-semibold text-gray-500 uppercase mb-4">
        Structure
      </h2>
      {/* Render tree here - see full implementation below */}
    </div>
  );
}

interface ActivityEditorProps {
  formData: any;
  onChange: (data: any) => void;
  ActivityFormComponent: any;
}

function ActivityEditor({ formData, onChange, ActivityFormComponent }: ActivityEditorProps) {
  // REUSE: FormField components from existing codebase
  return (
    <div className="space-y-6">
      {/* Type selector, instructions, and dynamic form */}
      {/* See full implementation below */}
    </div>
  );
}

function PreviewPanel({ formData }: { formData: any }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-4">Preview</h3>
      <PhoneFrame>
        <ActivityPreview formData={formData} />
      </PhoneFrame>
    </div>
  );
}
```

### 3. Create Preview Components (MINIMAL)

**File**: `components/curriculum/preview/index.tsx`

```typescript
// Simple preview components that DON'T need external dependencies
// Just visual representations using React/Tailwind

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto bg-gray-900 rounded-[3rem] p-3 shadow-2xl" style={{ width: 375, height: 812 }}>
      {/* Status bar */}
      <div className="h-11 flex items-center justify-between px-6 text-white text-xs">
        <span>9:41</span>
        <span>🔋</span>
      </div>

      {/* Screen */}
      <div className="bg-white rounded-[2.5rem] h-[calc(100%-44px)] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

export function ActivityPreview({ formData }: { formData: any }) {
  const { type, instructionEn, instructionAr, config } = formData;

  // Route to appropriate preview
  switch (type) {
    case 'tap':
      return <TapPreview instruction={{ en: instructionEn, ar: instructionAr }} config={config} />;
    case 'intro':
      return <IntroPreview instruction={{ en: instructionEn, ar: instructionAr }} config={config} />;
    // Add more as needed
    default:
      return <PlaceholderPreview type={type} />;
  }
}

// Simple preview implementations
function TapPreview({ instruction, config }: any) {
  const { targetWord = 'باب', correctLetter = 'ب', highlightColor = '#FFD700' } = config;

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <p className="text-lg mb-2">{instruction.en}</p>
      <p className="text-xl mb-8" dir="rtl">{instruction.ar}</p>

      <div className="flex gap-3" dir="rtl">
        {targetWord.split('').map((letter: string, i: number) => (
          <div
            key={i}
            className="w-16 h-16 flex items-center justify-center text-3xl border-2 rounded-lg"
            style={{
              color: letter === correctLetter ? highlightColor : '#000',
              borderColor: letter === correctLetter ? highlightColor : '#d1d5db'
            }}
          >
            {letter}
          </div>
        ))}
      </div>
    </div>
  );
}

function IntroPreview({ instruction, config }: any) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-center mb-4">{instruction.en}</h2>
      <h3 className="text-2xl font-bold text-center" dir="rtl">{instruction.ar}</h3>
    </div>
  );
}

function PlaceholderPreview({ type }: { type: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="text-6xl mb-4">🎨</div>
      <p className="text-sm text-gray-600">Preview for "{type}"</p>
      <p className="text-xs text-gray-400 mt-2">Coming soon...</p>
    </div>
  );
}
```

---

## Implementation Steps

### Phase 1: Setup (30 minutes)

1. **Create utility**:
   ```bash
   touch lib/utils.ts
   ```

2. **Create builder route**:
   ```bash
   mkdir -p app/\(dashboard\)/curricula/\[id\]/builder
   touch app/\(dashboard\)/curricula/\[id\]/builder/page.tsx
   ```

3. **Create preview components**:
   ```bash
   mkdir -p components/curriculum/preview
   touch components/curriculum/preview/index.tsx
   ```

### Phase 2: Build Layout (2-3 hours)

1. Implement `lib/utils.ts` with `cn()` function
2. Implement `page.tsx` with 3-panel layout
3. Implement `NavigationTree` component (reuse existing patterns)
4. Implement `ActivityEditor` component (reuse existing form components)
5. Test navigation and form rendering

### Phase 3: Add Preview (2-3 hours)

1. Implement `PhoneFrame` component
2. Implement `TapPreview` and `IntroPreview`
3. Implement `PlaceholderPreview` for others
4. Add debouncing for preview updates
5. Test live preview updates

### Phase 4: Integration (1-2 hours)

1. Add "Open Builder" button to existing curriculum page
2. Test save functionality
3. Test edge cases
4. Polish UI

### Phase 5: Additional Previews (Optional)

Add previews for other activity types incrementally.

---

## Component Reuse Map

```
Builder Page
├── useCurriculum() ← REUSE existing hook
├── useActivities() ← REUSE existing hook
├── useUpdateActivity() ← REUSE existing hook
├── EmptyState ← REUSE existing component
├── NavigationTree
│   └── Similar to existing tree patterns
├── ActivityEditor
│   ├── FormField ← REUSE existing component
│   ├── TextInput ← REUSE existing component
│   ├── Select ← REUSE existing component
│   └── getActivityFormComponent() ← REUSE existing function
│       ├── TapActivityForm ← REUSE existing
│       ├── BalloonActivityForm ← REUSE existing
│       └── ... (all 11+ forms) ← REUSE existing
└── PreviewPanel
    └── NEW: Simple preview components
```

---

## Files Changed Summary

### NEW Files (3 files):
1. `lib/utils.ts` - cn utility (5 lines)
2. `app/(dashboard)/curricula/[id]/builder/page.tsx` - Main builder (200-300 lines)
3. `components/curriculum/preview/index.tsx` - Preview components (100-150 lines)

### MODIFIED Files (1 file):
1. `app/(dashboard)/curricula/[id]/page.tsx` - Add "Open Builder" button (2 lines)

### REUSED Components/Hooks (20+):
- All existing form components
- All existing hooks
- All existing UI components
- All existing utilities

---

## Testing Plan

1. **Navigation**:
   - Click topics/nodes to expand
   - Click activity to load in editor
   - Verify correct activity highlighted

2. **Form**:
   - Edit instruction fields
   - Change activity type
   - Edit config fields
   - Verify form state updates

3. **Preview**:
   - Verify preview updates when form changes
   - Test with different activity types
   - Check debouncing works

4. **Save**:
   - Click save button
   - Verify success toast
   - Verify data persisted
   - Reload and check data

---

## Benefits of This Approach

✅ **Minimal New Code**: Only ~400 lines of new code
✅ **Maximum Reuse**: Leverages 20+ existing components/hooks
✅ **Consistent Patterns**: Follows existing codebase conventions
✅ **Low Risk**: Doesn't modify existing functionality
✅ **Clean Architecture**: Single responsibility, modular components
✅ **Easy Maintenance**: Future developers can understand quickly

