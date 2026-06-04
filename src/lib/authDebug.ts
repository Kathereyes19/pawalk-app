/** Temporary auth tracing — remove when booking auth is verified stable. */
export function logAuthDebug(
  scope: string,
  payload: Record<string, unknown>
): void {
  if (!import.meta.env.DEV) return;
  console.log(`[Pawalk Auth:${scope}]`, payload);
}
