import { cn } from '@/src/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: ReactNode;
  subtitle?: string;
}

export function Card({ children, className, title, icon, subtitle }: CardProps) {
  return (
    <div className={cn("bg-surface-high border border-outline-variant rounded-xl overflow-hidden", className)}>
      {(title || icon) && (
        <div className="px-5 py-4 border-b border-outline-variant flex items-center justify-between">
          <div>
            <h3 className="font-headline text-lg font-semibold text-on-surface">{title}</h3>
            {subtitle && <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">{subtitle}</p>}
          </div>
          {icon && <div className="text-primary-container">{icon}</div>}
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
  onClick?: () => void;
  fullWidth?: boolean;
}

export function Button({ children, variant = 'primary', className, onClick, fullWidth }: ButtonProps) {
  const variants = {
    primary: "bg-primary-container text-on-primary-container hover:bg-opacity-90 shadow-sm",
    secondary: "bg-surface-highest text-on-surface hover:bg-surface-bright border border-outline-variant",
    outline: "bg-transparent border border-outline-variant text-on-surface hover:bg-surface-highest",
    ghost: "bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-highest",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "px-6 py-2.5 rounded-lg font-headline font-semibold transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50",
        fullWidth && "w-full",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}
