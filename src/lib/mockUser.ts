const MOCK_UID_KEY = 'pawalk_mock_uid';
const MOCK_REGISTRY_KEY = 'pawalk_registered_emails';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Stable id for mock auth mode (no Supabase session). */
export function setMockUserId(email: string): void {
  sessionStorage.setItem(MOCK_UID_KEY, `mock_${normalizeEmail(email)}`);
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

export function isMockEmailRegistered(email: string): boolean {
  try {
    const list = JSON.parse(localStorage.getItem(MOCK_REGISTRY_KEY) ?? '[]') as string[];
    return list.includes(normalizeEmail(email));
  } catch {
    return false;
  }
}

export function registerMockEmail(email: string): void {
  try {
    const normalized = normalizeEmail(email);
    const list = JSON.parse(localStorage.getItem(MOCK_REGISTRY_KEY) ?? '[]') as string[];
    if (!list.includes(normalized)) {
      list.push(normalized);
      localStorage.setItem(MOCK_REGISTRY_KEY, JSON.stringify(list));
    }
  } catch {
    localStorage.setItem(MOCK_REGISTRY_KEY, JSON.stringify([normalizeEmail(email)]));
  }
}
