import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { greeting, formatMinutes } from '@/lib/utils'
import { CheckCircle2 } from 'lucide-react'

const QUOTES = [
  'Estudar hoje é investir no seu futuro.',
  'Cada página lida é um passo à frente.',
  'Conhecimento é a única riqueza que ninguém tira de você.',
  'Aprender é a habilidade mais importante do século.',
  'A mente que se abre nunca volta ao tamanho original.',
  'Consistência no estudo cria excelência.',
  'Quem estuda hoje não improvisa amanhã.',
  'Um pouco por dia leva muito longe.',
  'A prática supera o talento quando o talento não pratica.',
  'Foque no progresso, não na perfeição.',
]

interface Props {
  todayMinutes: number
  goalMinutes: number
}

export function StudyHeader({ todayMinutes, goalMinutes }: Props) {
  const quote = useMemo(() => {
    const idx = (new Date().getDate() + 5) % QUOTES.length
    return QUOTES[idx]
  }, [])

  const pct     = goalMinutes > 0 ? Math.min(100, Math.round((todayMinutes / goalMinutes) * 100)) : 0
  const goalMet = todayMinutes >= goalMinutes && goalMinutes > 0

  return (
    <motion.div
      className="study-header-card"
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="motivation-inner">
        <p className="motivation-greeting">{greeting()}</p>
        <p className="motivation-name">Hora de estudar</p>
        <p className="motivation-quote">"{quote}"</p>

        <div className="motivation-pct-row">
          <span className="motivation-pct">
            {formatMinutes(todayMinutes)}
          </span>
          <span className="motivation-pct-label">
            / {formatMinutes(goalMinutes)}
          </span>
        </div>

        <div className="motivation-bar">
          <motion.div
            className="motivation-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          />
        </div>

        <p className="motivation-sub" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {goalMet && <CheckCircle2 size={12} strokeWidth={2.5} />}
          {goalMet ? 'Meta diária atingida!' : `${pct}% da meta diária`}
        </p>
      </div>
    </motion.div>
  )
}
