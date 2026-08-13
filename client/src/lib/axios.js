import axios from 'axios';

// The base URL can be an environment variable.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for sending cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle 401 and token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Avoid infinite loops if the refresh endpoint itself returns 401
      if (originalRequest.url === '/auth/refresh') {
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token via HttpOnly cookie
        await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        
        // If successful, retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, it means the session is completely expired.
        // We'll let the application handle the redirection/state update via React Query or Redux.
        // E.g., dispatch a logout action or window.location.href = '/login'
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
