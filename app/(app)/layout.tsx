import { BottomNav } from '@/components/nav/BottomNav'
import { ModalProvider } from '@/lib/modal-context'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      <div className="min-h-screen" style={{ background: 'var(--color-canvas)' }}>
        <main className="pb-nav">
          {children}
        </main>
        <BottomNav />
      </div>
    </ModalProvider>
  )
}
