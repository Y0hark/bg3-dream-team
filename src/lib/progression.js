// ------------------------------------------------------------------
// Progression de la run : statuts d'items, comptages et filtres.
//
// Tout est en fonctions pures : l'état vient du hook useProgression, qui
// se contente de le persister. C'est ce fichier que couvrent les tests.
// ------------------------------------------------------------------
import { ACTES } from '../data/actes.js'
import { BUILDS } from '../data/builds.js'
import { PRIORITES } from '../data/items.js'

export const STATUTS = [
  {
    id: 'a-recuperer',
    nom: 'À récupérer',
    icone: '○',
    puce: 'border-or-700/40 text-gray-400',
    barre: 'bg-gray-500/60',
  },
  {
    id: 'obtenu',
    nom: 'Obtenu',
    icone: '◆',
    puce: 'border-emerald-400/45 text-emerald-300',
    barre: 'bg-emerald-400/80',
  },
  {
    id: 'rate',
    nom: 'Raté',
    icone: '✕',
    puce: 'border-red-400/45 text-red-300',
    barre: 'bg-red-400/80',
  },
  {
    id: 'remplace',
    nom: 'Remplacé',
    icone: '⇄',
    puce: 'border-sky-400/45 text-sky-300',
    barre: 'bg-sky-400/70',
  },
]

export const STATUT_DEFAUT = 'a-recuperer'

/** Statuts qui sortent l'item de la liste des choses à faire. */
const RESOLUS = new Set(['obtenu', 'remplace'])

const IDS_STATUTS = new Set(STATUTS.map((statut) => statut.id))

export function statutValide(id) {
  return IDS_STATUTS.has(id) ? id : STATUT_DEFAUT
}

export function statutDe(etat, itemId) {
  return statutValide(etat?.items?.[itemId])
}

export function infosStatut(id) {
  return STATUTS.find((statut) => statut.id === statutValide(id)) ?? STATUTS[0]
}

export function estResolu(statut) {
  return RESOLUS.has(statut)
}

/** État de départ — également la forme attendue par le stockage local. */
export function etatInitial() {
  return { items: {}, checklist: {} }
}

/**
 * Nettoie un état venu du stockage : une clé inconnue ou un statut corrompu
 * ne doit pas casser l'affichage.
 */
export function normaliserEtat(brut) {
  const etat = etatInitial()
  if (!brut || typeof brut !== 'object') return etat

  if (brut.items && typeof brut.items === 'object') {
    for (const [id, statut] of Object.entries(brut.items)) {
      if (typeof statut !== 'string' || !IDS_STATUTS.has(statut)) continue
      // Le statut par défaut n'a pas besoin d'être stocké.
      if (statut !== STATUT_DEFAUT) etat.items[id] = statut
    }
  }

  if (brut.checklist && typeof brut.checklist === 'object') {
    for (const [id, coche] of Object.entries(brut.checklist)) {
      if (coche === true) etat.checklist[id] = true
    }
  }

  return etat
}

/** Cycle du clic simple sur une carte d'item : à récupérer ⇄ obtenu. */
export function statutBascule(statut) {
  return statut === 'obtenu' ? STATUT_DEFAUT : 'obtenu'
}

/**
 * Comptage d'un lot d'items. `pourcentage` est arrondi à l'entier et ne vaut
 * 100 que si tout est réellement résolu (obtenu ou volontairement remplacé).
 */
export function compter(items, etat) {
  const total = items.length
  let obtenus = 0
  let rates = 0
  let remplaces = 0

  for (const item of items) {
    const statut = statutDe(etat, item.id)
    if (statut === 'obtenu') obtenus += 1
    else if (statut === 'rate') rates += 1
    else if (statut === 'remplace') remplaces += 1
  }

  const resolus = obtenus + remplaces
  return {
    total,
    obtenus,
    rates,
    remplaces,
    resolus,
    restants: total - resolus - rates,
    pourcentage: total === 0 ? 0 : Math.round((resolus / total) * 100),
  }
}

export function progressionParActe(items, etat) {
  return ACTES.map((acte) => ({
    acte,
    ...compter(
      items.filter((item) => item.acte === acte.numero),
      etat,
    ),
  }))
}

export function progressionParPersonnage(items, etat, builds) {
  return builds.map((build) => ({
    build,
    ...compter(
      items.filter((item) => item.personnage === build.id),
      etat,
    ),
  }))
}

/** Items marqués « Raté » : la section risques du dashboard. */
export function itemsRates(items, etat) {
  return items.filter((item) => statutDe(etat, item.id) === 'rate')
}

/** Items S+ et S encore à récupérer : les urgences de la run. */
export function itemsCritiques(items, etat) {
  return items.filter(
    (item) =>
      (item.priorite === 'S+' || item.priorite === 'S') &&
      statutDe(etat, item.id) === STATUT_DEFAUT,
  )
}

export const FILTRES_VIDES = {
  acte: 'tous',
  personnage: 'tous',
  priorite: 'tous',
  statut: 'tous',
  recherche: '',
}

export function filtresActifs(filtres) {
  return Object.keys(FILTRES_VIDES).some((cle) => filtres[cle] !== FILTRES_VIDES[cle])
}

export function filtrerItems(items, filtres, etat) {
  const recherche = filtres.recherche?.trim().toLowerCase() ?? ''

  return items.filter((item) => {
    if (filtres.acte !== 'tous' && item.acte !== Number(filtres.acte)) return false
    if (filtres.personnage !== 'tous' && item.personnage !== filtres.personnage) return false
    if (filtres.priorite !== 'tous' && item.priorite !== filtres.priorite) return false
    if (filtres.statut !== 'tous' && statutDe(etat, item.id) !== filtres.statut) return false
    if (recherche) {
      const foin = `${item.nom} ${item.slot} ${item.source ?? ''} ${item.note ?? ''}`.toLowerCase()
      if (!foin.includes(recherche)) return false
    }
    return true
  })
}

const RANG_PRIORITE = new Map(PRIORITES.map((priorite, index) => [priorite, index]))

/** Tri d'affichage : acte croissant, puis priorité décroissante, puis nom. */
export function trierItems(items) {
  return [...items].sort(
    (a, b) =>
      a.acte - b.acte ||
      (RANG_PRIORITE.get(a.priorite) ?? 99) - (RANG_PRIORITE.get(b.priorite) ?? 99) ||
      a.nom.localeCompare(b.nom, 'fr'),
  )
}

/**
 * Regroupe un lot d'items par acte, dans l'ordre des actes. Les actes sans
 * item sont omis : le catalogue filtré ne doit pas afficher de section vide.
 */
export function grouperParActe(items) {
  return ACTES.map((acte) => ({
    acte,
    items: items.filter((item) => item.acte === acte.numero),
  })).filter((groupe) => groupe.items.length > 0)
}

/** Comptage d'une checklist : cases cochées sur total, et acte validé ou non. */
export function compterChecklist(checklist, etat) {
  const total = checklist?.entrees?.length ?? 0
  const coches = (checklist?.entrees ?? []).filter((entree) => etat?.checklist?.[entree.id]).length
  return {
    coches,
    total,
    complet: total > 0 && coches === total,
    pourcentage: total === 0 ? 0 : Math.round((coches / total) * 100),
  }
}

/** Vue d'ensemble des checklists : une entrée par acte, plus le cumul. */
export function progressionChecklists(checklists, etat) {
  const parActe = checklists.map((checklist) => ({
    checklist,
    acte: ACTES.find((acte) => acte.numero === checklist.acte) ?? null,
    ...compterChecklist(checklist, etat),
  }))

  const coches = parActe.reduce((somme, entree) => somme + entree.coches, 0)
  const total = parActe.reduce((somme, entree) => somme + entree.total, 0)

  return {
    parActe,
    coches,
    total,
    actesValides: parActe.filter((entree) => entree.complet).length,
    pourcentage: total === 0 ? 0 : Math.round((coches / total) * 100),
  }
}

// ------------------------------------------------------------------
// Filtres du catalogue dans l'URL
//
// Une vue filtrée doit survivre à un rechargement et pouvoir être envoyée
// telle quelle à un coéquipier : les filtres vivent donc dans la query
// string. Seuls les filtres actifs y sont écrits — l'URL reste lisible.
// ------------------------------------------------------------------

export function filtresVersParams(filtres) {
  const params = {}
  for (const cle of Object.keys(FILTRES_VIDES)) {
    const valeur = filtres[cle]
    if (valeur && valeur !== FILTRES_VIDES[cle]) params[cle] = String(valeur)
  }
  return params
}

/**
 * Relecture d'une query string. Une valeur inconnue — acte inexistant,
 * statut renommé depuis, lien vieilli — retombe sur « tous » plutôt que de
 * vider silencieusement le catalogue.
 */
export function filtresDepuisParams(params) {
  const lire = (cle) => params?.get?.(cle) ?? null
  const filtres = { ...FILTRES_VIDES }

  const acte = lire('acte')
  if (acte && ACTES.some((entree) => String(entree.numero) === acte)) filtres.acte = acte

  const personnage = lire('personnage')
  if (personnage && BUILDS.some((build) => build.id === personnage)) {
    filtres.personnage = personnage
  }

  const priorite = lire('priorite')
  if (priorite && PRIORITES.includes(priorite)) filtres.priorite = priorite

  const statut = lire('statut')
  if (statut && IDS_STATUTS.has(statut)) filtres.statut = statut

  const recherche = lire('recherche')
  if (recherche) filtres.recherche = recherche

  return filtres
}
