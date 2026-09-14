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

// Termes BG3 laissés en anglais faute de traduction FR vérifiée : le `lexique`
// de chaque build renvoie vers bg3.wiki (icône + libellé exact en jeu) pour
// lever le doute. Les sorts dont la VF est sûre (Bénédiction, Hâte, Contresort,
// Gardiens spirituels, Pas brumeux, Fracassement…) restent en français.
const wiki = (page) => `https://bg3.wiki/wiki/${page}`

export const BUILDS = [
  {
    id: 'sam-freeze-thunder',
    personnage: 'Sam',
    nom: 'Freeze Thunder Frontliner',
    split: 'Clerc de la Tempête 8 / Ensorceleur de la Tempête 4',
    classe: 'Clerc',
    sousClasse: 'Domaine de la Tempête / Storm Sorcery',
    role: 'Frontliner / contrôle élémentaire / fenêtre de burst',
    icone: '⚡',
    couleurAccent: 'sky',
    resume:
      'Tient la première ligne en armure lourde et fabrique lui-même sa fenêtre de dégâts : Chilled, puis Wet, puis Gelé — et un seul gros coup de tonnerre sur une cible vulnérable qui ne peut pas répondre.',
    stats: { FOR: 8, DEX: 14, CON: 16, INT: 8, SAG: 16, CHA: 12 },
    notesStats: 'SAG 16 paire à la création (15 + 1 racial) : une seule ASI la porte à 18, et l’Amulet of the Devout ajoute l’équivalent de quatre points de plus. CON 16 (14 + 2 raciaux) pour la concentration, jusqu’à l’Amulet of Greater Health qui la verrouille à 23. CHA 12 suffit : les seuls sorts d’Ensorceleur pris — Bouclier, Pas brumeux, Image miroir — n’ont pas de jet de sauvegarde. INT 8 et FOR 8 assumées, l’armure lourde ne demande pas de FOR en BG3.',
    feats: [
      { niveau: 6, nom: 'Alerte', note: 'Clerc 4. +5 d’initiative : le setup Chilled/Wet prend deux tours, donc il doit commencer avant le paquet adverse.' },
      { niveau: 10, nom: 'Amélioration de caractéristique — SAG +2 (16 → 18)', note: 'Clerc 8. Une seule ASI de SAG suffit : l’Amulet of the Devout donne +2 au DD, soit l’équivalent de quatre points de caractéristique.' },
      { niveau: 12, nom: 'Incantateur de guerre', note: 'Ensorceleur 4. Avantage aux sauvegardes de concentration : Sam tient Gardiens spirituels ou Tempête de neige tout en encaissant, ce qu’aucune ASI ne rachète ici.' },
    ],
    leveling: [
      { niveau: 1, classe: 'Clerc 1', gains: 'Domaine de la Tempête : armure lourde, armes de guerre, réaction Courroux de la Tempête (2d8 de foudre ou de tonnerre). Sorts de domaine : Thunderwave et Nuage de brouillard. Préparer Création d’eau, Bénédiction, Mot de guérison.' },
      { niveau: 2, classe: 'Clerc 2', gains: 'Conduit divin : Courroux destructeur — dépenser une charge pour maximiser les dés de foudre ou de tonnerre.' },
      { niveau: 3, classe: 'Ensorceleur 1', gains: 'Storm Sorcery : Tempestuous Magic — voler jusqu’à 9 m en action bonus après chaque sort de niveau 1 ou plus, sans attaque d’opportunité. Sorts sur CHA : Bouclier.' },
      { niveau: 4, classe: 'Ensorceleur 2', gains: 'Points de sorcellerie et déjà deux métamagies : Sort accéléré (le setup Création d’eau en action bonus) et Distant Spell.' },
      { niveau: 5, classe: 'Clerc 3', gains: 'Sorts de domaine de niveau 2 : Gust of Wind et Fracassement — le premier vrai coup de tonnerre du build.' },
      { niveau: 6, classe: 'Clerc 4', gains: 'Don : Alerte.' },
      { niveau: 7, classe: 'Clerc 5', gains: 'Destruction des morts-vivants, et sorts de domaine de niveau 3 : Appel de la foudre et Sleet Storm. Gardiens spirituels devient préparable : c’est le pic de puissance du milieu de run.' },
      { niveau: 8, classe: 'Clerc 6', gains: 'Frappe de foudre : chaque dégât de foudre ou de tonnerre repousse la cible de 3 m si elle est de taille G ou moins. Deuxième charge de Conduit divin.' },
      { niveau: 9, classe: 'Clerc 7', gains: 'Sorts de domaine de niveau 4, toujours préparés : Ice Storm et Liberté de mouvement.' },
      { niveau: 10, classe: 'Clerc 8', gains: 'Frappe divine : +1d8 de tonnerre sur une attaque de mêlée par tour — et ce tonnerre brise Gelé sur une cible vulnérable. Don : SAG +2 (16 → 18).' },
      { niveau: 11, classe: 'Ensorceleur 3', gains: 'Troisième métamagie et emplacements d’Ensorceleur de niveau 2 : Image miroir et Pas brumeux.' },
      { niveau: 12, classe: 'Ensorceleur 4', gains: 'Don : Incantateur de guerre.' },
    ],
    boucle: [
      'Appliquer Encrusted with Frost puis Chilled : un sort de froid avec Mourning Frost et les Winter’s Clutches fait les deux d’un coup.',
      'Appliquer Wet ensuite, jamais avant — Création d’eau, accélérée en action bonus si le tour est chargé. L’ordre est la règle : Chilled PUIS Wet.',
      'La cible passe Gelée : Incapacitée, vulnérable au contondant, au tonnerre et à la force, pour 2 tours grâce à Encrusted with Frost.',
      'Un seul gros coup de tonnerre pour encaisser la vulnérabilité — Fracassement monté en niveau, doublé par le Courroux destructeur. Le premier coup brise la glace : ne pas le gâcher sur un cantrip.',
      'Sur les paquets sans setup : Sleet Storm ou Gardiens spirituels, et Appel de la foudre sur cibles Wet.',
    ],
    synergies: [
      'L’eau posée par l’équipe double les dégâts de foudre et sert de deuxième source de Wet pour la chaîne du gel.',
      'La Réverbération des Boots of Stormy Clamour s’empile sur chaque étape du setup : Chilled, Encrusted with Frost et Wet comptent chacun comme une condition.',
      'Spike Growth de Baptiste tient les ennemis dans la glace et le Sleet Storm que Sam laisse derrière lui : une zone de contrôle en plus, sans jet d’attaque.',
      'Une cible Gelée est Incapacitée : c’est la fenêtre où Lilian place sa Fougue et son critique garanti sans risque de riposte.',
    ],
    vigilance: [
      'L’ordre des conditions n’est pas négociable : Chilled puis Wet. Geler une cible déjà Wet ne produit rien — il faut réappliquer Wet après.',
      'Sans les Winter’s Clutches, Gelé dure 1 tour et expire au début du tour de la cible sans jamais l’immobiliser : ce n’est alors qu’une fenêtre de vulnérabilité immédiate, pas un contrôle.',
      'Markoheshkir n’applique pas Chilled. L’équiper à la place de Mourning Frost coupe la chaîne entière : c’est un bâton de puissance brute, pas le bâton par défaut de ce build.',
      'Les sorts de sous-classe de Storm Sorcery (Création d’eau, Thunderwave, Sleet Storm, Appel de la foudre) arrivent au niveau 6 de la classe, hors de portée sur ce split — ils sont déjà couverts par le Domaine de la Tempête, mais il ne faut pas compter deux fois dessus.',
      'À Ensorceleur 4, les sorts connus plafonnent au niveau 2 : ni Contresort ni Hâte de ce côté-là. Le Contresort doit venir du Sidekick.',
      'Le Courroux destructeur ne maximise que les dés de foudre et de tonnerre : dépensé sur autre chose, c’est une charge de Conduit divin perdue pour rien.',
    ],
    lexique: [
      { nom: 'Storm Sorcery', wiki: wiki('Storm_Sorcery') },
      { nom: 'Tempestuous Magic', wiki: wiki('Tempestuous_Magic') },
      { nom: 'Distant Spell', wiki: wiki('Metamagic:_Distant_Spell') },
      { nom: 'Thunderwave', wiki: wiki('Thunderwave') },
      { nom: 'Gust of Wind', wiki: wiki('Gust_of_Wind') },
      { nom: 'Sleet Storm', wiki: wiki('Sleet_Storm') },
      { nom: 'Ice Storm', wiki: wiki('Ice_Storm') },
      { nom: 'Chilled', wiki: wiki('Chilled') },
      { nom: 'Wet', wiki: wiki('Wet') },
      { nom: 'Encrusted with Frost', wiki: wiki('Encrusted_with_Frost_(Condition)') },
      { nom: 'Ray of Frost', wiki: wiki('Ray_of_Frost') },
    ],
  },
  {
    id: 'baptiste-hexblade-spores',
    personnage: 'Baptiste',
    nom: 'Hexblade / Cercle des Spores',
    split: 'Occultiste (Hexblade) 6 / Druide du Cercle des Spores 6',
    classe: 'Occultiste',
    sousClasse: 'Hexblade / Cercle des Spores',
    role: 'DPS mêlée / nécromancien',
    icone: '🍄',
    couleurAccent: 'purple',
    resume:
      'Reconversion forcée : sans la Potent Robe, l’Explosion occulte ne double plus rien. Baptiste passe en mêlée avec une arme liée au Charisme, une malédiction sans concentration et une réserve de morts-vivants — Symbiotic Entity et Fungal Infestation, tous deux du Cercle des Spores.',
    stats: { FOR: 8, DEX: 14, CON: 14, INT: 8, SAG: 12, CHA: 16 },
    notesStats: 'CHA 16 à la création (14 + 2 raciaux), porté à 18 par l’unique ASI. CON 14 plutôt que SAG 16 : Baptiste se bat au contact et perd son bonus de dégâts nécrotique dès que les PV temporaires de Symbiotic Entity tombent à zéro — la CON sert autant les PV que les sauvegardes de concentration. SAG 12 suffit : les sorts de Druide pris ici (Longstrider, Spike Growth, Moonbeam, Animate Dead) n’ont pas de DD à pousser, seulement des emplacements à préparer.',
    feats: [
      { niveau: 4, nom: 'Amélioration de caractéristique — CHA +2 (16 → 18)', note: 'Occultiste 4. Le seul palier de don côté Occultiste — Hexblade s’arrête à 6 sur ce split, donc pas de deuxième ASI de ce côté.' },
      { niveau: 10, nom: 'Incantateur de guerre', note: 'Druide 4. Avantage aux sauvegardes de concentration : Baptiste tient Spike Growth ou Moonbeam en pleine mêlée, ce qui encaisse plus que n’importe quel point de caractéristique à ce stade.' },
    ],
    leveling: [
      { niveau: 1, classe: 'Occultiste 1', gains: 'Patron Hexblade : Hexblade’s Curse (bonus action, sans concentration, ajoute la maîtrise aux dégâts contre la cible maudite) et Bind Hexed Weapon, qui lie une arme à une main et fait utiliser le CHA pour son toucher et ses dégâts.' },
      { niveau: 2, classe: 'Occultiste 2', gains: 'Deux Manifestations occultes : Devil’s Sight (vision dans les ténèbres, magiques comprises) et Armor of Shadows (Bouclier magique gratuit, une fois par repos court).' },
      { niveau: 3, classe: 'Occultiste 3', gains: 'Dons de pacte : Pacte de la Lame — invoquer une arme liée dans la main à volonté.' },
      { niveau: 4, classe: 'Occultiste 4', gains: 'Don : CHA +2 (16 → 18).' },
      { niveau: 5, classe: 'Druide 1', gains: 'Forme sauvage et sorts de Druide sur SAG : Longstrider, Healing Word.' },
      { niveau: 6, classe: 'Druide 2', gains: 'Cercle des Spores : Halo of Spores (réaction nécrotique de zone) et Symbiotic Entity (4 PV temporaires par niveau de Druide, soit 8, plus 1d6 nécrotique par attaque de mêlée tant que les PV temporaires tiennent).' },
      { niveau: 7, classe: 'Occultiste 5', gains: 'Troisième Manifestation occulte (Fiendish Vigor, False Life gratuit) et Pacte approfondi : seconde attaque avec l’arme liée.' },
      { niveau: 8, classe: 'Occultiste 6', gains: 'Spectre maudit : quand une cible portant Hexblade’s Curse meurt, invoque un spectre à ses côtés.' },
      { niveau: 9, classe: 'Druide 3', gains: 'Sorts de niveau 2 : Spike Growth, Moonbeam.' },
      { niveau: 10, classe: 'Druide 4', gains: 'Don : Incantateur de guerre.' },
      { niveau: 11, classe: 'Druide 5', gains: 'Sorts de niveau 3 : Animate Dead — le premier mort-vivant permanent de l’armée.' },
      { niveau: 12, classe: 'Druide 6', gains: 'Symbiotic Entity monte à 24 PV temporaires (4 par niveau de Druide) et Fungal Infestation : réaction qui relève un cadavre frais en zombie fongique, 4 charges par repos long.' },
    ],
    boucle: [
      'Hexblade’s Curse en bonus action sur la cible prioritaire — aucune concentration engagée, donc aucun conflit avec un sort de Druide en cours.',
      'Deux attaques avec l’arme liée par Bind Hexed Weapon : CHA au toucher et aux dégâts sur les deux.',
      'Halo of Spores et Fungal Infestation en réaction dès qu’une cible meurt à portée ou qu’un cadavre est disponible.',
      'Sur les paquets qui durent : Spike Growth ou Moonbeam pour le contrôle, en gardant la concentration protégée par Incantateur de guerre.',
    ],
    synergies: [
      'Un spectre, des zombies fongiques et, plus tard, un mort-vivant animé par Animate Dead occupent l’espace pendant que Sam pose ses surfaces et que Lilian tire depuis l’arrière.',
      'Spike Growth ajoute une zone de contrôle qui ne dépend d’aucun DD élevé : elle tient sa place même avec SAG 12.',
      'Le Spectre maudit se déclenche sur n’importe quelle cible sous Hexblade’s Curse tuée par l’équipe, pas seulement par Baptiste : un finisher de Lilian ou de Sam suffit à le lever.',
    ],
    vigilance: [
      'Pacte approfondi (2e attaque avec l’arme liée) recule du niveau de personnage 5 au niveau 7 : l’ordre choisi fait passer Symbiotic Entity et Halo of Spores en ligne dès le niveau 6 plutôt que le niveau 8, pour des PV temporaires disponibles avant Grymforge, le Bulette et la patrouille githyanki de la Crèche — au prix de deux niveaux sans la seconde attaque.',
      'Sans la Potent Robe, il n’y a plus de multiplicateur de sort mineur à empiler : le loadout doit désormais servir l’arme liée, pas les rayons.',
      'Le bonus nécrotique de Symbiotic Entity et le rider de dégâts disparaissent dès que les PV temporaires tombent à zéro : c’est la vraie jauge de puissance du build, pas les PV réels.',
      'Le sort Hex (avec concentration) est volontairement écarté : il ferait doublon avec Spike Growth ou Moonbeam sur l’unique concentration disponible. Hexblade’s Curse, qui n’en demande aucune, reste le moteur de dégâts constant.',
      'Druide 6 ne monte pas jusqu’aux sorts de niveau 4 : pas de Dryade ni d’élémentaire supérieur sur ce split, et Animate Dead ne relève qu’un mort-vivant à la fois.',
      'Warlock et Druide utilisent chacun leur propre caractéristique d’incantation (CHA et SAG) : aucune pièce d’équipement ne fait remonter les deux DD à la fois.',
    ],
    lexique: [
      { nom: 'Hexblade', wiki: wiki('Hexblade') },
      { nom: 'Hexblade’s Curse', wiki: wiki('Hexblade%27s_Curse') },
      { nom: 'Bind Hexed Weapon', wiki: wiki('Bind_Hexed_Weapon') },
      { nom: 'Pact of the Blade', wiki: wiki('Pact_of_the_Blade') },
      { nom: 'Deepened Pact', wiki: wiki('Warlock') },
      { nom: 'Accursed Spectre', wiki: wiki('Accursed_Spectre') },
      { nom: 'Devil’s Sight', wiki: wiki('Devil%27s_Sight') },
      { nom: 'Armor of Shadows', wiki: wiki('Armour_of_Shadows') },
      { nom: 'Fiendish Vigor', wiki: wiki('Fiendish_Vigour') },
      { nom: 'Circle of Spores', wiki: wiki('Circle_of_Spores') },
      { nom: 'Symbiotic Entity', wiki: wiki('Symbiotic_Entity') },
      { nom: 'Halo of Spores', wiki: wiki('Halo_of_Spores') },
      { nom: 'Fungal Infestation', wiki: wiki('Fungal_Infestation') },
      { nom: 'Melee Caster', wiki: wiki('Melee_Caster') },
    ],
  },
  {
    id: 'lilian-arcane-archer',
    personnage: 'Lilian',
    nom: 'Arcane Archer / Gloom Stalker',
    split: 'Guerrier Archer Arcanique 8 / Rôdeur Gloom Stalker 4',
    classe: 'Guerrier',
    sousClasse: 'Archer Arcanique / Gloom Stalker',
    role: 'DPS distance / opener',
    icone: '🏹',
    couleurAccent: 'emerald',
    resume:
      'Guerrier d’abord pour brancher l’Attaque supplémentaire au niveau 5, Gloom Stalker ensuite pour Dread Ambusher. Flèches arcaniques et Tireur d’élite tout du long.',
    stats: { FOR: 8, DEX: 17, CON: 14, INT: 13, SAG: 14, CHA: 8 },
    notesStats: 'DEX 17 à la création puis +2 au niveau 9 et +1 au niveau 10 : 20 au plafond. INT 13 → 14 au même niveau, pour le DD des flèches arcaniques (8 + maîtrise + INT). À plafond, ce DD reste à 14 : les flèches à jet de sauvegarde sont un bonus, jamais le plan — les flèches à jet d’attaque, elles, profitent de tout le toucher du build.',
    feats: [
      { niveau: 4, nom: 'Tireur d’élite', note: 'Guerrier 4. -5 au toucher, +10 aux dégâts : le style Archerie est déjà pris au niveau 1 et les Gloves of Archery arrivent tôt, donc le malus est absorbé dès la prise.' },
      { niveau: 9, nom: 'Amélioration de caractéristique — DEX +2 (17 → 19)', note: 'Rôdeur 4. Le seul palier de don de la branche Rôdeur ; il tombe pile quand les CA d’Acte II montent.' },
      { niveau: 10, nom: 'Amélioration de caractéristique — DEX +1 / INT +1 (20 / 14)', note: 'Guerrier 6, le don bonus de la classe. DEX au plafond, et un point d’INT pour le DD des flèches arcaniques.' },
      { niveau: 12, nom: 'Alerte', note: 'Guerrier 8. +5 d’initiative qui s’ajoutent aux +3 de Dread Ambusher.' },
    ],
    leveling: [
      { niveau: 1, classe: 'Guerrier 1', gains: 'Style de combat Archerie (+2 au toucher) et Second souffle.' },
      { niveau: 2, classe: 'Guerrier 2', gains: 'Fougue : une action supplémentaire, rechargée à chaque repos court.' },
      { niveau: 3, classe: 'Guerrier Archer Arcanique 3', gains: 'Trois flèches arcaniques au choix (4 tirs par repos court) : Grasping Arrow, Bursting Arrow, Piercing Arrow. Aucune option de foudre n’existe dans la liste.' },
      { niveau: 4, classe: 'Guerrier 4', gains: 'Don : Tireur d’élite.' },
      { niveau: 5, classe: 'Guerrier 5', gains: 'Attaque supplémentaire — le palier qui commande tout l’ordre : la brancher au niveau 5 plutôt qu’au 8 ou au 9 est ce qui tient le milieu de run.' },
      { niveau: 6, classe: 'Rôdeur 1', gains: 'Ennemi juré et Explorateur né : deux choix de confort, aucun impact sur la courbe de dégâts.' },
      { niveau: 7, classe: 'Rôdeur 2', gains: 'Emplacements de sorts et Marque du chasseur. Deuxième style de combat : Défense (+1 CA), Archerie étant déjà pris au Guerrier 1.' },
      { niveau: 8, classe: 'Rôdeur Gloom Stalker 3', gains: 'Dread Ambusher : +3 initiative et une attaque supplémentaire au premier tour. Elle arrive en pleine Acte II, donc sur des combats où le tour 1 compte vraiment.' },
      { niveau: 9, classe: 'Rôdeur 4', gains: 'Don : DEX +2 (17 → 19).' },
      { niveau: 10, classe: 'Guerrier 6', gains: 'Don supplémentaire (spécificité Guerrier) : DEX +1 / INT +1.' },
      { niveau: 11, classe: 'Guerrier 7', gains: 'Curving Shot, Magic Arrow (les tirs comptent comme magiques), une quatrième flèche arcanique et la réserve portée à 7.' },
      { niveau: 12, classe: 'Guerrier 8', gains: 'Don : Alerte.' },
    ],
    boucle: [
      'Avant le niveau 8 : pas d’opener Gloom Stalker. Le tour 1 se joue à la Fougue, dépensée dès qu’une cible peut tomber avant d’agir.',
      'À partir du niveau 8 : Dread Ambusher + attaques au tour 1, souvent une cible morte avant que le paquet ne joue.',
      'Bursting Arrow sur les groupes, Piercing Arrow sur les lignes : les deux passent par un jet d’attaque, contrairement à Grasping Arrow qui bute sur un DD de 14.',
      'Dès le niveau 5 : 2 attaques, 4 avec la Fougue, 5 si la Hâte du Sidekick est posée. Au niveau 11, Curving Shot rachète un raté en action bonus.',
    ],
    synergies: [
      'La Réverbération empilée par Sam creuse les sauvegardes de FOR et de DEX : c’est là que Grasping Arrow et Piercing Arrow passent enfin.',
      'Une fois Dread Ambusher en place (niveau 8), l’initiative de Lilian ouvre la fenêtre de contrôle avant que les ennemis n’agissent — avant ça, c’est l’Alerte de Sam qui joue ce rôle.',
      'La Bénédiction du Sidekick (+1d4 au toucher) rachète une partie du -5 du Tireur d’élite : c’est le buff qui compte le plus pour Lilian, devant la Hâte.',
    ],
    vigilance: [
      'L’ordre est Guerrier 5 d’abord, Rôdeur ensuite : prioriser le Gloom Stalker repousse l’Attaque supplémentaire au niveau 8 ou 9 et creuse un trou de dégâts sur tout le milieu de partie.',
      'Corollaire assumé : pas de Dread Ambusher ni de sorts de Rôdeur avant le niveau 8. L’Acte I se joue en archer Guerrier pur, ce qui est plus faible en initiative mais plus fiable en dégâts par tour.',
      'DEX reste à 17 jusqu’au niveau 9 : sur cette fenêtre, Tireur d’élite ne s’active que sur cibles à faible CA.',
      'Le Titanstring Bow ajoute le modificateur de FORCE aux dégâts : avec FOR 8, c’est -1. Il faut un élixir de Force de géant des collines à chaque repos long pour qu’il devienne l’arc S+ annoncé — sinon le Bow of the Banshee fait mieux.',
    ],
    lexique: [
      { nom: 'Arcane Archer', wiki: wiki('Arcane_Archer') },
      { nom: 'Gloom Stalker', wiki: wiki('Gloom_Stalker') },
      { nom: 'Dread Ambusher', wiki: wiki('Dread_Ambusher') },
      { nom: 'Arcane Shot (Grasping / Bursting / Piercing Arrow)', wiki: wiki('Arcane_Shot') },
      { nom: 'Curving Shot', wiki: wiki('Curving_Shot') },
      { nom: 'Magic Arrow', wiki: wiki('Magic_Arrow') },
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
      { niveau: 7, classe: 'Barde 5', gains: 'Font of Inspiration, sorts de niveau 3 : Hâte.' },
      { niveau: 8, classe: 'Barde 6', gains: 'Countercharm, et les deux Secrets magiques du Collège du Savoir : Rappel à la vie (le seul moyen de relever quelqu’un, le dip clerc s’arrêtant au niveau 2) et Gardiens spirituels.' },
      { niveau: 9, classe: 'Barde 7', gains: 'Sorts de niveau 4 : Confusion, Liberté de mouvement.' },
      { niveau: 10, classe: 'Barde 8', gains: 'Don : Incantateur de guerre.' },
      { niveau: 11, classe: 'Barde 9', gains: 'Sorts de niveau 5 : Hold Monster, Restauration supérieure.' },
      { niveau: 12, classe: 'Barde 10', gains: 'Secrets magiques : Contresort (annuler le sort qui tue la run) et Bouclier (+5 CA en réaction, sur le tour où le Sidekick est ciblé).' },
    ],
    boucle: [
      'Pré-combat : buffs longs (Aide, Grande foulée, résistances élémentaires).',
      'Tour 1 : Hâte sur Lilian ou Baptiste, jamais sur une cible qui risque l’étourdissement.',
      'Garder la réaction pour Paroles cinglantes contre le gros coup adverse.',
      'Le Conduit divin du Clerc de la Vie est le seul soin de zone du groupe : le garder pour le tour où deux personnages sont bas, pas pour un seul.',
    ],
    synergies: [
      'Hâte + Fougue de Lilian : la fenêtre d’élimination des boss.',
      'Les contrôles de zone se cumulent avec Spike Growth et Halo of Spores de Baptiste.',
      'Rappel à la vie, pris en Secret magique au Barde 6, évite le game over en Honneur si un personnage tombe.',
    ],
    vigilance: [
      'Perdre la concentration sur Hâte inflige un tour d’étourdissement : sécuriser la concentration avant de la lancer.',
      'Paroles cinglantes et Bouclier tapent tous les deux dans la réaction : une seule des deux par tour, à trancher au moment où le gros coup part.',
      'Les deux niveaux de Clerc ne coûtent aucun emplacement — clerc et barde sont deux lanceurs pleins, le niveau de lanceur reste 12. Le vrai prix est le troisième don (Barde 12) et quelques sorts connus, payé par l’armure lourde, les soins majorés et Préservation de la vie.',
    ],
    lexique: [
      { nom: 'Font of Inspiration', wiki: wiki('Font_of_Inspiration') },
      { nom: 'Cutting Words', wiki: wiki('Cutting_Words') },
      { nom: 'Countercharm', wiki: wiki('Countercharm') },
      { nom: 'Hold Monster', wiki: wiki('Hold_Monster') },
      { nom: 'Greater Restoration', wiki: wiki('Greater_Restoration') },
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
