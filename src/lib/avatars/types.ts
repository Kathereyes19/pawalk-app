export type AvatarVariant = 'user' | 'pet' | 'provider-walker' | 'provider-caregiver' | 'provider-vet' | 'marketplace' | 'default';

export interface AvatarDisplayProps {
  src?: string;
  emoji?: string;
  initials?: string;
  alt: string;
  variant?: AvatarVariant;
}
