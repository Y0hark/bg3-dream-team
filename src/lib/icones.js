// ------------------------------------------------------------------
// Icônes d'objets. Une image n'est servie que si sa provenance et sa licence
// sont documentées dans ICONES (objets-meta.js) ; sinon on retombe sur
// l'icône de repli du type d'équipement. Aucun chargement d'image tierce au
// runtime : `fichier` est un asset local de public/icones/.
// ------------------------------------------------------------------
import { OBJETS } from '../data/objets.js'

/** Repli par type d'équipement (glyphe, comme les icônes de builds.js). */
export const ICONES_REPLI = {
  Arme: '🗡️',
  'Arme à distance': '🏹',
  Bouclier: '🛡️',
  Casque: '🪖',
  Cape: '🧥',
  Armure: '🥋',
  Gants: '🧤',
  Bottes: '🥾',
  Amulette: '📿',
  Anneau: '💍',
  Consommable: '🧪',
}

export const ICONE_REPLI_DEFAUT = '❖'

export function repliDe(slot) {
  return ICONES_REPLI[slot] ?? ICONE_REPLI_DEFAUT
}

/** Une icône n'est valide que si fichier, source, licence et attribution sont renseignés. */
export function iconeValide(icone) {
  return ['fichier', 'source', 'licence', 'attribution'].every(
    (cle) => typeof icone?.[cle] === 'string' && icone[cle].trim() !== '',
  )
}

/** { src, repli, alt } : `src` vaut null quand aucune image vérifiée n'existe. */
export function iconeDe(objet, base = '/') {
  const valide = iconeValide(objet?.icone)
  return {
    src: valide ? `${base}icones/${objet.icone.fichier}` : null,
    repli: repliDe(objet?.slot),
    attribution: valide ? objet.icone.attribution : null,
  }
}

/** Couverture des icônes vérifiées : numérateur, dénominateur, exceptions. */
export function couvertureIcones(objets = OBJETS) {
  const sansIcone = objets.filter((objet) => !iconeValide(objet.icone)).map((objet) => objet.id)
  return { total: objets.length, avecIcone: objets.length - sansIcone.length, sansIcone }
}
