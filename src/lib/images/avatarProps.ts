import type { HomeServiceCategory } from '@/types/homeDiscovery';
import type { Reservation } from '@/types/reservation';
import type { Walker } from '@/types/walker';
import { resolveImage, type ResolvedImage } from './imageResolver';

export interface UserAvatarInput {
  avatarUrl?: string | null;
  avatar?: string | null;
  fullName?: string | null;
}

export interface PetAvatarInput {
  avatar?: string | null;
  species?: 'dog' | 'cat' | string | null;
  name?: string | null;
  id?: string | null;
}

export interface ProviderAvatarInput {
  avatarUrl?: string | null;
  avatar?: string | null;
  id?: string | null;
  name?: string | null;
  serviceCategory?: HomeServiceCategory | string | null;
}

function userSeed(input: UserAvatarInput, userId?: string): string {
  return userId ?? input.fullName ?? 'pawalk-user';
}

export function getUserAvatarProps(
  input: UserAvatarInput,
  userId?: string
): { src?: string; emoji?: string; alt: string } {
  const url = input.avatarUrl ?? (input.avatar?.startsWith('data:') ? input.avatar : null);
  const resolved = resolveImage({
    url,
    category: 'user-portrait',
    seed: userSeed(input, userId),
    alt: input.fullName ?? 'User',
    fallbackEmoji: '🙂',
    width: 256,
    height: 256,
  });
  return { src: resolved.src, emoji: resolved.fallbackEmoji, alt: resolved.alt };
}

export function getPetAvatarProps(input: PetAvatarInput | string): {
  src?: string;
  emoji?: string;
  alt: string;
} {
  if (typeof input === 'string') {
    return getPetAvatarProps({ avatar: input });
  }

  const { avatar, species, name, id } = input;
  const url =
    avatar && (avatar.startsWith('http') || avatar.startsWith('data:') || avatar.startsWith('blob:'))
      ? avatar
      : null;

  const category =
    species === 'cat' || species === 'gato'
      ? 'pet-cat'
      : species === 'dog' || species === 'perro'
        ? 'pet-dog'
        : avatar && !url
          ? avatar.includes('🐱') || avatar.includes('🐈')
            ? 'pet-cat'
            : 'pet-dog'
          : 'pet-dog';

  const resolved = resolveImage({
    url,
    category,
    seed: id ?? name ?? avatar ?? 'pawalk-pet',
    alt: name ?? 'Pet',
    fallbackEmoji: avatar && !url ? avatar : '🐾',
    width: 256,
    height: 256,
  });

  return { src: resolved.src, emoji: resolved.fallbackEmoji, alt: resolved.alt };
}

function providerCategory(
  serviceCategory?: HomeServiceCategory | string | null
): 'provider-walker' | 'provider-caregiver' | 'provider-veterinary' {
  switch (serviceCategory) {
    case 'caregivers':
      return 'provider-caregiver';
    case 'veterinary':
      return 'provider-veterinary';
    default:
      return 'provider-walker';
  }
}

export function getProviderAvatarProps(input: ProviderAvatarInput): {
  src?: string;
  emoji?: string;
  alt: string;
} {
  const url =
    input.avatarUrl ??
    (input.avatar && (input.avatar.startsWith('http') || input.avatar.startsWith('data:'))
      ? input.avatar
      : null);

  const resolved = resolveImage({
    url,
    category: providerCategory(input.serviceCategory),
    seed: input.id ?? input.name ?? 'pawalk-provider',
    alt: input.name ?? 'Provider',
    fallbackEmoji: input.avatar && !url ? input.avatar : '🐕',
    width: 400,
    height: 400,
  });

  return { src: resolved.src, emoji: resolved.fallbackEmoji, alt: resolved.alt };
}

export function getWalkerAvatarProps(walker: Walker): {
  src?: string;
  emoji?: string;
  alt: string;
} {
  return getProviderAvatarProps({
    avatarUrl: walker.avatarUrl,
    avatar: walker.avatar,
    id: walker.id,
    name: walker.name,
    serviceCategory: walker.homeCategory,
  });
}

export function getReservationProviderAvatarProps(
  reservation: Pick<Reservation, 'walkerId' | 'walkerName' | 'walkerAvatar' | 'serviceCategory'>
): { src?: string; emoji?: string; alt: string } {
  return getProviderAvatarProps({
    avatar: reservation.walkerAvatar,
    id: reservation.walkerId,
    name: reservation.walkerName,
    serviceCategory: reservation.serviceCategory,
  });
}

export function getProviderGalleryUrls(
  providerId: string,
  count = 6,
  serviceCategory?: HomeServiceCategory | string | null
): string[] {
  const pool =
    serviceCategory === 'veterinary'
      ? 'provider-clinic'
      : providerCategory(serviceCategory);

  const urls: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const resolved = resolveImage({
      category: pool,
      seed: `${providerId}-gallery-${index}`,
      alt: 'Gallery',
      width: 400,
      height: 300,
    });
    urls.push(resolved.src);
  }
  return urls;
}

export function getReviewAuthorAvatarProps(
  authorName: string,
  authorAvatar?: string | null
): { src?: string; emoji?: string; alt: string } {
  return getUserAvatarProps({ avatar: authorAvatar, fullName: authorName }, authorName);
}

export function getMarketplaceCategoryImage(
  category: import('@/types').MarketplaceCategory,
  seed: string
): ResolvedImage {
  const categoryMap: Record<
    import('@/types').MarketplaceCategory,
    'pet-dog' | 'provider-clinic' | 'provider-walker'
  > = {
    food: 'pet-dog',
    grooming: 'provider-walker',
    toys: 'pet-dog',
    veterinary: 'provider-clinic',
    services: 'provider-walker',
  };

  return resolveImage({
    category: categoryMap[category] ?? 'pawalk-default',
    seed,
    alt: category,
    width: 600,
    height: 450,
  });
}
