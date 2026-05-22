import React, { useState } from 'react';
import { ProviderProfileDesktopHeader } from './ProviderProfileDesktopHeader';
import { ProviderProfileBookingPanel } from './ProviderProfileBookingPanel';
import { ProviderProfileSections } from '../ProviderProfileSections';
import { WalkerReviewsModal } from '../WalkerReviewsModal';
import { WALKER_REVIEWS, WALKER_RATING_BREAKDOWN } from '../../../data/walkerProfileData';
import type { Walker } from '@/types';

interface ProviderProfileDesktopLayoutProps {
  walker: Walker;
  onBack: () => void;
  onBookWalk: () => void;
  verifiedLabel: string;
}

export const ProviderProfileDesktopLayout: React.FC<ProviderProfileDesktopLayoutProps> = ({
  walker,
  onBack,
  onBookWalk,
  verifiedLabel,
}) => {
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  return (
    <div className="hidden md:flex h-full w-full min-h-0 flex-col overflow-hidden bg-background-secondary">
      <WalkerReviewsModal
        open={showAllReviews}
        onClose={() => setShowAllReviews(false)}
        walkerName={walker.name}
        walkerRating={walker.rating}
        totalReviews={walker.reviews}
        reviews={WALKER_REVIEWS}
        ratingBreakdown={WALKER_RATING_BREAKDOWN}
      />

      <div className="flex-1 min-h-0 w-full overflow-y-auto">
        <div className="w-full px-5 lg:px-8 xl:px-10 py-6">
          <div className="grid w-full gap-8 md:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] xl:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]">
            <div className="min-w-0 space-y-8">
              <ProviderProfileDesktopHeader
                walker={walker}
                isFavorite={isFavorite}
                onToggleFavorite={() => setIsFavorite((current) => !current)}
                onBack={onBack}
                verifiedLabel={verifiedLabel}
              />

              <ProviderProfileSections
                walker={walker}
                variant="desktop"
                onShowAllReviews={() => setShowAllReviews(true)}
                expandedReview={expandedReview}
                onToggleReview={setExpandedReview}
              />
            </div>

            <aside className="min-w-0 md:col-start-2 md:row-start-1">
              <ProviderProfileBookingPanel walker={walker} onBookWalk={onBookWalk} />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};
