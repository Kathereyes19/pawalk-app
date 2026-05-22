import React from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { Badge } from '../Badge';
import { Card } from '../Card';
import type { MarketplaceProduct } from '@/types';

interface ProductCardProps {
  product: MarketplaceProduct;
  onClick: () => void;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, compact = false }) => {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="text-left w-full touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
    >
      <Card padding="none" hoverable className="overflow-hidden h-full">
        <div
          className={`${compact ? 'h-24 text-4xl' : 'h-32 text-5xl'} bg-gradient-to-br from-primary/15 via-accent/10 to-secondary/15 flex items-center justify-center relative`}
        >
          {product.imageEmoji}
          {!product.inStock && (
            <Badge className="absolute top-2 right-2 bg-muted text-muted-foreground text-[10px]">
              Agotado
            </Badge>
          )}
        </div>
        <div className={compact ? 'p-2.5' : 'p-3'}>
          <p className={`font-semibold line-clamp-2 ${compact ? 'text-xs min-h-[2rem]' : 'text-sm min-h-[2.5rem]'}`}>
            {product.name}
          </p>
          {!compact && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1 min-h-[2rem]">
              {product.shortDescription}
            </p>
          )}
          <div className="flex items-center justify-between mt-2 gap-2">
            <p className={`font-bold text-primary ${compact ? 'text-sm' : ''}`}>
              ${product.price.toLocaleString()}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="font-medium">{product.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.button>
  );
};
