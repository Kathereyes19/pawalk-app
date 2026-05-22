import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { IconButton } from '../IconButton';

interface CheckoutHeaderProps {
  title: string;
  subtitle: string;
  onBack?: () => void;
}

export const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({ title, subtitle, onBack }) => (
  <div className="bg-gradient-to-br from-primary to-accent px-6 py-6 sticky top-0 z-10 shadow-lg">
    <div className="flex items-center justify-between mb-4">
      {onBack ? (
        <IconButton
          onClick={onBack}
          variant="ghost"
          className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </IconButton>
      ) : (
        <div className="w-11" />
      )}

      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">
        <Shield className="w-4 h-4 text-white" />
        <span className="text-xs font-semibold text-white">Pago seguro</span>
      </div>
    </div>

    <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
    <p className="text-white/90 text-sm">{subtitle}</p>
  </div>
);
