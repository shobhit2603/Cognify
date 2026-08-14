/**
 * Centralized environment variable configuration for the client.
 */
export const env = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
};

// Log a warning if the API URL is missing so developers know immediately
if (!env.NEXT_PUBLIC_API_URL) {
  console.warn("⚠️ NEXT_PUBLIC_API_URL is missing. Please check your .env file.");
}

// Ensure there is always a fallback to prevent catastrophic errors in dev, 
// though ideally it should be provided by .env
export const API_URL = env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
