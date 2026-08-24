import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  etatInitial,
  normaliserEtat,
  statutBascule,
  statutDe,
  statutValide,
  STATUT_DEFAUT,
} from '../lib/progression.js'
import {
  CLE_CODE_RUN,
  CLE_MAJ_DISTANTE,
  CLE_PROGRESSION,
  ecrire,
  effacer,
  lire,
  stockageDisponible,
} from '../lib/stockage.js'
import { chargerDistant, enregistrerDistant, normaliserCode } from '../lib/nuage.js'

/** Délai d'inactivité avant d'envoyer la progression au serveur. */
const DELAI_ENVOI = 1500

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

  // ----------------------------------------------------------------
  // Synchronisation distante (optionnelle)
  //
  // Le local reste la source immédiate : on envoie au serveur en tâche de
  // fond, après un court silence, et on ne bloque jamais l'interface. Le
  // code de run est la seule identité — le partager, c'est partager la run.
  // ----------------------------------------------------------------
  const [codeRun, setCodeRun] = useState(() => normaliserCode(lire(CLE_CODE_RUN)))
  const [synchro, setSynchro] = useState({ statut: 'inactif', majLe: null, erreur: null })
  // Dernier état connu du serveur : évite de réémettre ce qu'il a déjà.
  const refEnvoye = useRef(null)
  // Tant que la prise de contact n'a pas abouti, on n'envoie rien : on
  // écraserait la version du serveur avec un local pas encore fusionné.
  const [pretAEnvoyer, setPretAEnvoyer] = useState(false)

  // 1. Prise de contact : au montage (ou au changement de code), on compare
  //    l'horodatage du serveur au dernier qu'on ait vu. S'il a bougé, un
  //    autre appareil a écrit entre-temps et sa version fait foi.
  useEffect(() => {
    setPretAEnvoyer(false)
    if (!codeRun) {
      setSynchro({ statut: 'inactif', majLe: null, erreur: null })
      return
    }

    let annule = false
    setSynchro({ statut: 'chargement', majLe: null, erreur: null })

    chargerDistant(codeRun)
      .then((distant) => {
        if (annule) return
        const vuPrecedemment = lire(CLE_MAJ_DISTANTE)
        if (distant && distant.majLe !== vuPrecedemment) {
          const recu = normaliserEtat(distant.etat)
          setEtat(recu)
          refEnvoye.current = JSON.stringify(recu)
          ecrire(CLE_MAJ_DISTANTE, distant.majLe)
          setSynchro({ statut: 'synchro', majLe: distant.majLe, erreur: null })
        } else {
          // Rien de neuf en face : c'est notre version locale qui partira.
          setSynchro({ statut: 'synchro', majLe: distant?.majLe ?? null, erreur: null })
        }
        setPretAEnvoyer(true)
      })
      .catch((erreur) => {
        if (annule) return
        setSynchro({ statut: 'erreur', majLe: null, erreur: erreur.message })
      })

    return () => {
      annule = true
    }
  }, [codeRun])

  // 2. Envoi différé à chaque modification, une fois la prise de contact faite.
  useEffect(() => {
    if (!codeRun || !pretAEnvoyer) return

    const charge = JSON.stringify(etat)
    if (charge === refEnvoye.current) return

    let annule = false
    const minuterie = setTimeout(() => {
      setSynchro((precedent) => ({ ...precedent, statut: 'envoi' }))
      enregistrerDistant(codeRun, etat)
        .then((majLe) => {
          // Une modification est arrivée pendant l'envoi : c'est le tour
          // suivant qui fait foi, on laisse tomber cette réponse.
          if (annule) return
          refEnvoye.current = charge
          ecrire(CLE_MAJ_DISTANTE, majLe)
          setSynchro({ statut: 'synchro', majLe, erreur: null })
        })
        .catch((erreur) => {
          // L'échec n'est pas grave : le local a déjà la vérité, on
          // réessaiera à la prochaine modification ou au prochain chargement.
          if (annule) return
          setSynchro({ statut: 'erreur', majLe: null, erreur: erreur.message })
        })
    }, DELAI_ENVOI)

    return () => {
      annule = true
      clearTimeout(minuterie)
    }
  }, [etat, codeRun, pretAEnvoyer])

  /** Active la synchro sur un code (nouveau ou rejoint). */
  const activerSynchro = useCallback((code) => {
    const propre = normaliserCode(code)
    if (!propre) return false
    effacer(CLE_MAJ_DISTANTE)
    ecrire(CLE_CODE_RUN, propre)
    setCodeRun(propre)
    return true
  }, [])

  /** Coupe la synchro : la progression locale, elle, reste intacte. */
  const arreterSynchro = useCallback(() => {
    effacer(CLE_CODE_RUN)
    effacer(CLE_MAJ_DISTANTE)
    refEnvoye.current = null
    setPretAEnvoyer(false)
    setCodeRun(null)
  }, [])

  const reinitialiser = useCallback(() => {
    setEtat(etatInitial())
    effacer(CLE_PROGRESSION)
    // L'état vide sera poussé au serveur comme n'importe quelle modification.
    refEnvoye.current = null
  }, [])

  const valeur = useMemo(
    () => ({
      etat,
      disponible,
      definirStatut,
      basculerItem,
      basculerChecklist,
      reinitialiser,
      codeRun,
      synchro,
      activerSynchro,
      arreterSynchro,
    }),
    [
      etat,
      disponible,
      definirStatut,
      basculerItem,
      basculerChecklist,
      reinitialiser,
      codeRun,
      synchro,
      activerSynchro,
      arreterSynchro,
    ],
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
