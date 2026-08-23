// Checklists de fin d'acte : ce qui doit être vrai avant de franchir un point
// de non-retour. En Honneur, une seule sauvegarde — l'oubli ne se rattrape pas.
export const CHECKLISTS = [
  {
    acte: 1,
    titre: 'Avant de descendre à Grymforge et de quitter l’Acte I',
    entrees: [
      { id: 'a1-niveau', texte: 'Toute l’équipe est niveau 5 avant le point de non-retour.' },
      { id: 'a1-adamantine', texte: 'La forge adamantine a été utilisée (une seule coulée par pièce).' },
      { id: 'a1-zhent', texte: 'La planque des Zhentarim a été vidée : gants, bottes, amulette.' },
      { id: 'a1-marchands', texte: 'Les marchands de l’Acte I ont été rachetés avant de partir.' },
      { id: 'a1-camp', texte: 'Stock de camp : flèches, potions de soin majeures, parchemins de Rappel à la vie.' },
      { id: 'a1-respec', texte: 'Les respec de mi-parcours sont faits (Withers) : plus cher plus tard.' },
    ],
  },
  {
    acte: 2,
    titre: 'Avant l’assaut des Tours d’Aubelune',
    entrees: [
      { id: 'a2-niveau', texte: 'Équipe niveau 8 minimum, dons clés pris.' },
      { id: 'a2-lumiere', texte: 'Sources de lumière contre les ténèbres maudites pour les 4 personnages.' },
      { id: 'a2-marchands', texte: 'Marchands de l’Auberge de la Dernière Lumière et d’Aubelune écumés.' },
      { id: 'a2-shar', texte: 'Épreuves de Shar terminées avant le point de non-retour.' },
      { id: 'a2-repos', texte: 'Repos long pris juste avant l’assaut : toutes les ressources pleines.' },
      { id: 'a2-concentration', texte: 'Plan de concentration validé : qui tient Hâte, qui tient le contrôle.' },
    ],
  },
  {
    acte: 3,
    titre: 'Avant les derniers combats',
    entrees: [
      { id: 'a3-niveau', texte: 'Niveau 12 atteint avant le dernier acte du scénario.' },
      { id: 'a3-sundries', texte: 'Chambre forte de Sorcelleries Sundries ouverte.' },
      { id: 'a3-espoir', texte: 'Maison de l’Espoir terminée (butin le plus fort de l’Acte III).' },
      { id: 'a3-loadout', texte: 'Loadout final équipé et testé sur un combat de contrôle.' },
      { id: 'a3-consommables', texte: 'Consommables de sécurité : élixirs, parchemins, potions de vitesse.' },
      { id: 'a3-rates', texte: 'Aucun item S+ n’est marqué « Raté » sans remplacement prévu.' },
    ],
  },
]

export function checklistDe(acte) {
  return CHECKLISTS.find((entree) => entree.acte === acte) ?? null
}
