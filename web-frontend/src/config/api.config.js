export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  wsURL: import.meta.env.VITE_WS_URL || 'ws://localhost:5000',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  endpoints: { auth: '/auth', users: '/users', rides: '/rides', drivers: '/drivers', payments: '/payments', admin: '/admin' },
};
