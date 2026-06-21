import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variantStyles: Record<string, string> = {
  primary: 'text-white font-medium',
  secondary: 'text-[var(--text-primary)] font-medium',
  ghost: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
  danger: 'text-[#EF4444] font-medium',
}

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-5 py-2.5 text-sm rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, variant = 'secondary', size = 'md', loading, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 select-none',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          sizeStyles[size],
          variantStyles[variant],
          variant === 'primary' && 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-[0.97]',
          variant === 'secondary' && 'bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] border border-[var(--border)]',
          variant === 'ghost' && 'hover:bg-[var(--surface-hover)]',
          variant === 'danger' && 'bg-[rgba(239,68,68,0.1)] hover:bg-[rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.2)]',
          className
        )}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : null}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
