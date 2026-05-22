import React from 'react';
import { motion } from 'motion/react';
import { Check, Package, Truck, Home } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import type { MarketplaceOrderStatus } from '@/types';

interface TrackingStep {
  status: MarketplaceOrderStatus;
  completed: boolean;
  active: boolean;
}

interface OrderTrackingStepperProps {
  steps: TrackingStep[];
}

const STEP_ICONS: Record<MarketplaceOrderStatus, React.ComponentType<{ className?: string }>> = {
  confirmed: Check,
  preparing: Package,
  shipped: Truck,
  delivered: Home,
  cancelled: Check,
};

export const OrderTrackingStepper: React.FC<OrderTrackingStepperProps> = ({ steps }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-0">
      {steps.map((step, index) => {
        const Icon = STEP_ICONS[step.status];
        const isLast = index === steps.length - 1;

        return (
          <div key={step.status} className="flex gap-4">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: step.active ? [1, 1.08, 1] : 1 }}
                transition={{ duration: 1.2, repeat: step.active ? Infinity : 0 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step.completed
                    ? 'bg-success border-success text-white'
                    : step.active
                      ? 'bg-primary/15 border-primary text-primary'
                      : 'bg-muted border-border text-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
              </motion.div>
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 min-h-[32px] my-1 rounded-full ${
                    step.completed ? 'bg-success' : 'bg-border'
                  }`}
                />
              )}
            </div>

            <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
              <p
                className={`font-semibold ${
                  step.active ? 'text-primary' : step.completed ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {t(`marketplace.tracking.${step.status}`)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {step.completed
                  ? t('marketplace.tracking.completed')
                  : step.active
                    ? t('marketplace.tracking.inProgress')
                    : t('marketplace.tracking.pending')}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
