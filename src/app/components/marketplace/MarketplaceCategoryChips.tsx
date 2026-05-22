import React from 'react';
import { Dog, Cat, UtensilsCrossed, HeartPulse, ToyBrick, Sparkles } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { MARKETPLACE_BROWSE_CATEGORIES } from '@/features/marketplace';
import type { MarketplaceBrowseCategory } from '@/types';

const CATEGORY_META: Record<
  MarketplaceBrowseCategory,
  { icon: React.ComponentType<{ className?: string }>; emoji: string }
> = {
  dogs: { icon: Dog, emoji: '🐕' },
  cats: { icon: Cat, emoji: '🐱' },
  food: { icon: UtensilsCrossed, emoji: '🍽️' },
  health: { icon: HeartPulse, emoji: '💊' },
  toys: { icon: ToyBrick, emoji: '🎾' },
  grooming: { icon: Sparkles, emoji: '✨' },
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
      <button
        type="button"
        onClick={() => onChange('all')}
        className={`snap-start shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
          active === 'all'
            ? 'bg-primary text-white shadow-md shadow-primary/25'
            : 'bg-card border border-border text-foreground hover:border-primary/30'
        }`}
      >
        <span>🛍️</span>
        {t('marketplace.browse.all')}
      </button>
      {MARKETPLACE_BROWSE_CATEGORIES.map((category) => {
        const meta = CATEGORY_META[category];
        const Icon = meta.icon;
        const isActive = active === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={`snap-start shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
              isActive
                ? 'bg-primary text-white shadow-md shadow-primary/25 scale-[1.02]'
                : 'bg-card border border-border text-foreground hover:border-primary/30 hover:bg-primary/5'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-primary'}`} />
            {t(`marketplace.browse.${category}`)}
          </button>
        );
      })}
    </div>
  );
};
