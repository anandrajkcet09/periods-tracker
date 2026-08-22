import React from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'outline' | 'blush' | 'sage';
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', interactive = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-slate-100 shadow-soft',
      flat: 'bg-slate-50/80 border border-slate-100',
      outline: 'bg-white border border-slate-200',
      blush: 'bg-blush-50/60 border border-blush-100/80 shadow-soft-sm',
      sage: 'bg-sage-50/60 border border-sage-100/80 shadow-soft-sm',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl p-5 transition-all duration-200',
          variants[variant],
          interactive && 'hover:shadow-soft-lg hover:-translate-y-0.5 cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
