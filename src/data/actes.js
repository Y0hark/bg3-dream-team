// Découpage de la run Honneur en actes. L'ordre du tableau fait foi partout
// (badges, filtres, checklists) : `numero` sert de clé de tri.
export const ACTES = [
  {
    id: 1,
    numero: 1,
    nom: 'Acte I',
    sousTitre: 'Côte de l’Épée, Ombreterre et Grymforge',
    niveaux: 'Niveaux 1 → 5',
    icone: '🌿',
    resume:
      'La moitié du loadout de contrôle sort d’ici, et les marchands d’Acte I ne réapparaissent pas après Grymforge.',
  },
  {
    id: 2,
    numero: 2,
    nom: 'Acte II',
    sousTitre: 'Terres Maudites et Aubelune',
    niveaux: 'Niveaux 5 → 9',
    icone: '🌑',
    resume:
      'Fenêtre courte : les Terres Maudites et Aubelune ferment derrière l’assaut des Tours. Tout ce qui est listé ici est perdu après.',
  },
  {
    id: 3,
    numero: 3,
    nom: 'Acte III',
    sousTitre: 'Baldur’s Gate et Basse-Ville',
    niveaux: 'Niveaux 9 → 12',
    icone: '🏛️',
    resume:
      'Les pièces maîtresses sortent toutes ici, et la plupart sont derrière une quête annexe : la Maison de l’Espoir, la tour de Ramazith, le Tabernacle de Stormshore.',
  },
]

export const ACTE_DEFAUT = ACTES[0]

export function acteDe(numero) {
  return ACTES.find((acte) => acte.numero === numero) ?? null
}

/** Libellé court pour les badges et les filtres (« Acte II »). */
export function libelleActe(numero) {
  return acteDe(numero)?.nom ?? 'Acte à confirmer'
}
