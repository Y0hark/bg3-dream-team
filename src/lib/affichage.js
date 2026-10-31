// ------------------------------------------------------------------
// Préférences d'affichage : « Préparer » ou « En partie », et l'acte / la zone
// que l'utilisateur déclare jouer.
//
// Ce n'est PAS de la progression : ces valeurs vivent dans leur propre clé
// locale (CLE_AFFICHAGE), ne sont pas synchronisées avec la run et ne
// modifient jamais la possession, les plans ni les décisions de quête. Le
// réglage de spoilers reste dans `etat.acquisition.spoilers` — une seule
// source de vérité, pas de copie ici.
//
// La zone détermine l'acte. Un acte seul est valable (zone inconnue) : le site
// n'invente alors aucune prochaine action propre à une zone.
// ------------------------------------------------------------------
import { ACTES } from '../data/actes.js'
import { LIEUX } from '../data/lieux.js'
import { besoinsEquipe, plansDeLActe, statutPorteur } from './equipe.js'

export const MODES = ['preparer', 'en-partie']
export const MODE_DEFAUT = 'preparer'

export const LIBELLES_MODE = {
  preparer: 'Préparer',
  'en-partie': 'En partie',
}

export function affichageInitial() {
  return { mode: MODE_DEFAUT, acte: null, zone: null }
}

/** Nettoie ce qui vient du stockage : une valeur inconnue revient au défaut, sans lever. */
export function normaliserAffichage(brut) {
  const affichage = affichageInitial()
  if (!brut || typeof brut !== 'object' || Array.isArray(brut)) return affichage

  if (MODES.includes(brut.mode)) affichage.mode = brut.mode
  const lieu = LIEUX.find((entree) => entree.id === brut.zone)
  if (lieu) {
    affichage.zone = lieu.id
    affichage.acte = lieu.acte
  } else if (ACTES.some((acte) => acte.numero === brut.acte)) {
    affichage.acte = brut.acte
  }
  return affichage
}

export function avecMode(affichage, mode) {
  return MODES.includes(mode) ? { ...affichage, mode } : affichage
}

/** Déclarer une zone fixe aussi l'acte ; `null` efface la zone mais garde l'acte. */
export function avecZone(affichage, zoneId) {
  const lieu = LIEUX.find((entree) => entree.id === zoneId)
  if (!lieu) return { ...affichage, zone: null }
  return { ...affichage, zone: lieu.id, acte: lieu.acte }
}

/** Changer d'acte oublie une zone qui n'en fait pas partie ; `null` efface les deux. */
export function avecActe(affichage, acte) {
  if (!ACTES.some((entree) => entree.numero === acte)) return { ...affichage, acte: null, zone: null }
  const zone = LIEUX.find((lieu) => lieu.id === affichage.zone)?.acte === acte ? affichage.zone : null
  return { ...affichage, acte, zone }
}

/**
 * Résumé par rôle de l'acte déclaré : prévu (le plan) et réel (équipé) restent
 * deux nombres, jamais fondus en un pourcentage.
 */
export function resumeRoles(roles, acte, etat) {
  return plansDeLActe(roles, acte, etat).map((plan) => {
    const statuts = plan.emplacements.map((emplacement) => statutPorteur(emplacement.objet, plan.role, etat))
    const compte = (statut) => statuts.filter((valeur) => valeur === statut).length
    return {
      role: plan.role,
      prevus: statuts.filter((statut) => statut !== 'vide').length,
      equipes: compte('equipe'),
      aAffecter: compte('a-affecter'),
      originauxARecuperer: compte('original-a-recuperer'),
      sansOption: compte('vide'),
    }
  })
}

/**
 * Prochaines actions d'ÉQUIPEMENT, déduites des statuts renseignés et des
 * copies déclarées. Les alertes de zone viennent de recapZone (ticket 3), pas
 * d'ici. Une liste vide signifie « rien de connu à faire », jamais « terminé ».
 */
export function prochainesActions(roles, acte, etat) {
  const plans = plansDeLActe(roles, acte, etat)
  const actions = []

  for (const resume of resumeRoles(roles, acte, etat)) {
    if (resume.aAffecter > 0) actions.push({ type: 'affecter', role: resume.role, nombre: resume.aAffecter })
  }
  for (const besoin of besoinsEquipe(plans, etat)) {
    if (besoin.conflitUnique) actions.push({ type: 'conflit', objet: besoin.objet, roles: besoin.roles })
    else if (besoin.originalARecuperer) actions.push({ type: 'original', objet: besoin.objet, roles: besoin.roles })
    else if (besoin.copiesAPreparer > 0) {
      actions.push({ type: 'copie', objet: besoin.objet, nombre: besoin.copiesAPreparer, roles: besoin.roles })
    }
  }
  return actions
}
