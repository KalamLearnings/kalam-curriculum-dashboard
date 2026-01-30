'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient, createEnvironmentClient } from '@/lib/supabase/client';
import { useEnvironmentStore, type Environment } from '@/lib/stores/environmentStore';
import { useQueryClient } from '@tanstack/react-query';

const EMAIL_DOMAIN = '@kalamkidslearning.com';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { environment, setEnvironment } = useEnvironmentStore();
  const queryClient = useQueryClient();

  // Environment login dialog state
  const [showEnvLogin, setShowEnvLogin] = useState(false);
  const [envLoginTarget, setEnvLoginTarget] = useState<Environment>('dev');
  const [envLoginUsername, setEnvLoginUsername] = useState('');
  const [envLoginLoading, setEnvLoginLoading] = useState(false);
  const [envLoginSent, setEnvLoginSent] = useState(false);
  const [envLoginError, setEnvLoginError] = useState('');

  // Check if the target environment has a valid session
  const checkEnvSession = useCallback(async (env: Environment): Promise<boolean> => {
    try {
      // Temporarily set environment to check its session
      const prevEnv = useEnvironmentStore.getState().environment;
      useEnvironmentStore.getState().setEnvironment(env);
      const client = createEnvironmentClient();
      // Restore previous environment
      useEnvironmentStore.getState().setEnvironment(prevEnv);

      const { data: { session } } = await client.auth.getSession();
      return !!session;
    } catch {
      return false;
    }
  }, []);

  const handleEnvironmentSwitch = useCallback(async (env: Environment) => {
    if (env === environment) return;

    const hasSession = await checkEnvSession(env);

    if (hasSession) {
      setEnvironment(env);
      queryClient.clear();
    } else {
      // Pre-fill username from current user email
      if (user?.email) {
        const username = user.email.replace(EMAIL_DOMAIN, '');
        setEnvLoginUsername(username);
      }
      setEnvLoginTarget(env);
      setEnvLoginSent(false);
      setEnvLoginError('');
      setShowEnvLogin(true);
    }
  }, [environment, setEnvironment, queryClient, checkEnvSession, user]);

  const handleEnvLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvLoginError('');
    setEnvLoginLoading(true);

    try {
      // Temporarily set to target env to get the right client
      const prevEnv = useEnvironmentStore.getState().environment;
      useEnvironmentStore.getState().setEnvironment(envLoginTarget);
      const supabase = createEnvironmentClient();
      useEnvironmentStore.getState().setEnvironment(prevEnv);

      const email = `${envLoginUsername.trim()}${EMAIL_DOMAIN}`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback?env=${envLoginTarget}`,
        },
      });

      if (error) throw error;
      setEnvLoginSent(true);
    } catch (err: any) {
      setEnvLoginError(err.message);
    } finally {
      setEnvLoginLoading(false);
    }
  };

  const handleEnvLoginComplete = () => {
    setShowEnvLogin(false);
    setEnvironment(envLoginTarget);
    queryClient.clear();
  };

  // Dashboard auth check (uses default/primary Supabase project)
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      setLoading(false);
    });
  }, [router]);

  // Listen for environment session restoration after magic link callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const envParam = params.get('env') as Environment | null;

    if (envParam && (envParam === 'dev' || envParam === 'prod')) {
      // User just came back from a magic link for this environment
      setEnvironment(envParam);
      queryClient.clear();
      // Clean URL
      window.history.replaceState({}, '', pathname);
    }
  }, [pathname, setEnvironment, queryClient]);

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

  const navLinks = [
    { href: '/curricula', label: 'Curricula', icon: '📚' },
    { href: '/templates', label: 'Templates', icon: '📋' },
    { href: '/assets', label: 'Assets', icon: '🖼️' },
    { href: '/words', label: 'Words', icon: '📝' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold">Kalam Dashboard</h1>
              <div className="flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`
                        px-4 py-2 rounded-md text-sm font-medium transition-colors
                        ${isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <span className="mr-2">{link.icon}</span>
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleEnvironmentSwitch('dev')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    environment === 'dev'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  DEV
                </button>
                <button
                  onClick={() => handleEnvironmentSwitch('prod')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    environment === 'prod'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  PROD
                </button>
              </div>
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

      {/* Environment border indicator */}
      {environment === 'prod' && (
        <div className="h-1 bg-red-600" />
      )}

      {children}

      {/* Environment Login Dialog */}
      {showEnvLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                Sign in to{' '}
                <span className={envLoginTarget === 'prod' ? 'text-red-600' : 'text-amber-500'}>
                  {envLoginTarget.toUpperCase()}
                </span>
              </h2>
              <button
                onClick={() => setShowEnvLogin(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              You need to authenticate with the {envLoginTarget} environment to access its data.
            </p>

            {envLoginSent ? (
              <div className="text-center py-4">
                <p className="text-gray-700 mb-2">
                  Magic link sent to{' '}
                  <strong>{envLoginUsername.trim()}{EMAIL_DOMAIN}</strong>
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Click the link in your email, then come back here.
                </p>
                <button
                  onClick={handleEnvLoginComplete}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  I've signed in
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnvLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <div className="flex items-stretch">
                    <input
                      type="text"
                      value={envLoginUsername}
                      onChange={(e) => setEnvLoginUsername(e.target.value)}
                      placeholder="username"
                      className="flex-1 px-3 py-2 border border-gray-300 border-r-0 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                      disabled={envLoginLoading}
                    />
                    <div className="flex items-center px-3 py-2 bg-gray-100 border border-gray-300 border-l-0 rounded-r-md">
                      <span className="text-gray-600 text-sm whitespace-nowrap">
                        {EMAIL_DOMAIN}
                      </span>
                    </div>
                  </div>
                </div>

                {envLoginError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {envLoginError}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEnvLogin(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={envLoginLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    {envLoginLoading ? 'Sending...' : 'Send Magic Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
