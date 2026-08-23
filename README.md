# BG3 Honor Run Tracker

Application web statique pour suivre une run **Mode Honneur** de Baldur's Gate 3 :
les 4 builds de l'équipe, leur leveling 1 → 12, les items à récupérer acte par
acte, les lieux où les trouver et les checklists de fin d'acte.

Aucun backend, aucun compte : la progression est stockée dans le `localStorage`
du navigateur, et le site est publiable tel quel sur GitHub Pages.

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
| `/items` | Catalogue filtrable (acte, personnage, priorité, statut, recherche) |
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
npm test         # tests unitaires (Vitest)
```

## Publier sur GitHub Pages

Le site est prévu pour `https://<user>.github.io/bg3-dream-team/`.

1. `base` est fixé à `/bg3-dream-team/` dans `vite.config.js`. **Si le dépôt est
   renommé, mettre cette valeur à jour** — sinon les assets pointent à côté.
2. `npm run build` génère `dist/`, puis copie `index.html` en `404.html` :
   GitHub Pages ne connaît pas les routes du client, et sert cette page en repli
   pour que React Router reprenne la main sur `/items`, `/builds/…`, etc.
3. Publication manuelle sur la branche `gh-pages` :

   ```bash
   npm run deploy
   ```

4. Dans **Settings → Pages** du dépôt, choisir la branche `gh-pages` (dossier
   `/`) comme source.

L'automatisation du déploiement (workflow GitHub Actions, garde-fous de
production) est le périmètre du ticket **4/4 — Infra**.

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
```

### Données

Tout vit dans `src/data/` — aucun appel réseau, aucun scraping. Les entrées dont
la source n'est pas encore vérifiée portent `aConfirmer: true` et `lieu: null` :
l'interface affiche alors « Source à confirmer » et « À localiser » plutôt
qu'une information fausse. Un lien absent (`wiki: null`, `carte: null`) s'affiche
« Lien à compléter » : jamais de lien mort.

Aucune image ni carte du jeu n'est copiée dans le dépôt : les zones renvoient
vers le wiki communautaire et vers des cartes interactives externes.

Le catalogue complet (tous les slots, sources vérifiées) est encodé au ticket
**2/4 — Data**.

### Progression

Statuts possibles d'un item : **À récupérer**, **Obtenu**, **Raté**,
**Remplacé**. « Obtenu » et « Remplacé » comptent comme résolus dans les barres
de progression ; « Raté » reste visible dans la section *Risques* du dashboard.

L'état est écrit dans `localStorage` sous la clé `bg3-progression` (le thème sous
`bg3-theme`). Si le stockage est indisponible — navigation privée, stockage
refusé — l'application reste utilisable et l'indique par un bandeau discret.
Le bouton **Reset progression** du dashboard demande confirmation avant d'effacer.

## Design

Interface fantasy premium dans la continuité de
[`Y0hark/solasta-build-planner`](https://github.com/Y0hark/solasta-build-planner) :
fond d'encre texturé, halos de bougie, plaques sombres à liseré d'or, équerres
décoratives, titres gravés. Quatre thèmes (Grimoire, Flagelleur, Avernus,
Parchemin) définis par variables CSS dans `src/index.css` et mémorisés localement.

Les animations respectent `prefers-reduced-motion`.
