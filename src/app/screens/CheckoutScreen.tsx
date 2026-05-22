import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Check,
  Info,
  PawPrint,
  ChevronDown,
  ChevronUp,
  CalendarDays,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  CheckoutHeader,
  CheckoutPaymentSelector,
  CheckoutSecurityBanner,
  CheckoutFixedFooter,
  useCheckoutPayment,
  runCheckoutProcessing,
  BOOKING_PROCESSING_STAGES,
} from '../components/checkout';
import {
  calculateCategoryBookingTotals,
  formatCareDurationLabel,
  VET_SERVICE_CATALOG,
  type VetBookableServiceId,
} from '@/lib/providers/serviceExperience';
import { getWalkerHomeCategory } from '@/lib/walkers/serviceCategory';
import { getWalkerAvatarProps, getPetAvatarProps } from '@/lib/images';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { AddPaymentMethodSheet } from '../components/payments/AddPaymentMethodSheet';
import type { Walker, BookingData, CheckoutPaymentSelection } from '@/types';

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
  const checkoutPayment = useCheckoutPayment();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

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

  const handlePayment = async () => {
    if (isProcessing) return;
    setPaymentError(null);

    const selection = checkoutPayment.buildPaymentSelection();
    if (!selection) {
      setPaymentError('Agrega una tarjeta o elige otro método de pago.');
      return;
    }

    setIsProcessing(true);
    const result = await runCheckoutProcessing(
      async () => onConfirm(selection),
      setProcessingStage,
      BOOKING_PROCESSING_STAGES
    );
    setIsProcessing(false);
    if (result.error) setPaymentError(result.error);
  };

  return (
    <div className="h-full overflow-y-auto pb-32 bg-background-secondary">
      <CheckoutHeader
        title={t('checkout.payment')}
        subtitle="Completa tu reserva de forma segura"
        onBack={onBack}
      />

      <div className="p-4 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="relative">
                  <Avatar {...getWalkerAvatarProps(walker)} size="xl" />
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
                        <Avatar {...getPetAvatarProps({ avatar: pet.avatar, name: pet.name, id: pet.id })} size="sm" />
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
                        <span className="text-muted-foreground">Tarifa de plataforma (15%)</span>
                        <span className="font-medium">${platformFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Seguro incluido (5%)</span>
                        <span className="font-medium">${insuranceFee.toLocaleString()}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between items-center pt-3 border-t-2 border-border">
                  <span className="font-bold text-lg">{t('checkout.total')}</span>
                  <div className="text-right">
                    <p className="font-bold text-primary text-2xl">${total.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">IVA incluido</p>
                  </div>
                </div>
              </div>

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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <CheckoutPaymentSelector
            title={t('checkout.payment')}
            paymentMethods={checkoutPayment.paymentMethods}
            paymentMethodsLoading={checkoutPayment.paymentMethodsLoading}
            paymentType={checkoutPayment.paymentType}
            selectedCardId={checkoutPayment.selectedCardId}
            showAllCards={checkoutPayment.showAllCards}
            allowedTypes={checkoutPayment.allowedTypes}
            onPaymentTypeChange={checkoutPayment.setPaymentType}
            onSelectCard={checkoutPayment.setSelectedCardId}
            onToggleShowAllCards={() => checkoutPayment.setShowAllCards((value) => !value)}
            onAddCard={() => checkoutPayment.setAddCardOpen(true)}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <CheckoutSecurityBanner />
        </motion.div>
      </div>

      <AddPaymentMethodSheet
        open={checkoutPayment.addCardOpen}
        mode="add"
        onClose={() => checkoutPayment.setAddCardOpen(false)}
        onSubmit={checkoutPayment.handleAddCard}
      />

      <CheckoutFixedFooter
        total={total}
        confirmLabel={t('checkout.confirm')}
        isProcessing={isProcessing}
        processingStage={processingStage}
        processingStages={BOOKING_PROCESSING_STAGES}
        error={paymentError}
        onConfirm={handlePayment}
      />
    </div>
  );
};
