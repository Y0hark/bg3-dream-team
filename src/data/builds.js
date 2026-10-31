// ------------------------------------------------------------------
// Composition ACTIVE de la run Honneur (V2) : Sorcier feu, Paladin /
// Hexblade, Moine Main ouverte et Sidekick Barde / Clerc.
//
// Source de vérité : les quatre fiches Notion « Jeux — Builds » (REFERENCES
// ci-dessous), recopiées à la main — pas de scraping, aucune clé Notion dans
// le client. Les fiches sont documentées, PAS testées en jeu : rien ici ne
// promet un dégât ou un taux de réussite, et le hotfix exact reste à confirmer.
//
// Contrat d'identifiants (partagé avec les tickets 2/4 loadouts et 3/4 tracker)
// ----------------------------------------------------------------
// - `id` : identifiant sémantique de RÔLE, stable. Jamais un nom de joueur et
//   jamais un id de l'ancienne composition (cf. builds-anciens.js).
// - `personnage` : libellé d'affichage du rôle, modifiable librement.
// - `joueur` : null tant que l'affectation Sam / Baptiste / Lilian aux rôles
//   n'est pas confirmée. On ne migre pas un joueur vers un rôle « par
//   position ».
//
// Ce que chaque build porte, en plus de l'ancien schéma :
// - `ordre` : classe prise à chaque niveau de personnage. Totaux, niveaux de
//   don et plafonds de sorts s'en déduisent (src/lib/niveaux.js) ;
// - `caracteristiques` : création, bonus de dons, bonus permanents et valeurs
//   FIXÉES par un objet / élixir — séparés pour ne jamais les additionner ;
// - `export` : l'export de planner de l'utilisateur, à l'identique, ou null
//   quand la fiche n'en a pas (rien n'est inventé) ;
// - `divergences` : ce qui diffère entre export et recommandation, visible ;
// - `variantes` : jamais cumulées avec le principal ;
// - `aConfirmer` : ce que les fiches elles-mêmes laissent ouvert.
// ------------------------------------------------------------------
import { EXPORT_PALADIN_HEXBLADE, EXPORT_SORCIER_FEU } from './exports-planner.js'
import { BUILDS_ANCIENS } from './builds-anciens.js'

// Termes BG3 laissés en anglais faute de traduction FR vérifiée : le `lexique`
// de chaque build renvoie vers bg3.wiki (icône + libellé exact en jeu).
const wiki = (page) => 'https://bg3.wiki/wiki/' + page

/** Fiches Notion d'où viennent les données — une par rôle. */
export const REFERENCES = {
  'sorcier-feu': 'https://app.notion.com/p/9ad3553872684aa6b51b4c62d7a5df8c',
  'paladin-hexblade': 'https://app.notion.com/p/b1b172ddc0284f9f9c94b7b52a6e19b1',
  'moine-main-ouverte': 'https://app.notion.com/p/c2710141644040ecb3d89f98c408fa08',
  'sidekick-savoir-vie': 'https://app.notion.com/p/a7fa8c15e93845b88c13d0c01601e705',
}

/** Réglage de run : les copies d'équipement (Ombrecœur / Invocation de réplique). */
export const COPIES_AUTORISEES = true

const repeter = (classe, fois) => Array(fois).fill(classe)

export const BUILDS = [
  // ================================================================
  // Sorcier feu — Sorcier draconique (feu) 12, Halfelin pied-léger
  // ================================================================
  {
    id: 'sorcier-feu',
    personnage: 'Sorcier feu',
    joueur: null,
    nom: 'Sorcier draconique feu — Rayon ardent',
    split: 'Sorcier draconique 12',
    classe: 'Sorcier',
    sousClasse: 'Lignée draconique (feu)',
    role: 'DPS distance / contrôle',
    icone: '🔥',
    couleurAccent: 'amber',
    resume:
      'Rayon ardent charge le Hat of Fire Acuity, puis dégâts ou contrôle accéléré. Sorcier pur : il garde les sorts de niveau 6 et un troisième don. Les variantes 11/1 Fiélon et 9/3 Voleur sont des choix distincts, pas des améliorations gratuites.',
    reference: {
      notion: REFERENCES['sorcier-feu'],
      guide: 'https://gamestegy.com/post/bg3/883/draconic-fire-sorcerer-build',
    },
    ordre: repeter('Sorcier', 12),
    repartitionFinale: { Sorcier: 12 },
    stats: { FOR: 8, DEX: 16, CON: 14, INT: 8, SAG: 12, CHA: 16 },
    notesStats:
      'Route sans bonus permanent réservé : CHA 16 à la création, +2 aux niveaux 4 et 12 pour 20, initiative portée par Alerte au niveau 8. La route avec le Cheveu d’Ethel (variante de caractéristiques ci-dessous) part de CHA 17 / SAG 10 ; le Cheveu est une ressource unique, jamais un acquis. Le Halfelin pur n’a ni armure intermédiaire ni bouclier : ne pas copier un équipement de demi-elfe.',
    caracteristiques: {
      creation: { FOR: 8, DEX: 16, CON: 14, INT: 8, SAG: 12, CHA: 16 },
      bonusDons: [
        { niveau: 4, stat: 'CHA', valeur: 2, source: 'Don niveau 4' },
        { niveau: 12, stat: 'CHA', valeur: 2, source: 'Don niveau 12' },
      ],
      bonusPermanents: [
        {
          id: 'cheveu-ethel',
          source: 'Cheveu d’Ethel (Auntie Ethel’s Hair)',
          stat: 'CHA',
          valeur: 1,
          copiable: false,
          reserveA: 'sorcier-feu',
          note: 'Ressource unique de la run, réservée au Sorcier. Les copies d’équipement ne le dupliquent pas.',
        },
      ],
      fixees: [
        { id: 'gants-dexterite', source: 'Gloves of Dexterity', type: 'equipement', stat: 'DEX', valeur: 18, condition: 'Rétablir une DEX naturelle correcte avant de les remplacer par Spellmight.' },
        { id: 'greater-health', source: 'Amulet of Greater Health', type: 'equipement', stat: 'CON', valeur: 23, condition: 'Ne baisser la CON par respécialisation qu’une fois l’amulette (ou sa copie) obtenue et validée.' },
      ],
      variantes: [
        {
          id: 'route-cheveu',
          nom: 'Min-max avec le Cheveu d’Ethel',
          creation: { FOR: 8, DEX: 16, CON: 14, INT: 8, SAG: 10, CHA: 17 },
          bonusDons: [{ niveau: 4, stat: 'CHA', valeur: 2, source: 'Don niveau 4' }],
          bonusPermanents: ['cheveu-ethel'],
          dons: [
            { niveau: 4, nom: '+2 CHA (18 → 20 avec le Cheveu)' },
            { niveau: 8, nom: 'Alerte' },
            { niveau: 12, nom: 'Combattant à deux armes (Dual Wielder), pour bâton + Rhapsody' },
          ],
          condition: 'Seulement si le Cheveu est réellement attribué à ce rôle.',
        },
      ],
    },
    feats: [
      { niveau: 4, nom: 'Amélioration de caractéristique — CHA +2 (16 → 18)', note: 'Sorcier 4. Route sans Cheveu. Avec le Cheveu, la même ASI mène de 18 à 20.' },
      { niveau: 8, nom: 'Alerte', note: 'Sorcier 8. +5 d’initiative : agir tôt est la première priorité de pilotage. Pas imposée si l’initiative vient d’un arc et de l’Élixir de vigilance.' },
      { niveau: 12, nom: 'Amélioration de caractéristique — CHA +2 (18 → 20)', note: 'Sorcier 12. Variante Cheveu : Combattant à deux armes pour bâton + Rhapsody. Ne pas confondre le don Lucky avec la Chance halfeline.' },
    ],
    leveling: [
      { niveau: 1, classe: 'Sorcier 1', gains: 'Lignée draconique rouge/feu : Résilience draconique (CA 13 + DEX sans armure) et Mains brûlantes. Bouclier + Projectile magique ; tours de magie Trait de feu, Rayon de givre, Poigne électrique, Illusion mineure.' },
      { niveau: 2, classe: 'Sorcier 2', gains: 'Orbe chromatique. Métamagies : Sort jumelé + Sort étendu.' },
      { niveau: 3, classe: 'Sorcier 3', gains: 'Rayon ardent : le cœur offensif commence. Métamagie : Sort accéléré.' },
      { niveau: 4, classe: 'Sorcier 4', gains: 'Don : CHA +2. Pas brumeux ; tour de magie Lumière.' },
      { niveau: 5, classe: 'Sorcier 5', gains: 'Boule de feu ; Hâte remplace Orbe chromatique (optionnelle, risque de léthargie si la concentration casse).' },
      { niveau: 6, classe: 'Sorcier 6', gains: 'Affinité élémentaire feu : bonus de CHA aux dégâts de feu. Contresort ; Immobilisation de personne remplace Projectile magique.' },
      { niveau: 7, classe: 'Sorcier 7', gains: 'Confusion : contrôle de groupe après la montée de l’Acuité (concentration).' },
      { niveau: 8, classe: 'Sorcier 8', gains: 'Don : Alerte. Porte dimensionnelle.' },
      { niveau: 9, classe: 'Sorcier 9', gains: 'Immobilisation de monstre — vérifier immunités et résistances légendaires.' },
      { niveau: 10, classe: 'Sorcier 10', gains: 'Mur de feu. Métamagie : Sort intensifié. Un tour de magie utilitaire au choix.' },
      { niveau: 11, classe: 'Sorcier 11', gains: 'Chaîne d’éclairs : option de niveau 6 contre les immunités feu.' },
      { niveau: 12, classe: 'Sorcier 12', gains: 'Don : CHA +2. Globe d’invulnérabilité (ou dès 11, Chaîne d’éclairs à 12).' },
    ],
    sorts: {
      note: 'Sorcier 12 : emplacements jusqu’au niveau 6 ET sorts de niveau 6 appris (Chaîne d’éclairs, Globe d’invulnérabilité). Sorts connus, pas préparés : les remplacements sont notés dans le leveling.',
    },
    boucle: [
      'Arriver bien placé, avec initiative et ligne de vue ; assez loin du contact pour ne pas tirer à distance avec désavantage.',
      'Rayon ardent en action sur une cible accessible pour monter l’Acuité ; l’emplacement se choisit selon les PV et le besoin de charges, pas toujours le plus haut.',
      'Action bonus : Sort accéléré + contrôle si cela évite plusieurs tours ennemis, sinon un deuxième Rayon ardent pour finir une menace.',
      'Sous Hâte déjà active, l’action supplémentaire sert aussi à lancer un sort. Bouclier et Contresort restent des ressources de survie, pas un reliquat.',
    ],
    synergies: [
      'Le Hat of Fire Acuity : chaque rayon touché peut le déclencher, et l’Acuité relève les jets d’attaque de sorts et leur DD (jusqu’à dix charges ; prendre des dégâts en retire deux).',
      'Le support peut maintenir Hâte et libérer la concentration du Sorcier ; il faut s’accorder sur qui tient quelle concentration.',
      'Le Moine et le Paladin profitent d’une cible neutralisée ; Booming Blade du Paladin est un candidat pour un Ring of Spiteful Thunder, le porteur n’ayant pas besoin de toutes les pièces de Réverbération.',
    ],
    vigilance: [
      'Le Cheveu d’Ethel est réservé au Sorcier ; aucune copie d’équipement ne le duplique ni ne duplique un autre bonus permanent.',
      'Mouillé n’est pas un buff au feu : ne pas arroser les cibles du Sorcier feu par réflexe hérité de l’ancienne équipe.',
      'Hâte s’arrête sur une Léthargie : la maintenir sur soi puis lancer Confusion, Immobilisation ou Globe la casse. Faire porter Hâte par le support transfère la responsabilité.',
      'Potent Robe améliore les tours de magie, pas Rayon ardent ; Risky Ring fragilise la concentration alors que l’Acuité fiabilise déjà les attaques.',
      'Retirer Callous Glow contre un ennemi qui punit les dégâts radiants ; prévoir une vraie option foudre / froid / force contre les immunités feu.',
      'Pas de promesse « 100 % contrôle » sur le DD affiché : immunités et actions légendaires comptent. Friends n’est pas un bonus gratuit en Honneur.',
    ],
    variantes: [
      {
        id: 'fielon-11-1',
        nom: 'Sorcier draconique 11 / Occultiste Fiélon 1',
        type: 'variante',
        ordre: [...repeter('Sorcier', 11), 'Occultiste'],
        dons: 2,
        gains: ['Commandement basé sur le CHA, sans concentration, lançable à un niveau supérieur avec les emplacements du Sorcier', 'Maîtrise des armures légères', 'Sorts de Sorcier de niveau 6 conservés'],
        pertes: ['Le don de Sorcier 12', 'Un point de sorcellerie de base', 'Le niveau d’Occultiste n’ajoute pas de niveau de lanceur aux emplacements du Sorcier'],
        verdict: 'Variante de très haut plafond dégâts + contrôle, à préférer si le Sorcier doit verrouiller le combat tout en maintenant Hâte. Ce n’est pas un Sorlock à deux niveaux d’Occultiste.',
        cumulAvecPrincipal: false,
      },
      {
        id: 'voleur-9-3',
        nom: 'Sorcier 9 / Roublard Voleur 3',
        type: 'variante',
        ordre: [...repeter('Sorcier', 9), ...repeter('Roublard', 3)],
        dons: 2,
        gains: ['Deux actions bonus par tour (Mains lestes, au Voleur 3)', 'Possibilité de deux Sorts accélérés'],
        pertes: ['Sorts de niveau 6', 'Le troisième don', 'Trois points de sorcellerie de base', 'Deux Sorts accélérés coûtent 6 points, pas 3'],
        verdict: 'Vraie variante de nova, moins complète pour la campagne. À faire par respécialisation tardive, sans retarder les paliers 5 et 6 du Sorcier.',
        cumulAvecPrincipal: false,
      },
      {
        id: 'voleur-8-4',
        nom: 'Sorcier 8 / Roublard Voleur 4',
        type: 'deconseillee',
        ordre: [...repeter('Sorcier', 8), ...repeter('Roublard', 4)],
        dons: 3,
        gains: ['Deux actions bonus', 'Trois dons'],
        pertes: ['Sorts de Sorcier limités au niveau 4'],
        verdict: 'Déconseillée pour ce projet : le troisième don ne remplace pas les outils de haut niveau perdus.',
        cumulAvecPrincipal: false,
      },
    ],
    export: {
      provenance: 'Propriété « SHA » de la fiche Notion, conservée à l’identique',
      planner: EXPORT_SORCIER_FEU,
      race: 'Halfelin pied-léger',
      historique: 'Sage',
      ordre: repeter('Sorcier', 12),
      caracteristiques: {
        creation: { FOR: 8, DEX: 14, CON: 16, INT: 10, SAG: 8, CHA: 17 },
        bonusDons: [{ niveau: 12, stat: 'CHA', valeur: 2, source: 'Don niveau 12' }],
      },
      dons: [
        { niveau: 4, nom: 'Adepte élémentaire (Elemental Adept)' },
        { niveau: 8, nom: 'Alerte' },
        { niveau: 12, nom: 'Amélioration de caractéristique — CHA +2 (17 → 19)' },
      ],
      metamagie: ['Sort jumelé', 'Sort distant', 'Sort accéléré', 'Sort étendu'],
      equipement: [
        { acte: 1, tete: 'Circlet of Blasting', torse: 'The Protecty Sparkswall', gants: 'Bracers of Defence', bottes: 'Disintegrating Night Walkers', arme: 'The Spellsparkler', amulette: 'Pearl of Power Amulet', anneaux: ['Crusher’s Ring', 'Ring of Protection'], distance: 'Bow of Awareness' },
        { acte: 2, tete: 'Hat of Fire Acuity', cape: 'Cloak of Protection', torse: 'The Protecty Sparkswall', gants: 'Bracers of Defence', bottes: 'Boots of Stormy Clamour', arme: 'The Spellsparkler', amulette: 'Spineshudder Amulet', anneaux: ['Callous Glow Ring', 'Coruscation Ring'], distance: 'Bow of Awareness' },
        { acte: 3, tete: 'Hat of Fire Acuity', cape: 'Cloak of the Weave', torse: 'Robe of the Weave', gants: 'Spellmight Gloves', bottes: 'Boots of Stormy Clamour', arme: 'Markoheshkir', amulette: 'Spineshudder Amulet', anneaux: ['Callous Glow Ring', 'Coruscation Ring'], distance: 'Hellrider Longbow' },
      ],
    },
    divergences: [
      { id: 'sorcier-don-4', sujet: 'Don du niveau 4', recommandation: 'CHA +2', export: 'Adepte élémentaire (Elemental Adept)' },
      { id: 'sorcier-don-12', sujet: 'Don du niveau 12', recommandation: 'CHA +2 (CHA 20) ; Dual Wielder sur la route Cheveu', export: 'CHA +2 sur CHA 17, soit 19 — pas 20' },
      { id: 'sorcier-stats', sujet: 'Caractéristiques de création', recommandation: '8 / 16 / 14 / 8 / 12 / 16 (ou 8 / 16 / 14 / 8 / 10 / 17 avec le Cheveu)', export: '8 / 14 / 16 / 10 / 8 / 17' },
      { id: 'sorcier-metamagie', sujet: 'Métamagie', recommandation: 'Jumelé + Étendu (2), Accéléré (3), Intensifié (10)', export: 'Jumelé + Distant (2), Accéléré (3), Étendu (10)' },
      { id: 'sorcier-sorts', sujet: 'Sorts appris', recommandation: 'Hâte remplace Orbe chromatique ; Contresort à 6 ; Immobilisation de personne ; Confusion ; Porte dimensionnelle ; Immobilisation de monstre ; Mur de feu ; Chaîne d’éclairs ; Globe', export: 'Hâte remplace Projectile magique ; Tempête de grésil, Mur de feu, Tempête de glace, Cône de froid, Nuage mortel, Chaîne d’éclairs, Globe ; pas de Contresort ni de Confusion' },
      { id: 'sorcier-equipement', sujet: 'Équipement d’acte 1', recommandation: 'Spellsparkler ou Melf, Lifebringer / Shadespell, Amulet of Misty Step', export: 'Spellsparkler, Circlet of Blasting, Pearl of Power Amulet — détail dans le ticket loadouts' },
    ],
    aConfirmer: [
      { id: 'sorcier-hotfix', texte: 'Hotfix exact installé en jeu.' },
      { id: 'sorcier-cheveu', texte: 'Attribution du Cheveu d’Ethel au Sorcier (conditionne la route de caractéristiques).' },
      { id: 'sorcier-copies', texte: 'Fonctionnement et persistance des copies d’équipement sur le hotfix installé.' },
    ],
    lexique: [
      { nom: 'Draconic Bloodline', wiki: wiki('Draconic_Bloodline') },
      { nom: 'Scorching Ray', wiki: wiki('Scorching_Ray') },
      { nom: 'Hat of Fire Acuity', wiki: wiki('Hat_of_Fire_Acuity') },
      { nom: 'Quickened Spell', wiki: wiki('Metamagic:_Quickened_Spell') },
      { nom: 'Invoke Duplicity', wiki: wiki('Invoke_Duplicity') },
    ],
  },

  // ================================================================
  // Paladin — Couronne 4 / Occultiste Hexblade 8 (export utilisateur)
  // ================================================================
  {
    id: 'paladin-hexblade',
    personnage: 'Paladin',
    joueur: null,
    nom: 'Paladin de la Couronne / Hexblade — Smites au repos court',
    split: 'Paladin de la Couronne 4 / Occultiste Hexblade 8',
    classe: 'Paladin',
    sousClasse: 'Serment de la Couronne / Hexblade',
    role: 'DPS mêlée / Smites',
    icone: '⚔️',
    couleurAccent: 'sky',
    resume:
      'Deux attaques par action (Pacte de la lame, pas de cumul avec l’Attaque supplémentaire du Paladin en Honneur), deux emplacements de pacte de niveau 4 récupérés au repos court et trois dons. Version de référence : l’export de l’utilisateur (Couronne, Demi-orque). Aucune Aura de protection : c’est le prix des Smites de haut niveau.',
    reference: { notion: REFERENCES['paladin-hexblade'], guide: null },
    ordre: [...repeter('Paladin', 4), ...repeter('Occultiste', 8)],
    repartitionFinale: { Paladin: 4, Occultiste: 8 },
    stats: { FOR: 16, DEX: 12, CON: 14, INT: 8, SAG: 8, CHA: 16 },
    notesStats:
      'Export : FOR 16 / DEX 12 / CON 14 / INT 8 / SAG 8 / CHA 16 à la création, sans respécialisation vers les caractéristiques CHA de la fiche. Avec +2 CHA à Occultiste 4 et sans autre bonus, le CHA final est 18, pas 20 : Alerte a remplacé la seconde augmentation de CHA, et le Cheveu reste au Sorcier. Une fois l’arme liée au CHA, FOR 16 n’est plus nécessaire à ses attaques — mais ne pas baisser la FOR avant d’avoir lié l’arme.',
    caracteristiques: {
      creation: { FOR: 16, DEX: 12, CON: 14, INT: 8, SAG: 8, CHA: 16 },
      bonusDons: [{ niveau: 8, stat: 'CHA', valeur: 2, source: 'Don Occultiste 4 (niveau 8)' }],
      bonusPermanents: [],
      fixees: [
        { id: 'greater-health', source: 'Amulet of Greater Health', type: 'equipement', stat: 'CON', valeur: 23, condition: 'Retirer l’amulette après avoir baissé la CON par respécialisation est dangereux.' },
      ],
      variantes: [
        {
          id: 'route-respec-cha-20',
          nom: 'Respécialisation de la fiche : CHA 20 sans le Cheveu',
          creation: { FOR: 8, DEX: 14, CON: 16, INT: 8, SAG: 12, CHA: 16 },
          bonusDons: [
            { niveau: 8, stat: 'CHA', valeur: 2, source: 'Don Occultiste 4' },
            { niveau: 12, stat: 'CHA', valeur: 2, source: 'Don Occultiste 8' },
          ],
          bonusPermanents: [],
          condition: 'Proposition de la fiche, distincte de l’export : demande une respécialisation et que l’arme soit liée au CHA.',
        },
      ],
    },
    feats: [
      { niveau: 4, nom: 'Great Weapon Master (Maître d’armes à deux mains)', note: 'Paladin 4. Export. +10 aux dégâts contre -5 au toucher, arme de mêlée tenue à deux mains ; le bonus ne s’applique pas avec un bouclier. À désactiver quand la précision devient insuffisante.' },
      { niveau: 8, nom: 'Amélioration de caractéristique — CHA +2 (16 → 18)', note: 'Occultiste 4. Export. Seul bonus de CHA de l’export : CHA 18 à la fin, pas automatiquement 20.' },
      { niveau: 12, nom: 'Alerte', note: 'Occultiste 8. Export. +5 d’initiative ; remplace volontairement la seconde augmentation de CHA du plan précédent.' },
    ],
    leveling: [
      { niveau: 1, classe: 'Paladin 1', gains: 'Serment de la Couronne : Righteous Clarity. Imposition des mains, Perception divine, armures lourdes et boucliers.' },
      { niveau: 2, classe: 'Paladin 2', gains: 'Châtiment divin (Smite). Style de combat : Great Weapon Fighting (export). Sorts de Paladin de niveau 1.' },
      { niveau: 3, classe: 'Paladin 3', gains: 'Santé divine ; Champion Challenge et Turn the Tide (Canalisation de serment, une réserve partagée).' },
      { niveau: 4, classe: 'Paladin 4', gains: 'Don : Great Weapon Master. Dernier niveau de Paladin : pas d’Aura de protection, sorts de Paladin limités au niveau 1.' },
      { niveau: 5, classe: 'Occultiste 1', gains: 'Hexblade : Malédiction de l’Hexblade, Bind Hexed Weapon (arme liée au CHA), maîtrises. Tours de magie Booming Blade et Décharge occulte ; Armure d’Agathys, Maléfice. Premier emplacement de pacte.' },
      { niveau: 6, classe: 'Occultiste 2', gains: 'Invocations (export) : Beguiling Influence et Devil’s Sight. Bouclier.' },
      { niveau: 7, classe: 'Occultiste 3', gains: 'Pacte de la lame. Pas brumeux.' },
      { niveau: 8, classe: 'Occultiste 4', gains: 'Don : CHA +2. Tour de magie Friends (prudence en Honneur) ; Ténèbres.' },
      { niveau: 9, classe: 'Occultiste 5', gains: 'Pacte approfondi : seconde attaque avec l’arme liée — c’est ici que la deuxième attaque arrive dans l’ordre de l’export. Invocation Mire the Mind ; Faim de Hadar.' },
      { niveau: 10, classe: 'Occultiste 6', gains: 'Spectre maudit : invocation quand une cible sous Malédiction meurt. Lever la malédiction (Remove Curse).' },
      { niveau: 11, classe: 'Occultiste 7', gains: 'Deux emplacements de pacte de niveau 4. Invocation Dreadful Word ; Contresort.' },
      { niveau: 12, classe: 'Occultiste 8', gains: 'Don : Alerte. Porte dimensionnelle.' },
    ],
    routeRecommandee: {
      statut: 'a-confirmer',
      texte:
        'La fiche recommande de conserver Paladin jusqu’à 5/6 puis de respécialiser au niveau 7 en Paladin 2 / Occultiste 5, pour atteindre le même 4/8 à la fin sans retarder l’Attaque supplémentaire et les Smites. Cette route est DISTINCTE de l’ordre de l’export (Paladin 1-4 puis Occultiste 1-8) ; la répartition finale 4/8 est la même.',
      lignes: [
        { niveau: 1, repartition: { Paladin: 1 } },
        { niveau: 2, repartition: { Paladin: 2 } },
        { niveau: 3, repartition: { Paladin: 3 } },
        { niveau: 4, repartition: { Paladin: 4 } },
        { niveau: 5, repartition: { Paladin: 5 } },
        { niveau: 6, repartition: { Paladin: 6 } },
        { niveau: 7, repartition: { Paladin: 2, Occultiste: 5 }, respec: true },
        { niveau: 8, repartition: { Paladin: 3, Occultiste: 5 } },
        { niveau: 9, repartition: { Paladin: 4, Occultiste: 5 } },
        { niveau: 10, repartition: { Paladin: 4, Occultiste: 6 } },
        { niveau: 11, repartition: { Paladin: 4, Occultiste: 7 } },
        { niveau: 12, repartition: { Paladin: 4, Occultiste: 8 } },
      ],
      perdues: ['Aura de protection (Paladin 6) perdue à la bascule du niveau 7 : retrait volontaire'],
    },
    sorts: {
      note: 'Les emplacements de pacte suivent le niveau d’Occultiste, pas la somme des classes : Occultiste 7 débloque le niveau 4, Occultiste 8 conserve deux emplacements. Paladin 4 ne prépare que des sorts de niveau 1 (trois emplacements ordinaires de niveau 1, repos long). Pas de sort de niveau 5 : Occultiste 8 n’y a pas accès.',
    },
    boucle: [
      'Lier l’arme et confirmer que le jet d’attaque utilise le CHA ; choisir deux mains ou bouclier ; contrôler les passifs réellement actifs.',
      'Deux attaques avec l’action normale ; Smite quand il élimine une menace, profite d’un critique ou évite un tour dangereux. Configurer Châtiment divin sur « Demander ».',
      'Une action bonus ne se budgète qu’une fois : Malédiction, Righteous Clarity / Champion Challenge, mobilité, potion et attaque bonus de Great Weapon Master se la disputent.',
      'Chant de repos du support, repos courts : « smiter fort, se reposer court, recommencer ». Les deux emplacements de pacte servent aussi aux sorts : pas de gros Smite si tout a été lancé.',
    ],
    synergies: [
      'Chant de repos du Barde : une récupération courte en plus, qui recharge à la fois les emplacements de pacte du Paladin et le ki du Moine.',
      'Righteous Clarity ajoute la maîtrise de la cible aux jets d’attaque d’un allié (le Sorcier, par exemple) : un bonus numérique qui complète un avantage déjà disponible.',
      'Booming Blade fonctionne avec l’Attaque supplémentaire en BG3 : une utilisation par action, puis une attaque d’arme normale.',
    ],
    vigilance: [
      'Honneur : l’Attaque supplémentaire du Paladin et celle du Pacte de la lame ne se cumulent pas. Pas de promesse de trois attaques par action.',
      'Aucune Aura de protection : le Paladin 4 ne couvre pas les sauvegardes de l’équipe. Éviter Risky Ring par défaut, soigner les sauvegardes de SAG.',
      'Ordre de l’export (Paladin 1-4 puis Occultiste 1-8) : s’il représente la progression réellement jouée, la seconde attaque n’arrive qu’au niveau 9. À confirmer avant de présenter cette route comme validée.',
      'Smite inflige du radiant : certains ennemis punissent ce type de dégâts (renvoi radieux) — attaquer physiquement ou contrôler plutôt que Smite automatique.',
      'Bouclier, Contresort et attaque d’opportunité se disputent la même réaction ; le Smite déclenché sur un coup se configure séparément.',
      'Hâte : l’action supplémentaire ne reproduit pas une série complète d’Attaque supplémentaire. Ne pas annoncer quatre attaques ni casser la concentration du support.',
    ],
    variantes: [
      {
        id: 'paladin-6-6',
        nom: 'Paladin 6 / Occultiste Hexblade 6 — défensif',
        type: 'variante',
        ordre: [...repeter('Paladin', 6), ...repeter('Occultiste', 6)],
        ordreAConfirmer: true,
        dons: 2,
        gains: ['Aura de protection : le modificateur de CHA s’ajoute aux sauvegardes du porteur et des alliés à 3 m', 'Davantage d’emplacements ordinaires (niveau 2)'],
        pertes: ['Emplacements de pacte de niveau 4 (deux de niveau 3 seulement)', 'Le troisième don'],
        verdict: 'Vraie alternative, pas une version ratée : à retenir si les morts viennent des contrôles et des sauvegardes ratées. L’Aura ne couvre pas automatiquement les quatre joueurs.',
        cumulAvecPrincipal: false,
      },
    ],
    comparaisonRepartitions: [
      { id: 'p4-o8', ordre: [...repeter('Paladin', 4), ...repeter('Occultiste', 8)], pacte: 4, dons: 3, verdict: 'Objectif retenu' },
      { id: 'p5-o7', ordre: [...repeter('Paladin', 5), ...repeter('Occultiste', 7)], pacte: 4, dons: 2, verdict: 'Attaque supplémentaire redondante en Honneur ; perd le troisième don' },
      { id: 'p6-o6', ordre: [...repeter('Paladin', 6), ...repeter('Occultiste', 6)], pacte: 3, dons: 2, verdict: 'Aura de protection ; pas de pacte niveau 4' },
      { id: 'p7-o5', ordre: [...repeter('Paladin', 7), ...repeter('Occultiste', 5)], pacte: 3, dons: 2, verdict: 'Ne répond pas à l’objectif de pacte niveau 4' },
      { id: 'p2-o10', ordre: [...repeter('Paladin', 2), ...repeter('Occultiste', 10)], pacte: 5, dons: 2, verdict: 'Les Smites ne gagnent plus de dés au-delà d’un emplacement niveau 4' },
    ],
    ancienneReference: {
      serment: 'Vengeance',
      race: 'Duergar',
      styleDeCombat: 'Défense',
      historique: 'Artisan de guilde',
      note: 'Proposition précédente de la fiche. Remplacée, pour la version exportée, par le choix de l’utilisateur Couronne / Demi-orque ; à ne pas confondre avec l’export.',
    },
    export: {
      provenance: 'Propriété « SHA » de la fiche Notion (export BROKEN BLUNK / « PAS LA DINDE »), conservée à l’identique',
      planner: EXPORT_PALADIN_HEXBLADE,
      race: 'Demi-orque',
      historique: 'Soldat',
      serment: 'Couronne',
      styleDeCombat: 'Great Weapon Fighting',
      ordre: [...repeter('Paladin', 4), ...repeter('Occultiste', 8)],
      caracteristiques: {
        creation: { FOR: 16, DEX: 12, CON: 14, INT: 8, SAG: 8, CHA: 16 },
        bonusDons: [{ niveau: 8, stat: 'CHA', valeur: 2, source: 'Don Occultiste 4' }],
      },
      dons: [
        { niveau: 4, nom: 'Great Weapon Master' },
        { niveau: 8, nom: 'Amélioration de caractéristique — CHA +2 (16 → 18)' },
        { niveau: 12, nom: 'Alerte' },
      ],
      invocations: ['Beguiling Influence', 'Devil’s Sight', 'Mire the Mind', 'Dreadful Word'],
      equipement: [
        { acte: 1, tete: 'Haste Helm', torse: 'Adamantine Splint Armour', gants: 'Gloves of the Growling Underdog', bottes: 'Disintegrating Night Walkers', arme: 'Everburn Blade', amulette: 'Periapt of Wound Closure', anneaux: ['Strange Conduit Ring', 'Caustic Band'], distance: 'Bow of Awareness' },
        { acte: 2, tete: 'Haste Helm', cape: 'Cloak of Protection', torse: 'Adamantine Splint Armour', gants: 'Helldusk Gloves (objet d’acte 3 : Flawed Helldusk Gloves en acte 2)', bottes: 'Disintegrating Night Walkers', arme: 'Charge-Bound Warhammer', amulette: 'Amulet of the Harpers', anneaux: ['Killer’s Sweetheart', 'Caustic Band'], distance: 'Darkfire Shortbow' },
        { acte: 3, tete: 'Mask of Soul Perception', cape: 'Cloak of Displacement', torse: 'Armour of Persistence', gants: 'Legacy of the Masters', bottes: 'Boots of Persistence', arme: 'Nyrulna', amulette: 'Fey Semblance Amulet', anneaux: ['Caustic Band', 'Killer’s Sweetheart'], distance: 'The Dead Shot' },
      ],
    },
    divergences: [
      { id: 'paladin-serment', sujet: 'Serment, race, historique', recommandation: 'Ancienne référence : Vengeance, Duergar, Artisan de guilde, style Défense', export: 'Couronne, Demi-orque, Soldat, Great Weapon Fighting — le choix de l’utilisateur remplace l’ancienne préférence pour la version exportée' },
      { id: 'paladin-cha', sujet: 'CHA final', recommandation: 'CHA 20 (respécialisation, deux +2 CHA, Great Weapon Master)', export: 'CHA 18 : un seul +2 CHA, Alerte au niveau 12' },
      { id: 'paladin-ordre', sujet: 'Ordre des niveaux', recommandation: 'Paladin 1-6, respécialisation au niveau 7 en Paladin 2 / Occultiste 5', export: 'Paladin 1-4 puis Occultiste 1-8 — la seconde attaque n’arrive qu’au niveau 9 si c’est la progression jouée' },
      { id: 'paladin-invocations', sujet: 'Invocations', recommandation: 'Agonising Blast, Devil’s Sight, Repelling Blast, Mask of Many Faces', export: 'Beguiling Influence (doublon avec Persuasion), Devil’s Sight, Mire the Mind, Dreadful Word — sans Agonising Blast' },
      { id: 'paladin-sorts', sujet: 'Sorts et tours de magie', recommandation: 'Bouclier, Armure d’Agathys, Maléfice (temporaire), Pas brumeux, Immobilisation de personne, Faim de Hadar, Contresort, Peur, Bannissement, Porte dimensionnelle ; Décharge occulte, Booming Blade, Main de mage', export: 'Armure d’Agathys, Maléfice, Bouclier, Pas brumeux, Ténèbres, Faim de Hadar, Lever la malédiction, Contresort, Porte dimensionnelle ; Booming Blade, Décharge occulte, Friends' },
      { id: 'paladin-gants-acte-2', sujet: 'Gants de la seconde configuration', recommandation: 'Flawed Helldusk Gloves en acte 2', export: 'Helldusk Gloves, objet d’acte 3 — à corriger en Flawed Helldusk Gloves pour une configuration d’acte 2' },
      { id: 'paladin-ring-synergy', sujet: 'Ring of Arcane Synergy', recommandation: 'Alternative offensive prioritaire à tester avec Booming Blade', export: 'Équipé dans aucune des trois configurations' },
    ],
    aConfirmer: [
      { id: 'paladin-ordre-niveaux', texte: 'L’ordre Paladin 1-4 puis Occultiste 1-8 est-il la progression jouée, ou seulement l’ordre de reconstruction du personnage final ? Tant que ce n’est pas confirmé, ne pas présenter le retard d’Attaque supplémentaire jusqu’au niveau 9 comme une route validée.' },
      { id: 'paladin-hotfix', texte: 'Hotfix exact installé en jeu.' },
      { id: 'paladin-copies', texte: 'Fonctionnement et persistance des copies d’équipement (Invocation de réplique demande le domaine de la Ruse).' },
      { id: 'paladin-respec-stats', texte: 'Respécialisation vers les caractéristiques CHA de la fiche (non présente dans l’export).' },
    ],
    lexique: [
      { nom: 'The Hexblade', wiki: wiki('The_Hexblade') },
      { nom: 'Pact of the Blade', wiki: wiki('Pact_of_the_Blade') },
      { nom: 'Deepened Pact', wiki: wiki('Deepened_Pact') },
      { nom: 'Booming Blade', wiki: wiki('Booming_Blade') },
      { nom: 'Invoke Duplicity', wiki: wiki('Invoke_Duplicity') },
    ],
  },

  // ================================================================
  // Moine — Main ouverte 8 / Roublard Voleur 4, Tavern Brawler
  // ================================================================
  {
    id: 'moine-main-ouverte',
    personnage: 'Moine',
    joueur: null,
    nom: 'Moine Main ouverte / Voleur — Tavern Brawler',
    split: 'Moine Main ouverte 8 / Roublard Voleur 4',
    classe: 'Moine',
    sousClasse: 'Voie de la Main ouverte / Voleur',
    role: 'DPS mêlée à mains nues / contrôle',
    icone: '👊',
    couleurAccent: 'emerald',
    resume:
      'Mains nues, Tavern Brawler et élixirs de Force, deux actions bonus de Voleur et ki récupéré au repos court. Moine 6 d’abord, sans retarder l’Attaque supplémentaire. Aucun Cheveu requis. Dépendance assumée : un élixir de Force actif.',
    reference: { notion: REFERENCES['moine-main-ouverte'], guide: 'https://gamestegy.com/post/bg3/981/open-hand-monk-build' },
    ordre: [...repeter('Moine', 6), ...repeter('Roublard', 3), ...repeter('Moine', 2), 'Roublard'],
    repartitionFinale: { Moine: 8, Roublard: 4 },
    stats: { FOR: 8, DEX: 16, CON: 15, INT: 8, SAG: 16, CHA: 10 },
    notesStats:
      'Route élixirs : FOR naturelle 8, jamais jouée comme si le bonus était permanent — la FOR effective vaut 21 avec Hill Giant Strength, 27 avec Cloud Giant Strength (un seul élixir actif, jusqu’au repos long). CON 15 volontaire : Tavern Brawler apporte +1. Graceful Cloth ajoute 2 à la DEX équipée, plafonnée à 20, non inclus ici. Pas de Cheveu, de Miroir ni de bonus permanent nécessaire.',
    caracteristiques: {
      creation: { FOR: 8, DEX: 16, CON: 15, INT: 8, SAG: 16, CHA: 10 },
      bonusDons: [
        { niveau: 4, stat: 'CON', valeur: 1, source: 'Tavern Brawler' },
        { niveau: 11, stat: 'SAG', valeur: 2, source: 'Don Moine 8' },
      ],
      bonusPermanents: [],
      bonusEquipement: [
        { id: 'graceful-cloth', source: 'The Graceful Cloth', stat: 'DEX', valeur: 2, plafond: 20 },
      ],
      fixees: [
        { id: 'elixir-geant-collines', source: 'Elixir of Hill Giant Strength', type: 'elixir', stat: 'FOR', valeur: 21, condition: 'Un seul élixir actif : incompatible avec Soif de sang et Vigilance simultanés.' },
        { id: 'elixir-geant-nuages', source: 'Elixir of Cloud Giant Strength', type: 'elixir', stat: 'FOR', valeur: 27, condition: 'Peut apparaître dans les stocks à partir du niveau 9, sans disponibilité garantie.' },
        { id: 'gantelets-geant-collines', source: 'Gauntlets of Hill Giant Strength', type: 'equipement', stat: 'FOR', valeur: 23, condition: 'Acte 3, Maison de l’Espoir. Occupe les mains à la place de Soul Catching.' },
        { id: 'greater-health', source: 'Amulet of Greater Health', type: 'equipement', stat: 'CON', valeur: 23, condition: 'Respécialisation tardive possible seulement une fois l’objet acquis et sa copie validée.' },
      ],
      variantes: [],
    },
    feats: [
      { niveau: 4, nom: 'Tavern Brawler (Bagarreur de taverne) — CON +1 (15 → 16)', note: 'Moine 4. Ajoute le modificateur de FOR une fois de plus aux attaques et dégâts à mains nues ; mauvais choix sans FOR corrigée.' },
      { niveau: 11, nom: 'Amélioration de caractéristique — SAG +2 (16 → 18)', note: 'Moine 8. Défense sans armure, manifestations, dégâts des bottes Kushigo.' },
      { niveau: 12, nom: 'Alerte', note: 'Roublard 4. +5 d’initiative et protection contre la surprise. Variante offensive : +2 SAG (20) si l’initiative est déjà couverte.' },
    ],
    leveling: [
      { niveau: 1, classe: 'Moine 1', gains: 'Défense sans armure ; attaque puis frappe bonus. Un bâton peut servir au tout début.' },
      { niveau: 2, classe: 'Moine 2', gains: 'Défense patiente et mobilité du ki. Ne pas dépenser l’action bonus de déplacement si une marche normale suffit.' },
      { niveau: 3, classe: 'Moine Main ouverte 3', gains: 'Déluge de coups : Renversement, Poussée, Déséquilibre selon la cible.' },
      { niveau: 4, classe: 'Moine 4', gains: 'Don : Tavern Brawler, CON +1. Élixir de Force et mains libres deviennent la référence.' },
      { niveau: 5, classe: 'Moine 5', gains: 'Attaque supplémentaire + Frappe étourdissante. Ne pas prendre Roublard avant ce palier.' },
      { niveau: 6, classe: 'Moine 6', gains: 'Manifestations + Wholeness of Body ; attaques à mains nues comptées magiques.' },
      { niveau: 7, classe: 'Roublard 1', gains: 'Compétences, expertises. L’Attaque sournoise n’est pas ajoutée automatiquement aux poings.' },
      { niveau: 8, classe: 'Roublard 2', gains: 'Ruse : mobilité en action bonus sans ki, qui consomme toujours l’action bonus.' },
      { niveau: 9, classe: 'Voleur 3', gains: 'Mains lestes (Fast Hands) : seconde action bonus, donc deux Déluges de coups possibles dans le même tour.' },
      { niveau: 10, classe: 'Moine 7', gains: 'Évasion et capacités défensives de Moine 7.' },
      { niveau: 11, classe: 'Moine 8', gains: 'Don : SAG +2 (16 → 18). 9 ki.' },
      { niveau: 12, classe: 'Roublard 4', gains: 'Don : Alerte (ou SAG +2 pour la variante dégâts).' },
    ],
    sorts: { note: 'Aucun lanceur : pas d’emplacement de sort. Le ki revient au repos court.' },
    boucle: [
      'Avant le combat : vérifier l’élixir actif et la FOR effective (21 ou 27, pas 8), mains libres, aucune armure ni bouclier, manifestation choisie.',
      'Action : deux frappes (Attaque supplémentaire). Deux actions bonus : deux Déluges de coups, 1 ki chacun — six frappes pour deux ki, six tentatives et non six touches garanties.',
      'Une seule manifestation à la fois (nécrotique, psychique ou radiant), 1d4 + SAG ; elles ne s’additionnent pas. Avec Kushigo, le bonus de SAG des bottes s’ajoute : deux effets distincts.',
      'Wholeness of Body coûte une action : le tour d’activation n’a pas gratuitement la même action d’attaque. Le ki revient au repos court : Chant de repos du support.',
    ],
    synergies: [
      'Chant de repos du Barde recharge à la fois le ki du Moine et les emplacements de pacte du Paladin.',
      'Renversé favorise les alliés au contact mais peut gêner les attaques à distance : coordonner avec le Sorcier avant de renverser sa cible de Rayon ardent.',
      'Bénédiction aide attaques et sauvegardes ; Immobilisation du support offre des opportunités de mêlée.',
    ],
    vigilance: [
      'Un seul élixir actif : l’élixir de Force est incompatible avec Soif de sang ou Vigilance simultanés. Acheter le stock chez Ethel AVANT la résolution de sa quête.',
      'Ne pas retirer l’élixir de la fiche FOR 8 en laissant les dégâts annoncés : sans élixir, c’est un autre budget de caractéristiques et de dons (cf. variantes).',
      'Caustic Band, Strange Conduit, Broodmother’s Revenge et les bonus d’attaques d’arme ne sont pas des bonus aux poings. Les gants Uninhibited Kushigo concernent lancer / armes improvisées ; ce sont les bottes qui comptent ici.',
      'Le DD des techniques utilise FOR / DEX selon leurs règles, pas la SAG affichée par certains outils : Tavern Brawler ne double pas tous les DD.',
      'Hâte : une attaque supplémentaire, pas deux ; la fin de Hâte provoque une Léthargie.',
      'Vérifier la catégorie des casques, gants et bottes : une pièce classée armure casse les bénéfices sans armure.',
    ],
    variantes: [
      {
        id: 'moine-9-3',
        nom: 'Moine 9 / Roublard Voleur 3',
        type: 'variante',
        ordre: [...repeter('Moine', 6), ...repeter('Roublard', 3), ...repeter('Moine', 3)],
        dons: 2,
        gains: ['Dé martial d8', 'Résonance du ki', 'Déplacement avancé', '10 ki'],
        pertes: ['Le troisième don (Alerte)', 'Pas automatiquement supérieure à Alerte en Honneur'],
        verdict: 'Excellente variante si l’initiative est déjà couverte et que le joueur veut vraiment Résonance. Passer de d6 à d8 ajoute un point de dégâts moyen par dé, pas un dé complet. Conserver Tavern Brawler et +2 SAG ; ne pas lui attribuer aussi Alerte.',
        cumulAvecPrincipal: false,
      },
      {
        id: 'moine-sans-elixir-dex-sag',
        nom: 'Autonomie : DEX / SAG sans Tavern Brawler',
        type: 'autonomie',
        dons: 3,
        gains: ['Aucun élixir requis', 'Dons investis en DEX, SAG et initiative'],
        pertes: ['Moins de précision et de dégâts que FOR élevée + Tavern Brawler'],
        verdict: 'Un autre budget de caractéristiques et de dons, pas la même performance annoncée.',
        cumulAvecPrincipal: false,
      },
      {
        id: 'moine-sans-elixir-for-naturelle',
        nom: 'Autonomie : FOR naturelle + Tavern Brawler',
        type: 'autonomie',
        dons: 3,
        gains: ['Aucun élixir requis'],
        pertes: ['Oblige à réduire DEX, SAG ou CON', 'Ne promet pas FOR 20, grosse DEX/SAG, Alerte et tous les dons avec le même point-buy'],
        verdict: 'À construire comme une variante spécifique si cette contrainte est retenue.',
        cumulAvecPrincipal: false,
      },
      {
        id: 'moine-gantelets-collines',
        nom: 'Autonomie : Gauntlets of Hill Giant Strength (acte 3)',
        type: 'autonomie',
        dons: 3,
        gains: ['FOR fixée à 23', 'Libère le slot d’élixir pour un autre élixir'],
        pertes: ['Occupe les mains à la place de Soul Catching : perte du +1d10 force par frappe et du soin associé'],
        verdict: 'Alternative cohérente, pas amélioration gratuite.',
        cumulAvecPrincipal: false,
      },
    ],
    export: null,
    divergences: [],
    aConfirmer: [
      { id: 'moine-hotfix', texte: 'Hotfix exact installé en jeu ; la fiche n’a pas été testée sur la sauvegarde de la run.' },
      { id: 'moine-copies', texte: 'Fonctionnement et persistance des copies d’équipement.' },
      { id: 'moine-export', texte: 'Aucun export de planner fourni pour ce rôle (champ SHA vide) : aucun n’est généré.' },
    ],
    lexique: [
      { nom: 'Way of the Open Hand', wiki: wiki('Way_of_the_Open_Hand') },
      { nom: 'Tavern Brawler', wiki: wiki('Tavern_Brawler') },
      { nom: 'Fast Hands', wiki: wiki('Fast_Hands') },
      { nom: 'Wholeness of Body', wiki: wiki('Wholeness_of_Body') },
      { nom: 'Boots of Uninhibited Kushigo', wiki: wiki('Boots_of_Uninhibited_Kushigo') },
    ],
  },

  // ================================================================
  // Sidekick — Barde du Savoir 10 / Clerc de la Vie 2
  // ================================================================
  {
    id: 'sidekick-savoir-vie',
    personnage: 'Sidekick',
    joueur: null,
    nom: 'Barde du Savoir / Clerc de la Vie — buffs sur soins',
    split: 'Barde du Savoir 10 / Clerc de la Vie 2',
    classe: 'Barde',
    sousClasse: 'Collège du Savoir / Domaine de la Vie',
    role: 'Support / contrôle',
    icone: '🎵',
    couleurAccent: 'purple',
    resume:
      'Quatrième personnage actif : faire réussir les contrôles, empêcher les mauvaises actions ennemies, appliquer les buffs d’équipement avec les soins et fournir un repos court supplémentaire. Route Vie 1 → Savoir 6 → Vie 2 → Savoir 10. Pas d’Aide native avec Clerc 2.',
    reference: { notion: REFERENCES['sidekick-savoir-vie'], guide: 'https://bg3.wiki/wiki/College_of_Lore' },
    ordre: ['Clerc', ...repeter('Barde', 6), 'Clerc', ...repeter('Barde', 4)],
    repartitionFinale: { Barde: 10, Clerc: 2 },
    stats: { FOR: 8, DEX: 14, CON: 16, INT: 8, SAG: 12, CHA: 16 },
    notesStats:
      'Point-buy 8 / 14 / 15 / 8 / 12 / 14 puis +1 CON et +2 CHA. SAG 12 suffit pour les préparations utilitaires : ne pas faire du Commandement de Clerc le contrôle principal. Les sorts de Barde et les Secrets utilisent le CHA ; les sorts préparés comme Clerc utilisent la SAG. Aucun Cheveu ni élixir de Force requis ; l’élixir de Vigilance est conseillé selon la rencontre.',
    caracteristiques: {
      creation: { FOR: 8, DEX: 14, CON: 16, INT: 8, SAG: 12, CHA: 16 },
      bonusDons: [{ niveau: 5, stat: 'CHA', valeur: 2, source: 'Don Barde 4' }],
      bonusPermanents: [],
      fixees: [
        { id: 'greater-health', source: 'Amulet of Greater Health', type: 'equipement', stat: 'CON', valeur: 23, condition: 'Si elle fournit l’avantage de CON, War Caster devient en partie redondant ; ne pas baisser la CON naturelle avant de dépendre de l’objet.' },
      ],
      variantes: [],
    },
    feats: [
      { niveau: 5, nom: 'Amélioration de caractéristique — CHA +2 (16 → 18)', note: 'Barde 4. Précision des contrôles et compétences. +2 CHA (20) est une variante de contrôleur, pas un troisième don gratuit.' },
      { niveau: 10, nom: 'War Caster (Mage de guerre)', note: 'Barde 8. Avantage aux sauvegardes de concentration, qui ne se cumule pas avec Spidersilk Armour ni Greater Health. Alerte le remplace si l’initiative est le vrai problème.' },
    ],
    leveling: [
      { niveau: 1, classe: 'Clerc de la Vie 1', gains: 'Armures lourdes et boucliers, Disciple de la vie. Bénédiction et Soin des blessures de domaine ; préparer Mot de guérison et Sanctuaire.' },
      { niveau: 2, classe: 'Barde 1', gains: 'Mot de guérison de Barde, Longstrider, premiers contrôles ; Inspiration bardique.' },
      { niveau: 3, classe: 'Barde 2', gains: 'Chant de repos : une récupération équivalente à un repos court par repos long ; utilitaire et compétences.' },
      { niveau: 4, classe: 'Savoir 3', gains: 'Mots cinglants (Cutting Words), expertises, sorts de Barde de niveau 2.' },
      { niveau: 5, classe: 'Savoir 4', gains: 'Don : CHA +2 (16 → 18).' },
      { niveau: 6, classe: 'Savoir 5', gains: 'Inspirations au repos court ; sorts de niveau 3 : Motif hypnotique / Glyphe de garde.' },
      { niveau: 7, classe: 'Savoir 6', gains: 'Secrets magiques : Contresort + Mot de guérison de groupe. Le moteur soin-buff de groupe devient relançable sur emplacements.' },
      { niveau: 8, classe: 'Vie 2', gains: 'Préservation de la vie (Canalisation divine) : soin de zone en action, 36 PV au niveau de personnage 12 même avec deux niveaux de Clerc.' },
      { niveau: 9, classe: 'Savoir 7', gains: 'Sorts de Barde de niveau 4 : Porte dimensionnelle en priorité.' },
      { niveau: 10, classe: 'Savoir 8', gains: 'Don : War Caster (ou Alerte). Confusion si retenue.' },
      { niveau: 11, classe: 'Savoir 9', gains: 'Sorts de niveau 5 : Immobilisation de monstre et/ou soins de groupe selon remplacements.' },
      { niveau: 12, classe: 'Savoir 10', gains: 'Inspirations d10, expertises. Secrets magiques : Hâte + Invocation d’élémentaire.' },
    ],
    sorts: {
      note: 'Clerc de Vie 2 et Barde 10 sont deux lanceurs complets : le niveau de lanceur est 12 et le personnage a un emplacement de niveau 6. Mais aucun sort de niveau 6 n’est APPRIS (Barde 10 plafonne au niveau 5, Clerc 2 au niveau 1) : l’emplacement ne sert qu’à surincanter. Pas d’Aide ni de Restauration partielle par Clerc 2, et Aide n’est pas dans la liste des Secrets magiques.',
    },
    secrets: [
      { niveau: 7, sorts: ['Contresort', 'Mot de guérison de groupe'] },
      { niveau: 12, sorts: ['Hâte', 'Invocation d’élémentaire'] },
    ],
    boucle: [
      'Après repos long : Longstrider sur l’équipe, charges d’objets et inspirations, élémentaire avant le combat si disponible. Aucune Aide annoncée par ce personnage.',
      'Action bonus : Mot de guérison de groupe pour appliquer les buffs d’équipement ou relever ; action : contrôle utile, Glyphe ou sauvetage. Réaction : Mots cinglants OU Contresort, une seule.',
      'Attribuer clairement les concentrations avant le combat : trois plans (pack dangereux, humanoïde prioritaire, boss), pas trois concentrations.',
      'Soigner pour relever ou poser des protections à temps, pas par automatisme : chaque renouvellement coûte une action bonus et souvent un emplacement.',
    ],
    synergies: [
      'Whispering Promise applique Bénédiction deux tours sans concentration ; Hellrider’s Pride protège les alliés soignés des dégâts physiques concernés — un petit soin a une grosse valeur.',
      'Hâte sur le Sorcier libère sa concentration ; Chant de repos recharge le ki du Moine et les emplacements de pacte du Paladin.',
      'Le 4/8 du Paladin n’a pas d’Aura : les sauvegardes ne sont pas « déjà réglées » par le Paladin.',
    ],
    vigilance: [
      'Correction importante : Clerc 2 ne connaît pas Aide, Restauration partielle ni Mot de guérison de groupe par ses niveaux de Clerc. Le soin de groupe vient des Secrets magiques.',
      'Un emplacement de niveau 6 n’est pas un sort connu de niveau 6 : ne pas réintroduire de sort de niveau 6 sur le Sidekick 10/2.',
      'Création d’eau n’est pas le bouton d’ouverture par défaut d’une équipe feu : Mouillé peut pénaliser les dégâts de feu.',
      'The Reviving Hands n’applique Death Ward que sur une résurrection : un simple Mot de guérison sur un allié à terre ne la donne pas.',
      'Hâte : confier la concentration au support libère celle du Sorcier, mais la fin de Hâte provoque une Léthargie ; ne pas couper la concentration pour Guidance.',
      'Invocation de réplique demande le domaine de la Ruse : ce n’est pas une capacité du Clerc de Vie.',
    ],
    variantes: [
      {
        id: 'barde-savoir-12',
        nom: 'Barde du Savoir 12',
        type: 'variante',
        ordre: repeter('Barde', 12),
        dons: 3,
        gains: ['Trois dons', 'Sorts de Barde de niveau 6', 'Progression simple'],
        pertes: ['Disciple de la vie et Préservation de la vie', 'Maîtrises de Clerc selon race / classe'],
        verdict: 'Toujours possible d’utiliser les objets de soin si maîtrisés ; ne mélange pas ses capacités avec celles du 10/2.',
        cumulAvecPrincipal: false,
      },
      {
        id: 'barde-9-vie-3',
        nom: 'Barde 9 / Clerc de la Vie 3',
        type: 'variante',
        ordre: ['Clerc', ...repeter('Barde', 6), 'Clerc', ...repeter('Barde', 3), 'Clerc'],
        ordreAConfirmer: true,
        dons: 2,
        gains: ['Accès de Clerc à Aide et Restauration partielle'],
        pertes: ['Barde 10 : deuxième paire de Secrets, inspirations d10 et expertises associées'],
        verdict: 'Pas la même fiche avec Aide simplement ajoutée.',
        cumulAvecPrincipal: false,
      },
      {
        id: 'clerc-vie-12',
        nom: 'Clerc de la Vie 12',
        type: 'variante',
        ordre: repeter('Clerc', 12),
        dons: 3,
        gains: ['Vrais sorts de Clerc de haut niveau', 'Festin des héros'],
        pertes: ['Mots cinglants, Secrets magiques et Chant de repos'],
        verdict: 'Choix si la priorité change vers le kit Clerc ; pas une amélioration universelle.',
        cumulAvecPrincipal: false,
      },
    ],
    export: null,
    divergences: [],
    aConfirmer: [
      { id: 'sidekick-hotfix', texte: 'Hotfix exact installé en jeu ; la fiche n’a pas été testée sur la sauvegarde de la run.' },
      { id: 'sidekick-copies', texte: 'Fonctionnement et persistance des copies d’équipement.' },
      { id: 'sidekick-aide', texte: 'Source externe d’Aide si l’équipe la veut tous les jours : ce split ne la fournit pas.' },
      { id: 'sidekick-export', texte: 'Aucun export de planner fourni pour ce rôle (champ SHA vide) : aucun n’est généré.' },
    ],
    lexique: [
      { nom: 'College of Lore', wiki: wiki('College_of_Lore') },
      { nom: 'Cutting Words', wiki: wiki('Cutting_Words') },
      { nom: 'Magical Secrets', wiki: wiki('Magical_Secrets') },
      { nom: 'Preserve Life', wiki: wiki('Preserve_Life') },
      { nom: 'Life Domain', wiki: wiki('Life_Domain') },
    ],
  },
]

export const BUILD_DEFAUT = BUILDS[0]

/**
 * Cherche d'abord dans la composition active, puis dans l'ancienne : les
 * items déjà catalogués et les liens diffusés y renvoient encore. Une entrée
 * trouvée dans l'ancienne composition porte `ancienne: true`.
 */
export function buildDe(id) {
  const actif = BUILDS.find((build) => build.id === id)
  if (actif) return actif
  const ancien = BUILDS_ANCIENS.find((build) => build.id === id)
  return ancien ? { ...ancien, ancienne: true } : null
}

/** Nom d'affichage court utilisé par les filtres et les badges d'items. */
export function nomCourtDe(id) {
  return buildDe(id)?.personnage ?? 'Équipe'
}

export { BUILDS_ANCIENS }
