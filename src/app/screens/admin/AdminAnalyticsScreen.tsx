import React, { useMemo } from 'react';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { useReservations } from '@/contexts/ReservationsContext';
import { useMarketplace } from '@/contexts/MarketplaceContext';
import { resolveEffectiveStatus } from '@/features/reservations';
import { Card } from '../../components/Card';

export const AdminAnalyticsScreen: React.FC = () => {
  const { reservations } = useReservations();
  const { orders } = useMarketplace();

  const metrics = useMemo(() => {
    const completed = reservations.filter(
      (reservation) => resolveEffectiveStatus(reservation) === 'completed'
    ).length;
    const revenue = orders.reduce((sum, order) => sum + order.subtotal, 0);

    return [
      { label: 'Tasa de finalización', value: `${Math.round((completed / Math.max(reservations.length, 1)) * 100)}%`, icon: TrendingUp },
      { label: 'Ingresos marketplace', value: `$${revenue.toLocaleString()}`, icon: BarChart3 },
      { label: 'Pedidos totales', value: String(orders.length), icon: PieChart },
    ];
  }, [reservations, orders]);

  return (
    <div className="h-full overflow-y-auto bg-background-secondary">
      <div className="border-b border-border bg-background/95 backdrop-blur-lg px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Admin</p>
        <h1 className="text-2xl font-bold mt-1">Analíticas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Indicadores clave de rendimiento de la plataforma.
        </p>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.label} variant="elevated">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card padding="lg">
          <h2 className="font-semibold mb-4">Tendencias semanales</h2>
          <div className="grid grid-cols-7 gap-2 items-end h-40">
            {[42, 58, 35, 72, 64, 81, 55].map((height, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary/30 to-primary"
                  style={{ height: `${height}%` }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'][index]}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
