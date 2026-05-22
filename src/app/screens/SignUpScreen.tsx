import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, CheckCircle2, X, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { IconButton } from '../components/IconButton';
import iconOnlyLogo from '../../imports/Icon-only_version.png';
import { signUpWithEmail, validateSignUp } from '@/features/auth';
import { setMockUserId } from '@/lib/mockUser';

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

    setErrors({});

    const newErrors = validateSignUp(
      { fullName: name, email, password },
      acceptTerms
    );

    if (Object.keys(newErrors).length > 0) {
      setErrors({
        name: newErrors.fullName,
        email: newErrors.email,
        password: newErrors.password,
        terms: newErrors.terms,
      });
      return;
    }

    setIsLoading(true);

    const result = await signUpWithEmail({ fullName: name, email, password });

    if (result.mode === 'mock') {
      setMockUserId(email);
    }

    if (result.error) {
      setIsLoading(false);
      const field = result.error.field ?? 'email';
      const mappedField = field === 'name' ? 'name' : field;
      setErrors({ [mappedField]: result.error.message });
      return;
    }

    const finishSignUp = () => {
      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => {
        onSignUp();
      }, 2000);
    };

    if (result.mode === 'mock') {
      setTimeout(finishSignUp, 2500);
    } else {
      finishSignUp();
    }
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
            className="mt-1"
          >
            {t('signup')}
          </Button>

          {/* Login Link */}
          <div className="text-center pt-8 mt-2 border-t border-border">
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
