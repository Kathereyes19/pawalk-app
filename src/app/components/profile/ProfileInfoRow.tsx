import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ProfileInfoRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  placeholder?: string;
  onClick?: () => void;
  className?: string;
}

export const ProfileInfoRow: React.FC<ProfileInfoRowProps> = ({
  icon,
  label,
  value,
  placeholder = '—',
  onClick,
  className,
}) => {
  const displayValue = value?.trim() ? value : placeholder;
  const isInteractive = Boolean(onClick);

  const content = (
    <>
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
        {icon}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className={cn('text-sm font-medium truncate', !value?.trim() && 'text-muted-foreground')}>
          {displayValue}
        </p>
      </div>
      {isInteractive && (
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
      )}
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors',
          className
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-xl', className)}>
      {content}
    </div>
  );
};
