import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Verified, X } from 'lucide-react';
import { Avatar } from '../Avatar';
import { getReviewAuthorAvatarProps } from '@/lib/avatars';
import { Card } from '../Card';
import { IconButton } from '../IconButton';

export interface WalkerReview {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  petName?: string;
}

interface WalkerReviewsModalProps {
  open: boolean;
  onClose: () => void;
  walkerName: string;
  walkerRating: number;
  totalReviews: number;
  reviews: WalkerReview[];
  ratingBreakdown: { stars: number; count: number; percentage: number }[];
}

export const WalkerReviewsModal: React.FC<WalkerReviewsModalProps> = ({
  open,
  onClose,
  walkerName,
  walkerRating,
  totalReviews,
  reviews,
  ratingBreakdown,
}) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
        role="presentation"
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          className="w-full max-w-md max-h-[88vh] bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="walker-reviews-title"
        >
          <div className="h-1 w-12 bg-border rounded-full mx-auto mt-3 sm:hidden shrink-0" />

          <div className="px-5 pt-4 pb-3 border-b border-border shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="walker-reviews-title" className="text-xl font-bold">
                  Reseñas de {walkerName}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-4 h-4 fill-secondary text-secondary" />
                  <span className="font-bold">{walkerRating}</span>
                  <span className="text-sm text-muted-foreground">
                    · {totalReviews} reseñas
                  </span>
                </div>
              </div>
              <IconButton variant="ghost" onClick={onClose} aria-label="Cerrar">
                <X className="w-5 h-5" />
              </IconButton>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
            <Card padding="md">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Distribución de calificaciones
              </p>
              <div className="space-y-2">
                {ratingBreakdown.map((item) => (
                  <div key={item.stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-14 shrink-0">
                      <span className="text-sm font-medium">{item.stars}</span>
                      <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
                    </div>
                    <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-secondary to-accent rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-3 pb-2">
              {reviews.map((review) => (
                <Card key={review.id} padding="md">
                  <div className="flex gap-3">
                    <Avatar {...getReviewAuthorAvatarProps(review.user, review.avatar)} size="md" />
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
                          <span className="text-xs text-muted-foreground truncate">
                            · {review.petName}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground-secondary leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
