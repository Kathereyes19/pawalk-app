import React from 'react';
import { Star, MapPin, Verified } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Avatar } from '../Avatar';
import { WalkerAvailabilityBadge } from '../walker/WalkerAvailabilityBadge';
import { getWalkerHomeCategory } from '@/lib/walkers/serviceCategory';
import { getWalkerAvatarProps } from '@/lib/avatars';
import type { Walker } from '@/types';

interface HomeWalkerGridCardProps {
  provider: Walker;
  index: number;
  yearsLabel: string;
  fromLabel: string;
  onClick: () => void;
  onBook: () => void;
}

export const HomeWalkerGridCard: React.FC<HomeWalkerGridCardProps> = ({
  provider,
  index,
  yearsLabel,
  fromLabel,
  onClick,
  onBook,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: Math.min(index * 0.04, 0.35) }}
  >
    <Card
      hoverable
      variant="elevated"
      className={`h-full flex flex-col ${!provider.available ? 'opacity-95' : ''}`}
    >
      <button type="button" onClick={onClick} className="flex-1 text-left p-4 pb-3">
        <div className="flex items-start gap-3 mb-3">
          <div className="relative shrink-0">
            <Avatar {...getWalkerAvatarProps(provider)} size="lg" />
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-card ${
                provider.available ? 'bg-success' : 'bg-muted-foreground/50'
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="font-semibold text-sm truncate">{provider.name}</h3>
              {provider.verified && (
                <Verified className="w-3.5 h-3.5 text-primary fill-primary shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
                {provider.rating}
              </span>
              <span className="inline-flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {provider.distance} km
              </span>
            </div>
          </div>
          <WalkerAvailabilityBadge walker={provider} size="sm" />
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {getWalkerHomeCategory(provider) === 'walkers' &&
            provider.walkDurations?.slice(0, 2).map((duration) => (
              <Badge key={duration} size="sm">
                {duration} min
              </Badge>
            ))}
          {getWalkerHomeCategory(provider) === 'caregivers' &&
            provider.caregiverServices?.slice(0, 2).map((service) => (
              <Badge key={service} size="sm">
                {service === 'overnight' ? 'Nocturno' : service === 'in-home' ? 'En casa' : 'Multi'}
              </Badge>
            ))}
          {getWalkerHomeCategory(provider) === 'veterinary' &&
            provider.vetServices?.slice(0, 2).map((service) => (
              <Badge key={service} size="sm">
                {service === 'emergency' ? 'Emergencias' : service === 'vaccination' ? 'Vacunas' : 'Grooming'}
              </Badge>
            ))}
        </div>

        <div className="flex items-end justify-between gap-2">
          <Badge variant="success" size="sm">
            {provider.experience} {yearsLabel}
          </Badge>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">{fromLabel}</p>
            <p className="font-bold text-primary text-base">${provider.price.toLocaleString()}</p>
          </div>
        </div>
      </button>

      <div className="px-4 pb-4 pt-0">
        <Button
          fullWidth
          size="sm"
          variant={provider.available ? 'default' : 'outline'}
          onClick={(event) => {
            event.stopPropagation();
            onBook();
          }}
        >
          {provider.available ? 'Reservar' : 'Ver perfil'}
        </Button>
      </div>
    </Card>
  </motion.div>
);
