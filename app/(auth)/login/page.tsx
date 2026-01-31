'use client';

import { useState } from 'react';
import { createEnvironmentClient } from '@/lib/supabase/client';
import { useEnvironmentStore, type Environment } from '@/lib/stores/environmentStore';

const EMAIL_DOMAIN = '@kalamkidslearning.com';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [fullEmail, setFullEmail] = useState('');
  const { environment, setEnvironment } = useEnvironmentStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate username
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    // Construct full email
    const email = `${username.trim()}${EMAIL_DOMAIN}`;
    setFullEmail(email);

    setLoading(true);

    try {
      const supabase = createEnvironmentClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/?env=${environment}`,
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
            A magic link was sent to <strong>{fullEmail}</strong>
          </p>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Signing in to{' '}
            <span className={environment === 'prod' ? 'font-semibold text-red-600' : 'font-semibold text-amber-500'}>
              {environment.toUpperCase()}
            </span>
          </p>
          <p className="text-sm text-gray-500 mt-2 text-center">
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
        <p className="text-gray-600 text-center mb-6">Sign in to manage curriculum</p>

        <div className="flex justify-center mb-6">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setEnvironment('dev')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                environment === 'dev'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              DEV
            </button>
            <button
              type="button"
              onClick={() => setEnvironment('prod')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                environment === 'prod'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              PROD
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <div className="flex items-stretch">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="flex-1 px-3 py-2 border border-gray-300 border-r-0 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
              <div className="flex items-center px-3 py-2 bg-gray-100 border border-gray-300 border-l-0 rounded-r-md">
                <span className="text-gray-600 text-sm whitespace-nowrap">
                  {EMAIL_DOMAIN}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter your username only
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
            className={`w-full text-white py-2 rounded-md disabled:opacity-50 ${
              environment === 'prod'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Sending...' : `Sign in to ${environment.toUpperCase()}`}
          </button>
        </form>
      </div>
    </div>
  );
}
