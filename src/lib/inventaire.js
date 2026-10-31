// ------------------------------------------------------------------
// Inventaire visuel par rôle et par acte : lecture du plan de loadouts.js.
//
// Trois choses restent distinctes (cf. docs/contrat-donnees-objets.md) :
//   - le PLAN (« Prévu pour l'acte ») : la référence du loadout, éventuellement
//     remplacée par une alternative choisie (`etat.choixAlternatives`) ;
//   - la POSSESSION de l'original (`etat.items`) ;
//   - l'ÉQUIPEMENT réel (« Équipé dans la run ») : exemplaire affecté au rôle
//     (`etat.copies[objet].affectes`).
//
// Rien ici n'écrit dans la sauvegarde : choisir une alternative ou changer
// d'acte ne marque jamais un objet comme obtenu ni équipé.
// ------------------------------------------------------------------
import { LIMITES_SLOTS, LOADOUTS, RANGS, SLOTS_REQUIS } from '../data/loadouts.js'
import { lieuDe } from '../data/lieux.js'
import { objetDe } from '../data/objets.js'
import { NOMS_USAGES } from '../data/objets-meta.js'
import { cleChoix, normaliserChoix, optionsDuSlot } from './alternatives.js'
import { descriptionObjet, nomsObjet } from './localisation.js'
import { statutDe } from './progression.js'
import { etatCopies } from './copies.js'

/** Ordre d'affichage : de la tête aux pieds, puis armes et consommable. */
export const ORDRE_SLOTS = [
  'Casque',
  'Cape',
  'Armure',
  'Gants',
  'Bottes',
  'Amulette',
  'Anneau',
  'Arme',
  'Bouclier',
  'Arme à distance',
  'Consommable',
]

/** Nombre d'options montrées avant « Voir toutes les options » (hors référence). */
export const SEUIL_ALTERNATIVES = 3

export const ETATS_EMPLACEMENT = {
  vide: 'Vide',
  prevu: 'Prévu',
  disponible: 'Disponible',
  equipe: 'Équipé',
}

export const LIBELLES_PLAN = {
  prevu: 'Prévu pour l’acte',
  equipe: 'Équipé dans la run',
}

const VERROUS = {
  quete: 'Dépend d’une quête',
  pnj: 'Dépend d’un PNJ (peut disparaître)',
  'zone-dangereuse': 'Zone dangereuse',
  'point-de-non-retour': 'Point de non-retour : à prendre avant de partir',
  'ressource-unique': 'Ressource unique de la run',
}

const ordreRang = (option) => RANGS.indexOf(option.rang)

/** Libellé d'un emplacement : « Anneau 1 », « Anneau 2 », sinon le slot. */
function libelleEmplacement(slot, indice) {
  return (LIMITES_SLOTS[slot] ?? 1) > 1 ? `${slot} ${indice + 1}` : slot
}

/** Un slot est montré s'il porte une ligne à cet acte, ou s'il est requis. */
function slotsAffiches(role, acte) {
  const presents = new Set(
    LOADOUTS.filter(
      (ligne) => ligne.role === role && ligne.acte <= acte && acte <= (ligne.jusquA ?? ligne.acte),
    ).map((ligne) => ligne.slot),
  )
  return ORDRE_SLOTS.filter((slot) => presents.has(slot) || SLOTS_REQUIS.includes(slot))
}

/**
 * État d'un emplacement pour une option donnée : vide (aucun objet voulu),
 * équipé (un exemplaire est affecté à ce rôle), disponible (original obtenu,
 * pas encore affecté), sinon prévu.
 */
export function etatEmplacement(option, role, etat) {
  if (!option?.objet) return 'vide'
  const objet = objetDe(option.objet)
  if (!objet) return 'prevu'
  const statut = statutDe(etat, objet.id)
  const vue = etatCopies(objet, statut, etat?.copies?.[objet.id], [])
  if (vue.affectes.includes(role)) return 'equipe'
  return statut === 'obtenu' ? 'disponible' : 'prevu'
}

/**
 * Emplacements d'un rôle à un acte. Pour chacun : la référence du plan,
 * l'option courante (choix éventuel), et les options proposables — la
 * référence d'abord, puis par rang. Un objet déjà occupé par un autre
 * emplacement du même slot (deuxième anneau) n'est pas reproposé.
 */
export function inventaireRole(role, acte, etat) {
  const choix = normaliserChoix(etat?.choixAlternatives)
  const emplacements = []

  for (const slot of slotsAffiches(role, acte)) {
    const options = optionsDuSlot(role, acte, slot)
    const references = options.filter((option) => option.rang === 'principal')
    const nombre = LIMITES_SLOTS[slot] ?? 1

    const courants = []
    for (let indice = 0; indice < nombre; indice += 1) {
      const reference = references[indice] ?? null
      const choisi = choix[cleChoix(role, acte, slot, indice)]
      const optionChoisie = choisi ? options.find((option) => option.objet === choisi) : null
      courants.push({ reference, optionChoisie })
    }

    for (let indice = 0; indice < nombre; indice += 1) {
      const { reference, optionChoisie } = courants[indice]
      // Un objet porté par un autre emplacement du même slot n'est pas libre.
      const occupes = new Set(
        courants
          .map((courant, autre) => (autre === indice ? null : (courant.optionChoisie ?? courant.reference)?.objet))
          .filter(Boolean),
      )
      const proposables = options
        .filter((option) => option.objet && !occupes.has(option.objet))
        .filter((option, position, liste) => liste.findIndex((autre) => autre.objet === option.objet) === position)
        .sort((a, b) => {
          if (a === reference) return -1
          if (b === reference) return 1
          return ordreRang(a) - ordreRang(b)
        })
      const courante = optionChoisie ?? reference

      emplacements.push({
        cle: cleChoix(role, acte, slot, indice),
        slot,
        indice,
        libelle: libelleEmplacement(slot, indice),
        reference,
        courante,
        choisie: Boolean(optionChoisie && optionChoisie !== reference),
        options: proposables,
        etat: etatEmplacement(courante, role, etat),
        conserveDepuis: courante && courante.acte < acte ? courante.acte : null,
      })
    }
  }
  return emplacements
}

/** Options visibles d'abord : la référence, puis au plus `seuil` alternatives. */
export function optionsVisibles(options, { seuil = SEUIL_ALTERNATIVES, toutes = false, usage = null } = {}) {
  const filtrees = usage ? options.filter((option) => option.usages.includes(usage) || option.rang === 'principal') : options
  if (toutes) return filtrees
  const references = filtrees.filter((option) => option.rang === 'principal')
  const autres = filtrees.filter((option) => option.rang !== 'principal')
  return [...references, ...autres.slice(0, seuil)]
}

/** Usages réellement portés par au moins une option : seuls filtres proposés. */
export function usagesDisponibles(options) {
  const presents = new Set(options.flatMap((option) => option.usages))
  return Object.keys(NOMS_USAGES).filter((usage) => presents.has(usage))
}

/** Avertissement d'acquisition d'un objet : verrou ou source à confirmer. */
export function avertissementsObjet(objet) {
  if (!objet) return []
  const avertissements = []
  for (const source of objet.sources) {
    if (source.verrou && source.verrou !== 'aucun') avertissements.push(VERROUS[source.verrou])
  }
  if (objet.sources.some((source) => source.aConfirmer)) avertissements.push('Source à confirmer')
  if (objet.sources.some((source) => source.lieu === null)) avertissements.push('Lieu à localiser')
  return [...new Set(avertissements)]
}

/**
 * Fiche d'un objet pour un emplacement : mêmes informations pour l'aperçu
 * (survol / focus) et la fiche persistante (clic / appui) — l'aperçu n'en
 * montre qu'un extrait.
 */
export function ficheObjet(option) {
  const objet = option?.objet ? objetDe(option.objet) : null
  if (!objet) return null
  const noms = nomsObjet(objet)
  return {
    id: objet.id,
    nom: noms.principal,
    nomSecondaire: noms.secondaire,
    slot: objet.slot,
    effet: descriptionObjet(objet).texte,
    interet: option.interet,
    condition: option.condition,
    nature: option.nature,
    usages: option.usages ?? [],
    wiki: objet.wiki,
    avertissements: avertissementsObjet(objet),
    acquisition: objet.sources.map((source) => {
      const lieu = lieuDe(source.lieu)
      return {
        acte: source.acte,
        lieu: lieu?.nom ?? null,
        lienLieu: lieu?.carte ?? lieu?.wiki ?? null,
        texte: source.texte,
        rattrapage: source.rattrapage,
        aConfirmer: source.aConfirmer,
        verrou: source.verrou && source.verrou !== 'aucun' ? VERROUS[source.verrou] : null,
      }
    }),
  }
}

/**
 * Avertissements de compatibilité entre emplacements. Les données ne portent
 * ni la prise en main (une main / deux mains) ni les maîtrises : on ne
 * l'affirme donc jamais, on signale seulement ce qui mérite une vérification.
 */
export function avertissementsCompatibilite(role, emplacements) {
  const portes = new Map(emplacements.map((emplacement) => [emplacement.slot, emplacement.courante?.objet ?? null]))
  const avertissements = []
  if (portes.get('Arme') && portes.get('Bouclier')) {
    avertissements.push(
      'Arme et bouclier prévus ensemble : les données n’indiquent pas si l’arme se tient à une main. Compatibilité non garantie.',
    )
  }
  if (role === 'moine-main-ouverte' && (portes.get('Arme') || portes.get('Bouclier'))) {
    avertissements.push(
      'Moine Main ouverte : une arme ou un bouclier peut contredire le combat à mains libres. Non vérifié par les données.',
    )
  }
  return avertissements
}
