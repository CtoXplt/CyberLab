import React from 'react';
import { ShieldAlert } from 'lucide-react';
import GlowButton from './ui/GlowButton';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <ShieldAlert size={48} color="var(--accent)" strokeWidth={1.5} />
          <h2>Oops, terjadi kesalahan.</h2>
          <p>{this.state.error?.toString()}</p>
          <GlowButton variant="primary" onClick={() => { window.location.href = '/'; }}>
            Kembali ke Beranda
          </GlowButton>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
