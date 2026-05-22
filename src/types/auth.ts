/** Credentials collected on LoginScreen */
export interface SignInCredentials {
  email: string;
  password: string;
}

/** Credentials collected on SignUpScreen */
export interface SignUpCredentials {
  fullName: string;
  email: string;
  password: string;
}

export type AuthErrorCode =
  | 'email_exists'
  | 'invalid_credentials'
  | 'weak_password'
  | 'generic';

export interface AuthError {
  message: string;
  field?: 'email' | 'password' | 'name';
  code?: AuthErrorCode;
}

export type AuthMode = 'supabase' | 'mock';

export interface AuthResult<T = unknown> {
  data: T | null;
  error: AuthError | null;
  mode: AuthMode;
}
