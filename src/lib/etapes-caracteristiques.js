// ------------------------------------------------------------------
// Étapes de caractéristiques d'un build, présentées SÉPARÉMENT :
//
//   1. création           — valeurs de départ ;
//   2. progression        — cumul après chaque don (jamais deux fois le même) ;
//   3. permanents         — bonus obtenus (Cheveu…), seulement s'ils sont choisis ;
//   4. équipées           — valeurs fixées par objet / élixir, qui REMPLACENT
//                           la valeur si elle est supérieure (jamais additionnées) ;
//   5. respécialisation   — proposition d'une fiche, distincte de l'export.
//
// Ce n'est pas un moteur de règles BG3 : on affiche des étapes documentées. Une
// valeur qui dépend d'un choix non confirmé (élixir non sélectionné, objet non
// obtenu) vaut `null` et porte la raison, plutôt que d'être fabriquée.
// ------------------------------------------------------------------
import { caracteristiquesEffectives } from './niveaux.js'

const STATS = ['FOR', 'DEX', 'CON', 'INT', 'SAG', 'CHA']

/** Étapes de progression : une ligne par niveau de don, valeurs cumulées. */
export function etapesProgression(caracteristiques) {
  const niveaux = [...new Set((caracteristiques.bonusDons ?? []).map((bonus) => bonus.niveau))].sort(
    (a, b) => a - b,
  )
  return niveaux.map((niveau) => ({
    niveau,
    sources: caracteristiques.bonusDons.filter((bonus) => bonus.niveau === niveau).map((bonus) => bonus.source),
    valeurs: caracteristiquesEffectives(caracteristiques, niveau),
  }))
}

/**
 * Valeurs fixées par un objet ou un élixir, une entrée par source : la valeur
 * fixée, l'état de vérification, la référence, et la valeur résultante pour
 * UNE source sélectionnée (jamais pour toutes à la fois).
 */
export function valeursEquipees(caracteristiques, niveau, selection = {}) {
  const base = caracteristiquesEffectives(caracteristiques, niveau, { permanents: selection.permanents })
  return (caracteristiques.fixees ?? []).map((fixe) => ({
    id: fixe.id,
    source: fixe.source,
    type: fixe.type,
    stat: fixe.stat,
    fixee: fixe.valeur,
    naturelle: base[fixe.stat],
    condition: fixe.condition ?? null,
    verification: fixe.verification ?? 'fiche',
    reference: fixe.reference ?? null,
    selectionnee: (selection.fixees ?? []).includes(fixe.id),
    effective: (selection.fixees ?? []).includes(fixe.id) ? Math.max(base[fixe.stat], fixe.valeur) : null,
  }))
}

/**
 * Valeur d'une statistique avec la sélection de la run. Pour une stat que
 * seules des sources fixées peuvent porter (FOR du Moine), l'absence de
 * sélection renvoie la valeur NATURELLE et `dependDUnChoix: true` — pas une
 * FOR élevée implicite.
 */
export function valeurDe(caracteristiques, stat, niveau, selection = {}) {
  const naturelle = caracteristiquesEffectives(caracteristiques, niveau, { permanents: selection.permanents })[stat]
  const effective = caracteristiquesEffectives(caracteristiques, niveau, selection)[stat]
  const sources = (caracteristiques.fixees ?? []).filter((fixe) => fixe.stat === stat)
  const choisi = sources.some((fixe) => (selection.fixees ?? []).includes(fixe.id))
  return { naturelle, effective, dependDUnChoix: sources.length > 0 && !choisi }
}

/** Plan complet à afficher pour un build au niveau 12 (ou un autre niveau). */
export function etapesCaracteristiques(build, { niveau = 12, selection = {} } = {}) {
  const car = build.caracteristiques
  return {
    creation: car.creation,
    progression: etapesProgression(car),
    permanents: (car.bonusPermanents ?? []).map((bonus) => ({
      ...bonus,
      obtenu: (selection.permanents ?? []).includes(bonus.id),
    })),
    equipees: valeursEquipees(car, niveau, selection),
    respecialisations: (car.variantes ?? []).map((variante) => ({
      id: variante.id,
      nom: variante.nom,
      condition: variante.condition ?? null,
      creation: variante.creation,
      final: caracteristiquesEffectives(variante, niveau, { permanents: selection.permanents }),
    })),
    export: build.export?.caracteristiques
      ? caracteristiquesEffectives(build.export.caracteristiques, niveau)
      : null,
    stats: STATS,
  }
}
