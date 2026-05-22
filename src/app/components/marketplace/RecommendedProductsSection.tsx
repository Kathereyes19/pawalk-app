import React from 'react';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { ProductCard } from './ProductCard';
import type { MarketplaceProduct } from '@/types';

interface RecommendedProductsSectionProps {
  products: MarketplaceProduct[];
  onProductClick: (productId: string) => void;
}

export const RecommendedProductsSection: React.FC<RecommendedProductsSectionProps> = ({
  products,
  onProductClick,
}) => {
  const { t } = useLanguage();

  if (products.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="font-bold text-lg">{t('marketplace.recommended.title')}</h2>
      </div>
      <p className="text-sm text-muted-foreground -mt-1">{t('marketplace.recommended.subtitle')}</p>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
        {products.map((product) => (
          <div key={product.id} className="w-[46%] min-w-[160px] shrink-0 snap-start">
            <ProductCard product={product} onClick={() => onProductClick(product.id)} compact />
          </div>
        ))}
      </div>
    </section>
  );
};
