'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEnvironmentStore, type Environment, getPersistedEnvironment } from '@/lib/stores/environmentStore';
import { getClientForEnv } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const EMAIL_DOMAIN = '@kalamkidslearning.com';
const OTP_LENGTH = 6;

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
  const [envLoginOtp, setEnvLoginOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [envLoginVerifying, setEnvLoginVerifying] = useState(false);
  const envOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check if the target environment has a valid session
  const checkEnvSession = useCallback(async (env: Environment): Promise<boolean> => {
    try {
      const client = getClientForEnv(env);
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
      const supabase = getClientForEnv(envLoginTarget);

      const email = `${envLoginUsername.trim()}${EMAIL_DOMAIN}`;
      const { error } = await supabase.auth.signInWithOtp({ email });

      if (error) throw error;
      setEnvLoginSent(true);
      setTimeout(() => envOtpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setEnvLoginError(err.message);
    } finally {
      setEnvLoginLoading(false);
    }
  };

  const handleEnvOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...envLoginOtp];
    newOtp[index] = value;
    setEnvLoginOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      envOtpRefs.current[index + 1]?.focus();
    }

    if (value && newOtp.every((d) => d !== '')) {
      verifyEnvOtp(newOtp.join(''));
    }
  };

  const handleEnvOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !envLoginOtp[index] && index > 0) {
      envOtpRefs.current[index - 1]?.focus();
    }
  };

  const handleEnvOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newOtp = [...envLoginOtp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setEnvLoginOtp(newOtp);

    const nextEmpty = newOtp.findIndex((d) => d === '');
    envOtpRefs.current[nextEmpty >= 0 ? nextEmpty : OTP_LENGTH - 1]?.focus();

    if (newOtp.every((d) => d !== '')) {
      verifyEnvOtp(newOtp.join(''));
    }
  };

  const verifyEnvOtp = async (token: string) => {
    setEnvLoginError('');
    setEnvLoginVerifying(true);

    try {
      const supabase = getClientForEnv(envLoginTarget);
      const email = `${envLoginUsername.trim()}${EMAIL_DOMAIN}`;
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      if (error) throw error;

      setShowEnvLogin(false);
      setEnvLoginOtp(Array(OTP_LENGTH).fill(''));
      setEnvironment(envLoginTarget);
      queryClient.clear();
    } catch (err: any) {
      setEnvLoginError(err.message);
      setEnvLoginOtp(Array(OTP_LENGTH).fill(''));
      envOtpRefs.current[0]?.focus();
    } finally {
      setEnvLoginVerifying(false);
    }
  };

  const handleEnvResend = async () => {
    setEnvLoginError('');
    setEnvLoginLoading(true);
    setEnvLoginOtp(Array(OTP_LENGTH).fill(''));

    try {
      const supabase = getClientForEnv(envLoginTarget);
      const email = `${envLoginUsername.trim()}${EMAIL_DOMAIN}`;
      const { error } = await supabase.auth.signInWithOtp({ email });

      if (error) throw error;
      envOtpRefs.current[0]?.focus();
    } catch (err: any) {
      setEnvLoginError(err.message);
    } finally {
      setEnvLoginLoading(false);
    }
  };

  // Track whether initial sync has happened to avoid auth check race
  const [envReady, setEnvReady] = useState(false);

  // Sync Zustand with localStorage on mount (before hydration completes)
  useEffect(() => {
    const persisted = getPersistedEnvironment();
    if (persisted !== environment) {
      setEnvironment(persisted);
    }
    setEnvReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dashboard auth check - uses current environment's session.
  // Only runs after envReady to prevent checking the wrong env on first render.
  useEffect(() => {
    if (!envReady) return;

    setLoading(true);
    setUser(null);

    const supabase = getClientForEnv(environment);

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      setLoading(false);
    });
  }, [router, environment, envReady]);

  // Clean up any stale env param from URL (leftover from old magic link flow)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('env')) {
      window.history.replaceState({}, '', pathname);
    }
  }, [pathname]);

  const handleSignOut = async () => {
    const supabase = getClientForEnv(environment);
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
    { href: '/promo-codes', label: 'Promo Codes', icon: '🎟️' },
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
              <div className="py-2">
                <p className="text-sm text-gray-600 text-center mb-1">
                  A 6-digit code was sent to{' '}
                  <strong>{envLoginUsername.trim()}{EMAIL_DOMAIN}</strong>
                </p>

                <div className="flex justify-center gap-2 mt-4" onPaste={handleEnvOtpPaste}>
                  {envLoginOtp.map((digit: string, i: number) => (
                    <input
                      key={i}
                      ref={(el) => { envOtpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleEnvOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleEnvOtpKeyDown(i, e)}
                      disabled={envLoginVerifying}
                      className="w-10 h-12 text-center text-xl font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    />
                  ))}
                </div>

                {envLoginError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-3">
                    {envLoginError}
                  </div>
                )}

                {envLoginVerifying && (
                  <p className="text-sm text-gray-500 mt-3 text-center">Verifying...</p>
                )}

                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={() => {
                      setEnvLoginSent(false);
                      setEnvLoginOtp(Array(OTP_LENGTH).fill(''));
                      setEnvLoginError('');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleEnvResend}
                    disabled={envLoginLoading || envLoginVerifying}
                    className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  >
                    {envLoginLoading ? 'Sending...' : 'Resend code'}
                  </button>
                </div>
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
                    {envLoginLoading ? 'Sending...' : 'Send Code'}
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
