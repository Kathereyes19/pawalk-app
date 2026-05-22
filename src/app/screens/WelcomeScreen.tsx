import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, MapPin, Heart, ChevronRight, Globe, Moon, Sun, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { useTheme } from 'next-themes';
import iconOnlyLogo from '../../imports/Icon-only_version.png';

interface WelcomeScreenProps {
  onComplete: () => void;
  onLogin?: () => void;
  /** Intro slides after registration only — hides login CTA */
  mode?: 'intro' | 'marketing';
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onComplete,
  onLogin,
  mode = 'marketing',
}) => {
  const isIntro = mode === 'intro';
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const slides = [
    {
      icon: Shield,
      emoji: '🛡️',
      title: t('welcome.slide1.title'),
      description: t('welcome.slide1.desc'),
      color: 'from-primary to-accent',
      features: ['Verificación de identidad', 'Antecedentes judiciales', 'Certificados veterinarios'],
    },
    {
      icon: MapPin,
      emoji: '📍',
      title: t('welcome.slide2.title'),
      description: t('welcome.slide2.desc'),
      color: 'from-secondary to-primary',
      features: ['GPS en tiempo real', 'Ruta del paseo', 'Notificaciones instantáneas'],
    },
    {
      icon: Heart,
      emoji: '💝',
      title: t('welcome.slide3.title'),
      description: t('welcome.slide3.desc'),
      color: 'from-accent to-secondary',
      features: ['Pago seguro', 'Seguro incluido', 'Soporte 24/7'],
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Settings Buttons */}
      <div className="absolute top-6 right-4 z-50 flex gap-2">
        <IconButton
          onClick={() => setShowSettings(!showSettings)}
          variant="default"
          className="shadow-sm"
        >
          <Globe className="w-5 h-5" />
        </IconButton>
        <IconButton
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          variant="default"
          className="shadow-sm"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </IconButton>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className="absolute top-20 right-4 bg-card rounded-2xl shadow-xl border border-border p-4 z-40 min-w-[200px]"
          >
            <h3 className="mb-3 font-semibold text-sm text-foreground">{t('language')}</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setLanguage('es');
                  setShowSettings(false);
                }}
                className={`px-4 py-2.5 rounded-xl text-left text-sm font-medium transition-all flex items-center justify-between ${
                  language === 'es'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <span>🇪🇸 Español</span>
                {language === 'es' && <Check className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setLanguage('en');
                  setShowSettings(false);
                }}
                className={`px-4 py-2.5 rounded-xl text-left text-sm font-medium transition-all flex items-center justify-between ${
                  language === 'en'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <span>🇺🇸 English</span>
                {language === 'en' && <Check className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-border">
        <motion.div
          className="h-full bg-primary"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Logo */}
      <div className="pt-20 pb-6 text-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
          className="w-20 h-20 mx-auto"
        >
          <img
            src={iconOnlyLogo}
            alt="Pawalk"
            className="w-full h-full object-contain"
          />
        </motion.div>
        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-5 text-2xl font-bold text-foreground"
        >
          Pawalk
        </motion.h1>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground text-sm mt-1"
        >
          {t('welcome.subtitle')}
        </motion.p>
      </div>

      {/* Slides */}
      <div className="flex-1 flex items-center justify-center px-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-sm text-center"
          >
            {/* Icon with emoji */}
            <motion.div
              className="relative mb-8"
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${slides[currentSlide].color} flex items-center justify-center shadow-xl relative`}>
                <span className="text-6xl">{slides[currentSlide].emoji}</span>

                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-white/20"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </div>
            </motion.div>

            {/* Title */}
            <h2 className="text-2xl font-bold mb-3 leading-tight text-foreground">
              {slides[currentSlide].title}
            </h2>

            {/* Description */}
            <p className="text-foreground-secondary leading-relaxed mb-6">
              {slides[currentSlide].description}
            </p>

            {/* Features */}
            <div className="space-y-2.5">
              {slides[currentSlide].features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 py-5">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-border'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="px-6 pb-8 space-y-3">
        {currentSlide === slides.length - 1 ? (
          <>
            <Button fullWidth size="xl" onClick={onComplete}>
              {isIntro ? t('next') : t('get.started')}
            </Button>
            {!isIntro && onLogin && (
              <Button fullWidth size="lg" variant="ghost" onClick={onLogin}>
                {t('login')}
              </Button>
            )}
          </>
        ) : (
          <Button fullWidth size="xl" onClick={nextSlide}>
            {t('next')} <ChevronRight className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
};
