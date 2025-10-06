# Kalam Curriculum Dashboard - Complete Implementation Guide

## 🎯 Overview

Full-featured Next.js dashboard for managing Kalam Arabic learning curriculum with:
- ✅ Magic link authentication (kalamkidslearning.com emails only)
- ✅ Curriculum CRUD with visual node builder
- ✅ Dynamic activity editor with type-based forms
- ✅ Asset management with drag-and-drop upload
- ✅ Analytics and version control
- ✅ Multi-user collaboration

---

## 📦 Project Setup

### **1. Installation**

```bash
cd /Users/salehqadan/Projects/Kalam

# Create Next.js app
npx create-next-app@latest kalam-curriculum-dashboard \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd kalam-curriculum-dashboard

# Core dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install react-hook-form @hookform/resolvers zod
npm install @tanstack/react-query
npm install react-dropzone lucide-react
npm install date-fns recharts

# UI Components (Radix UI)
npm install @radix-ui/react-dialog
npm install @radix-ui/react-select
npm install @radix-ui/react-tabs
npm install @radix-ui/react-toast
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-slot

# Utilities
npm install class-variance-authority clsx tailwind-merge
```

### **2. Environment Variables**

Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=http://192.168.5.165:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=@kalamkidslearning.com
```

---

## 📁 Complete File Structure

```
kalam-curriculum-dashboard/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx                 # Magic link login
│   │   └── layout.tsx                   # Auth layout
│   │
│   ├── (dashboard)/
│   │   ├── curricula/
│   │   │   ├── page.tsx                 # List curricula
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx            # Edit curriculum
│   │   │   │   ├── nodes/
│   │   │   │   │   └── [nodeId]/
│   │   │   │   │       └── page.tsx    # Edit node activities
│   │   │   │   └── preview/
│   │   │   │       └── page.tsx        # Preview curriculum
│   │   │   └── new/
│   │   │       └── page.tsx            # Create curriculum
│   │   │
│   │   ├── assets/
│   │   │   ├── page.tsx                # Asset browser
│   │   │   └── upload/
│   │   │       └── page.tsx            # Bulk upload
│   │   │
│   │   ├── presets/
│   │   │   └── page.tsx                # Activity presets
│   │   │
│   │   ├── analytics/
│   │   │   └── page.tsx                # Dashboard analytics
│   │   │
│   │   └── layout.tsx                  # Dashboard layout with nav
│   │
│   ├── api/
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts            # Magic link callback
│   │
│   ├── layout.tsx                       # Root layout
│   └── page.tsx                         # Home/redirect
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx               # Magic link form
│   │   └── AuthGuard.tsx               # Protect routes
│   │
│   ├── curriculum/
│   │   ├── CurriculumList.tsx          # Table of curricula
│   │   ├── CurriculumForm.tsx          # Create/edit form
│   │   ├── NodeBuilder.tsx             # Visual node positioning
│   │   ├── NodeForm.tsx                # Create/edit nodes
│   │   ├── ActivityEditor.tsx          # Dynamic activity form
│   │   ├── ActivityList.tsx            # Drag-drop activities
│   │   └── CurriculumPreview.tsx       # Render like mobile
│   │
│   ├── assets/
│   │   ├── AssetUploader.tsx           # Drag-drop upload
│   │   ├── AssetBrowser.tsx            # Browse by category
│   │   ├── AudioPlayer.tsx             # Preview audio
│   │   └── BulkUpload.tsx              # Batch upload
│   │
│   ├── presets/
│   │   ├── PresetList.tsx              # Activity presets
│   │   └── PresetForm.tsx              # Create preset
│   │
│   ├── analytics/
│   │   ├── UsageChart.tsx              # Curriculum stats
│   │   ├── StorageStats.tsx            # Asset usage
│   │   └── ActivityBreakdown.tsx       # Activity types
│   │
│   ├── ui/                              # Reusable UI
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   └── toast.tsx
│   │
│   └── layout/
│       ├── Sidebar.tsx                 # Navigation
│       ├── Header.tsx                  # Top bar
│       └── Breadcrumbs.tsx             # Navigation path
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser client
│   │   ├── server.ts                   # Server client
│   │   └── middleware.ts               # Auth middleware
│   │
│   ├── api/
│   │   ├── curriculum.ts               # Curriculum API
│   │   ├── assets.ts                   # Asset API
│   │   ├── presets.ts                  # Presets API
│   │   └── analytics.ts                # Analytics API
│   │
│   ├── schemas/
│   │   ├── curriculum.ts               # Zod schemas
│   │   ├── activity.ts
│   │   └── asset.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                  # Auth hook
│   │   ├── useCurriculum.ts            # Curriculum queries
│   │   └── useAssets.ts                # Asset queries
│   │
│   └── utils/
│       ├── cn.ts                       # Class merge utility
│       ├── validation.ts               # Email validation
│       └── formatting.ts               # Data formatting
│
├── types/
│   ├── curriculum.ts                   # Curriculum types
│   ├── activity.ts                     # Activity types
│   └── asset.ts                        # Asset types
│
├── .env.local                          # Environment variables
├── next.config.js                      # Next.js config
├── tailwind.config.ts                  # Tailwind config
├── tsconfig.json                       # TypeScript config
└── package.json                        # Dependencies
```

---

## 🔐 Phase 1: Authentication Setup

### **lib/supabase/client.ts**
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createClientComponentClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
});
```

### **lib/utils/validation.ts**
```typescript
const ALLOWED_DOMAIN = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN!;

export function isAllowedEmail(email: string): boolean {
  return email.endsWith(ALLOWED_DOMAIN);
}

export function validateEmail(email: string) {
  if (!email.includes('@')) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (!isAllowedEmail(email)) {
    return {
      valid: false,
      error: `Only ${ALLOWED_DOMAIN} emails are allowed`,
    };
  }

  return { valid: true };
}
```

### **components/auth/LoginForm.tsx**
```typescript
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { validateEmail } from '@/lib/utils/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email domain
    const validation = validateEmail(email);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Check your email</h2>
        <p className="text-gray-600">
          We've sent a magic link to {email}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Click the link to sign in (check your spam folder)
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Email Address
        </label>
        <Input
          type="email"
          placeholder="you@kalamkidslearning.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">
          Only @kalamkidslearning.com emails allowed
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Sending...' : 'Send Magic Link'}
      </Button>
    </form>
  );
}
```

### **app/(auth)/login/page.tsx**
```typescript
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Kalam Dashboard</h1>
          <p className="text-gray-600 mt-2">Sign in to manage curriculum</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
```

### **app/api/auth/callback/route.ts**
```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to dashboard
  return NextResponse.redirect(new URL('/curricula', requestUrl.origin));
}
```

---

## 📚 Phase 2-3: Implementation Files

Due to the extensive nature of this implementation (100+ files), I recommend:

1. **Use the file structure above as a blueprint**
2. **I'll provide key component implementations**
3. **You can generate remaining UI components using shadcn/ui**

Would you like me to:

**Option A**: Provide the 10-15 most critical component files (CurriculumForm, NodeBuilder, ActivityEditor, etc.)

**Option B**: Create a complete starter template with all phases as separate PRs you can review

**Option C**: Focus on getting Phase 1 working first (CRUD only), then incrementally add Phase 2 & 3

Which approach would you prefer? This will ensure you get a working dashboard efficiently.
