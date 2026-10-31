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
Manque (tickets suivants) : interface de choix d'alternatives (2), alertes (3), affectation d'exemplaires (4), affichage des étapes de caractéristiques dans `BuildPage` (suite), traduction FR officielle et icônes (sources à clarifier).

## 9. Surfaces à texte utilisateur (à traduire / auditer)

Navigation (`Navbar`), `Dashboard`, `BuildPage`, `Builds`, `Loadout`, `Items` (+ `FiltresItems`, `ItemCard`), `Lieux`, `Checklist`, `Archive`, `Footer`, bannières stockage/migration. Les noms d'objets, de sorts et de capacités restent en anglais faute de traduction officielle vérifiée (repli justifié) ; l'interface est en français.
