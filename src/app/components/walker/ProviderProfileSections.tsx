import React from 'react';
import { motion } from 'motion/react';
import {
  Award,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Home,
  MapPin,
  Moon,
  PawPrint,
  Phone,
  Route,
  Shield,
  Sparkles,
  Star,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  WALKER_CERTIFICATIONS,
  WALKER_RATING_BREAKDOWN,
  WALKER_REVIEWS,
} from '../../data/walkerProfileData';
import { Badge } from '../Badge';
import { Card } from '../Card';
import { Avatar } from '../Avatar';
import { WalkerAvailabilityBadge } from './WalkerAvailabilityBadge';
import {
  formatAcceptedSizes,
  getCareDurationOptions,
  getIncludedServices,
  getInstitutionMeta,
  getProfileAboutText,
  getVetServicesForProvider,
  getWalkPreferences,
  getWalkerWalkStats,
} from '@/lib/providers/serviceExperience';
import { getWalkerHomeCategory } from '@/lib/walkers/serviceCategory';
import { getProviderGalleryEmojis, getReviewAuthorAvatarProps } from '@/lib/avatars';
import type { CaregiverServiceOffer, Walker } from '@/types';

const CARE_LABELS: Record<CaregiverServiceOffer, string> = {
  overnight: 'Cuidado nocturno',
  'in-home': 'En casa',
  'multi-pet': 'Multi-mascota',
};

interface ProviderProfileSectionsProps {
  walker: Walker;
  onShowAllReviews: () => void;
  expandedReview: string | null;
  onToggleReview: (id: string | null) => void;
}

export const ProviderProfileSections: React.FC<ProviderProfileSectionsProps> = ({
  walker,
  onShowAllReviews,
  expandedReview,
  onToggleReview,
}) => {
  const { t } = useLanguage();
  const category = getWalkerHomeCategory(walker);
  const includedServices = getIncludedServices(category, walker);
  const aboutText = getProfileAboutText(category, walker);
  const previewReviews = WALKER_REVIEWS.slice(0, 3);

  if (category === 'walkers') {
    const walkStats = getWalkerWalkStats(walker);
    return (
      <>
        <div className="px-4 mb-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Route className="w-5 h-5 text-primary" />
            Estadísticas de paseos
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Paseos', value: walkStats.totalWalks, icon: '🚶' },
              { label: 'Km totales', value: `${walkStats.totalKm}`, icon: '🗺️' },
              { label: 'Promedio', value: `${walkStats.avgDurationMin} min`, icon: '⏱️' },
            ].map((item) => (
              <Card key={item.label} padding="sm" className="text-center">
                <div className="text-2xl mb-1">{item.icon}</div>
                <p className="text-lg font-bold">{item.value}</p>
                <p className="text-[11px] text-muted-foreground">{item.label}</p>
              </Card>
            ))}
          </div>
        </div>

        <div className="px-4 mb-6">
          <h2 className="text-lg font-bold mb-3">Tamaños y preferencias</h2>
          <Card className="space-y-3">
            <div className="flex items-start gap-3">
              <PawPrint className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Tamaños aceptados</p>
                <p className="text-sm text-muted-foreground">{formatAcceptedSizes(walker.acceptedSizes)}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {getWalkPreferences(walker).map((pref) => (
                <Badge key={pref} variant="outline" className="text-xs">
                  {pref}
                </Badge>
              ))}
            </div>
            <WalkerAvailabilityBadge walker={walker} size="md" />
          </Card>
        </div>

        <IncludedServicesGrid services={includedServices} />
        <AboutSection text={aboutText} title={t('walker.about')} />
        <CertificationsSection t={t} />
        <ReviewsSection
          walker={walker}
          previewReviews={previewReviews}
          expandedReview={expandedReview}
          onToggleReview={onToggleReview}
          onShowAllReviews={onShowAllReviews}
          t={t}
        />
      </>
    );
  }

  if (category === 'caregivers') {
    const careTypes = walker.caregiverServices ?? ['in-home'];
    return (
      <>
        <div className="px-4 mb-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            Servicios de cuidado
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {careTypes.map((type) => (
              <Card key={type} padding="sm" className="border-primary/15">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{type === 'overnight' ? '🌙' : type === 'in-home' ? '🏠' : '🐾'}</span>
                  <p className="text-sm font-semibold">{CARE_LABELS[type]}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="px-4 mb-6">
          <h2 className="text-lg font-bold mb-3">Horarios y experiencia</h2>
          <Card className="space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">Disponibilidad</p>
                <WalkerAvailabilityBadge walker={walker} size="md" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-accent" />
              <p className="text-sm text-muted-foreground">
                {walker.experience} años de experiencia · {walker.reviews} reseñas
              </p>
            </div>
            {careTypes.includes('overnight') && (
              <div className="rounded-xl bg-muted/50 p-3 text-sm flex items-start gap-2">
                <Moon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Estadías desde{' '}
                  {getCareDurationOptions('overnight')[0]?.label.toLowerCase()} con reportes matutinos y nocturnos.
                </span>
              </div>
            )}
          </Card>
        </div>

        <IncludedServicesGrid services={includedServices} title="Incluye en el cuidado" />
        <AboutSection text={aboutText} title="Sobre el cuidador" />
        <CertificationsSection t={t} />
        <ReviewsSection
          walker={walker}
          previewReviews={previewReviews}
          expandedReview={expandedReview}
          onToggleReview={onToggleReview}
          onShowAllReviews={onShowAllReviews}
          t={t}
        />
      </>
    );
  }

  const meta = getInstitutionMeta(walker);
  const vetServices = getVetServicesForProvider(walker);

  return (
    <>
      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Información del centro
        </h2>
        <Card className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Ubicación</p>
              <p className="text-sm text-muted-foreground">{meta.address}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Horario</p>
              <p className="text-sm text-muted-foreground">{meta.hours}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Contacto</p>
              <p className="text-sm text-muted-foreground">{meta.phone}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold mb-3">Servicios disponibles</h2>
        <div className="space-y-2">
          {vetServices.map((service) => (
            <Card key={service.id} padding="md" className="flex items-center gap-3">
              <span className="text-2xl">{service.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{service.name}</p>
                <p className="text-xs text-muted-foreground">{service.description}</p>
              </div>
              <Badge variant="outline" className="shrink-0 text-xs">
                {service.durationMinutes} min
              </Badge>
            </Card>
          ))}
        </div>
      </div>

      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold mb-3">Galería</h2>
        <div className="grid grid-cols-3 gap-2">
          {getProviderGalleryEmojis(walker.id, meta.gallery.length, category).map((emoji, index) => (
            <Card
              key={`${walker.id}-gallery-${index}`}
              padding="none"
              className="aspect-square flex items-center justify-center text-4xl bg-gradient-to-br from-primary/5 to-accent/10"
            >
              {emoji}
            </Card>
          ))}
        </div>
      </div>

      <AboutSection text={aboutText} title="Sobre el centro" />
      <ReviewsSection
        walker={walker}
        previewReviews={previewReviews}
        expandedReview={expandedReview}
        onToggleReview={onToggleReview}
        onShowAllReviews={onShowAllReviews}
        t={t}
      />
    </>
  );
};

function IncludedServicesGrid({
  services,
  title = 'Servicios incluidos',
}: {
  services: { icon: string; label: string }[];
  title?: string;
}) {
  return (
    <div className="px-4 mb-6">
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-2.5">
        {services.map((service, index) => (
          <Card key={index} padding="sm" className="text-center">
            <div className="text-3xl mb-1.5">{service.icon}</div>
            <p className="text-xs font-medium text-foreground-secondary leading-tight">{service.label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AboutSection({ title, text }: { title: string; text: string }) {
  return (
    <div className="px-4 mb-6">
      <h2 className="text-lg font-bold mb-3">{title}</h2>
      <Card>
        <p className="text-foreground-secondary leading-relaxed">{text}</p>
      </Card>
    </div>
  );
}

function CertificationsSection({ t }: { t: (key: string) => string }) {
  const certIcons = { shield: Shield, award: Award, heart: Sparkles } as const;
  return (
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
              <Card padding="md" className="border-success/20 bg-gradient-to-r from-success/5 to-transparent">
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
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewsSection({
  walker,
  previewReviews,
  expandedReview,
  onToggleReview,
  onShowAllReviews,
  t,
}: {
  walker: Walker;
  previewReviews: typeof WALKER_REVIEWS;
  expandedReview: string | null;
  onToggleReview: (id: string | null) => void;
  onShowAllReviews: () => void;
  t: (key: string) => string;
}) {
  return (
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
            isExpanded || !shouldTruncate ? review.comment : `${review.comment.slice(0, 120)}...`;

          return (
            <Card key={review.id}>
              <div className="flex gap-3">
                <Avatar {...getReviewAuthorAvatarProps(review.user, review.avatar)} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-semibold text-sm truncate">{review.user}</p>
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
                      onClick={() => onToggleReview(isExpanded ? null : review.id)}
                      className="text-xs font-medium text-primary mt-2"
                    >
                      {isExpanded ? 'Ver menos' : 'Leer más'}
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onShowAllReviews}
        className="w-full mt-3 py-3 rounded-xl border border-border text-sm font-semibold text-primary"
      >
        {t('walker.reviews.viewAll')} ({walker.reviews})
      </button>
    </div>
  );
}
