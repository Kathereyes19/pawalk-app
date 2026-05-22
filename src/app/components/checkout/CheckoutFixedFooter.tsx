import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Lock, Shield } from 'lucide-react';
import { Button } from '../Button';

interface CheckoutFixedFooterProps {
  total: number;
  confirmLabel: string;
  isProcessing: boolean;
  processingStage: number;
  processingStages: string[];
  error: string | null;
  onConfirm: () => void;
  /** Reserve space for bottom tab bar */
  bottomOffset?: 'none' | 'tab';
  showTerms?: boolean;
}

export const CheckoutFixedFooter: React.FC<CheckoutFixedFooterProps> = ({
  total,
  confirmLabel,
  isProcessing,
  processingStage,
  processingStages,
  error,
  onConfirm,
  bottomOffset = 'none',
  showTerms = true,
}) => {
  const bottomClass = bottomOffset === 'tab' ? 'bottom-20' : 'bottom-0';

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      className={`fixed ${bottomClass} left-0 right-0 p-4 pb-safe bg-card/98 backdrop-blur-xl border-t-2 border-border/50 shadow-2xl z-40`}
    >
      <div className="max-w-md mx-auto">
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-3 p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0"
                >
                  <Lock className="w-4 h-4 text-white" />
                </motion.div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{processingStages[processingStage]}</p>
                  <div className="flex gap-1 mt-2">
                    {processingStages.map((_, index) => (
                      <motion.div
                        key={index}
                        className={`h-1 flex-1 rounded-full ${
                          index <= processingStage ? 'bg-primary' : 'bg-muted'
                        }`}
                        animate={{ scaleX: index === processingStage ? [1, 1.05, 1] : 1 }}
                        transition={{
                          duration: 0.5,
                          repeat: index === processingStage ? Infinity : 0,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isProcessing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-3 flex items-center justify-between text-xs px-1"
          >
            <div className="flex items-center gap-1 text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-success" />
              <span>Pago 100% seguro</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Total a pagar:</span>
              <span className="font-bold text-primary">${total.toLocaleString()}</span>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {error && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mb-3 p-3 rounded-xl border border-destructive/20 bg-destructive/5"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          fullWidth
          size="xl"
          onClick={onConfirm}
          loading={isProcessing}
          disabled={isProcessing}
          className="shadow-xl"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Procesando pago seguro...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              {confirmLabel}
              <span className="font-bold">• ${total.toLocaleString()}</span>
            </span>
          )}
        </Button>

        {!isProcessing && showTerms && (
          <p className="text-center text-xs text-muted-foreground mt-3">
            Al confirmar aceptas nuestra política de{' '}
            <button type="button" className="text-primary font-medium hover:underline">
              cancelación
            </button>{' '}
            y{' '}
            <button type="button" className="text-primary font-medium hover:underline">
              términos de servicio
            </button>
          </p>
        )}
      </div>
    </motion.div>
  );
};
