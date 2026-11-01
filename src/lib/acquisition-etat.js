// ------------------------------------------------------------------
// Forme persistée du suivi d'acquisition (`etat.acquisition`).
//
// Séparé de acquisition.js pour que progression.js puisse normaliser l'état
// sans import circulaire. Tout est déclaratif : l'utilisateur dit ce qu'il a
// vu ou décidé, le site ne lit pas le jeu.
//
// - evenements : faits déclarés (EVENEMENTS) ;
// - statuts : décision par alerte — 'fait' | 'ignore' ; l'absence vaut
//   « à vérifier » (jamais un feu vert par défaut) ;
// - spoilers : 'discret' (défaut) ou 'detail' ;
// - version : forme du suivi. Absente (suivis d'avant le Follow-up 3/4, locaux ou
//   cloud) : les « fait » posés sur une condition dont le sens a changé
//   (CONDITIONS_REDEFINIES) sont écartés — un ancien jalon n'est pas une preuve
//   pour la nouvelle définition. « ignorée » et les événements déclarés restent
//   (les ids n'ont pas changé de sens : « bœuf vu » reste un jalon).
// ------------------------------------------------------------------
import { CONDITIONS, CONDITIONS_REDEFINIES, EVENEMENTS } from '../data/acquisition.js'

export const STATUTS_ALERTE = ['fait', 'ignore']
export const MODES_SPOILERS = ['discret', 'detail']
export const VERSION_ACQUISITION = 2

export function acquisitionInitiale() {
  return { evenements: {}, statuts: {}, spoilers: 'discret', version: VERSION_ACQUISITION }
}

const estObjet = (valeur) => valeur && typeof valeur === 'object' && !Array.isArray(valeur)

/** Nettoie un suivi venu du stockage : une clé inconnue ou corrompue est écartée. */
export function normaliserAcquisition(brut) {
  const acquisition = acquisitionInitiale()
  if (!estObjet(brut)) return acquisition

  const evenements = new Set(EVENEMENTS.map((evenement) => evenement.id))
  const conditions = new Set(CONDITIONS.map((condition) => condition.id))

  if (estObjet(brut.evenements)) {
    for (const [id, valeur] of Object.entries(brut.evenements)) {
      if (valeur === true && evenements.has(id)) acquisition.evenements[id] = true
    }
  }
  if (estObjet(brut.statuts)) {
    for (const [id, statut] of Object.entries(brut.statuts)) {
      if (!STATUTS_ALERTE.includes(statut) || !conditions.has(id)) continue
      if (statut === 'fait' && brut.version !== VERSION_ACQUISITION && CONDITIONS_REDEFINIES.includes(id)) continue
      acquisition.statuts[id] = statut
    }
  }
  if (MODES_SPOILERS.includes(brut.spoilers)) acquisition.spoilers = brut.spoilers
  return acquisition
}

/** Vrai si l'utilisateur a déclaré quoi que ce soit (hors réglage de spoilers). */
export function acquisitionRenseignee(acquisition) {
  return (
    Object.keys(acquisition?.evenements ?? {}).length > 0 || Object.keys(acquisition?.statuts ?? {}).length > 0
  )
}

export function avecEvenement(acquisition, id, declare) {
  const evenements = { ...normaliserAcquisition(acquisition).evenements }
  if (declare) evenements[id] = true
  else delete evenements[id]
  return { ...normaliserAcquisition(acquisition), evenements }
}

/** `statut` null revient à « à vérifier » (la clé est supprimée). */
export function avecStatutAlerte(acquisition, id, statut) {
  const statuts = { ...normaliserAcquisition(acquisition).statuts }
  if (STATUTS_ALERTE.includes(statut)) statuts[id] = statut
  else delete statuts[id]
  return { ...normaliserAcquisition(acquisition), statuts }
}
