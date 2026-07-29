import { toPng } from 'html-to-image'

async function nodeToPngBlob(node: HTMLElement): Promise<Blob> {
  const dataUrl = await toPng(node, { pixelRatio: 3, backgroundColor: undefined, cacheBust: true })
  const res = await fetch(dataUrl)
  return res.blob()
}

// Tries the native share sheet (best on mobile — drops straight into
// Instagram/WhatsApp story composer); falls back to a plain download.
export async function shareOrDownloadNode(node: HTMLElement, filename: string): Promise<void> {
  const blob = await nodeToPngBlob(node)
  const file = new File([blob], filename, { type: 'image/png' })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
