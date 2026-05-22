const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createPetId(): string {
  return crypto.randomUUID();
}

export function ensurePetId(id?: string): string {
  if (id && UUID_RE.test(id)) {
    return id;
  }
  return createPetId();
}
