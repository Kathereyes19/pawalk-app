import React from 'react';
import { motion } from 'motion/react';
import { Plus, ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { ProductImage } from './ProductImage';
import { StarRating } from './StarRating';
import { Badge } from '../Badge';
import { Button } from '../Button';
import type { MarketplaceProduct } from '@/types';

interface ProductCardProps {
  product: MarketplaceProduct;
  onClick: () => void;
  onAddToCart?: (productId: string) => void;
  compact?: boolean;
  featured?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
  onAddToCart,
  compact = false,
  featured = false,
}) => {
  const { t } = useLanguage();

  const handleAddToCart = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!product.inStock) return;
    onAddToCart?.(product.id);
  };

  if (compact) {
    return (
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="text-left w-full touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl"
      >
        <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <ProductImage product={product} size="card" className="h-28 w-full" />
          <div className="p-2.5 space-y-1">
            <p className="font-semibold text-xs line-clamp-2 leading-snug">{product.name}</p>
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-primary text-sm">${product.price.toLocaleString()}</p>
              <StarRating rating={product.rating} showCount={false} />
            </div>
          </div>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      whileTap={{ scale: 0.99 }}
      className={`text-left w-full touch-manipulation rounded-2xl overflow-hidden border bg-card shadow-sm hover:shadow-lg transition-all duration-300 ${
        featured ? 'border-primary/30 ring-1 ring-primary/10' : 'border-border hover:border-primary/20'
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <div className={`relative overflow-hidden ${featured ? 'h-36' : 'h-32'}`}>
          <ProductImage product={product} size="card" className="h-full w-full" />
          {!product.inStock && (
            <Badge className="absolute top-2.5 right-2.5 bg-black/60 text-white border-0 text-[10px]">
              {t('marketplace.outOfStock')}
            </Badge>
          )}
        </div>

        <div className="p-3 space-y-2">
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
          <p className="font-semibold text-sm line-clamp-2 min-h-[2.5rem] leading-snug">{product.name}</p>
          {!featured && (
            <p className="text-xs text-muted-foreground line-clamp-1">{product.shortDescription}</p>
          )}
          <p className="text-lg font-bold text-primary">${product.price.toLocaleString()}</p>
        </div>
      </button>

      <div className="px-3 pb-3 flex flex-col gap-2">
        {onAddToCart ? (
          <Button
            fullWidth
            size={featured ? 'lg' : 'md'}
            disabled={!product.inStock}
            onClick={handleAddToCart}
          >
            <Plus className="w-4 h-4" />
            {t('marketplace.addToCart')}
          </Button>
        ) : (
          <Button fullWidth size="md" variant="outline" onClick={onClick}>
            <ShoppingCart className="w-4 h-4" />
            {t('marketplace.viewProduct')}
          </Button>
        )}
      </div>
    </motion.div>
  );
};
