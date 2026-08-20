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
      if (isAuthError) {
        // We only mark unauthenticated if we have a real error.
        // It might be a 401/403 meaning token is bad.
        // We do not rely solely on userResponse?.success for error states here.
        dispatch(setAuthenticated(false));
      } else if (userResponse?.success) {
        dispatch(setAuthenticated(true));
      }
      dispatch(setInitialized(true));
    }
  }, [isLoadingUser, isAuthError, userResponse, dispatch]);

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
      queryClient.clear(); // Complete cache wipe, implies user=null
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

  const verifyEmailMutation = useMutation({
    mutationFn: authService.verifyEmail,
    onSuccess: () => {
      queryClient.setQueryData(['user'], (oldData) => {
        if (!oldData?.data?.user) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            user: {
              ...oldData.data.user,
              isEmailVerified: true,
            },
          },
        };
      });
      toast.success('Email verified successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Verification failed. Invalid or expired OTP.');
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: authService.resendVerification,
    onSuccess: () => {
      toast.success('Verification email sent! Check your inbox.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to resend verification email.');
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
    verifyEmail: verifyEmailMutation.mutate,
    verifyEmailAsync: verifyEmailMutation.mutateAsync,
    isVerifying: verifyEmailMutation.isPending,
    resendVerification: resendVerificationMutation.mutate,
    isResending: resendVerificationMutation.isPending,
  };
};
