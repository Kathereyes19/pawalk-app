import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, CheckCircle2, X, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { IconButton } from '../components/IconButton';
import { Divider } from '../components/Divider';
import iconOnlyLogo from '../../imports/Icon-only_version.png';

interface SignUpScreenProps {
  onBack: () => void;
  onSignUp: () => void;
  onLogin: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ onBack, onSignUp, onLogin }) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; terms?: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 25, label: 'Débil', color: 'bg-destructive' };
    if (password.length < 8) return { strength: 50, label: 'Regular', color: 'bg-warning' };
    if (password.length < 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 75, label: 'Buena', color: 'bg-info' };
    }
    if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
      return { strength: 100, label: 'Excelente', color: 'bg-success' };
    }
    return { strength: 60, label: 'Aceptable', color: 'bg-secondary' };
  };

  const passwordStrength = getPasswordStrength(password);

  const passwordRequirements = [
    { label: 'Al menos 6 caracteres', met: password.length >= 6 },
    { label: 'Una mayúscula', met: /[A-Z]/.test(password) },
    { label: 'Un número', met: /[0-9]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({});

    // Validation
    const newErrors: { name?: string; email?: string; password?: string; terms?: string } = {};

    if (!name) {
      newErrors.name = 'El nombre es requerido';
    } else if (name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!email) {
      newErrors.email = 'El correo es requerido';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Ingresa un correo válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!acceptTerms) {
      newErrors.terms = 'Debes aceptar los términos y condiciones';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Simulate API call
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);

      setTimeout(() => {
        onSignUp();
      }, 2000);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background z-50 flex items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-24 h-24 bg-gradient-to-br from-success to-success/80 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
              >
                <CheckCircle2 className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-3">¡Cuenta creada!</h2>
              <p className="text-muted-foreground text-lg">
                Bienvenido a la familia Pawalk 🐾
              </p>
              <motion.div
                className="flex justify-center gap-2 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                    className="text-2xl"
                  >
                    🎉
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <IconButton onClick={onBack} variant="ghost">
          <ArrowLeft className="w-5 h-5" />
        </IconButton>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-8">
        {/* Logo and Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 mx-auto mb-4">
            <img
              src={iconOnlyLogo}
              alt="Pawalk"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold mb-2">Crea tu cuenta</h1>
          <p className="text-muted-foreground">
            Únete a miles de dueños felices
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-4 max-w-md mx-auto"
        >
          {/* Name Input */}
          <Input
            type="text"
            label="Nombre completo"
            placeholder="Juan Pérez"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            error={errors.name}
            icon={<User className="w-5 h-5" />}
            autoComplete="name"
          />

          {/* Email Input */}
          <Input
            type="email"
            label="Correo electrónico"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            error={errors.email}
            icon={<Mail className="w-5 h-5" />}
            autoComplete="email"
          />

          {/* Password Input */}
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              error={errors.password}
              icon={<Lock className="w-5 h-5" />}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[42px] text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Password Strength */}
          <AnimatePresence>
            {password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                {/* Strength Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-foreground-secondary">
                      Seguridad de contraseña
                    </span>
                    <span className={`text-xs font-semibold ${passwordStrength.strength >= 75 ? 'text-success' : 'text-muted-foreground'}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      initial={{ width: 0 }}
                      animate={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                </div>

                {/* Requirements */}
                <div className="space-y-2">
                  {passwordRequirements.map((req, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-2"
                    >
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                        req.met ? 'bg-success' : 'bg-muted'
                      }`}>
                        {req.met ? (
                          <Check className="w-3 h-3 text-white" />
                        ) : (
                          <X className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                      <span className={`text-xs ${req.met ? 'text-success' : 'text-muted-foreground'}`}>
                        {req.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Terms Checkbox */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <button
                type="button"
                className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  acceptTerms
                    ? 'border-primary bg-primary shadow-sm'
                    : 'border-border group-hover:border-primary/50'
                }`}
                onClick={() => {
                  setAcceptTerms(!acceptTerms);
                  if (errors.terms) setErrors({ ...errors, terms: undefined });
                }}
              >
                {acceptTerms && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
              <span className="text-sm leading-relaxed text-foreground-secondary">
                Acepto los{' '}
                <button type="button" className="text-primary hover:text-primary-hover font-semibold">
                  términos y condiciones
                </button>{' '}
                y la{' '}
                <button type="button" className="text-primary hover:text-primary-hover font-semibold">
                  política de privacidad
                </button>
              </span>
            </label>
            {errors.terms && (
              <p className="mt-2 text-xs text-destructive">{errors.terms}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            size="xl"
            loading={isLoading}
            disabled={!name || !email || !password || !acceptTerms}
          >
            {t('signup')}
          </Button>

          {/* Divider */}
          <Divider text="o" />

          {/* Social Sign Up */}
          <div className="space-y-3">
            <Button
              type="button"
              fullWidth
              variant="outline"
              onClick={() => {}}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar con Google
            </Button>

            <Button
              type="button"
              fullWidth
              variant="outline"
              onClick={() => {}}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continuar con Facebook
            </Button>
          </div>

          {/* Login Link */}
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={onLogin}
                className="font-semibold text-primary hover:text-primary-hover transition-colors"
              >
                Inicia sesión
              </button>
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
};
