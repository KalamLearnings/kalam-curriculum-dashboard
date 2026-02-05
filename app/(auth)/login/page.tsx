'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createEnvironmentClient } from '@/lib/supabase/client';
import { useEnvironmentStore } from '@/lib/stores/environmentStore';

const EMAIL_DOMAIN = '@kalamkidslearning.com';
const OTP_LENGTH = 6;

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [fullEmail, setFullEmail] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { environment, setEnvironment } = useEnvironmentStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    const email = `${username.trim()}${EMAIL_DOMAIN}`;
    setFullEmail(email);
    setLoading(true);

    try {
      const supabase = createEnvironmentClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
      });

      if (authError) throw authError;
      setSent(true);
      // Focus the first OTP input after render
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (value && newOtp.every((d) => d !== '')) {
      verifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);

    // Focus the next empty input or the last one
    const nextEmpty = newOtp.findIndex((d) => d === '');
    inputRefs.current[nextEmpty >= 0 ? nextEmpty : OTP_LENGTH - 1]?.focus();

    if (newOtp.every((d) => d !== '')) {
      verifyOtp(newOtp.join(''));
    }
  };

  const verifyOtp = async (token: string) => {
    setError('');
    setVerifying(true);

    try {
      const supabase = createEnvironmentClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: fullEmail,
        token,
        type: 'email',
      });

      if (verifyError) throw verifyError;
      router.replace('/curricula');
    } catch (err: any) {
      setError(err.message);
      // Clear OTP inputs on error so user can retry
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);
    setOtp(Array(OTP_LENGTH).fill(''));

    try {
      const supabase = createEnvironmentClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: fullEmail,
      });

      if (authError) throw authError;
      inputRefs.current[0]?.focus();
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
          <h2 className="text-2xl font-bold mb-4 text-center">Enter Verification Code</h2>
          <p className="text-gray-600 text-center">
            A 6-digit code was sent to <strong>{fullEmail}</strong>
          </p>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Signing in to{' '}
            <span className={environment === 'prod' ? 'font-semibold text-red-600' : 'font-semibold text-amber-500'}>
              {environment.toUpperCase()}
            </span>
          </p>

          <div className="flex justify-center gap-2 mt-6" onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                disabled={verifying}
                className="w-12 h-14 text-center text-2xl font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              />
            ))}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-4">
              {error}
            </div>
          )}

          {verifying && (
            <p className="text-sm text-gray-500 mt-4 text-center">Verifying...</p>
          )}

          <div className="mt-6 text-center space-y-2">
            <button
              onClick={handleResend}
              disabled={loading || verifying}
              className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Resend code'}
            </button>
            <div>
              <button
                onClick={() => { setSent(false); setOtp(Array(OTP_LENGTH).fill('')); setError(''); }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Use a different account
              </button>
            </div>
          </div>
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
            {loading ? 'Sending code...' : `Sign in to ${environment.toUpperCase()}`}
          </button>
        </form>
      </div>
    </div>
  );
}
