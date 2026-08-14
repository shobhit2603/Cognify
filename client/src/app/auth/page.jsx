'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../features/auth/hooks/useAuth';
import AuthModal from '../../features/auth/components/AuthModal';

export default function AuthPage() {
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
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-white">
      <AuthModal isOpen={true} />
    </div>
  );
}