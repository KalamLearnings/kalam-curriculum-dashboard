# Redesign Implementation Guide

This is the technical companion to `REDESIGN.md`. It contains code patterns, examples, and step-by-step implementation instructions.

---

## Phase 1: shadcn/ui Setup

### Step 1: Initialize shadcn/ui

```bash
npx shadcn@latest init
```

When prompted:
- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**
- Tailwind config: `tailwind.config.ts`
- Components directory: `components/ui`
- Utils: `lib/utils.ts` (already exists, will update)
- React Server Components: **Yes**

### Step 2: Install Base Components

```bash
# Core inputs
npx shadcn@latest add button input textarea select checkbox

# Dialogs
npx shadcn@latest add dialog alert-dialog sheet

# Display
npx shadcn@latest add card badge tooltip skeleton

# Forms
npx shadcn@latest add form label

# Navigation
npx shadcn@latest add tabs dropdown-menu command

# Feedback
npx shadcn@latest add toast
```

### Step 3: Update Tailwind Config

Replace `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Environment colors
        'env-dev': {
          DEFAULT: 'hsl(38, 92%, 50%)',  // amber-500
          foreground: 'hsl(38, 92%, 20%)',
          muted: 'hsl(48, 96%, 89%)',    // amber-100
        },
        'env-prod': {
          DEFAULT: 'hsl(0, 72%, 51%)',   // red-600
          foreground: 'hsl(0, 0%, 100%)',
          muted: 'hsl(0, 86%, 97%)',     // red-50
        },
        // shadcn/ui variables
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'ai-glow': {
          '0%, 100%': {
            boxShadow: '0 0 8px rgba(168, 85, 247, 0.4), 0 0 20px rgba(168, 85, 247, 0.15)',
          },
          '50%': {
            boxShadow: '0 0 16px rgba(168, 85, 247, 0.6), 0 0 40px rgba(168, 85, 247, 0.25)',
          },
        },
        'ai-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'ai-border-glow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'ai-glow': 'ai-glow 2s ease-in-out infinite',
        'ai-shimmer': 'ai-shimmer 3s linear infinite',
        'ai-border-glow': 'ai-border-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

### Step 4: Update globals.css

Update `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 263 70% 50%;           /* Kalam purple */
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
    --ring: 263 70% 50%;
    --radius: 0.5rem;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
  }
}

/* Arabic font support */
.font-arabic {
  font-family: 'Noto Sans Arabic', 'Arial', sans-serif;
}

/* RTL support */
[dir='rtl'] {
  text-align: right;
}
```

---

## Phase 2: Custom Components

### EnvironmentBanner

```typescript
// components/shared/environment-banner.tsx
'use client';

import { AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Environment } from '@/lib/stores/environmentStore';

interface EnvironmentBannerProps {
  environment: Environment;
  onSwitchRequest: () => void;
  className?: string;
}

export function EnvironmentBanner({
  environment,
  onSwitchRequest,
  className,
}: EnvironmentBannerProps) {
  if (environment === 'dev') {
    // Subtle indicator for DEV
    return (
      <div
        className={cn(
          'h-1 bg-env-dev',
          className
        )}
        title="Development Environment"
      />
    );
  }

  // Prominent warning for PROD
  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-2 bg-env-prod text-env-prod-foreground',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">
          Production Mode - Changes affect live users
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onSwitchRequest}
        className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
      >
        <ArrowRightLeft className="h-3 w-3 mr-1" />
        Switch to DEV
      </Button>
    </div>
  );
}
```

### SearchInput

```typescript
// components/shared/search-input.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  loading?: boolean;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  loading = false,
  className,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [localValue, onChange, debounceMs]);

  // Sync external changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {loading ? (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
      ) : localValue ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      ) : null}
    </div>
  );
}
```

### CategoryFilter

```typescript
// components/shared/category-filter.tsx
'use client';

import { cn } from '@/lib/utils';

interface Category<T extends string> {
  value: T;
  label: string;
  icon?: string;
  count?: number;
}

interface CategoryFilterProps<T extends string> {
  categories: Category<T>[];
  selected?: T;
  onChange: (value: T | undefined) => void;
  allLabel?: string;
  allIcon?: string;
  totalCount?: number;
  color?: 'primary' | 'purple' | 'blue';
  className?: string;
}

export function CategoryFilter<T extends string>({
  categories,
  selected,
  onChange,
  allLabel = 'All',
  allIcon = '🗂️',
  totalCount,
  color = 'primary',
  className,
}: CategoryFilterProps<T>) {
  const colorClasses = {
    primary: {
      active: 'bg-primary text-primary-foreground',
      inactive: 'bg-muted text-muted-foreground hover:bg-muted/80',
      count: 'bg-primary/20',
      countActive: 'bg-primary-foreground/20',
    },
    purple: {
      active: 'bg-purple-600 text-white',
      inactive: 'bg-muted text-muted-foreground hover:bg-muted/80',
      count: 'bg-purple-100',
      countActive: 'bg-purple-500',
    },
    blue: {
      active: 'bg-blue-600 text-white',
      inactive: 'bg-muted text-muted-foreground hover:bg-muted/80',
      count: 'bg-blue-100',
      countActive: 'bg-blue-500',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={cn('flex items-center gap-2 overflow-x-auto pb-2', className)}>
      {/* All button */}
      <button
        onClick={() => onChange(undefined)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors',
          !selected ? colors.active : colors.inactive
        )}
      >
        {allIcon && <span>{allIcon}</span>}
        <span>{allLabel}</span>
        {totalCount !== undefined && (
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              !selected ? colors.countActive : colors.count
            )}
          >
            {totalCount}
          </span>
        )}
      </button>

      {/* Category buttons */}
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onChange(category.value)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors',
            selected === category.value ? colors.active : colors.inactive
          )}
        >
          {category.icon && <span>{category.icon}</span>}
          <span>{category.label}</span>
          {category.count !== undefined && (
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full',
                selected === category.value ? colors.countActive : colors.count
              )}
            >
              {category.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
```

### MediaCard

```typescript
// components/shared/media-card.tsx
'use client';

import { useState } from 'react';
import { Play, Pause, Trash2, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface MediaCardProps {
  type: 'image' | 'audio' | 'word';
  id: string;
  name: string;
  displayName: string;
  previewUrl?: string;
  tags?: string[];
  category?: string;
  isSelected?: boolean;
  selectable?: boolean;
  deletable?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  // Audio-specific
  duration?: number;
  audioUrl?: string;
  className?: string;
}

export function MediaCard({
  type,
  id,
  name,
  displayName,
  previewUrl,
  tags = [],
  category,
  isSelected = false,
  selectable = false,
  deletable = false,
  onSelect,
  onDelete,
  duration,
  audioUrl,
  className,
}: MediaCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioUrl) return;

    if (isPlaying && audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
    } else {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setAudioElement(audio);
      setIsPlaying(true);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect();
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '--:--';
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card
      onClick={handleClick}
      className={cn(
        'relative group overflow-hidden transition-all',
        selectable && 'cursor-pointer hover:scale-[1.02]',
        isSelected && 'ring-2 ring-primary ring-offset-2',
        isDeleting && 'opacity-50 pointer-events-none',
        className
      )}
    >
      {/* Preview Area */}
      <div className="aspect-square bg-muted flex items-center justify-center relative">
        {type === 'image' && (
          imageError ? (
            <div className="flex flex-col items-center text-muted-foreground">
              <span className="text-3xl mb-1">🖼️</span>
              <span className="text-xs">Failed to load</span>
            </div>
          ) : (
            <img
              src={previewUrl}
              alt={displayName}
              className="w-full h-full object-contain p-2"
              onError={() => setImageError(true)}
            />
          )
        )}

        {type === 'audio' && (
          <div className="flex flex-col items-center">
            <Button
              variant={isPlaying ? 'default' : 'outline'}
              size="lg"
              className="rounded-full w-16 h-16"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-1" />
              )}
            </Button>
            {duration && (
              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                {formatDuration(duration)}
              </span>
            )}
          </div>
        )}

        {type === 'word' && (
          <div className="text-center">
            <span className="text-4xl font-arabic">{displayName}</span>
          </div>
        )}

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center">
            <Check className="h-4 w-4" />
          </div>
        )}

        {/* Delete button */}
        {deletable && onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 left-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {type}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{displayName}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Info */}
      <CardContent className="p-3">
        <p className="text-sm font-medium truncate" title={displayName}>
          {displayName}
        </p>
        {category && (
          <p className="text-xs text-muted-foreground mt-0.5">{category}</p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{tags.length - 2}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### MediaGrid

```typescript
// components/shared/media-grid.tsx
'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MediaGridProps<T> {
  items: T[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  emptyIcon?: string;
  className?: string;
  renderItem: (item: T) => React.ReactNode;
}

export function MediaGrid<T>({
  items,
  loading = false,
  error = null,
  emptyMessage = 'No items found',
  emptyIcon = '📦',
  className,
  renderItem,
}: MediaGridProps<T>) {
  // Loading state
  if (loading) {
    return (
      <div className={cn(
        'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4',
        className
      )}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <span className="text-4xl mb-3 block">⚠️</span>
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center border-2 border-dashed border-muted rounded-lg p-8">
          <span className="text-4xl mb-3 block">{emptyIcon}</span>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Grid
  return (
    <div className={cn(
      'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4',
      className
    )}>
      {items.map((item) => renderItem(item))}
    </div>
  );
}
```

### EmptyState

```typescript
// components/shared/empty-state.tsx
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon = '📦',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

### FormField (Enhanced)

```typescript
// components/shared/form-field.tsx
'use client';

import { HelpCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  tooltip?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required = false,
  hint,
  error,
  tooltip,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-1">
        <Label htmlFor={htmlFor} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger type="button" className="text-muted-foreground hover:text-foreground">
                <HelpCircle className="h-3.5 w-3.5" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
```

### PageHeader

```typescript
// components/shared/page-header.tsx
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-8', className)}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {action && (
          <Button onClick={action.onClick}>
            {action.icon}
            {action.label}
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}
```

---

## Phase 3: Page Migration Example

### Assets Page (Before)

The current `app/(dashboard)/assets/page.tsx` is 192 lines with:
- Custom drag handling
- Inline state management
- Raw Tailwind classes
- Separate components for search, filter, grid

### Assets Page (After)

```typescript
// app/(dashboard)/assets/page.tsx
'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAssets } from '@/lib/hooks/useAssets';
import { PageHeader } from '@/components/shared/page-header';
import { SearchInput } from '@/components/shared/search-input';
import { CategoryFilter } from '@/components/shared/category-filter';
import { MediaGrid } from '@/components/shared/media-grid';
import { MediaCard } from '@/components/shared/media-card';
import { UploadDialog } from '@/components/shared/upload-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { ASSET_CATEGORIES, type AssetCategory } from '@/lib/types/assets';

export default function AssetsPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);

  const {
    assets,
    loading,
    error,
    selectedCategory,
    searchQuery,
    uploadNewAsset,
    removeAsset,
    setCategory,
    setSearchQuery,
  } = useAssets({ autoLoad: true });

  const categories = Object.entries(ASSET_CATEGORIES).map(([value, { label, icon }]) => ({
    value: value as AssetCategory,
    label,
    icon,
  }));

  const handleUpload = async (data: any) => {
    await uploadNewAsset(data);
    setDroppedFile(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setDroppedFile(file);
      setUploadOpen(true);
    }
  };

  return (
    <div
      className="min-h-screen bg-background py-8"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Asset Library"
          description="Upload once, use everywhere in your curriculum"
          action={{
            label: 'Upload Asset',
            icon: <Plus className="h-4 w-4 mr-2" />,
            onClick: () => setUploadOpen(true),
          }}
        >
          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground mt-4">
            <div>
              <span className="font-semibold text-foreground">{assets.length}</span> assets
            </div>
            {selectedCategory && (
              <div className="text-primary">Filtered by category</div>
            )}
            {searchQuery && (
              <div className="text-primary">Search results for "{searchQuery}"</div>
            )}
          </div>
        </PageHeader>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4 space-y-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search assets by name or tag..."
            />
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onChange={setCategory}
              totalCount={assets.length}
              color="blue"
            />
          </CardContent>
        </Card>

        {/* Grid */}
        <Card>
          <CardContent className="p-6">
            <MediaGrid
              items={assets}
              loading={loading}
              error={error}
              emptyMessage={
                searchQuery
                  ? `No assets found matching "${searchQuery}"`
                  : selectedCategory
                  ? 'No assets in this category yet'
                  : 'No assets uploaded yet. Click "Upload Asset" to get started!'
              }
              emptyIcon="📦"
              renderItem={(asset) => (
                <MediaCard
                  key={asset.id}
                  type="image"
                  id={asset.id}
                  name={asset.name}
                  displayName={asset.displayName}
                  previewUrl={asset.url}
                  tags={asset.tags}
                  category={asset.category}
                  deletable
                  onDelete={() => removeAsset(asset.id)}
                />
              )}
            />
          </CardContent>
        </Card>
      </div>

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUpload={handleUpload}
        initialFile={droppedFile}
        type="image"
      />
    </div>
  );
}
```

**Result**: ~100 lines vs 192 lines, cleaner, more maintainable.

---

## Migration Checklist

### Per-Component Migration

For each component being migrated:

- [ ] Identify all usages in codebase
- [ ] Create new component with shadcn/ui
- [ ] Test with one usage
- [ ] Migrate all usages
- [ ] Delete old component
- [ ] Update imports
- [ ] Verify functionality

### Per-Page Migration

For each page being migrated:

- [ ] Identify all components used
- [ ] Ensure shared components exist
- [ ] Rewrite page using new components
- [ ] Test all user flows
- [ ] Test environment switching
- [ ] Test loading/error states
- [ ] Verify accessibility

---

## Environment-Aware Patterns

### Confirmation for PROD Actions

```typescript
// Example: Delete in PROD requires extra confirmation
function DeleteButton({ environment, onDelete }: Props) {
  const [confirmText, setConfirmText] = useState('');

  if (environment === 'prod') {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Delete in Production?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will affect live users. Type "DELETE" to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder='Type "DELETE"'
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={confirmText !== 'DELETE'}
              onClick={onDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // DEV: Simple confirmation
  return (
    <AlertDialog>
      {/* ... simpler dialog ... */}
    </AlertDialog>
  );
}
```

### Query Key Naming

All queries should include environment for proper cache isolation:

```typescript
// Current (environment handled via separate clients)
queryKey: ['curricula']

// This is fine because queryClient.clear() is called on env switch
// No changes needed to query keys
```

---

## Accessibility Requirements

### Keyboard Navigation

- All interactive elements must be focusable
- Tab order should follow visual order
- Escape closes modals/dropdowns
- Enter/Space activates buttons
- Arrow keys navigate within components (tabs, grids)

### Screen Reader Support

- All images have alt text
- Icon buttons have aria-label
- Loading states announced
- Errors announced
- Modal titles announced

### Color Contrast

- All text meets WCAG AA (4.5:1 for normal, 3:1 for large)
- Don't rely on color alone for meaning
- Environment indicators have text labels too

---

## Testing Requirements

### Setup Testing Infrastructure

The project currently has minimal testing. Add:

```bash
npm install -D vitest @testing-library/react @testing-library/user-event @vitejs/plugin-react jsdom @testing-library/jest-dom
```

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['components/**/*.tsx', 'lib/**/*.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

Create `vitest.setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
}));

// Mock environment store
vi.mock('@/lib/stores/environmentStore', () => ({
  useEnvironmentStore: () => ({
    environment: 'dev',
    setEnvironment: vi.fn(),
  }),
  getPersistedEnvironment: () => 'dev',
  getConfigForEnvironment: () => ({
    url: 'http://localhost:54321',
    anonKey: 'test-key',
  }),
}));
```

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Component Test Examples

#### Button Component Test

```typescript
// components/ui/button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders correct variant styles', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');

    rerender(<Button variant="outline">Cancel</Button>);
    expect(screen.getByRole('button')).toHaveClass('border');
  });
});
```

#### SearchInput Component Test

```typescript
// components/shared/search-input.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from './search-input';

describe('SearchInput', () => {
  it('renders with placeholder', () => {
    render(<SearchInput value="" onChange={() => {}} placeholder="Search..." />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('debounces onChange calls', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} debounceMs={100} />);

    await user.type(screen.getByRole('textbox'), 'test');
    
    // Should not be called immediately
    expect(onChange).not.toHaveBeenCalled();

    // Should be called after debounce
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('test');
    }, { timeout: 200 });
  });

  it('shows clear button when value exists', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchInput value="test" onChange={onChange} />);

    const clearButton = screen.getByRole('button');
    await user.click(clearButton);

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('shows loading spinner when loading', () => {
    render(<SearchInput value="" onChange={() => {}} loading />);
    // Loading spinner should be visible (check for animate-spin class)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
```

#### MediaCard Component Test

```typescript
// components/shared/media-card.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaCard } from './media-card';

describe('MediaCard', () => {
  const defaultProps = {
    type: 'image' as const,
    id: 'test-id',
    name: 'test.png',
    displayName: 'Test Image',
    previewUrl: 'https://example.com/test.png',
  };

  it('renders image with correct alt text', () => {
    render(<MediaCard {...defaultProps} />);
    expect(screen.getByAltText('Test Image')).toBeInTheDocument();
  });

  it('shows selection indicator when selected', () => {
    render(<MediaCard {...defaultProps} isSelected />);
    // Check icon is rendered
    expect(document.querySelector('[class*="ring-primary"]')).toBeInTheDocument();
  });

  it('calls onSelect when clicked in selectable mode', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<MediaCard {...defaultProps} selectable onSelect={onSelect} />);

    await user.click(screen.getByText('Test Image').closest('div')!);
    expect(onSelect).toHaveBeenCalled();
  });

  it('shows delete confirmation dialog', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<MediaCard {...defaultProps} deletable onDelete={onDelete} />);

    // Hover to show delete button (in tests, it's always visible)
    const deleteButton = document.querySelector('[class*="destructive"]');
    expect(deleteButton).toBeInTheDocument();
  });

  it('handles audio playback', async () => {
    const user = userEvent.setup();
    
    // Mock HTMLAudioElement
    const playMock = vi.fn();
    window.HTMLAudioElement.prototype.play = playMock;

    render(
      <MediaCard
        type="audio"
        id="audio-id"
        name="test.mp3"
        displayName="Test Audio"
        audioUrl="https://example.com/test.mp3"
        duration={60000}
      />
    );

    const playButton = screen.getByRole('button');
    await user.click(playButton);

    expect(playMock).toHaveBeenCalled();
  });
});
```

#### Environment Banner Test

```typescript
// components/shared/environment-banner.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnvironmentBanner } from './environment-banner';

describe('EnvironmentBanner', () => {
  it('shows minimal indicator for DEV', () => {
    render(<EnvironmentBanner environment="dev" onSwitchRequest={() => {}} />);
    
    // DEV should be a thin bar, not prominent
    const banner = document.querySelector('.h-1');
    expect(banner).toBeInTheDocument();
    expect(screen.queryByText(/production/i)).not.toBeInTheDocument();
  });

  it('shows prominent warning for PROD', () => {
    render(<EnvironmentBanner environment="prod" onSwitchRequest={() => {}} />);
    
    expect(screen.getByText(/production mode/i)).toBeInTheDocument();
    expect(screen.getByText(/changes affect live users/i)).toBeInTheDocument();
  });

  it('calls onSwitchRequest when switch button clicked in PROD', async () => {
    const user = userEvent.setup();
    const onSwitchRequest = vi.fn();
    render(<EnvironmentBanner environment="prod" onSwitchRequest={onSwitchRequest} />);

    await user.click(screen.getByRole('button', { name: /switch to dev/i }));
    expect(onSwitchRequest).toHaveBeenCalled();
  });
});
```

### Integration Test Examples

#### Assets Page Integration Test

```typescript
// app/(dashboard)/assets/page.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AssetsPage from './page';

// Mock the hooks
vi.mock('@/lib/hooks/useAssets', () => ({
  useAssets: () => ({
    assets: [
      { id: '1', name: 'apple.png', displayName: 'Apple', url: 'https://example.com/apple.png', category: 'fruits', tags: ['fruit', 'red'] },
      { id: '2', name: 'cat.png', displayName: 'Cat', url: 'https://example.com/cat.png', category: 'animals', tags: ['animal'] },
    ],
    loading: false,
    error: null,
    selectedCategory: undefined,
    searchQuery: '',
    uploadNewAsset: vi.fn(),
    removeAsset: vi.fn(),
    setCategory: vi.fn(),
    setSearchQuery: vi.fn(),
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('AssetsPage', () => {
  it('renders page header', () => {
    render(<AssetsPage />, { wrapper: createWrapper() });
    expect(screen.getByText('Asset Library')).toBeInTheDocument();
  });

  it('renders asset count', () => {
    render(<AssetsPage />, { wrapper: createWrapper() });
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('assets')).toBeInTheDocument();
  });

  it('renders asset cards', () => {
    render(<AssetsPage />, { wrapper: createWrapper() });
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Cat')).toBeInTheDocument();
  });

  it('renders upload button', () => {
    render(<AssetsPage />, { wrapper: createWrapper() });
    expect(screen.getByRole('button', { name: /upload asset/i })).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<AssetsPage />, { wrapper: createWrapper() });
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('renders category filter', () => {
    render(<AssetsPage />, { wrapper: createWrapper() });
    expect(screen.getByText('All')).toBeInTheDocument();
  });
});
```

### E2E Test Examples (Playwright)

For critical user flows, add Playwright tests:

```bash
npm install -D @playwright/test
npx playwright install
```

```typescript
// e2e/assets.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Assets Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth - set localStorage token
    await page.addInitScript(() => {
      localStorage.setItem('kalam-auth-dev', JSON.stringify({
        access_token: 'test-token',
        refresh_token: 'test-refresh',
        expires_at: Date.now() / 1000 + 3600,
      }));
      localStorage.setItem('kalam-environment', JSON.stringify({
        state: { environment: 'dev' },
      }));
    });
  });

  test('can search assets', async ({ page }) => {
    await page.goto('/assets');
    
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('apple');
    
    // Wait for debounce
    await page.waitForTimeout(400);
    
    // Should show filtered results
    await expect(page.getByText('Apple')).toBeVisible();
  });

  test('can filter by category', async ({ page }) => {
    await page.goto('/assets');
    
    await page.getByRole('button', { name: /fruits/i }).click();
    
    // Should show only fruits
    await expect(page.getByText('Apple')).toBeVisible();
  });

  test('can upload asset', async ({ page }) => {
    await page.goto('/assets');
    
    await page.getByRole('button', { name: /upload asset/i }).click();
    
    // Dialog should appear
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('shows environment indicator', async ({ page }) => {
    await page.goto('/assets');
    
    // DEV environment should show subtle indicator
    await expect(page.locator('.bg-env-dev')).toBeVisible();
  });
});
```

### Test Coverage Requirements

| Category | Minimum Coverage |
|----------|-----------------|
| UI Components (`components/ui/`) | 80% |
| Shared Components (`components/shared/`) | 90% |
| Hooks (`lib/hooks/`) | 70% |
| Utils (`lib/utils/`) | 90% |
| Pages | Integration tests for critical flows |

### What to Test

**Always test**:
- User interactions (click, type, select)
- Loading states
- Error states
- Empty states
- Environment-specific behavior (DEV vs PROD)
- Accessibility (keyboard nav, aria labels)

**Don't test**:
- shadcn/ui internal implementation
- Third-party library internals
- CSS styling (use visual regression if needed)

### CI Integration

Add to `.github/workflows/test.yml`:

```yaml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test -- --run
      
      - name: Run E2E tests
        run: npx playwright test
```

---

## Questions to Answer Before Starting

1. **shadcn/ui version**: Latest stable (check npm)
2. **Keep AIEffects?**: Yes, keep `components/ui/AIEffects.tsx` as-is
3. **Keep activity forms?**: Yes, keep `components/curriculum/forms/*`, just update to use new inputs
4. **Dark mode?**: No, not in scope
5. **Mobile responsive?**: Yes, current breakpoints are good
6. **RTL support?**: Yes, preserve `dir="rtl"` for Arabic inputs
7. **Test coverage target?**: 80% for components, integration tests for critical flows
