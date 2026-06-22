import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Layers, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const email    = `${username.trim().toLowerCase()}@chronos.app`
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Utilizador ou senha incorretos.')
      setLoading(false)
      return
    }

    navigate('/hoje', { replace: true })
  }

  return (
    <div className="login-wrap">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="login-card"
      >
        {/* Brand */}
        <div className="login-logo">
          <Layers size={28} strokeWidth={1.8} />
        </div>

        <h1 className="login-title">Chronos</h1>
        <p className="login-sub">Organize o seu dia com clareza</p>

        <form onSubmit={handleLogin}>
          {/* Username */}
          <div className="form-group">
            <label className="form-label">Utilizador</label>
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              placeholder="Devpereira"
              autoComplete="username"
              autoFocus
              className="field"
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Senha</label>
            <div className="field-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                autoComplete="current-password"
                className="field field--with-action"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="field-action"
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="login-error"
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="login-submit">
            <button
              type="submit"
              disabled={loading || !username.trim() || !password.trim()}
              className="btn btn-brand"
            >
              {loading ? 'A entrar...' : 'Entrar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
