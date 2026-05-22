import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Calendar, Clock, Check, Info, AlertCircle, Sparkles, Shield, ChevronDown, ChevronUp, DollarSign, Zap, PawPrint } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { buildUpcomingBookingDates } from '@/lib/bookingDates';
import {
  canBookImmediately,
} from '@/lib/walkers/availability';
import {
  filterDatesForProvider,
  filterTimeSlotsForProvider,
  getSuggestedProviderBookingSlot,
  validateBookingAvailability,
} from '@/lib/providers/bookingAvailability';
import { WalkerAvailabilityBadge } from '../components/walker/WalkerAvailabilityBadge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { IconButton } from '../components/IconButton';
import { TermsAcceptanceCheckbox } from '../components/booking/TermsAcceptanceCheckbox';
import { PetSelectionPicker } from '../components/booking/PetSelectionPicker';
import { getWalkerHomeCategory } from '@/lib/walkers/serviceCategory';
import {
  calculateCategoryBookingTotals,
  formatCareDurationLabel,
  getCareDurationOptions,
  getInstitutionMeta,
  getProfileBookCta,
  getVetServicesForProvider,
} from '@/lib/providers/serviceExperience';
import type { Walker, Pet, BookingData, CaregiverServiceOffer } from '@/types';
import type { VetBookableServiceId } from '@/lib/providers/serviceExperience';

interface BookingScreenProps {
  walker: Walker;
  pets: Pet[];
  onBack: () => void;
  onContinue: (bookingData: BookingData) => void;
}

export const BookingScreen: React.FC<BookingScreenProps> = ({
  walker,
  pets,
  onBack,
  onContinue,
}) => {
  const { t } = useLanguage();
  const category = getWalkerHomeCategory(walker);
  const vetServices = useMemo(() => getVetServicesForProvider(walker), [walker]);
  const careTypes = walker.caregiverServices ?? ['in-home'];
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<30 | 60 | 90>(60);
  const [selectedCareType, setSelectedCareType] = useState<CaregiverServiceOffer>(careTypes[0]);
  const [selectedCareDuration, setSelectedCareDuration] = useState<number>(
    getCareDurationOptions(careTypes[0])[1]?.value ?? 480
  );
  const [selectedVetServiceId, setSelectedVetServiceId] = useState<VetBookableServiceId>(
    vetServices[0]?.id ?? 'consultation'
  );
  const [careInstructions, setCareInstructions] = useState('');
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>(() =>
    pets.length > 0 ? [pets[0].id] : []
  );
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsDetail, setShowTermsDetail] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const instantBooking = canBookImmediately(walker);
  const isOvernightCare = category === 'caregivers' && selectedCareDuration >= 1440;
  const availabilityContext = useMemo(
    () => ({
      isOvernight: isOvernightCare,
      duration:
        category === 'caregivers'
          ? selectedCareDuration
          : category === 'veterinary'
            ? vetServices.find((s) => s.id === selectedVetServiceId)?.durationMinutes ?? 45
            : selectedDuration,
    }),
    [
      category,
      isOvernightCare,
      selectedCareDuration,
      selectedDuration,
      selectedVetServiceId,
      vetServices,
    ]
  );
  const suggestedSlot = useMemo(
    () => getSuggestedProviderBookingSlot(category, walker, availabilityContext),
    [category, walker, availabilityContext]
  );

  const baseTimeSlots = useMemo(
    () => [
      { time: '08:00', available: true, popular: false },
      { time: '09:00', available: true, popular: true },
      { time: '10:00', available: true, popular: true },
      { time: '11:00', available: true, popular: false },
      { time: '14:00', available: true, popular: false },
      { time: '15:00', available: true, popular: false },
      { time: '16:00', available: true, popular: true },
      { time: '17:00', available: true, popular: false },
      { time: '18:00', available: true, popular: true },
    ],
    []
  );

  const availableDates = useMemo(
    () =>
      filterDatesForProvider(
        category,
        buildUpcomingBookingDates(7),
        walker,
        baseTimeSlots,
        availabilityContext
      ),
    [category, walker, baseTimeSlots, availabilityContext]
  );

  const effectiveDate = selectedDate || availableDates.find((d) => d.available)?.date || '';
  const timeSlots = useMemo(
    () =>
      filterTimeSlotsForProvider(
        category,
        effectiveDate,
        baseTimeSlots,
        walker,
        availabilityContext
      ),
    [category, effectiveDate, baseTimeSlots, walker, availabilityContext]
  );

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    setValidationError('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setValidationError('');
  };

  React.useEffect(() => {
    if (selectedDate) return;

    if (!instantBooking && suggestedSlot?.date) {
      setSelectedDate(suggestedSlot.date);
      if (suggestedSlot.time) {
        setSelectedTime(suggestedSlot.time);
      }
      return;
    }

    const firstAvailable = availableDates.find((entry) => entry.available);
    if (firstAvailable) {
      setSelectedDate(firstAvailable.date);
    }
  }, [availableDates, selectedDate, instantBooking, suggestedSlot]);

  useEffect(() => {
    if (!selectedDate || !selectedTime) return;
    const slotStillValid = timeSlots.some(
      (slot) => slot.time === selectedTime && slot.available
    );
    if (!slotStillValid) {
      setSelectedTime('');
    }
  }, [selectedDate, selectedTime, timeSlots]);

  useEffect(() => {
    if (pets.length === 0) {
      setSelectedPetIds([]);
      return;
    }
    setSelectedPetIds((current) => {
      const valid = current.filter((id) => pets.some((pet) => pet.id === id));
      if (valid.length > 0) return valid;
      return [pets[0].id];
    });
  }, [pets]);

  const selectedPetCount = Math.max(1, selectedPetIds.length || (pets.length > 0 ? 1 : 0));

  const selectedVetService = useMemo(
    () => vetServices.find((service) => service.id === selectedVetServiceId) ?? vetServices[0],
    [selectedVetServiceId, vetServices]
  );

  const effectiveDurationMinutes = useMemo(() => {
    if (category === 'walkers') return selectedDuration;
    if (category === 'caregivers') return selectedCareDuration;
    return selectedVetService?.durationMinutes ?? 45;
  }, [category, selectedCareDuration, selectedDuration, selectedVetService]);

  const durations = useMemo(() => {
    const offered = walker.walkDurations ?? [30, 60, 90];
    return ([30, 60, 90] as const)
      .filter((value) => offered.includes(value))
      .map((value) => {
        const totals = calculateCategoryBookingTotals(walker, 'walkers', value, selectedPetCount);
        const descriptions: Record<30 | 60 | 90, string> = {
          30: 'Paseo corto ideal para cachorros',
          60: 'Paseo estándar recomendado',
          90: 'Paseo extenso con tiempo de juego',
        };
        return {
          value,
          label: value === 30 ? t('booking.30min') : value === 60 ? t('booking.60min') : t('booking.90min'),
          price: totals.totalPrice,
          servicePrice: totals.servicePrice,
          description: descriptions[value],
          recommended: value === 60,
        };
      });
  }, [walker, selectedPetCount, t]);

  const careDurations = useMemo(
    () =>
      getCareDurationOptions(selectedCareType).map((option) => ({
        ...option,
        price: calculateCategoryBookingTotals(
          walker,
          'caregivers',
          option.value,
          selectedPetCount
        ).totalPrice,
      })),
    [selectedCareType, selectedPetCount, walker]
  );

  useEffect(() => {
    const options = getCareDurationOptions(selectedCareType);
    if (!options.some((option) => option.value === selectedCareDuration)) {
      setSelectedCareDuration(options[0]?.value ?? 480);
    }
  }, [selectedCareType, selectedCareDuration]);

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
    if (selectedPetIds.length === 0) {
      setValidationError('Selecciona al menos una mascota');
      return;
    }
    const availability = validateBookingAvailability(
      category,
      selectedDate,
      selectedTime,
      walker,
      {
        isOvernight: isOvernightCare,
        duration: effectiveDurationMinutes,
      }
    );
    if (!availability.valid) {
      setValidationError(availability.message);
      return;
    }

    setValidationError('');
    const selectedPets = pets
      .filter((pet) => selectedPetIds.includes(pet.id))
      .map((pet) => ({ id: pet.id, name: pet.name, avatar: pet.avatar }));
    const totals = calculateCategoryBookingTotals(
      walker,
      category,
      effectiveDurationMinutes,
      selectedPets.length,
      category === 'veterinary' ? selectedVetService : null
    );
    const isOvernight = category === 'caregivers' && selectedCareDuration >= 1440;
    const institutionMeta = category === 'veterinary' ? getInstitutionMeta(walker) : null;

    onContinue({
      date: selectedDate,
      time: selectedTime,
      duration: effectiveDurationMinutes,
      durationLabel: formatCareDurationLabel(effectiveDurationMinutes, isOvernight),
      serviceCategory: category,
      selectedServiceId: category === 'veterinary' ? selectedVetService?.id : undefined,
      selectedServiceName: category === 'veterinary' ? selectedVetService?.name : undefined,
      careType: category === 'caregivers' ? selectedCareType : undefined,
      careInstructions: category === 'caregivers' ? careInstructions.trim() || undefined : undefined,
      isOvernight,
      institutionAddress: institutionMeta?.address,
      pets: selectedPets,
      petIds: selectedPetIds,
      serviceFee: totals.servicePrice,
      platformFee: totals.platformFee,
      total: totals.totalPrice,
    });
  };

  const selectedDurationData = durations.find((d) => d.value === selectedDuration);
  const calculatedPrice =
    calculateCategoryBookingTotals(
      walker,
      category,
      effectiveDurationMinutes,
      selectedPetCount,
      category === 'veterinary' ? selectedVetService : null
    ).totalPrice;

  const bookingTitle =
    category === 'walkers'
      ? 'Reservar paseo'
      : category === 'caregivers'
        ? 'Reservar cuidado'
        : getProfileBookCta(category, selectedVetServiceId);

  const providerLabel =
    category === 'veterinary' ? 'Centro de servicios' : category === 'caregivers' ? 'Cuidador' : t('walker.book');

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

        <h1 className="text-2xl font-bold text-white mb-1">{bookingTitle}</h1>
        <p className="text-white/90 font-medium">{walker.name}</p>
        <p className="text-white/70 text-sm mt-1">{providerLabel}</p>

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
        {!instantBooking && (
          <Card className="border-warning/30 bg-warning/10">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-semibold text-sm">
                  {category === 'veterinary'
                    ? 'Este centro requiere agendamiento'
                    : category === 'caregivers'
                      ? 'Este cuidador no está disponible de inmediato'
                      : 'Este paseador no está disponible de inmediato'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Puedes agendar para su próximo horario disponible. Revisa la fecha y hora sugeridas abajo.
                </p>
                <WalkerAvailabilityBadge walker={walker} size="md" />
              </div>
            </div>
          </Card>
        )}

        {category === 'veterinary' && (
          <div>
            <h2 className="text-lg font-bold mb-3">Selecciona el servicio</h2>
            <div className="space-y-2">
              {vetServices.map((service) => (
                <Card
                  key={service.id}
                  hoverable
                  onClick={() => setSelectedVetServiceId(service.id)}
                  className={`cursor-pointer ${
                    selectedVetServiceId === service.id
                      ? 'border-2 border-primary bg-primary/5'
                      : 'border border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{service.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{service.name}</p>
                      <p className="text-xs text-muted-foreground">{service.description}</p>
                    </div>
                    <Badge variant="outline">{service.durationMinutes} min</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {category === 'caregivers' && (
          <div>
            <h2 className="text-lg font-bold mb-3">Tipo de cuidado</h2>
            <div className="grid grid-cols-2 gap-2">
              {careTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedCareType(type)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                    selectedCareType === type
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-card border border-border text-muted-foreground'
                  }`}
                >
                  {type === 'overnight' ? '🌙 Nocturno' : type === 'in-home' ? '🏠 En casa' : '🐾 Multi-mascota'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pet Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-primary" />
              Mascotas
            </h2>
            {selectedPetIds.length > 0 && (
              <span className="text-sm font-medium text-primary">
                {selectedPetIds.length} seleccionada{selectedPetIds.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <PetSelectionPicker
            pets={pets}
            selectedIds={selectedPetIds}
            onChange={(ids) => {
              setSelectedPetIds(ids);
              setValidationError('');
            }}
          />
        </div>

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
                onClick={() => dateOption.available && handleDateSelect(dateOption.date)}
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
          {!instantBooking && (
            <p className="text-xs text-muted-foreground mt-2">
              Las fechas anteriores a la disponibilidad del paseador aparecen deshabilitadas.
            </p>
          )}
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
                    onClick={() => slot.available && handleTimeSelect(slot.time)}
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

        {/* Duration / care period selection */}
        <AnimatePresence>
          {selectedDate && selectedTime && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {category === 'walkers' && (
                <>
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
                              <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                  selectedDuration === duration.value
                                    ? 'bg-primary text-white'
                                    : 'bg-muted'
                                }`}
                              >
                                <Clock className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-bold">{duration.label}</p>
                                <p className="text-xs text-muted-foreground">{duration.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">${duration.price.toLocaleString()}</p>
                              {selectedDuration === duration.value && (
                                <Check className="w-5 h-5 text-primary ml-auto mt-1" />
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

              {category === 'caregivers' && (
                <>
                  <h2 className="text-lg font-bold mb-3">Periodo de cuidado</h2>
                  <div className="space-y-2.5">
                    {careDurations.map((option) => (
                      <Card
                        key={option.value}
                        hoverable
                        onClick={() => setSelectedCareDuration(option.value)}
                        className={`cursor-pointer ${
                          selectedCareDuration === option.value
                            ? 'border-2 border-primary bg-primary/5'
                            : 'border border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold">{option.label}</p>
                            <p className="text-xs text-muted-foreground">{option.description}</p>
                          </div>
                          <p className="font-bold text-primary">${option.price.toLocaleString()}</p>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-2">Instrucciones de cuidado</h3>
                    <textarea
                      value={careInstructions}
                      onChange={(event) => setCareInstructions(event.target.value)}
                      placeholder="Horarios de comida, medicamentos, rutinas especiales..."
                      className="w-full min-h-[96px] rounded-2xl border border-border bg-card px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </>
              )}

              {category === 'veterinary' && selectedVetService && (
                <Card className="border-primary/20 bg-primary/5">
                  <p className="text-sm font-semibold mb-1">Cita confirmada</p>
                  <p className="text-lg font-bold">{selectedVetService.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Duración estimada: {selectedVetService.durationMinutes} min ·{' '}
                    {getInstitutionMeta(walker).address}
                  </p>
                </Card>
              )}
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

                <TermsAcceptanceCheckbox
                  checked={acceptedTerms}
                  onChange={(value) => {
                    setAcceptedTerms(value);
                    setValidationError('');
                  }}
                  label={t('booking.accept')}
                  acceptedHint={t('booking.accept.confirmed')}
                />
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
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <p className="text-muted-foreground mb-1">Mascotas</p>
                    <p className="font-semibold">{selectedPetIds.length || 1}</p>
                  </div>
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
                    <p className="font-semibold">
                      {formatCareDurationLabel(
                        effectiveDurationMinutes,
                        category === 'caregivers' && selectedCareDuration >= 1440
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            fullWidth
            size="xl"
            onClick={handleContinue}
            disabled={!selectedDate || !selectedTime || !acceptedTerms || selectedPetIds.length === 0}
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
