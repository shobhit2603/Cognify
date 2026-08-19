'use client';

import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from '../store';
import { queryClient } from '../lib/queryClient';
import { Toaster } from 'sonner';
import SmoothScroll from '../components/layout/SmoothScroll';

export default function Providers({ children }) {
  return (
    <SmoothScroll>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster position="top-center" richColors />
        </QueryClientProvider>
      </Provider>
    </SmoothScroll>
  );
}
