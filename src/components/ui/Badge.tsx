import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blush' | 'sage' | 'lavender' | 'slate' | 'coral' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'blush',
  size = 'md',
  icon,
  children,
  ...props
}) => {
  const variants = {
    blush: 'bg-blush-50 text-blush-700 border-blush-200/60',
    sage: 'bg-sage-50 text-sage-700 border-sage-200/60',
    lavender: 'bg-lavender-50 text-lavender-700 border-lavender-200/60',
    coral: 'bg-coral-50 text-coral-700 border-coral-200/60',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    outline: 'bg-white text-slate-600 border-slate-200',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border shrink-0 select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
