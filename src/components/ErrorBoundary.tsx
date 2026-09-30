import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="min-h-screen flex items-center justify-center bg-glass">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-ink mb-4">
              Une erreur est survenue
            </h2>
            <p className="text-muted mb-6">
              Veuillez recharger la page ou réessayer plus tard.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-6 py-2 bg-green text-white rounded-lg hover:bg-green-deep transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
