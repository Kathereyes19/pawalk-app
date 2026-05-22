import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { IconButton } from '../IconButton';
import { Card } from '../Card';
import type { CartProduct } from '@/types';

interface CartItemRowProps {
  item: CartProduct;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}) => {
  return (
    <Card padding="md" className="border border-border">
      <div className="flex gap-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center text-3xl shrink-0">
          {item.imageEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-sm line-clamp-2">{item.name}</p>
            <button
              type="button"
              onClick={onRemove}
              className="p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive min-w-10 min-h-10"
              aria-label="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            ${item.price.toLocaleString()} c/u
          </p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1 bg-muted/60 rounded-xl p-1">
              <IconButton size="sm" variant="ghost" onClick={onDecrease} aria-label="Disminuir">
                <Minus className="w-4 h-4" />
              </IconButton>
              <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
              <IconButton size="sm" variant="ghost" onClick={onIncrease} aria-label="Aumentar">
                <Plus className="w-4 h-4" />
              </IconButton>
            </div>
            <p className="font-bold text-primary">${item.lineTotal.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
