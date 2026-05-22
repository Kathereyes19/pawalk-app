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

export type AuthMode = 'supabase' | 'mock';

export interface AuthResult<T = unknown> {
  data: T | null;
  error: { message: string; field?: 'email' | 'password' | 'name' } | null;
  mode: AuthMode;
}
