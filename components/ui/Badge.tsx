import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'accent' | 'muted'
  className?: string
}

const variantStyles: Record<string, string> = {
  default: 'bg-[var(--surface-active)] text-[var(--text-secondary)]',
  success: 'bg-[rgba(16,185,129,0.12)] text-[#10B981]',
  warning: 'bg-[rgba(245,158,11,0.12)] text-[#F59E0B]',
  danger: 'bg-[rgba(239,68,68,0.12)] text-[#EF4444]',
  accent: 'bg-[var(--accent-subtle)] text-[var(--accent)]',
  muted: 'bg-[var(--surface)] text-[var(--text-tertiary)]',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
