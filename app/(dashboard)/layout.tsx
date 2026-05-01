'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEnvironmentStore, type Environment, getPersistedEnvironment } from '@/lib/stores/environmentStore';
import { getClientForEnv } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

const EMAIL_DOMAIN = '@kalamkidslearning.com';
const OTP_LENGTH = 6;

const navLinks = [
  { href: '/curricula', label: 'Curricula', icon: CurriculaIcon },
  { href: '/books', label: 'Books', icon: BooksIcon },
  { href: '/templates', label: 'Templates', icon: TemplatesIcon },
  { href: '/assets', label: 'Assets', icon: AssetsIcon },
  { href: '/audio', label: 'Audio', icon: AudioIcon },
  { href: '/words', label: 'Words', icon: WordsIcon },
  { href: '/promo-codes', label: 'Promo Codes', icon: PromoIcon },
];

function CurriculaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function BooksIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function TemplatesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
    </svg>
  );
}

function AssetsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function AudioIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
  );
}

function WordsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  );
}

function PromoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
    </svg>
  );
}

function ChevronIcon({ className, direction = 'left' }: { className?: string; direction?: 'left' | 'right' }) {
  return (
    <svg
      className={cn(className, direction === 'right' && 'rotate-180')}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

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

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const [envReady, setEnvReady] = useState(false);

  useEffect(() => {
    const persisted = getPersistedEnvironment();
    if (persisted !== environment) {
      setEnvironment(persisted);
    }
    setEnvReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const userEmail = user?.email || '';
  const userInitial = userEmail.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-white border-r border-gray-200 flex flex-col z-40 transition-all duration-200',
          sidebarCollapsed ? 'w-16' : 'w-56'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'h-16 flex items-center border-b border-gray-200 px-4',
          sidebarCollapsed ? 'justify-center' : 'justify-between'
        )}>
          {!sidebarCollapsed && (
            <span className="font-semibold text-gray-900">Kalam</span>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ChevronIcon
              className="w-4 h-4"
              direction={sidebarCollapsed ? 'right' : 'left'}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  sidebarCollapsed && 'justify-center px-0'
                )}
                title={sidebarCollapsed ? link.label : undefined}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-purple-600' : 'text-gray-400')} />
                {!sidebarCollapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Environment Switcher */}
        <div className={cn(
          'border-t border-gray-200 p-3',
          sidebarCollapsed && 'flex justify-center'
        )}>
          {sidebarCollapsed ? (
            <button
              onClick={() => handleEnvironmentSwitch(environment === 'dev' ? 'prod' : 'dev')}
              className={cn(
                'w-8 h-8 rounded-md text-xs font-bold flex items-center justify-center transition-colors',
                environment === 'prod'
                  ? 'bg-red-600 text-white'
                  : 'bg-amber-500 text-white'
              )}
              title={`Switch to ${environment === 'dev' ? 'PROD' : 'DEV'}`}
            >
              {environment === 'prod' ? 'P' : 'D'}
            </button>
          ) : (
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleEnvironmentSwitch('dev')}
                className={cn(
                  'flex-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors',
                  environment === 'dev'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                DEV
              </button>
              <button
                onClick={() => handleEnvironmentSwitch('prod')}
                className={cn(
                  'flex-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors',
                  environment === 'prod'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                PROD
              </button>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className={cn(
          'border-t border-gray-200 p-3',
          sidebarCollapsed && 'flex justify-center'
        )}>
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={cn(
                'flex items-center gap-3 w-full rounded-lg transition-colors hover:bg-gray-50 p-2',
                sidebarCollapsed && 'justify-center p-0'
              )}
            >
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                {userInitial}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userEmail.replace(EMAIL_DOMAIN, '')}
                  </p>
                </div>
              )}
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <div className={cn(
                'absolute bottom-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px]',
                sidebarCollapsed ? 'left-full ml-2' : 'left-0'
              )}>
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        'flex-1 transition-all duration-200',
        sidebarCollapsed ? 'ml-16' : 'ml-56'
      )}>
        {/* Environment indicator bar */}
        {environment === 'prod' && (
          <div className="h-1 bg-red-600" />
        )}

        {children}
      </main>

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
                      className="w-10 h-12 text-center text-xl font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
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
                    className="text-sm text-purple-600 hover:text-purple-700 disabled:opacity-50"
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
                      className="flex-1 px-3 py-2 border border-gray-300 border-r-0 rounded-l-md focus:outline-none focus:ring-1 focus:ring-purple-500"
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
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 text-sm"
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
