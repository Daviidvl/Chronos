import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { greeting } from '@/lib/utils'

const QUOTES = [
  'Pequenos hábitos constroem grandes resultados.',
  'Consistência é o caminho para a excelência.',
  'Cada dia é uma nova oportunidade de crescer.',
  'O progresso, não a perfeição, é o objetivo.',
  'Disciplina é a ponte entre objetivos e conquistas.',
  'Comece de onde você está. Use o que você tem.',
  'A melhor hora para agir é agora.',
  'Hábitos diários definem quem você se torna.',
  'Foco no processo, não no resultado.',
  'Cada pequeno passo conta.',
  'Sua rotina é sua força.',
  'A constância vence o talento.',
]

interface Props {
  percentage: number
  completed: number
  total: number
  name?: string
}

export function MotivationCard({ percentage, completed, total, name }: Props) {
  const quote = useMemo(() => {
    const idx = new Date().getDate() % QUOTES.length
    return QUOTES[idx]
  }, [])

  const allDone = total > 0 && completed === total

  return (
    <motion.div
      className="motivation-card"
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="motivation-inner">
        <p className="motivation-greeting">
          {greeting()}
        </p>

        <p className="motivation-name">
          {name ? `${name}` : 'Vamos lá'}
        </p>

        <p className="motivation-quote">"{quote}"</p>

        <div className="motivation-pct-row">
          <span className="motivation-pct">
            {allDone ? '100' : percentage}%
          </span>
          <span className="motivation-pct-label">
            {allDone ? 'concluído' : 'concluído'}
          </span>
        </div>

        <div className="motivation-bar">
          <motion.div
            className="motivation-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          />
        </div>

        {total > 0 && (
          <p className="motivation-sub">
            {completed} de {total} {total === 1 ? 'item' : 'itens'} concluídos
          </p>
        )}
      </div>
    </motion.div>
  )
}
