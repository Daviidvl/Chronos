'use client'

import { cn } from '@/lib/utils'
import { motion, HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'elevated' | 'ghost'
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, padding = 'md', children, ...props }, ref) => {
    const base = 'rounded-[24px] transition-colors duration-150'
    const variants = {
      default:  'bg-[var(--surface)] border border-[var(--border)]',
      elevated: 'bg-[var(--surface-high)] border border-[var(--border)]',
      ghost:    'bg-transparent border border-[var(--border)]',
    }
    const paddings = {
      none: '',
      sm:   'p-4',
      md:   'p-5',
      lg:   'p-6',
    }
    return (
      <motion.div
        ref={ref}
        className={cn(base, variants[variant], paddings[padding], hover && 'hover:bg-[var(--surface-hover)] cursor-pointer', className)}
        style={{ boxShadow: 'var(--shadow-card)', ...props.style }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
Card.displayName = 'Card'
