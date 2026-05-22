import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  FileText,
  Flame,
  Gauge,
  Home,
  MapPin,
  PawPrint,
  Route,
  Stethoscope,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  computeWalkSummaryMetrics,
  formatCurrency,
  formatReservationDate,
  formatReservationTime,
  formatReservationPetsLabel,
  getReservationPetCount,
} from '@/features/reservations';
import {
  formatCareDurationLabel,
  getReservationSummaryTitle,
} from '@/lib/providers/serviceExperience';
import { getReservationCategory } from '@/lib/providers/reservationCategory';
import { IconButton } from '../components/IconButton';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { TrackingMapCanvas } from '../components/map/TrackingMapCanvas';
import type { Reservation } from '@/types';

interface CompletedWalkDetailScreenProps {
  reservation: Reservation;
  onBack: () => void;
}

export const CompletedWalkDetailScreen: React.FC<CompletedWalkDetailScreenProps> = ({
  reservation,
  onBack,
}) => {
  const { language } = useLanguage();
  const category = getReservationCategory(reservation);
  const isWalk = category === 'walkers';

  const petCount = getReservationPetCount(reservation);
  const distanceKm = reservation.summaryDistanceKm ?? 0;
  const durationMinutes =
    reservation.summaryDurationMinutes ?? reservation.durationMinutes;
  const metrics = useMemo(
    () =>
      computeWalkSummaryMetrics(distanceKm, durationMinutes, petCount),
    [distanceKm, durationMinutes, petCount]
  );
  const paceKmh = reservation.summaryPaceKmh ?? metrics.paceKmh;
  const calories = reservation.summaryCalories ?? metrics.calories;
  const petsLabel = formatReservationPetsLabel(reservation);
  const durationLabel = formatCareDurationLabel(
    reservation.summaryDurationMinutes ?? reservation.durationMinutes,
    reservation.isOvernight
  );
  const summaryTitle = getReservationSummaryTitle(category);
  const completedBadge =
    category === 'walkers'
      ? 'Paseo completado'
      : category === 'caregivers'
        ? 'Cuidado completado'
        : 'Cita completada';

  const formatTimestamp = (iso?: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(language === 'en' ? 'en-US' : 'es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const statItems = [
    {
      icon: Timer,
      label: 'Duración',
      value: `${durationMinutes} min`,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: Route,
      label: 'Distancia',
      value: `${distanceKm.toFixed(1)} km`,
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
    {
      icon: Gauge,
      label: 'Ritmo',
      value: `${paceKmh} km/h`,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      icon: Flame,
      label: 'Calorías',
      value: `${calories} kcal`,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
  ];

  return (
    <div className="h-full overflow-y-auto pb-8 bg-background-secondary">
      <div className={`relative ${isWalk ? 'h-56 sm:h-64 bg-muted' : 'bg-gradient-to-br from-primary via-secondary to-accent px-4 pt-4 pb-16'}`}>
        {isWalk ? (
          <TrackingMapCanvas
            progressPercent={100}
            walkerAvatar={reservation.walkerAvatar}
          />
        ) : (
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-8 left-8 text-6xl">{reservation.walkerAvatar}</div>
          </div>
        )}
        <div className={`absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/50 to-transparent px-4 pt-4 pb-8 ${isWalk ? '' : 'relative bg-transparent'}`}>
          <div className="flex items-center justify-between">
            <IconButton
              onClick={onBack}
              variant="ghost"
              className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </IconButton>
            <Badge className="bg-success/90 text-white border-0 shadow-lg">
              {completedBadge}
            </Badge>
          </div>
        </div>
        <div className={`${isWalk ? 'absolute inset-x-0 bottom-0 z-20 px-4 pb-4 bg-gradient-to-t from-background-secondary via-background-secondary/80 to-transparent pt-10' : 'relative z-10 px-0 pt-6 text-white'}`}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${isWalk ? 'text-muted-foreground' : 'text-white/80'}`}>
              {summaryTitle}
            </p>
            <h1 className="text-2xl font-bold">{reservation.walkerName}</h1>
            {reservation.selectedServiceName && (
              <p className={`text-sm mt-1 flex items-center gap-1.5 ${isWalk ? 'text-muted-foreground' : 'text-white/90'}`}>
                <Stethoscope className="w-4 h-4" />
                {reservation.selectedServiceName}
              </p>
            )}
            <p className={`text-sm flex items-center gap-1.5 mt-1 ${isWalk ? 'text-muted-foreground' : 'text-white/90'}`}>
              <Calendar className="w-4 h-4" />
              {formatReservationDate(reservation.scheduledDate, language)} ·{' '}
              {formatReservationTime(reservation.scheduledTime)}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="px-4 -mt-2 space-y-4">
        {isWalk ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 gap-2.5"
            >
              {statItems.map((item, index) => (
                <Card
                  key={item.label}
                  padding="sm"
                  className="border border-border/60 shadow-sm"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 + index * 0.05 }}
                  >
                    <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center mb-2`}>
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-bold">{item.value}</p>
                  </motion.div>
                </Card>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card className="border-primary/15 bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="font-bold">Actividad del paseo</h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Recorrido de {distanceKm.toFixed(1)} km en {durationMinutes} minutos con un ritmo
                  promedio de {paceKmh} km/h. {petCount > 1 ? `Paseo grupal con ${petCount} mascotas.` : ''}
                </p>
                <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-primary via-secondary to-success rounded-full" />
                </div>
              </Card>
            </motion.div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-primary/15 bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  {category === 'caregivers' ? (
                    <Home className="w-4 h-4 text-primary" />
                  ) : (
                    <Building2 className="w-4 h-4 text-primary" />
                  )}
                  <span>{durationLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-primary" />
                  <span>{durationMinutes} min efectivos</span>
                </div>
              </div>
              {category === 'caregivers' && reservation.careInstructions && (
                <div className="mt-3 pt-3 border-t border-border flex items-start gap-2 text-sm">
                  <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">{reservation.careInstructions}</p>
                </div>
              )}
              {category === 'veterinary' && reservation.institutionAddress && (
                <div className="mt-3 pt-3 border-t border-border flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">{reservation.institutionAddress}</p>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <h2 className="font-bold mb-3 flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-primary" />
              Mascotas incluidas
            </h2>
            {reservation.pets?.length ? (
              <div className="space-y-2">
                {reservation.pets.map((pet) => (
                  <div
                    key={pet.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40"
                  >
                    <Avatar emoji={pet.avatar ?? '🐾'} size="md" className="rounded-lg" />
                    <span className="font-medium">{pet.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{petsLabel}</p>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card>
            <h2 className="font-bold mb-3">
              {category === 'veterinary' ? 'Centro' : category === 'caregivers' ? 'Cuidador' : 'Paseador'}
            </h2>
            <div className="flex items-center gap-3">
              <Avatar emoji={reservation.walkerAvatar} size="xl" className="rounded-xl" />
              <div>
                <p className="font-semibold text-lg">{reservation.walkerName}</p>
                <p className="text-sm text-muted-foreground">
                  {durationLabel} · verificado
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <h2 className="font-bold mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Tiempos
            </h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Programado</span>
                <span className="font-medium text-right">
                  {formatReservationDate(reservation.scheduledDate, language)}{' '}
                  {formatReservationTime(reservation.scheduledTime)}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Inicio</span>
                <span className="font-medium">{formatTimestamp(reservation.startedAt)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Finalizado</span>
                <span className="font-medium">{formatTimestamp(reservation.completedAt)}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <Card className="border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-0.5">Total pagado</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(reservation.totalPrice, language)}
                </p>
                {petCount > 1 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {petCount} mascotas · tarifa base × {petCount}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
