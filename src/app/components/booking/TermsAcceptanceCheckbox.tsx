import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

interface TermsAcceptanceCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  acceptedHint?: string;
  id?: string;
}

export const TermsAcceptanceCheckbox: React.FC<TermsAcceptanceCheckboxProps> = ({
  checked,
  onChange,
  label,
  acceptedHint = 'Términos aceptados',
  id = 'terms-acceptance',
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.button
      type="button"
      id={id}
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      onPointerCancel={() => setIsPressed(false)}
      whileTap={{ scale: 0.985 }}
      animate={{ scale: isPressed ? 0.985 : 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      className={cn(
        'w-full flex items-start gap-3.5 p-4 rounded-2xl border-2 text-left transition-colors duration-200 touch-manipulation',
        checked
          ? 'border-success bg-success/20 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.35)]'
          : isPressed
            ? 'border-primary/50 bg-primary/5'
            : 'border-border bg-muted/50 hover:border-primary/35 hover:bg-muted/80'
      )}
    >
      <span
        aria-hidden
        className={cn(
          'relative w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all duration-200',
          checked
            ? 'border-success bg-success text-success-foreground shadow-md'
            : isPressed
              ? 'border-primary bg-primary/10 scale-95'
              : 'border-muted-foreground/50 bg-card shadow-sm'
        )}
      >
        <AnimatePresence mode="wait">
          {checked ? (
            <motion.span
              key="checked"
              initial={{ scale: 0, opacity: 0, rotate: -40 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, rotate: 40 }}
              transition={{ type: 'spring', stiffness: 560, damping: 20 }}
              className="flex items-center justify-center"
            >
              <Check className="w-5 h-5 stroke-[3]" />
            </motion.span>
          ) : (
            <motion.span
              key="unchecked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-2.5 h-2.5 rounded-sm bg-transparent"
            />
          )}
        </AnimatePresence>

        {checked && (
          <motion.span
            className="absolute inset-0 rounded-xl ring-4 ring-success/25"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </span>

      <span className="flex-1 min-w-0 pt-0.5">
        <span
          className={cn(
            'block text-sm leading-relaxed font-semibold transition-colors',
            checked ? 'text-success' : 'text-foreground'
          )}
        >
          {label}
        </span>
        <AnimatePresence>
          {checked && (
            <motion.span
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {acceptedHint}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
};
