export function ensureReservationId(id?: string | null): string {
  if (id && id.length > 0) return id;
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `res_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
