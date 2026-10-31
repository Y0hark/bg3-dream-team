// ------------------------------------------------------------------
// Checklists de la run Honneur V2 : ce qui doit être vrai avant de franchir
// chaque point de non-retour, pour Sorcier feu, Paladin, Moine et Sidekick.
// Recopiées des sections « Checklist » des quatre fiches Notion ; aucune
// entrée de l'ancienne composition n'a été reprise (leurs cases cochées, si
// elles existent, sont archivées par la migration).
//
// Chaque entrée porte un ID stable, l'acte, les rôles concernés, une
// priorité, un objet et/ou un lieu quand il y en a un, et surtout la RAISON
// de ne pas attendre :
//   - obligatoire : nécessaire au plan ; conditionne la validation de l'acte ;
//   - rattrapable : une seconde chance existe, mais plus chère ;
//   - optionnel : confort ou variante ; ne bloque jamais un acte ;
//   - alternative : l'objet est une option parmi d'autres (jamais bloquante).
//
// Une entrée obligatoire liée à un objet critique doit documenter une
// `alternative` : un objet raté n'affiche pas une run entière comme perdue.
// ------------------------------------------------------------------

export const PRIORITES_ENTREE = ['obligatoire', 'rattrapable', 'optionnel', 'alternative']

const e = (id, priorite, texte, raison, options = {}) => ({
  id,
  priorite,
  texte,
  raison,
  roles: options.roles ?? [],
  objet: options.objet ?? null,
  lieu: options.lieu ?? null,
  alternative: options.alternative ?? null,
  moment: options.moment ?? null,
  // Vrai quand l'action précède l'obtention (ex. laisser un PNJ vivre en Acte I
  // pour recevoir l'objet en Acte II).
  anticipation: options.anticipation ?? false,
})

const SORCIER = 'sorcier-feu'
const PALADIN = 'paladin-hexblade'
const MOINE = 'moine-main-ouverte'
const SIDEKICK = 'sidekick-savoir-vie'

export const CHECKLISTS = [
  {
    acte: 1,
    titre: 'Avant de descendre à Grymforge et de quitter l’Acte I',
    entrees: [
      e('v2-a1-elixirs', 'obligatoire',
        'Stock d’élixirs de Force chez Ethel acheté AVANT la résolution de sa quête.',
        'Après l’avoir rendue hostile ou tuée, plus de vente : le Moine joue FOR 8 sans élixir.',
        { roles: [MOINE], objet: 'elixir-hill-giant-strength', lieu: 'antre-ethel',
          alternative: 'Variantes sans élixir de la fiche : DEX / SAG sans Tavern Brawler, ou Gauntlets of Hill Giant Strength en Acte III.' }),
      e('v2-a1-cheveu', 'optionnel',
        'Cheveu d’Ethel réservé au Sorcier (jamais au Paladin ni au Sidekick).',
        'Ressource unique : les copies ne la dupliquent pas.',
        { roles: [SORCIER], objet: 'auntie-ethels-hair', lieu: 'antre-ethel',
          alternative: 'Route sans Cheveu : CHA 16 à la création, +2 aux niveaux 4 et 12 pour 20.' }),
      e('v2-a1-spellsparkler', 'obligatoire',
        'Sauver Florrick au Relais de Waukeen et prendre The Spellsparkler.',
        'La récompense dépend de l’issue de la quête.',
        { roles: [SORCIER], objet: 'the-spellsparkler', lieu: 'auberge-waukeen',
          alternative: 'Melf’s First Staff chez Blurg (colonie myconide).' }),
      e('v2-a1-boeuf', 'obligatoire',
        'Laisser l’Étrange bœuf vivre au Bosquet d’Émeraude.',
        'Le tuer à ce stade ne donne pas le Hat of Fire Acuity : il le porte en Acte II.',
        { roles: [SORCIER], objet: 'hat-of-fire-acuity', lieu: 'bosquet-emeraude', anticipation: true,
          alternative: 'Rattrapage à Rivington en Acte III si le bœuf y arrive vivant ; sinon Hood of the Weave ou Fistbreaker Helm.' }),
      e('v2-a1-whispering-promise', 'obligatoire',
        'Acheter The Whispering Promise (Volo) et vérifier l’inventaire.',
        'Le moteur soin-buff sans concentration du Sidekick en dépend.',
        { roles: [SIDEKICK], objet: 'whispering-promise', lieu: 'camp-gobelin',
          alternative: 'Hellrider’s Pride protège déjà les alliés soignés ; Bénédiction du sort reste lançable avec concentration.' }),
      e('v2-a1-hellriders-pride', 'obligatoire',
        'Résoudre l’enquête sur Kagha pour obtenir Hellrider’s Pride auprès de Zevlor.',
        'Pas besoin de massacrer le Bosquet pour obtenir ce moteur.',
        { roles: [SIDEKICK], objet: 'hellriders-pride', lieu: 'bosquet-emeraude',
          alternative: 'The Reviving Hands en Acte III reprend le rôle de gants de soin.' }),
      e('v2-a1-creche', 'obligatoire',
        'Écumer la Crèche Y’llek avant les choix qui la rendent hostile : Unseen Menace, Arcane Synergy.',
        'Les marchands de la Crèche ne reviennent pas après leur bascule.',
        { roles: [PALADIN], objet: 'unseen-menace', lieu: 'creche-yllek',
          alternative: 'Sword of Justice (péage de la Route du Renouveau) ou une arme à deux mains achetée.' }),
      e('v2-a1-arcane-synergy', 'optionnel',
        'Récupérer Ring of Arcane Synergy (et, en option, Elemental Infusion) avant de quitter la Crèche.',
        'Alternative offensive prioritaire pour Booming Blade : la zone ne se rouvre pas.',
        { roles: [PALADIN], objet: 'ring-arcane-synergy', lieu: 'creche-yllek' }),
      e('v2-a1-night-walkers', 'obligatoire',
        'Sécuriser Disintegrating Night Walkers (Nere) sans précipiter les combats de Grymforge.',
        'Mobilité et protections de déplacement pour trois rôles, par copie.',
        { roles: [SORCIER, MOINE, SIDEKICK], objet: 'disintegrating-night-walkers', lieu: 'grymforge',
          alternative: 'Boots of Speed (Thulla) ou Boots of Stormy Clamour (Omeluum).' }),
      e('v2-a1-esther', 'obligatoire',
        'Acheter The Graceful Cloth et Periapt of Wound Closure chez Lady Esther.',
        'Elle ne reste pas fiable une fois le secteur hostile.',
        { roles: [MOINE, PALADIN], objet: 'the-graceful-cloth', lieu: 'sentier-rosemorne',
          alternative: 'Vêtements ordinaires en attendant ; Amulet of Misty Step en amulette de combat.' }),
      e('v2-a1-sparkle-hands', 'optionnel',
        'Prendre The Sparkle Hands (Marais Ensoleillé) ou Gloves of Cinder and Sizzle.',
        'Gants de poings du Moine : choisir selon la cible, pas la rareté.',
        { roles: [MOINE], objet: 'gloves-sparkle-hands', lieu: 'marais-ensoleille' }),
      e('v2-a1-roah', 'optionnel',
        'Acheter Bow of Awareness chez Roah avant de rendre le camp hostile.',
        'Passif d’initiative, par copie pour plusieurs rôles.',
        { roles: [SORCIER, MOINE, SIDEKICK], objet: 'bow-of-awareness', lieu: 'camp-gobelin' }),
      e('v2-a1-copies', 'obligatoire',
        'Valider les copies d’équipement sur deux personnages avant de compter sur un set partagé.',
        'Passifs et persistance des copies sont à vérifier sur le hotfix installé ; Invocation de réplique demande le domaine de la Ruse.',
        { alternative: 'Mode sans copies : le loadout affiche les arbitrages naturels, rien n’est perdu.' }),
    ],
  },
  {
    acte: 2,
    titre: 'Avant l’assaut des Tours d’Aubelune',
    entrees: [
      e('v2-a2-chapeau', 'obligatoire',
        'Obtenir le Hat of Fire Acuity à l’Ultime Lueur sans mettre Dammon ni les PNJ alliés en danger.',
        'Priorité absolue du Sorcier ; le combat doit être préparé.',
        { roles: [SORCIER], objet: 'hat-of-fire-acuity', lieu: 'auberge-derniere-lumiere',
          alternative: 'Fistbreaker Helm (Lann Tarv) maintenant, Hood of the Weave en Acte III, ou rattrapage à Rivington.' }),
      e('v2-a2-talli', 'obligatoire',
        'Acheter chez Talli : Cloak of Protection et Amulet of the Harpers.',
        'Achats de survie pour les quatre rôles, à faire avant l’hostilité.',
        { roles: [SORCIER, PALADIN, MOINE, SIDEKICK], objet: 'cloak-of-protection', lieu: 'auberge-derniere-lumiere',
          alternative: 'Ring of Protection (quête de l’idole) et Cloak of Displacement en Acte III.' }),
      e('v2-a2-boutiques', 'optionnel',
        'Passer chez Dammon, Araj, Roah et Lann Tarv avant les bascules hostiles de l’Ultime Lueur et de Hautelune.',
        'Free Action, Sentinel Shield, Darkfire Shortbow, Charge-Bound Warhammer : tout disparaît avec le vendeur.',
        { roles: [PALADIN, MOINE, SIDEKICK], objet: 'ring-free-action', lieu: 'tours-aubelune' }),
      e('v2-a2-spineshudder', 'obligatoire',
        'Récupérer Spineshudder Amulet (mimique de l’ancienne chambre d’Isobel, pas celle de Ketheric).',
        'Réverbération sur les attaques de sorts à distance : le moteur de Rayon ardent.',
        { roles: [SORCIER], objet: 'spineshudder-amulet', lieu: 'tours-aubelune',
          alternative: 'Amulet of the Harpers ou Spellcrux Amulet en réserve.' }),
      e('v2-a2-spellcrux', 'optionnel',
        'Prendre Spellcrux Amulet (gardienne de la prison de Hautelune) et l’amulette de Malus Thorm.',
        'Réserve d’autonomie hors combat ; Surgeon’s Subjugation est une option de rencontre.',
        { roles: [SORCIER, PALADIN, MOINE], objet: 'spellcrux-amulet', lieu: 'tours-aubelune' }),
      e('v2-a2-anneaux', 'optionnel',
        'Anneaux utiles du Sorcier : Callous Glow (Gantelet de Shar) et Coruscation (cave de l’Ultime Lueur).',
        'Pièges mortels en Honneur ; à faire avant la fin du Gantelet.',
        { roles: [SORCIER], objet: 'callous-glow-ring', lieu: 'temple-shar' }),
      e('v2-a2-flawed-helldusk', 'rattrapable',
        'Faire forger les Flawed Helldusk Gloves par Dammon (fer infernal).',
        'Gants d’acte 2 du Paladin et du Moine ; la forge n’est pas disponible après la bascule.',
        { roles: [PALADIN, MOINE], objet: 'flawed-helldusk-gloves', lieu: 'auberge-derniere-lumiere',
          alternative: 'Gloves of the Growling Underdog, Sparkle Hands ou Cinder en attendant.' }),
      e('v2-a2-killer', 'optionnel',
        'Épreuve du dédoublement du Gantelet de Shar : Killer’s Sweetheart.',
        'Critique préparé pour un gros Smite, une fois par repos long.',
        { roles: [PALADIN], objet: 'killers-sweetheart', lieu: 'temple-shar' }),
      e('v2-a2-prisonniers', 'obligatoire',
        'Sauver les prisonniers et explorer avant les points de non-retour de la fin du Gantelet.',
        'Tout ce qui n’est pas fait avant l’assaut des Tours est perdu.',
        { lieu: 'tours-aubelune' }),
      e('v2-a2-concentration', 'obligatoire',
        'Plan de concentration validé : qui tient Hâte, qui tient le contrôle.',
        'Une seule concentration par personnage ; la fin de Hâte provoque une Léthargie.',
        { roles: [SORCIER, SIDEKICK] }),
    ],
  },
  {
    acte: 3,
    titre: 'Transition vers l’Acte III et derniers combats',
    entrees: [
      e('v2-a3-kushigo', 'obligatoire',
        'Ramasser les Boots of Uninhibited Kushigo sur Lir’i’c au Plan astral avant de repartir.',
        'On ne revient pas au Plan astral : sans elles, le Moine perd le modificateur de SAG à chaque frappe.',
        { roles: [MOINE], objet: 'boots-uninhibited-kushigo', lieu: 'plan-astral', moment: 'transition',
          alternative: 'Disintegrating Night Walkers : mobilité conservée, mais le bonus de SAG par frappe est perdu.' }),
      e('v2-a3-ferg', 'optionnel',
        'Acheter chez Ferg à Rivington avant toute interaction qui ferme son commerce.',
        'Hellrider Longbow (+3 initiative) et Robe of Supreme Defences ; le parcours de Shadowheart peut bloquer.',
        { roles: [SORCIER, PALADIN, MOINE, SIDEKICK], objet: 'hellrider-longbow', lieu: 'rivington',
          alternative: 'Bow of Awareness ou Darkfire Shortbow.' }),
      e('v2-a3-nyrulna', 'obligatoire',
        'Récupérer Nyrulna dans le coffre de la jungle d’Akabi avec un personnage préparé.',
        'Arme de référence du Paladin ; la jungle se fait en solitaire.',
        { roles: [PALADIN], objet: 'nyrulna', lieu: 'cirque-derniers-jours',
          alternative: 'Unseen Menace ou Halberd of Vigilance jusqu’à son acquisition.' }),
      e('v2-a3-mystic-scoundrel', 'optionnel',
        'Prendre le sac à dos de Band of the Mystic Scoundrel dans la jungle, distinct du coffre de Nyrulna.',
        'Deux contenants différents : prendre l’un n’ouvre pas l’autre.',
        { roles: [PALADIN], objet: 'band-mystic-scoundrel', lieu: 'cirque-derniers-jours' }),
      e('v2-a3-ramazith', 'obligatoire',
        'Tour de Ramazith : Markoheshkir et Robe of the Weave.',
        'Pièces finales du Sorcier ; globe à désactiver.',
        { roles: [SORCIER, SIDEKICK], objet: 'markoheshkir', lieu: 'tour-ramazith',
          alternative: 'Staff of Spellpower, Melf’s First Staff ou Phalar Aluve.' }),
      e('v2-a3-reviving-hands', 'obligatoire',
        'Acheter The Reviving Hands au Tabernacle de la Côte des Tempêtes.',
        'Blade Ward sur soin et Death Ward sur résurrection pour le Sidekick.',
        { roles: [SIDEKICK], objet: 'reviving-hands', lieu: 'tabernacle-stormshore',
          alternative: 'Garder Hellrider’s Pride.' }),
      e('v2-a3-dammon', 'rattrapable',
        'Acheter les pièces de Dammon à la Forge des Neuf (Armour et Boots of Persistence, Legacy of the Masters).',
        'Sa survie conditionne ces achats ; sinon garder les pièces d’acte 2.',
        { roles: [PALADIN, MOINE, SIDEKICK], objet: 'armour-of-persistence', lieu: 'forge-des-neuf',
          alternative: 'Adamantine Splint Armour et les gants d’acte 2.' }),
      e('v2-a3-helsik', 'optionnel',
        'Débloquer le stock spécial d’Helsik (Cloak of the Weave) et ouvrir son coffre (Mask of Soul Perception).',
        'Devil’s Fee : cape de contrôle et casque d’attaques du Paladin et du Moine.',
        { roles: [SORCIER, SIDEKICK, PALADIN, MOINE], objet: 'cloak-of-the-weave', lieu: 'devils-fee' }),
      e('v2-a3-hope', 'optionnel',
        'Hope et Raphael : étape dangereuse et tardive, pas une obligation de précipitation.',
        'Soul Catching et Greater Health sont des options ; n’y aller qu’avec une équipe préparée.',
        { roles: [MOINE, SORCIER, SIDEKICK, PALADIN], objet: 'gloves-soul-catching', lieu: 'maison-de-lespoir' }),
      e('v2-a3-greater-health', 'optionnel',
        'Greater Health ou Fey Semblance : choisir selon concentration ou contrôle mental.',
        'Ne baisser la CON naturelle qu’une fois l’amulette obtenue et sa copie validée.',
        { roles: [SORCIER, PALADIN, MOINE, SIDEKICK], objet: 'amulet-greater-health', lieu: 'maison-de-lespoir',
          alternative: 'Fey Semblance Amulet (Mayrina) ou Spineshudder / Devout selon le rôle.' }),
      e('v2-a3-copies', 'obligatoire',
        'Valider les copies finales sans dupliquer le Cheveu ni supposer qu’un objet convient à tous les rôles.',
        'Un objet copié reste limité à son slot : une amulette, une cape, deux anneaux par personnage.'),
    ],
  },
]

export function checklistDe(acte) {
  return CHECKLISTS.find((entree) => entree.acte === acte) ?? null
}

/** Entrées qui conditionnent la validation d'un acte (les autres ne bloquent jamais). */
export function estRequise(entree) {
  return entree.priorite === undefined || entree.priorite === 'obligatoire'
}
