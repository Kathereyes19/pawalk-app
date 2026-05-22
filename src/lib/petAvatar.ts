export function getPetAvatarProps(avatar: string): { emoji?: string; src?: string } {
  if (!avatar) return { emoji: '🐾' };
  if (avatar.startsWith('http') || avatar.startsWith('data:')) {
    return { src: avatar };
  }
  return { emoji: avatar };
}

export function isImageAvatar(avatar: string): boolean {
  return avatar.startsWith('http') || avatar.startsWith('data:');
}
