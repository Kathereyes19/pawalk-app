import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, CreditCard, MoreVertical, Star } from 'lucide-react';
import { Badge } from '../Badge';
import { Card } from '../Card';
import {
  formatExpiry,
  getCardBrandGradient,
  getCardBrandLabel,
  maskCardNumber,
} from '@/lib/paymentCardUtils';
import type { PaymentMethod } from '@/types';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected?: boolean;
  selectable?: boolean;
  showActions?: boolean;
  onSelect?: () => void;
  onSetDefault?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  selected = false,
  selectable = false,
  showActions = false,
  onSelect,
  onSetDefault,
  onEdit,
  onDelete,
}) => {
  const gradient = getCardBrandGradient(method.brand);

  return (
    <motion.div whileTap={selectable ? { scale: 0.98 } : undefined} layout>
      <Card
        padding="md"
        hoverable={selectable}
        onClick={selectable ? onSelect : undefined}
        className={`relative overflow-hidden transition-all ${
          selected ? 'border-2 border-primary bg-primary/5 shadow-lg' : 'border border-border'
        } ${selectable ? 'cursor-pointer' : ''}`}
      >
        <div className={`absolute inset-0 opacity-[0.07] bg-gradient-to-br ${gradient}`} />

        <div className="relative flex items-start gap-3">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md shrink-0`}
          >
            <CreditCard className="w-7 h-7 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="font-semibold truncate">
                {maskCardNumber(method.last4, method.brand)}
              </p>
              {method.isDefault && (
                <Badge className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5">
                  Predeterminada
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{method.cardholderName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Vence {formatExpiry(method.expMonth, method.expYear)}
            </p>
          </div>

          {selected && (
            <CheckCircle2 className="w-6 h-6 text-primary fill-primary shrink-0" />
          )}

          {showActions && (
            <div className="flex flex-col gap-1 shrink-0">
              {!method.isDefault && onSetDefault && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSetDefault();
                  }}
                  className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Establecer como predeterminada"
                >
                  <Star className="w-4 h-4" />
                </button>
              )}
              {onEdit && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit();
                  }}
                  className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Editar tarjeta"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete();
                  }}
                  className="p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors text-xs font-semibold"
                  aria-label="Eliminar tarjeta"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>

        <div className="relative mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground uppercase tracking-wide">
          <span>{getCardBrandLabel(method.brand)}</span>
          <span>···· {method.last4}</span>
        </div>
      </Card>
    </motion.div>
  );
};
