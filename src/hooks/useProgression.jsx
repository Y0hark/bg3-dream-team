import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { objetDe } from '../data/objets.js'
import { avecChoix } from '../lib/alternatives.js'
import { affecter, ajouterCopie, normaliserSuivi } from '../lib/copies.js'
import {
  etatInitial,
  normaliserEtat,
  reinitialiserProgression,
  statutBascule,
  statutDe,
  statutValide,
  STATUT_DEFAUT,
} from '../lib/progression.js'
import {
  aDeLaProgression,
  analyserBrut,
  decisionDistante,
  exporterSauvegarde,
  migrerVersCourant,
  sauvegarderAvantMigration,
} from '../lib/sauvegarde.js'
import {
  CLE_CODE_RUN,
  CLE_MAJ_DISTANTE,
  CLE_PROGRESSION,
  ecrire,
  effacer,
  lire,
  lireStrict,
  stockageDisponible,
} from '../lib/stockage.js'
import { chargerDistant, enregistrerDistant, normaliserCode } from '../lib/nuage.js'

/** Délai d'inactivité avant d'envoyer la progression au serveur. */
const DELAI_ENVOI = 1500

const ContexteProgression = createContext(null)

/**
 * Ce que le stockage local contient au démarrage, et ce qu'on en fait.
 *
 * - 'ok' : on lit et on écrit normalement ;
 * - 'migration-proposee' : sauvegarde d'avant la V2 — migrée EN MÉMOIRE pour
 *   l'affichage, mais rien n'est écrit tant que l'utilisateur n'a pas confirmé ;
 * - 'format-plus-recent' / 'illisible' : l'écriture automatique est coupée, on
 *   n'abîme pas une sauvegarde qu'on ne sait pas relire.
 */
function analyserStockage() {
  const lecture = lireStrict(CLE_PROGRESSION)
  // Un contenu qui n'est pas du JSON n'est PAS « vide » : on le garde tel quel
  // pour l'export et on coupe l'écriture, sinon le prochain enregistrement l'écraserait.
  if (lecture.statut === 'illisible') {
    return { brut: lecture.texte, etat: etatInitial(), statut: 'illisible', rapport: null }
  }
  const brut = lecture.valeur
  const analyse = analyserBrut(brut)

  if (analyse.type === 'courant') return { brut, etat: normaliserEtat(brut), statut: 'ok', rapport: null }
  if (analyse.type === 'neuf') return { brut, etat: etatInitial(), statut: 'ok', rapport: null }
  if (analyse.type === 'ancien') {
    const { etat, rapport } = migrerVersCourant(brut)
    // Rien à perdre : une sauvegarde vide se migre sans demander.
    return { brut, etat, statut: aDeLaProgression(brut) ? 'migration-proposee' : 'ok', rapport }
  }
  return { brut, etat: etatInitial(), statut: analyse.type === 'plus-recent' ? 'format-plus-recent' : 'illisible', rapport: null }
}

/**
 * Source de vérité unique de la progression : statuts d'items, checklists,
 * suivi des copies et archive de l'ancienne composition. L'état est chargé une
 * fois au montage puis réécrit à chaque changement — sauf si le stockage est
 * dans un état qu'on ne doit pas écraser (cf. analyserStockage).
 */
export function FournisseurProgression({ children }) {
  const [disponible] = useState(() => stockageDisponible())
  const [initial] = useState(analyserStockage)
  const [etat, setEtat] = useState(initial.etat)
  const [statutStockage, setStatutStockage] = useState(initial.statut)
  const [erreurMigration, setErreurMigration] = useState(null)
  // Sauvegarde brute telle qu'elle était dans le navigateur : sert à la copie de secours et à l'export.
  const brutInitial = useRef(initial.brut)
  const rapportMigration = initial.rapport

  useEffect(() => {
    if (!disponible || statutStockage !== 'ok') return
    ecrire(CLE_PROGRESSION, etat)
  }, [etat, disponible, statutStockage])

  /**
   * Confirme le passage à la nouvelle composition. L'état précédent est mis à
   * l'abri AVANT toute écriture : si la copie de secours échoue, on n'écrit rien.
   */
  const confirmerMigration = useCallback(() => {
    if (statutStockage !== 'migration-proposee') return false
    if (disponible) {
      const copie = sauvegarderAvantMigration(brutInitial.current, { lire, ecrire })
      if (!copie.ok) {
        setErreurMigration('La copie de secours de l’ancienne sauvegarde n’a pas pu être écrite : rien n’a été modifié.')
        return false
      }
    }
    setErreurMigration(null)
    setStatutStockage('ok')
    return true
  }, [statutStockage, disponible])

  /** Texte JSON de l'ancienne sauvegarde et de l'état courant, pour téléchargement. */
  const exporterDonnees = useCallback(
    () => exporterSauvegarde(brutInitial.current, etat),
    [etat],
  )

  // --- Copies : original ≠ exemplaires ≠ équipement (cf. lib/copies.js) -------
  const modifierSuivi = useCallback((objetId, transformer) => {
    setEtat((precedent) => {
      const suivi = normaliserSuivi(precedent.copies?.[objetId])
      const suivant = transformer(suivi, statutDe(precedent, objetId))
      if (!suivant) return precedent
      const copies = { ...precedent.copies }
      if (suivant.exemplaires > 0 || suivant.affectes.length > 0) copies[objetId] = suivant
      else delete copies[objetId]
      return { ...precedent, copies }
    })
  }, [])

  const ajouterExemplaire = useCallback(
    (objetId) => {
      const objet = objetDe(objetId)
      if (!objet) return
      modifierSuivi(objetId, (suivi, statut) => {
        const resultat = ajouterCopie(objet, statut, suivi)
        return resultat.ok ? resultat.suivi : null
      })
    },
    [modifierSuivi],
  )

  const affecterExemplaire = useCallback(
    (objetId, roleId) => {
      const objet = objetDe(objetId)
      if (!objet) return
      modifierSuivi(objetId, (suivi, statut) => {
        const resultat = affecter(objet, statut, suivi, roleId)
        return resultat.ok ? resultat.suivi : null
      })
    },
    [modifierSuivi],
  )

  const liberer = useCallback(
    (objetId, roleId) => {
      modifierSuivi(objetId, (suivi) => ({
        ...suivi,
        affectes: suivi.affectes.filter((role) => role !== roleId),
      }))
    },
    [modifierSuivi],
  )

  const validerCopie = useCallback(
    (objetId, validee) => {
      modifierSuivi(objetId, (suivi) => ({ ...suivi, copieValidee: Boolean(validee) }))
    },
    [modifierSuivi],
  )

  // --- Choix d'alternatives : préférence de plan, ni possession ni équipement ---
  // `objetId` null (ou égal à la référence) revient à la référence du plan.
  const choisirAlternative = useCallback((role, acte, slot, indice, objetId, referenceId = null) => {
    setEtat((precedent) => ({
      ...precedent,
      choixAlternatives: avecChoix(precedent.choixAlternatives, role, acte, slot, indice, objetId, referenceId),
    }))
  }, [])

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
  const [synchro, setSynchro] = useState({ statut: 'inactif', majLe: null, erreur: null, message: null })
  // Dernier état connu du serveur : évite de réémettre ce qu'il a déjà.
  const refEnvoye = useRef(null)
  // Tant que la prise de contact n'a pas abouti, on n'envoie rien : on
  // écraserait la version du serveur avec un local pas encore fusionné.
  const [pretAEnvoyer, setPretAEnvoyer] = useState(false)

  // 1. Prise de contact : au montage (ou au changement de code), on compare
  //    l'horodatage du serveur au dernier qu'on ait vu. S'il a bougé, un
  //    autre appareil a écrit entre-temps et sa version fait foi.
  //    La décision (appliquer, garder le local, bloquer) est prise par
  //    decisionDistante : un format plus récent, illisible ou écrit par une
  //    ancienne version n'est jamais écrasé en silence.
  const refEtat = useRef(etat)
  refEtat.current = etat

  useEffect(() => {
    setPretAEnvoyer(false)
    if (!codeRun) {
      setSynchro({ statut: 'inactif', majLe: null, erreur: null, message: null })
      return
    }
    // Le stockage local lui-même est bloqué : on ne synchronise rien.
    if (statutStockage === 'format-plus-recent' || statutStockage === 'illisible') {
      setSynchro({
        statut: 'bloque',
        majLe: null,
        erreur: null,
        message: 'Le stockage local est dans un format que cette version ne peut pas écraser : la synchronisation est suspendue.',
      })
      return
    }

    let annule = false
    setSynchro({ statut: 'chargement', majLe: null, erreur: null, message: null })

    chargerDistant(codeRun)
      .then((distant) => {
        if (annule) return
        const decision = decisionDistante({
          statutLocal: statutStockage,
          localVide: !aDeLaProgression(refEtat.current),
          distantBrut: distant?.etat ?? null,
          majLe: distant?.majLe ?? null,
          vuPrecedemment: lire(CLE_MAJ_DISTANTE),
        })

        if (decision.action === 'bloquer') {
          setSynchro({ statut: 'bloque', majLe: distant?.majLe ?? null, erreur: null, message: decision.message, raison: decision.raison })
          return
        }
        if (decision.action === 'attendre-migration') {
          setSynchro({ statut: 'attente-migration', majLe: distant?.majLe ?? null, erreur: null, message: decision.message })
          return
        }
        if (decision.action === 'appliquer-distant' || decision.action === 'appliquer-distant-migre') {
          const recu =
            decision.action === 'appliquer-distant'
              ? normaliserEtat(distant.etat)
              : migrerVersCourant(distant.etat).etat
          setEtat(recu)
          refEnvoye.current = JSON.stringify(recu)
          ecrire(CLE_MAJ_DISTANTE, distant.majLe)
          setSynchro({ statut: 'synchro', majLe: distant.majLe, erreur: null, message: null })
        } else {
          // Rien de neuf en face : c'est notre version locale qui partira. On
          // n'annonce « sauvegardé » qu'une fois l'écriture réussie.
          setSynchro({ statut: 'connecte', majLe: distant?.majLe ?? null, erreur: null, message: null })
        }
        setPretAEnvoyer(decision.envoiAuto)
      })
      .catch((erreur) => {
        if (annule) return
        setSynchro({ statut: 'erreur', majLe: null, erreur: erreur.message, message: null })
      })

    return () => {
      annule = true
    }
  }, [codeRun, statutStockage])

  // 2. Envoi différé à chaque modification, une fois la prise de contact faite.
  useEffect(() => {
    if (!codeRun || !pretAEnvoyer || statutStockage !== 'ok') return

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
          setSynchro({ statut: 'synchro', majLe, erreur: null, message: null })
        })
        .catch((erreur) => {
          // L'échec n'est pas grave : le local a déjà la vérité, on
          // réessaiera à la prochaine modification ou au prochain chargement.
          if (annule) return
          setSynchro({ statut: 'erreur', majLe: null, erreur: erreur.message, message: null })
        })
    }, DELAI_ENVOI)

    return () => {
      annule = true
      clearTimeout(minuterie)
    }
  }, [etat, codeRun, pretAEnvoyer, statutStockage])

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

  /**
   * Choix explicite de l'utilisateur : écraser la sauvegarde en ligne, écrite
   * par une ancienne version, avec la sienne. Jamais déclenché automatiquement.
   */
  const forcerEnvoi = useCallback(() => {
    refEnvoye.current = null
    setPretAEnvoyer(true)
    setSynchro((precedent) => ({ ...precedent, statut: 'connecte', message: null }))
  }, [])

  /**
   * Reset de la PROGRESSION de la composition active. L'archive de l'ancienne
   * composition n'est pas touchée : changer d'équipe n'est pas remettre à zéro.
   * Sans effet tant que l'écriture est bloquée (format plus récent, illisible).
   */
  const reinitialiser = useCallback(() => {
    if (statutStockage !== 'ok') return false
    setEtat((precedent) => reinitialiserProgression(precedent))
    // L'état vide sera poussé au serveur comme n'importe quelle modification.
    refEnvoye.current = null
    return true
  }, [statutStockage])

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
      forcerEnvoi,
      statutStockage,
      rapportMigration,
      erreurMigration,
      confirmerMigration,
      exporterDonnees,
      ajouterExemplaire,
      affecterExemplaire,
      liberer,
      validerCopie,
      choisirAlternative,
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
      forcerEnvoi,
      statutStockage,
      rapportMigration,
      erreurMigration,
      confirmerMigration,
      exporterDonnees,
      ajouterExemplaire,
      affecterExemplaire,
      liberer,
      validerCopie,
      choisirAlternative,
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
