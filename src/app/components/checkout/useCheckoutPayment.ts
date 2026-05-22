import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePaymentMethods } from '@/contexts/PaymentMethodsContext';
import { maskCardNumber } from '@/lib/paymentCardUtils';
import type { CheckoutPaymentSelection, CheckoutPaymentType } from '@/types';

interface UseCheckoutPaymentOptions {
  allowedTypes?: CheckoutPaymentType[];
}

export function useCheckoutPayment(options: UseCheckoutPaymentOptions = {}) {
  const allowedTypes = options.allowedTypes ?? ['card', 'pse', 'nequi'];
  const {
    paymentMethods,
    defaultPaymentMethod,
    isLoading: paymentMethodsLoading,
    addPaymentMethod,
  } = usePaymentMethods();

  const [paymentType, setPaymentType] = useState<CheckoutPaymentType>(
    allowedTypes.includes('card') ? 'card' : allowedTypes[0]
  );
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showAllCards, setShowAllCards] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState(false);

  useEffect(() => {
    if (defaultPaymentMethod) {
      setSelectedCardId(defaultPaymentMethod.id);
    }
  }, [defaultPaymentMethod?.id, paymentMethods.length]);

  const selectedCard = useMemo(
    () => paymentMethods.find((method) => method.id === selectedCardId) ?? defaultPaymentMethod,
    [paymentMethods, selectedCardId, defaultPaymentMethod]
  );

  const buildPaymentSelection = useCallback((): CheckoutPaymentSelection | null => {
    if (paymentType === 'pse' && allowedTypes.includes('pse')) {
      return { type: 'pse', paymentLabel: 'PSE' };
    }
    if (paymentType === 'nequi' && allowedTypes.includes('nequi')) {
      return { type: 'nequi', paymentLabel: 'Nequi' };
    }
    const card = selectedCard ?? defaultPaymentMethod;
    if (!card) return null;
    return {
      type: 'card',
      paymentMethodId: card.id,
      paymentLabel: maskCardNumber(card.last4, card.brand),
    };
  }, [allowedTypes, defaultPaymentMethod, paymentType, selectedCard]);

  const handleAddCard = useCallback(
    async (payload: {
      cardholderName: string;
      cardNumber: string;
      expMonth: string;
      expYear: string;
      cvv: string;
      setAsDefault?: boolean;
    }) => {
      const result = await addPaymentMethod({ ...payload, setAsDefault: true });
      if (!result.error) {
        setPaymentType('card');
        setAddCardOpen(false);
      }
      return result;
    },
    [addPaymentMethod]
  );

  return {
    allowedTypes,
    paymentMethods,
    defaultPaymentMethod,
    paymentMethodsLoading,
    paymentType,
    setPaymentType,
    selectedCardId,
    setSelectedCardId,
    selectedCard,
    showAllCards,
    setShowAllCards,
    addCardOpen,
    setAddCardOpen,
    buildPaymentSelection,
    handleAddCard,
  };
}
