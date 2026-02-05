'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Root page - simply redirects to the dashboard.
 *
 * With OTP-based auth the session is established directly on the login
 * page via verifyOtp(), so there is no longer a magic-link callback
 * that lands here with hash-fragment tokens.
 */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/curricula');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-600">Redirecting...</div>
    </div>
  );
}
