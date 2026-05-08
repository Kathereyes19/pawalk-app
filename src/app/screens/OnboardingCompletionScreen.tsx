import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Sparkles, Heart, PawPrint, Shield, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

interface OnboardingCompletionScreenProps {
  profileData: any;
  petCount: number;
  onContinue: () => void;
}

export const OnboardingCompletionScreen: React.FC<OnboardingCompletionScreenProps> = ({
  profileData,
  petCount,
  onContinue,
}) => {
  const { t } = useLanguage();

  return (
    <div className="h-full overflow-y-auto pb-8 flex flex-col items-center justify-center bg-gradient-to-b from-success/5 via-background to-background p-6">
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
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold mb-3">¡Todo listo, {profileData.fullName?.split(' ')[0]}! 🎉</h1>
        <p className="text-foreground-secondary text-lg">
          Tu perfil ha sido creado exitosamente
        </p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-md space-y-3 mb-8"
      >
        {/* Profile Summary */}
        <Card variant="elevated" className="border-2 border-success/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-2xl shrink-0">
              {profileData.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold">{profileData.fullName}</h3>
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  {profileData.neighborhood}
                </p>
                <p className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" />
                  Perfil verificado
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Pets Summary */}
        <Card variant="elevated" className="border-2 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <PawPrint className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-1">
                {petCount} {petCount === 1 ? 'mascota registrada' : 'mascotas registradas'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Listas para su primer paseo
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* What's Next */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-md mb-8"
      >
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          ¿Qué sigue?
        </h3>
        <div className="space-y-2">
          {[
            { icon: '🗺️', text: 'Explora paseadores cerca de ti' },
            { icon: '📅', text: 'Agenda tu primer paseo' },
            { icon: '📸', text: 'Recibe fotos en tiempo real' },
            { icon: '🏆', text: 'Disfruta de paseos seguros y felices' },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="font-medium">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="w-full max-w-md"
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button fullWidth size="xl" onClick={onContinue} className="shadow-xl">
            <Sparkles className="w-5 h-5 mr-2" />
            Comenzar a usar Pawalk
          </Button>
        </motion.div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          <Sparkles className="w-4 h-4 inline-block mr-1 text-success" />
          Todo está listo para tu primera experiencia
        </p>
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
    </div>
  );
};
