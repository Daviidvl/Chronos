import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { ShareCard } from './ShareCard'
import type { ShareSubjectStat } from './ShareCard'
import { useShareExport } from '@/lib/use-share-export'
import { useIsDesktop } from '@/lib/use-is-desktop'

export type { ShareSubjectStat } from './ShareCard'

interface Props {
  dateLabel: string
  streak: number
  totalMinutes: number
  subjects: ShareSubjectStat[]
  phrase: string
  onClose: () => void
}

export function ShareReveal(props: Props) {
  const isDesktop = useIsDesktop()
  return isDesktop ? <ShareRevealDesktop {...props} /> : <ShareRevealMobile {...props} />
}

// ---------- Mobile: full-screen poster, meant to be screenshotted or
// exported straight to the OS share sheet (Instagram/WhatsApp story). ----------
function ShareRevealMobile({ dateLabel, streak, totalMinutes, subjects, phrase, onClose }: Props) {
  const { cardRef, sharing, download } = useShareExport(`chronos-${dateLabel}.png`)

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'fixed', inset: 0, zIndex: 60 }}
    >
      {/* The card itself is purely visual — nothing inside it is
          interactive — so it must never be able to steal clicks meant
          for the close/download buttons drawn on top of it. */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <ShareCard variant="fluid" dateLabel={dateLabel} streak={streak} totalMinutes={totalMinutes} subjects={subjects} phrase={phrase} />
      </div>

      <button
        onClick={onClose}
        aria-label="Fechar"
        style={{
          position: 'absolute', top: 'max(20px, env(safe-area-inset-top, 0px))', right: 20,
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.16)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer',
        }}
      >
        <X size={16} strokeWidth={2.5} />
      </button>

      <button
        onClick={download}
        disabled={sharing}
        style={{
          position: 'absolute', bottom: 'max(16px, env(safe-area-inset-bottom, 0px))', right: 20,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600,
          fontFamily: 'inherit', padding: '8px 4px',
        }}
      >
        {sharing ? 'A preparar…' : 'Baixar imagem'}
      </button>

      {/* True-size node kept off-screen — captured for export at a fixed,
          predictable resolution instead of whatever the viewport happens to be.
          Transparent background so the exported PNG can be laid over the
          user's own photo/story, unlike the solid card shown on screen. */}
      <div style={{ position: 'fixed', top: 0, left: -9999, pointerEvents: 'none' }} aria-hidden>
        <ShareCard ref={cardRef} dateLabel={dateLabel} streak={streak} totalMinutes={totalMinutes} subjects={subjects} phrase={phrase} background="transparent" />
      </div>
    </motion.div>
  )
}

// ---------- Desktop: a proper dialog — dimmed backdrop, the poster
// floating as a self-contained card instead of taking over the window. ----------
function ShareRevealDesktop({ dateLabel, streak, totalMinutes, subjects, phrase, onClose }: Props) {
  const { cardRef, sharing, download } = useShareExport(`chronos-${dateLabel}.png`)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(10, 8, 20, 0.72)',
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        style={{ position: 'relative', width: 360, boxShadow: '0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)', borderRadius: 28 }}
      >
        <ShareCard ref={cardRef} dateLabel={dateLabel} streak={streak} totalMinutes={totalMinutes} subjects={subjects} phrase={phrase} flameOutline />

        <button
          onClick={onClose}
          aria-label="Fechar"
          style={{
            position: 'absolute', top: -14, right: -14,
            width: 32, height: 32, borderRadius: '50%',
            background: '#FFFFFF', color: '#121826',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          }}
        >
          <X size={15} strokeWidth={2.5} />
        </button>
      </motion.div>

      <button
        onClick={e => { e.stopPropagation(); download() }}
        disabled={sharing}
        className="btn btn-brand"
        style={{
          position: 'absolute', bottom: 48, left: '50%', transform: 'translateX(-50%)',
          width: 'auto', padding: '0 24px', minHeight: 44,
        }}
      >
        {sharing ? 'A preparar…' : 'Baixar imagem'}
      </button>
    </motion.div>
  )
}
