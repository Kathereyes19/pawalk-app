import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Star,
  Verified,
  Award,
  Heart,
  Clock,
  MapPin,
  Calendar,
  DollarSign,
  BadgeCheck,
  Building2,
  Home,
  Route,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { WALKER_REVIEWS, WALKER_RATING_BREAKDOWN } from '../data/walkerProfileData';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { IconButton } from '../components/IconButton';
import { WalkerReviewsModal } from '../components/walker/WalkerReviewsModal';
import { WalkerAvailabilityBadge } from '../components/walker/WalkerAvailabilityBadge';
import { ProviderProfileSections } from '../components/walker/ProviderProfileSections';
import { canBookImmediately } from '@/lib/walkers/availability';
import { getWalkerHomeCategory } from '@/lib/walkers/serviceCategory';
import {
  getCategoryBadgeLabel,
  getPriceUnitLabel,
  getProfileBookCta,
} from '@/lib/providers/serviceExperience';
import { Avatar } from '../components/Avatar';
import { getWalkerAvatarProps } from '@/lib/avatars';
import type { Walker } from '@/types';

interface WalkerProfileScreenProps {
  walker: Walker;
  onBack: () => void;
  onBookWalk: () => void;
}

export const WalkerProfileScreen: React.FC<WalkerProfileScreenProps> = ({
  walker,
  onBack,
  onBookWalk,
}) => {
  const { t } = useLanguage();
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const category = getWalkerHomeCategory(walker);
  const instantBooking = canBookImmediately(walker);
  const bookCta = getProfileBookCta(category);
  const priceUnit = getPriceUnitLabel(category);

  const walkerAvatar = useMemo(() => getWalkerAvatarProps(walker), [walker]);

  const stats = useMemo(() => {
    if (category === 'veterinary') {
      return [
        { value: walker.rating.toFixed(1), label: 'Calificación', icon: Star, accent: 'text-secondary', fill: 'fill-secondary' },
        { value: String(walker.reviews), label: 'Reseñas', icon: Building2, accent: 'text-primary', fill: '' },
        { value: `${walker.experience}+`, label: 'Años', icon: Award, accent: 'text-accent', fill: '' },
      ];
    }
    if (category === 'caregivers') {
      return [
        { value: walker.rating.toFixed(1), label: t('walker.rating'), icon: Star, accent: 'text-secondary', fill: 'fill-secondary' },
        { value: String(walker.experience), label: 'Años exp.', icon: Home, accent: 'text-primary', fill: '' },
        { value: String(walker.reviews), label: t('walker.reviews'), icon: Award, accent: 'text-accent', fill: '' },
      ];
    }
    return [
      { value: walker.rating.toFixed(1), label: t('walker.rating'), icon: Star, accent: 'text-secondary', fill: 'fill-secondary' },
      { value: String(walker.reviews), label: t('walker.reviews'), icon: Route, accent: 'text-primary', fill: '' },
      { value: String(walker.experience), label: t('walker.experience'), icon: Award, accent: 'text-accent', fill: '' },
    ];
  }, [category, t, walker.experience, walker.rating, walker.reviews]);

  const headerGradient =
    category === 'veterinary'
      ? 'from-info via-primary to-secondary'
      : category === 'caregivers'
        ? 'from-accent via-primary to-secondary'
        : 'from-primary via-secondary to-accent';

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

      <div className={`bg-gradient-to-br ${headerGradient} px-6 pt-6 pb-24 relative overflow-hidden`}>
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
            <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center shadow-2xl relative">
              <Avatar {...walkerAvatar} size="2xl" className="ring-4 ring-white/30" />
              {walker.verified && (
                <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-success rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                  <BadgeCheck className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          </motion.div>

          <span className="inline-block mb-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">
            {getCategoryBadgeLabel(category)}
          </span>
          <h1 className="text-3xl font-bold text-white mb-2">{walker.name}</h1>

          <div className="flex items-center justify-center gap-2 mb-3">
            {walker.verified && (
              <div className="inline-flex items-center gap-1.5 bg-white/25 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/40 shadow-sm">
                <Verified className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">{t('walker.verified')}</span>
              </div>
            )}
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

      <ProviderProfileSections
        walker={walker}
        onShowAllReviews={() => setShowAllReviews(true)}
        expandedReview={expandedReview}
        onToggleReview={setExpandedReview}
      />

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
                <span className="text-sm text-muted-foreground">{priceUnit}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              {instantBooking ? 'Reserva instantánea' : 'Agendamiento futuro'}
            </p>
          </div>
          <Button onClick={onBookWalk} size="xl" className="shadow-xl px-6">
            <Calendar className="w-5 h-5 mr-2" />
            {bookCta}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
