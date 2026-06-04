import React, { useState } from 'react';
import { ProviderProfileDesktopHeader } from './ProviderProfileDesktopHeader';
import { ProviderProfileBookingPanel } from './ProviderProfileBookingPanel';
import { DesktopBookingConfirmModal } from './DesktopBookingConfirmModal';
import { ProviderProfileSections } from '../ProviderProfileSections';
import { WalkerReviewsModal } from '../WalkerReviewsModal';
import { WALKER_REVIEWS, WALKER_RATING_BREAKDOWN } from '../../../data/walkerProfileData';
import type { BookingData, CheckoutPaymentSelection, Pet, Walker } from '@/types';

interface ProviderProfileDesktopLayoutProps {
  walker: Walker;
  pets: Pet[];
  onBack: () => void;
  onProfileCheckoutConfirm: (
    bookingData: BookingData,
    selection: CheckoutPaymentSelection
  ) => Promise<{ error: string | null }>;
  verifiedLabel: string;
}

export const ProviderProfileDesktopLayout: React.FC<ProviderProfileDesktopLayoutProps> = ({
  walker,
  pets,
  onBack,
  onProfileCheckoutConfirm,
  verifiedLabel,
}) => {
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<BookingData | null>(null);

  const handleReserve = (bookingData: BookingData) => {
    setPendingBooking(bookingData);
    setConfirmOpen(true);
  };

  const handleConfirm = async (selection: CheckoutPaymentSelection) => {
    if (!pendingBooking) {
      return { error: 'No hay datos de reserva disponibles.' };
    }
    const result = await onProfileCheckoutConfirm(pendingBooking, selection);
    if (!result.error) {
      setConfirmOpen(false);
      setPendingBooking(null);
    }
    return result;
  };

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

      <DesktopBookingConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        walker={walker}
        bookingData={pendingBooking}
        onConfirm={handleConfirm}
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
              <ProviderProfileBookingPanel
                walker={walker}
                pets={pets}
                onReserve={handleReserve}
              />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};
