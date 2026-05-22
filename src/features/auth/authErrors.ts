export type AuthErrorCode =
  | 'email_exists'
  | 'invalid_credentials'
  | 'weak_password'
  | 'generic';

export interface MappedAuthError {
  message: string;
  field?: 'email' | 'password' | 'name';
  code: AuthErrorCode;
}

const DUPLICATE_EMAIL_PATTERNS = [
  'already registered',
  'already been registered',
  'already exists',
  'user already exists',
  'email address is already',
  'duplicate',
  'user_already_exists',
];

export function isDuplicateEmailError(error: {
  message?: string;
  code?: string;
}): boolean {
  const message = (error.message ?? '').toLowerCase();
  const code = (error.code ?? '').toLowerCase();

  if (code === 'user_already_exists' || code === 'email_exists') {
    return true;
  }

  return DUPLICATE_EMAIL_PATTERNS.some(
    (pattern) => message.includes(pattern) || code.includes(pattern)
  );
}

/** Supabase may return an empty identities array when the email already exists (confirmations on). */
export function isDuplicateSignUpUser(user: {
  identities?: { length: number }[] | null;
} | null): boolean {
  return Boolean(user && Array.isArray(user.identities) && user.identities.length === 0);
}

export function mapSignUpError(error: {
  message: string;
  code?: string;
}): MappedAuthError {
  if (isDuplicateEmailError(error)) {
    return {
      code: 'email_exists',
      field: 'email',
      message:
        'Ya existe una cuenta registrada con este correo. Inicia sesión o usa otro email.',
    };
  }

  const lower = error.message.toLowerCase();
  if (lower.includes('password') && (lower.includes('weak') || lower.includes('short'))) {
    return {
      code: 'weak_password',
      field: 'password',
      message: 'Elige una contraseña más segura (mínimo 6 caracteres).',
    };
  }

  if (lower.includes('email') && lower.includes('invalid')) {
    return {
      code: 'generic',
      field: 'email',
      message: 'Ingresa un correo electrónico válido.',
    };
  }

  return {
    code: 'generic',
    field: 'email',
    message: 'No pudimos crear tu cuenta. Revisa tus datos e inténtalo de nuevo.',
  };
}

export function mapSignInError(error: { message: string; code?: string }): MappedAuthError {
  const lower = error.message.toLowerCase();

  if (
    lower.includes('invalid') ||
    lower.includes('credentials') ||
    lower.includes('password')
  ) {
    return {
      code: 'invalid_credentials',
      field: 'password',
      message: 'Correo o contraseña incorrectos. Verifica tus datos.',
    };
  }

  return {
    code: 'generic',
    field: 'email',
    message: 'No pudimos iniciar sesión. Inténtalo de nuevo.',
  };
}

export const DUPLICATE_EMAIL_ERROR: MappedAuthError = {
  code: 'email_exists',
  field: 'email',
  message:
    'Ya existe una cuenta registrada con este correo. Inicia sesión o usa otro email.',
};
