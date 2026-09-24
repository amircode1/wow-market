'use client';

import React, { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for graceful widget failure handling
 */
export class DashboardErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Dashboard widget error:', error);
    this.props.onError?.(error);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center p-6 rounded-lg border border-destructive/50 bg-destructive/5">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <h3 className="font-semibold text-destructive">Widget Error</h3>
            <p className="text-sm text-text-secondary mt-1 text-center">
              {this.state.error?.message || 'Something went wrong'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={this.reset}
              className="mt-3"
            >
              Try Again
            </Button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
