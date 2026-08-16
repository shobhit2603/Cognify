'use client';

import { useAuth } from '../hooks/useAuth';
import { usePathname } from 'next/navigation';

/**
 * AuthInitializer
 *
 * Mounted at the root layout. Calling useAuth() triggers the /auth/me
 * query which hydrates both the React Query cache and the Redux auth slice
 * from the server's HttpOnly cookie.
 *
 * We block rendering until the initial auth check completes (isInitialized)
 * ONLY on protected routes to prevent a flash of unauthenticated content.
 * Public routes load immediately.
 */
export default function AuthInitializer({ children }) {
  const { isInitialized } = useAuth();
  const pathname = usePathname();

  const isProtectedRoute =
    pathname.startsWith('/dashboard') || pathname.startsWith('/chat');

  if (!isInitialized && isProtectedRoute) {
    return (
      <div className="fixed inset-0 z-999 flex items-center justify-center bg-brand-white">
        <div className="flex flex-col items-center gap-4">
          {/* Spinner */}
          <div className="w-8 h-8 rounded-full border-2 border-brand-black/10 border-t-brand-black animate-spin" />
          <span className="text-xs text-gray-400 font-sans tracking-wide">Initializing…</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
