import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setAuthenticated, setInitialized, logoutClient } from '../authSlice';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

  // Query for getting current user — runs on mount to hydrate auth state from cookie
  const {
    data: userResponse,
    isLoading: isLoadingUser,
    isError: isAuthError,
  } = useQuery({
    queryKey: ['user'],
    queryFn: authService.getMe,
    retry: false,      // Don't retry 401s — fail fast
    staleTime: 5 * 60 * 1000,
  });

  // Sync React Query server state → Redux UI state.
  // We use `isLoadingUser` as the gate: once it flips to `false` the query has
  // settled (success *or* error). This prevents the infinite-spinner bug where
  // the Google OAuth full-page redirect lands us here with a fresh store but
  // `userResponse` and `isAuthError` are both falsy on the first render.
  useEffect(() => {
    if (!isLoadingUser) {
      dispatch(setAuthenticated(userResponse?.success === true));
      dispatch(setInitialized(true));
    }
  }, [isLoadingUser, userResponse, dispatch]);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      if (data?.data?.user) {
        queryClient.setQueryData(['user'], { success: true, data: { user: data.data.user } });
      } else {
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }
      dispatch(setAuthenticated(true));
      toast.success('Welcome back!');
      router.push('/dashboard');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Login failed. Check your credentials.');
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      // After registration, auto-login by invalidating the user query
      // (server may or may not set cookies on register — adjust if needed)
      if (data?.data?.user) {
        queryClient.setQueryData(['user'], { success: true, data: { user: data.data.user } });
        dispatch(setAuthenticated(true));
        toast.success('Account created! Welcome to Cognify.');
        router.push('/dashboard');
      } else {
        toast.success('Account created! Please sign in.');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      queryClient.clear();
      dispatch(logoutClient());
      toast.success('Signed out successfully.');
      router.push('/');
    },
    onError: () => {
      // Even if the server call fails, clear local state and redirect
      dispatch(logoutClient());
      queryClient.clear();
      router.push('/');
      toast.error('Sign out failed, but local session cleared.');
    },
  });

  return {
    user: userResponse?.data?.user || null,
    isAuthenticated,
    isInitialized,
    isLoadingUser,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
};
