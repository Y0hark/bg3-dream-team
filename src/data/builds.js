// ------------------------------------------------------------------
// Les 4 builds de la run Honneur.
//
// Les splits viennent du cadrage ; les paliers de dons sont calés sur les
// niveaux de classe réels (un don au 4e niveau d'une classe, pas au 4e
// niveau de personnage), et les arbitrages ouverts au cadrage sont tranchés
// ici, avec la raison dans `note` — c'est le loadout final de `items.js` qui
// décide, pas l'inverse : l'Amulet of Greater Health rend une ASI de CON
// inutile, et le plan de charisme des deux casters est calé sur les objets qui
// le montent (un seul Birthright existe dans le jeu, un seul Cheveu de la
// mégère aussi) — pour finir sur un score PAIR, un point impair ne valant
// aucun modificateur.
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
    stats: { FOR: 8, DEX: 14, CON: 16, INT: 12, SAG: 16, CHA: 8 },
    notesStats: 'SAG paire à la création (16) pour que les deux ASI la portent à 20 sans perdre un point. CON 16 jusqu’à l’Amulet of Greater Health, qui la verrouille à 23 en Acte III. FOR 8 assumée : l’armure lourde ne demande pas de FOR en BG3.',
    feats: [
      { niveau: 4, nom: 'Incantateur de guerre', note: 'Clerc 4. Concentration tenue malgré les coups reçus en première ligne, et sort d’opportunité en réaction.' },
      { niveau: 9, nom: 'Amélioration de caractéristique — SAG +2 (16 → 18)', note: 'Magicien 4. Monte le DD des sauvegardes de contrôle juste avant l’Acte III.' },
      { niveau: 12, nom: 'Amélioration de caractéristique — SAG +2 (18 → 20)', note: 'Clerc 8. L’Amulet of Greater Health met déjà la CON à 23 : une ASI de CON serait perdue.' },
    ],
    leveling: [
      { niveau: 1, classe: 'Clerc 1', gains: 'Domaine de la Tempête : réaction Courroux de la Tempête (2d8 de foudre ou de tonnerre sur l’attaquant). Armure lourde et armes de guerre dès le départ.' },
      { niveau: 2, classe: 'Clerc 2', gains: 'Conduit divin : Courroux destructeur — dépenser une charge pour maximiser les dés de foudre ou de tonnerre.' },
      { niveau: 3, classe: 'Clerc 3', gains: 'Sorts de niveau 2 : Immobiliser un humanoïde, Silence.' },
      { niveau: 4, classe: 'Clerc 4', gains: 'Don : Incantateur de guerre.' },
      { niveau: 5, classe: 'Clerc 5', gains: 'Destruction des morts-vivants. Sorts de niveau 3 : Appel de la foudre.' },
      { niveau: 6, classe: 'Magicien 1', gains: 'Grimoire ouvert : Trait glacial, Armure de Mage, Projectile magique.' },
      { niveau: 7, classe: 'Magicien 2', gains: 'École de la Chantelame : Chant de lame (+2 CA, +2 aux JdS de CON, +3 m), deux fois par repos long — mais uniquement en armure légère, donc jamais avec l’Armure adamantine.' },
      { niveau: 8, classe: 'Magicien 3', gains: 'Sorts de niveau 2 : Toile d’araignée, Image miroir. (Trait glacial est déjà couvert par Mourning Frost, qui l’accorde gratuitement.)' },
      { niveau: 9, classe: 'Magicien 4', gains: 'Don : SAG +2 (16 → 18). Sorts mineurs supplémentaires.' },
      { niveau: 10, classe: 'Clerc 6', gains: 'Frappe de foudre : chaque dégât de foudre ou de tonnerre repousse la cible de 3 m si elle est de taille G ou moins. Deuxième charge de Conduit divin.' },
      { niveau: 11, classe: 'Clerc 7', gains: 'Sorts de domaine de niveau 4, toujours préparés : Tempête de grêle et Liberté de mouvement.' },
      { niveau: 12, classe: 'Clerc 8', gains: 'Frappe divine : +1d8 de tonnerre sur une attaque de mêlée par tour — et le tonnerre déclenche les Gloves of Belligerent Skies. Don : SAG +2 (18 → 20).' },
    ],
    boucle: [
      'Poser le terrain : surface de glace ou d’eau avant l’engagement.',
      'Ouvrir avec Toile d’araignée ou Tempête de grêle pour figer le paquet avant qu’il n’arrive au contact.',
      'Déclencher le gros sort de foudre : le Courroux destructeur maximise les dés, deux fois par repos court.',
      'Nettoyer les paquets avec les réactions plutôt qu’avec des emplacements.',
    ],
    synergies: [
      'L’eau posée par l’équipe double les dégâts de foudre et propage l’effet.',
      'Les surfaces gelées enchaînent avec les contrôles de Baptiste et du Sidekick.',
      'La réverbération portée par le loadout empile les malus de sauvegarde.',
    ],
    vigilance: [
      'En Honneur, la mort du frontliner déclenche souvent la spirale : garder un emplacement pour Sanctuaire ou une potion de soin majeure.',
      'Le Chant de lame exige une armure légère : avec l’Armure adamantine, il est simplement hors jeu. Assumer le dip Chantelame pour ce qu’il est — quatre niveaux de sorts (Armure de mage, Toile d’araignée, Contresort) — et garder l’armure lourde. L’Attaque supplémentaire du Chantelame est au niveau 6 de la classe, inatteignable sur ce split.',
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
      'Explosion occulte à volonté, poussée par la métamagie et par un loadout qui empile le charisme sur chaque rayon. Dégâts constants sans consommer de ressources.',
    stats: { FOR: 8, DEX: 14, CON: 14, INT: 10, SAG: 12, CHA: 17 },
    notesStats: 'CHA 17 à la création (15 + 2 raciaux), puis le Cheveu de la mégère d’Acte I le passe à 18 pour que l’unique ASI le porte à 20 pile. Le casque d’Acte III est le Hood of the Weave, pas Birthright : le plan de charisme s’arrête donc à 20, sans point perdu. CON pour tenir la concentration à distance.',
    feats: [
      { niveau: 6, nom: 'Amélioration de caractéristique — CHA +2 (18 → 20)', note: 'Ensorceleur 4, soit le niveau 6 de personnage : le seul don du split. Occultiste s’arrête à 2, Roublard à 3 — aucun autre palier de don n’est atteint. Le Cheveu de la mégère doit être pris avant, sinon l’ASI s’arrête à 19 et le point est perdu.' },
    ],
    leveling: [
      { niveau: 1, classe: 'Occultiste 1', gains: 'Explosion occulte, et patron du Grand Ancien : Rappel mortel — un critique effraie les créatures proches.' },
      { niveau: 2, classe: 'Occultiste 2', gains: 'Manifestations occultes : Lame d’Agonie et Répulsion.' },
      { niveau: 3, classe: 'Ensorceleur 1', gains: 'Origine : Lignée draconique. On la prend pour la Résilience draconique — CA 13 + DEX sans armure et +1 PV par niveau, le seul filet défensif du build — pas pour l’ancêtre.' },
      { niveau: 4, classe: 'Ensorceleur 2', gains: 'Points de sorcellerie et déjà deux métamagies : Sort accéléré et Sort à distance.' },
      { niveau: 5, classe: 'Ensorceleur 3', gains: 'Troisième métamagie (Sort jumelé) et emplacements de niveau 2.' },
      { niveau: 6, classe: 'Ensorceleur 4', gains: 'Don : CHA +2.' },
      { niveau: 7, classe: 'Ensorceleur 5', gains: 'Sorts de niveau 3 : Vol, Contresort.' },
      { niveau: 8, classe: 'Ensorceleur 6', gains: 'Affinité élémentaire (foudre) : le modificateur de CHA s’ajoute aux dégâts de foudre. À relativiser — l’Explosion occulte inflige des dégâts de force et n’en profite pas ; l’Affinité ne rend que sur les sorts de foudre d’appoint.' },
      { niveau: 9, classe: 'Ensorceleur 7', gains: 'Sorts de niveau 4 : Invisibilité supérieure, Bannissement.' },
      { niveau: 10, classe: 'Roublard 1', gains: 'Attaque sournoise, expertise.' },
      { niveau: 11, classe: 'Roublard 2', gains: 'Ruse : Désengagement / Course en action bonus.' },
      { niveau: 12, classe: 'Roublard Voleur 3', gains: 'Mains prestes : une action bonus supplémentaire. Elle ne double pas l’Explosion occulte, qui coûte une action — elle sert à enchaîner un Sort accéléré avec une potion, une fiole lancée ou un repositionnement.' },
    ],
    boucle: [
      'Ouvrir à couvert, hors de portée des charges.',
      'Explosion occulte + Lame d’Agonie pour les dégâts de base sans ressource.',
      'Sort accéléré pour un contrôle et une salve dans le même tour sur les cibles prioritaires.',
      'Repousser avec Répulsion pour casser les mêlées adverses et protéger Sam.',
    ],
    synergies: [
      'La Répulsion pousse les ennemis dans les surfaces posées par Sam.',
      'L’action bonus du Voleur transforme les consommables en tours doubles : Sort accéléré puis potion de vitesse dans le même tour.',
      'Rappel mortel effraie tout le paquet sur un critique, ce qui prolonge les fenêtres de contrôle du Sidekick.',
    ],
    vigilance: [
      'Un seul don sur toute la run, au niveau 6 : tout le reste passe par le loadout — Potent Robe, Hood of the Weave, Callous Glow Ring.',
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
    notesStats: 'DEX 17 à la création puis +2 et +1 par ASI : 20 au niveau 10. INT 13 → 14 au même niveau, pour le DD des flèches arcaniques (8 + maîtrise + INT). À plafond, ce DD reste à 14 : les flèches à jet de sauvegarde sont un bonus, jamais le plan — les flèches à jet d’attaque, elles, profitent de tout le toucher du build.',
    feats: [
      { niveau: 4, nom: 'Tireur d’élite', note: 'Rôdeur 4. -5 au toucher, +10 aux dégâts : la pièce maîtresse du build, prise tôt parce que le style Archerie et les Gloves of Archery compensent déjà le malus.' },
      { niveau: 8, nom: 'Amélioration de caractéristique — DEX +2 (17 → 19)', note: 'Guerrier 4. Rattrape le malus du Tireur d’élite au moment où les CA d’Acte II montent.' },
      { niveau: 10, nom: 'Amélioration de caractéristique — DEX +1 / INT +1 (20 / 14)', note: 'Guerrier 6. DEX au maximum, et un point d’INT qui monte le DD des flèches arcaniques.' },
      { niveau: 12, nom: 'Alerte', note: 'Guerrier 8. +5 d’initiative en plus de l’Embuscade : l’équipe joue avant le boss, ce qui est la seule vraie assurance-vie en Honneur.' },
    ],
    leveling: [
      { niveau: 1, classe: 'Rôdeur 1', gains: 'Ennemi juré et Explorateur né.' },
      { niveau: 2, classe: 'Rôdeur 2', gains: 'Style de combat Archerie (+2 au toucher) et premiers sorts : Marque du chasseur.' },
      { niveau: 3, classe: 'Rôdeur Traque-Ténèbres 3', gains: 'Embuscade : +3 initiative et une attaque supplémentaire au premier tour.' },
      { niveau: 4, classe: 'Rôdeur 4', gains: 'Don : Tireur d’élite.' },
      { niveau: 5, classe: 'Guerrier 1', gains: 'Second souffle et un deuxième style de combat : Défense (+1 CA).' },
      { niveau: 6, classe: 'Guerrier 2', gains: 'Fougue : un tour d’attaques doublé, à garder pour les boss.' },
      { niveau: 7, classe: 'Guerrier Archer Arcanique 3', gains: 'Trois flèches arcaniques au choix (4 tirs par repos court) : Enchevêtrante, Éclatante, Perçante. Aucune option de foudre n’existe dans la liste.' },
      { niveau: 8, classe: 'Guerrier 4', gains: 'Don : DEX +2 (17 → 19).' },
      { niveau: 9, classe: 'Guerrier 5', gains: 'Attaque supplémentaire.' },
      { niveau: 10, classe: 'Guerrier 6', gains: 'Don supplémentaire (spécificité Guerrier) : DEX +1 / INT +1.' },
      { niveau: 11, classe: 'Guerrier 7', gains: 'Tir incurvé, Flèche magique (les tirs comptent comme magiques), une quatrième flèche arcanique et la réserve portée à 7.' },
      { niveau: 12, classe: 'Guerrier 8', gains: 'Don : Alerte.' },
    ],
    boucle: [
      'Se placer en hauteur avant l’engagement : portée et avantage.',
      'Tour 1 : Embuscade + attaques — souvent une cible morte avant le tour adverse.',
      'Flèche Éclatante sur les groupes, Perçante sur les lignes : les deux passent par un jet d’attaque, contrairement à l’Enchevêtrante qui bute sur un DD de 14.',
      'Fougue réservée aux phases où le boss doit tomber en un tour.',
    ],
    synergies: [
      'La Réverbération empilée par Sam creuse les sauvegardes de FOR et de DEX : c’est là que les flèches Enchevêtrante et Perçante passent enfin.',
      'L’initiative de l’Embuscade ouvre la fenêtre de contrôle avant que les ennemis n’agissent.',
      'Les buffs du Sidekick (Bénédiction, Hâte) transforment les tours doubles en éliminations.',
    ],
    vigilance: [
      'Tireur d’élite avant l’arrivée des bonus au toucher fait rater : n’activer que sur cibles à faible CA au début.',
      'En Honneur, l’opener ne doit jamais laisser Lilian exposée : viser une position que les ennemis ne peuvent pas atteindre au tour 1.',
      'Les quatre niveaux de Rôdeur passent en premier : l’Embuscade au niveau 3 et le don au niveau 4 valent plus, sur la courbe de l’Acte I, que l’Attaque supplémentaire retardée d’autant.',
      'Le Titanstring Bow ajoute le modificateur de FORCE aux dégâts : avec FOR 8, c’est -1. Il faut un élixir de Force de géant des collines à chaque repos long pour qu’il devienne l’arc S+ annoncé — sinon l’Arc de la Banshee fait mieux.',
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
    notesStats: 'CHA maximal pour les DD de contrôle ; le Clerc de la Vie ne dépend pas de la SAG pour majorer les soins. Ligne de charisme : 17 à la création, 19 à l’ASI, 21 avec Birthright (plafond 22), 23 si le Miroir des Pertes du Gantelet de Shar passe. Les paliers impairs ne rapportent rien en eux-mêmes — c’est le 23 final qui donne le +6. Sans le Miroir, partir plutôt de CHA 16 (14 + 2 raciaux) : ASI à 18, Birthright à 20, même modificateur +5 qu’un 21, et deux points d’achat récupérés pour la CON.',
    feats: [
      { niveau: 6, nom: 'Amélioration de caractéristique — CHA +2 (17 → 19)', note: 'Barde 4. DD de contrôle relevé avant l’entrée dans les Terres Maudites.' },
      { niveau: 10, nom: 'Incantateur de guerre', note: 'Barde 8. Le charisme est déjà pris en charge par Birthright et le Miroir des Pertes : une deuxième ASI plafonnerait à 20 et rendrait moins qu’une concentration sécurisée sur Hâte.' },
    ],
    leveling: [
      { niveau: 1, classe: 'Clerc de la Vie 1', gains: 'Armure lourde, soins majorés dès le premier soin.' },
      { niveau: 2, classe: 'Clerc de la Vie 2', gains: 'Conduit divin : Préservation de la vie, soin de zone d’urgence.' },
      { niveau: 3, classe: 'Barde 1', gains: 'Inspiration bardique, sorts sur CHA.' },
      { niveau: 4, classe: 'Barde 2', gains: 'Touche-à-tout, Chant du repos.' },
      { niveau: 5, classe: 'Barde du Savoir 3', gains: 'Paroles cinglantes : annule une attaque ou un jet adverse en réaction.' },
      { niveau: 6, classe: 'Barde 4', gains: 'Don : CHA +2.' },
      { niveau: 7, classe: 'Barde 5', gains: 'Inspiration supérieure, sorts de niveau 3 : Hâte.' },
      { niveau: 8, classe: 'Barde 6', gains: 'Contre-charme, et les deux Secrets magiques du Collège du Savoir : Rappel à la vie (le seul moyen de relever quelqu’un, le dip clerc s’arrêtant au niveau 2) et Gardiens spirituels.' },
      { niveau: 9, classe: 'Barde 7', gains: 'Sorts de niveau 4 : Confusion, Liberté de mouvement.' },
      { niveau: 10, classe: 'Barde 8', gains: 'Don : Incantateur de guerre.' },
      { niveau: 11, classe: 'Barde 9', gains: 'Sorts de niveau 5 : Immobiliser un monstre, Restauration suprême.' },
      { niveau: 12, classe: 'Barde 10', gains: 'Secrets magiques : Contresort (annuler le sort qui tue la run) et Bouclier (+5 CA en réaction, sur le tour où le Sidekick est ciblé).' },
    ],
    boucle: [
      'Pré-combat : buffs longs (Aide, Grande foulée, résistances élémentaires).',
      'Tour 1 : Hâte sur Lilian ou Baptiste, jamais sur une cible qui risque l’étourdissement.',
      'Garder la réaction pour Paroles cinglantes contre le gros coup adverse.',
      'Soins majorés uniquement quand la mort est en jeu : sinon, contrôler.',
    ],
    synergies: [
      'Hâte + Fougue de Lilian : la fenêtre d’élimination des boss.',
      'Les contrôles de zone se cumulent avec la Répulsion de Baptiste.',
      'Rappel à la vie, pris en Secret magique au Barde 6, évite le game over en Honneur si un personnage tombe.',
    ],
    vigilance: [
      'Perdre la concentration sur Hâte inflige un tour d’étourdissement : sécuriser la concentration avant de la lancer.',
      'Le Sidekick doit rester le dernier à mourir : positionnement systématiquement en retrait.',
      'Les deux niveaux de Clerc ne coûtent aucun emplacement — clerc et barde sont deux lanceurs pleins, le niveau de lanceur reste 12. Le vrai prix est le troisième don (Barde 12) et quelques sorts connus, payé par l’armure lourde, les soins majorés et Préservation de la vie.',
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
