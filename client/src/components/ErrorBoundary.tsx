import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" lang="ar" dir="rtl">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">عذراً، حدث خطأ</h1>
            <p className="text-gray-600 mb-2">حدث خطأ غير متوقع. يرجى تحديث الصفحة والمحاولة مرة أخرى.</p>
            <p className="text-sm text-gray-400 mb-6 border-t border-gray-100 pt-4 ltr">An unexpected error occurred. Please refresh and try again.</p>
            <button onClick={() => { localStorage.clear(); window.location.reload(); }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              تحديث الصفحة / Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
