// FILE: src/components/ui/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Cold Connect ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-lg text-center">
            <div className="w-14 h-14 rounded-full bg-[#FEE2E2] text-[#EF4444] flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A]">Something went wrong</h2>
            <p className="text-xs text-[#64748B] mt-2 mb-6 leading-relaxed">
              Cold Connect encountered an unexpected state. Your local data is preserved.
            </p>
            {this.state.error?.message && (
              <pre className="text-left text-[11px] bg-[#F1F5F9] text-[#475569] p-3 rounded-lg overflow-x-auto mb-6 max-h-32 font-mono">
                {this.state.error.message}
              </pre>
            )}
            <Button
              variant="primary"
              className="w-full"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={this.handleReload}
            >
              Reload Cold Connect
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
