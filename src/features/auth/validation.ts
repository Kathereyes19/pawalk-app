import type { SignInCredentials, SignUpCredentials } from '@/types';

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateSignIn(
  credentials: SignInCredentials
): Partial<Record<keyof SignInCredentials, string>> {
  const errors: Partial<Record<keyof SignInCredentials, string>> = {};

  if (!credentials.email) {
    errors.email = 'El correo es requerido';
  } else if (!validateEmail(credentials.email)) {
    errors.email = 'Ingresa un correo válido';
  }

  if (!credentials.password) {
    errors.password = 'La contraseña es requerida';
  } else if (credentials.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  return errors;
}

export function validateSignUp(
  credentials: SignUpCredentials,
  acceptTerms: boolean
): Partial<Record<keyof SignUpCredentials | 'terms', string>> {
  const errors: Partial<Record<keyof SignUpCredentials | 'terms', string>> = {};

  if (!credentials.fullName) {
    errors.fullName = 'El nombre es requerido';
  } else if (credentials.fullName.length < 2) {
    errors.fullName = 'El nombre debe tener al menos 2 caracteres';
  }

  if (!credentials.email) {
    errors.email = 'El correo es requerido';
  } else if (!validateEmail(credentials.email)) {
    errors.email = 'Ingresa un correo válido';
  }

  if (!credentials.password) {
    errors.password = 'La contraseña es requerida';
  } else if (credentials.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  if (!acceptTerms) {
    errors.terms = 'Debes aceptar los términos y condiciones';
  }

  return errors;
}
