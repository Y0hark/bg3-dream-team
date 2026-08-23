// ------------------------------------------------------------------
// Zones où l'équipe récupère les pièces du loadout.
//
// GUARD du cadrage : aucune image ni carte du jeu n'est copiée dans le dépôt.
// On pointe vers le wiki communautaire et vers des cartes interactives
// externes. Un lien absent vaut `null` : l'UI affiche « Lien à compléter »
// plutôt qu'un lien mort.
// ------------------------------------------------------------------

export const LIEUX = [
  {
    id: 'bosquet-emeraude',
    nom: 'Bosquet d’Émeraude',
    acte: 1,
    resume: 'Hub de l’Acte I : marchands druides et tieffelins, quêtes à embranchements.',
    wiki: 'https://bg3.wiki/wiki/Emerald_Grove',
    carte: 'https://mapgenie.io/baldurs-gate-3/maps/faerun',
  },
  {
    id: 'village-devaste',
    nom: 'Village dévasté',
    acte: 1,
    resume: 'Gobelins, forge abandonnée et accès à la Boucherie d’Ombreterre.',
    wiki: 'https://bg3.wiki/wiki/Blighted_Village',
    carte: 'https://mapgenie.io/baldurs-gate-3/maps/faerun',
  },
  {
    id: 'planque-zhentarim',
    nom: 'Planque des Zhentarim',
    acte: 1,
    resume: 'Boutique cachée : la meilleure densité d’objets utiles de l’Acte I.',
    wiki: 'https://bg3.wiki/wiki/Zhentarim_Hideout',
    carte: null,
  },
  {
    id: 'ombreterre',
    nom: 'Ombreterre',
    acte: 1,
    resume: 'Tour arcanique, myconides et champignons luminescents.',
    wiki: 'https://bg3.wiki/wiki/Underdark',
    carte: 'https://mapgenie.io/baldurs-gate-3/maps/faerun',
  },
  {
    id: 'grymforge',
    nom: 'Grymforge',
    acte: 1,
    resume: 'Forge adamantine : une seule fenêtre pour couler l’équipement adamantin.',
    wiki: 'https://bg3.wiki/wiki/Grymforge',
    carte: null,
  },
  {
    id: 'auberge-derniere-lumiere',
    nom: 'Auberge de la Dernière Lumière',
    acte: 2,
    resume: 'Refuge des Terres Maudites : marchands, repos long sécurisé, quêtes d’acte.',
    wiki: 'https://bg3.wiki/wiki/Last_Light_Inn',
    carte: 'https://mapgenie.io/baldurs-gate-3/maps/faerun',
  },
  {
    id: 'tours-aubelune',
    nom: 'Tours d’Aubelune',
    acte: 2,
    resume: 'Point de non-retour de l’Acte II : boucler le loadout avant l’assaut.',
    wiki: 'https://bg3.wiki/wiki/Moonrise_Towers',
    carte: 'https://mapgenie.io/baldurs-gate-3/maps/faerun',
  },
  {
    id: 'temple-shar',
    nom: 'Temple de Shar (Gauntlet)',
    acte: 2,
    resume: 'Épreuves de Shar : pièges mortels en Honneur, à faire reposé.',
    wiki: 'https://bg3.wiki/wiki/Gauntlet_of_Shar',
    carte: null,
  },
  {
    id: 'sorcelleries-sundries',
    nom: 'Sorcelleries Sundries',
    acte: 3,
    resume: 'Boutique arcanique de Baldur’s Gate : les pièces maîtresses des casters.',
    wiki: 'https://bg3.wiki/wiki/Sorcerous_Sundries',
    carte: 'https://mapgenie.io/baldurs-gate-3/maps/faerun',
  },
  {
    id: 'maison-de-lespoir',
    nom: 'Maison de l’Espoir',
    acte: 3,
    resume: 'Coffre-fort de Raphaël : le meilleur butin de l’Acte III, et un combat à préparer.',
    wiki: 'https://bg3.wiki/wiki/House_of_Hope',
    carte: null,
  },
  {
    id: 'basse-ville',
    nom: 'Basse-Ville',
    acte: 3,
    resume: 'Échoppes, égouts et quêtes secondaires denses.',
    wiki: 'https://bg3.wiki/wiki/Lower_City',
    carte: 'https://mapgenie.io/baldurs-gate-3/maps/faerun',
  },
]

export function lieuDe(id) {
  return LIEUX.find((lieu) => lieu.id === id) ?? null
}
