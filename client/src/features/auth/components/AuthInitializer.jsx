'use client';

import { useAuth } from '../hooks/useAuth';

export default function AuthInitializer({ children }) {
  // Calling useAuth will trigger the 'user' query on mount,
  // which hits /auth/me to check for an active session cookie.
  // The hook also handles syncing this server state to Redux.
  useAuth();

  return <>{children}</>;
}
