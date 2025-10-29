// ============================================
// FILE: frontend/src/config/index.ts
// ============================================
// Path: postfix-dashboard/frontend/src/config/index.ts

// Centralized configuration
const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  },
  auth: {
    tokenKey: 'postfix_auth_token',
    tokenExpiryKey: 'postfix_token_expiry',
    expiryHours: parseInt(import.meta.env.VITE_TOKEN_EXPIRY_HOURS || '24'),
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Postfix Dashboard',
    version: import.meta.env.VITE_APP_VERSION || '2.0.0',
  },
  pagination: {
    defaultPageSize: 50,
    pageSizeOptions: [25, 50, 100, 200],
  },
} as const;

export { config };
export default config;