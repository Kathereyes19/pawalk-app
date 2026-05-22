import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Star,
  Verified,
  Award,
  Shield,
  Heart,
  Clock,
  MapPin,
  Check,
  ChevronDown,
  ChevronUp,
  Calendar,
  DollarSign,
  Sparkles,
  CheckCircle2,
  BadgeCheck,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  WALKER_CERTIFICATIONS,
  WALKER_RATING_BREAKDOWN,
  WALKER_REVIEWS,
} from '../data/walkerProfileData';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { IconButton } from '../components/IconButton';
import { Avatar } from '../components/Avatar';
import { WalkerReviewsModal } from '../components/walker/WalkerReviewsModal';
import { WalkerAvailabilityBadge } from '../components/walker/WalkerAvailabilityBadge';
import { canBookImmediately } from '@/lib/walkers/availability';
import type { Walker } from '@/types';

interface WalkerProfileScreenProps {
  walker: Walker;
  onBack: () => void;
  onBookWalk: () => void;
}

const certIcons = {
  shield: Shield,
  award: Award,
  heart: Heart,
} as const;

export const WalkerProfileScreen: React.FC<WalkerProfileScreenProps> = ({
  walker,
  onBack,
  onBookWalk,
}) => {
  const { t } = useLanguage();
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const previewReviews = useMemo(() => WALKER_REVIEWS.slice(0, 3), []);
  const instantBooking = canBookImmediately(walker);

  const stats = [
    {
      value: walker.rating.toFixed(1),
      label: t('walker.rating'),
      icon: Star,
      accent: 'text-secondary',
      fill: 'fill-secondary',
    },
    {
      value: String(walker.reviews),
      label: t('walker.reviews'),
      icon: Sparkles,
      accent: 'text-primary',
      fill: '',
    },
    {
      value: String(walker.experience),
      label: t('walker.experience'),
      icon: Award,
      accent: 'text-accent',
      fill: '',
    },
  ];

  return (
    <div className="h-full overflow-y-auto pb-32 bg-background-secondary">
      <WalkerReviewsModal
        open={showAllReviews}
        onClose={() => setShowAllReviews(false)}
        walkerName={walker.name}
        walkerRating={walker.rating}
        totalReviews={walker.reviews}
        reviews={WALKER_REVIEWS}
        ratingBreakdown={WALKER_RATING_BREAKDOWN}
      />

      <div className="bg-gradient-to-br from-primary via-secondary to-accent px-6 pt-6 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full"
              style={{ left: `${15 + i * 12}%`, top: `${20 + i * 8}%` }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between relative z-10">
          <IconButton
            onClick={onBack}
            variant="ghost"
            className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </IconButton>
          <motion.button
            onClick={() => setIsFavorite(!isFavorite)}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Heart
              className={`w-5 h-5 transition-all ${
                isFavorite ? 'fill-white text-white scale-110' : 'text-white'
              }`}
            />
          </motion.button>
        </div>

        <div className="text-center mt-8 relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.4 }}
            className="relative inline-block"
          >
            <div className="w-32 h-32 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-7xl shadow-2xl relative ring-4 ring-white/30">
              {walker.avatar}
              <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-success rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                <BadgeCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <h1 className="text-3xl font-bold text-white mb-2">{walker.name}</h1>

          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 bg-white/25 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/40 shadow-sm">
              <Verified className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">{t('walker.verified')}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-white/90">
            {walker.available && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">~{walker.responseTime || 2} min</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">{walker.distance} km</span>
            </div>
            <WalkerAvailabilityBadge walker={walker} size="md" inverse />
          </div>
        </div>
      </div>

      {/* Stats summary card */}
      <div className="px-4 -mt-16 mb-6 relative z-20">
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
          <Card
            padding="none"
            className="overflow-hidden border border-white/70 bg-card/95 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/10 pointer-events-none" />
            <div className="grid grid-cols-3 relative">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`px-3 py-5 text-center ${
                    index < stats.length - 1 ? 'border-r border-border/60' : ''
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <stat.icon className={`w-5 h-5 ${stat.accent} ${stat.fill}`} />
                    <span className="text-2xl sm:text-3xl font-bold tracking-tight">{stat.value}</span>
                  </div>
                  <p className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide leading-tight">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Servicios incluidos
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { icon: '🚶', label: 'Paseo personalizado' },
            { icon: '📸', label: 'Fotos en vivo' },
            { icon: '🗺️', label: 'Seguimiento GPS' },
            { icon: '💧', label: 'Agua incluida' },
            { icon: '🎾', label: 'Tiempo de juego' },
            { icon: '🏥', label: 'Seguro incluido' },
          ].map((service, index) => (
            <Card key={index} padding="sm" className="text-center">
              <div className="text-3xl mb-1.5">{service.icon}</div>
              <p className="text-xs font-medium text-foreground-secondary leading-tight">{service.label}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold mb-3">{t('walker.about')}</h2>
        <Card>
          <p className="text-foreground-secondary leading-relaxed">
            Soy un amante de los animales con {walker.experience} años de experiencia en el cuidado
            de mascotas. Me especializo en paseos personalizados y siempre priorizo la seguridad y
            felicidad de cada mascota bajo mi cuidado.
          </p>
        </Card>
      </div>

      {/* Certifications */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3 gap-3">
          <h2 className="text-lg font-bold">{t('walker.certifications')}</h2>
          <Badge variant="success" verified className="shrink-0">
            3/3 {t('walker.verified').toLowerCase()}
          </Badge>
        </div>
        <div className="space-y-3">
          {WALKER_CERTIFICATIONS.map((cert, index) => {
            const Icon = certIcons[cert.icon];
            return (
              <motion.div
                key={cert.labelKey}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <Card
                  padding="md"
                  className="border-success/20 bg-gradient-to-r from-success/5 to-transparent"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative w-12 h-12 rounded-2xl bg-success/15 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-success" />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success border-2 border-card flex items-center justify-center">
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm">{t(cert.labelKey)}</p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/15 text-success px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          {t('walker.verified')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Emitida: {cert.issueDate}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        ID verificación: {cert.verificationId}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Reviews preview */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">
            {t('walker.reviewsTitle')} ({WALKER_REVIEWS.length})
          </h2>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-secondary text-secondary" />
            <span className="font-bold">{walker.rating}</span>
          </div>
        </div>

        <Card className="mb-4">
          <div className="space-y-2">
            {WALKER_RATING_BREAKDOWN.map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16 shrink-0">
                  <span className="text-sm font-medium">{item.stars}</span>
                  <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
                </div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    className="h-full bg-gradient-to-r from-secondary to-accent rounded-full"
                  />
                </div>
                <span className="text-xs text-muted-foreground w-12 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-2.5">
          {previewReviews.map((review) => {
            const isExpanded = expandedReview === review.id;
            const shouldTruncate = review.comment.length > 120;
            const displayComment =
              isExpanded || !shouldTruncate
                ? review.comment
                : `${review.comment.slice(0, 120)}...`;

            return (
              <Card key={review.id}>
                <div className="flex gap-3">
                  <Avatar emoji={review.avatar} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="font-semibold text-sm truncate">{review.user}</p>
                        {review.verified && (
                          <Verified className="w-4 h-4 text-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground shrink-0">{review.date}</p>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < review.rating ? 'fill-secondary text-secondary' : 'text-border'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-foreground-secondary leading-relaxed">{displayComment}</p>
                    {shouldTruncate && (
                      <button
                        type="button"
                        onClick={() => setExpandedReview(isExpanded ? null : review.id)}
                        className="flex items-center gap-1 text-xs font-medium text-primary mt-2"
                      >
                        {isExpanded ? (
                          <>
                            Ver menos <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            Leer más <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Button
          fullWidth
          variant="outline"
          size="lg"
          className="mt-3"
          onClick={() => setShowAllReviews(true)}
        >
          {t('walker.reviews.viewAll')} ({walker.reviews})
        </Button>
      </div>

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 p-4 pb-safe bg-card/98 backdrop-blur-xl border-t-2 border-border/50 shadow-2xl z-40"
      >
        <div className="max-w-md mx-auto flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <p className="text-xs font-medium text-muted-foreground">{t('from')}</p>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-3xl font-bold text-primary">
                  {walker.price.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">/hr</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {instantBooking ? (
                <>
                  <Check className="w-3 h-3 text-success" />
                  Reserva instantánea
                </>
              ) : (
                <>
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  Solo agendamiento futuro
                </>
              )}
            </p>
          </div>
          <Button onClick={onBookWalk} size="xl" className="shadow-xl px-8">
            <Calendar className="w-5 h-5 mr-2" />
            {instantBooking ? t('walker.book') : 'Agendar próximo horario'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
