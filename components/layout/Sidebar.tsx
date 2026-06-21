'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sun, Calendar, CheckSquare, Target, Repeat, BookOpen,
  BarChart2, Lightbulb, Settings, Zap, ChevronRight, X, Menu,
} from 'lucide-react'
import { useState } from 'react'
import { useUserStore } from '@/lib/store/useUserStore'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/today', icon: Sun, label: 'Hoje' },
  { href: '/calendar', icon: Calendar, label: 'Agenda' },
  { href: '/tasks', icon: CheckSquare, label: 'Tarefas' },
  { href: '/habits', icon: Repeat, label: 'Hábitos' },
  { href: '/goals', icon: Target, label: 'Metas' },
  { href: '/journal', icon: BookOpen, label: 'Diário' },
  { href: '/insights', icon: Lightbulb, label: 'Insights' },
  { href: '/analytics', icon: BarChart2, label: 'Analytics' },
]

function NavItem({ href, icon: Icon, label, active }: {
  href: string; icon: typeof Sun; label: string; active: boolean
}) {
  return (
    <Link href={href} className="block">
      <div
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 group',
          active
            ? 'bg-[var(--surface-active)] text-[var(--text-primary)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
        )}
      >
        <div className={cn(
          'w-6 h-6 flex items-center justify-center flex-shrink-0',
          active && 'text-[var(--accent)]'
        )}>
          <Icon size={16} strokeWidth={active ? 2.5 : 2} />
        </div>
        <span className={cn(
          'text-sm font-medium tracking-[-0.01em]',
          active ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
        )}>
          {label}
        </span>
        {active && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
        )}
      </div>
    </Link>
  )
}

function LevelBadge() {
  const { getLevelInfo } = useUserStore()
  const level = getLevelInfo()

  return (
    <div className="px-3 py-2 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap size={13} className="text-[var(--warning)]" />
          <span className="text-xs font-semibold text-[var(--text-primary)]">Nível {level.level}</span>
        </div>
        <span className="text-xs text-[var(--text-tertiary)]">{level.title}</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface-active)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, var(--accent), #8B5CF6)' }}
          initial={{ width: 0 }}
          animate={{ width: `${level.progress}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[11px] text-[var(--text-tertiary)]">{level.xpToNext} XP para nível {level.level + 1}</span>
      </div>
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="hidden md:flex flex-col h-full"
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--bg-elevated)',
        borderRight: '1px solid var(--border)',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 mb-1">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, var(--accent), #8B5CF6)' }}
        >
          C
        </div>
        <span className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">Chronos</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={pathname === item.href || pathname.startsWith(item.href + '/')}
          />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-3">
        <LevelBadge />
        <Link href="/settings">
          <div className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-150',
            pathname === '/settings'
              ? 'bg-[var(--surface-active)] text-[var(--text-primary)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
          )}>
            <Settings size={16} />
            <span className="text-sm font-medium">Configurações</span>
          </div>
        </Link>
      </div>
    </aside>
  )
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
      >
        <Menu size={20} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.7)' }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-0 top-0 bottom-0 z-50 flex flex-col"
              style={{
                width: '260px',
                background: 'var(--bg-elevated)',
                borderRight: '1px solid var(--border)',
              }}
            >
              <div className="flex items-center justify-between px-4 py-5">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg, var(--accent), #8B5CF6)' }}
                  >
                    C
                  </div>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">Chronos</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
                {NAV_ITEMS.map(item => (
                  <div key={item.href} onClick={() => setOpen(false)}>
                    <NavItem
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      active={pathname === item.href}
                    />
                  </div>
                ))}
              </nav>

              <div className="px-3 pb-4 space-y-3">
                <LevelBadge />
                <div onClick={() => setOpen(false)}>
                  <Link href="/settings">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors">
                      <Settings size={16} />
                      <span className="text-sm font-medium">Configurações</span>
                    </div>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
