// ============================================
// FILE: frontend/src/components/ErrorBoundary.tsx
// ============================================
// Path: postfix-dashboard/frontend/src/components/ErrorBoundary.tsx
// Action: Create this NEW file

import { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon } from './icons/IconComponents';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-gray-800 rounded-lg border border-gray-700 p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-red-500/20 p-4 rounded-full">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-400" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-center text-gray-100 mb-4">
              Oops! Something went wrong
            </h1>
            
            <p className="text-gray-400 text-center mb-6">
              We're sorry for the inconvenience. An unexpected error has occurred.
            </p>

            {this.state.error && (
              <div className="bg-gray-900/50 rounded-md p-4 mb-6">
                <p className="text-sm font-mono text-red-400 mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-4">
                    <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400">
                      Technical Details
                    </summary>
                    <pre className="mt-2 text-xs text-gray-500 overflow-auto max-h-48">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;