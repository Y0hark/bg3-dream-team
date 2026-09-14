// ------------------------------------------------------------------
// Zones où l'équipe récupère les pièces du loadout.
//
// GUARD du cadrage : aucune image ni carte du jeu n'est copiée dans le dépôt.
// On pointe vers le wiki communautaire et vers des cartes interactives
// externes. Un lien absent vaut `null` : l'UI affiche « Lien à compléter »
// plutôt qu'un lien mort.
//
// Les cartes MapGenie n'existent que pour trois zones (Contrée sauvage,
// Terres maudites, Baldur's Gate) : les intérieurs et l'Ombreterre portent
// `carte: null` volontairement.
// ------------------------------------------------------------------

const wiki = (page) => "https://bg3.wiki/wiki/" + page

const CARTE_ACTE_I = 'https://mapgenie.io/baldurs-gate-3/maps/wilderness'
const CARTE_ACTE_II = 'https://mapgenie.io/baldurs-gate-3/maps/shadow-cursed-lands'
const CARTE_ACTE_III = 'https://mapgenie.io/baldurs-gate-3/maps/baldurs-gate'

export const LIEUX = [
  // ---------------------------------------------------------------- Acte I
  {
    id: 'bosquet-emeraude',
    nom: 'Bosquet d’Émeraude',
    acte: 1,
    resume: 'Hub de l’Acte I : marchands druides et tieffelins, quêtes à embranchements. Fermé une fois les druides partis — vérifier les abords avant que la porte ne se scelle.',
    wiki: wiki('Emerald_Grove'),
    carte: CARTE_ACTE_I,
  },
  {
    id: 'abords-bosquet-emeraude',
    nom: 'Abords du Bosquet d’Émeraude',
    acte: 1,
    resume: 'La patrouille gobeline devant la porte scellée, avant même d’entrer dans le Bosquet : Za’krug y porte les Gloves of Power. Reste accessible même après la fermeture du Bosquet par les druides — contrairement à tout ce qui est rangé dans la zone elle-même.',
    wiki: wiki('Za%27krug'),
    carte: CARTE_ACTE_I,
  },
  {
    id: 'village-devaste',
    nom: 'Village dévasté',
    acte: 1,
    resume: 'Gobelins, forge abandonnée et accès au sous-sol qui mène à la planque des Zhentarim.',
    wiki: wiki('Blighted_Village'),
    carte: CARTE_ACTE_I,
  },
  {
    id: 'planque-zhentarim',
    nom: 'Planque des Zhentarim',
    acte: 1,
    resume: 'Brem débloque son stock spécial une fois « Retrouver la cargaison disparue » terminée : c’est là que sort le Titanstring Bow.',
    wiki: wiki('Zhentarim_Hideout'),
    carte: CARTE_ACTE_I,
  },
  {
    id: 'camp-gobelin',
    nom: 'Camp gobelin & Temple profané',
    acte: 1,
    resume: 'Grat le Marchand vend trois pièces de support ; le coffre doré des quartiers de Gut porte l’Amulet of Misty Step.',
    wiki: wiki('Goblin_Camp'),
    carte: CARTE_ACTE_I,
  },
  {
    id: 'auberge-waukeen',
    nom: 'Relais de Waukeen',
    acte: 1,
    resume: 'Sauver la conseillère Florrick de l’incendie : c’est la récompense qui donne The Spellsparkler.',
    wiki: wiki('Waukeen%27s_Rest'),
    carte: CARTE_ACTE_I,
  },
  {
    id: 'sentier-rosemorne',
    nom: 'Sentier du monastère de Rosemorne',
    acte: 1,
    resume: 'Lady Esther campe au nord-est de Trielta Crags : The Graceful Cloth pour Lilian, et les Winter’s Clutches sans lesquelles le combo Gelé de Sam ne tient pas un tour.',
    wiki: wiki('Rosymorn_Monastery_Trail'),
    carte: null,
  },
  {
    id: 'creche-yllek',
    nom: 'Crèche Y’llek',
    acte: 1,
    resume: 'La chambre de l’Inquisiteur concentre trois pièces du loadout, et la chambre secrète garde The Blood of Lathander.',
    wiki: wiki('Cr%C3%A8che_Y%27llek'),
    carte: null,
  },
  {
    id: 'ombreterre',
    nom: 'Ombreterre',
    acte: 1,
    resume: 'Les trois composants de Mourning Frost sont portés par trois mages drows dispersés dans la zone. Phalar Aluve est plantée dans la pierre, et l’avant-poste sélûnite garde la Luminous Armour.',
    wiki: wiki('Underdark'),
    carte: null,
  },
  {
    id: 'grotte-ebonlake',
    nom: 'Grotte d’Ébènelac (colonie myconide)',
    acte: 1,
    resume: 'Omeluum et Derryth Bonecloak : deux étals qui portent quatre pièces, dont les Boots of Stormy Clamour.',
    wiki: wiki('Ebonlake_Grotto'),
    carte: null,
  },
  {
    id: 'tour-arcanique',
    nom: 'Tour arcanique',
    acte: 1,
    resume: 'Tabouret de Force de géant des collines à casser : il libère le Club of Hill Giant Strength, le stat stick qui rend le Titanstring de Lilian jouable dès l’Acte I.',
    wiki: wiki('Arcane_Tower'),
    carte: null,
  },
  {
    id: 'grymforge',
    nom: 'Grymforge',
    acte: 1,
    resume: 'Nere porte les Disintegrating Night Walkers ; le corsaire Greymon vend le Bow of the Banshee dès l’arrivée en radeau ; un coffre piégé garde The Real Sparky Sparkswall.',
    wiki: wiki('Grymforge'),
    carte: null,
  },
  {
    id: 'forge-adamantine',
    nom: 'Forge adamantine',
    acte: 1,
    resume: 'Deux veines de mithral dans le Refuge abandonné : de quoi couler deux moules, l’armure et le bouclier. Grym, le golem gardien, porte le Grymskull Helm.',
    wiki: wiki('Adamantine_Forge'),
    carte: null,
  },

  // --------------------------------------------------------------- Acte II
  {
    id: 'auberge-derniere-lumiere',
    nom: 'Auberge de la Dernière Lumière',
    acte: 2,
    resume: 'Quartier-maître Talli, Mattis, Alfira : le point de ravitaillement de l’Acte II. La cave piégée cache le Coruscation Ring.',
    wiki: wiki('Last_Light_Inn'),
    carte: CARTE_ACTE_II,
  },
  {
    id: 'tours-aubelune',
    nom: 'Tours d’Aubelune',
    acte: 2,
    resume: 'Point de non-retour de l’Acte II. Araj Oblodra y tient trois anneaux et chapeaux du plan : boucler ses achats avant l’assaut.',
    wiki: wiki('Moonrise_Towers'),
    carte: CARTE_ACTE_II,
  },
  {
    id: 'maison-ombres-profondes',
    nom: 'Maison des Ombres profondes',
    acte: 2,
    resume: 'À l’est du point de passage du Champ de bataille assombri : un coffre verrouillé garde le Ring of Mental Inhibition.',
    wiki: wiki('House_in_Deep_Shadows'),
    carte: CARTE_ACTE_II,
  },
  {
    id: 'temple-shar',
    nom: 'Épreuves de Shar (Gantelet)',
    acte: 2,
    resume: 'Épreuve du Reflet et chambre forte de Balthazar : deux anneaux majeurs, le Miroir des Pertes pour le charisme du Sidekick, et des pièges mortels en Honneur.',
    wiki: wiki('Gauntlet_of_Shar'),
    carte: null,
  },

  // -------------------------------------------------------------- Acte III
  {
    id: 'basse-ville',
    nom: 'Basse-Ville',
    acte: 3,
    resume: 'Échoppes, égouts et quêtes secondaires denses : le socle des courses de l’Acte III.',
    wiki: wiki('Lower_City'),
    carte: CARTE_ACTE_III,
  },
  {
    id: 'sorcelleries-sundries',
    nom: 'Sorcelleries Sundries',
    acte: 3,
    resume: 'Rolan (ou la projection de Lorroakan) vend Birthright, les Quickspell Gloves et le Ring of Regeneration.',
    wiki: wiki('Sorcerous_Sundries'),
    carte: CARTE_ACTE_III,
  },
  {
    id: 'tabernacle-stormshore',
    nom: 'Tabernacle de Stormshore',
    acte: 3,
    resume: 'Le coffre d’offrandes du sous-sol porte l’Amulet of the Devout. Le piller maudit celui qui y touche : prévoir un Retrait de malédiction.',
    wiki: wiki('Stormshore_Tabernacle'),
    carte: CARTE_ACTE_III,
  },
  {
    id: 'tour-ramazith',
    nom: 'Tour de Ramazith',
    acte: 3,
    resume: 'Markoheshkir est sous un globe d’invulnérabilité : Voir l’invisible pour révéler le levier, puis Arcanes DD 20.',
    wiki: wiki('Ramazith%27s_Tower'),
    carte: CARTE_ACTE_III,
  },
  {
    id: 'maison-de-lespoir',
    nom: 'Maison de l’Espoir',
    acte: 3,
    resume: 'Amulet of Greater Health sur le piédestal de gauche des Archives, Staff of Spellpower dans le coffre-fort, Helldusk Armour sur Raphaël lui-même. Combat à préparer.',
    wiki: wiki('House_of_Hope'),
    carte: null,
  },
  {
    id: 'devils-fee',
    nom: 'Le Denier du Diable',
    acte: 3,
    resume: 'Helsik : le Cloak of the Weave sort de son stock spécial, débloqué après lui avoir acheté le rituel infernal.',
    wiki: wiki('Devil%27s_Fee'),
    carte: CARTE_ACTE_III,
  },
  {
    id: 'armurerie-stormshore',
    nom: 'Armurerie de Stormshore',
    acte: 3,
    resume: 'Fytz le Pétard et Gloomy Fentonson, près du point de passage du Mur central : The Dead Shot et l’Armour of Agility.',
    wiki: wiki('Stormshore_Armoury'),
    carte: CARTE_ACTE_III,
  },
  {
    id: 'forge-des-neuf',
    nom: 'Forge des Neuf',
    acte: 3,
    resume: 'Dammon en Basse-Ville : les Boots of Persistence (Liberté de mouvement permanente) et l’Armour of Persistence (dégâts entrants -2, Blade Ward permanent). Deux pièces complémentaires, pas un doublon.',
    wiki: wiki('Forge_of_the_Nine'),
    carte: CARTE_ACTE_III,
  },
  {
    id: 'cirque-derniers-jours',
    nom: 'Cirque des Derniers Jours',
    acte: 3,
    resume: 'Lucretious récompense « Retrouver Dribbles le clown » par les Spellmight Gloves.',
    wiki: wiki('Circus_of_the_Last_Days'),
    carte: CARTE_ACTE_III,
  },
  {
    id: 'manoir-philgrave',
    nom: 'Manoir de Philgrave',
    acte: 3,
    resume: 'Mystic Carrion vend le Hood of the Weave : +2 au DD des sorts et aux jets d’attaque magique.',
    wiki: wiki('Philgrave%27s_Mansion'),
    carte: CARTE_ACTE_III,
  },
  {
    id: 'danthelon',
    nom: 'La Hache Dansante de Danthelon',
    acte: 3,
    resume: 'Entharl Danthelon, à la Traversée du Wyrm : Cloak of Displacement.',
    wiki: wiki('Danthelon%27s_Dancing_Axe'),
    carte: CARTE_ACTE_III,
  },
  {
    id: 'guilde-des-voleurs',
    nom: 'Guilde (Sticky Dondo)',
    acte: 3,
    resume: 'Étal de la Guilde des voleurs : Shade-Slayer Cloak pour les ouvertures furtives.',
    wiki: wiki('Guildhall'),
    carte: CARTE_ACTE_III,
  },
  {
    id: 'guilde-des-macons',
    nom: 'Guilde des maçons',
    acte: 3,
    resume: 'Sous-sol secret sous la trappe : coffre doré piégé (Perception DD 15, Escamotage DD 21) et Helmet of Arcane Acuity.',
    wiki: wiki('Mason%27s_Guild'),
    carte: CARTE_ACTE_III,
  },
  {
    id: 'grand-mausolee',
    nom: 'Grand Mausolée',
    acte: 3,
    resume: 'Coffre de voyageur verrouillé dans l’angle sud-est : Vivacious Cloak.',
    wiki: wiki('Grand_Mausoleum'),
    carte: CARTE_ACTE_III,
  },
  {
    id: 'tribunal-du-meurtre',
    nom: 'Tribunal du Meurtre',
    acte: 3,
    resume: 'Sarevok Anchev porte son heaume cornu : combat de fin de chaîne du Meurtre rituel.',
    wiki: wiki('Murder_Tribunal'),
    carte: CARTE_ACTE_III,
  },
  {
    id: 'fonderie-guet-acier',
    nom: 'Fonderie du Guet d’Acier',
    acte: 3,
    resume: 'Gontr Mael tombe du Titan du Guet d’Acier — mais pas s’il meurt sous l’état Atrophié.',
    wiki: wiki('Steel_Watch_Foundry'),
    carte: CARTE_ACTE_III,
  },
  {
    id: 'sanctum-du-dragon',
    nom: 'Sanctum du Dragon (Ansur)',
    acte: 3,
    resume: 'Ouvert par les épreuves du Wyrmway : le Helm of Balduran est sur l’autel, à côté d’Ansur.',
    wiki: wiki('The_Dragon%27s_Sanctum'),
    carte: CARTE_ACTE_III,
  },
  {
    id: 'cloitre-sombre-etreinte',
    nom: 'Cloître de la Sombre Étreinte',
    acte: 3,
    resume: 'Viconia DeVir porte Viconia’s Walking Fortress : bouclier de fin de run, quête « Fille des Ténèbres ».',
    wiki: wiki('Cloister_of_Sombre_Embrace'),
    carte: CARTE_ACTE_III,
  },
]

export function lieuDe(id) {
  return LIEUX.find((lieu) => lieu.id === id) ?? null
}
