// ------------------------------------------------------------------
// Garde-fous de composition du mode Honneur — les erreurs que la V2 ne doit
// pas faire revenir depuis l'ancienne équipe ou depuis un guide de table.
//
// Ce sont des assertions de données et des avertissements éditoriaux
// (recopiés des fiches Notion), pas un simulateur de combat : aucun résultat
// de jeu n'est promis. `verifie` dit ce qu'un test peut réellement établir :
// 'donnees' = contrôlé contre builds / objets / loadouts, 'editorial' = rappel
// à lire, non vérifiable mécaniquement.
// ------------------------------------------------------------------
export const RISQUES = [
  {
    id: 'sidekick-sans-aide',
    roles: ['sidekick-savoir-vie'],
    gravite: 'bloquant',
    verifie: 'donnees',
    texte: 'Clerc de Vie 2 ne donne pas Aide, ni Restauration partielle ; et un emplacement de niveau 6 n’est pas un sort connu de niveau 6. Si Aide est voulue tous les jours, prévoir une source externe ou changer le split.',
  },
  {
    id: 'paladin-sans-aura',
    roles: ['paladin-hexblade'],
    gravite: 'bloquant',
    verifie: 'donnees',
    texte: 'Pas d’Aura de protection sur Paladin 4, et pas de cumul des Attaques supplémentaires Paladin / Pacte de la lame en Honneur.',
  },
  {
    id: 'hate',
    roles: ['sorcier-feu', 'sidekick-savoir-vie'],
    gravite: 'attention',
    verifie: 'editorial',
    texte: 'Hâte : l’action supplémentaire est une action de sort pour le lanceur, mais pas une série d’Attaque supplémentaire pour un martial. Une seule concentration par personnage ; la fin de Hâte provoque une Léthargie.',
  },
  {
    id: 'mouille',
    roles: ['sorcier-feu'],
    gravite: 'attention',
    verifie: 'donnees',
    texte: 'Mouillé n’est pas le setup du Sorcier feu : avertir avant d’appliquer un plan eau / foudre hérité de l’ancienne équipe.',
  },
  {
    id: 'moine-un-elixir',
    roles: ['moine-main-ouverte'],
    gravite: 'bloquant',
    verifie: 'donnees',
    texte: 'Un seul élixir actif : l’élixir de Force du Moine est incompatible avec Soif de sang ou Vigilance simultanés.',
  },
  {
    id: 'copies-limites',
    roles: ['sorcier-feu', 'paladin-hexblade', 'moine-main-ouverte', 'sidekick-savoir-vie'],
    gravite: 'bloquant',
    verifie: 'donnees',
    texte: 'Les copies d’équipement ne dupliquent pas le Cheveu ni les bonus permanents, et ne rendent pas tous les objets adaptés à tous les rôles. Une amulette, une cape, deux anneaux par personnage.',
  },
  {
    id: 'moine-poings',
    roles: ['moine-main-ouverte'],
    gravite: 'attention',
    verifie: 'donnees',
    texte: 'Mains libres, bonus aux poings : Caustic Band, Strange Conduit et Broodmother’s Revenge sont des bonus d’arme, pas de poings. Les bottes Kushigo restent le choix offensif propre au Moine.',
  },
  {
    id: 'radiant',
    roles: ['paladin-hexblade', 'sorcier-feu'],
    gravite: 'attention',
    verifie: 'editorial',
    texte: 'Renvoi radieux : Smite et Callous Glow infligent du radiant ; certains ennemis le punissent. Attaquer physiquement, changer de cible ou contrôler plutôt que Smite automatique.',
  },
  {
    id: 'constitution-fixee',
    roles: ['sorcier-feu', 'paladin-hexblade', 'moine-main-ouverte', 'sidekick-savoir-vie'],
    gravite: 'attention',
    verifie: 'donnees',
    texte: 'Greater Health fixe la CON à 23 : retirer l’amulette après une respécialisation qui a baissé la CON est dangereux. DEX fixée et élixirs suivent la même logique de valeur effective.',
  },
  {
    id: 'kushigo',
    roles: ['moine-main-ouverte'],
    gravite: 'bloquant',
    verifie: 'donnees',
    texte: 'Les bottes Kushigo se ramassent sur Lir’i’c au Plan astral avant de repartir : point de non-retour.',
  },
  {
    id: 'honneur-non-teste',
    roles: [],
    gravite: 'attention',
    verifie: 'editorial',
    texte: 'Fiches documentées, pas testées en jeu : aucun combo n’a été validé sur la sauvegarde de la run, et le hotfix exact reste à confirmer.',
  },
]

export function risqueDe(id) {
  return RISQUES.find((risque) => risque.id === id) ?? null
}
