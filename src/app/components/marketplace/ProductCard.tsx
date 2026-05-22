import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Plus } from 'lucide-react';
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
        className="text-left w-full touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
      >
        <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="relative h-28">
            <ProductImage product={product} size="card" className="h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-semibold line-clamp-2 drop-shadow">
              {product.name}
            </p>
          </div>
          <div className="p-2.5 flex items-center justify-between gap-2">
            <p className="font-bold text-primary text-sm">${product.price.toLocaleString()}</p>
            <StarRating rating={product.rating} showCount={false} />
          </div>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className={`text-left w-full touch-manipulation rounded-2xl overflow-hidden border bg-card shadow-sm hover:shadow-lg transition-all duration-300 ${
        featured ? 'border-primary/30 ring-1 ring-primary/10' : 'border-border hover:border-primary/20'
      }`}
    >
      <button type="button" onClick={onClick} className="w-full text-left">
        <div className={`relative ${featured ? 'h-44' : 'h-40'} overflow-hidden`}>
          <ProductImage product={product} size="card" className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          {!product.inStock && (
            <Badge className="absolute top-2.5 right-2.5 bg-black/60 text-white border-0 text-[10px]">
              {t('marketplace.outOfStock')}
            </Badge>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <StarRating
              rating={product.rating}
              reviewCount={product.reviewCount}
              className="mb-1 [&_span]:text-white/90 [&_.text-muted-foreground]:text-white/70"
            />
          </div>
        </div>

        <div className="p-3 space-y-2">
          <p className="font-semibold text-sm line-clamp-2 min-h-[2.5rem] leading-snug">{product.name}</p>
          {!featured && (
            <p className="text-xs text-muted-foreground line-clamp-1">{product.shortDescription}</p>
          )}
          <p className="text-lg font-bold text-primary">${product.price.toLocaleString()}</p>
        </div>
      </button>

      <div className="px-3 pb-3">
        <Button
          fullWidth
          size="sm"
          disabled={!product.inStock}
          onClick={handleAddToCart}
          className="rounded-xl shadow-sm"
        >
          {onAddToCart ? (
            <>
              <Plus className="w-4 h-4" />
              {t('marketplace.addToCart')}
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              {t('marketplace.viewProduct')}
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};
