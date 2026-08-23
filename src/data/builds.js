// ------------------------------------------------------------------
// Les 4 builds de la run Honneur.
//
// Périmètre du ticket 1/4 : la structure de données et un premier jet
// fidèle aux splits validés dans Notion. Les fiches détaillées (dégâts
// chiffrés, ordre exact des sorts, variantes) sont encodées au ticket 2/4 ;
// les champs restés vides s'affichent comme « À compléter » dans l'UI
// plutôt que d'être inventés ici.
// ------------------------------------------------------------------

export const BUILDS = [
  {
    id: 'sam-freeze-thunder',
    personnage: 'Sam',
    nom: 'Freeze Thunder Frontliner',
    split: 'Clerc de la Tempête 8 / Magicien Chantelame 4',
    classe: 'Clerc',
    sousClasse: 'Domaine de la Tempête',
    role: 'Hybride / Tank magique / Contrôle',
    icone: '⚡',
    couleurAccent: 'sky',
    resume:
      'Tient la ligne de front en armure lourde, puis convertit chaque sort de foudre en dégâts maximisés. Le givre pose le terrain, le tonnerre le nettoie.',
    stats: { FOR: 8, DEX: 14, CON: 16, INT: 12, SAG: 17, CHA: 8 },
    notesStats: 'SAG prioritaire (DD des sorts), CON pour la concentration, DEX suffisante pour l’initiative.',
    feats: [
      { niveau: 4, nom: 'Incantateur de guerre', note: 'Concentration tenue malgré les coups reçus en première ligne.' },
      { niveau: 8, nom: 'Amélioration de caractéristique — SAG +2', note: 'Monte le DD des sauvegardes de contrôle.' },
      { niveau: 12, nom: 'Amélioration de caractéristique — CON +2', note: 'Points de vie et concentration. À arbitrer au ticket 2/4.' },
    ],
    leveling: [
      { niveau: 1, classe: 'Clerc 1', gains: 'Domaine de la Tempête : Châtiment du tonnerre. Armure lourde dès le départ.' },
      { niveau: 2, classe: 'Clerc 2', gains: 'Conduit divin : Courroux de la Tempête. Réaction de foudre gratuite.' },
      { niveau: 3, classe: 'Clerc 3', gains: 'Sorts de niveau 2 : Immobiliser un humanoïde, Silence.' },
      { niveau: 4, classe: 'Clerc 4', gains: 'Don : Incantateur de guerre.' },
      { niveau: 5, classe: 'Clerc 5', gains: 'Destruction des morts-vivants. Sorts de niveau 3 : Appel de la foudre.' },
      { niveau: 6, classe: 'Magicien 1', gains: 'Grimoire ouvert : Trait glacial, Armure de Mage, Projectile magique.' },
      { niveau: 7, classe: 'Magicien 2', gains: 'École de la Chantelame : Chant de lame, +CA et déplacement.' },
      { niveau: 8, classe: 'Magicien 3', gains: 'Sorts de niveau 2 : Rayon de givre, Toile d’araignée.' },
      { niveau: 9, classe: 'Magicien 4', gains: 'Don du magicien. Sorts mineurs supplémentaires.' },
      { niveau: 10, classe: 'Clerc 6', gains: 'Bénédiction du dieu de la tempête : vol après avoir subi des dégâts de foudre.' },
      { niveau: 11, classe: 'Clerc 7', gains: 'Sorts de niveau 4 : Tempête de grêle, Mur de feu.' },
      { niveau: 12, classe: 'Clerc 8', gains: 'Frappe divine (foudre) + don final.' },
    ],
    boucle: [
      'Poser le terrain : surface de glace ou d’eau avant l’engagement.',
      'Entrer en Chant de lame pour encaisser sans perdre la concentration.',
      'Déclencher les sorts de foudre : le Courroux de la Tempête maximise les dés.',
      'Nettoyer les paquets avec les réactions plutôt qu’avec des emplacements.',
    ],
    synergies: [
      'L’eau posée par l’équipe double les dégâts de foudre et propage l’effet.',
      'Les surfaces gelées enchaînent avec les contrôles de Baptiste et du Sidekick.',
      'La réverbération portée par le loadout empile les malus de sauvegarde.',
    ],
    vigilance: [
      'En Honneur, la mort du frontliner déclenche souvent la spirale : garder un emplacement pour Sanctuaire ou une potion de soin majeure.',
      'Chant de lame ne fonctionne pas en armure lourde : arbitrer armure vs. Chant selon le combat.',
      'Le split retarde les sorts de niveau 4 : prévoir des consommables pour l’Acte II.',
    ],
  },
  {
    id: 'baptiste-sorlock',
    personnage: 'Baptiste',
    nom: 'Sorlock Eldritch Control',
    split: 'Occultiste 2 / Ensorceleur 7 / Roublard Voleur 3',
    classe: 'Ensorceleur',
    sousClasse: 'Occultiste — Grand Ancien / Voleur',
    role: 'DPS distance',
    icone: '🔮',
    couleurAccent: 'purple',
    resume:
      'Explosion occulte à volonté, poussée par la métamagie et doublée par l’action bonus du Voleur. Dégâts constants sans consommer de ressources.',
    stats: { FOR: 8, DEX: 14, CON: 14, INT: 10, SAG: 12, CHA: 17 },
    notesStats: 'CHA maximal (attaque et DD), CON pour tenir la concentration à distance.',
    feats: [
      { niveau: 4, nom: 'Amélioration de caractéristique — CHA +2', note: 'Le seul don du split : les paliers 4 des autres classes ne sont pas atteints.' },
    ],
    leveling: [
      { niveau: 1, classe: 'Occultiste 1', gains: 'Explosion occulte + pacte du Grand Ancien.' },
      { niveau: 2, classe: 'Occultiste 2', gains: 'Manifestations occultes : Lame d’Agonie et Répulsion.' },
      { niveau: 3, classe: 'Ensorceleur 1', gains: 'Origine magique. Sorts d’ensorceleur sur CHA : même caractéristique, même attaque.' },
      { niveau: 4, classe: 'Ensorceleur 2', gains: 'Points de sorcellerie : conversion en emplacements.' },
      { niveau: 5, classe: 'Ensorceleur 3', gains: 'Métamagie : Sort accéléré et Sort à distance.' },
      { niveau: 6, classe: 'Ensorceleur 4', gains: 'Don : CHA +2.' },
      { niveau: 7, classe: 'Ensorceleur 5', gains: 'Sorts de niveau 3 : Vol, Contresort.' },
      { niveau: 8, classe: 'Ensorceleur 6', gains: 'Capacité d’origine (dépend de l’origine retenue au ticket 2/4).' },
      { niveau: 9, classe: 'Ensorceleur 7', gains: 'Sorts de niveau 4 : Invisibilité supérieure, Éclair chaotique.' },
      { niveau: 10, classe: 'Roublard 1', gains: 'Attaque sournoise, expertise.' },
      { niveau: 11, classe: 'Roublard 2', gains: 'Ruse : Désengagement / Course en action bonus.' },
      { niveau: 12, classe: 'Roublard Voleur 3', gains: 'Action bonus supplémentaire : deuxième salve d’Explosion occulte via potions/objets, ou double repositionnement.' },
    ],
    boucle: [
      'Ouvrir à couvert, hors de portée des charges.',
      'Explosion occulte + Lame d’Agonie pour les dégâts de base sans ressource.',
      'Sort accéléré pour un contrôle et une salve dans le même tour sur les cibles prioritaires.',
      'Repousser avec Répulsion pour casser les mêlées adverses et protéger Sam.',
    ],
    synergies: [
      'La Répulsion pousse les ennemis dans les surfaces posées par Sam.',
      'L’action bonus du Voleur transforme les consommables en tours doubles.',
      'Le contrôle mental du Grand Ancien enchaîne avec les malus du Sidekick.',
    ],
    vigilance: [
      'Un seul don sur toute la run : chaque amélioration compte, pas de Tireur d’élite ici.',
      'Le palier Roublard n’arrive qu’en fin de run : les 9 premiers niveaux jouent comme un sorlock classique.',
      'Concentration fragile en Honneur : rester hors de portée des archers et des attaques d’opportunité.',
    ],
  },
  {
    id: 'lilian-arcane-archer',
    personnage: 'Lilian',
    nom: 'Arcane Archer / Gloom Stalker',
    split: 'Guerrier Archer Arcanique 8 / Rôdeur Traque-Ténèbres 4',
    classe: 'Guerrier',
    sousClasse: 'Archer Arcanique',
    role: 'DPS distance / opener',
    icone: '🏹',
    couleurAccent: 'emerald',
    resume:
      'Ouvre chaque combat avec un tour supplémentaire, puis enchaîne les flèches arcaniques. Le meilleur premier tour de l’équipe.',
    stats: { FOR: 8, DEX: 17, CON: 14, INT: 13, SAG: 14, CHA: 8 },
    notesStats: 'DEX maximale, INT juste utile pour les DD de flèches arcaniques (à arbitrer au ticket 2/4).',
    feats: [
      { niveau: 6, nom: 'Tireur d’élite', note: '-5 au toucher, +10 aux dégâts : la pièce maîtresse du build.' },
      { niveau: 8, nom: 'Amélioration de caractéristique — DEX +2', note: 'Compense le malus au toucher du Tireur d’élite.' },
      { niveau: 12, nom: 'Amélioration de caractéristique — DEX +1 / CON +1', note: 'Arbitrage final au ticket 2/4.' },
    ],
    leveling: [
      { niveau: 1, classe: 'Rôdeur 1', gains: 'Ennemi juré, style de combat Archerie (+2 au toucher).' },
      { niveau: 2, classe: 'Rôdeur 2', gains: 'Deuxième style / sorts de rôdeur : Marque du chasseur.' },
      { niveau: 3, classe: 'Rôdeur Traque-Ténèbres 3', gains: 'Embuscade : +3 initiative et une attaque supplémentaire au premier tour.' },
      { niveau: 4, classe: 'Rôdeur 4', gains: 'Don de rôdeur.' },
      { niveau: 5, classe: 'Guerrier 1', gains: 'Second souffle. Deuxième style de combat.' },
      { niveau: 6, classe: 'Guerrier 2', gains: 'Fougue : un tour d’attaques doublé, à garder pour les boss.' },
      { niveau: 7, classe: 'Guerrier Archer Arcanique 3', gains: 'Flèches arcaniques : Enchevêtrement, Foudre, Perce-armure.' },
      { niveau: 8, classe: 'Guerrier 4', gains: 'Don : Tireur d’élite.' },
      { niveau: 9, classe: 'Guerrier 5', gains: 'Attaque supplémentaire.' },
      { niveau: 10, classe: 'Guerrier 6', gains: 'Don supplémentaire (spécificité Guerrier).' },
      { niveau: 11, classe: 'Guerrier 7', gains: 'Flèche arcanique améliorée.' },
      { niveau: 12, classe: 'Guerrier 8', gains: 'Don final.' },
    ],
    boucle: [
      'Se placer en hauteur avant l’engagement : portée et avantage.',
      'Tour 1 : Embuscade + attaques — souvent une cible morte avant le tour adverse.',
      'Flèche arcanique d’Enchevêtrement sur les groupes, Perce-armure sur les boss.',
      'Fougue réservée aux phases où le boss doit tomber en un tour.',
    ],
    synergies: [
      'Les flèches de foudre profitent des surfaces d’eau posées par Sam.',
      'L’initiative de l’Embuscade ouvre la fenêtre de contrôle avant que les ennemis n’agissent.',
      'Les buffs du Sidekick (Bénédiction, Hâte) transforment les tours doubles en éliminations.',
    ],
    vigilance: [
      'Tireur d’élite avant l’arrivée des bonus au toucher fait rater : n’activer que sur cibles à faible CA au début.',
      'En Honneur, l’opener ne doit jamais laisser Lilian exposée : viser une position que les ennemis ne peuvent pas atteindre au tour 1.',
      'Ordre des paliers Rôdeur/Guerrier à confirmer au ticket 2/4 selon la courbe de difficulté réelle.',
    ],
  },
  {
    id: 'sidekick-bard-cleric',
    personnage: 'Sidekick',
    nom: 'Lore Bard / Life Cleric Support',
    split: 'Barde du Savoir 10 / Clerc de la Vie 2',
    classe: 'Barde',
    sousClasse: 'Collège du Savoir',
    role: 'Support / contrôle',
    icone: '🎻',
    couleurAccent: 'amber',
    resume:
      'Le filet de sécurité de la run : soins majorés, Hâte, contres-mesures et Inspiration bardique pour annuler les jets critiques adverses.',
    stats: { FOR: 8, DEX: 14, CON: 14, INT: 10, SAG: 12, CHA: 17 },
    notesStats: 'CHA maximal pour les DD de contrôle ; le Clerc de la Vie ne dépend pas de la SAG pour majorer les soins.',
    feats: [
      { niveau: 4, nom: 'Amélioration de caractéristique — CHA +2', note: 'DD de contrôle avant l’Acte II.' },
      { niveau: 8, nom: 'Incantateur de guerre ou CHA +2', note: 'Arbitrage au ticket 2/4 selon le loadout final.' },
    ],
    leveling: [
      { niveau: 1, classe: 'Clerc de la Vie 1', gains: 'Armure lourde, soins majorés dès le premier soin.' },
      { niveau: 2, classe: 'Clerc de la Vie 2', gains: 'Conduit divin : Préservation de la vie, soin de zone d’urgence.' },
      { niveau: 3, classe: 'Barde 1', gains: 'Inspiration bardique, sorts sur CHA.' },
      { niveau: 4, classe: 'Barde 2', gains: 'Touche-à-tout, Chant du repos.' },
      { niveau: 5, classe: 'Barde du Savoir 3', gains: 'Paroles cinglantes : annule une attaque ou un jet adverse en réaction.' },
      { niveau: 6, classe: 'Barde 4', gains: 'Don : CHA +2.' },
      { niveau: 7, classe: 'Barde 5', gains: 'Inspiration supérieure, sorts de niveau 3 : Hâte.' },
      { niveau: 8, classe: 'Barde 6', gains: 'Secrets supplémentaires du Collège du Savoir.' },
      { niveau: 9, classe: 'Barde 7', gains: 'Sorts de niveau 4 : Confusion, Liberté de mouvement.' },
      { niveau: 10, classe: 'Barde 8', gains: 'Don supplémentaire.' },
      { niveau: 11, classe: 'Barde 9', gains: 'Sorts de niveau 5 : Immobiliser un monstre, Rappel à la vie.' },
      { niveau: 12, classe: 'Barde 10', gains: 'Secrets magiques : deux sorts hors classe (choix au ticket 2/4).' },
    ],
    boucle: [
      'Pré-combat : buffs longs (Bénédiction de la protection, résistances).',
      'Tour 1 : Hâte sur Lilian ou Baptiste, jamais sur une cible qui risque l’étourdissement.',
      'Garder la réaction pour Paroles cinglantes contre le gros coup adverse.',
      'Soins majorés uniquement quand la mort est en jeu : sinon, contrôler.',
    ],
    synergies: [
      'Hâte + Fougue de Lilian : la fenêtre d’élimination des boss.',
      'Les contrôles de zone se cumulent avec la Répulsion de Baptiste.',
      'Rappel à la vie évite le game over en Honneur si un personnage tombe.',
    ],
    vigilance: [
      'Perdre la concentration sur Hâte inflige un tour d’étourdissement : sécuriser la concentration avant de la lancer.',
      'Le Sidekick doit rester le dernier à mourir : positionnement systématiquement en retrait.',
      'Les deux niveaux de Clerc coûtent un palier de sorts de barde : arbitrage validé au cadrage.',
    ],
  },
]

export const BUILD_DEFAUT = BUILDS[0]

export function buildDe(id) {
  return BUILDS.find((build) => build.id === id) ?? null
}

/** Nom d'affichage court utilisé par les filtres et les badges d'items. */
export function nomCourtDe(id) {
  return buildDe(id)?.personnage ?? 'Équipe'
}
