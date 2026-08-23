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
      'Poser les fondations : premiers paliers de classe, camp stable, et les objets de contrôle qui rendent les combats d’Acte II lisibles.',
  },
  {
    id: 2,
    numero: 2,
    nom: 'Acte II',
    sousTitre: 'Terres Maudites et Aubelune',
    niveaux: 'Niveaux 5 → 9',
    icone: '🌑',
    resume:
      'L’acte le plus dangereux en Honneur : ténèbres magiques, embuscades et boss à légendaire. Le loadout doit être bouclé avant l’assaut d’Aubelune.',
  },
  {
    id: 3,
    numero: 3,
    nom: 'Acte III',
    sousTitre: 'Baldur’s Gate et Basse-Ville',
    niveaux: 'Niveaux 9 → 12',
    icone: '🏛️',
    resume:
      'Montée en puissance finale : les pièces maîtresses des builds se débloquent ici, souvent derrière des quêtes à ne pas rater.',
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
