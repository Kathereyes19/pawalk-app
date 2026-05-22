import { DEFAULT_PET_EMOJI, PET_SPECIES_EMOJI } from './constants';
import { isEmojiAvatar, isDirectImageUrl, resolveAvatarImageUrl } from './imageUrl';
import type { AvatarDisplayProps } from './types';

export interface PetAvatarInput {
  avatar?: string | null;
  species?: 'dog' | 'cat' | string | null;
  name?: string | null;
  id?: string | null;
}

function resolvePetEmoji(input: PetAvatarInput): string {
  const { avatar, species } = input;

  if (isEmojiAvatar(avatar)) {
    return avatar!;
  }

  if (species) {
    const normalized = species.toLowerCase();
    if (PET_SPECIES_EMOJI[normalized]) {
      return PET_SPECIES_EMOJI[normalized];
    }
  }

  return DEFAULT_PET_EMOJI;
}

export function getPetAvatarProps(input: PetAvatarInput | string): AvatarDisplayProps {
  if (typeof input === 'string') {
    return getPetAvatarProps({ avatar: input });
  }

  const alt = input.name ?? 'Pet';
  const src = resolveAvatarImageUrl(input.avatar);
  if (src) {
    return { src, alt, variant: 'pet' };
  }

  return {
    emoji: resolvePetEmoji(input),
    alt,
    variant: 'pet',
  };
}

export function isImageAvatar(avatar: string): boolean {
  return isDirectImageUrl(avatar);
}
