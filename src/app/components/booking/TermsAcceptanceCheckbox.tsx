import React from 'react';
import { motion } from 'motion/react';
import { Check, ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

interface TermsAcceptanceCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id?: string;
}

export const TermsAcceptanceCheckbox: React.FC<TermsAcceptanceCheckboxProps> = ({
  checked,
  onChange,
  label,
  id = 'terms-acceptance',
}) => (
  <button
    type="button"
    id={id}
    role="checkbox"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={cn(
      'w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200',
      checked
        ? 'border-success bg-success/15 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]'
        : 'border-border bg-muted/40 hover:border-primary/40 hover:bg-muted/70'
    )}
  >
    <span
      className={cn(
        'w-7 h-7 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all duration-200',
        checked
          ? 'border-success bg-success text-white shadow-md ring-4 ring-success/20'
          : 'border-muted-foreground/40 bg-background'
      )}
    >
      {checked && (
        <motion.span
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 520, damping: 22 }}
        >
          <Check className="w-4 h-4 stroke-[3]" />
        </motion.span>
      )}
    </span>

    <span className="flex-1 min-w-0">
      <span
        className={cn(
          'block text-sm leading-relaxed font-semibold transition-colors',
          checked ? 'text-success' : 'text-foreground'
        )}
      >
        {label}
      </span>
      {checked && (
        <motion.span
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-success"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Términos aceptados
        </motion.span>
      )}
    </span>
  </button>
);
