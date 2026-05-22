import { DEFAULT_USER_EMOJI } from './constants';
import { getInitials } from './initials';
import type { AvatarDisplayProps } from './types';

export interface UserAvatarInput {
  fullName?: string | null;
  avatar?: string | null;
}

export function getUserAvatarProps(
  input: UserAvatarInput,
  _userId?: string
): AvatarDisplayProps {
  const name = input.fullName?.trim();
  const initials = getInitials(name);
  const storedEmoji =
    input.avatar && input.avatar.length <= 4 && !input.avatar.startsWith('data:')
      ? input.avatar
      : undefined;

  return {
    initials: initials !== '?' ? initials : undefined,
    emoji: initials === '?' ? storedEmoji ?? DEFAULT_USER_EMOJI : undefined,
    alt: name ?? 'User',
    variant: 'user',
  };
}
