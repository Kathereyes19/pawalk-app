import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Camera,
  Phone,
  Mail,
  MapPin,
  Users,
  Globe,
  Bell,
  Check,
  ChevronRight,
  Upload,
  Loader2,
  Heart,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import iconOnlyLogo from '../../imports/Icon-only_version.png';

interface PersonalProfileSetupScreenProps {
  onComplete: (profileData: any) => void;
}

export const PersonalProfileSetupScreen: React.FC<PersonalProfileSetupScreenProps> = ({
  onComplete,
}) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [profileData, setProfileData] = useState({
    avatar: '👤',
    fullName: '',
    phone: '',
    email: '',
    neighborhood: '',
    emergencyContact: '',
    emergencyPhone: '',
    language: 'es',
    notifications: {
      push: true,
      email: true,
      sms: false,
    },
  });

  const avatarOptions = ['👤', '👨🏻', '👩🏻', '👨🏽', '👩🏽', '👨🏼', '👩🏼', '👨🏿', '👩🏿'];
  const neighborhoods = [
    'Ciudad Jardín', 'San Fernando', 'El Peñón', 'Granada', 'Normandía',
    'San Antonio', 'Centenario', 'Tequendama', 'Otro'
  ];

  const handleAvatarUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      onComplete(profileData);
    }
  };

  const isStep1Valid = profileData.fullName && profileData.phone && profileData.email;
  const isStep2Valid = profileData.neighborhood && profileData.emergencyContact && profileData.emergencyPhone;

  return (
    <div className="h-full overflow-y-auto pb-8 bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="w-20 h-20 mx-auto mb-4"
        >
          <img
            src={iconOnlyLogo}
            alt="Pawalk"
            className="w-full h-full object-contain drop-shadow-xl"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold mb-2">¡Bienvenido a Pawalk!</h1>
          <p className="text-foreground-secondary text-lg">
            Completa tu perfil para comenzar
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {[1, 2, 3].map((num) => (
            <motion.div
              key={num}
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + num * 0.1 }}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= num
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > num ? (
                  <Check className="w-5 h-5" />
                ) : (
                  num
                )}
              </div>
              {num < 3 && (
                <div
                  className={`absolute top-1/2 left-full w-8 h-1 -translate-y-1/2 transition-all ${
                    step > num ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-3 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Paso {step} de 3
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {step === 1 && 'Información básica'}
            {step === 2 && 'Ubicación y contacto de emergencia'}
            {step === 3 && 'Preferencias'}
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-6 pb-32">
        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-5"
            >
              {/* Avatar Selection */}
              <Card>
                <label className="block mb-3 font-semibold text-sm">Foto de perfil</label>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar emoji={profileData.avatar} size="2xl" className="rounded-2xl" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">
                      Selecciona un avatar o sube tu foto
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAvatarUpload}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 mr-2" />
                          Subir foto
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {avatarOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setProfileData({ ...profileData, avatar: emoji })}
                      className={`w-14 h-14 rounded-xl border-2 transition-all text-3xl ${
                        profileData.avatar === emoji
                          ? 'border-primary bg-primary/10 scale-110'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Full Name */}
              <Input
                label="Nombre completo"
                placeholder="Ej: María González"
                value={profileData.fullName}
                onChange={(e) =>
                  setProfileData({ ...profileData, fullName: e.target.value })
                }
                icon={<User className="w-5 h-5" />}
              />

              {/* Phone */}
              <Input
                label="Teléfono"
                type="tel"
                placeholder="+57 300 123 4567"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                icon={<Phone className="w-5 h-5" />}
              />

              {/* Email */}
              <Input
                label="Correo electrónico"
                type="email"
                placeholder="correo@ejemplo.com"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                icon={<Mail className="w-5 h-5" />}
              />
            </motion.div>
          )}

          {/* Step 2: Location & Emergency Contact */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-5"
            >
              {/* Neighborhood */}
              <div>
                <label className="block mb-3 font-semibold text-sm">
                  <MapPin className="w-4 h-4 inline-block mr-2" />
                  Barrio / Zona
                </label>
                <select
                  value={profileData.neighborhood}
                  onChange={(e) =>
                    setProfileData({ ...profileData, neighborhood: e.target.value })
                  }
                  className="w-full h-12 px-4 rounded-xl bg-input-background border border-input-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="">Selecciona tu barrio</option>
                  {neighborhoods.map((neighborhood) => (
                    <option key={neighborhood} value={neighborhood}>
                      {neighborhood}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-2">
                  Esto nos ayuda a encontrar paseadores cerca de ti
                </p>
              </div>

              {/* Emergency Contact Info Card */}
              <Card className="bg-accent/5 border-accent/20">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Contacto de emergencia</h3>
                    <p className="text-sm text-muted-foreground">
                      Persona de confianza a quien notificaremos en caso de emergencia
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Nombre del contacto"
                    placeholder="Ej: Juan Pérez"
                    value={profileData.emergencyContact}
                    onChange={(e) =>
                      setProfileData({ ...profileData, emergencyContact: e.target.value })
                    }
                  />

                  <Input
                    label="Teléfono de emergencia"
                    type="tel"
                    placeholder="+57 300 987 6543"
                    value={profileData.emergencyPhone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, emergencyPhone: e.target.value })
                    }
                  />
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-5"
            >
              {/* Language */}
              <Card>
                <label className="block mb-3 font-semibold text-sm">
                  <Globe className="w-4 h-4 inline-block mr-2" />
                  Idioma preferido
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'es', label: 'Español', flag: '🇪🇸' },
                    { value: 'en', label: 'English', flag: '🇺🇸' },
                  ].map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() =>
                        setProfileData({ ...profileData, language: lang.value })
                      }
                      className={`p-4 rounded-xl border-2 transition-all ${
                        profileData.language === lang.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-3xl mb-2 block">{lang.flag}</span>
                      <span className="font-medium">{lang.label}</span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Notification Preferences */}
              <Card className="bg-info/5 border-info/20">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-info/20 rounded-full flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Notificaciones</h3>
                    <p className="text-sm text-muted-foreground">
                      Elige cómo quieres recibir actualizaciones
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      key: 'push',
                      label: 'Notificaciones push',
                      desc: 'Alertas en tiempo real en tu dispositivo',
                    },
                    {
                      key: 'email',
                      label: 'Correo electrónico',
                      desc: 'Resumen de actividad y confirmaciones',
                    },
                    {
                      key: 'sms',
                      label: 'SMS',
                      desc: 'Solo para actualizaciones urgentes',
                    },
                  ].map((notif) => (
                    <button
                      key={notif.key}
                      onClick={() =>
                        setProfileData({
                          ...profileData,
                          notifications: {
                            ...profileData.notifications,
                            [notif.key]: !profileData.notifications[notif.key as keyof typeof profileData.notifications],
                          },
                        })
                      }
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/30 transition-all"
                    >
                      <div className="text-left flex-1">
                        <p className="font-medium text-sm">{notif.label}</p>
                        <p className="text-xs text-muted-foreground">{notif.desc}</p>
                      </div>
                      <div
                        className={`w-12 h-6 rounded-full transition-all ${
                          profileData.notifications[notif.key as keyof typeof profileData.notifications]
                            ? 'bg-primary'
                            : 'bg-border'
                        } relative`}
                      >
                        <motion.div
                          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                          animate={{
                            x: profileData.notifications[notif.key as keyof typeof profileData.notifications] ? 26 : 2,
                          }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed Bottom Actions */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 p-4 pb-safe bg-card/98 backdrop-blur-xl border-t-2 border-border/50 shadow-2xl z-40"
      >
        <div className="max-w-md mx-auto flex gap-3">
          {step > 1 && (
            <Button variant="ghost" onClick={() => setStep(step - 1)} className="w-24">
              Atrás
            </Button>
          )}
          <Button
            fullWidth
            size="lg"
            onClick={handleContinue}
            disabled={
              (step === 1 && !isStep1Valid) ||
              (step === 2 && !isStep2Valid)
            }
          >
            {step === 3 ? (
              <>
                Continuar a mascotas
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                Siguiente
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
