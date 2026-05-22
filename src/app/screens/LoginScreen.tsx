import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { IconButton } from '../components/IconButton';
import iconOnlyLogo from '../../imports/Icon-only_version.png';
import { signInWithEmail, validateSignIn } from '@/features/auth';
import { resolveUserId, setMockUserId } from '@/lib/mockUser';

interface LoginScreenProps {
  onBack?: () => void;
  onLogin: (userId?: string | null) => void | Promise<void>;
  onSignUp: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onBack, onLogin, onSignUp }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});

    const newErrors = validateSignIn({ email, password });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    const result = await signInWithEmail({ email, password });

    if (result.mode === 'mock') {
      setMockUserId(email);
    }

    if (result.error) {
      setIsLoading(false);
      const field = result.error.field ?? 'email';
      setErrors({ [field]: result.error.message });
      return;
    }

    const userId = resolveUserId(result.data?.userId ?? null);

    setIsLoading(false);
    setShowSuccess(true);
    try {
      await onLogin(userId);
    } finally {
      setShowSuccess(false);
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
            className="fixed inset-0 bg-background z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-success to-success/80 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">¡Bienvenido de vuelta!</h2>
              <p className="text-muted-foreground">Ingresando a tu cuenta...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      {onBack && (
        <div className="px-6 pt-6 pb-4">
          <IconButton onClick={onBack} variant="ghost">
            <ArrowLeft className="w-5 h-5" />
          </IconButton>
        </div>
      )}

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
          <h1 className="text-3xl font-bold mb-2">Bienvenido de vuelta</h1>
          <p className="text-muted-foreground">
            Ingresa a tu cuenta para continuar
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
          <div>
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
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[42px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            size="xl"
            loading={isLoading}
            disabled={!email || !password}
            className="mt-1"
          >
            {t('login')}
          </Button>

          {/* Sign Up Link */}
          <div className="text-center pt-8 mt-2 border-t border-border">
            <p className="text-sm text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={onSignUp}
                className="font-semibold text-primary hover:text-primary-hover transition-colors"
              >
                Regístrate
              </button>
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
};
