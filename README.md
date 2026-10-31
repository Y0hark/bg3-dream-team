# BG3 Honor Run Tracker

Application web statique pour suivre une run **Mode Honneur** de Baldur's Gate 3 :
les quatre builds de l'équipe actuelle, leur leveling 1 → 12, les objets à
récupérer acte par acte, les lieux où les trouver, le suivi des copies
d'équipement et les checklists de fin d'acte.

Aucun compte : la progression vit dans le `localStorage` du navigateur. Une
**sauvegarde en ligne** facultative (Supabase, offre gratuite) permet de
retrouver la run sur un autre appareil, ou de la partager avec la team, via un
simple code de run.

> **Fiches documentées, pas testées en jeu.** Les données viennent de quatre
> fiches Notion de builds. Aucun combo n'a été vérifié sur la sauvegarde de la
> run, aucun dégât n'est garanti, et le hotfix exact installé reste à
> confirmer. Les points que les fiches laissent ouverts s'affichent « à
> confirmer » dans l'interface.

## L'équipe

| Rôle | Split | Rôle de jeu |
| --- | --- | --- |
| Sorcier feu | Sorcier draconique 12 (Halfelin) | DPS distance / contrôle — Rayon ardent, Hat of Fire Acuity |
| Paladin | Paladin de la Couronne 4 / Occultiste Hexblade 8 (export du joueur) | DPS mêlée — Smites au repos court |
| Moine | Moine Main ouverte 8 / Roublard Voleur 4 | DPS à mains nues — Tavern Brawler, élixirs de Force |
| Sidekick | Barde du Savoir 10 / Clerc de la Vie 2 | Support / contrôle — buffs sur soins |

**Aucun joueur n'est affecté à un rôle** : l'attribution n'est pas confirmée.
Les identifiants (`sorcier-feu`, `paladin-hexblade`, `moine-main-ouverte`,
`sidekick-savoir-vie`) sont sémantiques et stables, distincts des noms de joueurs
et de ceux de l'ancienne équipe, dont les builds restent consultables en lecture
seule (voir *Migration*).

Chaque fiche affiche aussi ses **variantes** (jamais cumulées avec le build
principal), les **divergences** entre l'export du joueur et la recommandation de
la fiche, et ce qui reste **à confirmer** — par exemple l'ordre Paladin 1-4 puis
Occultiste 1-8 de l'export, qui retarderait la seconde attaque au niveau 9 s'il
représente la progression réellement jouée. Les exports de planner (Base64, pas
des hash Git) sont conservés à l'identique et n'existent que pour le Sorcier et
le Paladin : aucun n'est généré pour le Moine ni le Sidekick.

## Sections

| Route | Contenu |
| --- | --- |
| `/` | Dashboard : progression du plan, équipement des loadouts, checklists, risques et urgences |
| `/builds` | Les 4 cartes de build |
| `/builds/:id` | Fiche : stats, dons, leveling 1 → 12, variantes, divergences, à confirmer, export, objets du plan |
| `/loadout` | Loadouts par acte, par rôle et par variante, avec le suivi des copies |
| `/items` | Catalogue filtrable (acte, rôle, priorité, statut, recherche), groupé par acte |
| `/lieux` | Zones de la run avec liens wiki et cartes interactives externes |
| `/checklist` | Checklists par acte (obligatoires / facultatives) et risques Honneur |
| `/archive` | Ce que la nouvelle composition ne reprend pas : récupérable et exportable |

## Lancer en local

```bash
npm install
npm run dev      # http://localhost:5173/
```

Autres scripts :

```bash
npm run build    # build de production dans dist/ + 404.html (repli SPA)
npm run preview  # sert le build de production localement
npm test         # tests de données, de migration, de rendu et de recette (Vitest)
```

## Publier sur GitHub Pages

Le site est publié sur le domaine personnalisé
`https://bg3-build-planner.samuelgaliere.tech/` (réglage **Settings → Pages**,
source « GitHub Actions »). Aucune publication n'est déclenchée en dehors d'un
push sur `main`.

### Déploiement automatique

`.github/workflows/deploy.yml` publie le site à chaque push sur `main` (et à la
demande via **Actions → Déploiement GitHub Pages → Run workflow**) : `npm ci`,
`npm test`, `npm run build`, puis envoi de `dist/` à Pages. Les tests gardent la
porte — un build vert mais des données incohérentes ne part pas en ligne.

### Ce dont dépend le build

1. `base` vaut `/` dans `vite.config.js` : le site est servi à la racine du
   domaine personnalisé, et `main.jsx` en déduit le `basename` du routeur. Pour
   revenir à un sous-chemin (`https://<user>.github.io/bg3-dream-team/`), mettre
   `base: '/bg3-dream-team/'` — assets et routes suivent, et un test rend les
   routes sous ce préfixe pour le garantir. **Les versions précédentes de ce
   README décrivaient ce sous-chemin et un fichier `public/.nojekyll` ; ni l'un
   ni l'autre n'est la configuration actuelle.**
2. `npm run build` génère `dist/`, puis copie `index.html` en `404.html` :
   GitHub Pages ne connaît pas les routes du client, et sert cette page en repli
   pour que React Router reprenne la main sur `/items`, `/builds/…`, etc.
3. Les filtres et le choix d'acte du loadout vivent dans la query string
   (`/loadout?acte=3&role=moine-main-ouverte`, `/items?acte=2&statut=rate`) et
   survivent à un rechargement.

### Repli manuel

Si Actions est indisponible, `npm run deploy` pousse `dist/` sur la branche
`gh-pages` — il faut alors basculer **Settings → Pages** sur cette branche
(dossier `/`).

## Structure

```
index.html            Shell + script anti-flash de thème
src/
  main.jsx            Point d'entrée, BrowserRouter avec basename
  App.jsx             Routes et layout
  index.css           Thèmes (variables CSS) et classes de design
  data/               Données de la run (voir ci-dessous)
  lib/                Logique pure : niveaux, progression, copies, migration, stockage, cloud
  hooks/              useProgression (contexte, persistance, migration, synchro), useTheme…
  components/         Cartes, badges, filtres, suivi des copies, bandeaux…
  pages/              Une page par section
  *.test.js           Données, migration, stockage, rendu des routes, recette
```

### Données

Tout vit dans `src/data/` — aucun appel réseau, aucun scraping, aucune clé
Notion dans le client. Le catalogue couvre **104 objets** répartis sur
**40 lieux**, employés dans **186 lignes de loadout** (rôle × acte × slot).
Ces comptes sont vérifiés par un test : si les données bougent, le README doit suivre.

| Fichier | Rôle |
| --- | --- |
| `builds.js` | Les 4 builds : progression par classe, caractéristiques, variantes, export, divergences, à confirmer |
| `builds-anciens.js`, `items-anciens.js` | Ancienne composition, en lecture seule (migration, anciens liens) |
| `exports-planner.js` | Exports de planner Base64, tels que dans la propriété Notion |
| `objets.js` | Objets canoniques : ID stable, effet **avec sa condition**, sources d'acquisition multiples |
| `loadouts.js` | Emploi par rôle, par acte et par slot : principal / alternative / situationnel / réserve |
| `items.js` | Vue dérivée (une entrée par objet) pour les pages d'inventaire — ne pas l'éditer |
| `lieux.js`, `actes.js` | Zones et actes |
| `checklists.js`, `risques.js` | Checklists par acte et garde-fous de composition |

Chaque source d'objet indique son acte, son lieu (ou `null` : « à localiser », jamais
inventé), son risque de verrouillage narratif (quête, PNJ, zone dangereuse, point de
non-retour, ressource unique) et si un rattrapage existe. Un lien wiki absent vaut
`null`, jamais une URL devinée. Les 104 liens `bg3.wiki` ont été vérifiés à la
rédaction. Aucune image ni carte du jeu n'est copiée dans le dépôt.

Les dons sont placés au niveau de **classe** qui les donne, pas au niveau de
personnage : les niveaux de don, les totaux de classe et les plafonds de sorts se
**déduisent** de l'ordre des classes (`src/lib/niveaux.js`) et un test le vérifie.
Un emplacement de niveau 6 n'est pas un sort de niveau 6 connu : le Sidekick 10/2 a
l'un et pas l'autre.

Les caractéristiques séparent valeur de création, bonus de don, bonus permanent et
valeur **fixée** par un objet ou un élixir (`CON 23`, `FOR 21`) : ces dernières
remplacent la valeur au lieu de s'y ajouter.

### Copies d'équipement

La run autorise les copies via Ombrecœur / Invocation de réplique. Le suivi
distingue trois choses que l'ancien « un seul exemplaire pour toute l'équipe »
confondait :

1. l'**original acquis** (le statut d'item habituel) ;
2. les **exemplaires disponibles** (l'original compte pour un, chaque copie en ajoute un) ;
3. l'**exemplaire affecté** à un rôle — acquérir l'original n'équipe personne.

Les copies ne dupliquent ni le Cheveu d'Ethel, ni les bonus permanents, ni les élixirs, ni
les classes, le ki ou les charges de pacte (`copiable: false`). Elles ne lèvent pas les
limites de slots : une amulette, une cape, deux anneaux par personnage. Un original raté
bloque la copie, sauf si une autre source est documentée. Leurs passifs et leur
persistance sont à **valider en jeu** (case « copie validée »), jamais garantis par
l'application. Sans copies, le loadout affiche les arbitrages naturels.

### Progression

Statuts possibles d'un objet : **À récupérer**, **Obtenu**, **Raté**, **Remplacé**.
Trois dénominateurs, volontairement séparés :

- **acquisition du plan** : les objets qu'au moins un rôle porte en *principal*. Les
  alternatives, situationnels et réserves n'y comptent pas — documenter une variante de
  plus ne fait pas baisser la progression ;
- **équipement des loadouts** : chaque objet principal d'un rôle compte une fois ; il est
  « équipé » quand un exemplaire lui est affecté ;
- **checklists** : seules les entrées *obligatoires* valident un acte. Les rattrapables,
  facultatives et alternatives sont comptées à part et ne bloquent jamais.

Le bouton **Reset progression** du dashboard demande confirmation et n'efface que la
progression de la composition active : l'archive de l'ancienne composition est conservée.

### Migration depuis la V1

La sauvegarde porte un **numéro de schéma** (`schema: 2`), distinct de l'identifiant de
composition (`honneur-v2`) : le premier décrit la forme de ce qui est stocké, le second le
catalogue auquel les identifiants renvoient.

Clés `localStorage` : `bg3-progression` (état), `bg3-progression-avant-v2` (**copie de
secours** de l'état précédent), `bg3-code-run` et `bg3-maj-distante` (cloud), `bg3-theme`.

Une sauvegarde d'avant la V2 n'est **jamais écrite sans confirmation**. L'application la
migre en mémoire, propose « Passer à la nouvelle composition » et permet d'exporter l'ancienne
sauvegarde. À la confirmation, la copie de secours est écrite *avant* toute écriture — et
si elle échoue, rien n'est modifié. Une copie de secours existante n'est jamais écrasée.

- la migration se fait **par identifiant**, jamais par position dans un tableau : un statut
  suit son objet, et aucune affectation de l'ancienne équipe n'est reportée sur un nouveau rôle ;
- ce que le catalogue actif ne connaît plus (objets de l'ancienne équipe, cases de
  l'ancienne checklist) est rangé dans l'**archive**, récupérable et exportable (`/archive`) ;
- migrer deux fois donne le même résultat ;
- un JSON corrompu ou un format **plus récent** coupe l'enregistrement automatique au lieu
  d'être écrasé, avec un bandeau d'explication et un export de ce qui est stocké ;
- les anciennes routes (`/builds/sam-freeze-thunder`…) restent lisibles en « ancienne
  composition », sans redirection arbitraire vers un autre personnage.

Si le stockage est indisponible — navigation privée, stockage refusé — l'application reste
utilisable et l'indique par un bandeau discret.

### Sauvegarde en ligne

Le bouton **nuage** de la barre de navigation ouvre le panneau de sauvegarde.
Deux gestes : générer un **code de run** (`grimoire-ardente-472`), ou coller
celui d'une run existante pour la rejoindre. Le code est la seule identité —
le partager, c'est partager la run, en lecture comme en écriture.

Le local reste la source immédiate : l'app fonctionne hors ligne, et l'envoi au
serveur se fait en tâche de fond après 1,5 s d'inactivité. Un serveur
injoignable n'empêche rien, il allume juste la pastille rouge du panneau.
« Sauvegardé » ne s'affiche qu'une fois l'écriture réellement réussie ; après la
simple connexion, le panneau dit « En ligne — rien encore envoyé ».

Le cloud comprend le schéma de sauvegarde (voir *Migration*). À la prise de
contact, la décision est explicite (`decisionDistante`, `src/lib/sauvegarde.js`) :

- état distant au format courant écrit par un autre appareil : il est appliqué ;
- format **plus récent** ou **illisible** : rien n'est écrasé ni envoyé, un
  bandeau explique pourquoi ;
- état écrit par une **ancienne version** de l'application alors que la
  sauvegarde locale est migrée : il ne la remplace pas en silence, et l'envoi
  automatique s'arrête jusqu'à ce que vous choisissiez d'écraser la sauvegarde
  en ligne ;
- migration locale en attente de confirmation : la synchronisation attend.

Un horodatage ne suffit pas à arbitrer deux éditions concurrentes sur deux
appareils : le projet ne prétend pas les résoudre, il évite seulement de perdre
une sauvegarde sans le dire.

Côté base (`src/lib/nuage.js`), la table `progressions` n'est **jamais** exposée
directement : RLS active, aucune policy, aucun droit pour `anon`. Tout passe par
deux fonctions `SECURITY DEFINER` — `charger_progression(code)` et
`enregistrer_progression(code, etat)` — ce qui rend impossible l'énumération des
runs des autres joueurs. Les avertissements du linter Supabase sur ces deux
fonctions publiques sont donc attendus : c'est la porte d'entrée voulue.

La clé Supabase embarquée dans le bundle est la clé *publiable*, faite pour ça.
`VITE_SUPABASE_URL` et `VITE_SUPABASE_KEY` permettent de pointer ailleurs ; sans
configuration, le panneau de synchro ne s'affiche pas du tout.

## Design

Interface fantasy premium dans la continuité de
[`Y0hark/solasta-build-planner`](https://github.com/Y0hark/solasta-build-planner) :
fond d'encre texturé, halos de bougie, plaques sombres à liseré d'or, équerres
décoratives, titres gravés. Le décor de fond est animé (`src/components/
FondAnime.jsx`) : trois nappes de lumière qui dérivent, un cercle d'invocation
en rotation très lente, et des braises en `<canvas>` qui montent — leurs teintes
sont lues dans les variables du thème actif, et le canvas se met en pause quand
l'onglet passe en arrière-plan. Quatre thèmes (Grimoire, Flagelleur, Avernus,
Parchemin) définis par variables CSS dans `src/index.css` et mémorisés localement.

Les animations respectent `prefers-reduced-motion`.
