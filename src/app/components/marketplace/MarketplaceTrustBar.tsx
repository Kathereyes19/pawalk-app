import React from 'react';
import { ShieldCheck, BadgeCheck, HeartHandshake } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

export const MarketplaceTrustBar: React.FC = () => {
  const { t } = useLanguage();

  const items = [
    { icon: ShieldCheck, label: t('marketplace.trust.delivery'), color: 'text-success' },
    { icon: BadgeCheck, label: t('marketplace.trust.verified'), color: 'text-primary' },
    { icon: HeartHandshake, label: t('marketplace.trust.guarantee'), color: 'text-accent' },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map(({ icon: Icon, label, color }) => (
        <div
          key={label}
          className="flex flex-col items-center text-center gap-1.5 p-2.5 rounded-2xl bg-card/80 border border-border/60 backdrop-blur-sm"
        >
          <div className={`w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-[10px] leading-tight font-medium text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
};
