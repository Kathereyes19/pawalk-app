import React from 'react';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { ProductCard } from './ProductCard';
import type { MarketplaceProduct } from '@/types';

interface RecommendedProductsSectionProps {
  products: MarketplaceProduct[];
  onProductClick: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
}

export const RecommendedProductsSection: React.FC<RecommendedProductsSectionProps> = ({
  products,
  onProductClick,
  onAddToCart,
}) => {
  const { t } = useLanguage();

  if (products.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-4 border border-primary/10">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg">{t('marketplace.recommended.title')}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{t('marketplace.recommended.subtitle')}</p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
        {products.map((product) => (
          <div key={product.id} className="w-[72%] min-w-[240px] shrink-0 snap-start">
            <ProductCard
              product={product}
              onClick={() => onProductClick(product.id)}
              onAddToCart={onAddToCart}
              featured
            />
          </div>
        ))}
      </div>
    </section>
  );
};
