import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../utils/cn';

interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
  showClear?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  className,
  value,
  onClear,
  showClear = true,
  ...props
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
      <input
        type="search"
        className={cn(
          'w-full h-12 pl-12 pr-12 rounded-xl',
          'bg-card border border-border',
          'text-base text-foreground placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
          'transition-all duration-200',
          'shadow-sm',
          className
        )}
        value={value}
        {...props}
      />
      {showClear && value && (
        <button
          onClick={onClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
};
