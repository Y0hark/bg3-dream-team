// ------------------------------------------------------------------
// Alternatives par rôle, acte et slot — lecture de loadouts.js.
//
// Le plan par acte est une PROJECTION : il dit ce que le rôle recommande, pas
// ce qu'il porte. La possession (statut d'item, copies) et l'équipement réel
// appartiennent à la run ; changer d'acte dans un sélecteur n'équipe jamais
// rien rétroactivement. Les choix d'alternative (`choixAlternatives`, stockés
// dans la sauvegarde) sont une préférence de plan, pas un équipement.
//
// Nature d'une ligne, déduite de son rang (jamais de la rareté) :
// - reference     : rang principal ;
// - equivalente   : rang alternative — à n'afficher comme équivalente que
//                   dans le contexte explicite `condition` ; sans contexte,
//                   la ligne est signalée dans `lignesSansContexte()` ;
// - situationnelle: rang situationnel ;
// - transition    : rang réserve — usage ponctuel avant d'équiper la
//                   référence.
// ------------------------------------------------------------------
import { LIMITES_SLOTS, LOADOUTS, SLOTS_LOADOUT } from '../data/loadouts.js'
import { objetDe } from '../data/objets.js'

export const NATURES = {
  principal: 'reference',
  alternative: 'equivalente',
  situationnel: 'situationnelle',
  reserve: 'transition',
}

export const NOMS_NATURES = {
  reference: 'Référence',
  equivalente: 'Alternative équivalente',
  situationnelle: 'Situationnelle',
  transition: 'Transition',
}

export function natureDe(ligne) {
  return NATURES[ligne?.rang] ?? 'situationnelle'
}

/** Actes où la ligne reste recommandée (≠ acte d'acquisition de l'objet). */
export function actesRecommandes(ligne) {
  const fin = ligne.jusquA ?? ligne.acte
  const actes = []
  for (let acte = ligne.acte; acte <= fin; acte += 1) actes.push(acte)
  return actes
}

/** Actes d'acquisition de l'objet (sources), distincts des actes recommandés. */
export function actesAcquisition(objetId) {
  const objet = objetDe(objetId)
  return objet ? [...new Set(objet.sources.map((source) => source.acte))].sort() : []
}

function lignesDuSlot(role, acte, slot) {
  return LOADOUTS.filter(
    (ligne) =>
      ligne.role === role && ligne.slot === slot && ligne.acte <= acte && acte <= (ligne.jusquA ?? ligne.acte),
  )
}

/**
 * Phrase comparative d'une alternative face à la référence du slot, bâtie sur
 * les textes sourcés (`interet`, `condition`) — rien n'est inventé. Les
 * « pertes » ne sont écrites que si une donnée les porte (`condition`).
 */
export function comparaison(ligne, reference) {
  const objet = objetDe(ligne.objet)
  const nom = objet?.nom ?? 'Option libre'
  const gain = ligne.interet ? `${nom} : ${ligne.interet}` : nom
  const contre = reference?.objet ? ` Référence : ${objetDe(reference.objet)?.nom ?? reference.objet}.` : ''
  const condition = ligne.condition ? ` Condition : ${ligne.condition}` : ''
  return `${gain}${contre}${condition}`
}

/**
 * Options d'un slot pour un rôle et un acte : références et alternatives
 * avec leur nature, usages, actes recommandés et phrase comparative.
 */
export function optionsDuSlot(role, acte, slot) {
  const lignes = lignesDuSlot(role, acte, slot)
  const references = lignes.filter((ligne) => ligne.rang === 'principal')
  return lignes.map((ligne) => {
    const objet = ligne.objet ? objetDe(ligne.objet) : null
    return {
      ...ligne,
      nature: natureDe(ligne),
      usages: objet?.usages ?? [],
      actesRecommandes: actesRecommandes(ligne),
      actesAcquisition: ligne.objet ? actesAcquisition(ligne.objet) : [],
      comparaison: ligne.rang === 'principal' ? null : comparaison(ligne, references[0]),
    }
  })
}

/** Alternatives « équivalentes » dont le contexte n'est pas explicite. */
export function lignesSansContexte() {
  return LOADOUTS.filter((ligne) => ligne.rang === 'alternative' && !ligne.condition)
}

// --- Choix d'alternatives stockés dans la sauvegarde -------------------------
//
// Format : { "<role>|<acte>|<slot>": "<objetId>" }. Absent = plan par défaut
// (la référence). Un choix dont la ligne n'existe plus, ou dont l'objet n'est
// pas recommandé à cet acte et ce slot, est ignoré à la lecture — jamais une
// erreur, jamais un reset. La possession reste dans `items`, l'équipement
// dans `copies` : un choix ne modifie ni l'un ni l'autre.

// Un slot porté en plusieurs exemplaires (Anneau ×2) a une clé par
// emplacement : « Anneau » pour le premier, « Anneau#2 » pour le second.
export const cleChoix = (role, acte, slot, indice = 0) =>
  `${role}|${acte}|${slot}${indice > 0 ? `#${indice + 1}` : ''}`

function decouperSlot(brut) {
  const [slot, rang] = String(brut).split('#')
  const indice = rang === undefined ? 0 : Number(rang) - 1
  const valide = Number.isInteger(indice) && indice >= 0 && indice < (LIMITES_SLOTS[slot] ?? 1)
  return { slot, indice, valide: valide && (rang === undefined || indice > 0) }
}

export function normaliserChoix(brut) {
  const choix = {}
  if (brut === null || typeof brut !== 'object' || Array.isArray(brut)) return choix
  for (const [cle, objetId] of Object.entries(brut)) {
    const [role, acteBrut, slotBrut] = cle.split('|')
    const acte = Number(acteBrut)
    const { slot, valide } = decouperSlot(slotBrut)
    if (typeof objetId !== 'string' || !valide || !SLOTS_LOADOUT.includes(slot)) continue
    if (lignesDuSlot(role, acte, slot).some((ligne) => ligne.objet === objetId)) choix[cle] = objetId
  }
  return choix
}

/**
 * Nouveau jeu de choix après sélection d'un objet pour un emplacement.
 * `objetId` null, ou égal à la référence de l'emplacement, revient à la
 * référence (la clé disparaît : l'état reste compact). Ne touche ni
 * `items` ni `copies`.
 */
export function avecChoix(choix, role, acte, slot, indice, objetId, referenceId = null) {
  const suivant = { ...choix }
  const cle = cleChoix(role, acte, slot, indice)
  if (!objetId || objetId === referenceId) delete suivant[cle]
  else suivant[cle] = objetId
  return normaliserChoix(suivant)
}
