export type AvatarVariant = 'user' | 'pet' | 'provider-walker' | 'provider-caregiver' | 'provider-vet' | 'marketplace' | 'default';

export interface AvatarDisplayProps {
  emoji?: string;
  initials?: string;
  alt: string;
  variant?: AvatarVariant;
}
