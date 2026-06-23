import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Repeat2, AlarmClock, Settings, BookOpen } from 'lucide-react'
import { useModal } from '@/lib/modal-context'

const ITEMS = [
  { href: '/hoje',          Icon: Sun,        label: 'Hoje' },
  { href: '/habitos',       Icon: Repeat2,    label: 'Hábitos' },
  { href: '/estudos',       Icon: BookOpen,   label: 'Estudos' },
  { href: '/rotina',        Icon: AlarmClock, label: 'Rotina' },
  { href: '/configuracoes', Icon: Settings,   label: 'Config' },
]

export function BottomNav() {
  const { pathname } = useLocation()
  const { isOpen }   = useModal()

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.nav
          className="bottom-nav"
          initial={{ y: 0 }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        >
          <div className="bottom-nav-inner">
            {ITEMS.map(({ href, Icon, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  to={href}
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
                    size={20}
                    strokeWidth={active ? 2.3 : 1.7}
                    style={{ position: 'relative', zIndex: 1 }}
                  />
                  <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
                </Link>
              )
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
