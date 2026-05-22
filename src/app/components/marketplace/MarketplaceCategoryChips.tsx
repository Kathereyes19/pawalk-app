import React from 'react';
import { Dog, Cat, UtensilsCrossed, HeartPulse, ToyBrick, Sparkles } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { MARKETPLACE_BROWSE_CATEGORIES } from '@/features/marketplace';
import { ChipButton } from '../ChipButton';
import type { MarketplaceBrowseCategory } from '@/types';

const CATEGORY_META: Record<
  MarketplaceBrowseCategory,
  { icon: React.ComponentType<{ className?: string }> }
> = {
  dogs: { icon: Dog },
  cats: { icon: Cat },
  food: { icon: UtensilsCrossed },
  health: { icon: HeartPulse },
  toys: { icon: ToyBrick },
  grooming: { icon: Sparkles },
};

interface MarketplaceCategoryChipsProps {
  active: MarketplaceBrowseCategory | 'all';
  onChange: (category: MarketplaceBrowseCategory | 'all') => void;
}

export const MarketplaceCategoryChips: React.FC<MarketplaceCategoryChipsProps> = ({
  active,
  onChange,
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
      <ChipButton
        active={active === 'all'}
        onClick={() => onChange('all')}
        className="snap-start shrink-0"
      >
        <span aria-hidden>🛍️</span>
        {t('marketplace.browse.all')}
      </ChipButton>
      {MARKETPLACE_BROWSE_CATEGORIES.map((category) => {
        const Icon = CATEGORY_META[category].icon;
        const isActive = active === category;
        return (
          <ChipButton
            key={category}
            active={isActive}
            onClick={() => onChange(category)}
            className="snap-start shrink-0"
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
            {t(`marketplace.browse.${category}`)}
          </ChipButton>
        );
      })}
    </div>
  );
};
