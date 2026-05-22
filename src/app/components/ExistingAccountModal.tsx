import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, LogIn, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './Button';
import { IconButton } from './IconButton';

interface ExistingAccountModalProps {
  open: boolean;
  email: string;
  onLogin: () => void;
  onUseDifferentEmail: () => void;
}

export const ExistingAccountModal: React.FC<ExistingAccountModalProps> = ({
  open,
  email,
  onLogin,
  onUseDifferentEmail,
}) => {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-[70] flex items-end sm:items-center justify-center p-4"
          onClick={onUseDifferentEmail}
          role="presentation"
        >
          <motion.div
            initial={{ y: 48, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 48, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="existing-account-title"
            aria-describedby="existing-account-desc"
          >
            <div className="h-1 w-12 bg-border rounded-full mx-auto mt-3 sm:hidden" />

            <div className="p-6 pt-5">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-7 h-7 text-primary" />
                </div>
                <IconButton variant="ghost" onClick={onUseDifferentEmail} aria-label="Cerrar">
                  <X className="w-5 h-5" />
                </IconButton>
              </div>

              <h2 id="existing-account-title" className="text-xl font-bold mb-2">
                {t('signup.email.exists.title')}
              </h2>
              <p id="existing-account-desc" className="text-muted-foreground text-sm leading-relaxed mb-4">
                {t('signup.email.exists.message')}
              </p>

              {email && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/60 border border-border mb-6">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium truncate">{email}</span>
                </div>
              )}

              <div className="space-y-3">
                <Button fullWidth size="lg" onClick={onLogin}>
                  <LogIn className="w-5 h-5" />
                  {t('signup.email.exists.login')}
                </Button>
                <Button fullWidth size="lg" variant="outline" onClick={onUseDifferentEmail}>
                  {t('signup.email.exists.change')}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
