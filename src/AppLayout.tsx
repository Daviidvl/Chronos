import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { ModalProvider } from '../lib/modal-context'
import { BottomNav }    from '../components/nav/BottomNav'
import { createClient } from '../lib/supabase/client'

export function AppLayout() {
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session) navigate('/login', { replace: true })
      setLoading(false)
    }).catch(() => {
      navigate('/login', { replace: true })
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) navigate('/login', { replace: true })
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100dvh', background: '#F7F8FC',
      }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <ModalProvider>
      <div style={{ minHeight: '100dvh', background: 'var(--color-canvas)' }}>
        <main className="pb-nav">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </ModalProvider>
  )
}
