# Visual Tree Design Specification

## Color System

### Hierarchy Colors
- **Curriculum**: `bg-purple-500` - Large central node (80px)
- **Topic**: `bg-blue-500` - Medium nodes (64px)
- **Node**: `bg-green-500` - Small nodes (48px)
- **Activity**: `bg-amber-400` - Tiny nodes (36px)

### Interactive States
- **Hover**: Add `ring-4 ring-{color}-200` + scale-105
- **Selected**: Add `ring-4 ring-{color}-300` + shadow-lg
- **Drag Over**: `bg-blue-100 ring-4 ring-blue-400` (animated pulse)
- **Dragging**: `opacity-50 rotate-3 scale-95`
- **Path Highlight**: All ancestors get `ring-2 ring-gray-300`

### Connecting Lines
- Default: `stroke-gray-300 stroke-[2px]`
- Hover path: `stroke-blue-400 stroke-[3px]`
- Active: `stroke-purple-500 stroke-[3px]`

## Component Architecture

```
CurriculumTreeView (replaces CurriculumEditor)
├── TreeCanvas (main SVG container with pan/zoom)
│   ├── ConnectionLines (SVG paths between nodes)
│   └── TreeNodeLayer (HTML overlay for nodes)
│       └── TreeNode (recursive component)
│           ├── NodeCircle (rounded card with icon)
│           ├── NodeLabel (title text)
│           ├── ExpandButton (chevron to show/hide children)
│           ├── FloatingAddButton (+ button on hover)
│           └── QuickActions (edit/delete on hover)
```

## TreeNode Props
```typescript
interface TreeNodeProps {
  type: 'curriculum' | 'topic' | 'node' | 'activity';
  id: string;
  title: string;
  icon: LucideIcon;
  isExpanded: boolean;
  isSelected: boolean;
  isHovered: boolean;
  isInHoverPath: boolean;
  isDragOver: boolean;
  children?: TreeNodeData[];
  onToggle: () => void;
  onClick: () => void;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  position: { x: number; y: number };
}
```

## Layout Algorithm

### Horizontal Tree Layout
```
Curriculum (center)
  ├── Topic 1 (x+200, y-150)
  │   ├── Node 1 (x+400, y-200)
  │   │   ├── Activity 1 (x+600, y-240)
  │   │   └── Activity 2 (x+600, y-200)
  │   └── Node 2 (x+400, y-100)
  ├── Topic 2 (center, y+0)
  └── Topic 3 (x+200, y+150)
```

**Spacing**:
- Curriculum → Topic: 200px horizontal
- Topic → Node: 200px horizontal
- Node → Activity: 200px horizontal
- Between siblings: 80px vertical (topics), 60px (nodes), 40px (activities)

### Vertical Centering
Each parent node vertically centers based on total height of expanded children.

## Animations

### Expand/Collapse
```typescript
variants={{
  collapsed: {
    opacity: 0,
    scale: 0.8,
    x: -20,
    transition: { duration: 0.2 }
  },
  expanded: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      duration: 0.3,
      type: 'spring',
      stiffness: 200,
      damping: 20
    }
  }
}}
```

### Create New Item
```typescript
// Fade in from parent with bounce
variants={{
  initial: { opacity: 0, scale: 0, x: -50 },
  animate: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 15
    }
  }
}}
```

### Drag and Drop
- **During drag**: Opacity 0.5, rotate 2-3deg, scale 0.95
- **Drop target**: Pulsing ring animation
- **On drop success**: Scale up 1.1 → 1.0 bounce

### Hover Path
- Fade in ring on all ancestors over 200ms
- Stagger delay of 50ms per level

## Node Structure

### Curriculum Node
```jsx
<motion.div className="relative">
  {/* Main circle */}
  <div className="w-20 h-20 rounded-full bg-purple-500 shadow-xl
                  flex items-center justify-center text-white">
    <BookOpen className="w-10 h-10" />
  </div>

  {/* Label below */}
  <div className="absolute top-24 left-1/2 -translate-x-1/2
                  text-sm font-bold text-gray-900 whitespace-nowrap">
    {title}
  </div>

  {/* Floating + button (shows on hover) */}
  <motion.button
    initial={{ opacity: 0, scale: 0 }}
    whileHover={{ scale: 1.1 }}
    className="absolute -right-2 -top-2 w-6 h-6 rounded-full
               bg-purple-600 text-white shadow-md">
    <Plus className="w-4 h-4" />
  </motion.button>
</motion.div>
```

### Topic/Node/Activity Nodes
Same structure, scaled down with appropriate colors.

## Connection Lines (SVG)

```jsx
<svg className="absolute inset-0 pointer-events-none">
  {connections.map(({ from, to, isInHoverPath }) => {
    const d = `M ${from.x} ${from.y}
               C ${from.x + 100} ${from.y},
                 ${to.x - 100} ${to.y},
                 ${to.x} ${to.y}`;

    return (
      <motion.path
        key={`${from.id}-${to.id}`}
        d={d}
        fill="none"
        stroke={isInHoverPath ? '#60a5fa' : '#d1d5db'}
        strokeWidth={isInHoverPath ? 3 : 2}
        animate={{ strokeWidth: isInHoverPath ? 3 : 2 }}
        transition={{ duration: 0.2 }}
      />
    );
  })}
</svg>
```

## State Management

### Expand/Collapse State
```typescript
const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
  new Set([curriculumId]) // Start with curriculum expanded
);

const toggleNode = (nodeId: string) => {
  setExpandedNodes(prev => {
    const next = new Set(prev);
    if (next.has(nodeId)) {
      next.delete(nodeId);
    } else {
      next.add(nodeId);
    }
    return next;
  });
};
```

### Hover Path Tracking
```typescript
const [hoveredPath, setHoveredPath] = useState<string[]>([]);

const onNodeHover = (nodeId: string, ancestors: string[]) => {
  setHoveredPath([nodeId, ...ancestors]);
};

const onNodeLeave = () => {
  setHoveredPath([]);
};
```

## Drag and Drop Integration

Keep existing DndContext from CurriculumEditor:
- Activities can still be dragged to different nodes
- Visual feedback: drop target nodes get pulsing blue ring
- DragOverlay shows dragged item following cursor
- All existing drag logic remains unchanged

## Modals Integration

Keep existing modals:
- TopicFormModal
- NodeFormModal
- ActivityFormModal
- Triggered by FloatingAddButton or QuickAction edit buttons

## Responsive Behavior

- **Desktop (>1280px)**: Full horizontal tree, 200px spacing
- **Tablet (768-1280px)**: Reduce spacing to 150px, smaller nodes
- **Mobile (<768px)**: Switch to vertical tree layout, collapsible accordion style

## Performance Optimizations

1. **Virtualization**: Only render visible nodes (use react-window for >100 activities)
2. **Memoization**: Memo TreeNode component with deep equality check
3. **SVG Optimization**: Use `will-change: transform` on animated paths
4. **Lazy Loading**: Load activities only when parent node expands
5. **Debounce**: Debounce hover path updates (50ms)

## Accessibility

- Keyboard navigation: Tab through nodes, Enter to expand/collapse
- ARIA labels: `aria-expanded`, `aria-label` on all interactive elements
- Focus indicators: Visible focus rings matching hover states
- Screen reader: Announce "X has Y children, expanded/collapsed"
