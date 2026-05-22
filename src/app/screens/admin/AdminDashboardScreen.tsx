import React, { useMemo } from 'react';
import {
  ArrowUpRight,
  CalendarDays,
  Package,
  PawPrint,
  ShoppingBag,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useReservations } from '@/contexts/ReservationsContext';
import { useMarketplace } from '@/contexts/MarketplaceContext';
import { resolveEffectiveStatus } from '@/features/reservations';
import { Card } from '../../components/Card';

const MOCK_USER_COUNT = 1284;

export const AdminDashboardScreen: React.FC = () => {
  const { reservations } = useReservations();
  const { orders, filteredProducts } = useMarketplace();

  const stats = useMemo(() => {
    const activeReservations = reservations.filter(
      (reservation) => resolveEffectiveStatus(reservation) === 'active'
    ).length;
    const pendingOrders = orders.filter((order) => order.status !== 'delivered').length;

    return [
      {
        label: 'Usuarios activos',
        value: MOCK_USER_COUNT.toLocaleString(),
        change: '+12%',
        icon: Users,
        tone: 'text-primary',
      },
      {
        label: 'Reservas activas',
        value: String(activeReservations),
        change: '+5%',
        icon: CalendarDays,
        tone: 'text-secondary',
      },
      {
        label: 'Pedidos marketplace',
        value: String(orders.length),
        change: pendingOrders > 0 ? `${pendingOrders} pendientes` : 'Al día',
        icon: ShoppingBag,
        tone: 'text-accent-foreground',
      },
      {
        label: 'Productos publicados',
        value: String(filteredProducts.length),
        change: 'Catálogo',
        icon: Package,
        tone: 'text-primary',
      },
    ];
  }, [reservations, orders, filteredProducts.length]);

  return (
    <div className="h-full overflow-y-auto bg-background-secondary">
      <div className="border-b border-border bg-background/95 backdrop-blur-lg px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Admin</p>
        <h1 className="text-2xl font-bold mt-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Resumen operativo de Pawalk en tiempo real.
        </p>
      </div>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} variant="elevated" className="relative overflow-hidden">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    <p className="text-xs text-success mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center ${stat.tone}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Actividad reciente</h2>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {reservations.slice(0, 4).map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/40"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <PawPrint className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{reservation.petName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {reservation.walkerName}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground shrink-0">
                    {reservation.scheduledDate}
                  </span>
                </div>
              ))}
              {reservations.length === 0 && (
                <p className="text-sm text-muted-foreground">Sin reservas registradas.</p>
              )}
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Marketplace</h2>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {orders.slice(0, 4).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/40"
                >
                  <div>
                    <p className="text-sm font-medium">Pedido #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{order.status}</p>
                  </div>
                  <p className="text-sm font-semibold text-primary">
                    ${order.subtotal.toLocaleString()}
                  </p>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-sm text-muted-foreground">Sin pedidos registrados.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
