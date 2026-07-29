import { forwardRef, type CSSProperties } from 'react'
import { Flame } from 'lucide-react'
import { formatMinutes } from '@/lib/utils'

export interface ShareSubjectStat {
  id: string
  name: string
  icon: string
  color: string
  minutes: number
}

interface Props {
  dateLabel: string
  streak: number
  totalMinutes: number
  subjects: ShareSubjectStat[]
  phrase: string
  // 'fixed' = exact 360x640px node used for the PNG export.
  // 'fluid' = fills its parent (the full-screen reveal), sized with
  // container-query units so it scales correctly at any viewport width.
  variant?: 'fixed' | 'fluid'
  // Desktop popup uses an outline flame instead of the solid mobile one.
  flameOutline?: boolean
  // 'gradient' = solid brand-purple card (in-app reveal, desktop popup).
  // 'transparent' = no fill at all — content floats on alpha, meant to be
  // laid over the user's own photo/story (mobile PNG export).
  background?: 'gradient' | 'transparent'
}

// Fixed pixel size — 9:16 story ratio — so html-to-image always exports the
// same crisp result regardless of how it's scaled for on-screen preview.
export const SHARE_CARD_WIDTH = 360
export const SHARE_CARD_HEIGHT = 640

export const ShareCard = forwardRef<HTMLDivElement, Props>(function ShareCard(
  { dateLabel, streak, totalMinutes, subjects, phrase, variant = 'fixed', flameOutline = false, background = 'gradient' },
  ref
) {
  const fluid = variant === 'fluid'
  const transparent = background === 'transparent'

  return (
    <div
      ref={ref}
      style={{
        width: fluid ? '100%' : SHARE_CARD_WIDTH,
        height: fluid ? '100%' : SHARE_CARD_HEIGHT,
        borderRadius: fluid ? 0 : 28,
        position: 'relative',
        overflow: 'hidden',
        background: transparent ? 'transparent' : 'linear-gradient(160deg, #6E5CF6 0%, #7D6CF8 45%, #9588F9 100%)',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: '#FFFFFF',
      }}
    >
      {/* Decorative glow circles — only make sense over the solid card;
          floating alone on a transparent PNG they'd just look like stray blobs. */}
      {!transparent && (
        <>
          <div style={{
            position: 'absolute', top: '-6%', right: '-12%', width: '55%', aspectRatio: 1,
            borderRadius: '50%', background: 'rgba(255,255,255,0.10)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-9%', left: '-15%', width: '60%', aspectRatio: 1,
            borderRadius: '50%', background: 'rgba(255,255,255,0.07)',
          }} />
        </>
      )}

      {/* Sizing container — capped width so cqw units stay stable on wide
          desktop screens instead of scaling off the full window. In
          transparent mode, text gets a soft shadow since it can no longer
          rely on the purple card for contrast against an arbitrary photo. */}
      <div style={{
        width: '100%', height: '100%', maxWidth: fluid ? 480 : SHARE_CARD_WIDTH,
        margin: '0 auto', containerType: 'inline-size',
        display: 'flex', flexDirection: 'column',
        padding: fluid ? 'clamp(24px, 7cqw, 48px) clamp(24px, 7cqw, 40px) clamp(20px, 5cqw, 32px)' : '32px 32px 26px',
        position: 'relative', zIndex: 1,
        textShadow: transparent ? '0 2px 16px rgba(0,0,0,0.45), 0 1px 4px rgba(0,0,0,0.35)' : undefined,
      } as CSSProperties}>

        {/* Header — extra right margin in fluid mode reserves room for the
            close button the reveal overlay draws on top of the card. */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginRight: fluid ? 'clamp(40px, 11cqw, 52px)' : 0,
        }}>
          <span style={{ fontSize: fluid ? 'clamp(13px, 3.6cqw, 16px)' : 13, fontWeight: 700, letterSpacing: '-0.1px', opacity: 0.92 }}>
            Chronos
          </span>
          <span style={{ fontSize: fluid ? 'clamp(10px, 2.6cqw, 12px)' : 11, fontWeight: 600, opacity: 0.68, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {dateLabel}
          </span>
        </div>

        {/* Top spacer — with the bottom spacer below, this keeps the hero
            block truly centered in the space between header and footer,
            instead of drifting up and leaving a gap above the pills. */}
        <div style={{ flex: 1 }} />

        {/* Hero — one natural-height group, so streak/time/phrase/pills sit
            close together rather than stretching to fill available space. */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 6, textAlign: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: fluid ? 'clamp(6px, 2.6cqw, 10px)' : 10 }}>
            <Flame
              size={fluid ? undefined : 40}
              style={{
                ...(fluid ? { width: 'clamp(30px, 10cqw, 40px)', height: 'clamp(30px, 10cqw, 40px)' } : undefined),
                filter: transparent ? 'drop-shadow(0 2px 10px rgba(0,0,0,0.4))' : undefined,
              }}
              color="#FFC24B"
              fill={flameOutline ? 'none' : '#FFC24B'}
              strokeWidth={flameOutline ? 2.2 : 0}
            />
            <span style={{ fontSize: fluid ? 'clamp(56px, 22cqw, 88px)' : 84, fontWeight: 800, letterSpacing: '-3px', lineHeight: 1 }}>
              {streak}
            </span>
          </div>
          <span style={{ fontSize: fluid ? 'clamp(13px, 3.6cqw, 15px)' : 14, fontWeight: 600, opacity: 0.82, marginBottom: fluid ? 'clamp(18px, 6cqw, 28px)' : 28 }}>
            {streak === 1 ? 'dia seguido de estudo' : 'dias seguidos de estudo'}
          </span>

          <span style={{ fontSize: fluid ? 'clamp(32px, 11cqw, 46px)' : 42, fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1 }}>
            {formatMinutes(totalMinutes)}
          </span>
          <span style={{ fontSize: fluid ? 'clamp(12px, 3.4cqw, 14px)' : 13, fontWeight: 600, opacity: 0.82, marginBottom: fluid ? 'clamp(20px, 6cqw, 30px)' : 0 }}>
            estudado hoje
          </span>

          {/* Motivational phrase */}
          <p style={{
            fontSize: fluid ? 'clamp(14px, 3.8cqw, 17px)' : 14,
            fontWeight: 500, fontStyle: 'italic', opacity: 0.88,
            lineHeight: 1.5, maxWidth: fluid ? '85%' : 260,
            marginTop: fluid ? 0 : 20, marginBottom: fluid ? 'clamp(20px, 6cqw, 30px)' : 20,
          }}>
            “{phrase}”
          </p>

          {/* Subject pills */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
            gap: fluid ? 'clamp(6px, 2cqw, 8px)' : 8,
          }}>
            {subjects.map(s => (
              <span key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: fluid ? 'clamp(5px, 1.8cqw, 7px) clamp(10px, 3cqw, 13px)' : '7px 13px',
                borderRadius: 99,
                background: transparent ? 'rgba(30,24,60,0.55)' : 'rgba(255,255,255,0.16)',
                border: transparent ? '1px solid rgba(255,255,255,0.18)' : undefined,
                fontSize: fluid ? 'clamp(11px, 3cqw, 12px)' : 12, fontWeight: 600,
              } as CSSProperties}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                {s.name}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom spacer */}
        <div style={{ flex: 1 }} />

        {/* Footer watermark */}
        <div style={{
          textAlign: 'center', fontSize: fluid ? 'clamp(9px, 2.4cqw, 10px)' : 10, fontWeight: 700, opacity: 0.55,
          letterSpacing: '0.14em', textTransform: 'uppercase',
        }}>
          chronos.app
        </div>
      </div>
    </div>
  )
})
