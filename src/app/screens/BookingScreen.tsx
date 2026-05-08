import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Calendar, Clock, Check, Info, AlertCircle, Sparkles, Shield, ChevronDown, ChevronUp, DollarSign, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { IconButton } from '../components/IconButton';

interface BookingScreenProps {
  walker: any;
  onBack: () => void;
  onContinue: (bookingData: any) => void;
}

export const BookingScreen: React.FC<BookingScreenProps> = ({
  walker,
  onBack,
  onContinue,
}) => {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<30 | 60 | 90>(60);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsDetail, setShowTermsDetail] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const availableDates = [
    { date: '2026-05-08', label: 'Vie', day: '8', month: 'May', available: true, popular: false },
    { date: '2026-05-09', label: 'Sáb', day: '9', month: 'May', available: true, popular: true },
    { date: '2026-05-10', label: 'Dom', day: '10', month: 'May', available: true, popular: true },
    { date: '2026-05-11', label: 'Lun', day: '11', month: 'May', available: true, popular: false },
    { date: '2026-05-12', label: 'Mar', day: '12', month: 'May', available: false, popular: false },
  ];

  const timeSlots = [
    { time: '08:00', available: true, popular: false },
    { time: '09:00', available: true, popular: true },
    { time: '10:00', available: true, popular: true },
    { time: '11:00', available: false, popular: false },
    { time: '14:00', available: true, popular: false },
    { time: '15:00', available: true, popular: false },
    { time: '16:00', available: true, popular: true },
    { time: '17:00', available: true, popular: false },
    { time: '18:00', available: true, popular: true },
  ];

  const durations = [
    {
      value: 30,
      label: t('booking.30min'),
      price: walker.price * 0.6,
      description: 'Paseo corto ideal para cachorros',
    },
    {
      value: 60,
      label: t('booking.60min'),
      price: walker.price,
      description: 'Paseo estándar recomendado',
      recommended: true,
    },
    {
      value: 90,
      label: t('booking.90min'),
      price: walker.price * 1.4,
      description: 'Paseo extenso con tiempo de juego',
    },
  ];

  const handleContinue = () => {
    if (!selectedDate) {
      setValidationError('Por favor selecciona una fecha');
      return;
    }
    if (!selectedTime) {
      setValidationError('Por favor selecciona una hora');
      return;
    }
    if (!acceptedTerms) {
      setValidationError('Debes aceptar los términos y condiciones');
      return;
    }

    setValidationError('');
    onContinue({
      date: selectedDate,
      time: selectedTime,
      duration: selectedDuration,
    });
  };

  const selectedDurationData = durations.find((d) => d.value === selectedDuration);
  const calculatedPrice = selectedDurationData?.price || walker.price;

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

          {/* Price Preview */}
          <AnimatePresence>
            {selectedDate && selectedTime && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-white" />
                  <span className="text-white font-bold">
                    ${calculatedPrice.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">{t('walker.book')}</h1>
        <p className="text-white/90 font-medium">{walker.name}</p>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mt-4">
          {[1, 2, 3].map((step) => {
            const isComplete =
              (step === 1 && selectedDate) ||
              (step === 2 && selectedDate && selectedTime) ||
              (step === 3 && selectedDate && selectedTime && acceptedTerms);
            return (
              <motion.div
                key={step}
                className={`h-1 flex-1 rounded-full transition-all ${
                  isComplete ? 'bg-white' : 'bg-white/30'
                }`}
                animate={{ scaleX: isComplete ? 1 : 0.95 }}
              />
            );
          })}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Date Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {t('booking.select.date')}
            </h2>
            {selectedDate && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1"
              >
                <Check className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-success">Fecha confirmada</span>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-5 gap-2">
            {availableDates.map((dateOption, index) => (
              <motion.button
                key={dateOption.date}
                onClick={() => dateOption.available && setSelectedDate(dateOption.date)}
                whileTap={dateOption.available ? { scale: 0.95 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                disabled={!dateOption.available}
                className={`relative p-3 rounded-2xl transition-all ${
                  selectedDate === dateOption.date
                    ? 'bg-primary text-white shadow-lg scale-105'
                    : dateOption.available
                    ? 'bg-card hover:bg-muted border border-border'
                    : 'bg-muted/50 opacity-50 cursor-not-allowed'
                }`}
              >
                {dateOption.popular && dateOption.available && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                )}

                <div className="text-center">
                  <p className="text-xs font-medium mb-1 opacity-80">
                    {dateOption.label}
                  </p>
                  <p className="text-xl font-bold">{dateOption.day}</p>
                  <p className="text-xs opacity-70">{dateOption.month}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  {t('booking.select.time')}
                </h2>
                {selectedTime && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1"
                  >
                    <Check className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium text-success">Hora confirmada</span>
                  </motion.div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot, index) => (
                  <motion.button
                    key={slot.time}
                    onClick={() => slot.available && setSelectedTime(slot.time)}
                    whileTap={slot.available ? { scale: 0.95 } : {}}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    disabled={!slot.available}
                    className={`relative py-4 rounded-2xl font-semibold transition-all ${
                      selectedTime === slot.time
                        ? 'bg-primary text-white shadow-lg scale-105'
                        : slot.available
                        ? 'bg-card hover:bg-muted border border-border'
                        : 'bg-muted/50 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    {slot.popular && slot.available && (
                      <div className="absolute -top-1 -right-1">
                        <Badge className="bg-secondary text-white text-xs px-1.5 py-0.5 flex items-center gap-0.5">
                          <Zap className="w-3 h-3" />
                          <span>Popular</span>
                        </Badge>
                      </div>
                    )}
                    {slot.time}
                    {!slot.available && (
                      <p className="text-xs mt-1 opacity-60">No disponible</p>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Duration Selection */}
        <AnimatePresence>
          {selectedDate && selectedTime && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h2 className="text-lg font-bold mb-3">{t('booking.duration')}</h2>
              <div className="space-y-2.5">
                {durations.map((duration, index) => (
                  <motion.div
                    key={duration.value}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Card
                      onClick={() => setSelectedDuration(duration.value as 30 | 60 | 90)}
                      hoverable
                      className={`cursor-pointer transition-all relative ${
                        selectedDuration === duration.value
                          ? 'border-2 border-primary bg-primary/5 shadow-lg'
                          : 'border border-border'
                      }`}
                    >
                      {duration.recommended && (
                        <div className="absolute -top-2 left-4">
                          <Badge className="bg-gradient-to-r from-secondary to-accent text-white text-xs px-2 py-0.5">
                            Recomendado
                          </Badge>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <motion.div
                            animate={{
                              scale: selectedDuration === duration.value ? [1, 1.1, 1] : 1,
                            }}
                            transition={{ duration: 0.3 }}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              selectedDuration === duration.value
                                ? 'border-primary bg-primary'
                                : 'border-border'
                            }`}
                          >
                            {selectedDuration === duration.value && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500 }}
                              >
                                <Check className="w-4 h-4 text-white" />
                              </motion.div>
                            )}
                          </motion.div>

                          <div className="flex-1">
                            <p className="font-semibold">{duration.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {duration.description}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-primary text-lg">
                            ${duration.price.toLocaleString()}
                          </p>
                          {duration.value !== 60 && (
                            <p className="text-xs text-muted-foreground">
                              {duration.value > 60 ? '+' : ''}
                              {Math.round(((duration.price - walker.price) / walker.price) * 100)}%
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Terms */}
        <AnimatePresence>
          {selectedDate && selectedTime && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    {t('booking.terms')}
                  </h3>
                  <button
                    onClick={() => setShowTermsDetail(!showTermsDetail)}
                    className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    {showTermsDetail ? (
                      <>
                        Ocultar <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Ver detalles <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2.5 text-sm mb-4">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <p className="text-foreground-secondary">
                      <span className="font-semibold text-foreground">Cancelación flexible:</span>{' '}
                      Reembolso completo hasta 24h antes del paseo
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <p className="text-foreground-secondary">
                      <span className="font-semibold text-foreground">Seguimiento GPS:</span>{' '}
                      Rastrea el paseo de tu mascota en tiempo real
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <p className="text-foreground-secondary">
                      <span className="font-semibold text-foreground">Seguro incluido:</span>{' '}
                      Cobertura de responsabilidad civil
                    </p>
                  </div>

                  <AnimatePresence>
                    {showTermsDetail && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-3 mt-3 border-t border-border space-y-2"
                      >
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <p className="text-foreground-secondary text-xs">
                            Tu mascota debe tener las vacunas al día y usar collar con identificación
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <p className="text-foreground-secondary text-xs">
                            El paseador llegará máximo 5 minutos antes de la hora programada
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <p className="text-foreground-secondary text-xs">
                            Recibirás fotos y actualizaciones durante el paseo
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.label
                  className={`flex items-start gap-3 cursor-pointer group p-3 rounded-xl transition-all ${
                    acceptedTerms ? 'bg-success/10' : 'bg-muted/50 hover:bg-muted'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    type="button"
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      acceptedTerms
                        ? 'border-success bg-success shadow-sm'
                        : 'border-border group-hover:border-primary/50'
                    }`}
                    onClick={() => {
                      setAcceptedTerms(!acceptedTerms);
                      setValidationError('');
                    }}
                  >
                    {acceptedTerms && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </button>
                  <span className="text-sm leading-relaxed font-medium">
                    {t('booking.accept')}
                  </span>
                </motion.label>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Validation Error */}
        <AnimatePresence>
          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="bg-destructive/10 border-destructive/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                  <p className="text-sm text-destructive font-medium">{validationError}</p>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed Bottom CTA */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 p-4 pb-safe bg-card/98 backdrop-blur-xl border-t-2 border-border/50 shadow-2xl z-40"
      >
        <div className="max-w-md mx-auto">
          {/* Summary Preview */}
          <AnimatePresence>
            {selectedDate && selectedTime && acceptedTerms && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 p-3 bg-muted/50 rounded-xl"
              >
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="text-muted-foreground mb-1">Fecha</p>
                    <p className="font-semibold">
                      {availableDates.find((d) => d.date === selectedDate)?.label}{' '}
                      {availableDates.find((d) => d.date === selectedDate)?.day}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Hora</p>
                    <p className="font-semibold">{selectedTime}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Duración</p>
                    <p className="font-semibold">{selectedDuration} min</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            fullWidth
            size="xl"
            onClick={handleContinue}
            disabled={!selectedDate || !selectedTime || !acceptedTerms}
            className="shadow-xl"
          >
            {selectedDate && selectedTime && acceptedTerms ? (
              <span className="flex items-center justify-center gap-2">
                Continuar al pago
                <span className="font-bold">• ${calculatedPrice.toLocaleString()}</span>
              </span>
            ) : (
              t('next')
            )}
          </Button>

          {(!selectedDate || !selectedTime || !acceptedTerms) && (
            <p className="text-center text-xs text-muted-foreground mt-2">
              {!selectedDate
                ? 'Selecciona una fecha para continuar'
                : !selectedTime
                ? 'Selecciona una hora para continuar'
                : 'Acepta los términos para continuar'}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};
