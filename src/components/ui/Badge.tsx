import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blush' | 'sage' | 'lavender' | 'slate' | 'coral' | 'outline' | 'sky' | 'purple' | 'amber';
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
    blush: 'bg-rose-50 text-rose-700 border-rose-200/80',
    sage: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    lavender: 'bg-purple-50 text-purple-700 border-purple-200/80',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
    sky: 'bg-sky-50 text-sky-700 border-sky-200/80',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
    coral: 'bg-rose-50 text-rose-700 border-rose-200/80',
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
