// ------------------------------------------------------------------
// Loadouts par rôle, par acte et par slot — l'EMPLOI des objets de objets.js.
//
// Une ligne = « ce rôle, à cet acte, sur ce slot, recommande cet objet à ce
// rang ». Un même objet peut apparaître pour plusieurs rôles : en mode copies
// (COPIES_AUTORISEES), ce n'est pas un conflit — l'original acquis, les
// exemplaires disponibles et l'équipement effectif sont trois choses
// distinctes (src/lib/copies.js).
//
// Champs d'une ligne :
// - role : id d'un build actif (builds.js) ;
// - acte, jusquA : la ligne vaut de `acte` à `jusquA` inclus (défaut : acte) ;
//   un objet gardé d'un acte à l'autre n'est donc écrit qu'une fois ;
// - slot : un des SLOTS_LOADOUT ;
// - objet : id de objets.js, ou null pour un slot volontairement libre
//   (« rien d'indispensable à acheter ») ;
// - rang : principal | alternative | situationnel | reserve ;
// - interet : pourquoi ; condition : ce qui doit être vrai pour que l'effet
//   existe (null si aucune).
//
// Seul le rang `principal` est contraint par les limites de slots : une
// amulette, une cape, une armure, deux anneaux par personnage. Une
// alternative n'est pas un second équipement porté en même temps.
// ------------------------------------------------------------------

export const RANGS = ['principal', 'alternative', 'situationnel', 'reserve']

export const SLOTS_LOADOUT = [
  'Arme',
  'Bouclier',
  'Casque',
  'Cape',
  'Armure',
  'Gants',
  'Bottes',
  'Amulette',
  'Anneau',
  'Arme à distance',
  'Consommable',
]

/** Nombre d'objets portés en même temps, par slot (rang principal). */
export const LIMITES_SLOTS = {
  Arme: 1,
  Bouclier: 1,
  Casque: 1,
  Cape: 1,
  Armure: 1,
  Gants: 1,
  Bottes: 1,
  Amulette: 1,
  Anneau: 2,
  'Arme à distance': 1,
  Consommable: 2,
}

/** Slots qu'un loadout complet doit couvrir à chaque acte (objet ou « libre »). */
export const SLOTS_REQUIS = ['Arme', 'Casque', 'Cape', 'Armure', 'Gants', 'Bottes', 'Amulette', 'Anneau']

/** Types de dégâts que chaque rôle fait vraiment — voir `offensif` dans objets.js. */
export const STYLES_ROLES = {
  'sorcier-feu': ['sorts'],
  'paladin-hexblade': ['arme'],
  'moine-main-ouverte': ['poings'],
  'sidekick-savoir-vie': ['sorts'],
}

const P = 'principal'
const A = 'alternative'
const S = 'situationnel'
const R = 'reserve'

const e = (slot, objet, rang, interet, options = {}) => ({
  slot,
  objet,
  rang,
  interet,
  condition: options.si ?? null,
  jusquA: options.jusqua ?? null,
})

const LIBRE = (slot, interet, options = {}) => e(slot, null, P, interet, options)

const L = (role, acte, lignes) => lignes.map((ligne) => ({ role, acte, ...ligne }))

export const LOADOUTS = [
  // ================================================================
  // Sorcier feu — Rayon ardent, Acuité, DD
  // ================================================================
  ...L('sorcier-feu', 1, [
    e('Arme', 'the-spellsparkler', P, 'Charges de foudre générées par les dégâts de sorts.', { jusqua: 2, si: 'Sauvetage de Florrick mené à bien.' }),
    e('Arme', 'melfs-first-staff', A, 'Repli accessible : +1 aux attaques de sorts et au DD.', { jusqua: 2 }),
    e('Casque', 'the-lifebringer', P, 'Protection liée aux charges de foudre.', { si: 'Surtout avec Spellsparkler.' }),
    e('Casque', 'shadespell-circlet', A, '+1 DD dans l’ombre : aide les sorts à sauvegarde.'),
    e('Armure', 'protecty-sparkswall', P, '+1 DD ; CA et sauvegardes avec des charges de foudre.', { jusqua: 2 }),
    e('Gants', 'bracers-of-defence', P, '+2 CA sans armure ni bouclier.', { jusqua: 2 }),
    e('Gants', 'gloves-of-dexterity', A, 'DEX fixée à 18 et +1 aux attaques.', { jusqua: 2, si: 'Rétablir une DEX naturelle correcte avant de les remplacer.' }),
    e('Gants', 'daredevil-gloves', A, '+1 aux attaques de sorts.', { jusqua: 2 }),
    e('Bottes', 'disintegrating-night-walkers', P, 'Mobilité et protections contre les entraves.', { jusqua: 3 }),
    e('Bottes', 'boots-stormy-clamour', A, 'Réverbération avec les conditions infligées.', { jusqua: 3, si: 'Les sorts retenus infligent réellement des conditions.' }),
    e('Amulette', 'amulet-misty-step', P, 'Mobilité d’urgence.'),
    e('Amulette', 'pearl-of-power-amulet', R, 'Un emplacement jusqu’au niveau 3 récupéré hors combat.', { si: 'À utiliser puis remplacer par l’amulette de combat.' }),
    e('Amulette', 'necklace-elemental-augmentation', R, 'Renforce Trait de feu ou Rayon de givre, pas Rayon ardent.'),
    e('Anneau', 'ring-of-protection', P, '+1 CA et sauvegardes.', { si: 'Quête de l’idole résolue sans guerre au Bosquet.' }),
    e('Anneau', 'crushers-ring', P, '+3 m de déplacement, appréciable sur un Halfelin.'),
    e('Arme à distance', 'bow-of-awareness', P, 'Initiative passive.', { jusqua: 2 }),
    LIBRE('Cape', 'Rien d’indispensable : ne pas dépenser de ressources pour remplir la case.'),
    e('Consommable', 'auntie-ethels-hair', P, '+1 CHA permanent, réservé au Sorcier.', { jusqua: 3, si: 'Attribué à ce rôle ; pas dupliqué par les copies.' }),
  ]),
  ...L('sorcier-feu', 2, [
    e('Casque', 'hat-of-fire-acuity', P, 'Chaque rayon touché monte l’Acuité : fiabilise les attaques et prépare les contrôles à DD élevé.', { jusqua: 3, si: 'Étrange bœuf laissé vivant au Bosquet ; combat près de Dammon préparé.' }),
    e('Casque', 'fistbreaker-helm', A, '+1 DD et +1 initiative si le chapeau est inaccessible.', { jusqua: 3 }),
    e('Cape', 'cloak-of-protection', P, '+1 CA et sauvegardes.'),
    e('Armure', 'robe-exquisite-focus', A, '+1 DD, si Sparkswall est attribuée ailleurs.'),
    e('Gants', 'gloves-belligerent-skies', S, 'Réverbération avec foudre, tonnerre ou radiant.', { jusqua: 3, si: 'Le feu seul ne les déclenche pas.' }),
    e('Amulette', 'spineshudder-amulet', P, 'Réverbération sur les attaques de sorts à distance : excellente avec Rayon ardent.', { jusqua: 3 }),
    e('Amulette', 'spellcrux-amulet', R, 'Récupère un emplacement de n’importe quel niveau, hors combat.', { jusqua: 3 }),
    e('Amulette', 'amulet-of-the-harpers', A, 'Protection des sauvegardes de SAG.'),
    e('Anneau', 'callous-glow-ring', P, '+2 radiant contre cibles illuminées, profite des impacts multiples.', { jusqua: 3, si: 'Retirer contre un ennemi qui punit le radiant.' }),
    e('Anneau', 'coruscation-ring', P, 'Orbe radieux sur les dégâts de sorts.', { jusqua: 3, si: 'Lumière lancée sur le porteur ; éclairage des cibles vérifié.' }),
    e('Anneau', 'ring-mental-inhibition', S, 'Enchaîne les contrôles à sauvegarde.', { jusqua: 3, si: 'Remplace Callous Glow ou Coruscation ; Rayon ardent seul ne le déclenche pas.' }),
    e('Anneau', 'ring-spiteful-thunder', S, 'Hébétement sur cible sous Réverbération.', { jusqua: 3, si: 'DD 13 fixe ; non garanti sans test.' }),
    e('Cape', 'cloak-elemental-absorption', S, 'Absorption des éléments contre un danger élémentaire prévu.', { si: 'Consomme la réaction (concurrence Bouclier / Contresort) ; ne se cumule pas avec une résistance existante.' }),
    e('Arme à distance', 'darkfire-shortbow', A, 'Résistances feu/froid et Hâte journalière.', { si: 'Choisir entre initiative et défenses selon le combat.' }),
  ]),
  ...L('sorcier-feu', 3, [
    e('Arme', 'markoheshkir', P, 'Enchantement de sorts, Batterie arcanique ; Bolts of Doom comme plan sans Chaleur.', { si: 'Flame of Wrath génère de la Chaleur : ne pas équiper machinalement.' }),
    e('Arme', 'staff-of-spellpower', A, '+1 aux attaques de sorts et au DD, Batterie arcanique.'),
    e('Arme', 'rhapsody', S, 'Jusqu’à +3 attaques, dégâts et DD après éliminations.', { si: 'Dual Wielder pris au niveau 12 (route Cheveu).' }),
    e('Casque', 'hood-of-the-weave', A, '+2 attaques de sorts et DD immédiatement si le chapeau d’Acuité est raté.'),
    e('Casque', 'birthright', A, '+2 CHA (plafond 22) ; remplace le chapeau.'),
    e('Casque', 'pyroquickness-hat', S, 'Action bonus supplémentaire après dégâts de feu ; brûle le porteur.', { si: 'Jamais avec Hat of Fire Acuity.' }),
    e('Cape', 'cloak-of-the-weave', P, '+1 attaques de sorts et DD.'),
    e('Cape', 'cloak-of-displacement', A, 'Défense contre les attaques.'),
    e('Cape', 'cloak-of-protection', A, 'Sauvegardes renforcées.'),
    e('Armure', 'robe-of-the-weave', P, 'Bonus aux attaques de sorts et au DD, bonne défense.', { si: 'Tour de Ramazith : globe à désactiver.' }),
    e('Armure', 'robe-supreme-defences', A, 'Sauvegardes pendant la concentration.'),
    e('Armure', 'protecty-sparkswall', A, 'Pièce de transition.'),
    e('Gants', 'spellmight-gloves', P, '+1d8 aux sorts à jet d’attaque.', { si: '-5 au jet : activer après la montée de l’Acuité. Quête de Lucretious.' }),
    e('Gants', 'bracers-of-defence', A, 'Gants de transition tant que Spellmight n’est pas obtenu.'),
    e('Gants', 'gloves-of-dexterity', A, 'Si la répartition des caractéristiques en dépend.'),
    e('Gants', 'helldusk-gloves', A, '+1 attaques de sorts et DD.'),
    e('Amulette', 'amulet-greater-health', A, 'CON 23 et avantage CON : sécurise la concentration.', { si: 'Maison de l’Espoir : acquisition dangereuse. CON réduite par respec seulement après validation de la copie.' }),
    e('Amulette', 'amulet-of-the-devout', A, '+2 DD des sorts : rôle de contrôle.', { si: 'Risque de malédiction au pillage du coffre.' }),
    e('Arme à distance', 'hellrider-longbow', P, '+3 initiative.', { si: 'Commerce de Ferg sécurisé ; sinon Bow of Awareness.' }),
    e('Arme à distance', 'bow-of-awareness', A, 'Repli si Hellrider est inaccessible.'),
  ]),

  // ================================================================
  // Paladin / Hexblade — mêlée au CHA, Smites au repos court
  // ================================================================
  ...L('paladin-hexblade', 1, [
    e('Arme', 'unseen-menace', P, 'Allonge, avantage et critique amélioré tant que l’invisibilité tient.', { jusqua: 2, si: 'Un raté désactive temporairement l’invisibilité.' }),
    e('Arme', 'sword-of-justice', A, 'Alternative précoce : +1 et protection de CA (concentration).'),
    e('Casque', 'haste-helm', P, 'Mobilité en début de combat.', { jusqua: 2 }),
    e('Casque', 'grymskull-helm', A, 'Protection contre les critiques.', { jusqua: 2, si: 'Maîtrise des armures lourdes ; ne pas précipiter un combat dangereux.' }),
    e('Armure', 'armure-adamantine', P, 'CA 18, réduction de dégâts, protection contre les critiques.', { jusqua: 2, si: 'Armure lourde : pas avant la maîtrise (Hexblade pur = armure intermédiaire).' }),
    e('Gants', 'gloves-growling-underdog', P, 'Avantage conditionnel en mêlée (utile avec Great Weapon Master).'),
    e('Bottes', 'boots-of-speed', P, 'Mobilité en action bonus.', { jusqua: 2, si: 'Concurrence Malédiction, Vœu et attaque bonus de GWM.' }),
    e('Bottes', 'disintegrating-night-walkers', A, 'Copie possible ; mobilité et protections.', { jusqua: 3 }),
    e('Amulette', 'periapt-wound-closure', P, 'Stabilisation et soins reçus optimisés.', { jusqua: 1 }),
    e('Amulette', 'broodmothers-revenge', A, '+1d6 poison aux dégâts d’arme après un soin reçu.', { si: 'Quête de Kagha résolue ; résistances au poison.' }),
    e('Amulette', 'moondrop-pendant', S, 'Pas d’attaque d’opportunité à 50 % PV ou moins.'),
    e('Anneau', 'caustic-band', P, '+2 acide aux attaques d’arme.', { jusqua: 3 }),
    e('Anneau', 'strange-conduit-ring', P, 'Psychique additionnel pendant la concentration.', { jusqua: 1, si: 'Concentration active.' }),
    e('Anneau', 'ring-arcane-synergy', A, 'Synergie arcanique avec Booming Blade : modificateur de lancement aux dégâts d’arme.', { jusqua: 3, si: 'À tester ; priorité offensive à la place de Caustic Band ou Strange Conduit.' }),
    e('Anneau', 'ring-elemental-infusion', S, '+1d4 sur la première attaque d’arme avec Booming Blade.', { jusqua: 3, si: 'Arme à dégâts élémentaires (Honneur).' }),
    e('Arme à distance', 'bow-of-awareness', A, 'Initiative passive, par copie.', { jusqua: 2 }),
    LIBRE('Cape', 'Aucun achat obligatoire en Acte I.'),
  ]),
  ...L('paladin-hexblade', 2, [
    e('Arme', 'charge-bound-warhammer', A, 'Bonus d’enchantement et foudre ; à une main avec bouclier ou à deux mains.', { jusqua: 3 }),
    e('Arme', 'halberd-of-vigilance', A, 'Allonge, initiative et dégâts additionnels.', { jusqua: 3 }),
    e('Arme', 'drakethroat-glaive', S, 'Améliore une autre arme via son sort élémentaire : achat de confort.', { jusqua: 3 }),
    e('Armure', 'yuan-ti-scale-mail', A, 'Intermédiaire, surtout avec davantage de DEX.'),
    e('Gants', 'flawed-helldusk-gloves', P, '+1d4 feu aux attaques d’arme.', { si: 'Version d’acte 2 de Helldusk Gloves.' }),
    e('Gants', 'gloves-growling-underdog', A, 'Précision conditionnelle.'),
    e('Amulette', 'amulet-of-the-harpers', P, 'Avantage aux sauvegardes de SAG et Bouclier : couvre l’absence d’Aura de protection.'),
    e('Amulette', 'periapt-wound-closure', A, 'Reste une option de sécurité.'),
    e('Amulette', 'surgeons-subjugation-amulet', S, 'Paralysie après un critique contre un humanoïde.', { jusqua: 3, si: 'Cible humanoïde, une fois par repos long.' }),
    e('Anneau', 'strange-conduit-ring', P, 'Psychique additionnel pendant la concentration.', { si: 'Concentration active.' }),
    e('Anneau', 'killers-sweetheart', A, 'Critique préparé après une élimination, pour un gros Smite.', { si: 'Charge disponible ; une fois par repos long.' }),
    e('Anneau', 'ring-free-action', S, 'Immunité à Paralysé et Entravé.', { jusqua: 3 }),
    e('Anneau', 'risky-ring', S, 'Avantage aux attaques, désavantage à toutes les sauvegardes.', { jusqua: 3, si: 'Jamais par défaut sans Aura de protection.' }),
    e('Cape', 'cloak-of-protection', P, '+1 CA et sauvegardes.', { si: 'Exemplaire ou copie disponible pour ce rôle.' }),
    e('Cape', 'thunderskin-cloak', S, 'Hébétement sur une cible sous Réverbération qui blesse le porteur.', { jusqua: 3 }),
    e('Cape', 'vivacious-cloak', S, '8 PV temporaires après un sort lancé en mêlée.', { jusqua: 3, si: 'À tester avec Booming Blade ; pas cumulable avec Armure d’Agathys.' }),
    e('Bouclier', 'sentinel-shield', S, '+3 initiative, avec le marteau à une main.', { jusqua: 3, si: 'Le +10 de GWM n’est pas actif avec un bouclier.' }),
    e('Arme à distance', 'darkfire-shortbow', P, 'Résistances feu/froid et Hâte journalière.', { si: 'Exemplaire ou copie libre.' }),
  ]),
  ...L('paladin-hexblade', 3, [
    e('Arme', 'nyrulna', P, '+3, tonnerre et +3 m de déplacement ; liée, tenue à deux mains.', { si: 'Ne jamais la lancer au milieu du groupe.' }),
    e('Arme', 'unseen-menace', A, 'Transition jusqu’à Nyrulna.'),
    e('Casque', 'mask-of-soul-perception', P, '+2 attaques, initiative et Perception.'),
    e('Casque', 'birthright', A, '+2 CHA dans la limite du plafond de l’objet.'),
    e('Armure', 'armour-of-persistence', P, 'CA 20, réduction de dégâts, Blade Ward et Résistance permanents.', { si: 'Dammon en vie.' }),
    e('Gants', 'legacy-of-the-masters', P, '+2 attaques et dégâts d’arme : compense GWM.', { si: 'Dammon en vie ; sinon garder les gants d’acte 2.' }),
    e('Gants', 'flawed-helldusk-gloves', A, 'Gants d’acte 2 si Dammon est inaccessible.'),
    e('Bottes', 'boots-of-persistence', P, 'Longstrider et Liberté de mouvement.'),
    e('Bottes', 'boots-of-speed', A, 'Si le budget manque ou si l’activation de mobilité est préférée.'),
    e('Cape', 'cloak-of-displacement', P, 'Désavantage aux attaques contre le porteur, réactivé chaque tour.'),
    e('Cape', 'cloak-of-protection', A, 'Quand les sauvegardes dominent le combat.'),
    e('Amulette', 'fey-semblance-amulet', P, 'Avantage aux sauvegardes INT / SAG / CHA : couvre l’absence d’Aura.', { si: 'Quête de Mayrina résolue.' }),
    e('Amulette', 'amulet-greater-health', A, 'CON 23 et avantage CON.'),
    e('Amulette', 'spell-savant-amulet', S, 'Un emplacement ordinaire de niveau 2 : un Smite supplémentaire.'),
    e('Anneau', 'killers-sweetheart', P, 'Critique préparé pour un combat préparé.', { si: 'Charge disponible.' }),
    e('Anneau', 'band-mystic-scoundrel', S, 'Contrôle en action bonus après une attaque d’arme réussie.', { si: 'Concurrence Malédiction, Vœu et attaque bonus GWM ; consomme un emplacement.' }),
    e('Anneau', 'ring-of-regeneration', S, '1d4 PV par tour en combat.', { si: 'Combo avec Broodmother’s Revenge.' }),
    e('Arme à distance', 'the-dead-shot', P, 'Seuil de critique amélioré, même en mêlée.'),
  ]),

  // ================================================================
  // Moine Main ouverte / Voleur — mains nues
  // ================================================================
  ...L('moine-main-ouverte', 1, [
    LIBRE('Arme', 'Mains libres après Tavern Brawler ; bâton de moine possible avant le niveau 4.', { jusqua: 3 }),
    e('Armure', 'the-graceful-cloth', P, '+2 DEX (plafond 20) ; vêtement, pas armure.', { jusqua: 2 }),
    e('Casque', 'haste-helm', P, 'Atteindre les cibles au début du combat.', { jusqua: 2, si: 'Vérifier la catégorie : un casque classé armure casse les bénéfices.' }),
    e('Gants', 'gloves-sparkle-hands', P, 'Charges de foudre sur les coups à mains nues.'),
    e('Gants', 'gloves-cinder-sizzle', A, '+1d4 feu aux poings.', { jusqua: 2 }),
    e('Bottes', 'disintegrating-night-walkers', P, 'Mobilité et protections de déplacement.', { jusqua: 2 }),
    e('Bottes', 'boots-of-speed', A, 'Mobilité en action bonus.', { jusqua: 2 }),
    e('Amulette', 'periapt-wound-closure', P, 'Stabilisation et soins reçus.'),
    e('Amulette', 'amulet-misty-step', A, 'Mobilité si Night Walkers manque.', { jusqua: 2 }),
    e('Amulette', 'sentient-amulet-rare', R, 'Récupère 2 ki par repos long hors combat.', { jusqua: 3, si: 'N’occupe pas le slot de combat en même temps.' }),
    e('Anneau', 'crushers-ring', P, '+3 m de déplacement.', { jusqua: 3 }),
    e('Anneau', 'ring-of-protection', P, '+1 CA et sauvegardes.', { si: 'Acquisition conditionnelle (quête de l’idole).' }),
    e('Arme à distance', 'bow-of-awareness', P, 'Passif d’initiative uniquement.', { si: 'Original ou copie disponible.' }),
    LIBRE('Cape', 'Pas de pièce indispensable à acheter pour remplir le slot.'),
    e('Consommable', 'elixir-hill-giant-strength', P, 'FOR effective 21 : indispensable à Tavern Brawler.', { jusqua: 3, si: 'Stock acheté chez Ethel avant la résolution de sa quête ; un seul élixir actif.' }),
  ]),
  ...L('moine-main-ouverte', 2, [
    e('Gants', 'flawed-helldusk-gloves', P, '+1d4 nécrotique aux poings, Saignement possible.', { si: 'Pas le bonus feu des armes ; adapter face aux résistances.' }),
    e('Gants', 'gloves-sparkle-hands', A, 'Garder Sparkle ou Cinder selon la cible.'),
    e('Cape', 'cloak-of-protection', P, '+1 CA et sauvegardes, copiable.'),
    e('Cape', 'cloak-cunning-brume', S, 'Brume en se désengageant en combat.', { si: 'Dépense l’action bonus et peut gêner les lignes de vue du Sorcier.' }),
    e('Amulette', 'amulet-of-the-harpers', P, 'Avantage aux sauvegardes de SAG et Bouclier.'),
    e('Amulette', 'surgeons-subjugation-amulet', S, 'Paralysie après un critique contre un humanoïde.', { jusqua: 3, si: 'Une fois par repos long ; pas universel.' }),
    e('Anneau', 'shadow-cloaked-ring', P, '+1d4 aux armes et poings contre cibles obscurcies.', { jusqua: 3, si: 'Conditionnel : choisir le plan d’éclairage.' }),
    e('Anneau', 'ring-free-action', A, 'Immunité à Paralysé et Entravé.', { jusqua: 3 }),
    e('Anneau', 'callous-glow-ring', A, 'Alternative dégâts : radiant contre cible éclairée.', { jusqua: 3, si: 'Choisir le plan d’éclairage ; attention aux renvois radiants.' }),
    e('Anneau', 'risky-ring', S, 'Avantage aux attaques, désavantage à toutes les sauvegardes.', { jusqua: 3, si: 'Optionnel : Tavern Brawler fournit déjà beaucoup de précision.' }),
    e('Arme à distance', 'darkfire-shortbow', P, 'Résistances feu/froid et Hâte journalière.'),
  ]),
  ...L('moine-main-ouverte', 3, [
    e('Armure', 'vest-soul-rejuvenation', P, '+2 CA, soin sur sauvegarde réussie, contre-attaque à mains nues.', { si: 'Recalculer DEX et initiative en quittant Graceful Cloth.' }),
    e('Armure', 'the-graceful-cloth', A, 'Garde la DEX équipée.'),
    e('Casque', 'mask-of-soul-perception', P, '+2 attaques, initiative et Perception.'),
    e('Casque', 'haste-helm', A, 'Option de mobilité.'),
    e('Gants', 'gloves-soul-catching', P, '+1d10 force, +2 CON, soin de 10 PV après un coup.', { si: 'Hope et Raphael résolus avec une équipe préparée.' }),
    e('Gants', 'flawed-helldusk-gloves', A, 'À garder jusqu’à l’obtention de Soul Catching.'),
    e('Gants', 'gauntlets-hill-giant-strength', A, 'FOR 23 sans élixir, au prix de Soul Catching.', { si: 'Variante autonome : mains occupées.' }),
    e('Bottes', 'boots-uninhibited-kushigo', P, 'Ajoutent le modificateur de SAG aux dégâts à mains nues.', { si: 'Ramassées sur Lir’i’c avant de repartir du Plan astral.' }),
    e('Bottes', 'disintegrating-night-walkers', A, 'Mobilité, mais perte du bonus de SAG par frappe.'),
    e('Cape', 'cloak-of-displacement', P, 'Désavantage aux attaques contre le porteur.'),
    e('Cape', 'cloak-of-protection', A, 'Quand les sauvegardes dominent.'),
    e('Amulette', 'amulet-greater-health', P, 'CON 23 et avantage CON.', { si: 'Copie validée avant de baisser la CON naturelle.' }),
    e('Amulette', 'fey-semblance-amulet', A, 'Avantage aux sauvegardes INT / SAG / CHA.'),
    e('Consommable', 'elixir-cloud-giant-strength', A, 'FOR effective 27 si le stock en propose.', { si: 'Disponibilité non garantie à chaque rafraîchissement.' }),
    e('Arme à distance', 'hellrider-longbow', P, '+3 initiative, passif uniquement.', { si: 'Commerce de Ferg sécurisé.' }),
    e('Arme à distance', 'darkfire-shortbow', A, 'Garder ses résistances.'),
  ]),

  // ================================================================
  // Sidekick Barde du Savoir 10 / Clerc de Vie 2 — buffs sur soins
  // ================================================================
  ...L('sidekick-savoir-vie', 1, [
    e('Arme', 'phalar-aluve', P, 'Aura de soutien (Sing ou Shriek) ; bâton utilitaire sinon.', { jusqua: 2, si: 'Placement de l’aura maîtrisé : ne pas avancer seul au milieu d’un pack.' }),
    LIBRE('Bouclier', 'Meilleur bouclier +2 CA disponible.'),
    e('Casque', 'cap-of-curing', A, 'Soin associé à l’Inspiration bardique.'),
    LIBRE('Casque', 'Casque utile non pénalisant.', { jusqua: 2 }),
    LIBRE('Armure', 'Meilleure armure lourde disponible (Vie donne la maîtrise lourde).'),
    e('Armure', 'spidersilk-armour', A, 'Avantage aux sauvegardes de CON pour la concentration.', { si: 'CA à comparer ; ne pas imposer la mort de Minthara.' }),
    e('Gants', 'hellriders-pride', P, 'Soigner protège les alliés soignés des dégâts physiques.', { jusqua: 2 }),
    e('Bottes', 'disintegrating-night-walkers', P, 'Sortie d’urgence et mobilité.', { jusqua: 3 }),
    e('Bottes', 'boots-aid-comfort', A, 'PV temporaires après soins.'),
    e('Amulette', 'amulet-of-restoration', P, 'Mot de guérison et Mot de guérison de groupe par repos long, sans emplacement.', { jusqua: 1 }),
    e('Anneau', 'whispering-promise', P, 'Soigner applique Bénédiction deux tours sans concentration.', { jusqua: 3 }),
    e('Anneau', 'ring-of-protection', P, 'Défense utile ; emplacement libre sinon.', { si: 'Acquisition conditionnelle (quête de l’idole).' }),
    e('Arme à distance', 'bow-of-awareness', P, 'Initiative passive.'),
    LIBRE('Cape', 'Aucun achat obligatoire pour remplir ce slot au début.'),
  ]),
  ...L('sidekick-savoir-vie', 2, [
    e('Armure', 'armure-adamantine', P, 'CA et protection contre les critiques.', { si: 'Forge / copie disponible ; sinon une bonne armure lourde.' }),
    e('Bouclier', 'sentinel-shield', P, '+3 initiative ; Ketheric’s Shield si le DD prime sur l’initiative.', { jusqua: 3 }),
    e('Bouclier', 'ketherics-shield', A, '+1 DD et attaques de sorts, en fin d’acte.', { jusqua: 3 }),
    e('Cape', 'cloak-of-protection', P, '+1 CA et sauvegardes, copiable pour l’équipe.'),
    e('Amulette', 'amulet-of-the-harpers', P, 'Avantage aux sauvegardes de SAG et Bouclier.'),
    e('Amulette', 'amulet-of-restoration', A, 'Ressource journalière de soin collectif.', { jusqua: 3 }),
    e('Anneau', 'ring-mental-inhibition', P, 'Enchaîne les contrôles à sauvegarde.', { jusqua: 3, si: 'Ne s’applique qu’aux effets à sauvegarde du porteur.' }),
    e('Anneau', 'ring-free-action', A, 'Immunité à Paralysé et Entravé.', { jusqua: 3 }),
    e('Arme à distance', 'darkfire-shortbow', P, 'Résistances feu/froid et Hâte journalière.', { si: 'Hâte lancée soi-même : action et concentration.' }),
  ]),
  ...L('sidekick-savoir-vie', 3, [
    e('Arme', 'markoheshkir', P, 'Bâton de DD.', { si: 'Original ou copies obtenus ; sinon Phalar.' }),
    e('Arme', 'phalar-aluve', A, 'Si l’aura est exploitée.'),
    e('Arme', 'staff-of-spellpower', A, 'Alternative tardive.'),
    e('Casque', 'hood-of-the-weave', P, '+2 DD et attaques de sorts.'),
    e('Casque', 'birthright', A, '+2 CHA ; pas les deux casques à la fois.'),
    e('Armure', 'armour-of-persistence', P, 'Forte défense ; le Blade Ward permanent ne se multiplie pas avec celui des soins.', { si: 'Dammon en vie.' }),
    e('Gants', 'reviving-hands', P, 'Blade Ward sur soin, Death Ward sur résurrection.', { si: 'Un Mot de guérison sur un allié à terre ne donne pas Death Ward.' }),
    e('Gants', 'hellriders-pride', A, 'À garder jusqu’à Reviving Hands.'),
    e('Cape', 'cloak-of-the-weave', P, '+1 DD et attaques de sorts.'),
    e('Cape', 'cloak-of-protection', A, 'Sauvegardes.'),
    e('Cape', 'cloak-of-displacement', A, 'Défense contre les attaques.'),
    e('Cape', 'mantle-holy-warrior', S, 'Aura offensive d’équipe via Crusader’s Mantle, une fois par repos court.', { si: 'Demande de la concentration : concurrence Hâte, Bénédiction et les contrôles.' }),
    e('Amulette', 'amulet-of-the-devout', P, '+2 DD et Canalisation divine supplémentaire : configuration contrôle.', { si: 'Risque de malédiction au pillage ; deux amulettes ne se portent pas ensemble.' }),
    e('Amulette', 'amulet-greater-health', A, 'Configuration sécurité : CON 23, concentration protégée.'),
    e('Anneau', 'ring-of-regeneration', S, 'Autoprotection avec les effets de soin.'),
    e('Arme à distance', 'hellrider-longbow', P, '+3 initiative.', { si: 'Commerce de Ferg sécurisé ; Darkfire sinon.' }),
  ]),
]

export function loadoutsDe(role, acte) {
  return LOADOUTS.filter(
    (ligne) => ligne.role === role && ligne.acte <= acte && acte <= (ligne.jusquA ?? ligne.acte),
  )
}

export function rolesRecommandant(objetId) {
  return [...new Set(LOADOUTS.filter((ligne) => ligne.objet === objetId).map((ligne) => ligne.role))]
}
