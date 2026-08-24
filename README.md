# BG3 Honor Run Tracker

Application web statique pour suivre une run **Mode Honneur** de Baldur's Gate 3 :
les 4 builds de l'équipe, leur leveling 1 → 12, les items à récupérer acte par
acte, les lieux où les trouver et les checklists de fin d'acte.

Aucun compte : la progression vit dans le `localStorage` du navigateur, et le
site est publiable tel quel sur GitHub Pages. Une **sauvegarde en ligne**
facultative (Supabase, offre gratuite) permet de retrouver la run sur un autre
appareil, ou de la partager avec la team, via un simple code de run.

## L'équipe

| Personnage | Build | Split | Rôle |
| --- | --- | --- | --- |
| Sam | Freeze Thunder Frontliner | Clerc de la Tempête 8 / Magicien Chantelame 4 | Hybride / Tank magique / Contrôle |
| Baptiste | Sorlock Eldritch Control | Occultiste 2 / Ensorceleur 7 / Roublard Voleur 3 | DPS distance |
| Lilian | Arcane Archer / Gloom Stalker | Guerrier Archer Arcanique 8 / Rôdeur Traque-Ténèbres 4 | DPS distance / opener |
| Sidekick | Lore Bard / Life Cleric Support | Barde du Savoir 10 / Clerc de la Vie 2 | Support / contrôle |

## Sections

| Route | Contenu |
| --- | --- |
| `/` | Dashboard : progression globale, par acte et par personnage, risques et urgences |
| `/builds` | Les 4 cartes de build |
| `/builds/:id` | Fiche détaillée : stats, dons, leveling 1 → 12, boucle de jeu, synergies, vigilance, loadout |
| `/loadout` | Plan d'équipement par personnage, slot par slot |
| `/items` | Catalogue filtrable (acte, personnage, priorité, statut, recherche), groupé par acte |
| `/lieux` | Zones de la run avec liens wiki et cartes interactives externes |
| `/checklist` | Checklists à valider avant chaque point de non-retour |

## Lancer en local

```bash
npm install
npm run dev      # http://localhost:5173/bg3-dream-team/
```

Autres scripts :

```bash
npm run build    # build de production dans dist/ + 404.html (repli SPA)
npm run preview  # sert le build de production localement
npm test         # tests unitaires + rendu des routes (Vitest)
```

## Publier sur GitHub Pages

Le site est publié sur `https://<user>.github.io/bg3-dream-team/`.

### Déploiement automatique

`.github/workflows/deploy.yml` publie le site à chaque push sur `main` (et à la
demande via **Actions → Déploiement GitHub Pages → Run workflow**) : `npm ci`,
`npm test`, `npm run build`, puis envoi de `dist/` à Pages. Les tests gardent la
porte — un build vert mais des données incohérentes ne part pas en ligne.

Une seule chose à faire côté dépôt, une fois : **Settings → Pages → Source =
« GitHub Actions »**.

### Ce dont dépend le build

1. `base` est fixé à `/bg3-dream-team/` dans `vite.config.js`. **Si le dépôt est
   renommé, mettre cette valeur à jour** — sinon les assets pointent à côté.
2. `npm run build` génère `dist/`, puis copie `index.html` en `404.html` :
   GitHub Pages ne connaît pas les routes du client, et sert cette page en repli
   pour que React Router reprenne la main sur `/items`, `/builds/…`, etc.
3. `public/.nojekyll` (vide) part dans `dist/` : sans lui, Pages passe la sortie
   par Jekyll, qui ignore les fichiers et dossiers commençant par `_`.

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
  data/               Données de la run : actes, builds, items, lieux, checklists
  lib/                Logique pure : progression, filtres, thèmes, accents, stockage
  hooks/              useProgression (contexte + persistance), useTheme, useRevelation
  components/         Cartes, badges, filtres, barres de progression…
  pages/              Une page par section
  rendu.test.js       Monte chaque route une fois : garde-fou anti-régression
```

### Données

Tout vit dans `src/data/` — aucun appel réseau, aucun scraping. Le catalogue
couvre **53 items** répartis sur **32 zones** : pour chaque personnage, tous les
slots portables (casque, cape, armure, gants, bottes, amulette, anneaux, arme,
bouclier), acte par acte.

Chaque source vient de la section « Where to find » de la fiche `bg3.wiki` de
l'objet : acte, zone, marchand ou conteneur, et la condition de déblocage quand
il y en a une (quête préalable, stock spécial, PNJ à ne pas tuer). Les entrées
dont la disponibilité dépend d'un aléa de run — un PNJ mort, un boss tué sous le
mauvais état — gardent `aConfirmer: true` : l'interface affiche « Source à
confirmer » plutôt qu'une promesse qui peut sauter. Un item sans localisation
(`lieu: null`) s'affiche « À localiser », un lien absent « Lien à compléter » :
jamais de lien mort.

Aucune image ni carte du jeu n'est copiée dans le dépôt : les zones renvoient
vers le wiki communautaire et vers les trois cartes interactives MapGenie
(Contrée sauvage, Terres maudites, Baldur's Gate). Les intérieurs et l'Ombreterre
n'y ont pas de carte : ils portent `carte: null` volontairement.

Les arbitrages de build laissés ouverts au cadrage sont tranchés dans
`builds.js`, avec la raison dans le champ `note` — et c'est le loadout qui
tranche : l'`Amulet of Greater Health` (CON 23) rend une amélioration de CON
inutile chez Sam, `Birthright` (CHA +2) rend une troisième amélioration de CHA
inutile chez le Sidekick. Les dons sont placés au niveau de **classe** qui les
donne, pas au niveau de personnage : un test le vérifie.

### Progression

Statuts possibles d'un item : **À récupérer**, **Obtenu**, **Raté**,
**Remplacé**. « Obtenu » et « Remplacé » comptent comme résolus dans les barres
de progression ; « Raté » reste visible dans la section *Risques* du dashboard.

Le dashboard agrège les deux dimensions suivies : les items (globalement, par
acte et par personnage) et les checklists de fin d'acte. Un acte dont la
checklist est entièrement cochée est marqué « Acte validé ».

Les filtres du catalogue vivent dans la query string (`/items?acte=2&statut=rate`) :
une vue filtrée survit à un rechargement et s'envoie telle quelle à un
coéquipier. Une valeur inconnue dans l'URL — acte inexistant, statut renommé —
retombe sur « tous » plutôt que de vider le catalogue.

L'état est écrit dans `localStorage` sous la clé `bg3-progression` (le thème sous
`bg3-theme`). Si le stockage est indisponible — navigation privée, stockage
refusé — l'application reste utilisable et l'indique par un bandeau discret.
Le bouton **Reset progression** du dashboard demande confirmation avant d'effacer.

### Sauvegarde en ligne

Le bouton **nuage** de la barre de navigation ouvre le panneau de sauvegarde.
Deux gestes : générer un **code de run** (`grimoire-ardente-472`), ou coller
celui d'une run existante pour la rejoindre. Le code est la seule identité —
le partager, c'est partager la run, en lecture comme en écriture.

Le local reste la source immédiate : l'app fonctionne hors ligne, et l'envoi au
serveur se fait en tâche de fond après 1,5 s d'inactivité. Au chargement, si
l'horodatage du serveur a bougé depuis la dernière fois qu'on l'a vu, c'est
qu'un autre appareil a écrit entre-temps : sa version fait foi. Un serveur
injoignable n'empêche rien, il allume juste la pastille rouge du panneau.

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
