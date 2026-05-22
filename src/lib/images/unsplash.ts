export const UNSPLASH_BASE = 'https://images.unsplash.com';

export function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function buildUnsplashUrl(
  photoId: string,
  width = 600,
  height = 450,
  quality = 85
): string {
  return `${UNSPLASH_BASE}/${photoId}?auto=format&fit=crop&w=${width}&h=${height}&q=${quality}`;
}

export function pickFromPool(pool: readonly string[], seed: string): string {
  return pool[hashString(seed) % pool.length];
}

export function isDirectImageUrl(value?: string | null): boolean {
  if (!value) return false;
  return (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  );
}
