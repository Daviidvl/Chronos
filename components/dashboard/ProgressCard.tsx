import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

interface Props {
  completed: number
  total: number
  percentage: number
}

export function ProgressCard({ completed, total, percentage }: Props) {
  if (total === 0) return null

  const remaining = total - completed
  const allDone = remaining === 0

  return (
    <div className="progress-big">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#9BA5B4', marginBottom: 4 }}>
            Hoje
          </p>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#121826' }}>
            {completed} de {total} {total === 1 ? 'item' : 'itens'}
          </p>
        </div>

        <span
          className="progress-big-pct"
          style={{ color: allDone ? '#2CC08C' : '#6E5CF6' }}
        >
          {percentage}%
        </span>
      </div>

      <div className="progress-big-track">
        <motion.div
          className={`progress-big-fill${allDone ? ' progress-big-fill--done' : ''}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <p style={{ fontSize: 13, color: allDone ? '#2CC08C' : '#9BA5B4', display: 'flex', alignItems: 'center', gap: 5 }}>
        {allDone && <CheckCircle2 size={13} strokeWidth={2.5} />}
        {allDone
          ? 'Tudo concluído. Excelente dia!'
          : `Restam ${remaining} ${remaining === 1 ? 'atividade' : 'atividades'}`}
      </p>
    </div>
  )
}
