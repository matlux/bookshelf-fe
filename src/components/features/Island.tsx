import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Component, type ErrorInfo, type ReactNode, useState } from 'react';
import { BButton } from '../bookshelf/BButton';
import { BToast } from '../bookshelf/BToast';

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {}
  render() {
    if (this.state.failed)
      return (
        <div className="error-box" role="alert">
          <div>
            <h1>This section could not be displayed.</h1>
            <p>Your data is still saved on the server.</p>
            <BButton onClick={() => window.location.reload()}>Reload page</BButton>
          </div>
        </div>
      );
    return this.props.children;
  }
}
export function Island({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 15_000, retry: 1, refetchOnWindowFocus: false },
          mutations: { retry: false },
        },
      }),
  );
  return (
    <Boundary>
      <QueryClientProvider client={client}>
        {children}
        <BToast />
      </QueryClientProvider>
    </Boundary>
  );
}
