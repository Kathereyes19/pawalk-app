import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Phone, MessageSquare, AlertCircle, MapPin, Clock, Navigation, Play, Pause, Heart, CheckCircle2, TrendingUp, Shield, Activity } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getElapsedWalkSeconds, getWalkProgress } from '@/features/reservations';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { IconButton } from '../components/IconButton';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import type { Reservation, Walker } from '@/types';
import { getWalkerAvatarProps } from '@/lib/images';
import { TrackingMapCanvas } from '../components/map/TrackingMapCanvas';

interface LiveTrackingScreenProps {
  walker: Walker;
  reservation?: Reservation | null;
  onBack: () => void;
  onWalkComplete?: (reservationId: string, summary?: { distanceKm?: number; durationMinutes?: number }) => void;
}

export const LiveTrackingScreen: React.FC<LiveTrackingScreenProps> = ({
  walker,
  reservation,
  onBack,
  onWalkComplete,
}) => {
  const { t } = useLanguage();
  const walkerAvatar = useMemo(() => getWalkerAvatarProps(walker), [walker]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [walkStatus, setWalkStatus] = useState<'on-way' | 'started' | 'break' | 'completed'>(
    reservation ? 'started' : 'on-way'
  );
  const [elapsedTime, setElapsedTime] = useState(() =>
    reservation ? getElapsedWalkSeconds(reservation) : 0
  );
  const [eta, setEta] = useState(5);
  const [distance, setDistance] = useState(
    reservation?.summaryDistanceKm ? reservation.summaryDistanceKm * 0.4 : 0
  );
  const [currentSpeed, setCurrentSpeed] = useState(4.2);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationText, setNotificationText] = useState('');
  const [walkerPosition, setWalkerPosition] = useState(() =>
    reservation ? getWalkProgress(reservation) : 0
  );
  const [photos, setPhotos] = useState<number>(0);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [heartRate, setHeartRate] = useState(85);
  const [displayProgress, setDisplayProgress] = useState(() =>
    reservation ? getWalkProgress(reservation) : 0
  );
  const hasCompletedRef = useRef(false);

  const targetDurationSeconds = useMemo(
    () => (reservation?.durationMinutes ?? 60) * 60,
    [reservation?.durationMinutes]
  );

  const targetProgress = useMemo(() => {
    if (!reservation) return walkerPosition;
    return Math.max(getWalkProgress(reservation), walkerPosition);
  }, [reservation, walkerPosition]);

  useEffect(() => {
    let frame = 0;
    let active = true;

    const animate = () => {
      if (!active) return;
      setDisplayProgress((prev) => {
        const delta = targetProgress - prev;
        if (Math.abs(delta) < 0.08) {
          active = false;
          return targetProgress;
        }
        frame = requestAnimationFrame(animate);
        return prev + delta * 0.12;
      });
    };

    frame = requestAnimationFrame(animate);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, [targetProgress]);

  // Simulate map loading
  useEffect(() => {
    const loadTimer = setTimeout(() => {
      setIsMapLoaded(true);
    }, 1200);
    return () => clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    if (!reservation) return;

    const syncTimer = setInterval(() => {
      setElapsedTime(getElapsedWalkSeconds(reservation));
      setWalkerPosition((prev) => Math.max(prev, getWalkProgress(reservation)));
    }, 1000);

    return () => clearInterval(syncTimer);
  }, [reservation]);

  useEffect(() => {
    if (walkStatus !== 'started' && walkStatus !== 'break') return;

    const moveTimer = setInterval(() => {
      setWalkerPosition((prev) => {
        const increment = 100 / Math.max(targetDurationSeconds / 3, 60);
        return Math.min(100, prev + increment);
      });
      setDistance((prev) => prev + 0.015);
      setCurrentSpeed(3.8 + Math.sin(Date.now() / 4000) * 0.6);
    }, 3000);

    return () => clearInterval(moveTimer);
  }, [walkStatus, targetDurationSeconds]);

  useEffect(() => {
    if (walkStatus !== 'started' && walkStatus !== 'break') return;
    if (walkerPosition < 100 && elapsedTime < targetDurationSeconds) return;
    if (hasCompletedRef.current) return;

    hasCompletedRef.current = true;
    setWalkStatus('completed');
    setNotificationText(t('tracking.completed'));
    setShowNotification(true);

    if (reservation && onWalkComplete) {
      onWalkComplete(reservation.id, {
        distanceKm: Number(distance.toFixed(1)),
        durationMinutes: Math.round(elapsedTime / 60),
      });
    }
  }, [
    walkStatus,
    walkerPosition,
    elapsedTime,
    targetDurationSeconds,
    reservation,
    onWalkComplete,
    distance,
    t,
  ]);

  useEffect(() => {
    // Simulate walk progression when no reservation context
    if (reservation) return;

    const statusTimer = setTimeout(() => {
      if (walkStatus === 'on-way') {
        setWalkStatus('started');
        setNotificationText('¡El paseo ha comenzado! 🐾');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 4000);
      }
    }, 5000);

    return () => clearTimeout(statusTimer);
  }, [walkStatus, reservation]);

  useEffect(() => {
    if (reservation) return;

    // Update elapsed time when walk is started
    if (walkStatus === 'started' || walkStatus === 'break') {
      const timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [walkStatus]);

  useEffect(() => {
    // Update ETA countdown
    if (walkStatus === 'on-way' && eta > 0) {
      const etaTimer = setInterval(() => {
        setEta((prev) => Math.max(0, prev - 1));
      }, 60000); // Decrease every minute
      return () => clearInterval(etaTimer);
    }
  }, [walkStatus, eta]);

  useEffect(() => {
    if (reservation) return;

    if (walkStatus === 'started') {
      const moveTimer = setInterval(() => {
        setWalkerPosition((prev) => Math.min(100, prev + 0.35));
        setDistance((prev) => prev + 0.012);
        setCurrentSpeed(3.8 + Math.sin(Date.now() / 4000) * 0.6);
      }, 1000);
      return () => clearInterval(moveTimer);
    }
  }, [walkStatus, reservation]);

  useEffect(() => {
    // Simulate photo updates
    if (walkStatus === 'started') {
      const photoTimer = setInterval(() => {
        setPhotos((prev) => prev + 1);
        setNotificationText('Nueva foto recibida 📸');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }, 25000);
      return () => clearInterval(photoTimer);
    }
  }, [walkStatus]);

  useEffect(() => {
    // Simulate heart rate variation
    if (walkStatus === 'started') {
      const hrTimer = setInterval(() => {
        setHeartRate((prev) => prev + (Math.random() - 0.5) * 5);
      }, 3000);
      return () => clearInterval(hrTimer);
    }
  }, [walkStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const milestones = [
    { time: 5, text: 'Primera parada en el parque 🌳', reached: elapsedTime >= 5 },
    { time: 15, text: 'Tiempo de juego activo 🎾', reached: elapsedTime >= 15 },
    { time: 30, text: 'Descanso y agua 💧', reached: elapsedTime >= 30 },
    { time: 45, text: 'Regresando a casa 🏠', reached: elapsedTime >= 45 },
  ];

  return (
    <div className="h-full overflow-hidden flex flex-col bg-background-secondary">
      {/* Map Loading State */}
      <AnimatePresence>
        {!isMapLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-background z-50 flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              {/* Animated map icon */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
              >
                <Navigation className="w-10 h-10 text-white" fill="white" />
              </motion.div>

              <h3 className="text-xl font-bold mb-2">Conectando con {walker?.name}</h3>
              <p className="text-muted-foreground mb-6">Cargando ubicación en tiempo real...</p>

              {/* Loading progress bar */}
              <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden mx-auto">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary via-secondary to-accent"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.2, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: isMapLoaded ? 1 : 0, scale: isMapLoaded ? 1 : 0.98 }}
        transition={{ duration: 0.45, delay: 0.15 }}
        className="relative min-h-[240px] flex-1 overflow-hidden"
      >
        <TrackingMapCanvas
          progressPercent={displayProgress}
          walkerImageSrc={walkerAvatar.src!}
          walkerImageAlt={walkerAvatar.alt}
          walkerAvatar={walker.avatar}
        />

        {/* Top overlay: status + back (above map, never covered by route) */}
        <div className="absolute inset-x-0 top-0 z-30 flex items-start gap-3 p-4 pointer-events-none">
          <div className="flex-1 min-w-0 pointer-events-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={walkStatus}
                initial={{ y: -12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
              >
                <Card className="shadow-xl border border-border/80 backdrop-blur-md bg-card/95">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center ${
                          walkStatus === 'on-way'
                            ? 'bg-secondary/20'
                            : walkStatus === 'break'
                            ? 'bg-accent/20'
                            : 'bg-success/20'
                        }`}
                      >
                        {walkStatus === 'on-way' && <Clock className="w-5 h-5 text-secondary" />}
                        {walkStatus === 'started' && <Play className="w-5 h-5 text-success" />}
                        {walkStatus === 'break' && <Pause className="w-5 h-5 text-accent" />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm flex items-center gap-2 truncate">
                        {walkStatus === 'on-way' && t('tracking.walker.on.way')}
                        {walkStatus === 'started' && t('tracking.walk.started')}
                        {walkStatus === 'break' && 'Tiempo de descanso'}
                      </p>

                      {walkStatus === 'on-way' && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          ETA: {eta} min · {distance.toFixed(1)} km
                        </p>
                      )}

                      {(walkStatus === 'started' || walkStatus === 'break') && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {reservation?.petName && `${reservation.petName} · `}
                          {formatTime(elapsedTime)} · {distance.toFixed(2)} km
                          {photos > 0 && ` · ${photos} fotos`}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          <IconButton
            onClick={onBack}
            variant="default"
            aria-label="Volver a reservas"
            className="pointer-events-auto shrink-0 shadow-lg bg-card/95 backdrop-blur-md border border-border/80"
          >
            <ArrowLeft className="w-5 h-5" />
          </IconButton>
        </div>

        {/* Floating Notifications */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ y: -80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -80, opacity: 0 }}
              className="absolute top-[5.5rem] left-4 right-4 z-40"
            >
              <Card className="shadow-2xl bg-gradient-to-r from-primary to-accent text-white border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📸</span>
                  <p className="font-semibold flex-1 text-sm">{notificationText}</p>
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Live stats — dedicated row, no map overlap */}
      <div className="shrink-0 px-4 py-3 bg-background border-y border-border/60 z-20">
        <div className="grid grid-cols-3 gap-2">
          <Card padding="sm" className="text-center bg-card shadow-sm">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-medium text-muted-foreground">Ritmo</span>
            </div>
            <p className="text-base font-bold">{currentSpeed.toFixed(1)}</p>
            <p className="text-[10px] text-muted-foreground">km/h</p>
          </Card>

          <Card padding="sm" className="text-center bg-card shadow-sm">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Heart className="w-3.5 h-3.5 text-destructive" />
              <span className="text-[11px] font-medium text-muted-foreground">FC Mascota</span>
            </div>
            <p className="text-base font-bold">{Math.round(heartRate)}</p>
            <p className="text-[10px] text-muted-foreground">bpm</p>
          </Card>

          <Card padding="sm" className="text-center bg-card shadow-sm">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-success" />
              <span className="text-[11px] font-medium text-muted-foreground">Calorías</span>
            </div>
            <p className="text-base font-bold">{Math.round(distance * 45)}</p>
            <p className="text-[10px] text-muted-foreground">kcal</p>
          </Card>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-muted-foreground">Progreso del paseo</span>
            <span className="font-bold text-primary">{Math.round(displayProgress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary via-secondary to-success rounded-full transition-all duration-700 ease-out"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5 text-[11px] text-muted-foreground">
            <span>Tiempo: {formatTime(elapsedTime)}</span>
            <span>{distance.toFixed(2)} km</span>
          </div>
        </div>
      </div>

      {/* Bottom Panel */}
      <motion.div
        initial={{ y: 300 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="shrink-0 bg-background border-t border-border/50 pb-safe max-h-[42vh] overflow-y-auto"
      >
        {/* Walker Info Card */}
        <div className="p-4 pb-4">
          <Card className="mb-3 border-2 border-primary/20" variant="elevated">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <Avatar {...walkerAvatar} size="xl" />
                <motion.div
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center border-2 border-white home-map-pin-live"
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                </motion.div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">{walker.name}</h3>
                  <Badge className="bg-success/10 text-success text-xs px-1.5 py-0.5">
                    <Shield className="w-3 h-3 mr-0.5" />
                    Activo
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    {walkStatus === 'on-way' && 'En camino a tu ubicación'}
                    {walkStatus === 'started' && 'Paseando con tu mascota'}
                    {walkStatus === 'break' && 'Tomando un descanso'}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress milestones */}
            <AnimatePresence>
              {walkStatus === 'started' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-3 border-t border-border"
                >
                  <div className="space-y-2">
                    {milestones.map((milestone, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center gap-2 text-xs ${
                          milestone.reached ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            milestone.reached
                              ? 'bg-success text-white'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {milestone.reached ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500 }}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </motion.div>
                          ) : (
                            <span className="text-xs font-bold">{milestone.time}'</span>
                          )}
                        </div>
                        <span className={milestone.reached ? 'font-medium' : ''}>
                          {milestone.text}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2.5 mb-3">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                className="flex-col h-auto py-3 gap-1"
              >
                <Phone className="w-5 h-5" />
                <span className="text-xs">Llamar</span>
              </Button>
            </motion.div>

            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                className="flex-col h-auto py-3 gap-1"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs">Mensaje</span>
              </Button>
            </motion.div>

            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => setShowEmergencyModal(true)}
                className="flex-col h-auto py-3 gap-1 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive"
              >
                <motion.div
                  animate={{ scale: [1, 1.2] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                >
                  <AlertCircle className="w-5 h-5" />
                </motion.div>
                <span className="text-xs font-semibold">S.O.S</span>
              </Button>
            </motion.div>
          </div>

          {/* Safety Assurance Banner */}
          <Card className="bg-gradient-to-r from-success/10 to-primary/10 border-success/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1 text-success">
                  Paseo 100% seguro y protegido
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Seguimiento GPS en tiempo real • Seguro incluido • Soporte 24/7
                </p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Emergency Modal */}
      <AnimatePresence>
        {showEmergencyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEmergencyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm"
            >
              <Card className="border-2 border-destructive/50 shadow-2xl">
                <div className="text-center mb-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                    className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-3"
                  >
                    <AlertCircle className="w-8 h-8 text-destructive" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2">¿Necesitas ayuda?</h3>
                  <p className="text-sm text-muted-foreground">
                    Activa una alerta de emergencia para contactar inmediatamente al paseador y
                    nuestro equipo de soporte
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  <Button
                    fullWidth
                    variant="destructive"
                    size="lg"
                    className="font-semibold"
                  >
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Activar alerta de emergencia
                  </Button>

                  <Button
                    fullWidth
                    variant="outline"
                    size="lg"
                    onClick={() => setShowEmergencyModal(false)}
                  >
                    Cancelar
                  </Button>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="w-4 h-4 text-success" />
                    <span>
                      Tu ubicación y la del paseador serán compartidas con nuestro equipo de seguridad
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
