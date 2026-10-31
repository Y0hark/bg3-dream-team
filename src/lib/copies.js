// ------------------------------------------------------------------
// Copies d'équipement (Ombrecœur / Invocation de réplique) : contrat de suivi.
//
// Trois choses distinctes, que l'ancien « un seul exemplaire pour toute
// l'équipe » confondait :
//
//   1. l'ORIGINAL acquis — c'est le statut d'item déjà suivi par la
//      progression (`etat.items[objetId]` : obtenu / raté / …), inchangé ;
//   2. les EXEMPLAIRES disponibles — l'original compte pour un, chaque copie
//      validée en ajoute un ;
//   3. l'ÉQUIPEMENT effectif — quels rôles portent un exemplaire.
//
// Acquérir l'original n'équipe donc jamais automatiquement les quatre rôles.
// Un suivi par quantité suffit : une copie n'a pas d'identité propre.
//
// État par objet (à stocker dans la sauvegarde, cf. ticket tracker 3/4) :
//   { exemplaires: number, affectes: roleId[], copieValidee: boolean }
// Absent = { exemplaires: 0, affectes: [], copieValidee: false }.
//
// Ce que les copies ne dupliquent PAS : le Cheveu d'Ethel, les autres bonus
// permanents, les élixirs, les classes, le ki, les charges de pacte. Ces
// objets portent `copiable: false`. Et un objet copié reste limité à son
// slot : une amulette, une cape, deux anneaux par personnage. La persistance
// et les passifs d'une copie sont un état à VALIDER sur la version installée
// (`copieValidee`), jamais une garantie de l'application.
// ------------------------------------------------------------------
import { COPIES_AUTORISEES } from '../data/builds.js'
import { LIMITES_SLOTS, LOADOUTS, loadoutsDe } from '../data/loadouts.js'
import { objetDe } from '../data/objets.js'

export const REGLAGES_COPIES = { copiesAutorisees: COPIES_AUTORISEES }

export function suiviVide() {
  return { exemplaires: 0, affectes: [], copieValidee: false }
}

/** Nettoie un suivi venu du stockage : une valeur inconnue ne doit rien casser. */
export function normaliserSuivi(brut) {
  const suivi = suiviVide()
  if (!brut || typeof brut !== 'object') return suivi
  if (Number.isInteger(brut.exemplaires) && brut.exemplaires > 0) {
    suivi.exemplaires = Math.min(brut.exemplaires, 99)
  }
  if (Array.isArray(brut.affectes)) {
    suivi.affectes = [...new Set(brut.affectes.filter((role) => typeof role === 'string'))]
  }
  suivi.copieValidee = brut.copieValidee === true
  return suivi
}

/** Normalise la table des suivis (id d'objet → suivi) venue du stockage. */
export function normaliserCopies(brut) {
  const copies = {}
  if (brut === null || typeof brut !== 'object' || Array.isArray(brut)) return copies
  for (const [id, suivi] of Object.entries(brut)) {
    const propre = normaliserSuivi(suivi)
    // Un suivi vide est le défaut : on ne le stocke pas.
    if (propre.exemplaires > 0 || propre.affectes.length > 0) copies[id] = propre
  }
  return copies
}

/** Rôles qui ont l'objet en rang principal à un acte donné. */
export function besoinsObjet(objetId, acte, loadouts = LOADOUTS) {
  const roles = new Set()
  for (const ligne of loadouts) {
    if (ligne.objet !== objetId || ligne.rang !== 'principal') continue
    if (ligne.acte <= acte && acte <= (ligne.jusquA ?? ligne.acte)) roles.add(ligne.role)
  }
  return [...roles]
}

/**
 * L'original (ou une autre source documentée) permet-il de copier ?
 * - 'oui' : original obtenu ;
 * - 'autre-source' : original raté, mais une seconde source (rattrapage) existe ;
 * - 'non' : rien à copier (original pas encore obtenu, raté sans rattrapage,
 *   copies désactivées ou objet non copiable).
 */
export function copiePossible(objet, statutOriginal, reglages = REGLAGES_COPIES) {
  if (!reglages.copiesAutorisees || !objet.copiable) return 'non'
  if (statutOriginal === 'obtenu') return 'oui'
  if (statutOriginal === 'rate' && objet.sources.some((source) => source.rattrapage)) {
    return 'autre-source'
  }
  return 'non'
}

/**
 * Vue calculée pour l'interface. Garantit qu'on n'affiche jamais plus
 * d'exemplaires affectés que d'exemplaires disponibles : pas de surcomptage.
 */
export function etatCopies(objet, statutOriginal, suivi, besoins, reglages = REGLAGES_COPIES) {
  const brut = normaliserSuivi(suivi)
  const original = statutOriginal === 'obtenu' ? 1 : 0

  let exemplaires = original
  if (reglages.copiesAutorisees && objet.copiable && original === 1) {
    exemplaires = Math.max(1, brut.exemplaires)
  }

  const besoinsValides = besoins.filter((role, index) => besoins.indexOf(role) === index)
  const affectes = brut.affectes.slice(0, exemplaires)
  const besoinRestant = besoinsValides.filter((role) => !affectes.includes(role))

  return {
    original: statutOriginal,
    copiePossible: copiePossible(objet, statutOriginal, reglages),
    exemplaires,
    affectes,
    libres: exemplaires - affectes.length,
    besoinRestant,
    // Une copie n'existe, et n'a donc à être validée, qu'au-delà de l'original.
    copieValidee: exemplaires > 1 && brut.copieValidee,
    copieAValider: exemplaires > 1 && !brut.copieValidee,
  }
}

/** Affecte un exemplaire à un rôle. Refuse sans exemplaire libre. */
export function affecter(objet, statutOriginal, suivi, role, reglages = REGLAGES_COPIES) {
  const etat = etatCopies(objet, statutOriginal, suivi, [], reglages)
  if (etat.affectes.includes(role)) return { ok: true, suivi: normaliserSuivi(suivi) }
  if (etat.libres < 1) return { ok: false, raison: 'aucun-exemplaire-libre' }
  return {
    ok: true,
    suivi: { ...normaliserSuivi(suivi), exemplaires: etat.exemplaires, affectes: [...etat.affectes, role] },
  }
}

/** Ajoute un exemplaire copié. Refuse si l'original ne permet pas de copier. */
export function ajouterCopie(objet, statutOriginal, suivi, reglages = REGLAGES_COPIES) {
  if (copiePossible(objet, statutOriginal, reglages) === 'non') {
    return { ok: false, raison: 'copie-impossible' }
  }
  const etat = etatCopies(objet, statutOriginal, suivi, [], reglages)
  const brut = normaliserSuivi(suivi)
  return {
    ok: true,
    suivi: { ...brut, exemplaires: etat.exemplaires + 1, affectes: etat.affectes },
  }
}

/**
 * Alertes d'exclusivité : un même objet en rang principal chez plusieurs
 * rôles au même acte. Avec les copies, ce n'est PAS un conflit — sauf pour un
 * objet non copiable (Cheveu, élixirs), où il le reste toujours.
 */
export function alertesExclusivite(loadouts = LOADOUTS, reglages = REGLAGES_COPIES) {
  const alertes = []
  const actes = [1, 2, 3]
  const objets = new Set(loadouts.map((ligne) => ligne.objet).filter(Boolean))
  for (const objetId of objets) {
    const objet = objetDe(objetId)
    if (reglages.copiesAutorisees && objet?.copiable) continue
    for (const acte of actes) {
      const roles = besoinsObjet(objetId, acte, loadouts)
      if (roles.length > 1) alertes.push({ objet: objetId, acte, roles })
    }
  }
  return alertes
}

/**
 * Slots dépassés dans un loadout principal : « un objet copié reste limité à
 * son slot ». Renvoie une liste vide quand le loadout est portable.
 */
export function depassementsSlots(role, acte, loadouts = LOADOUTS) {
  const compte = {}
  const lignes =
    loadouts === LOADOUTS
      ? loadoutsDe(role, acte)
      : loadouts.filter(
          (l) => l.role === role && l.acte <= acte && acte <= (l.jusquA ?? l.acte),
        )
  for (const ligne of lignes) {
    if (ligne.rang !== 'principal' || ligne.objet === null) continue
    compte[ligne.slot] = (compte[ligne.slot] ?? 0) + 1
  }
  return Object.entries(compte)
    .filter(([slot, nombre]) => nombre > (LIMITES_SLOTS[slot] ?? 1))
    .map(([slot, nombre]) => ({ role, acte, slot, nombre, limite: LIMITES_SLOTS[slot] ?? 1 }))
}
