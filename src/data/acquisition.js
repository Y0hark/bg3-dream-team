// ------------------------------------------------------------------
// Conditions d'acquisition des objets (ticket UX 3/5).
//
// Ce fichier POSSÈDE les conditions sourcées ; le catalogue (`objets.js`) garde
// les sources de base (acte, lieu, verrou). Aucun second catalogue d'objets :
// une condition référence des IDs de `objets.js`.
//
// Une condition dit « tel objet dépend de telle chose », jamais « telle
// personne est indispensable ». Elle ne promet rien sur la partie du joueur :
// le site ne lit pas la sauvegarde du jeu, l'utilisateur déclare ce qu'il a vu.
//
// Champs :
// - categorie : une clé de CATEGORIES ;
// - objets : IDs de objets.js concernés (une alerte commune à plusieurs objets
//   n'est écrite qu'une fois) ;
// - zone : id de lieux.js où il faut agir (ou null) ;
// - evenement : id d'EVENEMENTS qui déclenche la condition (échéance), ou null ;
// - irreversible : true seulement si la source établit que, l'événement passé,
//   l'objet n'est plus obtenable. Sinon l'événement reste informatif ;
// - severite : 'bloquant' (perte possible) | 'attention' | 'info' ;
// - portee : 'obligatoire' | 'methode' (pour une méthode précise) |
//   'precaution' (recommandé, pas établi comme obligatoire) ;
// - confiance : 'verifie' (recoupé sur le wiki à la date de verification) |
//   'fiche' (fiche d'équipe, non recoupée) | 'a-verifier' (incertain :
//   « À vérifier sur votre version ») ;
// - discret : texte court sans dénouement ; detail : explication spoiler,
//   révélée volontairement ; libelleDiscret : titre neutre du résumé ;
// - masquerObjets : en mode discret, le résumé ne cite pas les objets ;
// - voies : faits qui satisfont la condition par un autre chemin (logique OU),
//   déclarés par l'utilisateur ; chaque `id` est un événement 'constat'.
//
// Catégorie sans entrée : `compagnon-requis`. Aucun cas sourcé n'a été trouvé ;
// elle n'est pas inventée (cf. docs/contrat-donnees-objets.md).
//
// Hotfix : le jeu évolue ; une condition `verifie` l'est à la date indiquée,
// pas pour toutes les versions.
// ------------------------------------------------------------------

export const DATE_VERIFICATION = '2026-10-31'

export const CATEGORIES = {
  'compagnon-requis': { nom: 'Compagnon requis', court: 'Compagnon' },
  'pnj-a-preserver': { nom: 'PNJ à préserver', court: 'PNJ à préserver' },
  'pnj-a-sauver': { nom: 'PNJ à sauver', court: 'PNJ à sauver' },
  'choix-de-quete': { nom: 'Choix de quête', court: 'Choix de quête' },
  'acces-conditionnel': { nom: 'Accès conditionnel', court: 'Accès conditionnel' },
  'achat-avant-evenement': { nom: 'Achat avant un événement', court: 'Achat à faire' },
  'recuperation-avant-sortie': { nom: 'Récupération avant sortie irréversible', court: 'Avant départ' },
}

export const SEVERITES = {
  bloquant: { nom: 'Perte possible', ordre: 0 },
  attention: { nom: 'Attention', ordre: 1 },
  info: { nom: 'Information', ordre: 2 },
}

export const PORTEES = {
  obligatoire: 'Condition obligatoire',
  methode: 'Condition pour une méthode précise',
  precaution: 'Précaution recommandée',
}

export const CONFIANCES = {
  verifie: 'Recoupé sur le wiki',
  fiche: 'Fiche d’équipe, non recoupée',
  'a-verifier': 'À vérifier sur votre version',
}

/**
 * Faits que l'utilisateur déclare. `depart` : une sortie ou une fermeture
 * qu'il déclare avoir franchie ; `constat` : un fait vu en jeu. Ce ne sont pas
 * tous les changements de lieu : seuls les événements nommés et sourcés.
 */
export const EVENEMENTS = [
  { id: 'depart-plan-astral', nom: 'Plan astral quitté (départ vers l’Acte III)', nature: 'depart', zone: 'plan-astral' },
  { id: 'roah-tuee', nom: 'Roah Moonglow tuée', nature: 'constat', zone: 'camp-gobelin' },
  { id: 'ethel-revelee', nom: 'Ethel révélée ou boutique fermée (forme de guenaude, fuite ou mort)', nature: 'depart', zone: 'antre-ethel' },
  { id: 'ethel-tuee-avant-cheveu', nom: 'Ethel tuée avant la scène de l’Antre', nature: 'depart', zone: 'antre-ethel' },
  { id: 'colonie-illithid', nom: 'Fin de l’Acte II : colonie illithid atteinte', nature: 'depart', zone: 'auberge-derniere-lumiere' },
  { id: 'boeuf-vu-ultime-lueur', nom: 'Bœuf étrange rencontré vivant à l’Ultime Lueur', nature: 'constat', zone: 'auberge-derniere-lumiere' },
  { id: 'boeuf-vu-rivington', nom: 'Bœuf étrange rencontré vivant à Rivington', nature: 'constat', zone: 'rivington' },
  { id: 'depart-creche-yllek', nom: 'Crèche Y’llek quittée définitivement', nature: 'depart', zone: 'creche-yllek' },
]

const wikiObjet = (page) => ({ libelle: `BG3 Wiki — ${page.replaceAll('_', ' ')}`, url: `https://bg3.wiki/wiki/${page}` })
const FICHE = 'Fiche d’équipe (catalogue objets.js)'

export const CONDITIONS = [
  {
    id: 'kushigo-plan-astral',
    categorie: 'recuperation-avant-sortie',
    objets: ['boots-uninhibited-kushigo'],
    zone: 'plan-astral',
    evenement: 'depart-plan-astral',
    irreversible: true,
    severite: 'bloquant',
    portee: 'precaution',
    confiance: 'fiche',
    libelleDiscret: 'Objet à récupérer avant de quitter la zone',
    discret: 'Cet objet se prend sur un adversaire de la zone avant de repartir.',
    detail:
      'Les bottes sont portées par le prélat Lir’i’c, au Plan astral, « à l’entrée de l’Acte III ». Le wiki ne cite qu’une seule source et aucun rattrapage ; la fiche d’équipe en fait un point de non-retour. Aucun correctif ou autre exemplaire n’est connu : à confirmer sur votre version.',
    sources: [wikiObjet('Boots_of_Uninhibited_Kushigo'), { libelle: FICHE, url: null }],
    voies: [],
    masquerObjets: false,
  },
  {
    id: 'chapeau-acuite-boeuf',
    categorie: 'pnj-a-preserver',
    objets: ['hat-of-fire-acuity'],
    zone: 'auberge-derniere-lumiere',
    evenement: null,
    irreversible: false,
    severite: 'attention',
    portee: 'methode',
    confiance: 'a-verifier',
    libelleDiscret: 'Condition de quête à vérifier',
    discret: 'Un personnage non-joueur porte cet objet : le laisser en vie peut compter.',
    detail:
      'Le wiki donne deux rencontres du Bœuf étrange portant le chapeau : à l’Ultime Lueur (forge de Dammon, Acte II) et à Rivington (Acte III), et précise qu’il n’y a pas d’autre source. Le tuer au Bosquet ne donne que l’anneau du Shapeshifter ; la fiche d’équipe demande de le laisser vivant en Acte I. L’effet exact d’une mort selon l’endroit n’est pas établi : déclarez la rencontre vue pour lever l’alerte.',
    sources: [wikiObjet('Hat_of_Fire_Acuity'), { libelle: FICHE, url: null }],
    voies: [
      { id: 'boeuf-vu-ultime-lueur', libelle: 'Bœuf rencontré vivant à l’Ultime Lueur' },
      { id: 'boeuf-vu-rivington', libelle: 'Bœuf rencontré vivant à Rivington' },
    ],
    masquerObjets: true,
  },
  {
    id: 'dammon-achats-acte2',
    categorie: 'achat-avant-evenement',
    objets: ['charge-bound-warhammer', 'darkfire-shortbow', 'flawed-helldusk-gloves'],
    zone: 'auberge-derniere-lumiere',
    evenement: 'colonie-illithid',
    irreversible: false,
    severite: 'attention',
    portee: 'precaution',
    confiance: 'verifie',
    libelleDiscret: 'Marchand bientôt indisponible',
    discret: 'Un marchand de l’acte quitte la zone avant la fin de l’acte : acheter avant.',
    detail:
      'Le wiki indique que Dammon devient indisponible vers la fin de l’Acte II, puis réapparaît en Acte III. Ce qu’il vend à l’Ultime Lueur ne doit donc pas être repoussé « à plus tard ». Le wiki ne dit pas que ces achats sont définitivement perdus : la condition ne passe pas en « impossible » à la déclaration.',
    sources: [wikiObjet('Dammon')],
    voies: [],
    masquerObjets: false,
  },
  {
    id: 'dammon-survie',
    categorie: 'pnj-a-sauver',
    objets: ['armour-of-persistence', 'boots-of-persistence', 'legacy-of-the-masters'],
    zone: 'forge-des-neuf',
    evenement: null,
    irreversible: false,
    severite: 'attention',
    portee: 'precaution',
    confiance: 'a-verifier',
    libelleDiscret: 'Condition de PNJ à vérifier',
    discret: 'Ces objets sont vendus par un personnage dont le sort dépend de la quête précédente.',
    detail:
      'Ces trois pièces sont vendues par Dammon à la Forge des Neuf (Acte III). Le wiki dit que Dammon partage le sort des réfugiés et qu’il est indisponible de la conclusion de « Sauver les réfugiés » jusqu’à son arrivée à l’Ultime Lueur. Il ne dit pas ce qu’il advient de son commerce s’il meurt : incertain, ne pas en déduire une interdiction.',
    sources: [wikiObjet('Dammon'), { libelle: FICHE, url: null }],
    voies: [],
    masquerObjets: false,
  },
  {
    id: 'roah-boutique-acte1',
    categorie: 'achat-avant-evenement',
    objets: ['bow-of-awareness'],
    zone: 'camp-gobelin',
    evenement: null,
    irreversible: false,
    severite: 'info',
    portee: 'precaution',
    confiance: 'fiche',
    libelleDiscret: 'Achat à faire tôt',
    discret: 'Un marchand peut refuser de commercer si la zone devient hostile : acheter tôt.',
    detail:
      'Le wiki indique que si les Zhentarim du sous-sol sont éliminés, Roah propose un dernier échange puis refuse ensuite de commercer (les autres membres du groupe peuvent encore lui parler). La fiche d’équipe conseille d’acheter avant de rendre la zone hostile ; le wiki ne détaille pas les autres cas d’hostilité.',
    sources: [wikiObjet('Roah_Moonglow'), { libelle: FICHE, url: null }],
    voies: [],
    masquerObjets: false,
  },
  {
    id: 'roah-vivante-acte2',
    categorie: 'pnj-a-preserver',
    objets: ['ring-spiteful-thunder', 'drakethroat-glaive'],
    zone: 'tours-aubelune',
    evenement: 'roah-tuee',
    irreversible: true,
    severite: 'bloquant',
    portee: 'obligatoire',
    confiance: 'verifie',
    libelleDiscret: 'Marchand à garder en vie',
    discret: 'Le marchand de l’acte suivant est la marchande de l’acte précédent : sa mort ferme sa boutique.',
    detail:
      'Roah Moonglow vend ces deux objets à l’entrée de Hautelune (Acte II). Le wiki précise que si elle est tuée en Acte I, la boutique d’Acte II est manquée.',
    sources: [wikiObjet('Roah_Moonglow')],
    voies: [],
    masquerObjets: false,
  },
  {
    id: 'ethel-elixirs',
    categorie: 'achat-avant-evenement',
    objets: ['elixir-hill-giant-strength'],
    zone: 'antre-ethel',
    evenement: 'ethel-revelee',
    irreversible: true,
    severite: 'bloquant',
    portee: 'methode',
    confiance: 'verifie',
    libelleDiscret: 'Achat à faire avant un événement de quête',
    discret: 'La boutique se ferme définitivement à un moment précis de la quête : acheter avant.',
    detail:
      'Le wiki indique que la boutique d’Ethel reste indisponible pour le reste du jeu dès qu’elle montre sa vraie forme, se retire ou meurt. Elle propose trois élixirs de Force de géant des collines, renouvelés au repos long ou au passage de niveau : le stock du Moine se prépare donc avant ce moment. Un élixir ne dupliquera pas un bonus permanent par une copie.',
    sources: [wikiObjet('Auntie_Ethel'), wikiObjet('Elixir_of_Hill_Giant_Strength')],
    voies: [],
    masquerObjets: true,
  },
  {
    id: 'ethel-cheveu',
    categorie: 'choix-de-quete',
    objets: ['auntie-ethels-hair'],
    zone: 'antre-ethel',
    evenement: 'ethel-tuee-avant-cheveu',
    irreversible: true,
    severite: 'bloquant',
    portee: 'obligatoire',
    confiance: 'verifie',
    libelleDiscret: 'Choix de quête à vérifier',
    discret: 'Cet objet ne s’obtient que par une issue précise de la quête, jamais en forçant le combat trop tôt.',
    detail:
      'Le wiki : le Cheveu s’obtient par le dialogue en plein combat ou par un marché dans l’Antre, après quoi Ethel disparaît ; si elle est tuée avant la scène de l’Antre, il n’est pas obtenable. C’est une ressource unique de la run, réservée au Sorcier : les copies d’équipement ne dupliquent pas le bonus permanent.',
    sources: [wikiObjet('Auntie_Ethel%27s_Hair')],
    voies: [],
    masquerObjets: true,
  },
  {
    id: 'akabi-jungle',
    categorie: 'acces-conditionnel',
    objets: ['nyrulna', 'band-mystic-scoundrel'],
    zone: 'cirque-derniers-jours',
    evenement: null,
    irreversible: false,
    severite: 'info',
    portee: 'methode',
    confiance: 'verifie',
    libelleDiscret: 'Accès conditionnel à une zone annexe',
    discret: 'Deux objets se trouvent dans une zone annexe accessible par un événement du lieu.',
    detail:
      'Le wiki place les deux objets dans la jungle, atteinte via Akabi après le jackpot : le personnage qui lui parle y est téléporté. Nyrulna est dans un coffre peint verrouillé près du portail de sortie (X -1511, Y -1522, crochetage DD 20) ; la Band of the Mystic Scoundrel est dans un sac à dos distinct (X -1566, Y -1522). Deux contenants différents : fouiller l’un ne remplace pas l’autre. Aucune sortie irréversible n’est établie.',
    sources: [wikiObjet('Nyrulna'), wikiObjet('Band_of_the_Mystic_Scoundrel')],
    voies: [],
    masquerObjets: true,
  },
  {
    id: 'creche-arcane-synergy',
    categorie: 'recuperation-avant-sortie',
    objets: ['ring-arcane-synergy'],
    zone: 'creche-yllek',
    evenement: 'depart-creche-yllek',
    irreversible: false,
    severite: 'attention',
    portee: 'precaution',
    confiance: 'a-verifier',
    libelleDiscret: 'Objet à récupérer avant de quitter la zone',
    discret: 'La fiche conseille de le prendre avant de quitter définitivement la zone.',
    detail:
      'La fiche d’équipe demande de récupérer l’anneau sur Gish Far’aag avant de quitter la Crèche. Aucune source recoupée ne confirme que la zone se ferme : précaution, pas condition établie.',
    sources: [wikiObjet('Ring_of_Arcane_Synergy'), { libelle: FICHE, url: null }],
    voies: [],
    masquerObjets: false,
  },
  {
    id: 'rolan-lorroakan',
    categorie: 'achat-avant-evenement',
    objets: ['ring-of-regeneration', 'vest-soul-rejuvenation'],
    zone: 'sorcelleries-sundries',
    evenement: null,
    irreversible: false,
    severite: 'attention',
    portee: 'precaution',
    confiance: 'a-verifier',
    libelleDiscret: 'Achat dépendant d’un conflit à vérifier',
    discret: 'Ces achats dépendent du parcours d’un marchand : acheter avant la résolution du conflit.',
    detail:
      'La fiche d’équipe indique que ces deux objets dépendent du parcours de Rolan / Lorroakan et conseille d’acheter avant de résoudre leur conflit. Non recoupé : à vérifier sur votre version.',
    sources: [wikiObjet('Ring_of_Regeneration'), { libelle: FICHE, url: null }],
    voies: [],
    masquerObjets: false,
  },
  {
    id: 'kagha-broodmother',
    categorie: 'choix-de-quete',
    objets: ['broodmothers-revenge'],
    zone: 'bosquet-emeraude',
    evenement: null,
    irreversible: false,
    severite: 'attention',
    portee: 'methode',
    confiance: 'a-verifier',
    libelleDiscret: 'Choix de quête à vérifier',
    discret: 'Cet objet dépend de la résolution d’une quête du Bosquet.',
    detail:
      'La fiche d’équipe lie l’amulette à la résolution de la quête de Kagha, sans provoquer de massacre. Aucune interdiction précise n’est établie par les sources : ne pas l’interpréter comme un « ne pas tuer X ».',
    sources: [wikiObjet('Broodmother%27s_Revenge'), { libelle: FICHE, url: null }],
    voies: [],
    masquerObjets: false,
  },
]

export function conditionDe(id) {
  return CONDITIONS.find((condition) => condition.id === id) ?? null
}

export function evenementDe(id) {
  return EVENEMENTS.find((evenement) => evenement.id === id) ?? null
}
