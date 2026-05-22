import { DEFAULT_USER_EMOJI } from './constants';
import { getInitials } from './initials';
import { isEmojiAvatar, resolveAvatarImageUrl } from './imageUrl';
import type { AvatarDisplayProps } from './types';

export interface UserAvatarInput {
  fullName?: string | null;
  avatar?: string | null;
  avatarUrl?: string | null;
}

export function getUserAvatarProps(
  input: UserAvatarInput,
  _userId?: string
): AvatarDisplayProps {
  const name = input.fullName?.trim();
  const alt = name ?? 'User';

  const src = resolveAvatarImageUrl(input.avatarUrl, input.avatar);
  if (src) {
    return { src, alt, variant: 'user' };
  }

  if (isEmojiAvatar(input.avatar)) {
    return { emoji: input.avatar!, alt, variant: 'user' };
  }

  const initials = getInitials(name);
  if (initials !== '?') {
    return { initials, alt, variant: 'user' };
  }

  return { emoji: DEFAULT_USER_EMOJI, alt, variant: 'user' };
}
