import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Building2, CheckCircle2, ChevronDown, ChevronUp, CreditCard, Lock, Plus } from 'lucide-react';
import { Card } from '../Card';
import { Button } from '../Button';
import { PaymentMethodCard } from '../payments/PaymentMethodCard';
import type { CheckoutPaymentType, PaymentMethod } from '@/types';

interface CheckoutPaymentSelectorProps {
  title?: string;
  paymentMethods: PaymentMethod[];
  paymentMethodsLoading?: boolean;
  paymentType: CheckoutPaymentType;
  selectedCardId: string | null;
  showAllCards: boolean;
  allowedTypes?: CheckoutPaymentType[];
  onPaymentTypeChange: (type: CheckoutPaymentType) => void;
  onSelectCard: (cardId: string) => void;
  onToggleShowAllCards: () => void;
  onAddCard: () => void;
}

export const CheckoutPaymentSelector: React.FC<CheckoutPaymentSelectorProps> = ({
  title = 'Método de pago',
  paymentMethods,
  paymentMethodsLoading = false,
  paymentType,
  selectedCardId,
  showAllCards,
  allowedTypes = ['card', 'pse', 'nequi'],
  onPaymentTypeChange,
  onSelectCard,
  onToggleShowAllCards,
  onAddCard,
}) => {
  const selectedCard = useMemo(
    () => paymentMethods.find((method) => method.id === selectedCardId) ?? null,
    [paymentMethods, selectedCardId]
  );

  const visibleCards = useMemo(() => {
    if (showAllCards || paymentMethods.length <= 2) return paymentMethods;
    const prioritized = selectedCard
      ? [selectedCard, ...paymentMethods.filter((method) => method.id !== selectedCard.id)]
      : paymentMethods;
    return prioritized.slice(0, 2);
  }, [paymentMethods, selectedCard, showAllCards]);

  return (
    <div>
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        <Lock className="w-5 h-5 text-primary" />
        {title}
      </h2>

      <div className="space-y-2.5">
        {allowedTypes.includes('card') && (
          <>
            {paymentMethodsLoading ? (
              <Card className="border border-border">
                <div className="flex items-center gap-3 py-2">
                  <div className="w-14 h-14 rounded-2xl bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                    <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                  </div>
                </div>
              </Card>
            ) : paymentMethods.length > 0 ? (
              <>
                {visibleCards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PaymentMethodCard
                      method={card}
                      selectable
                      selected={paymentType === 'card' && selectedCardId === card.id}
                      onSelect={() => {
                        onPaymentTypeChange('card');
                        onSelectCard(card.id);
                      }}
                    />
                  </motion.div>
                ))}

                {paymentMethods.length > 2 && (
                  <button
                    type="button"
                    onClick={onToggleShowAllCards}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-primary"
                  >
                    {showAllCards ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Ver menos tarjetas
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Ver {paymentMethods.length - 2} tarjeta
                        {paymentMethods.length - 2 > 1 ? 's' : ''} más
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={onAddCard}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-primary/30 text-primary text-sm font-semibold hover:bg-primary/5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar tarjeta
                </button>
              </>
            ) : (
              <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
                <div className="text-center py-4">
                  <CreditCard className="w-10 h-10 text-primary mx-auto mb-2" />
                  <p className="font-semibold text-sm mb-1">Sin tarjetas guardadas</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Guarda una tarjeta para pagar más rápido
                  </p>
                  <Button size="sm" onClick={onAddCard}>
                    <Plus className="w-4 h-4" />
                    Agregar tarjeta
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}

        {allowedTypes.includes('pse') && (
          <motion.div whileTap={{ scale: 0.98 }}>
            <Card
              onClick={() => onPaymentTypeChange('pse')}
              hoverable
              className={`cursor-pointer transition-all ${
                paymentType === 'pse'
                  ? 'border-2 border-primary bg-primary/5 shadow-lg'
                  : 'border border-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-md">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">PSE</p>
                  <p className="text-xs text-muted-foreground">Débito directo desde tu banco</p>
                </div>
                {paymentType === 'pse' && (
                  <CheckCircle2 className="w-6 h-6 text-primary fill-primary" />
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {allowedTypes.includes('nequi') && (
          <motion.div whileTap={{ scale: 0.98 }}>
            <Card
              onClick={() => onPaymentTypeChange('nequi')}
              hoverable
              className={`cursor-pointer transition-all ${
                paymentType === 'nequi'
                  ? 'border-2 border-primary bg-primary/5 shadow-lg'
                  : 'border border-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-md text-2xl">
                  💜
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Nequi</p>
                  <p className="text-xs text-muted-foreground">Pago instantáneo con QR</p>
                </div>
                {paymentType === 'nequi' && (
                  <CheckCircle2 className="w-6 h-6 text-primary fill-primary" />
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};
