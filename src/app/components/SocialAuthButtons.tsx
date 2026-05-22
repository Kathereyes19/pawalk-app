import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from './Button';
import { signInWithOAuth } from '@/features/auth';
import { setMockUserId } from '@/lib/mockUser';

interface SocialAuthButtonsProps {
  onOAuthSuccess?: (isNewUser: boolean) => void;
  mockEmail?: string;
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onOAuthSuccess,
  mockEmail = 'oauth@pawalk.app',
}) => {
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setError(null);
    setLoadingProvider(provider);

    const result = await signInWithOAuth(provider);

    if (result.error) {
      setError(result.error.message);
      setLoadingProvider(null);
      return;
    }

    if (result.mode === 'mock') {
      setMockUserId(`${provider}_${mockEmail}`);
      onOAuthSuccess?.(true);
      setLoadingProvider(null);
      return;
    }

    if (result.data?.redirecting) {
      return;
    }

    setLoadingProvider(null);
  };

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-destructive text-center" role="alert">
          {error}
        </p>
      )}
      <Button
        type="button"
        fullWidth
        variant="outline"
        disabled={Boolean(loadingProvider)}
        onClick={() => handleOAuth('google')}
      >
        {loadingProvider === 'google' ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        Continuar con Google
      </Button>

      <Button
        type="button"
        fullWidth
        variant="outline"
        disabled={Boolean(loadingProvider)}
        onClick={() => handleOAuth('apple')}
      >
        {loadingProvider === 'apple' ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M17.05 20.28c-.98.95-2.05 1.88-3.51 1.9-1.46.02-1.93-.86-3.6-.86-1.67 0-2.19.84-3.57.88-1.38.04-2.43-.92-3.41-1.87C1.69 17.82.27 12.97 2.38 9.9c1.05-1.57 2.72-2.55 4.6-2.57 1.44-.02 2.8.97 3.68.97.88 0 2.52-1.2 4.25-1.02.72.03 2.75.29 4.05 2.19-3.55 1.94-2.97 7.05.53 8.81ZM12.03 4.5c.13-1.58 1.37-2.78 2.94-2.9.22 1.64-1.48 3.08-2.94 2.9Z" />
          </svg>
        )}
        Continuar con Apple
      </Button>
    </div>
  );
};
