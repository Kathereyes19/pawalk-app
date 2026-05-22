import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SlidersHorizontal, X } from 'lucide-react';
import { IconButton } from '../IconButton';
import type { MarketplaceFilters } from '@/types';
import { MarketplaceFilterPanel } from './MarketplaceFilterPanel';

interface MarketplaceFilterSheetProps {
  open: boolean;
  filters: MarketplaceFilters;
  priceBounds: { min: number; max: number };
  onClose: () => void;
  onChange: (patch: Partial<MarketplaceFilters>) => void;
  onReset: () => void;
}

export const MarketplaceFilterSheet: React.FC<MarketplaceFilterSheetProps> = ({
  open,
  filters,
  priceBounds,
  onClose,
  onChange,
  onReset,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="absolute bottom-0 left-0 right-0 max-h-[88vh] bg-card rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Filtros</h2>
              </div>
              <IconButton variant="ghost" onClick={onClose} aria-label="Cerrar filtros">
                <X className="w-5 h-5" />
              </IconButton>
            </div>

            <MarketplaceFilterPanel
              filters={filters}
              priceBounds={priceBounds}
              onChange={onChange}
              onReset={onReset}
              onApply={onClose}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
