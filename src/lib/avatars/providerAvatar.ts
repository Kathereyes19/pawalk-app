import type { HomeServiceCategory } from '@/types/homeDiscovery';
import type { Reservation } from '@/types/reservation';
import type { Walker } from '@/types/walker';
import { PROVIDER_CATEGORY_EMOJI } from './constants';
import type { AvatarDisplayProps, AvatarVariant } from './types';

export interface ProviderAvatarInput {
  avatar?: string | null;
  id?: string | null;
  name?: string | null;
  serviceCategory?: HomeServiceCategory | string | null;
}

function providerVariant(
  serviceCategory?: HomeServiceCategory | string | null
): AvatarVariant {
  switch (serviceCategory) {
    case 'caregivers':
      return 'provider-caregiver';
    case 'veterinary':
      return 'provider-vet';
    default:
      return 'provider-walker';
  }
}

function resolveProviderEmoji(
  serviceCategory?: HomeServiceCategory | string | null,
  storedAvatar?: string | null
): string {
  if (
    storedAvatar &&
    storedAvatar.length <= 4 &&
    !storedAvatar.startsWith('http') &&
    !storedAvatar.startsWith('data:')
  ) {
    return storedAvatar;
  }

  const category = (serviceCategory ?? 'walkers') as HomeServiceCategory;
  return PROVIDER_CATEGORY_EMOJI[category] ?? PROVIDER_CATEGORY_EMOJI.walkers;
}

export function getProviderAvatarProps(input: ProviderAvatarInput): AvatarDisplayProps {
  const variant = providerVariant(input.serviceCategory);

  return {
    emoji: resolveProviderEmoji(input.serviceCategory, input.avatar),
    alt: input.name ?? 'Provider',
    variant,
  };
}

export function getWalkerAvatarProps(walker: Walker): AvatarDisplayProps {
  return getProviderAvatarProps({
    avatar: walker.avatar,
    id: walker.id,
    name: walker.name,
    serviceCategory: walker.homeCategory,
  });
}

export function getReservationProviderAvatarProps(
  reservation: Pick<Reservation, 'walkerId' | 'walkerName' | 'walkerAvatar' | 'serviceCategory'>
): AvatarDisplayProps {
  return getProviderAvatarProps({
    avatar: reservation.walkerAvatar,
    id: reservation.walkerId,
    name: reservation.walkerName,
    serviceCategory: reservation.serviceCategory,
  });
}

export function getReviewAuthorAvatarProps(
  authorName: string,
  authorAvatar?: string | null
): AvatarDisplayProps {
  const storedEmoji =
    authorAvatar && authorAvatar.length <= 4 && !authorAvatar.startsWith('http')
      ? authorAvatar
      : undefined;

  return {
    emoji: storedEmoji ?? '👤',
    alt: authorName,
    variant: 'user',
  };
}

export function getProviderGalleryEmojis(
  providerId: string,
  count = 6,
  serviceCategory?: HomeServiceCategory | string | null
): string[] {
  const base =
    serviceCategory === 'veterinary'
      ? ['🏥', '🩺', '💉', '🐕', '🐈', '📋']
      : serviceCategory === 'caregivers'
        ? ['🏠', '🐕', '🛏️', '🐾', '❤️', '🌙']
        : ['🚶', '🐾', '🌳', '☀️', '🎾', '💚'];

  return Array.from({ length: count }, (_, index) => base[index % base.length]);
}
