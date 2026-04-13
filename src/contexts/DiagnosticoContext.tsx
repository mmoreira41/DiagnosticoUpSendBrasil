import React, { createContext, useContext, useState, useCallback } from 'react'

export const SECOES = [
  { id: 'espelho',      label: 'Visão Geral',  num: '01' },
  { id: 'mercado',      label: 'Mercado',       num: '02' },
  { id: 'visibilidade', label: 'Visibilidade',  num: '03' },
  { id: 'perdas',       label: 'Perdas',        num: '04' },
  { id: 'valor',        label: 'Valor & Plano', num: '05' },
]

interface DiagnosticoContextType {
  secaoAtiva: string
  transitioning: boolean
  handleTabSelect: (id: string) => void
}

const DiagnosticoContext = createContext<DiagnosticoContextType>({
  secaoAtiva: 'espelho',
  transitioning: false,
  handleTabSelect: () => {},
})

export function DiagnosticoProvider({ children }: { children: React.ReactNode }) {
  const [secaoAtiva, setSecaoAtiva] = useState('espelho')
  const [transitioning, setTransitioning] = useState(false)

  const handleTabSelect = useCallback(
    (id: string) => {
      if (id === secaoAtiva) return
      setTransitioning(true)
      setTimeout(() => {
        setSecaoAtiva(id)
        setTransitioning(false)
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
      }, 160)
    },
    [secaoAtiva],
  )

  return (
    <DiagnosticoContext.Provider value={{ secaoAtiva, transitioning, handleTabSelect }}>
      {children}
    </DiagnosticoContext.Provider>
  )
}

export function useDiagnostico() {
  return useContext(DiagnosticoContext)
}
