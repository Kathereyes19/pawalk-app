import React from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useLayout } from './LayoutContext';
import { IconButton } from '../IconButton';

export const RightPanelSlot: React.FC = () => {
  const { rightPanel, closeRightPanel } = useLayout();

  return (
    <AnimatePresence>
      {rightPanel && (
        <motion.aside
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="hidden lg:flex lg:flex-col lg:w-[360px] xl:w-[400px] shrink-0 h-full border-l border-border bg-card/95 backdrop-blur-md overflow-hidden"
        >
          <div className="flex items-center justify-end p-3 border-b border-border shrink-0">
            <IconButton variant="ghost" onClick={closeRightPanel} aria-label="Cerrar panel">
              <X className="w-5 h-5" />
            </IconButton>
          </div>
          <div className="flex-1 overflow-y-auto">{rightPanel}</div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
