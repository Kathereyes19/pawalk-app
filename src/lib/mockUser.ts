const MOCK_UID_KEY = 'pawalk_mock_uid';

/** Stable id for mock auth mode (no Supabase session). */
export function setMockUserId(email: string): void {
  const normalized = email.trim().toLowerCase();
  sessionStorage.setItem(MOCK_UID_KEY, `mock_${normalized}`);
}

export function getMockUserId(): string | null {
  return sessionStorage.getItem(MOCK_UID_KEY);
}

export function clearMockUserId(): void {
  sessionStorage.removeItem(MOCK_UID_KEY);
}

export function resolveUserId(supabaseUserId?: string | null): string | null {
  return supabaseUserId ?? getMockUserId();
}
