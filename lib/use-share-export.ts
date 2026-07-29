import { useRef, useState } from 'react'
import { shareOrDownloadNode } from './share-image'

export function useShareExport(filename: string) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [sharing, setSharing] = useState(false)

  const download = async () => {
    if (!cardRef.current || sharing) return
    setSharing(true)
    try {
      await shareOrDownloadNode(cardRef.current, filename)
    } finally {
      setSharing(false)
    }
  }

  return { cardRef, sharing, download }
}
