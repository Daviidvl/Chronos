import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
  style?: React.CSSProperties
}

export function Card({ children, className, onClick, hover, style }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl',
        hover && 'cursor-pointer transition-all duration-150 hover:border-[var(--border-strong)]',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between px-4 pt-4 pb-3', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-sm font-semibold text-[var(--text-primary)] tracking-[-0.01em]', className)}>
      {children}
    </h3>
  )
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-4 pb-4', className)}>{children}</div>
}
