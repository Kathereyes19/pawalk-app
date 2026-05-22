import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CreditCard, Building2, CheckCircle2, Shield, Lock, Info, Calendar, Clock, Check, AlertCircle, PawPrint, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { usePaymentMethods } from '@/contexts/PaymentMethodsContext';
import {
  calculateCategoryBookingTotals,
  formatCareDurationLabel,
  VET_SERVICE_CATALOG,
  type VetBookableServiceId,
} from '@/lib/providers/serviceExperience';
import { getWalkerHomeCategory } from '@/lib/walkers/serviceCategory';
import { maskCardNumber } from '@/lib/paymentCardUtils';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { IconButton } from '../components/IconButton';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { PaymentMethodCard } from '../components/payments/PaymentMethodCard';
import { AddPaymentMethodSheet } from '../components/payments/AddPaymentMethodSheet';
import type { Walker, BookingData, CheckoutPaymentSelection, CheckoutPaymentType } from '@/types';

interface CheckoutScreenProps {
  walker: Walker;
  bookingData: BookingData;
  onBack: () => void;
  onConfirm: (selection: CheckoutPaymentSelection) => Promise<{ error?: string | null } | void>;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  walker,
  bookingData,
  onBack,
  onConfirm,
}) => {
  const { t } = useLanguage();
  const {
    paymentMethods,
    defaultPaymentMethod,
    isLoading: paymentMethodsLoading,
    addPaymentMethod,
  } = usePaymentMethods();

  const [paymentType, setPaymentType] = useState<CheckoutPaymentType>('card');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showAllCards, setShowAllCards] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultPaymentMethod) {
      setSelectedCardId(defaultPaymentMethod.id);
    }
  }, [defaultPaymentMethod?.id, paymentMethods.length]);

  const selectedCard = useMemo(
    () => paymentMethods.find((method) => method.id === selectedCardId) ?? defaultPaymentMethod,
    [paymentMethods, selectedCardId, defaultPaymentMethod]
  );

  const visibleCards = useMemo(() => {
    if (showAllCards || paymentMethods.length <= 2) return paymentMethods;
    const prioritized = selectedCard
      ? [selectedCard, ...paymentMethods.filter((method) => method.id !== selectedCard.id)]
      : paymentMethods;
    return prioritized.slice(0, 2);
  }, [paymentMethods, selectedCard, showAllCards]);

  const petCount = Math.max(1, bookingData.pets?.length ?? 1);
  const category = bookingData.serviceCategory ?? getWalkerHomeCategory(walker);
  const selectedService =
    category === 'veterinary' && bookingData.selectedServiceId
      ? VET_SERVICE_CATALOG[bookingData.selectedServiceId as VetBookableServiceId]
      : null;
  const totals = useMemo(
    () =>
      bookingData.total != null && bookingData.serviceFee != null
        ? {
            servicePrice: bookingData.serviceFee,
            platformFee: bookingData.platformFee ?? 0,
            insuranceFee: Math.round((bookingData.serviceFee ?? 0) * 0.05),
            totalPrice: bookingData.total,
          }
        : calculateCategoryBookingTotals(
            walker,
            category,
            bookingData.duration ?? 60,
            petCount,
            selectedService
          ),
    [bookingData, category, petCount, selectedService, walker]
  );
  const { servicePrice, platformFee, insuranceFee, totalPrice: total } = totals;
  const durationLabel =
    bookingData.durationLabel ??
    formatCareDurationLabel(bookingData.duration ?? 60, bookingData.isOvernight);

  const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

  const buildPaymentSelection = (): CheckoutPaymentSelection | null => {
    if (paymentType === 'pse') {
      return { type: 'pse', paymentLabel: 'PSE' };
    }
    if (paymentType === 'nequi') {
      return { type: 'nequi', paymentLabel: 'Nequi' };
    }
    const card = selectedCard ?? defaultPaymentMethod;
    if (!card) return null;
    return {
      type: 'card',
      paymentMethodId: card.id,
      paymentLabel: maskCardNumber(card.last4, card.brand),
    };
  };

  const handlePayment = async () => {
    if (isProcessing) return;

    setPaymentError(null);

    const selection = buildPaymentSelection();
    if (!selection) {
      setPaymentError('Agrega una tarjeta o elige otro método de pago.');
      return;
    }

    setIsProcessing(true);
    setProcessingStage(0);

    try {
      await delay(500);
      setProcessingStage(1);
      await delay(700);
      setProcessingStage(2);
      await delay(800);
      setProcessingStage(3);
      await delay(800);

      const result = await onConfirm(selection);
      if (result?.error) {
        setPaymentError(result.error);
      }
    } catch (err) {
      setPaymentError(
        err instanceof Error ? err.message : 'No se pudo confirmar la reserva. Intenta de nuevo.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddCard = async (payload: {
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
  };

  const processingStages = [
    'Iniciando pago...',
    'Validando información...',
    'Procesando pago seguro...',
    'Confirmando reserva...',
  ];

  return (
    <div className="h-full overflow-y-auto pb-32 bg-background-secondary">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-accent px-6 py-6 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <IconButton
            onClick={onBack}
            variant="ghost"
            className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </IconButton>

          {/* Security Badge */}
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">
            <Shield className="w-4 h-4 text-white" />
            <span className="text-xs font-semibold text-white">Pago seguro</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">{t('checkout.payment')}</h1>
        <p className="text-white/90 text-sm">Completa tu reserva de forma segura</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Booking Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border-2 border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {t('checkout.summary')}
              </h2>
              <Badge className="bg-success/10 text-success border-success/20">
                Confirmación instantánea
              </Badge>
            </div>

            <div className="space-y-4">
              {/* Walker Info */}
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="relative">
                  <Avatar emoji={walker.avatar} size="xl" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center border-2 border-white">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-lg">{walker.name}</p>
                    <Badge variant="success" className="text-xs">
                      Verificado
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{bookingData.date}</span>
                    <div className="w-1 h-1 bg-border rounded-full" />
                    <Clock className="w-3.5 h-3.5" />
                    <span>{bookingData.time}</span>
                    <div className="w-1 h-1 bg-border rounded-full" />
                    <span>{durationLabel}</span>
                  </div>
                </div>
              </div>

              {bookingData.pets && bookingData.pets.length > 0 && (
                <div className="pb-4 border-b border-border">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <PawPrint className="w-3.5 h-3.5" />
                    Mascotas ({bookingData.pets.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {bookingData.pets.map((pet) => (
                      <div
                        key={pet.id}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-muted/60 text-sm"
                      >
                        <Avatar emoji={pet.avatar ?? '🐾'} size="sm" />
                        <span className="font-medium">{pet.name}</span>
                      </div>
                    ))}
                  </div>
                  {petCount > 1 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Precio base × {petCount} mascotas
                    </p>
                  )}
                </div>
              )}

              {/* Price Breakdown */}
              <div>
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="w-full flex items-center justify-between text-sm mb-3 hover:opacity-80 transition-opacity"
                >
                  <span className="font-medium">Desglose de precios</span>
                  <Info className="w-4 h-4 text-primary" />
                </button>

                <AnimatePresence>
                  {showBreakdown && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2.5 text-sm mb-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          Servicio ({durationLabel}
                          {petCount > 1 ? ` · ${petCount} mascotas` : ''})
                        </span>
                        <span className="font-medium">${servicePrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Tarifa de plataforma</span>
                          <span className="text-xs text-muted-foreground">(15%)</span>
                        </div>
                        <span className="font-medium">${platformFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-success" />
                          <span className="text-muted-foreground">Seguro incluido</span>
                          <span className="text-xs text-muted-foreground">(5%)</span>
                        </div>
                        <span className="font-medium">${insuranceFee.toLocaleString()}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between items-center pt-3 border-t-2 border-border">
                  <span className="font-bold text-lg">{t('checkout.total')}</span>
                  <div className="text-right">
                    <p className="font-bold text-primary text-2xl">
                      ${total.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">IVA incluido</p>
                  </div>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="bg-muted/50 p-3 rounded-xl">
                <div className="flex items-start gap-2 text-xs">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-foreground-secondary leading-relaxed">
                    <span className="font-semibold text-foreground">Cancelación gratuita</span> hasta
                    24 horas antes del paseo. Después se cobrará el 50% del valor total.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            {t('checkout.payment')}
          </h2>

          <div className="space-y-2.5">
            {/* Saved cards */}
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
                        setPaymentType('card');
                        setSelectedCardId(card.id);
                      }}
                    />
                  </motion.div>
                ))}

                {paymentMethods.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setShowAllCards((value) => !value)}
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
                        Ver {paymentMethods.length - 2} tarjeta{paymentMethods.length - 2 > 1 ? 's' : ''} más
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setAddCardOpen(true)}
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
                  <Button size="sm" onClick={() => setAddCardOpen(true)}>
                    <Plus className="w-4 h-4" />
                    Agregar tarjeta
                  </Button>
                </div>
              </Card>
            )}

            {/* PSE */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
            >
              <Card
                onClick={() => setPaymentType('pse')}
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
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      <CheckCircle2 className="w-6 h-6 text-primary fill-primary" />
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Nequi */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card
                onClick={() => setPaymentType('nequi')}
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
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      <CheckCircle2 className="w-6 h-6 text-primary fill-primary" />
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Security Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
            <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-success" />
              Tu pago está protegido
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-success" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium">Encriptación SSL 256-bit</p>
                  <p className="text-xs text-muted-foreground">Tus datos están seguros</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium">Verificación en dos pasos</p>
                  <p className="text-xs text-muted-foreground">Confirmación bancaria</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium">Garantía de reembolso</p>
                  <p className="text-xs text-muted-foreground">100% seguro o te devolvemos tu dinero</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-3 text-xs text-muted-foreground">
              <span>Certificado por:</span>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-background rounded border border-border">
                  <span className="font-semibold">PCI DSS</span>
                </div>
                <div className="px-2 py-1 bg-background rounded border border-border">
                  <span className="font-semibold">SSL</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <AddPaymentMethodSheet
        open={addCardOpen}
        mode="add"
        onClose={() => setAddCardOpen(false)}
        onSubmit={handleAddCard}
      />

      {/* Fixed Bottom CTA */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 p-4 pb-safe bg-card/98 backdrop-blur-xl border-t-2 border-border/50 shadow-2xl z-40"
      >
        <div className="max-w-md mx-auto">
          {/* Processing Overlay */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-3 p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0"
                  >
                    <Lock className="w-4 h-4 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{processingStages[processingStage]}</p>
                    <div className="flex gap-1 mt-2">
                      {processingStages.map((_, i) => (
                        <motion.div
                          key={i}
                          className={`h-1 flex-1 rounded-full ${
                            i <= processingStage ? 'bg-primary' : 'bg-muted'
                          }`}
                          animate={{ scaleX: i === processingStage ? [1, 1.05, 1] : 1 }}
                          transition={{ duration: 0.5, repeat: i === processingStage ? Infinity : 0 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Payment Summary */}
          {!isProcessing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-3 flex items-center justify-between text-xs px-1"
            >
              <div className="flex items-center gap-1 text-muted-foreground">
                <Shield className="w-3.5 h-3.5 text-success" />
                <span>Pago 100% seguro</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Total a pagar:</span>
                <span className="font-bold text-primary">${total.toLocaleString()}</span>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {paymentError && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mb-3 p-3 rounded-xl border border-destructive/20 bg-destructive/5"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive font-medium">{paymentError}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            fullWidth
            size="xl"
            onClick={handlePayment}
            loading={isProcessing}
            disabled={isProcessing}
            className="shadow-xl"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Procesando pago seguro...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                {t('checkout.confirm')}
                <span className="font-bold">• ${total.toLocaleString()}</span>
              </span>
            )}
          </Button>

          {!isProcessing && (
            <p className="text-center text-xs text-muted-foreground mt-3">
              Al confirmar aceptas nuestra política de{' '}
              <button className="text-primary font-medium hover:underline">cancelación</button> y{' '}
              <button className="text-primary font-medium hover:underline">términos de servicio</button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};
