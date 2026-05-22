import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import {
  CheckCircle2,
  PlayCircle,
  CreditCard,
  Calendar,
  Syringe,
  Bell,
  X,
  Check,
  AlertCircle,
  Gift,
  Star,
  Sparkles,
  Heart,
  Camera,
  ChevronDown,
  ChevronUp,
  Trash2,
  BellOff,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/Card';
import { IconButton } from '../components/IconButton';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'urgent' | 'promo';
  icon: any;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  priority: 'high' | 'normal' | 'low';
  expandedContent?: string;
  actions?: Array<{ label: string; variant?: 'primary' | 'outline' }>;
}

export const NotificationsScreen: React.FC = () => {
  const { t } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      icon: CheckCircle2,
      title: t('notif.booking.confirmed'),
      message: 'Tu paseo con María González está confirmado',
      expandedContent: 'Fecha: 8 de Mayo, 2026 a las 10:00 AM\nDuración: 60 minutos\nUbicación: Parque El Peñón\nMascota: Max',
      time: 'Hace 2 horas',
      unread: true,
      priority: 'high',
      actions: [
        { label: 'Ver detalles', variant: 'primary' },
        { label: 'Agregar al calendario', variant: 'outline' },
      ],
    },
    {
      id: '2',
      type: 'info',
      icon: PlayCircle,
      title: t('notif.walk.started'),
      message: 'María ha comenzado el paseo con Max',
      expandedContent: 'El paseo comenzó a las 10:02 AM. Puedes seguir la ubicación en tiempo real desde el mapa de seguimiento.',
      time: 'Hace 5 horas',
      unread: true,
      priority: 'high',
      actions: [
        { label: 'Ver en vivo', variant: 'primary' },
      ],
    },
    {
      id: '3',
      type: 'success',
      icon: CheckCircle2,
      title: t('notif.walk.completed'),
      message: 'Paseo completado exitosamente',
      expandedContent: 'Max caminó 2.3 km en 60 minutos a un ritmo promedio de 2.3 km/h. Recibiste 3 fotos durante el paseo.',
      time: 'Ayer',
      unread: false,
      priority: 'normal',
      actions: [
        { label: 'Ver resumen', variant: 'primary' },
        { label: 'Calificar', variant: 'outline' },
      ],
    },
    {
      id: '4',
      type: 'info',
      icon: CreditCard,
      title: t('notif.payment.confirmed'),
      message: 'Pago de $17,250 procesado correctamente',
      expandedContent: 'Tu pago fue procesado con Visa •••• 4242. Recibo enviado a tu correo electrónico.',
      time: 'Ayer',
      unread: false,
      priority: 'normal',
    },
    {
      id: '5',
      type: 'warning',
      icon: Syringe,
      title: t('notif.vaccination.reminder'),
      message: 'La vacuna antirrábica de Luna vence en 15 días',
      expandedContent: 'Fecha de vencimiento: 22 de Mayo, 2026. Agenda una cita con tu veterinario lo antes posible para mantener las vacunas al día.',
      time: 'Hace 2 días',
      unread: false,
      priority: 'high',
      actions: [
        { label: 'Agendar cita', variant: 'primary' },
        { label: 'Recordar más tarde', variant: 'outline' },
      ],
    },
    {
      id: '6',
      type: 'promo',
      icon: Gift,
      title: '¡Obtén 20% de descuento!',
      message: 'Invita a un amigo y ambos recibirán descuento',
      expandedContent: 'Comparte tu código PAWALK2026 y recibe 20% de descuento en tu próximo paseo cuando tu amigo complete su primera reserva.',
      time: 'Hace 3 días',
      unread: false,
      priority: 'low',
      actions: [
        { label: 'Compartir código', variant: 'primary' },
      ],
    },
    {
      id: '7',
      type: 'info',
      icon: Camera,
      title: 'Nuevas fotos recibidas',
      message: 'María compartió 3 fotos del paseo',
      time: 'Hace 4 días',
      unread: false,
      priority: 'low',
    },
  ]);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'info':
        return 'text-info';
      case 'urgent':
        return 'text-destructive';
      case 'promo':
        return 'text-accent';
      default:
        return 'text-muted-foreground';
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-success/10';
      case 'warning':
        return 'bg-warning/10';
      case 'info':
        return 'bg-info/10';
      case 'urgent':
        return 'bg-destructive/10';
      case 'promo':
        return 'bg-gradient-to-br from-accent/10 to-secondary/10';
      default:
        return 'bg-muted';
    }
  };

  const groupNotificationsByTime = () => {
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const earlier: Notification[] = [];

    notifications.forEach((notif) => {
      if (notif.time.includes('Hace') && !notif.time.includes('días')) {
        today.push(notif);
      } else if (notif.time === 'Ayer') {
        yesterday.push(notif);
      } else {
        earlier.push(notif);
      }
    });

    return { today, yesterday, earlier };
  };

  const grouped = groupNotificationsByTime();
  const unreadCount = notifications.filter((n) => n.unread).length;

  const NotificationCard = ({ notification, index }: { notification: Notification; index: number }) => {
    const [swipeX, setSwipeX] = useState(0);
    const isExpanded = expandedId === notification.id;

    const handleDragEnd = (event: any, info: PanInfo) => {
      if (info.offset.x < -100) {
        handleDelete(notification.id);
      } else if (info.offset.x > 100) {
        handleMarkAsRead(notification.id);
      }
      setSwipeX(0);
    };

    return (
      <motion.div
        key={notification.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100, height: 0 }}
        transition={{ delay: index * 0.03 }}
        className="relative"
      >
        {/* Swipe Actions Background */}
        <div className="absolute inset-0 flex items-center justify-between px-4 rounded-2xl overflow-hidden">
          <motion.div
            className="flex items-center gap-2 text-success"
            animate={{ opacity: swipeX > 50 ? 1 : 0 }}
          >
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">Marcar leída</span>
          </motion.div>
          <motion.div
            className="flex items-center gap-2 text-destructive"
            animate={{ opacity: swipeX < -50 ? 1 : 0 }}
          >
            <span className="text-sm font-medium">Eliminar</span>
            <Trash2 className="w-5 h-5" />
          </motion.div>
        </div>

        {/* Notification Card */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDrag={(event, info) => setSwipeX(info.offset.x)}
          onDragEnd={handleDragEnd}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            hoverable
            variant="elevated"
            className={`relative overflow-hidden ${
              notification.unread
                ? 'border-2 border-primary/30 bg-primary/5'
                : 'border border-border'
            }`}
          >
            {/* Priority indicator */}
            {notification.priority === 'high' && notification.unread && (
              <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-t-primary border-l-[40px] border-l-transparent">
                <Star className="absolute -top-[35px] -right-[5px] w-4 h-4 text-white" fill="white" />
              </div>
            )}

            <div className="flex gap-3">
              {/* Icon */}
              <motion.div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 relative ${getBgColor(
                  notification.type
                )}`}
                animate={notification.unread ? { scale: [1, 1.05] } : {}}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
              >
                {React.createElement(notification.icon, {
                  className: `w-6 h-6 ${getIconColor(notification.type)}`,
                })}
                {notification.unread && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white"
                    animate={{ scale: [1, 1.2] }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                  />
                )}
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className={`font-bold text-sm ${notification.unread ? 'text-foreground' : 'text-foreground/80'}`}>
                    {notification.title}
                  </h3>
                  <p className="text-xs text-muted-foreground shrink-0">{notification.time}</p>
                </div>

                <p className={`text-sm mb-2 leading-relaxed ${notification.unread ? 'text-foreground-secondary' : 'text-muted-foreground'}`}>
                  {notification.message}
                </p>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && notification.expandedContent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <p className="text-xs text-foreground-secondary leading-relaxed whitespace-pre-line">
                        {notification.expandedContent}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                {notification.actions && isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 mb-2"
                  >
                    {notification.actions.map((action, i) => (
                      <Button
                        key={i}
                        variant={action.variant === 'primary' ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </motion.div>
                )}

                {/* Expand/Collapse Button */}
                {(notification.expandedContent || notification.actions) && (
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : notification.id)}
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-1"
                  >
                    {isExpanded ? (
                      <>
                        Ver menos <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        Ver más <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col gap-2">
                {notification.unread && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success hover:bg-success/20 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </motion.button>
                )}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(notification.id)}
                  className="w-8 h-8 rounded-full bg-muted hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="h-full overflow-y-auto pb-24 bg-background-secondary">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-br from-primary/10 to-background border-b-2 border-border/50 p-4 z-10 shadow-md backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" />
              Notificaciones
            </h1>
            {unreadCount > 0 && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-muted-foreground mt-1"
              >
                Tienes {unreadCount} {unreadCount === 1 ? 'notificación nueva' : 'notificaciones nuevas'}
              </motion.p>
            )}
          </div>

          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors"
              >
                <Check className="w-4 h-4" />
                Marcar todas
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            className="h-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-full"
          />
        )}
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="p-4">
          {/* Today */}
          {grouped.today.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 px-1">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Hoy</h2>
                <div className="flex-1 h-px bg-border" />
                {grouped.today.filter((n) => n.unread).length > 0 && (
                  <Badge className="bg-primary/10 text-primary text-xs px-2 py-0.5">
                    {grouped.today.filter((n) => n.unread).length} nuevas
                  </Badge>
                )}
              </div>
              <div className="space-y-2.5">
                <AnimatePresence>
                  {grouped.today.map((notification, index) => (
                    <NotificationCard key={notification.id} notification={notification} index={index} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Yesterday */}
          {grouped.yesterday.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 px-1">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Ayer</h2>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="space-y-2.5">
                <AnimatePresence>
                  {grouped.yesterday.map((notification, index) => (
                    <NotificationCard key={notification.id} notification={notification} index={index} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Earlier */}
          {grouped.earlier.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 px-1">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Anteriores</h2>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="space-y-2.5">
                <AnimatePresence>
                  {grouped.earlier.map((notification, index) => (
                    <NotificationCard key={notification.id} notification={notification} index={index} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-full text-center p-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.1],
              rotate: [0, 10],
            }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', repeatDelay: 2, ease: 'easeInOut' }}
            className="w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mb-6 relative"
          >
            <BellOff className="w-16 h-16 text-muted-foreground" />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/20"
              animate={{ scale: [1, 1.2], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            />
          </motion.div>
          <h3 className="text-2xl font-bold mb-2">Todo al día</h3>
          <p className="text-muted-foreground max-w-xs leading-relaxed">
            No tienes notificaciones nuevas. Te avisaremos cuando algo importante suceda.
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Heart className="w-4 h-4 text-primary" />
            <span>Disfruta tu día con tranquilidad</span>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
