'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Home, Sun, Repeat2, CheckSquare, Calendar } from 'lucide-react'

const NAV = [
  { href: '/home',    icon: Home,        label: 'Home' },
  { href: '/hoje',    icon: Sun,         label: 'Hoje' },
  { href: '/habitos', icon: Repeat2,     label: 'Hábitos' },
  { href: '/tarefas', icon: CheckSquare, label: 'Tarefas' },
  { href: '/agenda',  icon: Calendar,    label: 'Agenda' },
]

export function BottomNav() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true)
  const lastY = useRef(0)

  useEffect(() => {
    const el = document.querySelector('main') ?? window
    const handler = () => {
      const y = el instanceof Window ? el.scrollY : (el as Element).scrollTop
      if (y < 40) { setVisible(true); lastY.current = y; return }
      setVisible(y < lastY.current)
      lastY.current = y
    }
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 36 }}
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)', pointerEvents: 'none' }}
        >
          <nav
            className="glass flex items-center px-2 py-1.5"
            style={{
              borderRadius: 999,
              boxShadow: 'var(--shadow-lg)',
              pointerEvents: 'all',
              gap: 2,
            }}
          >
            {NAV.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link key={href} href={href} className="relative flex flex-col items-center justify-center px-4 py-2 rounded-[999px] transition-colors" style={{ minWidth: 56 }}>
                  {active && (
                    <motion.div
                      layoutId="nav-bg"
                      className="absolute inset-0 rounded-[999px]"
                      style={{ background: 'var(--accent-2)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <motion.div
                    animate={{ scale: active ? 1 : 0.92 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    className="relative z-10 flex flex-col items-center gap-1"
                  >
                    <Icon
                      size={19}
                      strokeWidth={active ? 2 : 1.6}
                      style={{ color: active ? 'var(--accent)' : 'var(--t3)' }}
                    />
                    <span
                      className="text-[9px] font-medium tracking-wide"
                      style={{ color: active ? 'var(--accent)' : 'var(--t4)' }}
                    >
                      {label}
                    </span>
                  </motion.div>
                </Link>
              )
            })}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
