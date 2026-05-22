export { getPetAvatarProps } from '@/lib/images/avatarProps';
export { isDirectImageUrl } from '@/lib/images/unsplash';

export function isImageAvatar(avatar: string): boolean {
  return isDirectImageUrl(avatar);
}
