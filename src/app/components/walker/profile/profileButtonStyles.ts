/** Shared Pawalk pill/chip styles for desktop provider profile controls */
export const PROFILE_FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

export const PROFILE_CHIP_BASE = `min-h-11 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all ${PROFILE_FOCUS_RING}`;

export const PROFILE_CHIP_SELECTED =
  'border-primary bg-primary text-primary-foreground shadow-md scale-[1.02]';

export const PROFILE_CHIP_DEFAULT =
  'border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/60';

export const PROFILE_CHIP_DISABLED = 'cursor-not-allowed opacity-40';

export const PROFILE_SLOT_BASE = `relative min-h-12 rounded-2xl border px-2 py-2 text-sm font-semibold transition-all ${PROFILE_FOCUS_RING}`;

export const PROFILE_SLOT_SELECTED =
  'border-primary bg-primary text-primary-foreground shadow-md scale-[1.02]';

export const PROFILE_SLOT_DEFAULT =
  'border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/60';

export const PROFILE_DATE_CARD_BASE = `relative min-h-16 rounded-2xl border px-1 py-2 text-center transition-all ${PROFILE_FOCUS_RING}`;

export const PROFILE_DATE_CARD_SELECTED = 'border-primary bg-primary text-primary-foreground shadow-md';

export const PROFILE_DATE_CARD_DEFAULT =
  'border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/60';

export const PROFILE_SECONDARY_BUTTON = `w-full min-h-11 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:border-primary/40 hover:bg-primary/5 ${PROFILE_FOCUS_RING}`;
