import type { ImageFallbackCategory } from './assets';
import { IMAGE_POOLS } from './assets';
import { buildUnsplashUrl, isDirectImageUrl, pickFromPool } from './unsplash';

export interface ResolvedImage {
  src: string;
  alt: string;
  /** Emoji shown when image fails to load */
  fallbackEmoji?: string;
}

export interface ResolveImageOptions {
  /** Real URL from Supabase or upload — used when present */
  url?: string | null;
  /** Category for stock fallback */
  category: ImageFallbackCategory;
  /** Stable seed for consistent assignment (user id, product id, etc.) */
  seed: string;
  alt: string;
  fallbackEmoji?: string;
  width?: number;
  height?: number;
}

/**
 * Central fallback: real URL → category stock → Pawalk default.
 */
export function resolveImage({
  url,
  category,
  seed,
  alt,
  fallbackEmoji = '🐾',
  width = 400,
  height = 400,
}: ResolveImageOptions): ResolvedImage {
  if (isDirectImageUrl(url)) {
    return { src: url!, alt, fallbackEmoji };
  }

  const pool = IMAGE_POOLS[category] ?? IMAGE_POOLS['pawalk-default'];
  const photoId = pickFromPool(pool, seed);
  return {
    src: buildUnsplashUrl(photoId, width, height),
    alt,
    fallbackEmoji,
  };
}

export function resolveBrandedDefault(seed: string, alt = 'Pawalk'): ResolvedImage {
  const photoId = pickFromPool(IMAGE_POOLS['pawalk-default'], seed);
  return {
    src: buildUnsplashUrl(photoId, 600, 450),
    alt,
    fallbackEmoji: '🐾',
  };
}

export { buildUnsplashUrl, isDirectImageUrl, pickFromPool, hashString } from './unsplash';
export { IMAGE_POOLS, type ImageFallbackCategory } from './assets';
