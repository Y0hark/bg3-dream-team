# Contrat de données — objets, alternatives, caractéristiques (ticket UX 1/5)

Fondation des tickets 2 à 5. Aucun catalogue parallèle : tout s'appuie sur le schéma existant.

## 1. Responsabilités (qui possède quoi)

| Couche | Fichier | Nature |
| --- | --- | --- |
| Catalogue partagé (objet, effet, sources d'acquisition) | `src/data/objets.js` | Données, ID stables |
| Métadonnées : nom FR officiel, icône vérifiée, usages | `src/data/objets-meta.js` | Fusionnées dans `OBJETS` par ID |
| Plan par rôle / acte / slot (référence, alternatives) | `src/data/loadouts.js` | Projection, pas un équipement |
| Vue dérivée pour les pages | `src/data/items.js` | Une entrée par objet |
| Possession | `etat.items[objetId]` | Run |
| Exemplaires et équipement réel | `etat.copies[objetId]` | Run (`lib/copies.js`, ticket 4) |
| Choix d'alternatives | `etat.choixAlternatives` | Préférence de plan (ticket 2) |
| Étapes de caractéristiques | `lib/etapes-caracteristiques.js` | Lecture de `builds.js` |

Règle : changer l'acte dans un sélecteur ne modifie jamais la possession ni l'équipement.
Le ticket 3 complète `sources` (champs d'acquisition) dans `objets.js`, sans nouveau catalogue ;
le ticket 2 fonctionne avec des alertes inconnues (aucune dépendance au ticket 3).

## 2. Localisation (`lib/localisation.js`)

- FR par défaut, repli EN **champ par champ** (`champLocalise`). Jamais `undefined`, jamais de clé technique.
- `nomFr` + `sourceNomFr` (objets-meta `NOMS_FR`) = traduction **officielle vérifiée**. Sans source, jamais « officiel ».
- `effet` = résumé éditorial FR (`editorial: true`), jamais présenté comme officiel.
- Nom EN toujours consultable (`nomsObjet().secondaire`) ; recherche bilingue sans accent (`correspondRecherche`, utilisée par `filtrerItems`).
- Les ID et les exports planner ne passent pas par la localisation.

## 3. Icônes (`lib/icones.js`, `components/IconeObjet.jsx`)

- Entrée `ICONES[id] = { fichier, source, licence, attribution }`, `fichier` sous `public/icones/`. Les quatre champs sont requis (`iconeValide`).
- Pas de chargement tiers au runtime. Repli par type d'équipement ; cadre à dimensions fixes (aucun décalage), repli aussi sur erreur de chargement.

## 4. Alternatives (`lib/alternatives.js`)

- Nature déduite du rang : principal → référence ; alternative → équivalente (**dans le contexte `condition`**) ; situationnel → situationnelle ; réserve → transition.
- Usages (`degats | defense | mobilite | controle | utilitaire`) portés par l'objet ; `comparaison()` assemble `interet`/`condition` sourcés, sans inventer de pertes.
- Acte d'acquisition (`actesAcquisition`, sources) ≠ actes recommandés (`actesRecommandes`, `acte..jusquA`).
- L'équivalence n'est jamais déduite de la rareté.

## 5. Persistance (inspection de l'existant)

- État : `schema` (forme, `VERSION_SCHEMA = 2`) et `composition` (catalogue). `sauvegarde.js` : une sauvegarde `plus-recent` n'est jamais écrasée ; avant la première écriture migrée, l'état précédent est copié sous `CLE_AVANT_MIGRATION` ; aucune réinitialisation automatique.
- **Ajout de ce ticket** : `choixAlternatives: { "<role>|<acte>|<slot>": "<objetId>" }`, additif, `{}` par défaut.
  `normaliserEtat` l'ignore proprement si absent (anciennes sauvegardes) et écarte tout choix dont la ligne de loadout n'existe pas. Pas de montée de `VERSION_SCHEMA` : le champ est optionnel à la lecture.
  Limite connue : une version antérieure de l'application qui réécrirait l'état perdrait ce champ ; le ticket 2 possède l'écriture.
- Le ticket 4 n'ajoute que ce qu'exige l'affectation d'exemplaires (`copies`).

## 6. Caractéristiques (`lib/etapes-caracteristiques.js`)

Étapes séparées : création → progression par don (cumul) → permanents choisis → valeurs fixées (remplacent si supérieures, jamais additionnées) → respécialisations (distinctes de l'export).
Chaque valeur fixée porte `verification` (`fiche` | `a-confirmer` | `verifie`) et `reference`. Aucune n'est `verifie` : rien n'a été testé en jeu.
Moine : FOR naturelle 8 ; élixir sélectionné → 21 / 27 ; sans sélection `valeurDe(...).dependDUnChoix === true`.
Paladin : export CHA 16 → 18 (un seul +2) ; la respécialisation (CHA 20) reste séparée.
Pas de recalcul automatique du build après changement d'objet (hors périmètre).

## 7. Couverture (état au 2026-10-31)

| Mesure | Résultat |
| --- | --- |
| Objets du catalogue couverts par les loadouts actifs (4 rôles, actes 1–3) | 104 / 104 (aucun objet hors loadout) |
| Lignes de loadout (principal 91, alternative 68, situationnel 23, réserve 4) | 186 |
| Résumé FR éditorial (`effet`) | 104 / 104 |
| **Nom FR officiel vérifié** | **0 / 104** — aucune source officielle vérifiée dans ce ticket ; repli EN du nom |
| **Icône vérifiée (provenance + licence)** | **0 / 104** — provenance/licence non clarifiées ; repli par type (11 types) |
| Usages renseignés | 104 / 104 |
| Alternatives « équivalentes » avec contexte explicite | 13 / 68 ; **55 sans contexte** (`lignesSansContexte()`) |
| Sources d'acquisition avec lieu non catalogué | 12 objets (`lieu: null`, déjà `aConfirmer`) |

Exceptions listées par `couvertureFrancaise()`, `couvertureIcones()` et `lignesSansContexte()`.
Pour remplir : ajouter une entrée dans `NOMS_FR` / `ICONES` ; aucun autre changement de code.

## 8. Inventaire des fonctions existantes

Réutiliser : catalogue `objets.js`, loadouts, `copies.js`, `caracteristiquesEffectives`, migration `sauvegarde.js`.
Adapter : `items.js` (champs FR/icône/usages), `filtrerItems` (recherche bilingue), `ItemCard` (icône + nom FR/EN).
Livré au ticket 2 : inventaire visuel par acte (`lib/inventaire.js`, `components/InventaireRole.jsx`), choix d'alternatives (`choisirAlternative`), vues de caractéristiques (`PanneauCaracteristiques`).
Livré au ticket 3 : conditions d'acquisition et alertes (section 11). Manque (tickets suivants) : affectation d'exemplaires (4), affichage des étapes de caractéristiques dans `BuildPage` (suite), traduction FR officielle et icônes (sources à clarifier).

## 9. Surfaces à texte utilisateur (à traduire / auditer)

Navigation (`Navbar`), `Dashboard`, `BuildPage`, `Builds`, `Loadout`, `Items` (+ `FiltresItems`, `ItemCard`), `Lieux`, `Checklist`, `Archive`, `Footer`, bannières stockage/migration. Les noms d'objets, de sorts et de capacités restent en anglais faute de traduction officielle vérifiée (repli justifié) ; l'interface est en français.

## 10. Inventaire visuel et choix d'alternatives (ticket UX 2/5)

- **Clé de choix par emplacement** : `role|acte|slot`, avec suffixe `#n` à partir du second emplacement d'un slot multiple (`Anneau#2`). Le premier emplacement garde la clé du ticket 1 : aucune migration. `normaliserChoix` écarte `#1`, `#3` et tout suffixe sur un slot à un seul emplacement.
- **Revenir à la référence** supprime la clé (`avecChoix`) ; un choix égal à la référence n'est jamais stocké.
- **Trois libellés distincts** : « Prévu pour l'acte » (plan + alternative choisie), original obtenu (`etat.items`), « Équipé dans la run » (`copies[objet].affectes` contient le rôle). Choisir une alternative ou changer d'acte n'écrit ni `items` ni `copies` (testé).
- **États d'emplacement** : `vide` (aucun objet voulu), `prevu`, `disponible` (original obtenu, non affecté), `equipe`.
- **Compatibilité** : les données n'encodent ni prise en main ni maîtrises ; l'interface signale « à vérifier » (arme + bouclier, Moine Main ouverte) et n'affirme jamais une compatibilité.
- **Alertes d'acquisition** : lues dans `objet.sources` (verrou, `aConfirmer`, lieu absent). Une condition non renseignée reste inconnue ; la logique du ticket 3 n'est pas réimplémentée.
- **Caractéristiques** : vues Création / Progression / Respécialisation / Équipement / Export utilisateur, uniquement quand les données existent ; l'ordre de progression Paladin non confirmé reste signalé.

## 11. Conditions d'acquisition et alertes avant départ (ticket UX 3/5)

- **Propriété** : `data/acquisition.js` possède les conditions sourcées (catégorie, objets, zone, événement, sévérité, portée, confiance, texte discret / détail, sources, voies). `lib/acquisition.js` possède l'évaluation et le récapitulatif ; `components/RecapZone.jsx` est le composant réutilisé par le ticket 5 (pas de second moteur). Les sources de base (acte, lieu, verrou) restent dans `objets.js`.
- **Persistance** : `etat.acquisition = { evenements, statuts, spoilers }`, additif, normalisé sans montée de `VERSION_SCHEMA` (comme `choixAlternatives`). Statuts, checklists et copies existants sont inchangés. Limite connue : une ancienne version de l'application qui réécrirait l'état perdrait ce champ.
- **Trois résultats** : `satisfait` (original obtenu, voie alternative déclarée, ou « fait » confirmé), `non-satisfait` (événement irréversible déclaré, rien ne satisfait), `inconnu` (tout le reste). « Ignorer » masque sans résoudre et se restaure. Aucun feu vert par défaut.
- **Événements** : déclaratifs, nommés, sourcés (`EVENEMENTS`). Un événement ne rend une condition impossible que si la source établit l'irréversibilité (`irreversible: true`, jamais avec une confiance `a-verifier`). Pas de déduction depuis l'acte ou une visite de zone.
- **Original ≠ copies** : seul `etat.items` lève l'alerte ; `etat.copies` n'est jamais lu par le moteur d'alertes, aucune alerte par copie.
- **Spoilers** : `discret` par défaut (catégorie, sévérité, zone, titre neutre visibles ; détail et, pour `masquerObjets`, noms d'objets sur demande), `detail` pour tout afficher. Le mode discret ne masque jamais l'existence d'une urgence.
- **Récapitulatif** : filtré par équipe, alternatives sur option, alerte commune dédoublonnée avec ses objets et rôles. Message « Rien de bloquant identifié dans les données vérifiées » uniquement sans alerte ouverte ni objet prévu manquant ; les objets non audités sont listés à part.

### Conditions (état au 2026-10-31)

| Mesure | Résultat |
| --- | --- |
| Conditions | 12 : 5 recoupées sur BG3 Wiki, 2 de fiche d'équipe, 5 « à vérifier sur votre version » |
| Conditions irréversibles (source établie) | 3 : Kushigo (fiche + wiki partiel), boutique de Roah Acte II (wiki), boutique d'Ethel + Cheveu (wiki) |
| Catégorie sans cas sourcé | `compagnon-requis` — non inventée |

### Couverture d'audit (104 objets)

| Niveau | Objets |
| --- | --- |
| Audité, contraintes connues | 19 |
| Aucune contrainte connue **(lecture du catalogue, non recoupée un à un sur le wiki)** | 30 |
| **Non audité** (verrou PNJ/quête non détaillé, source à confirmer ou lieu non catalogué) | 55 |

`tableauCouverture()` produit ces listes. L'absence de condition n'est jamais la preuve d'une absence de risque.

### Réserves

- Aucun hotfix n'est connu : une condition `verifie` l'est à la date de vérification, pas pour toutes les versions.
- Hat of Fire Acuity : le wiki et la fiche divergent sur l'effet de la mort du Bœuf étrange au Bosquet ; la condition reste `a-verifier`, sans événement irréversible.
- Kushigo : le wiki ne cite que Lir'i'c comme source, sans rattrapage ni point de non-retour explicite ; l'irréversibilité vient de la fiche d'équipe.
- Dammon : le wiki ne dit pas que sa mort ferme son commerce ; aucune interdiction n'est affichée.
- Non fait : lecture de sauvegarde BG3, guide exhaustif des quêtes, vérification visuelle sur appareil mobile réel.
