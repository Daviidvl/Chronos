'use client'

import { Sidebar } from '@/components/nav/Sidebar'
import { BottomNav } from '@/components/nav/BottomNav'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <div className="flex-1 min-w-0 h-full overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="h-full overflow-y-auto"
            style={{ background: 'var(--bg)' }}
          >
            {children}
            {/* mobile bottom padding */}
            <div className="h-24 md:hidden" />
          </motion.main>
        </AnimatePresence>
      </div>
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
