import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Calendar, Clock, MapPin, Navigation, Sparkles, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';

interface BookingConfirmedScreenProps {
  walker: any;
  bookingData: any;
  onViewTracking: () => void;
  onBackHome: () => void;
}

export const BookingConfirmedScreen: React.FC<BookingConfirmedScreenProps> = ({
  walker,
  bookingData,
  onViewTracking,
  onBackHome,
}) => {
  const { t } = useLanguage();
  const [isLoadingTracking, setIsLoadingTracking] = useState(false);

  const handleViewTracking = () => {
    setIsLoadingTracking(true);
    // Simulate loading before navigating to tracking
    setTimeout(() => {
      onViewTracking();
    }, 800);
  };

  return (
    <div className="h-full overflow-y-auto pb-24 p-4 flex flex-col items-center justify-center bg-gradient-to-b from-success/5 via-background to-background">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
        className="mb-8 relative"
      >
        {/* Pulsing rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-4 border-success/30"
            animate={{
              scale: [1, 2],
              opacity: [0.8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeOut',
            }}
            style={{
              width: '112px',
              height: '112px',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}

        <div className="w-28 h-28 bg-gradient-to-br from-success via-success/90 to-success/80 rounded-full flex items-center justify-center relative z-10">
          <motion.div
            animate={{ rotate: [0, 5] }}
            transition={{ duration: 0.3, delay: 0.8, ease: 'easeInOut' }}
          >
            <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={3} />
          </motion.div>

          {/* Sparkle effect */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: '0 0 40px rgba(16, 185, 129, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)',
            }}
            animate={{
              boxShadow: [
                '0 0 40px rgba(16, 185, 129, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)',
                '0 0 60px rgba(16, 185, 129, 0.8), inset 0 0 30px rgba(255, 255, 255, 0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          />
        </div>
      </motion.div>

      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-8 px-4"
      >
        <h1 className="text-3xl font-bold mb-3">¡Reserva confirmada!</h1>
        <p className="text-foreground-secondary text-lg">
          Tu paseo ha sido agendado exitosamente
        </p>
      </motion.div>

      {/* Booking Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-md mb-6 px-4"
      >
        <Card variant="elevated" className="shadow-2xl border-2 border-primary/10 bg-gradient-to-br from-card to-primary/5">
          {/* Walker Info */}
          <div className="flex items-center gap-4 pb-4 border-b-2 border-border/50">
            <div className="relative">
              <Avatar emoji={walker.avatar} size="xl" />
              {/* Verified badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: 'spring', bounce: 0.5 }}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-success rounded-full flex items-center justify-center border-2 border-white shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
              </motion.div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg">{walker.name}</h3>
                <motion.div
                  animate={{ scale: [1, 1.1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                </motion.div>
              </div>
              <p className="text-sm text-muted-foreground">Paseador profesional verificado</p>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-4 pt-5">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-background/50"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">Fecha del paseo</p>
                <p className="font-semibold">{bookingData.date}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-background/50"
            >
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">Hora y duración</p>
                <p className="font-semibold">
                  {bookingData.time} • {bookingData.duration} minutos
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-background/50"
            >
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">Punto de encuentro</p>
                <p className="font-semibold">Cali, Colombia</p>
              </div>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-md space-y-3 px-4"
      >
        {/* Primary CTA - Live Tracking */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            fullWidth
            size="xl"
            onClick={handleViewTracking}
            loading={isLoadingTracking}
            disabled={isLoadingTracking}
            className="relative overflow-hidden"
          >
            {!isLoadingTracking && (
              <>
                <Navigation className="w-5 h-5 mr-2" />
                <span>Ver seguimiento en vivo</span>
              </>
            )}
            {isLoadingTracking && (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Cargando mapa...
              </span>
            )}
          </Button>
        </motion.div>

        {/* Secondary CTA - Back to Home */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Button
            fullWidth
            size="lg"
            variant="outline"
            onClick={onBackHome}
            disabled={isLoadingTracking}
          >
            Volver al inicio
          </Button>
        </motion.div>

        {/* Helper text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-muted-foreground pt-2"
        >
          <Sparkles className="w-4 h-4 inline-block mr-1 text-success" />
          Tu reserva está confirmada y lista
        </motion.p>
      </motion.div>

      {/* Confetti Effect */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2 }}
      >
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: ['#FF6B35', '#F7C548', '#E59500'][i % 3],
              left: `${Math.random() * 100}%`,
              top: '-10%',
            }}
            animate={{
              y: ['0vh', '110vh'],
              x: [0, (Math.random() - 0.5) * 200],
              rotate: [0, 360],
              opacity: [1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              delay: Math.random() * 0.5,
            }}
          />
        ))}
      </motion.div>

      {/* Loading Overlay for Tracking Transition */}
      <AnimatePresence>
        {isLoadingTracking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full mb-6"
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h3 className="text-xl font-bold mb-2">Preparando seguimiento</h3>
              <p className="text-muted-foreground">Cargando ubicación en tiempo real...</p>
            </motion.div>

            {/* Animated map pin preview */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', bounce: 0.5 }}
              className="mt-8"
            >
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <Navigation className="w-8 h-8 text-white" fill="white" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
