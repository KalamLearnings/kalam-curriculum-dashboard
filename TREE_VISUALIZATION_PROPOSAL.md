# Tree Visualization Redesign Proposal
## Kalam Curriculum Dashboard

---

## 1. Executive Summary

This proposal outlines a complete redesign of the curriculum editor from a three-column list view into an interactive, playful tree visualization. The new design will maintain all existing functionality (CRUD operations, drag-and-drop, reordering) while providing a more intuitive, visual, and engaging user experience.

**Key Goals:**
- Transform flat lists into hierarchical tree view
- Add smooth expand/collapse animations
- Maintain drag-and-drop for activities and cross-node movement
- Create playful, colorful design with custom node rendering
- Preserve all existing modals and editing flows

---

## 2. Library Selection & Reasoning

### Recommended: **Pure dnd-kit + Tailwind CSS** (No additional libraries!)

**Why Keep It Simple:**

1. **We Already Have Everything We Need** ✅
   - **dnd-kit**: Handles ALL drag-drop (reordering + cross-node movement)
   - **Tailwind CSS**: Beautiful gradients, shadows, animations built-in
   - **Lucide Icons**: Already using for icons
   - **React**: Native animations with CSS transitions

2. **CSS Transitions > Animation Libraries** ✅
   - Tailwind's `transition-all duration-300` is smooth and performant
   - No extra bundle size
   - Native browser animations are fastest
   - Simple `max-height` tricks for expand/collapse

3. **Fun Design with Tailwind** ✅
   - Gradients: `bg-gradient-to-br from-amber-50 to-amber-100`
   - Playful shadows: `shadow-lg hover:shadow-xl`
   - Rounded corners: `rounded-xl`
   - Color-coded hierarchy (amber = topics, emerald = nodes, pink = activities)
   - Smooth hover effects: `hover:scale-[1.02] transition-all`

4. **dnd-kit Does It All** ✅
   - `SortableContext`: Activities can be reordered within a node
   - `DndContext` + `useDroppable`: Activities can be dropped onto nodes
   - `DragOverlay`: Show preview while dragging
   - Already working in our codebase

5. **No Additional Dependencies** ✅
   - Zero new packages to install
   - Zero learning curve for team
   - Zero maintenance burden
   - Fastest possible performance

**Why NOT Use Animation Libraries:**

| Library | Issue | Why Skip It |
|---------|-------|-------------|
| **Framer Motion** | Adds 50kb+ to bundle, CSS transitions do same thing | ❌ Unnecessary |
| **React Spring** | Complex API for simple expand/collapse | ❌ Overkill |
| **GSAP** | Commercial license required for some uses | ❌ Not worth it |

**Why NOT Use Tree Libraries:**

| Library | Issue | Why Skip It |
|---------|-------|-------------|
| **React Flow** | Drag conflicts, designed for flowcharts | ❌ Wrong tool |
| **react-d3-tree** | No drag-drop, rigid layout | ❌ Too limited |
| **react-arborist** | List-based, not spatial/visual | ❌ Not fun enough |

**Decision: Pure dnd-kit + Tailwind** - We already have everything we need. Let's build a beautiful, playful tree with what we have!

---

## 3. Architecture Overview

### Current Structure (3-Column Layout)
```
CurriculumEditor
├── TopicsList (column 1)
├── NodesList (column 2)
└── ActivitiesList (column 3)
```

### New Structure (Tree Layout)
```
CurriculumEditor
├── CurriculumTreeView (main canvas)
│   ├── TopicNode (custom node)
│   │   ├── NodeNode (custom node, child of topic)
│   │   │   └── ActivityNode (custom node, child of node)
│   │   └── ...
│   └── ...
├── TopicFormModal (unchanged)
├── NodeFormModal (unchanged)
└── ActivityFormModal (unchanged)
```

### Component Tree
```
<CurriculumEditor>
  <CurriculumTreeView>
    {topics.map(topic => (
      <TopicNode key={topic.id} topic={topic}>
        {/* Expand/collapse controls visibility of children */}
        {isExpanded && (
          <NodesContainer>
            <DndContext onDragEnd={handleActivityDragBetweenNodes}>
              {nodes.map(node => (
                <NodeNode key={node.id} node={node}>
                  <SortableContext items={activities}>
                    {activities.map(activity => (
                      <ActivityNode key={activity.id} activity={activity} />
                    ))}
                  </SortableContext>
                </NodeNode>
              ))}
            </DndContext>
          </NodesContainer>
        )}
      </TopicNode>
    ))}
  </CurriculumTreeView>

  {/* Existing modals */}
  <TopicFormModal />
  <NodeFormModal />
  <ActivityFormModal />
</CurriculumEditor>
```

---

## 4. Design System

### Color Palette (Playful & Hierarchical)

```typescript
const treeTheme = {
  curriculum: {
    bg: '#F0F9FF',        // Light blue
    border: '#0EA5E9',    // Sky blue
    icon: '#0284C7',
  },
  topic: {
    bg: '#FEF3C7',        // Light amber
    border: '#F59E0B',    // Amber
    icon: '#D97706',
  },
  node: {
    bg: '#DCFCE7',        // Light green
    border: '#10B981',    // Emerald
    icon: '#059669',
  },
  activity: {
    bg: '#FCE7F3',        // Light pink
    border: '#EC4899',    // Pink
    icon: '#DB2777',
  },
  expanded: {
    bg: '#FFFFFF',        // White when expanded
    shadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  collapsed: {
    bg: 'gradient',       // Subtle gradient
    shadow: '0 2px 6px rgba(0,0,0,0.05)',
  },
};
```

### Animation Guidelines

```typescript
const animations = {
  expand: {
    duration: 300,        // ms
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // Material ease-in-out
  },
  collapse: {
    duration: 250,        // ms (slightly faster)
    easing: 'cubic-bezier(0.4, 0, 1, 1)', // Ease-in
  },
  nodeAppear: {
    duration: 200,        // ms
    easing: 'cubic-bezier(0, 0, 0.2, 1)', // Ease-out
    scale: [0.9, 1],
    opacity: [0, 1],
  },
  hover: {
    duration: 150,        // ms
    scale: 1.02,
  },
  drag: {
    opacity: 0.6,
    scale: 1.05,
    cursor: 'grabbing',
  },
};
```

### Icon System

```typescript
import {
  GraduationCap,  // Curriculum root
  BookOpen,       // Topic
  FileText,       // Node (lesson)
  CheckCircle,    // Node (assessment)
  Info,           // Node (intro)
  Layers,         // Activities group
  Plus,           // Add action
  Edit2,          // Edit action
  Trash2,         // Delete action
  ChevronDown,    // Collapse
  ChevronRight,   // Expand
} from 'lucide-react';
```

---

## 5. Sample Implementation

### 5.1 Custom Topic Node Component (Pure CSS Animations)

```tsx
// components/curriculum/tree/TopicNode.tsx
'use client';

import { memo, useState } from 'react';
import { BookOpen, Plus, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { Topic, Node as CurriculumNode } from '@/lib/schemas/curriculum';
import { NodeNode } from './NodeNode';

interface TopicNodeProps {
  topic: Topic;
  nodes: CurriculumNode[];
  onEdit: () => void;
  onDelete: () => void;
  onAddNode: () => void;
  onEditNode: (node: CurriculumNode) => void;
  onDeleteNode: (nodeId: string) => void;
  onAddActivity: (nodeId: string) => void;
}

export const TopicNode = memo(({
  topic,
  nodes,
  onEdit,
  onDelete,
  onAddNode,
  onEditNode,
  onDeleteNode,
  onAddActivity,
}: TopicNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-6">
      {/* Topic Header */}
      <div
        className={`
          group relative rounded-xl border-2 transition-all duration-300
          ${isExpanded
            ? 'bg-white shadow-lg border-amber-400'
            : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300 shadow-md'
          }
          hover:shadow-xl
        `}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full
                     bg-amber-500 text-white flex items-center justify-center
                     hover:bg-amber-600 transition-all shadow-md z-10 hover:scale-110"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isExpanded ? '' : '-rotate-90'
            }`}
          />
        </button>

        {/* Main Content */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {topic.title.en}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                {topic.description?.en || 'No description'}
              </p>
            </div>
          </div>

          {/* Action Buttons (show on hover) */}
          <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={onAddNode}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5
                         text-xs font-medium text-amber-700 bg-amber-50 rounded-lg
                         hover:bg-amber-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Lesson
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50
                         rounded transition-colors"
              title="Edit topic"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50
                         rounded transition-colors"
              title="Delete topic"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Child Nodes (CSS-only animated collapse) */}
      <div
        className={`
          ml-10 mt-4 space-y-3 overflow-hidden transition-all duration-300 ease-in-out
          ${isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        {/* Connecting Line */}
        {isExpanded && nodes.length > 0 && (
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-amber-200" />
        )}

        {nodes.map((node) => (
          <NodeNode
            key={node.id}
            node={node}
            onEdit={() => onEditNode(node)}
            onDelete={() => onDeleteNode(node.id)}
            onAddActivity={() => onAddActivity(node.id)}
          />
        ))}
      </div>
    </div>
  );
});

TopicNode.displayName = 'TopicNode';
```

### 5.2 Node Component with dnd-kit Droppable

```tsx
// components/curriculum/tree/NodeNode.tsx
'use client';

import { memo, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FileText, CheckCircle, Info, Plus, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { Node as CurriculumNode, Article } from '@/lib/schemas/curriculum';
import { ActivityNode } from './ActivityNode';
import { useActivities } from '@/lib/hooks/useActivities';

interface NodeNodeProps {
  node: CurriculumNode;
  curriculumId: string;
  onEdit: () => void;
  onDelete: () => void;
  onAddActivity: () => void;
  onEditActivity: (activity: Article) => void;
}

const typeConfig = {
  lesson: { icon: FileText, color: 'emerald', bg: 'from-emerald-50 to-emerald-100', border: 'border-emerald-300' },
  assessment: { icon: CheckCircle, color: 'blue', bg: 'from-blue-50 to-blue-100', border: 'border-blue-300' },
  intro: { icon: Info, color: 'purple', bg: 'from-purple-50 to-purple-100', border: 'border-purple-300' },
};

export const NodeNode = memo(({
  node,
  curriculumId,
  onEdit,
  onDelete,
  onAddActivity,
  onEditActivity,
}: NodeNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { data: activities } = useActivities(curriculumId, node.id);
  const config = typeConfig[node.type] || typeConfig.lesson;
  const Icon = config.icon;

  // Make this node a drop target for activities
  const { setNodeRef, isOver } = useDroppable({
    id: node.id,
    data: {
      type: 'node',
      node,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        mb-3 rounded-xl border-2 transition-all duration-300
        ${isOver ? 'ring-4 ring-blue-300 ring-opacity-50' : ''}
        ${isExpanded
          ? `bg-white shadow-lg ${config.border}`
          : `bg-gradient-to-br ${config.bg} ${config.border} shadow-md`
        }
      `}
    >
      {/* Node Header */}
      <div className="group p-3 hover:bg-gray-50 transition-colors">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`absolute -left-3 top-3 w-6 h-6 rounded-full
                     bg-${config.color}-500 text-white flex items-center justify-center
                     hover:bg-${config.color}-600 transition-all shadow-md hover:scale-110`}
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isExpanded ? '' : '-rotate-90'
            }`}
          />
        </button>

        <div className="flex items-start gap-2.5 ml-4">
          <div className={`w-9 h-9 rounded-lg bg-${config.color}-500 flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate text-sm">
              {node.title.en}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-400 capitalize">{node.type}</span>
              {activities && activities.length > 0 && (
                <span className="text-xs text-gray-500">
                  • {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1 mt-2.5 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={onAddActivity}
            className={`flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5
                       text-xs font-medium text-${config.color}-700 bg-${config.color}-50 rounded-lg
                       hover:bg-${config.color}-100 transition-colors`}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Activity
          </button>
          <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Activities List (sortable) */}
      {isExpanded && activities && activities.length > 0 && (
        <div className="border-t bg-gray-50 p-3">
          <SortableContext items={activities.map(a => a.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {activities.map((activity) => (
                <ActivityNode
                  key={activity.id}
                  activity={activity}
                  nodeId={node.id}
                  onClick={() => onEditActivity(activity)}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      )}
    </div>
  );
});

NodeNode.displayName = 'NodeNode';
```

### 5.3 Main Tree View Component (with dnd-kit)

```tsx
// components/curriculum/tree/CurriculumTreeView.tsx
'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, closestCorners } from '@dnd-kit/core';
import { TopicNode } from './TopicNode';
import { useTopics } from '@/lib/hooks/useTopics';
import { useNodes } from '@/lib/hooks/useNodes';
import { Topic, Node as CurriculumNode } from '@/lib/schemas/curriculum';
import { useMoveActivity } from '@/lib/hooks/useActivities';

interface CurriculumTreeViewProps {
  curriculumId: string;
  onEditTopic: (topic: Topic) => void;
  onEditNode: (node: CurriculumNode) => void;
  onCreateNode: (topicId: string) => void;
  onCreateActivity: (nodeId: string) => void;
}

export function CurriculumTreeView({
  curriculumId,
  onEditTopic,
  onEditNode,
  onCreateNode,
  onCreateActivity,
}: CurriculumTreeViewProps) {
  const { data: topics } = useTopics(curriculumId);
  const { mutate: moveActivity } = useMoveActivity();
  const [activeId, setActiveId] = useState<string | null>(null);

  // Each topic fetches its own nodes
  const topicNodesMap = new Map<string, CurriculumNode[]>();
  topics?.forEach((topic) => {
    // Using the hook at top level for each topic
    const { data: nodes } = useNodes(curriculumId, topic.id);
    if (nodes) {
      topicNodesMap.set(topic.id, nodes);
    }
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    // Check if dragging activity to a different node
    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === 'activity' && overData?.type === 'node') {
      const sourceNodeId = activeData.nodeId;
      const targetNodeId = overData.node.id;

      if (sourceNodeId !== targetNodeId) {
        moveActivity({
          curriculumId,
          activityId: active.id as string,
          sourceNodeId,
          targetNodeId,
        });
      }
    }

    setActiveId(null);
  };

  if (!topics || topics.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">No topics yet</div>
      </div>
    );
  }

  return (
    <DndContext
      onDragStart={({ active }) => setActiveId(active.id as string)}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCorners}
    >
      <div className="p-8 overflow-auto h-full bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-6">
          {topics.map((topic) => (
            <TopicNode
              key={topic.id}
              topic={topic}
              nodes={topicNodesMap.get(topic.id) || []}
              onEdit={() => onEditTopic(topic)}
              onDelete={() => {/* TODO: implement */}}
              onAddNode={() => onCreateNode(topic.id)}
              onEditNode={onEditNode}
              onDeleteNode={(nodeId) => {/* TODO: implement */}}
              onAddActivity={onCreateActivity}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeId ? (
          <div className="bg-pink-100 border-2 border-pink-400 rounded-lg p-3 shadow-lg">
            Dragging activity...
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
```

---

## 6. Implementation Plan

### Phase 1: Foundation (Week 1)
- [ ] Install `reactflow` dependency
- [ ] Create base tree components (TopicNode, NodeNode, ActivityNode)
- [ ] Implement data transformation (lists → tree structure)
- [ ] Add expand/collapse state management
- [ ] Basic rendering with static data

### Phase 2: Interactivity (Week 2)
- [ ] Connect to existing data hooks (useTopics, useNodes, useActivities)
- [ ] Implement click handlers (edit, delete, add)
- [ ] Integrate existing modals (TopicFormModal, etc.)
- [ ] Add hover effects and animations
- [ ] Implement smooth expand/collapse transitions

### Phase 3: Drag & Drop (Week 3)
- [ ] Enable drag-drop for activities within nodes
- [ ] Support cross-node activity movement
- [ ] Add visual feedback during drag (ghost nodes, drop zones)
- [ ] Integrate with existing reorder mutations
- [ ] Handle edge cases (drop validation, undo)

### Phase 4: Polish & Testing (Week 4)
- [ ] Add loading states and error handling
- [ ] Implement MiniMap for large trees
- [ ] Add keyboard navigation
- [ ] Performance optimization (memoization, virtualization)
- [ ] Comprehensive testing
- [ ] Documentation

---

## 7. Migration Strategy

### Approach: Feature Flag

```tsx
// components/curriculum/CurriculumEditor.tsx
export function CurriculumEditor({ curriculumId }: { curriculumId: string }) {
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');

  return (
    <div className="h-full flex flex-col">
      {/* View Toggle */}
      <div className="border-b p-3 flex justify-end">
        <div className="inline-flex rounded-lg border p-1 gap-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded text-sm ${viewMode === 'list' ? 'bg-blue-600 text-white' : ''}`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={`px-3 py-1.5 rounded text-sm ${viewMode === 'tree' ? 'bg-blue-600 text-white' : ''}`}
          >
            Tree View
          </button>
        </div>
      </div>

      {/* Render based on mode */}
      {viewMode === 'list' ? (
        <div className="flex-1 grid grid-cols-3 gap-px bg-gray-200">
          {/* Existing three-column layout */}
        </div>
      ) : (
        <CurriculumTreeView curriculumId={curriculumId} />
      )}
    </div>
  );
}
```

**Benefits:**
- No breaking changes
- Users can switch between views
- Gradual rollout and testing
- Easy rollback if needed

---

## 8. Technical Considerations

### Performance
- Use `memo` for all custom node components
- Implement lazy loading for activities (expand on demand)
- Consider virtualization for trees with 100+ nodes
- Debounce drag operations

### Accessibility
- Keyboard navigation (Tab, Enter, Arrow keys)
- Screen reader labels for all actions
- Focus management for modals
- ARIA attributes for tree structure

### Responsive Design
- Mobile: Collapse to single column with zoom controls
- Tablet: Compact node sizes, scrollable canvas
- Desktop: Full tree with minimap

### State Management
- Maintain expand/collapse state in localStorage
- Sync with URL params for deep linking
- Optimistic updates for CRUD operations

---

## 9. Expected Outcome

### Before (Current)
```
┌─────────┬─────────┬─────────┐
│ Topics  │ Nodes   │Activities│
├─────────┼─────────┼─────────┤
│ Topic 1 │ Node 1  │ Act 1   │
│ Topic 2 │ Node 2  │ Act 2   │
│ ...     │ ...     │ ...     │
└─────────┴─────────┴─────────┘
```

### After (Tree View)
```
              ┌─────────────┐
              │ Curriculum  │
              └──────┬──────┘
                     │
        ┌────────────┴────────────┐
        │                         │
   ┌────▼────┐              ┌────▼────┐
   │ Topic 1 │              │ Topic 2 │
   └────┬────┘              └────┬────┘
        │                        │
   ┌────┴────┐              ┌────┴────┐
   │ Node 1  │              │ Node 3  │
   └────┬────┘              └─────────┘
        │
   ┌────┴────┐
   │ Node 2  │
   └────┬────┘
        │
   ┌────┴────┬────────┬────────┐
   │ Act 1   │ Act 2  │ Act 3  │
   └─────────┴────────┴────────┘
```

**Visual Features:**
- Colorful, rounded nodes
- Smooth animations
- Floating action buttons
- Visual hierarchy with color coding
- Drag-drop indicators
- Minimap for navigation

---

## 10. Next Steps

1. **Get Approval**: Review this proposal with stakeholders
2. **Install Dependencies**: `npm install reactflow`
3. **Create Branch**: `git checkout -b feature/tree-visualization`
4. **Start Phase 1**: Build foundation components
5. **Iterate**: Weekly demos and feedback

---

## Appendix A: Dependencies

```json
{
  "dependencies": {
    // NO NEW DEPENDENCIES NEEDED! 🎉
    // Everything we need is already installed:
    // - @dnd-kit/core ✅
    // - @dnd-kit/sortable ✅
    // - tailwindcss ✅
    // - lucide-react ✅
  }
}
```

## Appendix B: File Structure

```
components/curriculum/
├── tree/
│   ├── CurriculumTreeView.tsx      (Main tree container)
│   ├── TopicNode.tsx                (Topic custom node)
│   ├── NodeNode.tsx                 (Node custom node)
│   ├── ActivityNode.tsx             (Activity custom node)
│   ├── useTreeLayout.ts             (Layout calculation hook)
│   └── tree.utils.ts                (Helper functions)
├── CurriculumEditor.tsx             (Modified with view toggle)
├── [existing files...]
```

## Appendix C: Timeline

| Week | Deliverable | Status |
|------|-------------|--------|
| 1 | Foundation components | ⏳ Pending |
| 2 | Data integration | ⏳ Pending |
| 3 | Drag & drop | ⏳ Pending |
| 4 | Polish & launch | ⏳ Pending |

---

**Document Version:** 1.0
**Date:** 2025-10-06
**Author:** Claude Code
**Status:** Pending Approval
