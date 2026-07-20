import { Component } from 'react';
import type { ReactNode } from 'react';

export class GlobalErrorBoundary extends Component<{ fallback?: ReactNode, children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { fallback?: ReactNode, children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Global Error Boundary Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black text-red-500 font-mono text-sm p-4 z-50">
          <div className="bg-[#111] p-6 rounded-lg border border-red-900/50 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Błąd Aplikacji</h2>
            <pre className="whitespace-pre-wrap overflow-x-auto text-red-400">
              {import.meta.env.DEV 
                ? String(this.state.error?.stack || this.state.error) 
                : 'Wystąpił nieoczekiwany błąd. Spróbuj odświeżyć stronę.'}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 rounded-md text-red-200 transition-colors"
            >
              Uruchom ponownie aplikację
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
