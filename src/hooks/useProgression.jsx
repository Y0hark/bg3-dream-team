import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  etatInitial,
  normaliserEtat,
  statutBascule,
  statutDe,
  statutValide,
  STATUT_DEFAUT,
} from '../lib/progression.js'
import { CLE_PROGRESSION, ecrire, effacer, lire, stockageDisponible } from '../lib/stockage.js'

const ContexteProgression = createContext(null)

/**
 * Source de vérité unique de la progression : statuts d'items et checklists.
 * L'état est chargé une fois au montage puis réécrit à chaque changement.
 */
export function FournisseurProgression({ children }) {
  const [disponible] = useState(() => stockageDisponible())
  const [etat, setEtat] = useState(() => normaliserEtat(lire(CLE_PROGRESSION)))

  useEffect(() => {
    if (!disponible) return
    ecrire(CLE_PROGRESSION, etat)
  }, [etat, disponible])

  const definirStatut = useCallback((itemId, statut) => {
    const valide = statutValide(statut)
    setEtat((precedent) => {
      const items = { ...precedent.items }
      // On ne stocke que ce qui s'écarte du défaut : l'état reste compact.
      if (valide === STATUT_DEFAUT) delete items[itemId]
      else items[itemId] = valide
      return { ...precedent, items }
    })
  }, [])

  const basculerItem = useCallback((itemId) => {
    setEtat((precedent) => {
      const items = { ...precedent.items }
      const suivant = statutBascule(statutDe(precedent, itemId))
      if (suivant === STATUT_DEFAUT) delete items[itemId]
      else items[itemId] = suivant
      return { ...precedent, items }
    })
  }, [])

  const basculerChecklist = useCallback((entreeId) => {
    setEtat((precedent) => {
      const checklist = { ...precedent.checklist }
      if (checklist[entreeId]) delete checklist[entreeId]
      else checklist[entreeId] = true
      return { ...precedent, checklist }
    })
  }, [])

  const reinitialiser = useCallback(() => {
    setEtat(etatInitial())
    effacer(CLE_PROGRESSION)
  }, [])

  const valeur = useMemo(
    () => ({
      etat,
      disponible,
      definirStatut,
      basculerItem,
      basculerChecklist,
      reinitialiser,
    }),
    [etat, disponible, definirStatut, basculerItem, basculerChecklist, reinitialiser],
  )

  return <ContexteProgression.Provider value={valeur}>{children}</ContexteProgression.Provider>
}

export default function useProgression() {
  const contexte = useContext(ContexteProgression)
  if (!contexte) {
    throw new Error('useProgression doit être utilisé dans <FournisseurProgression>')
  }
  return contexte
}
