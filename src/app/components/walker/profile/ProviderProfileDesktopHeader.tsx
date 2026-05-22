import React, { useMemo } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  Heart,
  MapPin,
  Star,
  Verified,
} from 'lucide-react';
import { Avatar } from '../../Avatar';
import { IconButton } from '../../IconButton';
import { WalkerAvailabilityBadge } from '../WalkerAvailabilityBadge';
import { getCategoryBadgeLabel } from '@/lib/providers/serviceExperience';
import { getWalkerHomeCategory } from '@/lib/walkers/serviceCategory';
import { getWalkerAvatarProps } from '@/lib/avatars';
import { getCategorySpecializationLabel } from './types';
import type { Walker } from '@/types';

interface ProviderProfileDesktopHeaderProps {
  walker: Walker;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onBack: () => void;
  verifiedLabel: string;
}

export const ProviderProfileDesktopHeader: React.FC<ProviderProfileDesktopHeaderProps> = ({
  walker,
  isFavorite,
  onToggleFavorite,
  onBack,
  verifiedLabel,
}) => {
  const category = getWalkerHomeCategory(walker);
  const walkerAvatar = useMemo(() => getWalkerAvatarProps(walker), [walker]);
  const specialization = getCategorySpecializationLabel(category);

  return (
    <header className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-border/70 bg-gradient-to-r from-primary/5 via-background to-accent/5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <IconButton
              onClick={onBack}
              variant="ghost"
              aria-label="Volver"
              className="border border-border bg-background hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </IconButton>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {getCategoryBadgeLabel(category)}
            </span>
          </div>
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            aria-pressed={isFavorite}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isFavorite ? 'fill-primary text-primary' : 'text-muted-foreground'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="relative shrink-0">
            <Avatar {...walkerAvatar} size="2xl" className="ring-4 ring-primary/10" />
            {walker.verified && (
              <div
                className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full border-4 border-card bg-success shadow-md"
                aria-hidden
              >
                <BadgeCheck className="h-5 w-5 text-white" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
                {walker.name}
              </h1>
              {walker.verified && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                  <Verified className="h-3.5 w-3.5" />
                  {verifiedLabel}
                </span>
              )}
            </div>

            <p className="text-sm font-medium text-muted-foreground mb-4">{specialization}</p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
              <div className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-secondary text-secondary" aria-hidden />
                <span className="font-bold text-foreground">{walker.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({walker.reviews} reseñas)
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 text-muted-foreground">
                <span className="font-semibold text-foreground">{walker.experience}+</span>
                <span>años de experiencia</span>
              </div>

              <div className="inline-flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                <span>{walker.distance} km de distancia</span>
              </div>

              <WalkerAvailabilityBadge walker={walker} size="md" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
