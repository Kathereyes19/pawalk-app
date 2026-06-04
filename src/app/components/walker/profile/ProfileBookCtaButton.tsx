import React from 'react';
import { Button } from '../../Button';
import { cn } from '../../../utils/cn';

type ProfileBookCtaButtonProps = React.ComponentProps<typeof Button> & {
  /** Subtle frame around CTA in booking panel (desktop sidebar) */
  emphasisFrame?: boolean;
};

const PROFILE_BOOK_CTA_STYLES = cn(
  'min-h-[52px] text-base font-bold tracking-tight',
  'bg-primary text-primary-foreground',
  'shadow-lg shadow-primary/35',
  'hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/40',
  'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  'active:bg-primary-hover active:shadow-md',
  'disabled:opacity-100 disabled:cursor-not-allowed',
  'disabled:bg-primary/55 disabled:text-white disabled:shadow-sm'
);

export const ProfileBookCtaButton: React.FC<ProfileBookCtaButtonProps> = ({
  className,
  variant = 'primary',
  size = 'xl',
  fullWidth = true,
  emphasisFrame = true,
  children,
  ...props
}) => {
  const button = (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      className={cn(PROFILE_BOOK_CTA_STYLES, className)}
      {...props}
    >
      {children}
    </Button>
  );

  if (!emphasisFrame) {
    return button;
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/[0.07] to-transparent p-3 -mx-1">
      {button}
    </div>
  );
};
