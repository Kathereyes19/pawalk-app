import React, { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../Button';

interface OrderConfirmedAction {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  variant?: 'primary' | 'outline';
  size?: 'lg' | 'xl';
}

interface OrderConfirmedLayoutProps {
  title: string;
  subtitle: string;
  badge?: string;
  hint?: string;
  primaryAction: OrderConfirmedAction;
  secondaryAction?: OrderConfirmedAction;
  children?: ReactNode;
}

export const OrderConfirmedLayout: React.FC<OrderConfirmedLayoutProps> = ({
  title,
  subtitle,
  badge,
  hint,
  primaryAction,
  secondaryAction,
  children,
}) => (
  <div className="h-full overflow-y-auto pb-24 p-4 flex flex-col items-center justify-center bg-gradient-to-b from-success/5 via-background to-background">
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
      className="mb-8 relative"
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="absolute inset-0 rounded-full border-4 border-success/30"
          animate={{ scale: [1, 2], opacity: [0.8, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: index * 0.4, ease: 'easeOut' }}
          style={{
            width: '112px',
            height: '112px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      <div className="w-28 h-28 bg-gradient-to-br from-success via-success/90 to-success/80 rounded-full flex items-center justify-center relative z-10">
        <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={3} />
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="text-center mb-8 px-4"
    >
      <h1 className="text-3xl font-bold mb-3">{title}</h1>
      <p className="text-foreground-secondary text-lg">{subtitle}</p>
      {badge && <p className="text-sm text-primary font-medium mt-2">{badge}</p>}
    </motion.div>

    {children && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-md mb-6 px-4"
      >
        {children}
      </motion.div>
    )}

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="w-full max-w-md space-y-3 px-4"
    >
      <Button
        fullWidth
        size={primaryAction.size ?? 'xl'}
        variant={primaryAction.variant === 'outline' ? 'outline' : undefined}
        onClick={primaryAction.onClick}
      >
        {primaryAction.icon}
        {primaryAction.label}
      </Button>
      {secondaryAction && (
        <Button
          fullWidth
          size={secondaryAction.size ?? 'lg'}
          variant={secondaryAction.variant === 'primary' ? undefined : 'outline'}
          onClick={secondaryAction.onClick}
        >
          {secondaryAction.icon}
          {secondaryAction.label}
        </Button>
      )}
      {hint && (
        <p className="text-center text-sm text-muted-foreground pt-2">{hint}</p>
      )}
    </motion.div>
  </div>
);
