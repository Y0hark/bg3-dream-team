// ------------------------------------------------------------------
// Évaluation des conditions d'acquisition (ticket UX 3/5) — fonctions pures.
//
// Trois résultats, jamais un feu vert par défaut :
//   satisfait     — l'original est obtenu, une voie alternative est déclarée,
//                   ou l'utilisateur a confirmé « fait » ;
//   non-satisfait — un événement irréversible déclaré a fermé la condition et
//                   rien ne la satisfait ;
//   inconnu       — tout le reste (y compris « ignorée » : ignorer masque, ne
//                   résout pas).
//
// L'ORIGINAL (`etat.items`) lève l'alerte d'acquisition ; les copies
// (`etat.copies`) ne sont jamais lues ici : « original manquant » et « copies
// à préparer » restent deux sujets (copies.js), sans alerte par copie.
// ------------------------------------------------------------------
import { CATEGORIES, CONDITIONS, SEVERITES, evenementDe } from '../data/acquisition.js'
import { lieuDe, LIEUX } from '../data/lieux.js'
import { LOADOUTS, rolesRecommandant } from '../data/loadouts.js'
import { objetDe, OBJETS } from '../data/objets.js'
import { nomsObjet } from './localisation.js'
import { estResolu, statutDe } from './progression.js'
import { normaliserAcquisition } from './acquisition-etat.js'
import { normaliserChoix } from './alternatives.js'

export const RESULTATS = {
  satisfait: 'Satisfait',
  'non-satisfait': 'Non satisfait',
  inconnu: 'À vérifier',
}

export const LIBELLE_A_VERIFIER = 'À vérifier sur votre version'

const ordreSeverite = (condition) => SEVERITES[condition.severite]?.ordre ?? 9

/** Évalue une condition pour un lot d'objets concernés (par défaut tous les siens). */
export function evaluerCondition(condition, etat, objets = condition.objets) {
  const acquisition = normaliserAcquisition(etat?.acquisition)
  const statutUtilisateur = acquisition.statuts[condition.id] ?? null
  const ignoree = statutUtilisateur === 'ignore'
  const concernes = objets.length > 0 ? objets : condition.objets

  const resultat = (valeur, raison) => ({ resultat: valeur, raison, ignoree, statutUtilisateur })

  if (concernes.every((id) => estResolu(statutDe(etat, id)))) return resultat('satisfait', 'original')
  const voie = condition.voies.find((entree) => acquisition.evenements[entree.id])
  if (voie) return resultat('satisfait', 'voie')
  if (statutUtilisateur === 'fait') return resultat('satisfait', 'declare')
  if (condition.irreversible && condition.evenement && acquisition.evenements[condition.evenement]) {
    return resultat('non-satisfait', 'ferme')
  }
  return resultat('inconnu', 'inconnu')
}

/** Objets du plan : références des rôles + alternatives choisies (+ toutes les options si demandé). */
export function objetsDuPlan(etat, { roles = null, alternatives = false } = {}) {
  const choisis = new Set(Object.values(normaliserChoix(etat?.choixAlternatives)))
  const ids = new Set()
  for (const ligne of LOADOUTS) {
    if (!ligne.objet || (roles && !roles.includes(ligne.role))) continue
    if (alternatives || ligne.rang === 'principal') ids.add(ligne.objet)
    else if (choisis.has(ligne.objet)) ids.add(ligne.objet)
  }
  return [...ids].filter((id) => objetDe(id))
}

/** Conditions touchant un objet, évaluées. */
export function alertesObjet(objetId, etat) {
  return CONDITIONS.filter((condition) => condition.objets.includes(objetId)).map((condition) => ({
    condition,
    evaluation: evaluerCondition(condition, etat, [objetId]),
  }))
}

/** Badges courts d'un objet : seules les alertes encore ouvertes et non ignorées. */
export function badgesObjet(objetId, etat) {
  return alertesObjet(objetId, etat)
    .filter(({ evaluation }) => evaluation.resultat !== 'satisfait' && !evaluation.ignoree)
    .map(({ condition, evaluation }) => ({
      id: condition.id,
      libelle: condition.confiance === 'a-verifier' ? LIBELLE_A_VERIFIER : CATEGORIES[condition.categorie].court,
      severite: condition.severite,
      resultat: evaluation.resultat,
      confiance: condition.confiance,
    }))
    .sort((a, b) => (SEVERITES[a.severite]?.ordre ?? 9) - (SEVERITES[b.severite]?.ordre ?? 9))
}

// --- Audit de couverture -----------------------------------------------------

export const NIVEAUX_AUDIT = {
  contraintes: 'Audité, contraintes connues',
  'sans-contrainte': 'Aucune contrainte connue (catalogue)',
  'non-audite': 'Non audité',
}

/**
 * Niveau d'audit d'un objet :
 *  - `contraintes` : au moins une condition sourcée ;
 *  - `sans-contrainte` : sources du catalogue sans verrou ni réserve et lieu
 *    connu — lues dans objets.js, PAS recoupées une à une sur le wiki ;
 *  - `non-audite` : le reste (verrou de PNJ/quête non détaillé, source à
 *    confirmer, lieu non catalogué). L'absence de condition n'y prouve rien.
 */
export function niveauAudit(objetId) {
  const objet = objetDe(objetId)
  if (CONDITIONS.some((condition) => condition.objets.includes(objetId))) return 'contraintes'
  if (!objet) return 'non-audite'
  const neutre = objet.sources.every(
    (source) => (!source.verrou || source.verrou === 'aucun') && !source.aConfirmer && source.lieu !== null,
  )
  return neutre ? 'sans-contrainte' : 'non-audite'
}

/** Tableau de couverture sur l'ensemble fini du catalogue (ou d'un sous-ensemble). */
export function tableauCouverture(ids = OBJETS.map((objet) => objet.id)) {
  const parNiveau = { contraintes: [], 'sans-contrainte': [], 'non-audite': [] }
  for (const id of ids) parNiveau[niveauAudit(id)].push(id)
  return { total: ids.length, ...parNiveau }
}

// --- Récapitulatif « Avant de quitter cette zone » ---------------------------

function lieuxDeObjet(objet) {
  return objet.sources.map((source) => source.lieu).filter(Boolean)
}

/**
 * Récapitulatif d'une zone pour le plan sélectionné. Une alerte commune à
 * plusieurs objets ou rôles n'apparaît qu'une fois, avec la liste de ceux
 * qu'elle concerne.
 */
export function recapZone(zoneId, etat, { roles = null, alternatives = false } = {}) {
  const plan = objetsDuPlan(etat, { roles, alternatives })
  const concernes = (condition) => condition.objets.filter((id) => plan.includes(id))

  const candidates = CONDITIONS.filter((condition) => {
    if (concernes(condition).length === 0) return false
    if (condition.zone === zoneId) return true
    return condition.objets.some((id) => lieuxDeObjet(objetDe(id)).includes(zoneId))
  })

  const alertes = candidates
    .map((condition) => {
      const objets = concernes(condition)
      return {
        condition,
        objets,
        roles: [...new Set(objets.flatMap((id) => rolesRecommandant(id)))].filter((role) => !roles || roles.includes(role)),
        evaluation: evaluerCondition(condition, etat, objets),
      }
    })
    .sort((a, b) => ordreSeverite(a.condition) - ordreSeverite(b.condition))

  const manquants = plan
    .filter((id) => lieuxDeObjet(objetDe(id)).includes(zoneId) && statutDe(etat, id) === 'a-recuperer')
    .map((id) => ({ id, nom: nomsObjet(objetDe(id)).principal }))

  const ouvertes = alertes.filter(({ evaluation }) => !evaluation.ignoree && evaluation.resultat !== 'satisfait')
  const ignorees = alertes.filter(({ evaluation }) => evaluation.ignoree)
  const resolues = alertes.filter(({ evaluation }) => !evaluation.ignoree && evaluation.resultat === 'satisfait')
  const nonAudites = plan.filter(
    (id) => lieuxDeObjet(objetDe(id)).includes(zoneId) && niveauAudit(id) === 'non-audite',
  )

  return {
    zone: lieuDe(zoneId),
    ouvertes,
    ignorees,
    resolues,
    manquants,
    nonAudites,
    // Jamais « zone sans risque » : seulement l'absence d'alerte ouverte dans les données vérifiées.
    rienDeBloquant: ouvertes.length === 0 && manquants.length === 0,
  }
}

/** Zones qui portent au moins une alerte ou un objet prévu, pour le sélecteur. */
export function zonesAvecAlertes(etat, options = {}) {
  return LIEUX.filter((lieu) => {
    const recap = recapZone(lieu.id, etat, options)
    return recap.ouvertes.length + recap.ignorees.length + recap.manquants.length > 0
  })
}

/** Zone proposée d'emblée : la première qui porte une alerte ouverte, sinon la première concernée. */
export function zoneParDefaut(etat, options = {}) {
  const zones = zonesAvecAlertes(etat, options)
  return zones.find((lieu) => recapZone(lieu.id, etat, options).ouvertes.length > 0) ?? zones[0] ?? null
}

/** Libellé neutre d'un événement déclaré (pour les listes). */
export function nomEvenement(id) {
  return evenementDe(id)?.nom ?? id
}
