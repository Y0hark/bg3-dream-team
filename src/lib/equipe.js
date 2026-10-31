// ------------------------------------------------------------------
// Vue d'équipe : les quatre rôles comparés à un acte.
//
// Aucun suivi concurrent : tout est CALCULÉ à partir de ce qui existe déjà.
//   - le PLAN d'un rôle (`inventaireRole`, avec les alternatives choisies) ;
//   - la possession de l'original (`etat.items`) ;
//   - les exemplaires et l'équipement réel (`etat.copies`, cf. copies.js).
//
// Invariants (aucun n'est stocké, tous sont recalculés) :
//   1. équipé(objet) ≤ exemplaires(objet) — `etatCopies` ne montre jamais plus
//      d'affectations que d'exemplaires, et `affecter` refuse sans exemplaire libre ;
//   2. un rôle appartient à `affectes` au plus une fois par objet : un même
//      exemplaire ne peut pas être porté par deux porteurs ;
//   3. un plan n'est jamais une affectation : prévoir un objet pour quatre
//      rôles avec un seul exemplaire laisse trois rôles « prévus », pas équipés ;
//   4. la possession est globale à la run, les plans sont indexés par acte :
//      comparer un autre acte ne déplace aucun exemplaire.
// ------------------------------------------------------------------
import { LIMITES_SLOTS } from '../data/loadouts.js'
import { objetDe } from '../data/objets.js'
import { copiePossible, etatCopies, REGLAGES_COPIES } from './copies.js'
import { inventaireRole } from './inventaire.js'
import { statutDe } from './progression.js'

/** Statuts d'un porteur pour un objet prévu — jamais déduits les uns des autres. */
export const STATUTS_PORTEUR = {
  vide: 'Aucune option choisie',
  equipe: 'Équipé',
  'a-affecter': 'Exemplaire libre à affecter',
  'copie-a-preparer': 'Copie à préparer',
  'original-a-recuperer': 'Original à récupérer',
  indisponible: 'Exemplaire unique déjà affecté',
}

/**
 * Statut d'un objet prévu pour UN rôle.
 * - equipe : un exemplaire est affecté à ce rôle ;
 * - original-a-recuperer : aucun exemplaire (original pas obtenu) ;
 * - a-affecter : un exemplaire libre existe ;
 * - copie-a-preparer : tous les exemplaires sont portés, une copie peut en créer un ;
 * - indisponible : tous portés et l'objet ne se copie pas (ou la copie est impossible).
 */
export function statutPorteur(objetId, role, etat) {
  if (!objetId) return 'vide'
  const objet = objetDe(objetId)
  if (!objet) return 'vide'
  const statut = statutDe(etat, objetId)
  const vue = etatCopies(objet, statut, etat?.copies?.[objetId], [])
  if (vue.affectes.includes(role)) return 'equipe'
  if (vue.exemplaires === 0) return 'original-a-recuperer'
  if (vue.libres >= 1) return 'a-affecter'
  return copiePossible(objet, statut) === 'non' ? 'indisponible' : 'copie-a-preparer'
}

/** Plans (rôle → emplacements) d'un acte, tels que l'inventaire les construit. */
export function plansDeLActe(roles, acte, etat) {
  return roles.map((role) => ({
    role,
    emplacements: inventaireRole(role, acte, etat).map((emplacement) => ({
      cle: emplacement.cle,
      slot: emplacement.slot,
      libelle: emplacement.libelle,
      objet: emplacement.courante?.objet ?? null,
      choisie: emplacement.choisie,
    })),
  }))
}

/**
 * Besoins de l'équipe, par objet prévu par au moins un rôle. Le manque
 * d'original et le manque de copies sont deux actions distinctes :
 *  - `originalARecuperer` : aucun exemplaire, l'original reste à obtenir ;
 *  - `copiesAPreparer` : exemplaires supplémentaires à créer en plus de
 *    l'original (0 pour un objet non copiable) ;
 *  - `conflitUnique` : objet non copiable voulu par plusieurs porteurs.
 */
export function besoinsEquipe(plans, etat) {
  const parObjet = new Map()
  for (const plan of plans) {
    for (const emplacement of plan.emplacements) {
      if (!emplacement.objet) continue
      if (!parObjet.has(emplacement.objet)) parObjet.set(emplacement.objet, new Set())
      parObjet.get(emplacement.objet).add(plan.role)
    }
  }

  const besoins = []
  for (const [objetId, rolesSet] of parObjet) {
    const objet = objetDe(objetId)
    if (!objet) continue
    const statut = statutDe(etat, objetId)
    const vue = etatCopies(objet, statut, etat?.copies?.[objetId], [])
    const roles = [...rolesSet]
    const enAttente = roles.filter((role) => !vue.affectes.includes(role))
    // Un porteur déjà équipé hors plan garde son exemplaire : il compte dans la demande.
    const demande = enAttente.length + vue.affectes.length
    const disponibles = Math.max(vue.exemplaires, 1)
    const copiable = objet.copiable && REGLAGES_COPIES.copiesAutorisees

    besoins.push({
      objet: objetId,
      roles,
      enAttente,
      exemplaires: vue.exemplaires,
      equipes: vue.affectes.length,
      libres: vue.libres,
      originalARecuperer: vue.exemplaires === 0,
      copiesAPreparer: copiable ? Math.max(0, demande - disponibles) : 0,
      conflitUnique: !objet.copiable && demande > 1,
    })
  }
  return besoins
}

/** Équipement réel d'un rôle qui dépasse la limite d'un slot (quelles que soient les copies). */
export function depassementsEquipes(role, etat) {
  const parSlot = {}
  for (const [objetId, suivi] of Object.entries(etat?.copies ?? {})) {
    const objet = objetDe(objetId)
    if (!objet) continue
    const vue = etatCopies(objet, statutDe(etat, objetId), suivi, [])
    if (!vue.affectes.includes(role)) continue
    parSlot[objet.slot] = (parSlot[objet.slot] ?? 0) + 1
  }
  return Object.entries(parSlot)
    .filter(([slot, nombre]) => nombre > (LIMITES_SLOTS[slot] ?? 1))
    .map(([slot, nombre]) => ({ role, slot, nombre, limite: LIMITES_SLOTS[slot] ?? 1 }))
}

/**
 * Vue d'équipe complète pour un acte : plans, besoins, slots sans option et
 * dépassements d'équipement réel.
 */
export function vueEquipe(roles, acte, etat) {
  const plans = plansDeLActe(roles, acte, etat)
  const besoins = besoinsEquipe(plans, etat)
  return {
    acte,
    plans: plans.map((plan) => ({
      role: plan.role,
      emplacements: plan.emplacements.map((emplacement) => ({
        ...emplacement,
        statut: statutPorteur(emplacement.objet, plan.role, etat),
      })),
      depassements: depassementsEquipes(plan.role, etat),
    })),
    besoins,
    originauxARecuperer: besoins.filter((besoin) => besoin.originalARecuperer),
    copiesAPreparer: besoins.filter((besoin) => besoin.copiesAPreparer > 0),
    conflitsUniques: besoins.filter((besoin) => besoin.conflitUnique),
    slotsSansOption: plans.flatMap((plan) =>
      plan.emplacements
        .filter((emplacement) => !emplacement.objet)
        .map((emplacement) => ({ role: plan.role, slot: emplacement.slot, libelle: emplacement.libelle })),
    ),
  }
}
