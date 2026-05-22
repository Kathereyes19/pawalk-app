import { DEFAULT_PET_EMOJI, PET_SPECIES_EMOJI } from './constants';
import type { AvatarDisplayProps } from './types';

export interface PetAvatarInput {
  avatar?: string | null;
  species?: 'dog' | 'cat' | string | null;
  name?: string | null;
  id?: string | null;
}

function resolvePetEmoji(input: PetAvatarInput): string {
  const { avatar, species } = input;

  if (avatar && avatar.length <= 4 && !avatar.startsWith('http') && !avatar.startsWith('data:')) {
    return avatar;
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

  return {
    emoji: resolvePetEmoji(input),
    alt: input.name ?? 'Pet',
    variant: 'pet',
  };
}

export function isImageAvatar(avatar: string): boolean {
  return avatar.startsWith('http') || avatar.startsWith('data:') || avatar.startsWith('blob:');
}
