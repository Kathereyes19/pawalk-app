export function isDirectImageUrl(value?: string | null): value is string {
  if (!value) return false;
  return (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  );
}

export function resolveAvatarImageUrl(
  ...candidates: Array<string | null | undefined>
): string | undefined {
  return candidates.find(isDirectImageUrl);
}

export function isEmojiAvatar(value?: string | null): boolean {
  if (!value) return false;
  return !isDirectImageUrl(value) && value.length <= 8;
}
