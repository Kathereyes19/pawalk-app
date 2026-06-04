import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Check,
  Clock,
  Info,
  Lock,
  PawPrint,
  X,
} from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  CheckoutPaymentSelector,
  CheckoutSecurityBanner,
  useCheckoutPayment,
  runCheckoutProcessing,
  BOOKING_PROCESSING_STAGES,
} from '../../checkout';
import { AddPaymentMethodSheet } from '../../payments/AddPaymentMethodSheet';
import { Button } from '../../Button';
import { Card } from '../../Card';
import { Badge } from '../../Badge';
import { Avatar } from '../../Avatar';
import { IconButton } from '../../IconButton';
import {
  calculateCategoryBookingTotals,
  formatCareDurationLabel,
  VET_SERVICE_CATALOG,
  type VetBookableServiceId,
} from '@/lib/providers/serviceExperience';
import {
  formatBookingDateLabel,
  formatBookingTimeLabel,
} from '@/lib/providers/buildProfileBookingData';
import { getWalkerHomeCategory } from '@/lib/walkers/serviceCategory';
import { getWalkerAvatarProps, getPetAvatarProps } from '@/lib/avatars';
import type { BookingData, CheckoutPaymentSelection, Walker } from '@/types';

interface DesktopBookingConfirmModalProps {
  open: boolean;
  onClose: () => void;
  walker: Walker;
  bookingData: BookingData | null;
  onConfirm: (selection: CheckoutPaymentSelection) => Promise<{ error?: string | null } | void>;
}

export const DesktopBookingConfirmModal: React.FC<DesktopBookingConfirmModalProps> = ({
  open,
  onClose,
  walker,
  bookingData,
  onConfirm,
}) => {
  const { t } = useLanguage();
  const checkoutPayment = useCheckoutPayment();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const category = bookingData?.serviceCategory ?? getWalkerHomeCategory(walker);
  const petCount = Math.max(1, bookingData?.pets?.length ?? 1);
  const selectedService =
    category === 'veterinary' && bookingData?.selectedServiceId
      ? VET_SERVICE_CATALOG[bookingData.selectedServiceId as VetBookableServiceId]
      : null;

  const totals = useMemo(() => {
    if (!bookingData) {
      return { servicePrice: 0, platformFee: 0, insuranceFee: 0, totalPrice: 0 };
    }
    if (bookingData.total != null && bookingData.serviceFee != null) {
      return {
        servicePrice: bookingData.serviceFee,
        platformFee: bookingData.platformFee ?? 0,
        insuranceFee: Math.round((bookingData.serviceFee ?? 0) * 0.05),
        totalPrice: bookingData.total,
      };
    }
    return calculateCategoryBookingTotals(
      walker,
      category,
      bookingData.duration ?? 60,
      petCount,
      selectedService
    );
  }, [bookingData, category, petCount, selectedService, walker]);

  const { servicePrice, platformFee, insuranceFee, totalPrice: total } = totals;
  const durationLabel =
    bookingData?.durationLabel ??
    formatCareDurationLabel(bookingData?.duration ?? 60, bookingData?.isOvernight);

  const handlePayment = async () => {
    if (isProcessing || !bookingData) return;
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

  if (!bookingData) return null;

  const dateLabel = formatBookingDateLabel(bookingData.date ?? '');
  const timeLabel = formatBookingTimeLabel(bookingData.time ?? '');

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] hidden md:flex items-center justify-center bg-black/50 p-6"
          onClick={() => {
            if (!isProcessing) onClose();
          }}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="desktop-booking-modal-title"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-gradient-to-r from-primary/5 to-accent/5 shrink-0">
              <div>
                <h2 id="desktop-booking-modal-title" className="text-lg font-bold">
                  Confirmar reserva
                </h2>
                <p className="text-sm text-muted-foreground">Revisa los detalles y completa el pago</p>
              </div>
              <IconButton onClick={onClose} variant="ghost" aria-label="Cerrar" disabled={isProcessing}>
                <X className="h-5 w-5" />
              </IconButton>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <Card className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border-2 border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    {t('checkout.summary')}
                  </h3>
                  <Badge className="bg-success/10 text-success border-success/20 rounded-full">
                    Confirmación instantánea
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <Avatar {...getWalkerAvatarProps(walker)} size="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lg truncate">{walker.name}</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground mt-1">
                        <span>{dateLabel}</span>
                        <span className="text-border">·</span>
                        <span>{timeLabel}</span>
                        <span className="text-border">·</span>
                        <span>{durationLabel}</span>
                      </div>
                      {bookingData.selectedServiceName && (
                        <p className="text-xs text-muted-foreground mt-1">{bookingData.selectedServiceName}</p>
                      )}
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
                            className="flex items-center gap-2 rounded-full bg-muted/60 px-3 py-1.5 text-sm"
                          >
                            <Avatar {...getPetAvatarProps({ avatar: pet.avatar, name: pet.name, id: pet.id })} size="sm" />
                            <span className="font-medium">{pet.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <button
                      type="button"
                      onClick={() => setShowBreakdown((value) => !value)}
                      className="w-full flex items-center justify-between text-sm mb-3 rounded-full px-3 py-2 hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                          className="space-y-2.5 text-sm mb-3 overflow-hidden"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Servicio ({durationLabel})</span>
                            <span className="font-medium">${servicePrice.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Tarifa de plataforma</span>
                            <span className="font-medium">${platformFee.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Seguro incluido</span>
                            <span className="font-medium">${insuranceFee.toLocaleString()}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex justify-between items-center pt-3 border-t-2 border-border">
                      <span className="font-bold text-lg">{t('checkout.total')}</span>
                      <p className="font-bold text-primary text-2xl">${total.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </Card>

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

              <CheckoutSecurityBanner />
            </div>

            <div className="shrink-0 border-t border-border bg-card/95 px-6 py-4 space-y-3">
              <AnimatePresence>
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-2xl border border-primary/20 bg-primary/5 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary"
                      >
                        <Lock className="h-4 w-4 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{BOOKING_PROCESSING_STAGES[processingStage]}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {paymentError && !isProcessing && (
                <p className="text-sm text-destructive font-medium text-center">{paymentError}</p>
              )}

              <Button
                fullWidth
                size="xl"
                onClick={handlePayment}
                loading={isProcessing}
                disabled={isProcessing}
                className="shadow-lg min-h-12"
              >
                {isProcessing ? (
                  <>
                    <Lock className="h-5 w-5" />
                    Procesando pago seguro...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    {t('checkout.confirm')} · ${total.toLocaleString()}
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Sin cargo adicional. Cancelación gratuita hasta 24 h antes.
              </p>
            </div>

            <AddPaymentMethodSheet
              open={checkoutPayment.addCardOpen}
              mode="add"
              onClose={() => checkoutPayment.setAddCardOpen(false)}
              onSubmit={checkoutPayment.handleAddCard}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
