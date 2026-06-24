import { createContext, useContext, useState, useCallback } from 'react'

type ModalContextType = {
  isOpen: boolean
  open: () => void
  close: () => void
}

const ModalContext = createContext<ModalContextType>({
  isOpen: false,
  open:  () => {},
  close: () => {},
})

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const open  = useCallback(() => setIsOpen(true),  [])
  const close = useCallback(() => setIsOpen(false), [])
  return (
    <ModalContext.Provider value={{ isOpen, open, close }}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModal() {
  return useContext(ModalContext)
}
