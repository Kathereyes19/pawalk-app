export {
  resolveImage,
  resolveBrandedDefault,
  buildUnsplashUrl,
  isDirectImageUrl,
  pickFromPool,
  hashString,
  IMAGE_POOLS,
  type ResolvedImage,
  type ImageFallbackCategory,
} from './imageResolver';

export {
  getUserAvatarProps,
  getPetAvatarProps,
  getProviderAvatarProps,
  getWalkerAvatarProps,
  getReservationProviderAvatarProps,
  getProviderGalleryUrls,
  getReviewAuthorAvatarProps,
  getMarketplaceCategoryImage,
  type UserAvatarInput,
  type PetAvatarInput,
  type ProviderAvatarInput,
} from './avatarProps';
