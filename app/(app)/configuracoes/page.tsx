import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, LogOut, Trash2, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useNavigate } from 'react-router-dom'
import { DEFAULT_CATEGORIES } from '@/lib/utils'
import type { Category } from '@/types'

const PALETTE = [
  '#6E5CF6', '#2CC08C', '#F79009', '#F04438',
  '#8B5CF6', '#EC4899', '#0EA5E9', '#14B8A6',
]

export default function ConfigPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [userId, setUserId]         = useState('')
  const [newName, setNewName]       = useState('')
  const [newColor, setNewColor]     = useState(PALETTE[0])
  const [showAdd, setShowAdd]       = useState(false)
  const [saving, setSaving]         = useState(false)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    const { data } = await supabase
      .from('categories').select('*').eq('user_id', user.id).order('name')
    setCategories((data as Category[]) ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('categories')
      .insert({ user_id: userId, name: newName.trim(), color: newColor })
      .select().single()
    if (data) setCategories(cs => [...cs, data as Category])
    setNewName('')
    setShowAdd(false)
    setSaving(false)
  }

  const deleteCategory = async (id: string) => {
    setCategories(cs => cs.filter(c => c.id !== id))
    const supabase = createClient()
    await supabase.from('categories').delete().eq('id', id)
  }

  const seedCategories = async () => {
    const supabase = createClient()
    const toInsert = DEFAULT_CATEGORIES.map(c => ({ ...c, user_id: userId }))
    const { data } = await supabase.from('categories').insert(toInsert).select()
    if (data) setCategories(cs => [...cs, ...(data as Category[])])
  }

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="page">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 40 }}
      >
        <h1 className="t-display">Configurações</h1>
      </motion.header>

      {/* ── Categories ── */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{ marginBottom: 40 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <p className="t-label">Categorias</p>
          <button
            onClick={() => setShowAdd(v => !v)}
            className="btn-text"
          >
            <Plus size={13} strokeWidth={2.5} />
            Adicionar
          </button>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          {/* Add form */}
          <AnimatePresence>
            {showAdd && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <form
                  onSubmit={addCategory}
                  style={{ padding: '20px 18px', borderBottom: '1px solid var(--bdr)' }}
                >
                  <div style={{ marginBottom: 14 }}>
                    <input
                      autoFocus
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder="Nome da categoria"
                      className="field field-sm"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                    {PALETTE.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewColor(c)}
                        className={`color-swatch${newColor === c ? ' color-swatch--active' : ''}`}
                        style={{ background: c, outlineColor: c, width: 28, height: 28 }}
                      />
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setShowAdd(false)}
                      className="btn btn-ghost"
                      style={{ flex: 1, minHeight: 44 }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!newName.trim() || saving}
                      className="btn btn-brand"
                      style={{ flex: 1, minHeight: 44 }}
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty */}
          {categories.length === 0 && !showAdd && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div
                className="empty-icon"
                style={{ margin: '0 auto 14px', background: 'rgba(110,92,246,0.08)', color: '#6E5CF6' }}
              >
                <Tag size={22} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#6E7787', marginBottom: 8 }}>
                Nenhuma categoria
              </p>
              <button onClick={seedCategories} className="btn-text">
                Usar categorias padrão
              </button>
            </div>
          )}

          {/* List */}
          {categories.map(cat => (
            <div key={cat.id} className="list-row">
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: '#121826' }}>
                {cat.name}
              </span>
              <button onClick={() => deleteCategory(cat.id)} className="btn-icon danger">
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {categories.length > 0 && (
            <div style={{ padding: '12px 18px', borderTop: '1px solid var(--bdr)' }}>
              <button onClick={seedCategories} className="btn-text" style={{ fontSize: 12 }}>
                + Adicionar categorias padrão
              </button>
            </div>
          )}
        </div>
      </motion.section>

      {/* ── Account ── */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p className="t-label" style={{ marginBottom: 14 }}>Conta</p>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="list-row">
            <span style={{ flex: 1, fontSize: 15, color: '#6E7787' }}>Versão</span>
            <span
              className="badge"
              style={{ background: '#F2F4FA', color: '#9BA5B4', fontSize: 12, fontWeight: 500 }}
            >
              1.0.0
            </span>
          </div>

          <button
            onClick={logout}
            className="list-row"
            style={{
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              fontFamily: 'inherit',
              color: '#F04438',
              fontSize: 15,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              transition: 'background 0.14s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(240,68,56,0.05)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut size={16} />
            Sair da conta
          </button>
        </div>
      </motion.section>
    </div>
  )
}
