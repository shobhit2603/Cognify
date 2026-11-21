'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../features/auth/hooks/useAuth';
import AuthModal from '../../features/auth/components/AuthModal';

function AuthContent() {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // If user is already authenticated, redirect to dashboard or next path
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      const nextUrl = searchParams.get('next') || '/dashboard';
      router.replace(nextUrl);
    }
  }, [isAuthenticated, isInitialized, router, searchParams]);

  // Don't render the auth modal until we know the user is not authenticated
  if (!isInitialized || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-500 animate-pulse">
            {isAuthenticated ? 'Redirecting to dashboard...' : 'Checking authentication...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-white">
      <AuthModal isOpen={true} />
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-brand-white">
          <div className="w-8 h-8 border-4 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin"></div>
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
