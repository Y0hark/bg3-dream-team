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
//   déclarés par l'utilisateur ; chaque `id` est un événement 'constat' ;
//
// Extension du Follow-up 3/4 (tous les champs sont optionnels et rétro-compatibles) :
// - zonesAlerte : zones EN AMONT où la même alerte doit déjà apparaître (une
//   seule condition, pas une alerte par zone) ; `actions` : geste concret de
//   préservation par zone (`action` : valeur par défaut) ;
// - fermetures : événements qui ferment la condition (si `irreversible`). Un
//   élément est un id (OU) ou un tableau d'ids (ET : tous déclarés). Absent,
//   `evenement` joue ce rôle comme avant ;
// - methodes : méthodes d'obtention alternatives (OU). Chacune a ses propres
//   `fermetures` ; la condition n'est « non satisfaite » que si TOUTES sont
//   fermées (et `irreversible`). Une méthode fermée n'éteint jamais les autres ;
// - etapes : jalons ordonnés, déclarés par l'utilisateur (événements 'constat').
//   Ils montrent où l'on en est ; ils ne satisfont JAMAIS la condition (seuls
//   l'original, une voie ou « fait » le font) ; `finale` nomme la dernière
//   marche (l'achat/obtention de l'original) ;
// - nonExigences : ce qui n'est PAS requis (évite les préalables inventés) ;
// - inconnus : faits que l'audit n'a pas pu établir ;
// - preuves : {page, rev} renvoyant à docs/audit-acquisitions.json ; toute
//   condition `verifie` doit en citer au moins une (garde dans les tests).
//
// Catégorie sans entrée : `compagnon-requis`. Aucun cas sourcé n'a été trouvé ;
// elle n'est pas inventée (cf. docs/contrat-donnees-objets.md). `compagnon-presence`
// couvre la proximité ou l'absence d'un compagnon (jamais « requis » par défaut).
//
// Hotfix : le jeu évolue ; une condition `verifie` l'est à la date indiquée,
// pas pour toutes les versions.
// ------------------------------------------------------------------

export const DATE_VERIFICATION = '2026-10-31'

// Conditions dont le sens a changé au Follow-up 3/4 : un « fait » déclaré avant
// ne vaut pas pour la nouvelle définition (voir acquisition-etat.js).
export const CONDITIONS_REDEFINIES = ['dammon-survie', 'dammon-achats-acte2', 'chapeau-acuite-boeuf', 'rolan-lorroakan']

export const CATEGORIES = {
  'compagnon-requis': { nom: 'Compagnon requis', court: 'Compagnon' },
  'compagnon-presence': { nom: 'Présence d’un compagnon', court: 'Compagnon' },
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
  // Dammon : jalons (constat) et fermetures (depart) restent séparés. Un jalon passé ne prouve pas la survie ensuite.
  { id: 'refugies-sauves', nom: 'Quête des réfugiés terminée : réfugiés sauvés (jalon, pas une garantie pour la suite)', nature: 'constat', zone: 'bosquet-emeraude' },
  { id: 'refugies-condamnes', nom: 'Bosquet quitté sans avoir résolu la quête des réfugiés (réfugiés tués, Bosquet scellé)', nature: 'depart', zone: 'bosquet-emeraude' },
  { id: 'isobel-sauvee-marcus', nom: 'Isobel sauvée face à Marcus (jalon : l’auberge peut encore tomber ensuite)', nature: 'constat', zone: 'auberge-derniere-lumiere' },
  { id: 'isobel-perdue', nom: 'Isobel capturée ou tuée : l’auberge tombe', nature: 'depart', zone: 'auberge-derniere-lumiere' },
  { id: 'chantenuit-tuee', nom: 'Chant de la nuit tuée : la protection de l’auberge s’effondre', nature: 'depart', zone: 'auberge-derniere-lumiere' },
  { id: 'dammon-mort', nom: 'Dammon mort (quelle qu’en soit la cause)', nature: 'constat', zone: 'auberge-derniere-lumiere' },
  { id: 'shadowfell-entre', nom: 'Shadowfell atteint (Gantelet de Shar) : plus de fabrication chez Dammon', nature: 'depart', zone: 'auberge-derniere-lumiere' },
  // Bœuf étrange : rencontrer vivant est un jalon (boeuf-vu-*), jamais une preuve d'objet.
  { id: 'boeuf-aide-acte3', nom: 'Bœuf « aidé » à Rivington (il laisse l’anneau, pas le chapeau)', nature: 'depart', zone: 'rivington' },
  // Omeluum : rencontre → quête terminée → commerce → achat de l'original.
  { id: 'omeluum-rencontre', nom: 'Omeluum rencontré (via Blurg)', nature: 'constat', zone: 'grotte-ebonlake' },
  { id: 'omeluum-quete-finie', nom: 'Quête d’Omeluum terminée (ingrédients, potion, anneau obtenu)', nature: 'constat', zone: 'grotte-ebonlake' },
  { id: 'omeluum-commerce-ouvert', nom: 'Commerce d’Omeluum ouvert', nature: 'constat', zone: 'grotte-ebonlake' },
  { id: 'omeluum-quitte-sans-aide', nom: 'Colonie quittée sans terminer la quête d’Omeluum', nature: 'depart', zone: 'grotte-ebonlake' },
  // Ferg : proximité d'un compagnon et état narratif, déclarés séparément.
  { id: 'ombrecoeur-rejete-shar', nom: 'Ombrecœur a rejeté Shar (état narratif)', nature: 'constat', zone: 'rivington' },
  { id: 'ombrecoeur-proche-ferg', nom: 'Dialogue avec Ferg tenu avec Ombrecœur à proximité', nature: 'depart', zone: 'rivington' },
  // Rolan / Lorroakan : l'état de chacun, pas « le conflit ».
  { id: 'rolan-mort', nom: 'Rolan mort ou absent', nature: 'constat', zone: 'sorcelleries-sundries' },
  { id: 'lorroakan-mort', nom: 'Lorroakan mort ou absent', nature: 'constat', zone: 'sorcelleries-sundries' },
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
    zonesAlerte: ['bosquet-emeraude', 'rivington'],
    evenement: null,
    methodes: [
      { id: 'ultime-lueur', libelle: 'Tuer le bœuf à l’Ultime Lueur (Acte II)', fermetures: ['isobel-perdue', 'chantenuit-tuee'] },
      { id: 'rivington', libelle: 'Tuer le bœuf à Rivington (Acte III)', fermetures: ['boeuf-aide-acte3'] },
    ],
    irreversible: true,
    severite: 'attention',
    portee: 'methode',
    confiance: 'verifie',
    libelleDiscret: 'Un personnage non-joueur porte cet objet',
    discret: 'Un personnage rencontré tôt porte cet objet plus tard : ne pas le tuer trop tôt, et ne pas confondre rencontre et butin.',
    action: 'Ne pas le tuer en Acte I. L’objet ne vient que de son butin plus tard : le rencontrer vivant ne suffit pas.',
    detail:
      'Le wiki : le chapeau n’est obtenu que si le bœuf est tué en Acte II ou III. Le tuer au Bosquet ne donne que l’anneau du Shapeshifter ; « Aider le bœuf diabolique » (Acte III) laisse l’anneau ou une potion, pas le chapeau. Deux rendez-vous, un seul bœuf : Ultime Lueur (forge de Dammon) ou colline de Rivington. Si la protection de l’auberge tombe, le bœuf disparaît mais survit et se retrouve plus tard : la voie de Rivington reste ouverte. L’avoir rencontré vivant est un jalon, pas une preuve d’obtention.',
    etapes: [
      { id: 'boeuf-vu-ultime-lueur', libelle: 'Bœuf rencontré vivant à l’Ultime Lueur' },
      { id: 'boeuf-vu-rivington', libelle: 'Bœuf rencontré vivant à Rivington' },
    ],
    finale: 'Tuer le bœuf et ramasser le chapeau',
    nonExigences: ['Le bœuf n’est pas à protéger de Dammon : aucune page lue n’établit ce lien.'],
    inconnus: ['L’effet exact d’une mort en Acte I sur les rendez-vous suivants n’est pas détaillé par le wiki.'],
    preuves: [
      { page: 'Strange_Ox', rev: '434001' },
      { page: 'Hat_of_Fire_Acuity', rev: '419370' },
    ],
    sources: [wikiObjet('Hat_of_Fire_Acuity'), wikiObjet('Strange_Ox'), { libelle: FICHE, url: null }],
    voies: [],
    masquerObjets: true,
  },
  {
    id: 'dammon-forge-helldusk',
    categorie: 'achat-avant-evenement',
    objets: ['flawed-helldusk-gloves'],
    zone: 'auberge-derniere-lumiere',
    evenement: 'shadowfell-entre',
    irreversible: true,
    severite: 'bloquant',
    portee: 'obligatoire',
    confiance: 'verifie',
    libelleDiscret: 'Fabrication à faire avant un point de non-retour',
    discret: 'Cet objet se fait fabriquer, il ne s’achète pas : à faire avant d’entrer dans la zone suivante de l’acte.',
    action: 'Réunir les matériaux et faire forger les pièces avant d’entrer dans le Shadowfell.',
    detail:
      'Le wiki : en Acte II, toute fabrication spéciale chez Dammon ne se fait qu’avant d’entrer dans le Shadowfell (Gantelet de Shar) ; ensuite, s’il survit, seul son commerce reste. Les Flawed Helldusk Gloves se fabriquent contre un Fer ou Alliage infernal par pièce (les mêmes sources servent aux améliorations du cœur de Karlach). Cette échéance n’est PAS la fin de l’acte et ne concerne que la fabrication, pas le stock vendu.',
    inconnus: ['Où trouver chaque pièce d’Infernal Iron et lesquelles sont réservées à Karlach : non établi.'],
    preuves: [
      { page: 'Dammon', rev: '414844' },
      { page: 'Flawed_Helldusk_Gloves', rev: '418596' },
    ],
    sources: [wikiObjet('Dammon'), wikiObjet('Flawed_Helldusk_Gloves')],
    voies: [],
    masquerObjets: false,
  },
  {
    id: 'dammon-achats-acte2',
    categorie: 'achat-avant-evenement',
    objets: ['charge-bound-warhammer', 'darkfire-shortbow'],
    zone: 'auberge-derniere-lumiere',
    evenement: 'colonie-illithid',
    irreversible: false,
    severite: 'attention',
    portee: 'precaution',
    confiance: 'verifie',
    libelleDiscret: 'Marchand bientôt indisponible',
    discret: 'Un marchand de l’acte quitte la zone avant la fin de l’acte : acheter avant.',
    action: 'Acheter ces deux objets avant d’entrer dans la colonie illithid.',
    detail:
      'Le wiki : Dammon devient indisponible à l’entrée de la colonie illithid, vers la fin de l’Acte II, puis réapparaît dans la Basse-Ville en Acte III. Aucune source lue ne dit que les achats d’Acte II sont alors perdus : la condition ne passe pas en « impossible » à la déclaration. Cette échéance ne concerne que le stock d’Acte II ; les stocks d’Acte III dépendent de la survie de Dammon (autre alerte).',
    preuves: [
      { page: 'Dammon', rev: '414844' },
      { page: 'Charge-Bound_Warhammer', rev: '416997' },
    ],
    sources: [wikiObjet('Dammon')],
    voies: [],
    masquerObjets: false,
  },
  {
    id: 'dammon-survie',
    categorie: 'pnj-a-sauver',
    objets: [
      'flawed-helldusk-gloves',
      'charge-bound-warhammer',
      'darkfire-shortbow',
      'armour-of-persistence',
      'boots-of-persistence',
      'legacy-of-the-masters',
    ],
    zone: 'forge-des-neuf',
    zonesAlerte: ['bosquet-emeraude', 'auberge-derniere-lumiere'],
    evenement: null,
    fermetures: ['refugies-condamnes', 'isobel-perdue', 'chantenuit-tuee', 'dammon-mort'],
    irreversible: true,
    severite: 'bloquant',
    portee: 'obligatoire',
    confiance: 'verifie',
    libelleDiscret: 'Marchand à garder en vie sur trois actes',
    discret: 'Le sort d’un marchand se joue dès l’Acte I : ne pas quitter une zone avant d’avoir réglé la quête qui le concerne.',
    action: 'Régler la quête de survie de la zone avant de la quitter (voir le geste propre à cette zone) ; ne rien tenir pour acquis à cause d’un jalon passé.',
    actions: {
      'bosquet-emeraude':
        'Avant de quitter le Bosquet : régler la quête des réfugiés (chefs gobelins vaincus, Kagha réglée) ; ne pas prendre le Sentier de Rosemorne ni l’ascenseur de Grymforge avant. Acheter aux marchands du Bosquet tant qu’il est ouvert.',
      'auberge-derniere-lumiere':
        'Protéger l’auberge : sauver Isobel et ne pas tuer le Chant de la nuit. Acheter et faire forger chez Dammon avant les échéances de la zone.',
      'forge-des-neuf': 'Acheter ici : c’est le stock d’Acte III, qui suppose que Dammon a survécu de bout en bout.',
    },
    detail:
      'Dammon doit survivre à trois niveaux distincts. (1) Acte I : la quête « Sauver les réfugiés » doit être résolue ; partir pour le Sentier de Rosemorne ou l’ascenseur de Grymforge sans l’avoir fait la fait échouer (réfugiés tués, Bosquet scellé). Arrêter le rituel ne suffit pas : les gobelins doivent être vaincus. (2) Acte II : si Isobel est capturée ou tuée, ou si le Chant de la nuit est tué, l’auberge tombe et ses occupants sont tués ou maudits, Dammon compris s’il est vivant. (3) Entre les actes : il est indisponible de l’entrée dans la colonie illithid jusqu’à la Basse-Ville. Les jalons ne se substituent pas à l’état présent : « réfugiés sauvés » ou « Isobel sauvée face à Marcus » n’empêchent pas une perte ultérieure (par exemple la mort du Chant de la nuit). Stocks : Acte II (marteau, arc) et fabrication Helldusk à l’Ultime Lueur, Acte III (armure, bottes, Legacy) à la Forge des Neuf.',
    etapes: [
      { id: 'refugies-sauves', libelle: 'Réfugiés sauvés (Acte I)' },
      { id: 'isobel-sauvee-marcus', libelle: 'Isobel sauvée face à Marcus (Acte II)' },
    ],
    finale: 'Acheter ou faire fabriquer l’original chez Dammon',
    nonExigences: [
      'Karlach n’est pas exigée pour le commerce ordinaire.',
      'Les réfugiés de l’Acte I ne sont pas les prisonniers de l’Acte II : Dammon dépend des premiers.',
    ],
    inconnus: [
      'Si Dammon est présent mais l’auberge est perdue après un achat déjà fait : aucun passage lu ne dit que l’achat est repris.',
      'Mattis, Talli et les autres occupants suivent le même sort par inférence (même lieu), pas par un passage établi.',
    ],
    preuves: [
      { page: 'Save_the_Refugees', rev: '422653' },
      { page: 'Zevlor', rev: '439369' },
      { page: 'Resolve_the_Abduction', rev: '422327' },
      { page: 'Isobel', rev: '431344' },
      { page: 'Dammon', rev: '414844' },
    ],
    sources: [
      wikiObjet('Dammon'),
      wikiObjet('Save_the_Refugees'),
      wikiObjet('Resolve_the_Abduction'),
      wikiObjet('Isobel'),
    ],
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
    preuves: [{ page: 'Roah_Moonglow', rev: '431417' }],
    voies: [],
    masquerObjets: false,
  },
  {
    id: 'ethel-elixirs',
    categorie: 'achat-avant-evenement',
    objets: ['elixir-hill-giant-strength'],
    zone: 'antre-ethel',
    evenement: 'ethel-revelee',
    irreversible: false,
    severite: 'attention',
    portee: 'methode',
    confiance: 'verifie',
    libelleDiscret: 'Achat à faire avant un événement de quête',
    discret: 'La boutique se ferme définitivement à un moment précis de la quête : acheter avant.',
    detail:
      'Le wiki indique que la boutique d’Ethel reste indisponible pour le reste du jeu dès qu’elle montre sa vraie forme, se retire ou meurt. Elle propose trois élixirs de Force de géant des collines, renouvelés au repos long ou au passage de niveau : le stock du Moine se prépare donc avant ce moment. L’élixir est aussi vendu par d’autres marchands (dont Entharl Danthelon) et se fabrique : seule la pile d’Ethel disparaît, la source la plus précoce reste donc la seule à surveiller. Un élixir ne dupliquera pas un bonus permanent par une copie.',
    sources: [wikiObjet('Auntie_Ethel'), wikiObjet('Elixir_of_Hill_Giant_Strength')],
    preuves: [{ page: 'Auntie_Ethel', rev: '439151' }, { page: 'Elixir_of_Hill_Giant_Strength', rev: '438919' }],
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
    preuves: [{ page: 'Auntie_Ethel', rev: '439151' }, { page: 'Auntie_Ethel\'s_Hair', rev: '426001' }],
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
      'Le wiki place les deux objets dans la jungle, atteinte via Akabi après le jackpot : le personnage qui lui parle y est téléporté. Nyrulna est dans un coffre peint verrouillé près du portail de sortie (X -1511, Y -1522, crochetage DD 20) ; la Band of the Mystic Scoundrel est dans un sac à dos distinct (X -1566, Y -1522). Deux contenants différents : fouiller l’un ne remplace pas l’autre. Le jackpot est une occasion unique : le jeu ferme après un jackpot ou 16 tours (500 po par tour), et voler la bague ou distraire en Barde exclut les lots de consolation. Aucune sortie de zone irréversible n’est établie.',
    sources: [wikiObjet('Nyrulna'), wikiObjet('Band_of_the_Mystic_Scoundrel')],
    preuves: [{ page: 'Akabi', rev: '425239' }],
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
    id: 'rolan-lorroakan-anneau',
    categorie: 'acces-conditionnel',
    objets: ['ring-of-regeneration'],
    zone: 'sorcelleries-sundries',
    evenement: null,
    methodes: [
      { id: 'rolan', libelle: 'Acheter à Rolan (ou sur lui dans la tour si Lorroakan est mort)', fermetures: ['rolan-mort'] },
      { id: 'lorroakan', libelle: 'Acheter à la projection de Lorroakan', fermetures: ['lorroakan-mort'] },
    ],
    irreversible: true,
    severite: 'attention',
    portee: 'methode',
    confiance: 'verifie',
    libelleDiscret: 'Achat dépendant de deux marchands',
    discret: 'Deux personnages peuvent vendre cet objet ; il n’est perdu que si aucun des deux n’est là.',
    action: 'Ne pas supprimer les deux marchands avant d’avoir l’anneau ; si un seul reste, acheter sans attendre.',
    detail:
      'Le wiki distingue quatre états. Les deux vivants : Rolan vend. Rolan mort : la projection de Lorroakan vend. Lorroakan mort, Rolan vivant : l’anneau est porté par Rolan dans la tour et peut disparaître. Les deux morts ou absents : l’anneau est indisponible. Une méthode fermée ne ferme donc pas l’autre.',
    preuves: [{ page: 'Ring_of_Regeneration', rev: '422391' }],
    sources: [wikiObjet('Ring_of_Regeneration')],
    voies: [],
    masquerObjets: false,
  },
  {
    id: 'rolan-lorroakan',
    categorie: 'acces-conditionnel',
    objets: ['vest-soul-rejuvenation', 'birthright'],
    zone: 'sorcelleries-sundries',
    evenement: null,
    methodes: [
      { id: 'rolan', libelle: 'Rolan : à l’accueil, ou via l’option de commerce du dialogue dans la tour', fermetures: ['rolan-mort'] },
      { id: 'lorroakan', libelle: 'Projection de Lorroakan à l’accueil', fermetures: ['lorroakan-mort'] },
    ],
    irreversible: false,
    severite: 'info',
    portee: 'methode',
    confiance: 'verifie',
    libelleDiscret: 'Achat dépendant de deux marchands',
    discret: 'Ces objets s’achètent à l’un ou à l’autre de deux marchands.',
    action: 'Acheter tant qu’au moins un des deux est présent.',
    detail:
      'Gilet : vendu par la projection de Lorroakan si Rolan est mort, ou par Rolan via l’option de commerce du dialogue dans la tour si Lorroakan est mort. Birthright : vendu par la projection de Lorroakan ou par Rolan à l’accueil. Le wiki ne dit pas ce qu’il advient de ces deux objets si les deux marchands sont absents : l’état « tous deux absents » reste donc à vérifier, sans conclure à l’impossible.',
    inconnus: ['Birthright et gilet quand Rolan et Lorroakan sont tous deux absents : non documenté (seul l’anneau a un tableau complet).'],
    preuves: [
      { page: 'Vest_of_Soul_Rejuvenation', rev: '424641' },
      { page: 'Birthright', rev: '416461' },
    ],
    sources: [wikiObjet('Vest_of_Soul_Rejuvenation'), wikiObjet('Birthright')],
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
      'Le wiki : l’amulette est portée par Kagha dans le Bosquet (morte ou assommée sans la tuer). Une seconde source est listée (table de Koll). La récompense de la quête de Kagha concerne Hellrider’s Pride, pas l’amulette. Aucune interdiction précise n’est établie : ne pas l’interpréter comme un « ne pas tuer X ».',
    sources: [wikiObjet('Broodmother%27s_Revenge'), { libelle: FICHE, url: null }],
    preuves: [{ page: 'Broodmother\'s_Revenge', rev: '431623' }],
    voies: [],
    masquerObjets: false,
  },
  {
    id: 'omeluum-commerce',
    categorie: 'acces-conditionnel',
    objets: ['boots-stormy-clamour', 'shadespell-circlet', 'pearl-of-power-amulet', 'amulet-misty-step'],
    zone: 'grotte-ebonlake',
    evenement: 'omeluum-quitte-sans-aide',
    irreversible: false,
    severite: 'attention',
    portee: 'methode',
    confiance: 'verifie',
    libelleDiscret: 'Marchand à débloquer par une quête',
    discret: 'Ce marchand ne vend qu’après une quête précise : le rencontrer ne suffit pas.',
    action: 'Terminer la quête avant de quitter la colonie, puis acheter en Acte I.',
    detail:
      'Le wiki : Omeluum se rencontre via Blurg, mais ne commerce qu’après « Aider Omeluum à enquêter sur le parasite ». La quête demande Langue de folie et Spores de Timmask ; la Tour arcanique n’est pas obligatoire (spores ramassées près d’un champignon Timmask, Langue de folie achetée à Derryth Bonecloak). La potion échoue, puis l’anneau de Mind-Shielding s’achète ou s’obtient par jets : l’obtenir, par n’importe quel moyen, termine la quête et ouvre le commerce. Quitter la zone avant la fin clôt la quête sans aide. Sauver Omeluum en Acte III n’est pas une condition d’achat et ne rend rien : une fois sauvé, il n’est plus marchand. L’Amulet of Misty Step n’existe qu’en un exemplaire : coffre doré de Polma (Temple profané) ou stock d’Omeluum, selon le premier atteint.',
    etapes: [
      { id: 'omeluum-rencontre', libelle: 'Omeluum rencontré' },
      { id: 'omeluum-quete-finie', libelle: 'Quête terminée (ingrédients, potion, anneau)' },
      { id: 'omeluum-commerce-ouvert', libelle: 'Commerce ouvert' },
    ],
    finale: 'Acheter l’original à Omeluum',
    nonExigences: [
      'La visite de la Tour arcanique n’est pas obligatoire.',
      'Le sauvetage d’Omeluum en Acte III n’est pas un préalable d’achat.',
    ],
    inconnus: ['On ne sait pas si Omeluum commerce encore quand le groupe a quitté la colonie sans terminer la quête puis y revient.'],
    preuves: [
      { page: 'Help_Omeluum_Investigate_the_Parasite', rev: '419477' },
      { page: 'Omeluum', rev: '428216' },
      { page: 'Amulet_of_Misty_Step', rev: '415916' },
    ],
    sources: [wikiObjet('Omeluum'), wikiObjet('Help_Omeluum_Investigate_the_Parasite')],
    voies: [],
    masquerObjets: false,
  },
  {
    id: 'ferg-ombrecoeur',
    categorie: 'compagnon-presence',
    objets: ['hellrider-longbow', 'robe-supreme-defences'],
    zone: 'rivington',
    evenement: null,
    fermetures: [['ombrecoeur-rejete-shar', 'ombrecoeur-proche-ferg']],
    irreversible: true,
    severite: 'bloquant',
    portee: 'methode',
    confiance: 'verifie',
    libelleDiscret: 'Présence d’un compagnon à surveiller',
    discret: 'Un marchand réagit à la présence d’un compagnon : acheter avant son dialogue, compagnon à l’écart.',
    action: 'Acheter chez Ferg avant son dialogue en éloignant Ombrecœur de lui.',
    detail:
      'Le wiki : si Ombrecœur a rejeté Shar et se trouve à proximité pendant le dialogue, Ferg la menace puis s’en va définitivement, fermant son commerce. Si elle a embrassé Shar, sa présence contourne au contraire le jet de Persuasion du stock spécial. La Robe of Supreme Defences est dans ce stock spécial (Persuasion sans Ombrecœur proche, ou Parler aux morts sur le cadavre de réfugié au nord-est de Rivington pour l’anneau sans gemme) ; le Hellrider Longbow est dans le stock normal.',
    nonExigences: ['Ombrecœur n’est pas requise : la précaution est de l’éloigner avant le dialogue.'],
    inconnus: ['La portée exacte de « à proximité » (distance) n’est pas indiquée.'],
    preuves: [
      { page: 'Ferg_Drogher', rev: '425473' },
      { page: 'Hellrider_Longbow', rev: '438372' },
    ],
    sources: [wikiObjet('Ferg_Drogher'), wikiObjet('Hellrider_Longbow')],
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
