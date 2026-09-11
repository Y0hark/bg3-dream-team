// Checklists de fin d'acte : ce qui doit être vrai avant de franchir un point
// de non-retour. En Honneur, une seule sauvegarde — l'oubli ne se rattrape pas.
export const CHECKLISTS = [
  {
    acte: 1,
    titre: 'Avant de descendre à Grymforge et de quitter l’Acte I',
    entrees: [
      { id: 'a1-niveau', texte: 'Toute l’équipe est niveau 5 avant le point de non-retour.' },
      { id: 'a1-adamantine', texte: 'Forge adamantine : les deux veines de mithral du Refuge abandonné sont coulées — armure pour Sam, bouclier pour le Sidekick.' },
      { id: 'a1-zhent', texte: 'Brem débloqué (« Retrouver la cargaison disparue ») et le Titanstring Bow acheté avant de quitter la zone.' },
      { id: 'a1-marchands', texte: 'Les marchands de l’Acte I ont été rachetés avant de partir.' },
      { id: 'a1-creche', texte: 'Crèche Y’llek écumée : chambre de l’Inquisiteur (Gloves of Belligerent Skies, Diadem of Arcane Synergy, Strange Conduit Ring) et The Blood of Lathander.' },
      { id: 'a1-gel', texte: 'Chaîne du gel de Sam montée : Mourning Frost assemblé (3 pièces dans l’Ombreterre) ET Winter’s Clutches achetés chez Lady Esther — sans les deux, Gelé ne dure pas un tour.' },
      { id: 'a1-phalar', texte: 'Porteur de Phalar Aluve désigné : la main de Sam est prise par Mourning Frost, donc le Sidekick par défaut.' },
      { id: 'a1-statstick', texte: 'Club of Hill Giant Strength récupéré à la tour arcanique et équipé en main de mêlée sur Lilian : le Titanstring ne vaut rien sans.' },
      { id: 'a1-camp', texte: 'Stock de camp : flèches, potions de soin majeures, parchemins de Rappel à la vie, et un stock d’élixirs de Force de géant des collines — le Titanstring de Lilian ne vaut rien sans.' },
      { id: 'a1-cheveu', texte: 'Cheveu de la mégère (Tante Ethel) : Baptiste ne dépend plus d’un point de CHA externe, son unique ASI suffit à porter 16 → 18. À garder en réserve pour le Sidekick si sa propre ligne de charisme en profite.' },
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
      { id: 'a2-araj', texte: 'Araj Oblodra rachetée à Aubelune : Risky Ring, Ring of Free Action, Hat of Storm Scion’s Power.' },
      { id: 'a2-miroir', texte: 'Miroir des Pertes utilisé sur le CHA du Sidekick (Gantelet de Shar) : c’est lui qui rentabilise Birthright en Acte III.' },
      { id: 'a2-repos', texte: 'Repos long pris juste avant l’assaut : toutes les ressources pleines.' },
      { id: 'a2-concentration', texte: 'Plan de concentration validé : qui tient Hâte, qui tient le contrôle.' },
    ],
  },
  {
    acte: 3,
    titre: 'Avant les derniers combats',
    entrees: [
      { id: 'a3-niveau', texte: 'Niveau 12 atteint avant le dernier acte du scénario.' },
      { id: 'a3-sundries', texte: 'Markoheshkir récupéré à la tour de Ramazith (Voir l’invisible, puis Arcanes DD 20).' },
      { id: 'a3-espoir', texte: 'Maison de l’Espoir terminée : Amulet of Greater Health, Staff of Spellpower et Helldusk Armour.' },
      { id: 'a3-devout', texte: 'Amulet of the Devout récupérée au Tabernacle de Stormshore (+2 DD et une charge de Conduit divin) — prévoir un Retrait de malédiction pour celui qui pille le coffre d’offrandes.' },
      { id: 'a3-baton', texte: 'Bâton de Sam tranché : Mourning Frost reste équipé tant que le combo Gelé est le plan, Markoheshkir seulement quand il ne l’est pas.' },
      { id: 'a3-loadout', texte: 'Loadout final équipé et testé sur un combat de contrôle.' },
      { id: 'a3-consommables', texte: 'Consommables de sécurité : élixirs, parchemins, potions de vitesse.' },
      { id: 'a3-rates', texte: 'Aucun item S+ n’est marqué « Raté » sans remplacement prévu.' },
    ],
  },
]

export function checklistDe(acte) {
  return CHECKLISTS.find((entree) => entree.acte === acte) ?? null
}
