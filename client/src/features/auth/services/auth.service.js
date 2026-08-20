import { axiosInstance } from '../../../lib/axios';

export const authService = {
  register: async (data) => {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  },
  
  login: async (data) => {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  verifyEmail: async (data) => {
    const response = await axiosInstance.post('/auth/verify-email', data);
    return response.data;
  },

  resendVerification: async () => {
    const response = await axiosInstance.post('/auth/resend-verification');
    return response.data;
  },
};
