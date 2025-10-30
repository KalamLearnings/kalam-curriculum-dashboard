# Curriculum Builder Implementation Guide

## Table of Contents
- [Executive Summary](#executive-summary)
- [Current System Overview](#current-system-overview)
- [Proposed Solution](#proposed-solution)
- [Architecture](#architecture)
- [Implementation Plan](#implementation-plan)
- [Component Specifications](#component-specifications)
- [State Management](#state-management)
- [Preview System](#preview-system)
- [API Integration](#api-integration)
- [Code Examples](#code-examples)
- [Testing Considerations](#testing-considerations)
- [Future Enhancements](#future-enhancements)

---

## Executive Summary

### Goal
Build a professional-grade curriculum builder inspired by Duolingo ABC's internal tools, featuring a split-panel interface with live activity preview.

### Scope (MVP)
- ✅ Full-screen builder experience (no modals)
- ✅ 3-panel layout: Navigation | Form | Live Preview
- ✅ Real-time preview updates as curriculum creators type
- ✅ Basic activity previews (4 types initially, placeholder for others)
- ✅ Manual save functionality
- ✅ Prev/Next activity navigation

### Out of Scope (Future)
- ❌ Play-through testing mode
- ❌ Visual drag-drop curriculum map
- ❌ Keyboard shortcuts
- ❌ Auto-save & version history
- ❌ Asset library management
- ❌ Validation warnings

### Timeline
**2 weeks** for MVP with 4 working activity previews

### Key Benefits
1. **Visual Feedback**: Creators see what students will see in real-time
2. **Faster Iteration**: No need to test in mobile app during creation
3. **Error Reduction**: Visual preview catches mistakes before publishing
4. **Better UX**: Immersive full-screen experience vs. cramped modals
5. **Professional Tool**: Matches quality of tools like Duolingo ABC

---

## Current System Overview

### Architecture
The existing curriculum system uses a **modal-based editing** approach:

```
/curricula/[id] (List/Tree View)
  ├── Click "Add Activity" → Modal opens
  ├── Fill form → Save
  └── Modal closes → Back to list
```

### Data Flow
```
Frontend (Dashboard)
  ↓
lib/api/curricula.ts (API Client)
  ↓
Supabase Edge Functions (/curriculum/*)
  ↓
service.ts (Business Logic)
  ↓
Supabase Database
```

### Current File Structure
```
app/(dashboard)/
  └── curricula/[id]/page.tsx          # Main curriculum page

components/curriculum/
  ├── CurriculumEditor.tsx              # Main editor (list/tree view)
  ├── ActivityFormModal.tsx             # Modal wrapper for activity forms
  ├── TemplateFormModal.tsx             # Modal for templates
  └── forms/
      ├── TapActivityForm.tsx           # Form for tap activities
      ├── BalloonActivityForm.tsx       # Form for balloon activities
      ├── MultipleChoiceActivityForm.tsx
      └── ... (11 activity types total)

lib/
  ├── api/curricula.ts                  # API client functions
  └── schemas/curriculum.ts             # TypeScript types & Zod schemas
```

### Activity Types (11 Total)
1. `intro` - Introduction/story screen
2. `presentation` - Letter/concept presentation
3. `tap` - Tap the correct letter
4. `write` - Trace/write the letter
5. `word_builder` - Build words from letters
6. `name_builder` - Build names from letters
7. `balloon` - Pop balloons with correct letters
8. `multiple_choice` - Choose correct answer
9. `drag_drop` - Drag items to targets
10. `fishing` - Fish for letters
11. `pizza` - Pizza-themed activity
12. `break` - Break/rest screen

### Database Schema (Relevant Tables)
```sql
-- Core curriculum hierarchy
curricula (id, letter_id, title, is_published)
  └── curriculum_topics (id, curriculum_id, name, sequence)
      └── curriculum_nodes (id, topic_id, sequence, type, position)
          └── curriculum_activities (id, node_id, type, instruction, config)

-- Template system
activity_templates (id, type, instruction_template, config_template, required_fields)
activity_presets (id, activity_type, difficulty, config)

-- Reference data
letters (id, letter, forms, phonetics, audio_*)
audio_assets (id, category, path, data)
```

### Current Limitations
1. **No Visual Feedback**: Creators configure JSON without seeing results
2. **Modal Constraints**: Limited space, feels disconnected
3. **Testing Friction**: Must deploy to mobile app to verify appearance
4. **Slow Iteration**: Back-and-forth between CMS and app testing
5. **Error Prone**: Easy to misconfigure without visual confirmation

---

## Proposed Solution

### New User Flow
```
/curricula/[id] (Overview Page)
  ↓
Click "Open Builder" button
  ↓
/curricula/[id]/builder (Full-screen Builder)
  ↓
  ┌─────────────────────────────────────────────────┐
  │ Navigation  │  Activity Form  │  Live Preview   │
  │  (Tree)     │   (Center)      │   (Phone Mock)  │
  │             │                 │                 │
  │ • Click     │ • Edit fields   │ • Updates live  │
  │   activity  │ • Prev/Next     │ • Visual test   │
  │ • See       │ • Save button   │ • Device frame  │
  │   structure │                 │                 │
  └─────────────────────────────────────────────────┘
```

### Layout Design

```
┌──────────────────────────────────────────────────────────────────┐
│  HEADER                                                          │
│  [← Back] Curriculum Builder              [Save Changes] [?]    │
├─────────────┬──────────────────────────┬─────────────────────────┤
│             │                          │                         │
│  LEFT       │  CENTER                  │  RIGHT                  │
│  PANEL      │  PANEL                   │  PANEL                  │
│  (280px)    │  (flex-1)                │  (420px)                │
│             │                          │                         │
│ ┌─────────┐ │ ┌──────────────────────┐ │ ┌──────────────────┐  │
│ │ Topic 1 │ │ │ Activity Type        │ │ │   DEVICE FRAME   │  │
│ │ ▸ Node 1│ │ │ [Tap        ▼]       │ │ │  ┌────────────┐  │  │
│ │ ▾ Node 2│ │ │                      │ │ │  │  Preview   │  │  │
│ │   • Act1│ │ │ Instruction (EN)     │ │ │  │            │  │  │
│ │   • Act2│ │ │ [_____________]      │ │ │  │  Tap ب     │  │  │
│ │ Topic 2 │ │ │                      │ │ │  │            │  │  │
│ │ ▸ Node 3│ │ │ Instruction (AR)     │ │ │  │  ┌─┐ ┌─┐   │  │  │
│ │   ...   │ │ │ [_____________]      │ │ │  │  │ب│ │ا│   │  │  │
│ │         │ │ │                      │ │ │  │  └─┘ └─┘   │  │  │
│ │ [+ Add] │ │ │ Configuration        │ │ │  │            │  │  │
│ └─────────┘ │ │ ┌──────────────────┐ │ │ │  └────────────┘  │  │
│             │ │ │ Highlight Color  │ │ │ │                  │  │
│ Collapsible │ │ │ [#FFD700     ▼] │ │ │ │ Device: iPhone ▼ │  │
│ Tree View   │ │ │                  │ │ │ │ [🔄 Reset]      │  │
│             │ │ │ Show Highlight   │ │ │ │                  │  │
│             │ │ │ [✓]              │ │ │ └──────────────────┘  │
│             │ │ │                  │ │ │                       │
│             │ │ └──────────────────┘ │ │ Real-time preview     │
│             │ │                      │ │ updates as you type   │
│             │ │ [< Prev] [Next >]   │ │                       │
│             │ └──────────────────────┘ │                       │
│             │                          │                       │
└─────────────┴──────────────────────────┴─────────────────────────┘
```

### Key Interactions

1. **Navigation Panel (Left)**
   - Display full curriculum tree
   - Click activity → loads in center/right panels
   - Highlight currently selected activity
   - Expand/collapse topics and nodes
   - Show activity type icons for quick identification

2. **Form Panel (Center)**
   - Reuse existing activity form components
   - Remove modal wrapper, keep form logic
   - Add Prev/Next navigation buttons
   - Manual save button (no auto-save for MVP)
   - Clear visual separation between sections

3. **Preview Panel (Right)**
   - Phone frame mockup (iPhone by default)
   - Live rendering of current activity
   - Updates in real-time as form changes (with debounce)
   - Device selector dropdown (iPhone/iPad/Android)
   - Reset button to clear preview cache

---

## Architecture

### New Routes
```
app/(dashboard)/curricula/[id]/builder/
├── page.tsx                    # Main builder route
├── layout.tsx                  # Optional: Full-screen layout wrapper
└── components/                 # Builder-specific components
    ├── BuilderLayout.tsx       # 3-panel container
    ├── NavigationPanel.tsx     # Left panel
    ├── FormPanel.tsx           # Center panel
    └── PreviewPanel.tsx        # Right panel
```

### New Components
```
components/curriculum/preview/
├── ActivityPreview.tsx         # Router component (type → preview)
├── PhoneFrame.tsx              # Device mockup wrapper
├── DeviceSelector.tsx          # Device dropdown
└── previews/
    ├── TapPreview.tsx          # Tap activity preview
    ├── IntroPreview.tsx        # Intro activity preview
    ├── PresentationPreview.tsx # Presentation activity preview
    ├── BreakPreview.tsx        # Break activity preview
    └── PlaceholderPreview.tsx  # Fallback for others
```

### State Flow
```
User edits form
  ↓
setFormData({ ...formData, instruction: newValue })
  ↓
useDebounce(formData, 300ms)
  ↓
PreviewPanel receives debouncedFormData
  ↓
ActivityPreview renders based on type
  ↓
Preview updates in phone frame
```

### Integration Points

**Existing System (Keep)**
- `/curricula/[id]/page.tsx` - Overview page with tree/list view
- `components/curriculum/CurriculumEditor.tsx` - Existing editor
- All activity form components in `components/curriculum/forms/`
- API client in `lib/api/curricula.ts`
- Type definitions in `lib/schemas/curriculum.ts`

**New System (Add)**
- `/curricula/[id]/builder/page.tsx` - New builder route
- Builder-specific components
- Preview components
- Shared state management

**Migration Path**
Add "Open Builder" button to existing curriculum page:
```tsx
<Button onClick={() => router.push(`/curricula/${id}/builder`)}>
  ✨ Open in Builder
</Button>
```

Keep old modal-based editor for quick edits, use builder for detailed work.

---

## Implementation Plan

### Phase 1: Foundation (Days 1-3)

**Day 1: Route & Basic Layout**
- [ ] Create `/curricula/[id]/builder/page.tsx`
- [ ] Create `BuilderLayout.tsx` with 3-panel grid
- [ ] Add header with back button and save button
- [ ] Implement basic responsive behavior
- [ ] Set up state management (useState for MVP)

**Day 2: Navigation Panel**
- [ ] Create `NavigationPanel.tsx`
- [ ] Fetch curriculum tree data using existing API
- [ ] Render topics, nodes, and activities
- [ ] Implement expand/collapse functionality
- [ ] Add click handlers to select activity
- [ ] Highlight currently selected activity

**Day 3: Form Integration**
- [ ] Create `FormPanel.tsx`
- [ ] Integrate existing activity forms (remove modal wrapper)
- [ ] Add form state management
- [ ] Implement Prev/Next navigation
- [ ] Add save functionality (call existing API)

### Phase 2: Preview System (Days 4-7)

**Day 4: Preview Infrastructure**
- [ ] Create `PhoneFrame.tsx` (iPhone mockup)
- [ ] Create `ActivityPreview.tsx` (router component)
- [ ] Create `PreviewPanel.tsx` (container)
- [ ] Implement debounced state sync (form → preview)
- [ ] Add device selector UI

**Day 5-6: Basic Previews**
- [ ] `IntroPreview.tsx` - Display title, description, image
- [ ] `PresentationPreview.tsx` - Display letter with audio indicator
- [ ] `TapPreview.tsx` - Display word with highlighted letter
- [ ] `BreakPreview.tsx` - Simple break screen

**Day 7: Polish & Placeholder**
- [ ] Create `PlaceholderPreview.tsx` for other activity types
- [ ] Add loading states
- [ ] Fix responsive issues
- [ ] Add error boundaries

### Phase 3: Integration & Testing (Days 8-10)

**Day 8: API Integration**
- [ ] Connect save button to backend
- [ ] Handle loading states
- [ ] Implement error handling
- [ ] Add success/error notifications

**Day 9: Polish & Bug Fixes**
- [ ] Fix navigation edge cases
- [ ] Improve styling consistency
- [ ] Add hover states and transitions
- [ ] Test with real curriculum data

**Day 10: Testing & Documentation**
- [ ] Manual testing of all flows
- [ ] Test with different activity types
- [ ] Fix critical bugs
- [ ] Update user documentation

---

## Component Specifications

### 1. BuilderLayout.tsx

**Purpose**: Main 3-panel container

**Props**:
```typescript
interface BuilderLayoutProps {
  curriculumId: string;
}
```

**State**:
```typescript
const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
const [formData, setFormData] = useState<ActivityFormData>({});
const [isSaving, setIsSaving] = useState(false);
```

**Layout**:
```tsx
<div className="flex flex-col h-screen">
  {/* Header */}
  <header className="h-14 border-b">
    <BackButton />
    <Title />
    <SaveButton />
  </header>

  {/* 3-Panel Grid */}
  <div className="flex flex-1 overflow-hidden">
    <NavigationPanel
      curriculumId={curriculumId}
      selectedActivityId={selectedActivityId}
      onSelectActivity={setSelectedActivityId}
      className="w-[280px] border-r"
    />

    <FormPanel
      curriculumId={curriculumId}
      activityId={selectedActivityId}
      formData={formData}
      onChange={setFormData}
      className="flex-1 overflow-y-auto"
    />

    <PreviewPanel
      formData={formData}
      className="w-[420px] border-l bg-gray-50"
    />
  </div>
</div>
```

**Styling**:
- Full viewport height (`h-screen`)
- No scrolling on main container
- Panels handle their own scrolling
- Use Tailwind's border utilities for dividers

---

### 2. NavigationPanel.tsx

**Purpose**: Display curriculum tree, allow activity selection

**Props**:
```typescript
interface NavigationPanelProps {
  curriculumId: string;
  selectedActivityId: string | null;
  onSelectActivity: (id: string) => void;
  className?: string;
}
```

**Data Fetching**:
```typescript
// Use existing API client
const { data: curriculum } = useQuery({
  queryKey: ['curriculum', curriculumId],
  queryFn: () => getCurriculumWithDetails(curriculumId)
});
```

**UI Structure**:
```tsx
<aside className={cn("overflow-y-auto", className)}>
  <div className="p-4">
    <h2 className="font-semibold mb-4">Curriculum Structure</h2>

    {curriculum?.topics.map(topic => (
      <div key={topic.id}>
        {/* Topic Header */}
        <button onClick={() => toggleTopic(topic.id)}>
          {expanded ? '▼' : '▸'} {topic.name}
        </button>

        {/* Nodes */}
        {expanded && topic.nodes.map(node => (
          <div key={node.id} className="ml-4">
            <button onClick={() => toggleNode(node.id)}>
              {expanded ? '▼' : '▸'} Node {node.sequence}
            </button>

            {/* Activities */}
            {expanded && node.activities.map(activity => (
              <button
                key={activity.id}
                onClick={() => onSelectActivity(activity.id)}
                className={cn(
                  "ml-8 flex items-center gap-2",
                  selectedActivityId === activity.id && "bg-primary text-white"
                )}
              >
                <ActivityIcon type={activity.type} />
                Activity {activity.sequence}
              </button>
            ))}
          </div>
        ))}
      </div>
    ))}
  </div>
</aside>
```

**State Management**:
```typescript
const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

const toggleTopic = (topicId: string) => {
  setExpandedTopics(prev => {
    const next = new Set(prev);
    if (next.has(topicId)) {
      next.delete(topicId);
    } else {
      next.add(topicId);
    }
    return next;
  });
};
```

---

### 3. FormPanel.tsx

**Purpose**: Display activity form, handle prev/next navigation

**Props**:
```typescript
interface FormPanelProps {
  curriculumId: string;
  activityId: string | null;
  formData: ActivityFormData;
  onChange: (data: ActivityFormData) => void;
  className?: string;
}
```

**Data Fetching**:
```typescript
const { data: activity } = useQuery({
  queryKey: ['activity', activityId],
  queryFn: () => getActivity(activityId!),
  enabled: !!activityId
});

// Sync activity data to formData when loaded
useEffect(() => {
  if (activity) {
    onChange({
      type: activity.type,
      instruction: activity.instruction,
      config: activity.config
    });
  }
}, [activity]);
```

**UI Structure**:
```tsx
<main className={cn("p-6", className)}>
  {!activityId ? (
    <EmptyState>Select an activity to edit</EmptyState>
  ) : (
    <>
      {/* Activity Type Selector */}
      <div className="mb-6">
        <label>Activity Type</label>
        <select
          value={formData.type}
          onChange={(e) => onChange({ ...formData, type: e.target.value })}
        >
          <option value="tap">Tap</option>
          <option value="balloon">Balloon</option>
          {/* ... other types */}
        </select>
      </div>

      {/* Instruction Fields */}
      <div className="mb-6">
        <label>Instruction (English)</label>
        <input
          value={formData.instruction.en}
          onChange={(e) => onChange({
            ...formData,
            instruction: { ...formData.instruction, en: e.target.value }
          })}
        />
      </div>

      <div className="mb-6">
        <label>Instruction (Arabic)</label>
        <input
          value={formData.instruction.ar}
          onChange={(e) => onChange({
            ...formData,
            instruction: { ...formData.instruction, ar: e.target.value }
          })}
          dir="rtl"
        />
      </div>

      {/* Dynamic Activity Form */}
      <ActivityFormSelector
        type={formData.type}
        config={formData.config}
        onChange={(config) => onChange({ ...formData, config })}
      />

      {/* Navigation */}
      <div className="flex gap-2 mt-8 pt-8 border-t">
        <Button onClick={onPrevious} disabled={!hasPrevious}>
          ← Previous
        </Button>
        <Button onClick={onNext} disabled={!hasNext}>
          Next →
        </Button>
      </div>
    </>
  )}
</main>
```

**Form Integration**:
```tsx
// Reuse existing form components
function ActivityFormSelector({ type, config, onChange }) {
  switch (type) {
    case 'tap':
      return <TapActivityForm config={config} onChange={onChange} />;
    case 'balloon':
      return <BalloonActivityForm config={config} onChange={onChange} />;
    // ... other types
    default:
      return <GenericConfigForm config={config} onChange={onChange} />;
  }
}
```

---

### 4. PreviewPanel.tsx

**Purpose**: Display live preview of activity

**Props**:
```typescript
interface PreviewPanelProps {
  formData: ActivityFormData;
  className?: string;
}
```

**State**:
```typescript
const [device, setDevice] = useState<'iphone' | 'ipad' | 'android'>('iphone');
const debouncedFormData = useDebounce(formData, 300); // Delay updates
```

**UI Structure**:
```tsx
<aside className={cn("p-6 overflow-y-auto", className)}>
  <div className="mb-4 flex items-center justify-between">
    <h3 className="font-semibold">Preview</h3>
    <select value={device} onChange={(e) => setDevice(e.target.value)}>
      <option value="iphone">iPhone</option>
      <option value="ipad">iPad</option>
      <option value="android">Android</option>
    </select>
  </div>

  {/* Phone Frame */}
  <PhoneFrame device={device}>
    <ActivityPreview
      type={debouncedFormData.type}
      instruction={debouncedFormData.instruction}
      config={debouncedFormData.config}
    />
  </PhoneFrame>

  <div className="mt-4 text-center">
    <p className="text-xs text-gray-500">
      Preview updates automatically
    </p>
  </div>
</aside>
```

**Debounce Hook**:
```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

---

### 5. PhoneFrame.tsx

**Purpose**: Display phone mockup wrapper

**Props**:
```typescript
interface PhoneFrameProps {
  device: 'iphone' | 'ipad' | 'android';
  children: React.ReactNode;
}
```

**UI Structure**:
```tsx
<div className={cn("phone-frame", `phone-frame--${device}`)}>
  {/* Status Bar */}
  <div className="status-bar">
    <span className="time">9:41</span>
    <div className="status-icons">
      <SignalIcon />
      <WifiIcon />
      <BatteryIcon />
    </div>
  </div>

  {/* Screen Content */}
  <div className="phone-screen">
    {children}
  </div>

  {/* Home Indicator (iOS) */}
  {device === 'iphone' && (
    <div className="home-indicator" />
  )}
</div>
```

**Styling** (Tailwind + Custom CSS):
```css
.phone-frame {
  @apply relative mx-auto rounded-[3rem] border-8 border-gray-800 bg-white shadow-2xl;
}

.phone-frame--iphone {
  width: 375px;
  height: 812px;
}

.phone-frame--ipad {
  width: 768px;
  height: 1024px;
}

.status-bar {
  @apply h-11 flex items-center justify-between px-6 text-xs;
}

.phone-screen {
  @apply h-[calc(100%-88px)] overflow-y-auto;
}

.home-indicator {
  @apply absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-800 rounded-full;
}
```

---

### 6. ActivityPreview.tsx

**Purpose**: Route to appropriate preview component based on activity type

**Props**:
```typescript
interface ActivityPreviewProps {
  type: string;
  instruction: { en: string; ar: string };
  config: Record<string, any>;
}
```

**Implementation**:
```tsx
export function ActivityPreview({ type, instruction, config }: ActivityPreviewProps) {
  switch (type) {
    case 'tap':
      return <TapPreview instruction={instruction} config={config} />;
    case 'intro':
      return <IntroPreview instruction={instruction} config={config} />;
    case 'presentation':
      return <PresentationPreview instruction={instruction} config={config} />;
    case 'break':
      return <BreakPreview instruction={instruction} config={config} />;
    default:
      return <PlaceholderPreview type={type} />;
  }
}
```

---

### 7. Preview Components

#### TapPreview.tsx

**Purpose**: Preview for tap activity (highlight letter in word)

```tsx
interface TapPreviewProps {
  instruction: { en: string; ar: string };
  config: {
    targetWord?: string;
    correctLetter?: string;
    highlightColor?: string;
    showHighlight?: boolean;
  };
}

export function TapPreview({ instruction, config }: TapPreviewProps) {
  const {
    targetWord = 'باب',
    correctLetter = 'ب',
    highlightColor = '#FFD700',
    showHighlight = true
  } = config;

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      {/* Instruction */}
      <div className="mb-8 text-center">
        <p className="text-lg text-gray-700">{instruction.en}</p>
        <p className="text-xl text-gray-900 mt-2" dir="rtl">
          {instruction.ar}
        </p>
      </div>

      {/* Word Display */}
      <div className="flex gap-3" dir="rtl">
        {targetWord.split('').map((letter, index) => (
          <div
            key={index}
            className="w-16 h-16 flex items-center justify-center text-3xl border-2 border-gray-300 rounded-lg"
            style={{
              color: letter === correctLetter && showHighlight
                ? highlightColor
                : '#000',
              borderColor: letter === correctLetter && showHighlight
                ? highlightColor
                : '#d1d5db'
            }}
          >
            {letter}
          </div>
        ))}
      </div>

      {/* Hint */}
      <p className="mt-8 text-xs text-gray-400">
        Preview - not interactive
      </p>
    </div>
  );
}
```

#### IntroPreview.tsx

**Purpose**: Preview for intro/story activities

```tsx
interface IntroPreviewProps {
  instruction: { en: string; ar: string };
  config: {
    title?: { en: string; ar: string };
    description?: { en: string; ar: string };
    imageUrl?: string;
  };
}

export function IntroPreview({ instruction, config }: IntroPreviewProps) {
  const { title, description, imageUrl } = config;

  return (
    <div className="flex flex-col h-full p-6">
      {/* Image */}
      {imageUrl && (
        <div className="mb-6 rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* Title */}
      <h2 className="text-2xl font-bold text-center mb-4">
        {title?.en || instruction.en}
      </h2>
      <h3 className="text-2xl font-bold text-center mb-6" dir="rtl">
        {title?.ar || instruction.ar}
      </h3>

      {/* Description */}
      <p className="text-gray-700 text-center mb-4">
        {description?.en}
      </p>
      <p className="text-gray-700 text-center" dir="rtl">
        {description?.ar}
      </p>
    </div>
  );
}
```

#### PresentationPreview.tsx

**Purpose**: Preview for letter presentation activities

```tsx
interface PresentationPreviewProps {
  instruction: { en: string; ar: string };
  config: {
    letter?: string;
    letterForm?: 'isolated' | 'initial' | 'medial' | 'final';
    audioPath?: string;
  };
}

export function PresentationPreview({ instruction, config }: PresentationPreviewProps) {
  const { letter = 'ب', letterForm = 'isolated', audioPath } = config;

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      {/* Instruction */}
      <p className="text-lg text-gray-700 mb-8">{instruction.en}</p>

      {/* Large Letter Display */}
      <div className="mb-8 p-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl">
        <span className="text-9xl font-bold text-gray-900" dir="rtl">
          {letter}
        </span>
      </div>

      {/* Form Indicator */}
      <p className="text-sm text-gray-500 mb-4">
        Form: {letterForm}
      </p>

      {/* Audio Indicator */}
      {audioPath && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>🔊</span>
          <span>Audio attached</span>
        </div>
      )}
    </div>
  );
}
```

#### BreakPreview.tsx

**Purpose**: Preview for break/rest activities

```tsx
interface BreakPreviewProps {
  instruction: { en: string; ar: string };
  config: {
    duration?: number;
    message?: { en: string; ar: string };
  };
}

export function BreakPreview({ instruction, config }: BreakPreviewProps) {
  const { duration = 30, message } = config;

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-gradient-to-b from-green-50 to-blue-50">
      {/* Icon */}
      <div className="text-6xl mb-6">☕</div>

      {/* Message */}
      <h2 className="text-2xl font-bold text-center mb-2">
        {message?.en || instruction.en || "Take a break!"}
      </h2>
      <h3 className="text-2xl font-bold text-center mb-6" dir="rtl">
        {message?.ar || instruction.ar || "استرح قليلاً!"}
      </h3>

      {/* Duration */}
      <p className="text-lg text-gray-600">
        Duration: {duration} seconds
      </p>
    </div>
  );
}
```

#### PlaceholderPreview.tsx

**Purpose**: Fallback for activity types without preview yet

```tsx
interface PlaceholderPreviewProps {
  type: string;
}

export function PlaceholderPreview({ type }: PlaceholderPreviewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="text-6xl mb-6">🎨</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        Preview for "{type}"
      </h3>
      <p className="text-sm text-gray-500">
        Visual preview coming soon...
      </p>
      <p className="text-xs text-gray-400 mt-8">
        Activity will work correctly in the app
      </p>
    </div>
  );
}
```

---

## State Management

### MVP Approach: Local State

Use React's `useState` and `useContext` for simplicity:

```tsx
// BuilderContext.tsx
interface BuilderContextValue {
  selectedActivityId: string | null;
  setSelectedActivityId: (id: string | null) => void;
  formData: ActivityFormData;
  setFormData: (data: ActivityFormData) => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

export function BuilderProvider({ children }: { children: React.ReactNode }) {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ActivityFormData>({});
  const [isSaving, setIsSaving] = useState(false);

  return (
    <BuilderContext.Provider value={{
      selectedActivityId,
      setSelectedActivityId,
      formData,
      setFormData,
      isSaving,
      setIsSaving
    }}>
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (!context) throw new Error('useBuilder must be used within BuilderProvider');
  return context;
}
```

### Data Synchronization

**Load Activity Data**:
```tsx
// In FormPanel
const { data: activity } = useQuery({
  queryKey: ['activity', activityId],
  queryFn: () => getActivity(activityId!),
  enabled: !!activityId
});

useEffect(() => {
  if (activity) {
    setFormData({
      type: activity.type,
      instruction: activity.instruction,
      config: activity.config
    });
  }
}, [activity]);
```

**Save Activity Data**:
```tsx
// In BuilderLayout (save button handler)
const handleSave = async () => {
  setIsSaving(true);
  try {
    await updateActivity(selectedActivityId!, formData);
    toast.success('Activity saved!');
  } catch (error) {
    toast.error('Failed to save activity');
  } finally {
    setIsSaving(false);
  }
};
```

---

## Preview System

### Design Principles

1. **Not Fully Functional**: Previews show visual appearance, not full interactivity
2. **Lightweight**: Use simple React components, not React Native
3. **Approximate**: Close enough to give accurate impression
4. **Extensible**: Easy to add new preview types

### Preview Component Structure

Each preview receives:
```typescript
interface PreviewProps {
  instruction: { en: string; ar: string };
  config: Record<string, any>; // Activity-specific config
}
```

### Priority Order for Implementation

1. **High Priority** (Most used):
   - `tap` - Very common
   - `presentation` - Letter introduction
   - `intro` - Story/context screens

2. **Medium Priority**:
   - `multiple_choice` - Common assessment
   - `balloon` - Popular game mechanic
   - `write` - Tracing activities

3. **Low Priority** (Complex or less used):
   - `word_builder`
   - `name_builder`
   - `drag_drop`
   - `fishing`
   - `pizza`

4. **Minimal** (Simple):
   - `break` - Just show message

### Styling Guidelines

- Match mobile app's color scheme
- Use Arabic font: `Noto Sans Arabic` or `Cairo`
- Direction: `dir="rtl"` for Arabic text
- Size: Design for 375x812 (iPhone X)
- Colors: Use Tailwind's palette for consistency

---

## API Integration

### Existing API Functions (Reuse)

Located in `lib/api/curricula.ts`:

```typescript
// Fetch curriculum tree
export async function getCurriculumWithDetails(id: string): Promise<Curriculum> {
  // Returns curriculum with topics, nodes, and activities
}

// Get single activity
export async function getActivity(id: string): Promise<Activity> {
  // Returns activity details
}

// Update activity
export async function updateActivity(id: string, data: ActivityUpdateData): Promise<Activity> {
  // Updates activity in database
}

// Create activity
export async function createActivity(nodeId: string, data: ActivityCreateData): Promise<Activity> {
  // Creates new activity
}

// Delete activity
export async function deleteActivity(id: string): Promise<void> {
  // Deletes activity
}
```

### React Query Integration

```tsx
// Fetch curriculum tree
const { data: curriculum, isLoading } = useQuery({
  queryKey: ['curriculum', curriculumId],
  queryFn: () => getCurriculumWithDetails(curriculumId)
});

// Fetch single activity
const { data: activity } = useQuery({
  queryKey: ['activity', activityId],
  queryFn: () => getActivity(activityId!),
  enabled: !!activityId
});

// Save activity mutation
const updateMutation = useMutation({
  mutationFn: (data: ActivityUpdateData) => updateActivity(activityId!, data),
  onSuccess: () => {
    queryClient.invalidateQueries(['activity', activityId]);
    queryClient.invalidateQueries(['curriculum', curriculumId]);
    toast.success('Activity saved!');
  },
  onError: (error) => {
    toast.error('Failed to save activity');
    console.error(error);
  }
});
```

### Error Handling

```tsx
// Loading state
if (isLoading) {
  return <LoadingSpinner />;
}

// Error state
if (error) {
  return (
    <div className="p-6 text-center">
      <p className="text-red-600">Failed to load curriculum</p>
      <Button onClick={() => refetch()}>Retry</Button>
    </div>
  );
}

// Empty state
if (!curriculum) {
  return <EmptyState>Curriculum not found</EmptyState>;
}
```

---

## Code Examples

### Complete BuilderLayout Component

```tsx
// app/(dashboard)/curricula/[id]/builder/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurriculumWithDetails, updateActivity } from '@/lib/api/curricula';
import { NavigationPanel } from './components/NavigationPanel';
import { FormPanel } from './components/FormPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ActivityFormData {
  type: string;
  instruction: { en: string; ar: string };
  config: Record<string, any>;
}

export default function CurriculumBuilderPage({
  params
}: {
  params: { id: string }
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ActivityFormData>({
    type: 'tap',
    instruction: { en: '', ar: '' },
    config: {}
  });

  // Fetch curriculum tree
  const { data: curriculum, isLoading } = useQuery({
    queryKey: ['curriculum', params.id],
    queryFn: () => getCurriculumWithDetails(params.id)
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: () => updateActivity(selectedActivityId!, formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['activity', selectedActivityId]);
      queryClient.invalidateQueries(['curriculum', params.id]);
      toast.success('Activity saved successfully!');
    },
    onError: (error) => {
      toast.error('Failed to save activity');
      console.error(error);
    }
  });

  const handleSave = () => {
    if (!selectedActivityId) {
      toast.error('No activity selected');
      return;
    }
    saveMutation.mutate();
  };

  const handleBack = () => {
    router.push(`/curricula/${params.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p>Loading curriculum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="h-14 border-b flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="gap-2"
          >
            ← Back
          </Button>
          <h1 className="font-semibold text-lg">
            {curriculum?.title || 'Curriculum Builder'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {selectedActivityId && (
            <span className="text-sm text-gray-500">
              {saveMutation.isLoading ? 'Saving...' : 'Unsaved changes'}
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={!selectedActivityId || saveMutation.isLoading}
          >
            {saveMutation.isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </header>

      {/* 3-Panel Layout */}
      <div className="flex flex-1 overflow-hidden">
        <NavigationPanel
          curriculumId={params.id}
          selectedActivityId={selectedActivityId}
          onSelectActivity={setSelectedActivityId}
          className="w-[280px] border-r"
        />

        <FormPanel
          curriculumId={params.id}
          activityId={selectedActivityId}
          formData={formData}
          onChange={setFormData}
          className="flex-1"
        />

        <PreviewPanel
          formData={formData}
          className="w-[420px] border-l bg-gray-50"
        />
      </div>
    </div>
  );
}
```

### Navigation Panel with Tree

```tsx
// app/(dashboard)/curricula/[id]/builder/components/NavigationPanel.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCurriculumWithDetails } from '@/lib/api/curricula';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface NavigationPanelProps {
  curriculumId: string;
  selectedActivityId: string | null;
  onSelectActivity: (id: string) => void;
  className?: string;
}

export function NavigationPanel({
  curriculumId,
  selectedActivityId,
  onSelectActivity,
  className
}: NavigationPanelProps) {
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const { data: curriculum } = useQuery({
    queryKey: ['curriculum', curriculumId],
    queryFn: () => getCurriculumWithDetails(curriculumId)
  });

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

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

  return (
    <aside className={cn("overflow-y-auto bg-gray-50", className)}>
      <div className="p-4">
        <h2 className="font-semibold text-sm text-gray-500 uppercase mb-4">
          Structure
        </h2>

        {curriculum?.topics?.map(topic => {
          const isTopicExpanded = expandedTopics.has(topic.id);

          return (
            <div key={topic.id} className="mb-2">
              {/* Topic Header */}
              <button
                onClick={() => toggleTopic(topic.id)}
                className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-gray-100 rounded text-sm font-medium"
              >
                {isTopicExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                {topic.name}
              </button>

              {/* Nodes */}
              {isTopicExpanded && topic.nodes?.map(node => {
                const isNodeExpanded = expandedNodes.has(node.id);

                return (
                  <div key={node.id} className="ml-4 mt-1">
                    <button
                      onClick={() => toggleNode(node.id)}
                      className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-gray-100 rounded text-sm"
                    >
                      {isNodeExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      Node {node.sequence}
                    </button>

                    {/* Activities */}
                    {isNodeExpanded && node.activities?.map((activity, idx) => (
                      <button
                        key={activity.id}
                        onClick={() => onSelectActivity(activity.id)}
                        className={cn(
                          "ml-8 px-2 py-1.5 w-full text-left rounded text-sm flex items-center gap-2",
                          selectedActivityId === activity.id
                            ? "bg-primary text-white"
                            : "hover:bg-gray-100"
                        )}
                      >
                        <span className="text-xs opacity-70">
                          {getActivityIcon(activity.type)}
                        </span>
                        <span>Activity {idx + 1}</span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    tap: '👆',
    balloon: '🎈',
    write: '✏️',
    intro: '📖',
    presentation: '🔤',
    multiple_choice: '❓',
    drag_drop: '🎯',
    word_builder: '🔨',
    name_builder: '🏗️',
    fishing: '🎣',
    pizza: '🍕',
    break: '☕'
  };
  return icons[type] || '📝';
}
```

---

## Testing Considerations

### Manual Testing Checklist

**Navigation**:
- [ ] Click topics to expand/collapse
- [ ] Click nodes to expand/collapse
- [ ] Click activity to load in form/preview
- [ ] Verify correct activity is highlighted
- [ ] Test with deeply nested curriculum

**Form**:
- [ ] Load activity → form populates correctly
- [ ] Edit instruction → changes saved
- [ ] Edit config → changes saved
- [ ] Switch activity type → form updates
- [ ] Prev/Next buttons navigate correctly

**Preview**:
- [ ] Form changes → preview updates (with delay)
- [ ] Switch activity type → preview component changes
- [ ] Device selector → frame size changes
- [ ] Test all 4 implemented preview types

**Save**:
- [ ] Save button → saves to backend
- [ ] Success toast appears
- [ ] Form reloads with saved data
- [ ] Tree reflects changes

**Edge Cases**:
- [ ] No activity selected → form shows empty state
- [ ] Invalid activity ID → error handling
- [ ] Network error during save → error toast
- [ ] Curriculum with no activities → empty state

### Browser Testing

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile responsive (if needed)

### Performance Testing

- [ ] Curriculum with 100+ activities loads smoothly
- [ ] Form updates don't lag
- [ ] Preview debounce works (no excessive re-renders)
- [ ] Tree expand/collapse is snappy

---

## Future Enhancements

### Phase 2: More Previews
- Implement remaining 7 activity type previews
- Add basic interactivity (click to test)
- Add animation previews (balloon, fishing)

### Phase 3: Power Features
- **Keyboard shortcuts**:
  - `Cmd+S` - Save
  - `Cmd+D` - Duplicate activity
  - `Cmd+[/]` - Prev/Next activity
  - `Cmd+K` - Quick search
- **Auto-save**: Save draft every 3 seconds
- **Undo/Redo**: Track form changes
- **Copy/Paste**: Copy activity between nodes

### Phase 4: Advanced Tools
- **Play-through mode**: Test entire lesson flow
- **Asset library**: Browse and attach audio/images
- **Validation**: Real-time warnings for missing fields
- **Templates**: Quick-apply templates with variable substitution
- **Bulk operations**: Apply changes to multiple activities

### Phase 5: Collaboration
- **Version history**: See past changes
- **Comments**: Leave notes on activities
- **Review workflow**: Draft → Review → Approved
- **Multi-user**: See who's editing what

---

## Appendix

### Type Definitions

```typescript
// lib/schemas/curriculum.ts (subset)

interface Curriculum {
  id: string;
  title: string;
  letter_id: string;
  is_published: boolean;
  topics: Topic[];
}

interface Topic {
  id: string;
  curriculum_id: string;
  name: string;
  sequence: number;
  nodes: Node[];
}

interface Node {
  id: string;
  topic_id: string;
  sequence: number;
  type: string;
  position: { x: number; y: number };
  activities: Activity[];
}

interface Activity {
  id: string;
  node_id: string;
  type: ActivityType;
  sequence: number;
  instruction: {
    en: string;
    ar: string;
  };
  config: Record<string, any>;
  template_id?: string;
}

type ActivityType =
  | 'intro'
  | 'presentation'
  | 'tap'
  | 'write'
  | 'word_builder'
  | 'name_builder'
  | 'balloon'
  | 'multiple_choice'
  | 'drag_drop'
  | 'fishing'
  | 'pizza'
  | 'break';
```

### File Checklist

**New Files to Create**:
```
✅ app/(dashboard)/curricula/[id]/builder/
   ✅ page.tsx
   ✅ components/
      ✅ BuilderLayout.tsx (optional, logic can be in page.tsx)
      ✅ NavigationPanel.tsx
      ✅ FormPanel.tsx
      ✅ PreviewPanel.tsx

✅ components/curriculum/preview/
   ✅ ActivityPreview.tsx
   ✅ PhoneFrame.tsx
   ✅ DeviceSelector.tsx (optional, can inline)
   ✅ previews/
      ✅ TapPreview.tsx
      ✅ IntroPreview.tsx
      ✅ PresentationPreview.tsx
      ✅ BreakPreview.tsx
      ✅ PlaceholderPreview.tsx

✅ lib/hooks/ (optional)
   ✅ useDebounce.ts
   ✅ useBuilder.ts (if using context)
```

**Files to Modify**:
```
✅ app/(dashboard)/curricula/[id]/page.tsx
   - Add "Open Builder" button

✅ components/curriculum/forms/*.tsx (if needed)
   - Ensure forms work outside modal context
```

### Dependencies

**Required** (already installed):
```json
{
  "@tanstack/react-query": "^5.x",
  "next": "14.x",
  "react": "18.x",
  "tailwindcss": "^3.x",
  "sonner": "^1.x" // For toast notifications
}
```

**Optional** (may need to install):
```json
{
  "lucide-react": "^0.x", // For icons (ChevronRight, etc.)
  "clsx": "^2.x",         // For className utilities
  "tailwind-merge": "^2.x" // For cn() utility
}
```

---

## Quick Start Guide

### Step 1: Create Route
```bash
mkdir -p app/\(dashboard\)/curricula/\[id\]/builder/components
touch app/\(dashboard\)/curricula/\[id\]/builder/page.tsx
```

### Step 2: Create Preview Components
```bash
mkdir -p components/curriculum/preview/previews
touch components/curriculum/preview/ActivityPreview.tsx
touch components/curriculum/preview/PhoneFrame.tsx
touch components/curriculum/preview/previews/TapPreview.tsx
touch components/curriculum/preview/previews/PlaceholderPreview.tsx
```

### Step 3: Implement in Order
1. `BuilderLayout` (page.tsx) - Basic 3-panel layout
2. `NavigationPanel` - Tree view
3. `FormPanel` - Form integration
4. `PhoneFrame` - Device mockup
5. `ActivityPreview` - Preview router
6. `TapPreview` - First working preview
7. `PlaceholderPreview` - Fallback for others

### Step 4: Test
1. Navigate to `/curricula/[some-id]/builder`
2. Click activity in tree
3. Edit form
4. Watch preview update
5. Click save

---

## Contact & Support

For questions or issues during implementation:
1. Refer to existing code in `components/curriculum/`
2. Check type definitions in `lib/schemas/curriculum.ts`
3. Test API calls in `lib/api/curricula.ts`
4. Review backend service in `supabase/functions/curriculum/service.ts`

---

**Document Version**: 1.0
**Last Updated**: 2025-10-20
**Status**: Ready for Implementation
