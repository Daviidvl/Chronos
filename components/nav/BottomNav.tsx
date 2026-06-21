'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sun, Repeat2, CalendarDays, Settings } from 'lucide-react'

const ITEMS = [
  { href: '/hoje',          Icon: Sun,          label: 'Hoje' },
  { href: '/habitos',       Icon: Repeat2,      label: 'Hábitos' },
  { href: '/semana',        Icon: CalendarDays, label: 'Semana' },
  { href: '/configuracoes', Icon: Settings,     label: 'Config' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {ITEMS.map(({ href, Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`nav-item${active ? ' nav-item--active' : ''}`}
            >
              {active && (
                <motion.div
                  layoutId="nav-highlight"
                  className="nav-active-bg"
                  transition={{ type: 'spring', stiffness: 420, damping: 40 }}
                />
              )}
              <Icon
                size={21}
                strokeWidth={active ? 2.3 : 1.7}
                style={{ position: 'relative', zIndex: 1 }}
              />
              <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
