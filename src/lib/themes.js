// Registre des thèmes. Les palettes elles-mêmes vivent dans src/index.css,
// sous [data-theme='…'] ; on ne garde ici que l'identité et un échantillon
// de trois teintes (fond, métal, accent) pour l'aperçu du sélecteur.

export const THEMES = [
  {
    id: 'grimoire',
    nom: 'Grimoire',
    famille: 'sombre',
    resume: 'Encre noire et dorures',
    echantillon: ['#07070b', '#c9a227', '#f6e7b4'],
  },
  {
    id: 'flagelleur',
    nom: 'Flagelleur',
    famille: 'sombre',
    resume: 'Améthyste et néon cérébral',
    echantillon: ['#08070f', '#9576e4', '#ebe4ff'],
  },
  {
    id: 'avernus',
    nom: 'Avernus',
    famille: 'sombre',
    resume: 'Charbon chaud et cuivre battu',
    echantillon: ['#0e0a08', '#c57439', '#fadcc3'],
  },
  {
    id: 'parchemin',
    nom: 'Parchemin',
    famille: 'clair',
    resume: 'Vélin ancien et encre brune',
    echantillon: ['#ede3cb', '#9e782a', '#4a320a'],
  },
]

export const THEME_DEFAUT = 'grimoire'

/** Clé localStorage — partagée avec le script anti-flash de index.html. */
export const CLE_THEME = 'bg3-theme'

const IDS = new Set(THEMES.map((theme) => theme.id))

/** Ramène n'importe quelle valeur douteuse (stockage corrompu…) sur le thème par défaut. */
export function themeValide(id) {
  return IDS.has(id) ? id : THEME_DEFAUT
}

export function themeDe(id) {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0]
}
