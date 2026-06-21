import { BottomNav } from '@/components/nav/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <main className="pb-nav">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
