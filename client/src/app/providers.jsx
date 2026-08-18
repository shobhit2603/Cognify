'use client';

import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from '../store';
import { queryClient } from '../lib/queryClient';
import { Toaster } from 'sonner';
import { ReactLenis } from 'lenis/react';

export default function Providers({ children }) {
  return (
    <ReactLenis root options={{ lerp: 0.08, smoothWheel: true }}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster position="top-center" richColors />
        </QueryClientProvider>
      </Provider>
    </ReactLenis>
  );
}
