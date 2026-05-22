const PENDING_ONBOARDING_KEY = 'pawalk_pending_onboarding';

/** Set after email/OAuth registration — shows intro slides once before profile setup. */
export function setPendingOnboarding(value: boolean): void {
  if (value) {
    sessionStorage.setItem(PENDING_ONBOARDING_KEY, '1');
  } else {
    sessionStorage.removeItem(PENDING_ONBOARDING_KEY);
  }
}

export function hasPendingOnboarding(): boolean {
  return sessionStorage.getItem(PENDING_ONBOARDING_KEY) === '1';
}

export function clearPendingOnboarding(): void {
  setPendingOnboarding(false);
}
