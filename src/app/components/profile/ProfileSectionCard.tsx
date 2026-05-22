import React from 'react';
import { Card } from '../Card';
import { cn } from '../../utils/cn';

interface ProfileSectionCardProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ProfileSectionCard: React.FC<ProfileSectionCardProps> = ({
  title,
  description,
  action,
  children,
  className,
}) => (
  <Card padding="none" className={cn('overflow-hidden', className)}>
    <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-2">
      <div>
        <h2 className="font-semibold text-base">{title}</h2>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {action}
    </div>
    <div className="px-2 pb-2">{children}</div>
  </Card>
);
