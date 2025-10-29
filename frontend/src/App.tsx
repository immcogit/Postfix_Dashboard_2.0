// ============================================
// FILE: frontend/src/App.tsx
// ============================================
// Path: postfix-dashboard/frontend/src/App.tsx

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';

const AppContent: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      {isAuthenticated ? (
        <Dashboard onLogout={logout} />
      ) : (
        <Login />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;