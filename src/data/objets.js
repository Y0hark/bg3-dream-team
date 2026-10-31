// ------------------------------------------------------------------
// Catalogue CANONIQUE des objets de la run Honneur V2.
//
// Un objet = une définition (ID stable, effet, slot), peu importe combien de
// rôles le recommandent. Ses `sources` d'acquisition sont séparées : il peut
// y en avoir plusieurs (rattrapages), chacune avec son risque de verrouillage
// narratif. L'EMPLOI d'un objet par un rôle (acte, slot, rang, condition)
// vit dans loadouts.js — jamais ici.
//
// Les IDs des objets déjà catalogués sont conservés (même objet = même ID,
// d'où la progression des sauvegardes qui suit) : voir items-anciens.js. Les
// définitions recopient les fiches Notion Sorcier / Paladin / Moine /
// Sidekick ; les `effet` décrivent l'effet réel ET sa condition, pas une
// promesse. Aucune URL n'est devinée : `wiki` vaut null quand la fiche n'en
// cite pas, et `lieu` vaut null (avec `aConfirmer`) quand l'emplacement
// n'est pas catalogué dans lieux.js.
//
// Champs d'une source :
// - acte, lieu (id de lieux.js ou null), texte ;
// - verrou : 'aucun' | 'quete' | 'pnj' | 'zone-dangereuse' |
//   'point-de-non-retour' | 'ressource-unique' ;
// - rattrapage : true si c'est une seconde chance après un original raté ;
// - aConfirmer : true si la source dépend du hotfix ou d'un choix de run.
//
// `offensif` : types de dégâts auxquels le bonus offensif de l'objet
// s'applique réellement ('arme' | 'poings' | 'sorts'), null sans bonus de
// dégâts. C'est ce champ qui empêche de recopier Caustic Band sur des poings.
// ------------------------------------------------------------------

import { ICONES, NOMS_FR, USAGES_OBJETS } from './objets-meta.js'

const wiki = (page) => (page === null ? null : 'https://bg3.wiki/wiki/' + page)

const src = (acte, lieu, texte, extra = {}) => ({
  acte,
  lieu,
  texte,
  verrou: 'aucun',
  rattrapage: false,
  aConfirmer: false,
  ...extra,
})

const objet = (id, nom, slot, page, effet, sources, extra = {}) => ({
  id,
  nom,
  slot,
  wiki: wiki(page),
  effet,
  sources,
  offensif: null,
  critique: false,
  copiable: true,
  ...extra,
})

export const SLOTS_OBJET = [
  'Arme',
  'Arme à distance',
  'Bouclier',
  'Casque',
  'Cape',
  'Armure',
  'Gants',
  'Bottes',
  'Amulette',
  'Anneau',
  'Consommable',
]

const TOUS_DEGATS = ['arme', 'poings', 'sorts']

const OBJETS_BRUTS = [
  // ================================================================
  // Armes
  // ================================================================
  objet('the-spellsparkler', 'The Spellsparkler', 'Arme', 'The_Spellsparkler',
    'Bâton : des charges de foudre se génèrent avec les dégâts de sorts. Un bâton seul suffit ; en cumuler deux demande Dual Wielder.',
    [src(1, 'auberge-waukeen', 'Récompense du sauvetage de Florrick au Relais de Waukeen.', { verrou: 'quete' })],
    { offensif: ['sorts'] }),
  objet('melfs-first-staff', 'Melf’s First Staff', 'Arme', 'Melf%27s_First_Staff',
    '+1 aux attaques de sorts et au DD. Repli accessible quand le bâton d’acte 3 manque.',
    [src(1, 'grotte-ebonlake', 'Vendu par Blurg, colonie myconide.')],
    { offensif: ['sorts'] }),
  objet('markoheshkir', 'Markoheshkir', 'Arme', 'Markoheshkir',
    'Enchantement de sorts, Batterie arcanique et Faveur de Kereska. Flame of Wrath génère de la Chaleur (auto-dégâts qui peuvent gêner la concentration) ; Bolts of Doom est le plan sans Chaleur et contre les immunités feu. Ne pas budgéter deux Batteries arcaniques indépendantes sur un personnage.',
    [src(3, 'tour-ramazith', 'Niveau inférieur de la Tour de Ramazith, sous un globe à désactiver.')],
    { offensif: ['sorts'] }),
  objet('staff-of-spellpower', 'Staff of Spellpower', 'Arme', 'Staff_of_Spellpower',
    '+1 aux attaques de sorts et au DD, Batterie arcanique. Option de bâton tardive.',
    [src(3, 'maison-de-lespoir', 'Coffre-fort de la Maison de l’Espoir.', { verrou: 'zone-dangereuse' })],
    { offensif: ['sorts'] }),
  objet('rhapsody', 'Rhapsody', 'Arme', 'Rhapsody',
    'Dague légère : jusqu’à +3 aux attaques, dégâts et DD après des éliminations (les caisses détruites ne chargent pas le bonus). Se porte avec un bâton seulement avec Dual Wielder.',
    [src(3, null, 'Sur Cazador (Acte III). Lieu non catalogué.', { aConfirmer: true, verrou: 'zone-dangereuse' })],
    { offensif: ['sorts'] }),
  objet('phalar-aluve', 'Phalar Aluve', 'Arme', 'Phalar_Aluve',
    'Épée longue avec aura de soutien (Sing ou Shriek) : l’activation et le placement ont un coût, et Shriek exige que les ennemis soient dans l’aura. Un bâton et un bouclier peuvent être plus sûrs qu’une aura mal placée.',
    [src(1, 'ombreterre', 'Épée dans la pierre, en Outreterre.')]),
  objet('unseen-menace', 'Unseen Menace', 'Arme', 'Unseen_Menace',
    'Pique à allonge : avantage et critique amélioré tant que son invisibilité est active. Un raté la désactive temporairement ; l’avantage ne se cumule pas avec celui du Vœu d’inimitié ni des gants Underdog.',
    [src(1, 'creche-yllek', 'Vendue par A’jak’nir Jeera, Crèche Y’llek.', { verrou: 'pnj' })],
    { offensif: ['arme'] }),
  objet('sword-of-justice', 'Sword of Justice', 'Arme', 'Sword_of_Justice',
    'Alternative précoce : enchantement +1 et protection de CA qui demande de la concentration.',
    [src(1, null, 'Sur Anders, au péage de la Route du Renouveau. Lieu non catalogué.', { aConfirmer: true })],
    { offensif: ['arme'] }),
  objet('charge-bound-warhammer', 'Charge-Bound Warhammer', 'Arme', 'Charge-Bound_Warhammer',
    'Marteau lié : bonus d’enchantement et dégâts de foudre, à deux mains ou avec bouclier. Ses dégâts élémentaires rendent Ring of Elemental Infusion utile avec Booming Blade.',
    [src(2, 'auberge-derniere-lumiere', 'Vendu par Dammon, Ultime Lueur.', { verrou: 'pnj' })],
    { offensif: ['arme'] }),
  objet('halberd-of-vigilance', 'Halberd of Vigilance', 'Arme', 'Halberd_of_Vigilance',
    'Allonge, initiative et dégâts additionnels.',
    [src(2, 'tours-aubelune', 'Vendue par Lann Tarv, Hautelune.', { verrou: 'pnj' })],
    { offensif: ['arme'] }),
  objet('drakethroat-glaive', 'Drakethroat Glaive', 'Arme', 'Drakethroat_Glaive',
    'Son sort d’arme élémentaire peut améliorer une autre arme. Achat de confort : pas besoin de la garder en main.',
    [src(2, 'tours-aubelune', 'Vendue par Roah Moonglow, Hautelune.', { verrou: 'pnj' })]),
  objet('nyrulna', 'Nyrulna', 'Arme', 'Nyrulna',
    '+3, dégâts de tonnerre et +3 m de déplacement. Une arme liée ne se lance pas ; lancée dans une autre configuration, Nyrulna explose et peut toucher alliés et neutres.',
    [src(3, 'cirque-derniers-jours', 'Coffre de la jungle, accessible après le jackpot d’Akabi (Cirque des Derniers Jours). Préparer le personnage envoyé seul dans la jungle.', { verrou: 'zone-dangereuse' })],
    { critique: true, offensif: ['arme'] }),

  // ================================================================
  // Armes à distance (passifs d'initiative / résistances)
  // ================================================================
  objet('bow-of-awareness', 'Bow of Awareness', 'Arme à distance', 'Bow_of_Awareness',
    'Passif d’initiative. L’arc sert pour son passif, pas de plan de tir.',
    [src(1, 'camp-gobelin', 'Vendu par Roah Moonglow (Sanctuaire brisé). Acheter avant de rendre la zone hostile.', { verrou: 'pnj' })]),
  objet('darkfire-shortbow', 'Darkfire Shortbow', 'Arme à distance', 'Darkfire_Shortbow',
    'Résistances feu/froid et Hâte une fois par repos long. Lancer soi-même Hâte demande une action et la concentration : option, pas bonus gratuit.',
    [src(2, 'auberge-derniere-lumiere', 'Vendu par Dammon, Ultime Lueur.', { verrou: 'pnj' })]),
  objet('hellrider-longbow', 'Hellrider Longbow', 'Arme à distance', 'Hellrider_Longbow',
    '+3 initiative. Sans maîtrise de l’arc long, on ne cherche que le passif.',
    [src(3, 'rivington', 'Ferg Drogher, près de la grange réquisitionnée. Le parcours de Shadowheart peut empêcher le commerce.', { verrou: 'pnj', aConfirmer: true })]),
  objet('the-dead-shot', 'The Dead Shot', 'Arme à distance', 'The_Dead_Shot',
    'Améliore le seuil de critique, même pour les attaques de mêlée.',
    [src(3, 'armurerie-stormshore', 'Fytz, Armurerie de Stormshore.')]),

  // ================================================================
  // Boucliers
  // ================================================================
  objet('sentinel-shield', 'Sentinel Shield', 'Bouclier', 'Sentinel_Shield',
    '+3 initiative. Avec un bouclier, le bonus +10 de Great Weapon Master n’est pas actif.',
    [src(2, 'tours-aubelune', 'Vendu par Lann Tarv, Hautelune.', { verrou: 'pnj' })]),
  objet('ketherics-shield', 'Ketheric’s Shield', 'Bouclier', 'Ketheric%27s_Shield',
    '+1 DD et attaques de sorts. Obtenu sur Ketheric à la résolution de l’acte : pas un prérequis pour le combattre.',
    [src(2, 'tours-aubelune', 'Sur Ketheric Thorm, à la résolution de l’acte.', { verrou: 'point-de-non-retour' })]),

  // ================================================================
  // Casques
  // ================================================================
  objet('the-lifebringer', 'The Lifebringer', 'Casque', 'The_Lifebringer',
    'Protection liée aux charges de foudre : intéressante surtout avec Spellsparkler.',
    [src(1, 'grotte-ebonlake', 'Blurg, colonie myconide.')]),
  objet('shadespell-circlet', 'The Shadespell Circlet', 'Casque', 'The_Shadespell_Circlet',
    '+1 DD quand le porteur est dans l’ombre. Aide les sorts à sauvegarde, pas le jet d’attaque de Rayon ardent.',
    [src(1, 'grotte-ebonlake', 'Omeluum.', { aConfirmer: true })],
    { offensif: ['sorts'] }),
  objet('hat-of-fire-acuity', 'Hat of Fire Acuity', 'Casque', 'Hat_of_Fire_Acuity',
    'Des dégâts de feu donnent deux tours d’Acuité arcanique (chaque rayon touché de Rayon ardent peut le déclencher) : jusqu’à dix charges, +attaques de sorts et DD ; prendre des dégâts en retire deux. Ne supprime ni les immunités ni les contraintes de boss.',
    [
      src(2, 'auberge-derniere-lumiere', 'Porté par l’Étrange bœuf à l’Ultime Lueur. Le bœuf doit être laissé vivant au Bosquet en Acte I ; le combat près de Dammon doit être préparé pour ne pas exposer les PNJ alliés.', { verrou: 'pnj' }),
      src(3, 'rivington', 'Rattrapage à Rivington si le bœuf y arrive vivant.', { verrou: 'pnj', rattrapage: true, aConfirmer: true }),
    ],
    { critique: true, offensif: ['sorts'] }),
  objet('fistbreaker-helm', 'Fistbreaker Helm', 'Casque', 'Fistbreaker_Helm',
    '+1 DD et +1 initiative. Solution si le chapeau central est inaccessible, mais pas le même effet de montée en puissance.',
    [src(2, 'tours-aubelune', 'Vendu par Lann Tarv, Hautelune.', { verrou: 'pnj' })],
    { offensif: ['sorts'] }),
  objet('hood-of-the-weave', 'Hood of the Weave', 'Casque', 'Hood_of_the_Weave',
    '+2 attaques de sorts et DD tout de suite, sans montée jusqu’à +10 comme l’Acuité.',
    [src(3, 'manoir-philgrave', 'Mystic Carrion, Manoir de Philgrave.')],
    { offensif: ['sorts'] }),
  objet('birthright', 'Birthright', 'Casque', 'Birthright',
    '+2 CHA, avec le plafond propre à l’objet (22). Remplace le chapeau d’Acuité ; ne suppose pas un bonus illimité.',
    [src(3, 'sorcelleries-sundries', 'Projection de Lorroakan / Rolan, Sorcelleries Sundries.', { verrou: 'pnj' })],
    { offensif: ['sorts'] }),
  objet('pyroquickness-hat', 'Pyroquickness Hat', 'Casque', 'Pyroquickness_Hat',
    'Une action bonus supplémentaire après des dégâts de feu avec un sort à emplacement, une fois par tour ; brûle le porteur. Pas en même temps que Hat of Fire Acuity. Bug signalé : un déclenchement via Sort accéléré consomme l’action bonus gagnée.',
    [src(3, 'sorcelleries-sundries', 'Coffre invisible du caveau d’Elminster (Sorcerous Vault).', { aConfirmer: true })],
    { offensif: ['sorts'] }),
  objet('haste-helm', 'Haste Helm', 'Casque', 'Haste_Helm',
    'Mobilité en début de combat. Option, pas obligation de set.',
    [src(1, 'village-devaste', 'Coffre près du point de passage du Village dévasté.')]),
  objet('grymskull-helm', 'Grymskull Helm', 'Casque', 'Grymskull_Helm',
    'Protection contre les critiques ; maîtrise des armures lourdes requise.',
    [src(1, 'forge-adamantine', 'Grym, forge adamantine.', { verrou: 'zone-dangereuse' })]),
  objet('mask-of-soul-perception', 'Mask of Soul Perception', 'Casque', 'Mask_of_Soul_Perception',
    '+2 aux attaques, initiative et Perception. Ne demande pas de porter un casque classé armure.',
    [src(3, 'devils-fee', 'Coffre verrouillé dans la chambre d’Helsik, étage du Denier du Diable.')]),

  // ================================================================
  // Capes
  // ================================================================
  objet('cloak-of-protection', 'Cloak of Protection', 'Cape', 'Cloak_of_Protection',
    '+1 CA et +1 à toutes les sauvegardes, sans déclencheur. Premier choix universel et candidate naturelle aux copies.',
    [src(2, 'auberge-derniere-lumiere', 'Vendue par Talli, Ultime Lueur.', { verrou: 'pnj' })]),
  objet('cloak-of-the-weave', 'Cloak of the Weave', 'Cape', 'Cloak_of_the_Weave',
    '+1 attaques de sorts et DD, avec Absorption des éléments. Moins pertinente pour les coups d’arme ou les poings.',
    [src(3, 'devils-fee', 'Stock spécial d’Helsik, Denier du Diable, après déblocage.', { verrou: 'quete' })],
    { offensif: ['sorts'] }),
  objet('cloak-of-displacement', 'Cloak of Displacement', 'Cape', 'Cloak_of_Displacement',
    'Désavantage aux attaques contre le porteur jusqu’à ce qu’il prenne des dégâts, réactivé au début du tour. Des dégâts de zone ou automatiques retirent l’effet ; n’aide pas les sauvegardes.',
    [src(3, 'danthelon', 'Entharl Danthelon, La Hache Dansante de Danthelon.')]),
  objet('cloak-elemental-absorption', 'Cloak of Elemental Absorption', 'Cape', 'Cloak_of_Elemental_Absorption',
    'Absorption des éléments une fois par repos court, contre un danger élémentaire prévu. Consomme la réaction (concurrence Bouclier / Contresort) ; ne se cumule pas avec une résistance déjà présente.',
    [src(2, 'tours-aubelune', 'Coffre des appartements de Ketheric, étage de Hautelune.')]),
  objet('thunderskin-cloak', 'Thunderskin Cloak', 'Cape', 'Thunderskin_Cloak',
    'Réactif : une cible sous Réverbération qui blesse le porteur peut subir Hébétement (sauvegarde de CON, DD 13). N’applique pas elle-même la Réverbération.',
    [
      src(2, 'tours-aubelune', 'Vendue par Araj Oblodra, Hautelune.', { verrou: 'pnj' }),
      src(3, null, 'Rattrapage possible en Acte III selon le parcours d’Araj.', { rattrapage: true, aConfirmer: true }),
    ]),
  objet('vivacious-cloak', 'Vivacious Cloak', 'Cape', 'Vivacious_Cloak',
    '8 PV temporaires après un sort lancé en mêlée. Ne s’additionne pas à Armure d’Agathys : ne pas sacrifier de meilleurs PV temporaires.',
    [src(2, 'grand-mausolee', 'Coffre de voyageur verrouillé au sud-est du Grand Mausolée (Reithwin).')]),
  objet('cloak-cunning-brume', 'Cloak of Cunning Brume', 'Cape', 'Cloak_of_Cunning_Brume',
    'Crée une petite brume en se désengageant en combat ; dépense l’action bonus et peut gêner les lignes de vue des alliés.',
    [src(2, 'auberge-derniere-lumiere', 'Mattis, Ultime Lueur.', { verrou: 'pnj' })]),
  objet('mantle-holy-warrior', 'Mantle of the Holy Warrior', 'Cape', 'Mantle_of_the_Holy_Warrior',
    'Aura offensive d’équipe via Crusader’s Mantle, une fois par repos court. Demande de la concentration ; plusieurs auras identiques ne s’additionnent pas.',
    [src(3, 'tabernacle-stormshore', 'Vicar Humbletoes, Tabernacle de la Côte des Tempêtes.')]),

  // ================================================================
  // Armures
  // ================================================================
  objet('protecty-sparkswall', 'The Protecty Sparkswall', 'Armure', 'The_Protecty_Sparkswall',
    '+1 DD ; avec des charges de foudre, bonus de CA et de sauvegardes. En attendant : vêtements ordinaires + Résilience draconique.',
    [src(1, 'grymforge', 'Coffre à Grymforge, sur le parcours des passerelles / pièges.', { verrou: 'zone-dangereuse' })],
    { offensif: ['sorts'] }),
  objet('robe-exquisite-focus', 'Robe of Exquisite Focus', 'Armure', 'Robe_of_Exquisite_Focus',
    '+1 DD. Plutôt une alternative si Sparkswall est attribuée ailleurs qu’une amélioration obligatoire.',
    [src(2, 'tours-aubelune', 'Vendue par Araj Oblodra, Hautelune.', { verrou: 'pnj' })],
    { offensif: ['sorts'] }),
  objet('robe-of-the-weave', 'Robe of the Weave', 'Armure', 'Robe_of_the_Weave',
    'Bonus aux attaques de sorts et au DD, bonne défense.',
    [src(3, 'tour-ramazith', 'Tour de Ramazith, sous un globe à désactiver.')],
    { offensif: ['sorts'] }),
  objet('robe-supreme-defences', 'Robe of Supreme Defences', 'Armure', 'Robe_of_Supreme_Defences',
    'Axée sauvegardes pendant la concentration.',
    [src(3, 'rivington', 'Ferg Drogher, Rivington.', { verrou: 'pnj', aConfirmer: true })]),
  objet('armure-adamantine', 'Adamantine Splint Armour', 'Armure', 'Adamantine_Splint_Armour',
    'CA 18, réduction de dégâts et protection contre les critiques ; maîtrise des armures lourdes requise (armure intermédiaire avant respécialisation sur un Hexblade pur).',
    [src(1, 'forge-adamantine', 'Coulée à la forge adamantine : moule d’armure d’attelles + mithral.')]),
  objet('armour-of-persistence', 'Armour of Persistence', 'Armure', 'Armour_of_Persistence',
    'CA 20, réduction de dégâts, Blade Ward et Résistance permanents ; le Blade Ward permanent ne se multiplie pas avec celui des soins. Sa survie conditionne l’achat.',
    [src(3, 'forge-des-neuf', 'Dammon, Forge des Neuf.', { verrou: 'pnj' })]),
  objet('yuan-ti-scale-mail', 'Yuan-Ti Scale Mail', 'Armure', 'Yuan-Ti_Scale_Mail',
    'Alternative intermédiaire, surtout intéressante avec davantage de DEX : pas une amélioration automatique à DEX 14.',
    [src(2, 'auberge-derniere-lumiere', 'Vendue par Talli, Ultime Lueur.', { verrou: 'pnj' })]),
  objet('the-graceful-cloth', 'The Graceful Cloth', 'Armure', 'The_Graceful_Cloth',
    'Vêtement : +2 DEX (plafond 20) et utilitaire. L’avantage de Grâce féline porte sur les tests de DEX, pas sur toutes les attaques et sauvegardes.',
    [src(1, 'sentier-rosemorne', 'Vendu par Lady Esther, sentier du monastère.', { verrou: 'pnj' })]),
  objet('vest-soul-rejuvenation', 'Vest of Soul Rejuvenation', 'Armure', 'Vest_of_Soul_Rejuvenation',
    'Vêtement : +2 CA, soin sur sauvegarde réussie contre un sort, contre-attaque à mains nues en réaction quand un ennemi vous manque. En quittant Graceful Cloth, recalculer la DEX et l’initiative perdues.',
    [src(3, 'sorcelleries-sundries', 'Marchand de Sorcelleries Sundries, selon le parcours de Rolan / Lorroakan.', { verrou: 'pnj' })]),
  objet('spidersilk-armour', 'Spidersilk Armour', 'Armure', 'Spidersilk_Armour',
    'Avantage aux sauvegardes de CON (concentration) ; CA à comparer à l’armure réellement disponible. Ne se cumule pas avec Greater Health ou War Caster.',
    [src(1, null, 'Sur Minthara, selon son parcours. Lieu non catalogué ; ne pas imposer sa mort pour la fiche.', { verrou: 'pnj', aConfirmer: true })]),

  // ================================================================
  // Gants
  // ================================================================
  objet('bracers-of-defence', 'Bracers of Defence', 'Gants', 'Bracers_of_Defence',
    '+2 CA sans armure ni bouclier (vêtement) : fonctionne avec la Résilience draconique.',
    [src(1, 'village-devaste', 'Coffre du laboratoire secret sous l’apothicaire du Village dévasté.')]),
  objet('gloves-of-dexterity', 'Gloves of Dexterity', 'Gants', 'Gloves_of_Dexterity',
    'Fixe la DEX à 18 et ajoute +1 aux attaques. Rétablir une DEX naturelle correcte avant de les remplacer.',
    [src(1, 'creche-yllek', 'Vendus par A’jak’nir Jeera, Crèche Y’llek.', { verrou: 'pnj' })],
    { offensif: ['sorts', 'arme'] }),
  objet('daredevil-gloves', 'Daredevil Gloves', 'Gants', 'Daredevil_Gloves',
    '+1 aux attaques de sorts et aide au contact.',
    [src(1, 'creche-yllek', 'Vendus par A’jak’nir Jeera, Crèche Y’llek.', { verrou: 'pnj' })],
    { offensif: ['sorts'] }),
  objet('spellmight-gloves', 'Spellmight Gloves', 'Gants', 'Spellmight_Gloves',
    '+1d8 aux sorts à jet d’attaque contre -5 au jet. Désactiver le passif si la première salve devient trop imprécise ; activer après la montée de l’Acuité.',
    [src(3, null, 'Récompense de Lucretious après la quête des morceaux de Dribbles : pas un achat garanti dès l’arrivée en Acte III. Lieu non catalogué.', { verrou: 'quete', aConfirmer: true })],
    { offensif: ['sorts'] }),
  objet('helldusk-gloves', 'Helldusk Gloves', 'Gants', 'Helldusk_Gloves',
    '+1 attaques de sorts / DD ; leurs bonus de dégâts d’arme ou à mains nues ne s’ajoutent pas simplement à Rayon ardent.',
    [src(3, 'maison-de-lespoir', 'Haarlep, Maison de l’Espoir.', { verrou: 'zone-dangereuse' })],
    { offensif: ['sorts', 'arme', 'poings'] }),
  objet('flawed-helldusk-gloves', 'Flawed Helldusk Gloves', 'Gants', 'Flawed_Helldusk_Gloves',
    'Version d’acte 2 (Dammon, fer infernal). Aux armes : +1d4 feu ; aux poings : +1d4 nécrotique et possibilité de Saignement, pas le bonus feu des armes. Adapter face aux résistances.',
    [src(2, 'auberge-derniere-lumiere', 'Dammon, Ultime Lueur, contre du fer infernal selon les options de forge.', { verrou: 'pnj' })],
    { offensif: ['arme', 'poings'] }),
  objet('gloves-belligerent-skies', 'Gloves of Belligerent Skies', 'Gants', 'Gloves_of_Belligerent_Skies',
    'Foudre, tonnerre ou radiant appliquent la Réverbération. Le feu seul ne les déclenche pas.',
    [src(1, 'creche-yllek', 'Coffre élégant de la chambre de l’Inquisiteur, contre le mur sud.')]),
  objet('gloves-growling-underdog', 'Gloves of the Growling Underdog', 'Gants', 'Gloves_of_the_Growling_Underdog',
    'Avantage conditionnel aux attaques de mêlée. Le jeu vérifie en pratique les ennemis à proximité de la cible, pas du porteur : contrôler l’avantage affiché. Ne se cumule pas avec celui d’Unseen Menace ou du Vœu d’inimitié.',
    [src(1, 'camp-gobelin', 'Caisses au trésor de Dror Ragzlin, derrière la grille verrouillée du Sanctuaire brisé.')],
    { offensif: ['arme'] }),
  objet('legacy-of-the-masters', 'Legacy of the Masters', 'Gants', 'Legacy_of_the_Masters',
    '+2 attaques et dégâts d’arme : excellents pour compenser Great Weapon Master.',
    [src(3, 'forge-des-neuf', 'Dammon, Forge des Neuf.', { verrou: 'pnj' })],
    { offensif: ['arme'] }),
  objet('gloves-sparkle-hands', 'The Sparkle Hands', 'Gants', 'The_Sparkle_Hands',
    'Charges de foudre sur les coups à mains nues.',
    [src(1, 'marais-ensoleille', 'Coffre au pied de la grosse souche du sanctuaire décrépit, Marais Ensoleillé.')],
    { offensif: ['poings'] }),
  objet('gloves-cinder-sizzle', 'Gloves of Cinder and Sizzle', 'Gants', 'Gloves_of_Cinder_and_Sizzle',
    '+1d4 feu aux poings. Choisir selon la cible, pas uniquement la rareté.',
    [src(1, 'sentier-rosemorne', 'Vendus par Lady Esther.', { verrou: 'pnj' })],
    { offensif: ['poings'] }),
  objet('gloves-soul-catching', 'Gloves of Soul Catching', 'Gants', 'Gloves_of_Soul_Catching',
    '+1d10 force aux poings, +2 CON (jusqu’à 20) et soin de 10 PV une fois par tour après un coup à mains nues. Acquisition dangereuse et tardive : ne pas bâtir la survie initiale dessus.',
    [src(3, 'maison-de-lespoir', 'Récompense de la quête de Hope, avec sauvetage et résolution du combat final.', { verrou: 'zone-dangereuse' })],
    { offensif: ['poings'] }),
  objet('hellriders-pride', 'Hellrider’s Pride', 'Gants', 'Hellrider%27s_Pride',
    'Soigner un autre personnage lui applique la protection physique deux tours. Ne protège pas automatiquement le soigneur ; le même Blade Ward ne se cumule pas. N’annule ni le feu ni les contrôles.',
    [src(1, 'bosquet-emeraude', 'Zevlor, notamment récompense de la résolution de l’enquête sur Kagha. Pas besoin de massacrer le Bosquet.', { verrou: 'quete' })],
    { critique: true }),
  objet('reviving-hands', 'The Reviving Hands', 'Gants', 'The_Reviving_Hands',
    'Amélioration du slot de gants : Blade Ward lors d’un soin, Death Ward quand une créature est ressuscitée. Un simple Mot de guérison sur un allié à terre n’est pas une résurrection.',
    [src(3, 'tabernacle-stormshore', 'Vicar Humbletoes, Tabernacle de la Côte des Tempêtes.')],
    { critique: true }),

  // ================================================================
  // Bottes
  // ================================================================
  objet('disintegrating-night-walkers', 'Disintegrating Night Walkers', 'Bottes', 'Disintegrating_Night_Walkers',
    'Mobilité, protections contre plusieurs entraves et Pas brumeux. Chaque porteur peut en avoir une copie.',
    [src(1, 'grymforge', 'Sur Nere, Grymforge.', { verrou: 'zone-dangereuse' })]),
  objet('boots-stormy-clamour', 'Boots of Stormy Clamour', 'Bottes', 'Boots_of_Stormy_Clamour',
    'Réverbération quand des conditions éligibles sont infligées : un choix de debuff, pas un bonus universel aux attaques.',
    [src(1, 'grotte-ebonlake', 'Omeluum, après sa quête.', { verrou: 'quete' })]),
  objet('boots-of-speed', 'Boots of Speed', 'Bottes', 'Boots_of_Speed',
    'Mobilité activable en action bonus : concurrence Malédiction, Vœu et l’attaque bonus de Great Weapon Master.',
    [src(1, 'grotte-ebonlake', 'Récompense de Thulla après son soin, colonie myconide.', { verrou: 'quete' })]),
  objet('boots-of-persistence', 'Boots of Persistence', 'Bottes', 'Boots_of_Persistence',
    'Longstrider et Liberté de mouvement.',
    [src(3, 'forge-des-neuf', 'Dammon, Forge des Neuf.', { verrou: 'pnj' })]),
  objet('boots-aid-comfort', 'Boots of Aid and Comfort', 'Bottes', 'Boots_of_Aid_and_Comfort',
    'PV temporaires après soins : petit bonus, pas une priorité supérieure à survivre. Les PV temporaires ne s’additionnent pas.',
    [src(1, 'camp-gobelin', 'Grat, camp gobelin.', { verrou: 'pnj' })]),
  objet('boots-uninhibited-kushigo', 'Boots of Uninhibited Kushigo', 'Bottes', 'Boots_of_Uninhibited_Kushigo',
    'Ajoutent le modificateur de SAG aux dégâts à mains nues (+4 par frappe concernée avec SAG 18). Les remplacer par Clamour ou Night Walkers coûte ce bonus. Ce sont les bottes qui comptent ici, pas les gants Kushigo.',
    [src(3, 'plan-astral', 'Sur le prélat Lir’i’c, au Plan astral, à la transition vers l’Acte III. À ramasser avant de repartir.', { verrou: 'point-de-non-retour' })],
    { critique: true, offensif: ['poings'] }),

  // ================================================================
  // Amulettes
  // ================================================================
  objet('amulet-misty-step', 'Amulet of Misty Step', 'Amulette', 'Amulet_of_Misty_Step',
    'Pas brumeux par repos court : sortie d’urgence ou accès à une cible. Plus redondant avec Night Walkers.',
    [src(1, 'camp-gobelin', 'Coffre des quartiers du Temple profané, près de Polma.')]),
  objet('pearl-of-power-amulet', 'Pearl of Power Amulet', 'Amulette', 'Pearl_of_Power_Amulet',
    'Récupère un emplacement jusqu’au niveau 3, une fois par repos long. Réserve d’autonomie à utiliser hors combat avant de remettre l’amulette de combat.',
    [src(1, 'grotte-ebonlake', 'Omeluum, après sa quête.', { verrou: 'quete', aConfirmer: true })]),
  objet('spineshudder-amulet', 'Spineshudder Amulet', 'Amulette', 'Spineshudder_Amulet',
    'Réverbération sur les attaques de sorts à distance qui infligent des dégâts : excellente avec Rayon ardent. Ne pas la copier sur un Moine uniquement parce que l’objet est disponible.',
    [src(2, 'tours-aubelune', 'Mimique dans l’ancienne chambre d’Isobel, à l’étage de Hautelune (pas la chambre de Ketheric).')],
    { offensif: ['sorts'] }),
  objet('spellcrux-amulet', 'Spellcrux Amulet', 'Amulette', 'Spellcrux_Amulet',
    'Restaure un emplacement de n’importe quel niveau, une fois par repos long. À utiliser hors combat avant de remettre l’amulette de combat.',
    [src(2, 'tours-aubelune', 'Gardienne de la prison de Hautelune.')]),
  objet('amulet-of-the-harpers', 'Amulet of the Harpers', 'Amulette', 'Amulet_of_the_Harpers',
    'Avantage aux sauvegardes de SAG et Bouclier via l’objet ; l’avantage ne se cumule pas avec une autre source. Très utile sans Aura de protection.',
    [src(2, 'auberge-derniere-lumiere', 'Vendue par Talli, Ultime Lueur.', { verrou: 'pnj' })]),
  objet('amulet-of-the-devout', 'Amulet of the Devout', 'Amulette', 'Amulet_of_the_Devout',
    '+2 DD des sorts (pas +2 aux jets d’attaque de Rayon ardent) et une utilisation de Canalisation divine si le porteur en a. Le vol du coffre peut infliger une malédiction.',
    [src(3, 'tabernacle-stormshore', 'Coffre d’offrandes principal du sous-sol du Tabernacle de la Côte des Tempêtes.', { verrou: 'zone-dangereuse' })],
    { offensif: ['sorts'] }),
  objet('amulet-greater-health', 'Amulet of Greater Health', 'Amulette', 'Amulet_of_Greater_Health',
    'Fixe la CON à 23 (ce n’est pas un bonus additionnel) et donne l’avantage aux sauvegardes de CON. Retirer l’amulette après avoir baissé la CON par respécialisation est dangereux.',
    [src(3, 'maison-de-lespoir', 'Archives de la Maison de l’Espoir.', { verrou: 'zone-dangereuse' })]),
  objet('fey-semblance-amulet', 'Fey Semblance Amulet', 'Amulette', 'Fey_Semblance_Amulet',
    'Avantage aux sauvegardes d’INT, SAG et CHA : alternative à Greater Health quand le risque est le contrôle mental plutôt que la concentration.',
    [src(3, null, 'Récompense de Mayrina après « Avenge the Hag Survivors ». Lieu non catalogué.', { verrou: 'quete', aConfirmer: true })]),
  objet('surgeons-subjugation-amulet', 'Surgeon’s Subjugation Amulet', 'Amulette', 'Surgeon%27s_Subjugation_Amulet',
    'Après un critique contre un humanoïde, paralysie possible deux tours, une fois par repos long. Pas un effet universel contre tous les boss.',
    [src(2, 'reithwin', 'Sur Malus Thorm, Maison de guérison.', { verrou: 'quete' })]),
  objet('periapt-wound-closure', 'Periapt of Wound Closure', 'Amulette', 'Periapt_of_Wound_Closure',
    'Maximise les dés des soins reçus et stabilise automatiquement à terre ; stabilisé ne signifie pas relevé.',
    [src(1, 'sentier-rosemorne', 'Vendu par Lady Esther.', { verrou: 'pnj' })]),
  objet('broodmothers-revenge', 'Broodmother’s Revenge', 'Amulette', 'Broodmother%27s_Revenge',
    'Soin reçu : +1d6 poison aux dégâts d’arme. Pas un bonus aux poings du Moine ni aux sorts du Sorcier ; vérifier résistances et immunités au poison.',
    [src(1, 'bosquet-emeraude', 'Kagha, selon la résolution de sa quête, sans provoquer de massacre.', { verrou: 'quete', aConfirmer: true })],
    { offensif: ['arme'] }),
  objet('amulet-of-restoration', 'Amulet of Restoration', 'Amulette', 'Amulet_of_Restoration',
    'Mot de guérison et Mot de guérison de groupe, chacun une fois par repos long, sans dépenser d’emplacement. Autre exemplaire en Acte III à la Maison des comptes.',
    [
      src(1, 'grotte-ebonlake', 'Derryth, colonie myconide.'),
      src(3, null, 'Autre exemplaire à la Maison des comptes. Lieu non catalogué.', { rattrapage: true, aConfirmer: true }),
    ]),
  objet('sentient-amulet-rare', 'Sentient Amulet (Rare)', 'Amulette', 'Sentient_Amulet_(Rare)',
    'Récupération de 2 points de ki par repos long (ne demande pas la sauvegarde de SAG associée à l’autre pouvoir). Réserve : n’occupe pas le slot de combat en même temps. L’amélioration en version très rare dépend d’une quête, elle n’est pas automatique.',
    [src(1, 'grymforge', 'Coffre près du lac de lave, secteur de la forge, Grymforge.', { verrou: 'zone-dangereuse' })]),
  objet('necklace-elemental-augmentation', 'Necklace of Elemental Augmentation', 'Amulette', 'Necklace_of_Elemental_Augmentation',
    'Renforce certains tours de magie élémentaires (Trait de feu, Rayon de givre), mais PAS Rayon ardent (sort à emplacement) ni Booming Blade.',
    [src(1, 'creche-yllek', 'Vitrine de la chambre de l’Inquisiteur ; autre exemplaire en Acte III dans une épave.')]),
  objet('spell-savant-amulet', 'Spell Savant Amulet', 'Amulette', 'Spell_Savant_Amulet',
    'Ajoute un emplacement ordinaire de niveau 2 : un Smite supplémentaire à 3d8 de base. Ni emplacement de pacte de niveau 4, ni recharge au repos court.',
    [src(3, null, 'Coffre de haute sécurité n° 1 de la Maison des comptes. Lieu non catalogué.', { aConfirmer: true })]),
  objet('moondrop-pendant', 'Moondrop Pendant', 'Amulette', 'Moondrop_Pendant',
    'À 50 % de PV ou moins, empêche les attaques d’opportunité contre le porteur : repli ou repositionnement. Ne pas rester volontairement à bas PV.',
    [src(1, null, 'Coffre doré sélunite du Nid de l’ours-hibou. Lieu non catalogué.', { aConfirmer: true })]),

  // ================================================================
  // Anneaux
  // ================================================================
  objet('ring-of-protection', 'Ring of Protection', 'Anneau', 'Ring_of_Protection',
    '+1 CA et sauvegardes. Acquisition conditionnelle : ne pas déclencher de catastrophe au Bosquet pour compléter un slot.',
    [src(1, 'bosquet-emeraude', 'Récompense de Mol pour la quête de l’idole.', { verrou: 'quete' })]),
  objet('crushers-ring', 'Crusher’s Ring', 'Anneau', 'Crusher%27s_Ring',
    '+3 m de déplacement : très pratique sur un Halfelin.',
    [src(1, 'camp-gobelin', 'Sur Crusher, camp gobelin.')]),
  objet('callous-glow-ring', 'Callous Glow Ring', 'Anneau', 'Callous_Glow_Ring',
    '+2 dégâts radiants contre les créatures illuminées ; profite aux impacts multiples. À retirer contre un ennemi qui punit le radiant (renvoi radieux). Ne se cumule pas naturellement avec la condition d’obscurité de Shadow-Cloaked.',
    [src(2, 'temple-shar', 'Coffre de la salle du trésor près de Balthazar, Gantelet de Shar.', { verrou: 'zone-dangereuse' })],
    { offensif: TOUS_DEGATS }),
  objet('coruscation-ring', 'Coruscation Ring', 'Anneau', 'Coruscation_Ring',
    'Les dégâts de sorts appliquent Orbe radieux sous les conditions d’illumination de l’objet : faire lancer Lumière sur le porteur et vérifier l’éclairage des cibles.',
    [src(2, 'auberge-derniere-lumiere', 'Coffre piégé dans la cave de l’Ultime Lueur.')],
    { offensif: ['sorts'] }),
  objet('ring-mental-inhibition', 'Ring of Mental Inhibition', 'Anneau', 'Ring_of_Mental_Inhibition',
    'Une sauvegarde ratée contre un sort ou une action du porteur applique Fatigue mentale. Rayon ardent seul ne le déclenche pas (jets d’attaque) ; Boule de feu ou un contrôle approprié oui. Remplace un anneau, ne s’ajoute pas au duo Callous Glow / Coruscation.',
    [src(2, 'maison-ombres-profondes', 'Coffre verrouillé de la maison à l’est du point de passage du Champ de bataille ravagé par les ombres (X 76 / Y 40).')]),
  objet('ring-spiteful-thunder', 'Ring of Spiteful Thunder', 'Anneau', 'Ring_of_Spiteful_Thunder',
    'Tonnerre infligé à une cible sous Réverbération : peut causer Hébétement (sauvegarde de CON, DD 13). Un allié peut préparer la Réverbération. Le wiki signale un déclenchement avec d’autres dégâts : ne pas en dépendre sans test.',
    [src(2, 'tours-aubelune', 'Roah Moonglow, Hautelune.', { verrou: 'pnj' })]),
  objet('ring-free-action', 'Ring of Free Action', 'Anneau', 'Ring_of_Free_Action',
    'Ignore le terrain difficile ; immunité à Paralysé et Entravé. Pas une immunité générale aux contrôles. Fait en partie doublon avec la Liberté de mouvement des Boots of Persistence.',
    [
      src(2, 'tours-aubelune', 'Vendu par Araj Oblodra, Hautelune.', { verrou: 'pnj' }),
      src(3, null, 'Rattrapage possible en Acte III selon le parcours d’Araj.', { rattrapage: true, aConfirmer: true }),
    ]),
  objet('risky-ring', 'Risky Ring', 'Anneau', 'Risky_Ring',
    'Avantage aux attaques mais désavantage à TOUTES les sauvegardes, dont la concentration. L’avantage ne se cumule pas avec Unseen Menace ou le Vœu. Option contextuelle, jamais équipement par défaut en Honneur.',
    [src(2, 'tours-aubelune', 'Vendu par Araj Oblodra, Hautelune.', { verrou: 'pnj' })],
    { offensif: TOUS_DEGATS }),
  objet('shadow-cloaked-ring', 'Shadow-Cloaked Ring', 'Anneau', 'Shadow-Cloaked_Ring',
    '+1d4 aux armes ET aux poings contre cibles obscurcies ou créatures d’ombre. Conditionnel.',
    [src(2, null, 'Alpha des molosses d’ombre, camp maudit au nord de la poterie en ruine : détruire les torches éternelles pour le faire apparaître. Lieu non catalogué.', { aConfirmer: true })],
    { offensif: ['arme', 'poings'] }),
  objet('caustic-band', 'Caustic Band', 'Anneau', 'Caustic_Band',
    '+2 dégâts d’acide aux attaques d’arme (pas aux poings ni aux sorts). Cher en Honneur : à acheter après les priorités de survie.',
    [src(1, 'grotte-ebonlake', 'Derryth Bonecloak, colonie myconide.')],
    { offensif: ['arme'] }),
  objet('strange-conduit-ring', 'Strange Conduit Ring', 'Anneau', 'Strange_Conduit_Ring',
    'Dégâts psychiques additionnels pendant la concentration : aucun bonus sans concentration active. Dégâts d’arme uniquement.',
    [src(1, 'creche-yllek', 'Coffre de la chambre de l’Inquisiteur, Crèche Y’llek.')],
    { offensif: ['arme'] }),
  objet('killers-sweetheart', 'Killer’s Sweetheart', 'Anneau', 'Killer%27s_Sweetheart',
    'Après une élimination, convertit une attaque en critique, une fois par repos long. Option de boss à configurer sur demande, à conserver pour le coup utile.',
    [src(2, 'temple-shar', 'Épreuve du dédoublement, Gantelet de Shar, au sol après la mort du double concerné.', { verrou: 'zone-dangereuse' })],
    { offensif: ['arme'] }),
  objet('ring-arcane-synergy', 'Ring of Arcane Synergy', 'Anneau', 'Ring_of_Arcane_Synergy',
    'Des dégâts de tour de magie (Booming Blade) accordent deux tours de Synergie arcanique : le modificateur de lancement s’ajoute aux dégâts des attaques d’arme, pas à chaque dé de Châtiment divin. Ne pas additionner deux applications du même état.',
    [src(1, 'creche-yllek', 'Sur Gish Far’aag, Crèche Y’llek, à récupérer avant de quitter définitivement la zone.')],
    { offensif: ['arme'] }),
  objet('ring-elemental-infusion', 'Ring of Elemental Infusion', 'Anneau', 'Ring_of_Elemental_Infusion',
    'En Honneur, ne fonctionne avec Booming Blade que si l’arme a elle-même des dégâts élémentaires. +1d4 sur la première attaque d’arme réussie concernée, pas sur toutes. Derrière Synergie arcanique en priorité.',
    [src(1, 'creche-yllek', 'Sur Gish Umr’a’ac, au sud de l’infirmerie de la Crèche.')],
    { offensif: ['arme'] }),
  objet('band-mystic-scoundrel', 'Band of the Mystic Scoundrel', 'Anneau', 'Band_of_the_Mystic_Scoundrel',
    'Après une attaque d’arme réussie, lance un sort d’Illusion ou d’Enchantement en action bonus. Pas d’emplacement ni d’action bonus gratuits ; ne s’attribue pas par défaut au Sorcier pur.',
    [src(3, 'cirque-derniers-jours', 'Sac à dos dans la jungle d’Akabi (X -1566 / Y -1522), distinct du coffre de Nyrulna.', { verrou: 'zone-dangereuse' })]),
  objet('ring-of-regeneration', 'Ring of Regeneration', 'Anneau', 'Ring_of_Regeneration',
    'Rend 1d4 PV au début du tour en combat. Ne relève pas un personnage à terre. Avec Broodmother’s Revenge, entretient le bonus de poison.',
    [src(3, 'sorcelleries-sundries', 'Sorcelleries Sundries, selon le parcours de Rolan / Lorroakan. Acheter avant de résoudre leur conflit.', { verrou: 'pnj', aConfirmer: true })]),
  objet('whispering-promise', 'The Whispering Promise', 'Anneau', 'The_Whispering_Promise',
    'Soigner applique Bénédiction deux tours sans concentration, même si la cible est à PV maximum. Ne se cumule pas avec la même Bénédiction du sort : pas deux fois +1d4.',
    [src(1, 'camp-gobelin', 'Volo, via son commerce au Bosquet ou au camp selon la progression. Acheter tôt et vérifier l’inventaire.', { verrou: 'pnj', aConfirmer: true })],
    { critique: true }),

  // ================================================================
  // Coiffes et casques du support
  // ================================================================
  objet('cap-of-curing', 'Cap of Curing', 'Casque', 'Cap_of_Curing',
    'Soin associé à l’Inspiration bardique. N’en déduire aucun soin automatique ajouté à Mots cinglants.',
    [src(1, 'bosquet-emeraude', 'Coffre près d’Alfira, au Bosquet.')]),

  // ================================================================
  // Consommables et ressource unique
  // ================================================================
  objet('auntie-ethels-hair', 'Auntie Ethel’s Hair', 'Consommable', 'Auntie_Ethel%27s_Hair',
    'Bonus permanent de +1 CHA : ressource UNIQUE de la run, réservée au Sorcier. Les copies d’équipement ne le dupliquent pas.',
    [src(1, 'antre-ethel', 'Réduire Ethel sous 20 % de PV dans son Antre puis négocier sa vie.', { verrou: 'ressource-unique' })],
    { copiable: false }),
  objet('elixir-hill-giant-strength', 'Elixir of Hill Giant Strength', 'Consommable', 'Elixir_of_Hill_Giant_Strength',
    'Fixe la FOR à 21 jusqu’au repos long. Un seul élixir actif : incompatible avec Soif de sang ou Vigilance simultanés. À acheter en stock chez Ethel avant la résolution de sa quête.',
    [src(1, 'antre-ethel', 'Stock d’Ethel, à acheter AVANT la résolution de sa quête : pas de vente après l’avoir rendue hostile ou tuée.', { verrou: 'pnj' })],
    { copiable: false }),
  objet('elixir-cloud-giant-strength', 'Elixir of Cloud Giant Strength', 'Consommable', 'Elixir_of_Cloud_Giant_Strength',
    'Fixe la FOR à 27 jusqu’au repos long (ne s’additionne pas à l’élixir de géant des collines).',
    [src(3, null, 'Peut apparaître dans les stocks adaptés à partir du niveau 9, sans disponibilité garantie à chaque rafraîchissement.', { aConfirmer: true })],
    { copiable: false }),
  objet('gauntlets-hill-giant-strength', 'Gauntlets of Hill Giant Strength', 'Gants', 'Gauntlets_of_Hill_Giant_Strength',
    'Fixe la FOR à 23 : supprime le besoin d’élixir et libère son slot, mais occupe les mains à la place de Soul Catching (perte du +1d10 force par frappe et du soin associé).',
    [src(3, 'maison-de-lespoir', 'Archives de la Maison de l’Espoir.', { verrou: 'zone-dangereuse' })]),
]

// Fusion des métadonnées (objets-meta.js) : nom FR officiel vérifié, icône
// vérifiée et usages. `nomFr` / `icone` valent null tant que rien n'est vérifié.
export const OBJETS = OBJETS_BRUTS.map((entree) => ({
  ...entree,
  nomFr: NOMS_FR[entree.id]?.nom ?? null,
  sourceNomFr: NOMS_FR[entree.id]?.source ?? null,
  icone: ICONES[entree.id] ?? null,
  usages: USAGES_OBJETS[entree.id] ?? [],
}))

export function objetDe(id) {
  return OBJETS.find((entree) => entree.id === id) ?? null
}
