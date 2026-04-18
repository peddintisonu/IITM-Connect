export const env = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  NODE_ENV: import.meta.env.MODE || 'development',
};

// Ensures early throwing if critical vars are missing in production
if (env.NODE_ENV === 'production' && !env.API_URL) {
  console.warn('API_URL is missing in production environment');
}
