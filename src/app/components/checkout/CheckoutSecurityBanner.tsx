import React from 'react';
import { CheckCircle2, Lock, Shield } from 'lucide-react';
import { Card } from '../Card';

export const CheckoutSecurityBanner: React.FC = () => (
  <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
    <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
      <Shield className="w-4 h-4 text-success" />
      Tu pago está protegido
    </h3>

    <div className="space-y-2.5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center shrink-0">
          <Lock className="w-4 h-4 text-success" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium">Encriptación SSL 256-bit</p>
          <p className="text-xs text-muted-foreground">Tus datos están seguros</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium">Verificación en dos pasos</p>
          <p className="text-xs text-muted-foreground">Confirmación bancaria</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4 text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium">Garantía de reembolso</p>
          <p className="text-xs text-muted-foreground">100% seguro o te devolvemos tu dinero</p>
        </div>
      </div>
    </div>

    <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-3 text-xs text-muted-foreground">
      <span>Certificado por:</span>
      <div className="flex items-center gap-2">
        <div className="px-2 py-1 bg-background rounded border border-border">
          <span className="font-semibold">PCI DSS</span>
        </div>
        <div className="px-2 py-1 bg-background rounded border border-border">
          <span className="font-semibold">SSL</span>
        </div>
      </div>
    </div>
  </Card>
);
