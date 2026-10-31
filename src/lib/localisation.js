// ------------------------------------------------------------------
// Localisation des objets : français par défaut, repli anglais CHAMP PAR
// CHAMP. Un champ français absent ou vide retombe sur l'anglais ; on n'affiche
// jamais undefined, une clé technique ni une traduction inventée.
//
// Deux natures de texte français, à ne pas confondre :
// - nom officiel vérifié (`nomFr`, avec `sourceNomFr`) — traduction en jeu ;
// - résumé éditorial (`effet`) — rédigé pour l'application, jamais présenté
//   comme une traduction officielle.
// Les identifiants et les exports planner ne passent jamais par ici.
// ------------------------------------------------------------------
import { OBJETS } from '../data/objets.js'

export const LANGUE_DEFAUT = 'fr'

/** Retire accents et casse : « Écharpe » et « echarpe » se trouvent. */
export function normaliserTexte(texte) {
  return String(texte ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function texteUtile(valeur) {
  return typeof valeur === 'string' && valeur.trim() !== '' ? valeur.trim() : null
}

/** Premier texte exploitable dans l'ordre des langues ; null si aucun. */
export function champLocalise(valeurs, langue = LANGUE_DEFAUT) {
  const ordre = langue === 'en' ? ['en'] : ['fr', 'en']
  for (const code of ordre) {
    const texte = texteUtile(valeurs?.[code])
    if (texte) return { texte, langue: code }
  }
  return null
}

/**
 * Nom affichable d'un objet. `officiel` n'est vrai que pour un nom français
 * vérifié ; le nom anglais est le nom en jeu, toujours disponible.
 */
export function nomObjet(objet, langue = LANGUE_DEFAUT) {
  const champ = champLocalise({ fr: objet?.nomFr, en: objet?.nom }, langue)
  return {
    texte: champ?.texte ?? '',
    langue: champ?.langue ?? 'en',
    officiel: champ?.langue === 'fr' && texteUtile(objet?.sourceNomFr) !== null,
  }
}

/** Description courte : résumé éditorial français (jamais « officiel »). */
export function descriptionObjet(objet, langue = LANGUE_DEFAUT) {
  const champ = champLocalise({ fr: objet?.effet, en: objet?.effetEn }, langue)
  return { texte: champ?.texte ?? '', langue: champ?.langue ?? 'fr', editorial: true }
}

/** Les deux noms, pour un affichage « nom FR · nom en jeu » sans doublon. */
export function nomsObjet(objet) {
  const fr = texteUtile(objet?.nomFr)
  const en = texteUtile(objet?.nom)
  return { principal: fr ?? en ?? '', secondaire: fr && en && fr !== en ? en : null }
}

/** Recherche bilingue et insensible aux accents (nom FR, nom EN, slot). */
export function correspondRecherche(objet, requete) {
  const aiguille = normaliserTexte(requete)
  if (!aiguille) return true
  const foin = normaliserTexte(`${objet?.nomFr ?? ''} ${objet?.nom ?? ''} ${objet?.slot ?? ''}`)
  return foin.includes(aiguille)
}

/**
 * Couverture française : numérateur / dénominateur et exceptions, pour
 * documenter ce qui est réellement traduit plutôt que de le présumer.
 */
export function couvertureFrancaise(objets = OBJETS) {
  const sansNomOfficiel = objets.filter((objet) => !nomObjet(objet).officiel).map((objet) => objet.id)
  const sansDescription = objets.filter((objet) => !texteUtile(objet.effet)).map((objet) => objet.id)
  return {
    total: objets.length,
    nomsOfficiels: objets.length - sansNomOfficiel.length,
    descriptions: objets.length - sansDescription.length,
    sansNomOfficiel,
    sansDescription,
  }
}
