// ------------------------------------------------------------------
// Vue DÉRIVÉE du catalogue pour les pages existantes (Items, Loadout, Lieux,
// Dashboard…) : une entrée par objet canonique, calculée depuis objets.js et
// loadouts.js. Ce fichier ne contient plus de données à la main — éditer le
// catalogue, c'est éditer objets.js (définition + sources) ou loadouts.js
// (emploi par rôle et par acte).
//
// Pourquoi une entrée par OBJET et non par (objet, rôle) : le statut
// « obtenu / raté » d'une progression est celui de l'original, il ne dépend
// pas du nombre de rôles qui le portent. L'ID est donc celui de l'objet, ce
// qui préserve la progression des sauvegardes existantes pour les objets
// inchangés. Le détail par rôle (`roles`, loadouts.js) est la matière du
// ticket tracker 3/4 ; l'ancien catalogue est dans items-anciens.js.
// ------------------------------------------------------------------
import { BUILDS } from './builds.js'
import { LOADOUTS } from './loadouts.js'
import { OBJETS } from './objets.js'

/** Ordre d'affichage des priorités, du plus critique au plus accessoire. */
export const PRIORITES = ['S+', 'S', 'A', 'B']

const PRIORITE_PAR_RANG = {
  principal: 'S',
  alternative: 'A',
  situationnel: 'B',
  reserve: 'B',
}

const ORDRE_RANGS = ['principal', 'alternative', 'situationnel', 'reserve']
const ORDRE_ROLES = BUILDS.map((build) => build.id)

function priorite(objet, lignes) {
  if (objet.critique) return 'S+'
  const meilleur = ORDRE_RANGS.find((rang) => lignes.some((ligne) => ligne.rang === rang))
  return PRIORITE_PAR_RANG[meilleur] ?? 'B'
}

function derive(objet) {
  const lignes = LOADOUTS.filter((ligne) => ligne.objet === objet.id)
  if (lignes.length === 0) return null

  const roles = ORDRE_ROLES.filter((role) => lignes.some((ligne) => ligne.role === role))
  // Rôle « propriétaire » : celui qui le recommande en principal le plus tôt.
  const proprietaire =
    [...lignes].sort(
      (a, b) =>
        ORDRE_RANGS.indexOf(a.rang) - ORDRE_RANGS.indexOf(b.rang) ||
        a.acte - b.acte ||
        ORDRE_ROLES.indexOf(a.role) - ORDRE_ROLES.indexOf(b.role),
    )[0]?.role ?? roles[0]

  const [principale] = objet.sources
  const acte = Math.min(...objet.sources.map((source) => source.acte))

  return {
    id: objet.id,
    nom: objet.nom,
    slot: objet.slot,
    acte,
    personnage: proprietaire,
    roles,
    priorite: priorite(objet, lignes),
    lieu: principale.lieu,
    source: objet.sources.map((source) => source.texte).join(' · '),
    wiki: objet.wiki,
    note: objet.effet,
    copiable: objet.copiable,
    aConfirmer: objet.sources.some((source) => source.aConfirmer) || principale.lieu === null,
  }
}

export const ITEMS = OBJETS.map(derive).filter(Boolean)

/** Slots présents dans le catalogue, dans l'ordre de première apparition. */
export const SLOTS = [...new Set(ITEMS.map((item) => item.slot))]

export function itemDe(id) {
  return ITEMS.find((item) => item.id === id) ?? null
}
