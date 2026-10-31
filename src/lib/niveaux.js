// ------------------------------------------------------------------
// Règles de progression 1 → 12 : fonctions pures, sans état.
//
// Les builds décrivent leur route comme une suite de classes prises niveau de
// personnage après niveau de personnage (`ordre`). Tout le reste se déduit
// d'ici — totaux par classe, niveaux qui donnent un don, plafond des sorts
// connus, plafond des emplacements — pour que les données ne puissent pas
// promettre un don fantôme ou un sort de niveau 6 que la répartition ne donne
// pas. Les tests de données s'appuient sur ces fonctions.
// ------------------------------------------------------------------

/** Niveaux de classe qui accordent un don (ou une augmentation) dans BG3. */
const PALIERS_DONS = {
  defaut: [4, 8, 12],
  Roublard: [4, 8, 10, 12],
}

export function paliersDons(classe) {
  return PALIERS_DONS[classe] ?? PALIERS_DONS.defaut
}

/** Totaux par classe après `jusquAu` niveaux de personnage (tout l'ordre par défaut). */
export function totauxClasses(ordre, jusquAu = ordre.length) {
  const totaux = {}
  for (const classe of ordre.slice(0, jusquAu)) {
    totaux[classe] = (totaux[classe] ?? 0) + 1
  }
  return totaux
}

/**
 * Niveaux de personnage qui accordent un don, avec la classe qui le donne.
 * Un don se prend au 4e/8e/12e niveau d'UNE classe, pas du personnage.
 */
export function donsParNiveau(ordre) {
  const niveauxClasse = {}
  const dons = []
  ordre.forEach((classe, index) => {
    niveauxClasse[classe] = (niveauxClasse[classe] ?? 0) + 1
    if (paliersDons(classe).includes(niveauxClasse[classe])) {
      dons.push({ niveau: index + 1, classe, niveauClasse: niveauxClasse[classe] })
    }
  })
  return dons
}

// --- Sorts : connus ≠ emplacements -----------------------------------

/** Rôle de chaque classe dans le calcul des emplacements de sorts. */
const LANCEURS = {
  Sorcier: 'complet',
  Barde: 'complet',
  Clerc: 'complet',
  Druide: 'complet',
  Paladin: 'demi',
  Occultiste: 'pacte',
}

/** Niveau de sort maximal selon le niveau de lanceur (table des lanceurs complets). */
function niveauSortMax(niveauLanceur) {
  if (niveauLanceur >= 11) return 6
  if (niveauLanceur >= 9) return 5
  if (niveauLanceur >= 7) return 4
  if (niveauLanceur >= 5) return 3
  if (niveauLanceur >= 3) return 2
  return niveauLanceur >= 1 ? 1 : 0
}

/** Un Paladin apprend ses sorts de niveau 1 dès Paladin 2, niveau 2 dès 5, niveau 3 dès 9. */
function niveauSortDemiLanceur(niveauClasse) {
  if (niveauClasse >= 13) return 4
  if (niveauClasse >= 9) return 3
  if (niveauClasse >= 5) return 2
  return niveauClasse >= 2 ? 1 : 0
}

/** Niveau des emplacements de pacte d'un Occultiste (deux emplacements, repos court). */
export function niveauPacte(niveauOccultiste) {
  if (niveauOccultiste <= 0) return 0
  return Math.min(5, Math.ceil(niveauOccultiste / 2))
}

/** Niveau de lanceur multiclasse : complets + moitié (arrondie bas) des demi-lanceurs. */
export function niveauLanceur(totaux) {
  let niveau = 0
  for (const [classe, valeur] of Object.entries(totaux)) {
    if (LANCEURS[classe] === 'complet') niveau += valeur
    else if (LANCEURS[classe] === 'demi') niveau += Math.floor(valeur / 2)
  }
  return niveau
}

/**
 * Deux plafonds distincts, à ne jamais confondre :
 * - `emplacementMax` : le plus haut niveau d'emplacement ordinaire (ou de
 *   pacte) disponible — il sert à surincanter ;
 * - `sortConnuMax` : le plus haut niveau de sort qu'une classe APPREND
 *   réellement. Un emplacement de niveau 6 n'ouvre pas la liste de niveau 6.
 */
export function plafondsSorts(totaux) {
  const ordinaire = niveauSortMax(niveauLanceur(totaux))
  const pacte = niveauPacte(totaux.Occultiste ?? 0)

  let sortConnuMax = 0
  for (const [classe, valeur] of Object.entries(totaux)) {
    const role = LANCEURS[classe]
    if (role === 'complet') sortConnuMax = Math.max(sortConnuMax, niveauSortMax(valeur))
    else if (role === 'demi') sortConnuMax = Math.max(sortConnuMax, niveauSortDemiLanceur(valeur))
    else if (role === 'pacte') sortConnuMax = Math.max(sortConnuMax, pacte)
  }

  return {
    emplacementMax: Math.max(ordinaire, pacte),
    emplacementOrdinaireMax: ordinaire,
    emplacementPacteNiveau: pacte,
    sortConnuMax,
  }
}

// --- Caractéristiques -------------------------------------------------

const STATS = ['FOR', 'DEX', 'CON', 'INT', 'SAG', 'CHA']

/**
 * Valeur d'une caractéristique selon sa provenance. Les bonus s'ajoutent
 * (création, dons, bonus permanents) ; une valeur FIXÉE par un objet ou un
 * élixir (« CON 23 », « FOR 21 ») ne s'ajoute à rien : elle remplace la
 * valeur seulement si elle est supérieure. 8 + 21 n'a jamais fait 29.
 *
 * `options.permanents` : ids des bonus permanents réellement obtenus.
 * `options.fixees` : ids des valeurs fixées réellement équipées / bues.
 */
export function caracteristiquesEffectives(caracteristiques, jusquAuNiveau, options = {}) {
  const valeurs = { ...caracteristiques.creation }
  const permanents = new Set(options.permanents ?? [])
  const fixees = new Set(options.fixees ?? [])

  for (const bonus of caracteristiques.bonusDons ?? []) {
    if (bonus.niveau <= jusquAuNiveau) valeurs[bonus.stat] += bonus.valeur
  }
  for (const bonus of caracteristiques.bonusPermanents ?? []) {
    if (permanents.has(bonus.id)) valeurs[bonus.stat] += bonus.valeur
  }
  for (const fixe of caracteristiques.fixees ?? []) {
    if (fixees.has(fixe.id)) valeurs[fixe.stat] = Math.max(valeurs[fixe.stat], fixe.valeur)
  }
  return valeurs
}

export function statsValides(valeurs) {
  return STATS.every((stat) => Number.isInteger(valeurs?.[stat]))
}
