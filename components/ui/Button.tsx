'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
    const variants = {
      primary:   'bg-[var(--accent)] text-white hover:opacity-90 active:scale-[0.97]',
      secondary: 'bg-[var(--surface-hover)] text-[var(--text-2)] border border-[var(--border)] hover:bg-[var(--surface-high)] hover:text-[var(--text-1)]',
      ghost:     'text-[var(--text-3)] hover:text-[var(--text-2)] hover:bg-[var(--surface-hover)]',
      danger:    'bg-[var(--danger-dim)] text-[var(--danger)] border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.18)]',
    }
    const sizes = {
      sm:   'h-8  px-3  text-[13px] rounded-[10px]',
      md:   'h-10 px-4  text-[14px] rounded-[12px]',
      lg:   'h-11 px-5  text-[14px] rounded-[14px]',
      icon: 'h-9  w-9             rounded-[12px]',
    }
    return (
      <motion.button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled}
        whileTap={!disabled ? { scale: 0.97 } : undefined}
        {...(props as any)}
      >
        {children}
      </motion.button>
    )
  }
)
Button.displayName = 'Button'
