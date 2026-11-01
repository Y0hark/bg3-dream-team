# Workflow Prompt Queue → exécuteur → PR (Follow-up 4/4)

Documentation seule : aucun code applicatif, aucun secret, aucun déploiement.

## Diagnostic

| Symptôme | Cause constatée | Emplacement responsable |
|---|---|---|
| L’agent n’a reçu que le titre du ticket 1/5 et a cherché une issue GitHub ou un fichier | Le corps (CTX/SCOPE/REFS/SPEC/GUARD/DONE-WHEN) n’existe que dans Notion ; le skill d’exécution n’imposait ni lecture du corps par ID, ni arrêt sur payload incomplet | Skill utilisateur `~/.claude/skills/execute-ticket` (hors de ce dépôt) |
| Tickets restés `Ready` après création des PR | Aucune règle de retour de statut dans ce skill ; le seul autre skill (`execute-reddy-ticket`) est limité à `Y0hark/reddy` | Même skill |
| Dépôt BG3 non routable | Le champ `repo` de la Prompt Queue n’a pas d’option BG3 (lumiere, CoStory, El Caldito, SG Digital, y0hark-reddy) | Schéma Notion : routage explicite requis |

Le correctif vit donc dans le skill, pas dans l’application : aucun skill n’est ajouté à ce dépôt.

## Correctif (skill `execute-ticket`)

- `references/notion-sync.md` : payload minimal, lecture du corps par ID, politique de statuts.
- `scripts/ticket-payload.sh` : `check` (payload) et `transition` (statuts), purs, sans réseau.
- `scripts/test-ticket-payload.sh` : 22 cas (titre seul, corps absent, repo absent/inconnu, PR créée, création échouée, reprise idempotente, Done sans merge, Blocked sans raison…).
- `SKILL.md`, Phase 0 : renvoi vers ces garde-fous.

## Politique PR versus Done

- `Ready` → `Running` : à la prise en charge réelle.
- `Running` → `PR` : seulement avec l’URL d’une PR effectivement créée.
- `PR` → `Done` : merge vérifié **et** DONE-WHEN prouvés. Sinon le ticket reste `PR`.
- `Blocked` : obstacle réel, raison écrite.
- Droits Notion absents : le résultat GitHub est conservé, la synchro est signalée en échec, jamais simulée.
- `Auto push` = NO n’interdit pas la PR demandée explicitement par l’utilisateur ; la PR n’est jamais fusionnée par l’agent.

## État des cinq tickets UX (vérifié via `gh`, 2026-11-01)

| Ticket | Branche Notion | PR | État GitHub |
|---|---|---|---|
| UX 1/5 | `feat/bg3-item-catalog-fr` | #1 | MERGED |
| UX 2/5 | `feat/bg3-visual-inventory` | #2 | MERGED |
| UX 3/5 | `feat/bg3-acquisition-alerts` | #3 | MERGED |
| UX 4/5 | `feat/bg3-team-inventory` | #5 (« UX 4/5 + 5/5 ») | MERGED (branche contenue dans `main`) |
| UX 5/5 | `feat/bg3-run-mode` | #5 (#4 fermée, remplacée) | MERGED |

Ils restent en `PR` dans Notion : le merge est vérifié, mais les DONE-WHEN de chaque ticket (captures 360/1280 px, parcours clavier, README) n’ont pas été revérifiés ici. Le passage à `Done` est laissé à la revue manuelle.
