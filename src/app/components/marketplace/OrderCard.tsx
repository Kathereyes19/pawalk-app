import React from 'react';
import { Package, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import {
  formatOrderDate,
  formatOrderId,
  getOrderDisplayStatus,
  resolveLiveOrderStatus,
} from '@/features/marketplace';
import { Badge } from '../Badge';
import { Card } from '../Card';
import type { MarketplaceOrder } from '@/types';

interface OrderCardProps {
  order: MarketplaceOrder;
  onClick: () => void;
}

const STATUS_VARIANT: Record<
  ReturnType<typeof getOrderDisplayStatus>,
  'info' | 'warning' | 'success' | 'default'
> = {
  processing: 'warning',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'default',
};

export const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const { t, language } = useLanguage();
  const liveStatus = resolveLiveOrderStatus(order).status;
  const displayStatus = getOrderDisplayStatus(liveStatus);
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card
      hoverable
      onClick={onClick}
      className="cursor-pointer border-border/80 hover:border-primary/30 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">
              {t('marketplace.orders.orderId')} #{formatOrderId(order.id)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatOrderDate(order.createdAt, language === 'en' ? 'en-US' : 'es-CO')}
            </p>
          </div>
        </div>
        <Badge variant={STATUS_VARIANT[displayStatus]}>
          {t(`marketplace.orders.status.${displayStatus}`)}
        </Badge>
      </div>

      <div className="space-y-1.5 mb-3">
        {order.items.slice(0, 2).map((item) => (
          <p key={`${order.id}-${item.productId}`} className="text-sm text-muted-foreground truncate">
            {item.quantity}× {item.name}
          </p>
        ))}
        {order.items.length > 2 && (
          <p className="text-xs text-muted-foreground">
            +{order.items.length - 2} {t('marketplace.orders.moreItems')}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground">{itemCount} {t('marketplace.orders.items')}</p>
          <p className="font-bold text-primary text-lg">${order.subtotal.toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium text-primary">
          {t('marketplace.orders.track')}
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </Card>
  );
};
