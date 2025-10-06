# 🎯 Minimal Working Prototype

This creates a **functional dashboard in 15 minutes** that you can test immediately.

## Files to Create (7 total)

### 1. Configuration Files (Already provided)
- ✅ `package.json`
- ✅ `.env.local`
- ✅ `next.config.mjs`
- ✅ `tailwind.config.ts`
- ✅ `tsconfig.json`

### 2. Create These 7 Core Files

Run these commands to create the directory structure:

```bash
cd /Users/salehqadan/Projects/Kalam/kalam-curriculum-dashboard

# Create directories
mkdir -p app/{,\(auth\)/login,\(dashboard\)/curricula,api/auth/callback} lib/{supabase,api,utils} components/{auth,ui}

# Install dependencies
npm install
```

---

## 📄 File Contents

Copy each file exactly as shown below:

### File 1: `app/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}
```

### File 2: `lib/supabase/client.ts`
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### File 3: `lib/utils/validation.ts`
```typescript
const ALLOWED_DOMAIN = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN || '@kalamkidslearning.com';

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || !email.includes('@')) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (!email.endsWith(ALLOWED_DOMAIN)) {
    return { valid: false, error: `Only ${ALLOWED_DOMAIN} emails are allowed` };
  }

  return { valid: true };
}
```

### File 4: `app/layout.tsx`
```typescript
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kalam Dashboard',
  description: 'Curriculum Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### File 5: `app/(auth)/login/page.tsx`
```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { validateEmail } from '@/lib/utils/validation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = validateEmail(email);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (authError) throw authError;
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4 text-center">Check Your Email</h2>
          <p className="text-gray-600 text-center">
            We sent a magic link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Click the link to sign in
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-center mb-2">Kalam Dashboard</h1>
        <p className="text-gray-600 text-center mb-8">Sign in to manage curriculum</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@kalamkidslearning.com"
              className="w-full px-3 py-2 border rounded-md"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### File 6: `app/api/auth/callback/route.ts`
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL('/curricula', requestUrl.origin));
}
```

### File 7: `app/(dashboard)/curricula/page.tsx`
```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function CurriculaPage() {
  const [user, setUser] = useState<any>(null);
  const [curricula, setCurricula] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Check auth
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      loadCurricula();
    });

    async function loadCurricula() {
      try {
        const { data, error } = await supabase.functions.invoke('curriculum/list');
        if (error) throw error;
        setCurricula(data?.data || []);
      } catch (err) {
        console.error('Failed to load curricula:', err);
      } finally {
        setLoading(false);
      }
    }
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold">Kalam Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Curricula</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            + Create Curriculum
          </button>
        </div>

        {curricula.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No curricula found. Create your first one!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {curricula.map((curriculum) => (
                  <tr key={curriculum.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{curriculum.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {curriculum.title?.en || 'Untitled'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          curriculum.is_published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {curriculum.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <button className="text-blue-600 hover:text-blue-700 mr-4">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-700">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
```

---

## 🚀 Run the Prototype

```bash
npm run dev
```

Visit: **http://localhost:3001/login**

---

## ✅ What You'll See

1. **Login page** with email validation
2. **Magic link** sent to your email
3. **Dashboard** showing all curricula
4. **Sign out** button

---

## 🎯 Next Steps

After this works:

1. Add curriculum creation form
2. Add node builder
3. Add activity editor
4. Add asset uploader

You now have a **working foundation** to build on!
