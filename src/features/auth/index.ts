export {
  signInWithEmail,
  signUpWithEmail,
  signOut,
} from './authService';
export {
  isDuplicateEmailError,
  DUPLICATE_EMAIL_ERROR,
  type AuthErrorCode,
  type MappedAuthError,
} from './authErrors';
export { validateEmail, validateSignIn, validateSignUp } from './validation';
