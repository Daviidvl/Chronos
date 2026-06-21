'use client'

import { Sidebar, MobileSidebar } from '@/components/layout/Sidebar'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const PAGE_TITLES: Record<string, string> = {
  '/today': 'Hoje',
  '/calendar': 'Agenda',
  '/tasks': 'Tarefas',
  '/habits': 'Hábitos',
  '/goals': 'Metas',
  '/journal': 'Diário',
  '/insights': 'Insights',
  '/analytics': 'Analytics',
  '/settings': 'Configurações',
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? 'Chronos'

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header
          className="md:hidden flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}
        >
          <MobileSidebar />
          <span className="text-sm font-semibold text-[var(--text-primary)]">{title}</span>
          <div className="w-8" />
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-base)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
