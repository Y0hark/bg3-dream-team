import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { avecActe, avecMode, avecZone, normaliserAffichage } from '../lib/affichage.js'
import { CLE_AFFICHAGE, ecrire, lire, stockageDisponible } from '../lib/stockage.js'

const ContexteAffichage = createContext(null)

/**
 * Mode de lecture et acte / zone déclarés. Volontairement séparé de
 * useProgression : basculer d'affichage n'écrit jamais dans la progression.
 */
export function FournisseurAffichage({ children }) {
  const [disponible] = useState(() => stockageDisponible())
  const [affichage, setAffichage] = useState(() => normaliserAffichage(lire(CLE_AFFICHAGE)))

  useEffect(() => {
    if (disponible) ecrire(CLE_AFFICHAGE, affichage)
  }, [affichage, disponible])

  const definirMode = useCallback((mode) => setAffichage((precedent) => avecMode(precedent, mode)), [])
  const declarerZone = useCallback((zoneId) => setAffichage((precedent) => avecZone(precedent, zoneId)), [])
  const declarerActe = useCallback((acte) => setAffichage((precedent) => avecActe(precedent, acte)), [])

  const valeur = useMemo(
    () => ({ ...affichage, definirMode, declarerZone, declarerActe }),
    [affichage, definirMode, declarerZone, declarerActe],
  )
  return <ContexteAffichage.Provider value={valeur}>{children}</ContexteAffichage.Provider>
}

export default function useAffichage() {
  const contexte = useContext(ContexteAffichage)
  if (!contexte) throw new Error('useAffichage doit être utilisé dans <FournisseurAffichage>')
  return contexte
}
