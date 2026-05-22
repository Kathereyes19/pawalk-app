import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import fullLogo from '../../imports/Full_logo_version.png';

interface SplashScreenProps {
  onComplete: () => void;
  /** When false, splash waits before navigating (session + user data bootstrap). */
  isReady?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, isReady = true }) => {
  const [progress, setProgress] = useState(0);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    const minTimer = setTimeout(() => setMinTimeElapsed(true), 1800);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(minTimer);
    };
  }, []);

  useEffect(() => {
    if (!isReady || !minTimeElapsed || progress < 100) return;
    onComplete();
  }, [isReady, minTimeElapsed, progress, onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary via-secondary to-accent flex flex-col items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              left: `${20 + i * 15}%`,
              top: `${10 + i * 12}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative z-10 text-center"
      >
        {/* Full Pawalk Logo */}
        <motion.div
          className="relative w-72 mx-auto"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <img
            src={fullLogo}
            alt="Pawalk"
            className="w-full h-auto drop-shadow-2xl"
          />

          {/* Pulsing glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-white/30 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8 text-white/95 text-xl font-medium"
        >
          Conexión y cuidado animal
        </motion.p>

        {/* Animated paw prints */}
        <div className="flex justify-center gap-3 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: [0, 1, 0], y: [10, 0, -10] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
              className="text-3xl"
            >
              🐾
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-20 left-0 right-0 px-12"
      >
        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
          <motion.div
            className="h-full bg-white rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center text-white/80 text-sm mt-3"
        >
          Preparando tu experiencia...
        </motion.p>
      </motion.div>
    </div>
  );
};
