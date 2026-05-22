export type { AvatarDisplayProps, AvatarVariant } from './types';
export { getInitials } from './initials';
export {
  PET_SPECIES_EMOJI,
  PROVIDER_CATEGORY_EMOJI,
  MARKETPLACE_CATEGORY_EMOJI,
} from './constants';

export { getUserAvatarProps, type UserAvatarInput } from './userAvatar';
export { getPetAvatarProps, isImageAvatar, type PetAvatarInput } from './petAvatar';
export {
  getProviderAvatarProps,
  getWalkerAvatarProps,
  getReservationProviderAvatarProps,
  getReviewAuthorAvatarProps,
  getProviderGalleryEmojis,
  type ProviderAvatarInput,
} from './providerAvatar';
export {
  getMarketplaceCategoryEmoji,
  getProductAvatarProps,
  getProductGalleryEmojis,
} from './marketplaceAvatar';
