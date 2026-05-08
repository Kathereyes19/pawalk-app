import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, Verified, Award, Shield, Heart, Clock, MapPin, Check, ChevronDown, ChevronUp, Calendar, DollarSign, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { IconButton } from '../components/IconButton';
import { Avatar } from '../components/Avatar';

interface WalkerProfileScreenProps {
  walker: any;
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

  const certifications = [
    {
      icon: Shield,
      label: t('walker.cert.id'),
      verified: true,
      issueDate: 'Ene 2024',
      verificationId: '***8742'
    },
    {
      icon: Award,
      label: t('walker.cert.background'),
      verified: true,
      issueDate: 'Mar 2024',
      verificationId: '***2156'
    },
    {
      icon: Heart,
      label: t('walker.cert.firstaid'),
      verified: true,
      issueDate: 'Feb 2024',
      verificationId: '***9431'
    },
  ];

  const reviews = [
    {
      id: '1',
      user: 'Ana López',
      avatar: '👩🏽',
      rating: 5,
      comment: 'Excelente servicio! Mi perro quedó muy feliz. Carlos es muy profesional y siempre llega puntual. Me encanta que envía fotos durante el paseo y mi perro siempre regresa feliz y cansado. Lo recomiendo 100%!',
      date: '2 días atrás',
      verified: true,
      petName: 'Rocky',
    },
    {
      id: '2',
      user: 'Pedro Díaz',
      avatar: '👨🏻',
      rating: 5,
      comment: 'Muy profesional y confiable. Siempre cuida muy bien a mi mascota.',
      date: '1 semana atrás',
      verified: true,
      petName: 'Luna',
    },
    {
      id: '3',
      user: 'Sofia Vargas',
      avatar: '👩🏼',
      rating: 5,
      comment: 'Buen paseador, muy puntual. Mi perro lo adora!',
      date: '2 semanas atrás',
      verified: true,
      petName: 'Max',
    },
    {
      id: '4',
      user: 'Miguel Torres',
      avatar: '👨🏽',
      rating: 5,
      comment: 'Increíble experiencia! Carlos es súper atento y responsable.',
      date: '3 semanas atrás',
      verified: true,
      petName: 'Coco',
    },
  ];

  const ratingBreakdown = [
    { stars: 5, count: 142, percentage: 94 },
    { stars: 4, count: 8, percentage: 5 },
    { stars: 3, count: 1, percentage: 1 },
    { stars: 2, count: 0, percentage: 0 },
    { stars: 1, count: 0, percentage: 0 },
  ];

  return (
    <div className="h-full overflow-y-auto pb-32 bg-background-secondary">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-secondary to-accent px-6 pt-6 pb-24 relative overflow-hidden">
        {/* Animated background sparkles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full"
              style={{
                left: `${15 + i * 12}%`,
                top: `${20 + i * 8}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.2,
              }}
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
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-0 hover:bg-white/30 transition-colors"
          >
            <Heart
              className={`w-5 h-5 transition-all ${
                isFavorite
                  ? 'fill-white text-white scale-110'
                  : 'text-white'
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
            <div className="w-32 h-32 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-7xl shadow-2xl relative">
              {walker.avatar}

              {/* Premium Trust Seal */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', bounce: 0.5 }}
                className="absolute -bottom-1 -right-1 w-12 h-12 bg-success rounded-full flex items-center justify-center shadow-xl border-4 border-white"
              >
                <CheckCircle2 className="w-6 h-6 text-white" />
              </motion.div>
            </div>
          </motion.div>

          <h1 className="text-3xl font-bold text-white mb-2">{walker.name}</h1>

          <div className="flex items-center justify-center gap-2 mb-3">
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(255,255,255,0.4)',
                  '0 0 0 8px rgba(255,255,255,0)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-1.5 bg-white/25 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30"
            >
              <Verified className="w-4 h-4 text-white fill-white" />
              <span className="text-sm font-semibold text-white">{t('walker.verified')}</span>
            </motion.div>
          </div>

          <div className="flex items-center justify-center gap-4 text-white/90">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">~{walker.responseTime || 2} min</span>
            </div>
            <div className="w-1 h-1 bg-white/50 rounded-full" />
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">{walker.distance} km</span>
            </div>
            <div className="w-1 h-1 bg-white/50 rounded-full" />
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-sm font-medium">{t('available')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="px-4 -mt-16 mb-6">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="elevated" padding="none" className="shadow-2xl overflow-hidden border-2 border-white/50">
            <div className="grid grid-cols-3 divide-x divide-border">
              <div className="text-center py-6 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="w-6 h-6 fill-secondary text-secondary" />
                    <span className="text-3xl font-bold">{walker.rating}</span>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {t('walker.rating')}
                  </p>
                </div>
              </div>
              <div className="text-center py-6 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                />
                <div className="relative z-10">
                  <p className="text-3xl font-bold mb-2">{walker.reviews}</p>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {t('walker.reviews')}
                  </p>
                </div>
              </div>
              <div className="text-center py-6 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                />
                <div className="relative z-10">
                  <p className="text-3xl font-bold mb-2">{walker.experience}</p>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {t('walker.years')}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Premium Services */}
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
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card padding="sm" className="text-center">
                <div className="text-3xl mb-1.5">{service.icon}</div>
                <p className="text-xs font-medium text-foreground-secondary leading-tight">
                  {service.label}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold mb-3">{t('walker.about')}</h2>
        <Card>
          <p className="text-foreground-secondary leading-relaxed">
            Soy un amante de los animales con {walker.experience} años de experiencia en el cuidado
            de mascotas. Me especializo en paseos personalizados y siempre priorizo la seguridad y
            felicidad de cada mascota bajo mi cuidado.
          </p>
          <div className="mt-4 pt-4 border-t border-border space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-success shrink-0" />
              <span className="text-foreground-secondary">Respuesta en menos de 5 minutos</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-success shrink-0" />
              <span className="text-foreground-secondary">100% de paseos completados</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-success shrink-0" />
              <span className="text-foreground-secondary">Seguro de responsabilidad civil</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Certifications */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          {t('walker.certifications')}
          <Badge variant="success" className="ml-auto">
            3/3 verificadas
          </Badge>
        </h2>
        <div className="space-y-2.5">
          {certifications.map((cert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Card padding="md" className="relative overflow-hidden">
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 5,
                    ease: 'linear',
                  }}
                />

                <div className="flex items-start gap-3 relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center shrink-0 relative">
                    <cert.icon className="w-6 h-6 text-primary" />
                    {cert.verified && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center border-2 border-white">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm mb-1">{cert.label}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Emitida: {cert.issueDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <Shield className="w-3.5 h-3.5" />
                      <span>ID: {cert.verificationId}</span>
                    </div>
                  </div>

                  {cert.verified && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
                    >
                      <Verified className="w-6 h-6 text-success fill-success shrink-0" />
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Reseñas ({reviews.length})</h2>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-secondary text-secondary" />
            <span className="font-bold">{walker.rating}</span>
            <span className="text-sm text-muted-foreground">/ 5.0</span>
          </div>
        </div>

        {/* Rating Breakdown */}
        <Card className="mb-4">
          <div className="space-y-2">
            {ratingBreakdown.map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16 shrink-0">
                  <span className="text-sm font-medium">{item.stars}</span>
                  <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
                </div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-secondary to-accent rounded-full"
                  />
                </div>
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Individual Reviews */}
        <div className="space-y-2.5">
          {reviews.map((review, index) => {
            const isExpanded = expandedReview === review.id;
            const commentLength = review.comment.length;
            const shouldTruncate = commentLength > 120;
            const displayComment = isExpanded || !shouldTruncate
              ? review.comment
              : review.comment.slice(0, 120) + '...';

            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <div className="flex gap-3">
                    <Avatar emoji={review.avatar} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{review.user}</p>
                          {review.verified && (
                            <Verified className="w-4 h-4 text-primary fill-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground shrink-0">{review.date}</p>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < review.rating
                                  ? 'fill-secondary text-secondary'
                                  : 'text-border'
                              }`}
                            />
                          ))}
                        </div>
                        {review.petName && (
                          <>
                            <div className="w-1 h-1 bg-border rounded-full" />
                            <span className="text-xs text-muted-foreground">
                              Paseo con {review.petName}
                            </span>
                          </>
                        )}
                      </div>

                      <p className="text-sm text-foreground-secondary leading-relaxed">
                        {displayComment}
                      </p>

                      {shouldTruncate && (
                        <button
                          onClick={() =>
                            setExpandedReview(isExpanded ? null : review.id)
                          }
                          className="flex items-center gap-1 text-xs font-medium text-primary mt-2 hover:text-primary/80 transition-colors"
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
              </motion.div>
            );
          })}
        </div>

        {/* View All Reviews Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-3 py-3 rounded-xl border-2 border-border hover:border-primary transition-colors text-sm font-semibold"
        >
          Ver todas las reseñas ({walker.reviews})
        </motion.button>
      </div>

      {/* Fixed Bottom CTA */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 p-4 pb-safe bg-card/98 backdrop-blur-xl border-t-2 border-border/50 shadow-2xl z-40"
      >
        <div className="max-w-md mx-auto">
          {/* Quick availability preview */}
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>Próximos espacios disponibles:</span>
            </div>
            <div className="flex gap-1.5 ml-auto">
              {['Hoy 4pm', 'Mañ 10am', 'Mañ 6pm'].map((slot, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="px-2 py-1 bg-success/10 text-success rounded-md text-xs font-medium"
                >
                  {slot}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
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
                <Check className="w-3 h-3 text-success" />
                Reserva instantánea
              </p>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={onBookWalk} size="xl" className="shadow-xl px-8">
                <Calendar className="w-5 h-5 mr-2" />
                {t('walker.book')}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
