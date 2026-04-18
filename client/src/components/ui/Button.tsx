import React from 'react';
import { cn } from '../../lib/utils';


interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
          {
            'bg-foreground text-background hover:bg-foreground/90': variant === 'primary', // Dark button (black)
            'bg-primary text-foreground hover:bg-primary/90': variant === 'secondary', // Lime green button
            'border border-foreground bg-transparent hover:bg-foreground hover:text-background': variant === 'outline', // Outline dark button
            'h-10 px-4 py-2 text-sm': size === 'default',
            'h-9 rounded-lg px-3': size === 'sm',
            'h-14 rounded-2xl px-8 text-xl': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
