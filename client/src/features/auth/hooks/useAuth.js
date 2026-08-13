import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setAuthenticated, setInitialized, logoutClient } from '../authSlice';
import { useEffect } from 'react';
import { toast } from 'sonner';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

  // Query for getting current user
  const { data: userResponse, isLoading: isLoadingUser, isError: isAuthError } = useQuery({
    queryKey: ['user'],
    queryFn: authService.getMe,
    retry: false, // Don't retry on 401s
    staleTime: 5 * 60 * 1000,
  });

  // Effect to sync React Query server state with Redux UI state
  useEffect(() => {
    if (userResponse?.success) {
      dispatch(setAuthenticated(true));
      dispatch(setInitialized(true));
    } else if (isAuthError) {
      dispatch(setAuthenticated(false));
      dispatch(setInitialized(true));
    }
  }, [userResponse, isAuthError, dispatch]);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Upon successful login, the server sets the HttpOnly cookie.
      // We manually set the query data so we don't have to fetch /me immediately again (if login returns user data)
      if (data?.data?.user) {
         queryClient.setQueryData(['user'], { success: true, data: { user: data.data.user } });
      } else {
         // Alternatively, invalidate the query to force a refetch
         queryClient.invalidateQueries({ queryKey: ['user'] });
      }
      
      dispatch(setAuthenticated(true));
      toast.success('Successfully logged in');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      toast.success('Registration successful. Please log in.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      queryClient.clear(); // Clear all cached queries on logout
      dispatch(logoutClient());
      toast.success('Successfully logged out');
    },
    onError: () => {
      toast.error('Logout failed');
    }
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
