/**
 * Centralized environment variable configuration for the client.
 */
const isProduction = process.env.NODE_ENV === 'production';

const resolveApiUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (isProduction) {
    // In production, route via first-party relative proxy unless a custom relative endpoint is specified
    if (!envUrl || envUrl.includes('onrender.com') || envUrl.includes('sslip.io') || envUrl === '/api/v1') {
      return '/api/v1';
    }
    return envUrl;
  }
  return envUrl || 'http://localhost:5000/api/v1';
};

export const API_URL = resolveApiUrl();

export const env = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  API_URL,
  isProduction,
  isDevelopment: !isProduction,
};
