# Audit des acquisitions — objets, PNJ et questlines (Follow-up 2/4)

Rapport de recherche. Il ne modifie aucune donnée du site : le code n’est pas corrigé ici (voir « Erreurs et approximations »), et l’intégration relève du Follow-up 3/4.

> **Spoilers.** Les chaînes de quêtes et les fiches d’objets sont repliées. Le reste du document ne cite que des noms.

Version structurée : [`audit-acquisitions.json`](./audit-acquisitions.json) (même contenu, lisible par machine, garde de couverture dans `src/data/audit-acquisitions.test.js`).

## 1. Méthode et limites

- Source unique : le wiki BG3 (bg3.wiki), texte anglais, via l’API MediaWiki le 2026-11-01. Chaque citation porte la révision de la page. Base de code auditée : `4fea6fe` (`origin/main`).
- 154 pages consultées (liste en section 9) : la page de chaque objet, plus les pages de vendeur, de quête, de PNJ ou de lieu pertinentes. Pour une page d’objet, les champs d’acquisition (« where to find »), les notes et les butins ont été lus ; pour une page de vendeur, de quête ou de PNJ, les sections d’implication, de stock et de butin. Les pages restantes de ces articles (combat, dialogues, anecdotes) n’ont pas été lues en détail.
- Chaque extrait est repris tel que le wikitexte le donne après nettoyage des modèles ; le générateur échoue si un passage est introuvable, donc aucun extrait n’est reconstitué de mémoire.
- **Rien n’est vérifié en jeu.** Les hotfix postérieurs aux révisions citées ne sont pas couverts. Aucune date de vérification n’est revendiquée au-delà de la date de récupération.
- Trois niveaux d’affirmation : **fait sourcé** (extrait cité), **inférence explicite** (marquée « Inférence »), **inconnu** (section 7).
- Quatre notions séparées dans chaque chaîne : obtenir l’**original**, **déverrouiller** le marchand, **maintenir** le marchand vivant, disposer des **copies**. Rencontrer un PNJ n’est jamais traité comme la preuve d’un achat.

## 2. Liste figée des IDs actifs et couverture

Liste construite depuis `src/data/objets.js` à `4fea6fe` : **104 IDs actifs**, tous référencés par au moins une ligne de `src/data/loadouts.js` (186 lignes, 95 alternatives, situationnels ou réserves). Aucun ID n’est omis : la matrice les contient tous. Huit autres lignes de loadout (« objet: null ») sont des emplacements volontairement libres et ne comptent pas comme objets.

| Verdict de couverture | Nombre | Sens exact |
| --- | ---: | --- |
| Audités avec contraintes | 73 | Au moins une condition amont, un vendeur ou un déblocage a été trouvé. |
| Audités sans contrainte spécifique identifiée | 28 | Page de l’objet et du porteur ou du lieu lues, aucune contrainte amont trouvée. **Ce n’est pas « aucun risque »** : seul ce qui est écrit sur ces pages est couvert. |
| Non résolus | 3 | Une question bloquante reste ouverte ; voir section 7. |

Non résolus : `rhapsody`, `disintegrating-night-walkers`, `spell-savant-amulet`.

<details><summary>Les 104 IDs, avec rôles et rang</summary>

| ID | Objet | Rôles (rang) | Verdict |
| --- | --- | --- | --- |
| `the-spellsparkler` | The Spellsparkler | Sorcier (principal) | Audités avec contraintes |
| `melfs-first-staff` | Melf’s First Staff | Sorcier (alternative) | Audités sans contrainte spécifique identifiée |
| `markoheshkir` | Markoheshkir | Sorcier (principal), Sidekick (principal) | Audités avec contraintes |
| `staff-of-spellpower` | Staff of Spellpower | Sorcier (alternative), Sidekick (alternative) | Audités avec contraintes |
| `rhapsody` | Rhapsody | Sorcier (situationnel) | Non résolus |
| `phalar-aluve` | Phalar Aluve | Sidekick (principal), Sidekick (alternative) | Audités sans contrainte spécifique identifiée |
| `unseen-menace` | Unseen Menace | Paladin (principal), Paladin (alternative) | Audités avec contraintes |
| `sword-of-justice` | Sword of Justice | Paladin (alternative) | Audités avec contraintes |
| `charge-bound-warhammer` | Charge-Bound Warhammer | Paladin (alternative) | Audités avec contraintes |
| `halberd-of-vigilance` | Halberd of Vigilance | Paladin (alternative) | Audités avec contraintes |
| `drakethroat-glaive` | Drakethroat Glaive | Paladin (situationnel) | Audités avec contraintes |
| `nyrulna` | Nyrulna | Paladin (principal) | Audités avec contraintes |
| `bow-of-awareness` | Bow of Awareness | Sorcier (principal), Sorcier (alternative), Paladin (alternative), Moine (principal), Sidekick (principal) | Audités avec contraintes |
| `darkfire-shortbow` | Darkfire Shortbow | Sorcier (alternative), Paladin (principal), Moine (principal), Moine (alternative), Sidekick (principal) | Audités avec contraintes |
| `hellrider-longbow` | Hellrider Longbow | Sorcier (principal), Moine (principal), Sidekick (principal) | Audités avec contraintes |
| `the-dead-shot` | The Dead Shot | Paladin (principal) | Audités sans contrainte spécifique identifiée |
| `sentinel-shield` | Sentinel Shield | Paladin (situationnel), Sidekick (principal) | Audités avec contraintes |
| `ketherics-shield` | Ketheric’s Shield | Sidekick (alternative) | Audités sans contrainte spécifique identifiée |
| `the-lifebringer` | The Lifebringer | Sorcier (principal) | Audités sans contrainte spécifique identifiée |
| `shadespell-circlet` | The Shadespell Circlet | Sorcier (alternative) | Audités avec contraintes |
| `hat-of-fire-acuity` | Hat of Fire Acuity | Sorcier (principal) | Audités avec contraintes |
| `fistbreaker-helm` | Fistbreaker Helm | Sorcier (alternative) | Audités avec contraintes |
| `hood-of-the-weave` | Hood of the Weave | Sorcier (alternative), Sidekick (principal) | Audités avec contraintes |
| `birthright` | Birthright | Sorcier (alternative), Paladin (alternative), Sidekick (alternative) | Audités avec contraintes |
| `pyroquickness-hat` | Pyroquickness Hat | Sorcier (situationnel) | Audités avec contraintes |
| `haste-helm` | Haste Helm | Paladin (principal), Moine (principal), Moine (alternative) | Audités sans contrainte spécifique identifiée |
| `grymskull-helm` | Grymskull Helm | Paladin (alternative) | Audités sans contrainte spécifique identifiée |
| `mask-of-soul-perception` | Mask of Soul Perception | Paladin (principal), Moine (principal) | Audités avec contraintes |
| `cloak-of-protection` | Cloak of Protection | Sorcier (principal), Sorcier (alternative), Paladin (principal), Paladin (alternative), Moine (principal), Moine (alternative), Sidekick (principal), Sidekick (alternative) | Audités avec contraintes |
| `cloak-of-the-weave` | Cloak of the Weave | Sorcier (principal), Sidekick (principal) | Audités avec contraintes |
| `cloak-of-displacement` | Cloak of Displacement | Sorcier (alternative), Paladin (principal), Moine (principal), Sidekick (alternative) | Audités sans contrainte spécifique identifiée |
| `cloak-elemental-absorption` | Cloak of Elemental Absorption | Sorcier (situationnel) | Audités sans contrainte spécifique identifiée |
| `thunderskin-cloak` | Thunderskin Cloak | Paladin (situationnel) | Audités avec contraintes |
| `vivacious-cloak` | Vivacious Cloak | Paladin (situationnel) | Audités sans contrainte spécifique identifiée |
| `cloak-cunning-brume` | Cloak of Cunning Brume | Moine (situationnel) | Audités avec contraintes |
| `mantle-holy-warrior` | Mantle of the Holy Warrior | Sidekick (situationnel) | Audités avec contraintes |
| `protecty-sparkswall` | The Protecty Sparkswall | Sorcier (principal), Sorcier (alternative) | Audités sans contrainte spécifique identifiée |
| `robe-exquisite-focus` | Robe of Exquisite Focus | Sorcier (alternative) | Audités avec contraintes |
| `robe-of-the-weave` | Robe of the Weave | Sorcier (principal) | Audités avec contraintes |
| `robe-supreme-defences` | Robe of Supreme Defences | Sorcier (alternative) | Audités avec contraintes |
| `armure-adamantine` | Adamantine Splint Armour | Paladin (principal), Sidekick (principal) | Audités avec contraintes |
| `armour-of-persistence` | Armour of Persistence | Paladin (principal), Sidekick (principal) | Audités avec contraintes |
| `yuan-ti-scale-mail` | Yuan-Ti Scale Mail | Paladin (alternative) | Audités avec contraintes |
| `the-graceful-cloth` | The Graceful Cloth | Moine (principal), Moine (alternative) | Audités avec contraintes |
| `vest-soul-rejuvenation` | Vest of Soul Rejuvenation | Moine (principal) | Audités avec contraintes |
| `spidersilk-armour` | Spidersilk Armour | Sidekick (alternative) | Audités avec contraintes |
| `bracers-of-defence` | Bracers of Defence | Sorcier (principal), Sorcier (alternative) | Audités sans contrainte spécifique identifiée |
| `gloves-of-dexterity` | Gloves of Dexterity | Sorcier (alternative) | Audités avec contraintes |
| `daredevil-gloves` | Daredevil Gloves | Sorcier (alternative) | Audités avec contraintes |
| `spellmight-gloves` | Spellmight Gloves | Sorcier (principal) | Audités avec contraintes |
| `helldusk-gloves` | Helldusk Gloves | Sorcier (alternative) | Audités avec contraintes |
| `flawed-helldusk-gloves` | Flawed Helldusk Gloves | Paladin (principal), Paladin (alternative), Moine (principal), Moine (alternative) | Audités avec contraintes |
| `gloves-belligerent-skies` | Gloves of Belligerent Skies | Sorcier (situationnel) | Audités sans contrainte spécifique identifiée |
| `gloves-growling-underdog` | Gloves of the Growling Underdog | Paladin (principal), Paladin (alternative) | Audités sans contrainte spécifique identifiée |
| `legacy-of-the-masters` | Legacy of the Masters | Paladin (principal) | Audités avec contraintes |
| `gloves-sparkle-hands` | The Sparkle Hands | Moine (principal), Moine (alternative) | Audités sans contrainte spécifique identifiée |
| `gloves-cinder-sizzle` | Gloves of Cinder and Sizzle | Moine (alternative) | Audités avec contraintes |
| `gloves-soul-catching` | Gloves of Soul Catching | Moine (principal) | Audités avec contraintes |
| `hellriders-pride` | Hellrider’s Pride | Sidekick (principal), Sidekick (alternative) | Audités avec contraintes |
| `reviving-hands` | The Reviving Hands | Sidekick (principal) | Audités avec contraintes |
| `disintegrating-night-walkers` | Disintegrating Night Walkers | Sorcier (principal), Paladin (alternative), Moine (principal), Moine (alternative), Sidekick (principal) | Non résolus |
| `boots-stormy-clamour` | Boots of Stormy Clamour | Sorcier (alternative) | Audités avec contraintes |
| `boots-of-speed` | Boots of Speed | Paladin (principal), Paladin (alternative), Moine (alternative) | Audités avec contraintes |
| `boots-of-persistence` | Boots of Persistence | Paladin (principal) | Audités avec contraintes |
| `boots-aid-comfort` | Boots of Aid and Comfort | Sidekick (alternative) | Audités avec contraintes |
| `boots-uninhibited-kushigo` | Boots of Uninhibited Kushigo | Moine (principal) | Audités avec contraintes |
| `amulet-misty-step` | Amulet of Misty Step | Sorcier (principal), Moine (alternative) | Audités avec contraintes |
| `pearl-of-power-amulet` | Pearl of Power Amulet | Sorcier (reserve) | Audités avec contraintes |
| `spineshudder-amulet` | Spineshudder Amulet | Sorcier (principal) | Audités sans contrainte spécifique identifiée |
| `spellcrux-amulet` | Spellcrux Amulet | Sorcier (reserve) | Audités sans contrainte spécifique identifiée |
| `amulet-of-the-harpers` | Amulet of the Harpers | Sorcier (alternative), Paladin (principal), Moine (principal), Sidekick (principal) | Audités avec contraintes |
| `amulet-of-the-devout` | Amulet of the Devout | Sorcier (alternative), Sidekick (principal) | Audités avec contraintes |
| `amulet-greater-health` | Amulet of Greater Health | Sorcier (alternative), Paladin (alternative), Moine (principal), Sidekick (alternative) | Audités avec contraintes |
| `fey-semblance-amulet` | Fey Semblance Amulet | Paladin (principal), Moine (alternative) | Audités avec contraintes |
| `surgeons-subjugation-amulet` | Surgeon’s Subjugation Amulet | Paladin (situationnel), Moine (situationnel) | Audités sans contrainte spécifique identifiée |
| `periapt-wound-closure` | Periapt of Wound Closure | Paladin (principal), Paladin (alternative), Moine (principal) | Audités avec contraintes |
| `broodmothers-revenge` | Broodmother’s Revenge | Paladin (alternative) | Audités avec contraintes |
| `amulet-of-restoration` | Amulet of Restoration | Sidekick (principal), Sidekick (alternative) | Audités avec contraintes |
| `sentient-amulet-rare` | Sentient Amulet (Rare) | Moine (reserve) | Audités sans contrainte spécifique identifiée |
| `necklace-elemental-augmentation` | Necklace of Elemental Augmentation | Sorcier (reserve) | Audités sans contrainte spécifique identifiée |
| `spell-savant-amulet` | Spell Savant Amulet | Paladin (situationnel) | Non résolus |
| `moondrop-pendant` | Moondrop Pendant | Paladin (situationnel) | Audités avec contraintes |
| `ring-of-protection` | Ring of Protection | Sorcier (principal), Moine (principal), Sidekick (principal) | Audités avec contraintes |
| `crushers-ring` | Crusher’s Ring | Sorcier (principal), Moine (principal) | Audités sans contrainte spécifique identifiée |
| `callous-glow-ring` | Callous Glow Ring | Sorcier (principal), Moine (alternative) | Audités sans contrainte spécifique identifiée |
| `coruscation-ring` | Coruscation Ring | Sorcier (principal) | Audités sans contrainte spécifique identifiée |
| `ring-mental-inhibition` | Ring of Mental Inhibition | Sorcier (situationnel), Sidekick (principal) | Audités sans contrainte spécifique identifiée |
| `ring-spiteful-thunder` | Ring of Spiteful Thunder | Sorcier (situationnel) | Audités avec contraintes |
| `ring-free-action` | Ring of Free Action | Paladin (situationnel), Moine (alternative), Sidekick (alternative) | Audités avec contraintes |
| `risky-ring` | Risky Ring | Paladin (situationnel), Moine (situationnel) | Audités avec contraintes |
| `shadow-cloaked-ring` | Shadow-Cloaked Ring | Moine (principal) | Audités sans contrainte spécifique identifiée |
| `caustic-band` | Caustic Band | Paladin (principal) | Audités avec contraintes |
| `strange-conduit-ring` | Strange Conduit Ring | Paladin (principal) | Audités sans contrainte spécifique identifiée |
| `killers-sweetheart` | Killer’s Sweetheart | Paladin (alternative), Paladin (principal) | Audités sans contrainte spécifique identifiée |
| `ring-arcane-synergy` | Ring of Arcane Synergy | Paladin (alternative) | Audités avec contraintes |
| `ring-elemental-infusion` | Ring of Elemental Infusion | Paladin (situationnel) | Audités sans contrainte spécifique identifiée |
| `band-mystic-scoundrel` | Band of the Mystic Scoundrel | Paladin (situationnel) | Audités avec contraintes |
| `ring-of-regeneration` | Ring of Regeneration | Paladin (situationnel), Sidekick (situationnel) | Audités avec contraintes |
| `whispering-promise` | The Whispering Promise | Sidekick (principal) | Audités avec contraintes |
| `cap-of-curing` | Cap of Curing | Sidekick (alternative) | Audités avec contraintes |
| `auntie-ethels-hair` | Auntie Ethel’s Hair | Sorcier (principal) | Audités avec contraintes |
| `elixir-hill-giant-strength` | Elixir of Hill Giant Strength | Moine (principal) | Audités avec contraintes |
| `elixir-cloud-giant-strength` | Elixir of Cloud Giant Strength | Moine (alternative) | Audités avec contraintes |
| `gauntlets-hill-giant-strength` | Gauntlets of Hill Giant Strength | Moine (alternative) | Audités avec contraintes |

</details>

## 3. Chaînes transversales

<details><summary><strong>Dammon : survie en Acte I, Ultime Lueur en Acte II, Forge des Neuf en Acte III</strong> — `charge-bound-warhammer`, `darkfire-shortbow`, `flawed-helldusk-gloves`, `armour-of-persistence`, `boots-of-persistence`, `legacy-of-the-masters`</summary>

#### 1. Les réfugiés doivent survivre à la quête « Sauver les réfugiés » (Acte I)
*Nature : maintenir-le-marchand-vivant.*

Arrêter le rituel (via la quête Kagha OU en tuant les chefs gobelins) ne suffit pas à sécuriser le passage : la page de la quête précise que les gobelins doivent être vaincus pour assurer le passage des tieflings. La quête échoue automatiquement (réfugiés tués, bosquet scellé) si le groupe part pour le Sentier de Rosemorne ou prend l’ascenseur de Grymforge sans l’avoir résolue ; se ranger du côté des gobelins contre le bosquet tue aussi les réfugiés.

> « The Hollow [note : Dammon shares the fate of the other tiefling refugees in Save the Refugees and becomes unavailable between its conclusion and reaching Last Light Inn.] in Act One. » — [Dammon](https://bg3.wiki/wiki/Dammon) (rév. 414844)
> « The ritual can be stopped by either killing the goblin leaders in the quest Defeat the Goblins, or dealing with Kagha and the Shadow Druids in the quest Investigate Kagha. However, in order to ensure safe passage for the tieflings, the goblins must be defeated. » — [Save the Refugees](https://bg3.wiki/wiki/Save_the_Refugees) (rév. 422653)
> « … o finish business before proceeding. If the party continue, the quest automatically completes with the refugees being killed and the grove sealed (as if one sided/let the Shadow druids seal the grove). Despite the grove being sealed, it is still possible to enter: starting from the location of where one finds Edowin, i … » — [Save the Refugees](https://bg3.wiki/wiki/Save_the_Refugees) (rév. 422653)
> « "We decided to help the goblins burn down the grove - along with anyone opposing the will of the Absolute." » — [Save the Refugees](https://bg3.wiki/wiki/Save_the_Refugees) (rév. 422653)

#### 2. L’Ultime Lueur doit rester protégée (Acte II, « Résoudre l’enlèvement »)
*Nature : maintenir-le-marchand-vivant.*

Si Isobel est capturée ou tuée, l’auberge tombe : tous ses occupants, hors le groupe et Jaheira, sont tués ou transformés par la malédiction, et Dammon (« si vivant ») figure dans la liste des ennemis maudits. Tuer le Chant de la nuit (Nightsong) fait aussi s’effondrer la protection d’Isobel et tue tous ceux qui sont à l’intérieur. Inférence explicite : Talli, Mattis et les autres occupants du même lieu suivent le même sort ; la page de Talli le dit pour elle.

> « If Isobel is captured or killed, the Inn falls. Everyone besides the party and Jaheira, who are protected by Selune's blessing, are either killed immediately or transformed by the shadow curse. The party has to face a massive battle against the shadow cursed residents: » — [Resolve the Abduction](https://bg3.wiki/wiki/Resolve_the_Abduction) (rév. 422327)
> « [Battle at the Inn > The Fallen Inn] Dammon (if alive). » — [Resolve the Abduction](https://bg3.wiki/wiki/Resolve_the_Abduction) (rév. 422327)
> « If the Nightsong is killed, Isobel becomes overwhelmed and unable to sustain her protection over the Inn, killing her and all others within. » — [Isobel](https://bg3.wiki/wiki/Isobel) (rév. 431344)
> « When Marcus attacks the inn and attempts to kidnap Isobel during Resolve the Abduction, Talli always fails the save and is Impaled for the remainder of the battle. If Isobel is not saved, she and everyone in Last Light Inn turn into Shadow-Cursed Undead, save for Jaheira. » — [Talli](https://bg3.wiki/wiki/Talli) (rév. 434270)

#### 3. Fabrication Helldusk à l’Ultime Lueur : avant le Shadowfell
*Nature : echeance.*

En Acte II, toute fabrication spéciale (pièces Flawed Helldusk avec Fer/Alliage infernal) doit être faite avant l’entrée dans le Shadowfell (Gantelet de Shar). Ensuite, s’il survit, seul son commerce reste accessible. Cette échéance n’est donc pas la fin de l’acte, et elle ne concerne que la fabrication, pas le stock vendu.

> « Within Act Two, any special equipment can only be crafted before the party enters the Shadowfell in Gauntlet of Shar. After this, if Dammon survives, he remains at Last Light Inn, but only his trading menu is available. » — [Dammon](https://bg3.wiki/wiki/Dammon) (rév. 414844)

#### 4. Départ de l’Acte II : Dammon indisponible dès l’entrée dans la colonie illithid
*Nature : echeance.*

Dammon devient indisponible quand le groupe entre dans la colonie illithid, vers la fin de l’Acte II, et ne réapparaît qu’à la Basse-Ville en Acte III (Forge des Neuf). Aucune source lue ne dit que les achats d’Acte II sont perdus : les stocks d’Acte III sont distincts (voir matrice).

> « Last Light Inn [note : Dammon becomes unavailable when the party enter the Mind Flayer Colony near the end of Act Two and only reappears in the Lower City in Act Three.] in Act Two. » — [Dammon](https://bg3.wiki/wiki/Dammon) (rév. 414844)
> « Forge of the Nine [note : A quest line involving Dammon and the Forge of the Nine appears to have been cut during development. See: Cut and unimplemented content#Dammon] in Act Three. » — [Dammon](https://bg3.wiki/wiki/Dammon) (rév. 414844)

#### 5. Stocks par acte
*Nature : copies.*

Acte I : Hunting Shortbow, Safeguard Shield (disponibles aux trois actes). Acte II : Charge-Bound Warhammer, Darkfire Shortbow (entre autres). Acte III : Armour of Persistence, Boots of Persistence, Legacy of the Masters. Les « achats d’Acte III » ne dépendent donc pas de l’Acte II, mais de la survie de bout en bout.

> « [Act One > Act Two] Charge-Bound Warhammer » — [Dammon](https://bg3.wiki/wiki/Dammon) (rév. 414844)
> « [Act Two > Act Three] Armour of Persistence » — [Dammon](https://bg3.wiki/wiki/Dammon) (rév. 414844)

**Ce que les sources n’exigent pas :**
- Karlach n’est pas exigée pour le commerce ordinaire : aucune page lue ne l’établit (la dépendance existe dans l’autre sens : sa quête « Le cœur de l’Enfer » bloque si Dammon meurt).
- Les réfugiés sauvés en Acte I ne sont pas les prisonniers à secourir en Acte II (« Sauver les tieflings ») : Dammon dépend de la première, pas de la seconde.

**Restes à vérifier :**
- Comportement exact si Dammon est présent mais le groupe a perdu Isobel après avoir déjà acheté : aucun passage lu ne dit qu’un achat déjà fait est repris (il n’y a pas de raison d’en douter, mais ce n’est pas écrit). *(pages : Dammon, Save_the_Refugees, Resolve_the_Abduction, Isobel ; portée : Achats d’Acte II seulement ; ne change pas la condition « Isobel sauvée » pour les achats futurs.)*
- La page de Dammon ne décrit pas son état en Acte III si le groupe est passé par l’effondrement de l’auberge en ayant ensuite tué tous les occupants : le cas « Dammon mort » est le seul que les sources établissent comme impossible (un mort ne commerce pas). *(pages : Dammon ; portée : Acte III : stock Armour/Boots of Persistence, Legacy of the Masters.)*

</details>

<details><summary><strong>Blurg → Omeluum → « Aider Omeluum à enquêter sur le parasite » → commerce</strong> — `boots-stormy-clamour`, `shadespell-circlet`, `pearl-of-power-amulet`, `amulet-misty-step`</summary>

#### 1. Rencontrer Omeluum (Acte I, colonie myconide)
*Nature : deverrouiller-le-marchand.*

Omeluum se rencontre en parlant à Blurg de la colonie myconide (Lac d’Ébène). Rencontrer le PNJ ne suffit pas : il ne commerce qu’après la quête.

> « The party can first meet Omeluum after talking to the Hobgoblin trader Blurg at the Myconid Colony. Blurg is a fellow scholar of the Society of Brilliance, who calls for Omeluum to help the party. Omeluum wonders what is so important that he be pulled away from tending to his Zurkhwood samples. Blurg then explains that … » — [Omeluum](https://bg3.wiki/wiki/Omeluum) (rév. 428216)

#### 2. Réunir les deux ingrédients (Langue de folie + Spores de Timmask)
*Nature : materiaux.*

La quête demande Tongue of Madness et Timmask Spores. La Tour arcanique les contient, mais la page de la quête documente d’autres méthodes : les spores se ramassent en s’approchant d’un champignon Timmask en tour par tour, et la Langue de folie s’achète à Derryth Bonecloak. La visite de la tour n’est donc pas obligatoire.

> « However, it is also possible to get both mushrooms without entering the tower. For Timmask Spores, the party can approach a Timmask mushroom in turn based mode and pick up the spores before they disappear. Tongue of Madness can be bought from Derryth Bonecloak. » — [Help Omeluum Investigate the Parasite](https://bg3.wiki/wiki/Help_Omeluum_Investigate_the_Parasite) (rév. 419477)
> « However, it is also possible to get both mushrooms without entering the tower. For Timmask Spores, the party can approach a Timmask mushroom in turn based mode and pick up the spores before they disappear. Tongue of Madness can be bought from Derryth Bonecloak. » — [Help Omeluum Investigate the Parasite](https://bg3.wiki/wiki/Help_Omeluum_Investigate_the_Parasite) (rév. 419477)

#### 3. Boire la potion, puis obtenir l’anneau de Mind-Shielding
*Nature : choix-de-quete.*

La potion échoue et renforce le têtard ; Omeluum propose alors son Ring of Mind-Shielding, qu’on peut acheter ou obtenir par jets (Persuasion, Intimidation, Performance, récit du nautiloïde). « Obtenir l’anneau par n’importe quel moyen » termine la quête, et Omeluum devient alors marchand. Quitter la zone avant la fin clôt la quête sans aide : l’achat n’est alors plus ouvert (inférence : la page de la quête ne parle pas du commerce dans ce cas).

> « Obtaining the ring by any means completes the quest Help Omeluum investigate the parasite, and Omeluum can then be traded with. [note : While Omeluum can be pickpocketed prior to trading, it teleports away after repeated pickpocket attempts.] » — [Omeluum](https://bg3.wiki/wiki/Omeluum) (rév. 428216)
> « Omeluum becomes a trader, with notable items like Pearl of Power Amulet and Creation's Echo in its inventory. » — [Help Omeluum Investigate the Parasite](https://bg3.wiki/wiki/Help_Omeluum_Investigate_the_Parasite) (rév. 419477)
> « "We left the area before Omeluum could help. We'll need to find a cure somewhere else." » — [Help Omeluum Investigate the Parasite](https://bg3.wiki/wiki/Help_Omeluum_Investigate_the_Parasite) (rév. 419477)

#### 4. Acheter en Acte I ; le sauvetage d’Acte III n’est pas une condition
*Nature : echeance.*

Le stock d’Omeluum inclut Boots of Stormy Clamour, The Shadespell Circlet et Pearl of Power Amulet. En Acte III, Omeluum peut être sauvé au Trône de fer, mais, une fois sauvé, il n’est plus un marchand ; ce sauvetage ne rend donc rien et ne conditionne pas un achat d’Acte I.

> « [Shop > Notable items sold] Boots of Stormy Clamour » — [Omeluum](https://bg3.wiki/wiki/Omeluum) (rév. 428216)
> « Once rescued, Omeluum teleports to the Lodge. Unlike Blurg, it can no longer be traded with, although it can be pickpocketed. To finish the quest Retrieve Omeluum, the party must speak with the illithid once more. Omeluum explains that the Society of Brilliance will not actively help the party in its further battles. B … » — [Omeluum](https://bg3.wiki/wiki/Omeluum) (rév. 428216)

#### 5. Amulet of Misty Step : source alternative exclusive
*Nature : alternative.*

L’amulette n’existe qu’en un exemplaire : coffre de Polma (Temple profané) OU stock d’Omeluum, selon ce qui est atteint en premier.

> « notes = * The amulet can only acquired once, at whichever of the two locations that is accessed first. It will not appear at the other location. » — [Amulet of Misty Step](https://bg3.wiki/wiki/Amulet_of_Misty_Step) (rév. 415916)

**Ce que les sources n’exigent pas :**
- Aller à la Tour arcanique n’est pas obligatoire (voir étape 2). Sauver Omeluum en Acte III n’est pas une condition d’achat.

**Restes à vérifier :**
- La page ne dit pas si Omeluum commerce encore quand le groupe a quitté la colonie sans terminer la quête mais y revient plus tard (le texte de fin de quête parle seulement d’un départ de la zone). *(pages : Omeluum, Help_Omeluum_Investigate_the_Parasite ; portée : Achats de Stormy Clamour / Shadespell Circlet / Pearl of Power : on ne sait pas si l’on peut « rattraper » après un départ.)*

</details>

<details><summary><strong>Bœuf étrange (Strange Ox) → Hat of Fire Acuity</strong> — `hat-of-fire-acuity`</summary>

#### 1. Acte I : ne pas le tuer
*Nature : maintenir-le-marchand-vivant.*

Le tuer au Bosquet ne donne pas le chapeau (il ne le porte pas encore) ; seul l’anneau Shapeshifter’s Boon tombe.

> « Slaying the Strange Ox at the Druid Grove will only reward the Shapeshifter's Boon Ring, because it does not have the Hat of Fire Acuity until reaching the Last Light Inn at the beginning of Act Two. » — [Hat of Fire Acuity](https://bg3.wiki/wiki/Hat_of_Fire_Acuity) (rév. 419370)

#### 2. Acte II / III : le chapeau ne s’obtient qu’en tuant le bœuf
*Nature : recuperer-l-original.*

Le butin du bœuf indique le chapeau « seulement s’il est tué en Acte II ou III ». Le rencontrer vivant n’est donc PAS obtenir le chapeau. En Acte III, l’issue « Aider le bœuf diabolique » laisse l’anneau (ou une potion), pas le chapeau.

> « Hat of Fire Acuity (only if killed in Act Two or Act Three) » — [Strange Ox](https://bg3.wiki/wiki/Strange_Ox) (rév. 434001)
> « … much indeed. Ta-ta!" The quest then ends and it disappears, leaving behind its Shapeshifter's Boon Ring and a Slightly Slimy Note. [note : If the Shapeshifter's Boon Ring was obtained earlier, the Ox leaves a random potion of moderate value in place of the ring.] If the party enters the Lower City before speaking to th … » — [Strange Ox](https://bg3.wiki/wiki/Strange_Ox) (rév. 434001)

#### 3. Précaution de combat à l’Ultime Lueur
*Nature : precaution.*

Questionner le bœuf à l’Ultime Lueur le fait redevenir un phasme et entrer en combat, dans l’écurie de Dammon (qui commente le cadavre si le bœuf est tué en Acte II). Précaution de combat, pas condition formelle d’acquisition.

> « … the interacting party member can continue asking questions. Questioning the Ox further causes it to revert to its native state: a cyan Phasm Ooze and enter combat with the party [note : The Strange Ox has a hidden passive that generates a radius Acid surface when struck.] [note : If the Strange Ox i … » — [Strange Ox](https://bg3.wiki/wiki/Strange_Ox) (rév. 434001)

#### 4. Deux rendez-vous, un seul bœuf
*Nature : alternative.*

Ultime Lueur (Acte II) ou colline de Rivington (Acte III). Si la protection de l’auberge tombe, le bœuf disparaît mais survit et se retrouve plus tard.

> « If the protection surrounding Last Light Inn crumbles and the Shadow Curse falls upon the area, the Strange Ox disappears but manages to survive and can be encountered later on. » — [Strange Ox](https://bg3.wiki/wiki/Strange_Ox) (rév. 434001)
> « If the Strange Ox survives into Act Three, it moves to Rivington on a hill west of the requisitioned barn. Approaching it triggers a 10 check to confirm its likeness. This time, the Ox is glad to see the party and has worried about the player character's health since the previous encounter. » — [Strange Ox](https://bg3.wiki/wiki/Strange_Ox) (rév. 434001)

**Ce que les sources n’exigent pas :**
- Le bœuf n’est pas à protéger de Dammon : ni la page de Dammon ni celle du bœuf n’imposent de condition liée à Dammon.

</details>

<details><summary><strong>Marchands de la Tour de Lunelevée / Hautelune (Acte II) : Roah, Lann Tarv, Araj, Talli</strong> — `drakethroat-glaive`, `ring-spiteful-thunder`, `halberd-of-vigilance`, `sentinel-shield`, `fistbreaker-helm`, `thunderskin-cloak`, `robe-exquisite-focus`, `ring-free-action`, `risky-ring`, `cloak-of-protection`, `amulet-of-the-harpers`, `yuan-ti-scale-mail`</summary>

#### Roah Moonglow
*Nature : maintenir-le-marchand-vivant.*

Roah tuée en Acte I = boutique d’Acte II manquée. Elle ne s’efface pas pour autant par un simple refus d’Acte I : après avoir tué les Zhentarim du sous-sol, elle accorde un dernier échange puis refuse de commercer avec le personnage qui lui parle (les autres membres peuvent encore commercer).

> « If Roah is killed in Act One, the party misses out on purchasing items from her shop in Act Two. » — [Roah Moonglow](https://bg3.wiki/wiki/Roah_Moonglow) (rév. 431417)
> « … llows the character one last opportunity to trade with her. Subsequent attempts to trade are rebuffed with a threat of reprisals by the Zhentarim, although other party members may still trade with her normally. » — [Roah Moonglow](https://bg3.wiki/wiki/Roah_Moonglow) (rév. 431417)

#### Lann Tarv
*Nature : maintenir-le-marchand-vivant.*

Marchand du rez-de-chaussée de Lunelevée (Acte II). Assommé, il ne peut plus être parlé ni commercer. Les trois objets du catalogue sont dans son stock normal ; le stock spécial (Z’rell) n’est pas concerné.

> « … arty member to prove their worth, they can respond: [note : If Lann Tarv is Knocked Out, he cannot be spoken to or traded with later. Doing this eliminates the earliest consistent source of Potion of Angelic Reprieve in the game.] » — [Lann Tarv](https://bg3.wiki/wiki/Lann_Tarv) (rév. 440150)
> « [Loot > Store] Halberd of Vigilance » — [Lann Tarv](https://bg3.wiki/wiki/Lann_Tarv) (rév. 440150)

#### Araj Oblodra
*Nature : rattrapage.*

Acte II : sur place. Elle disparaît de Lunelevée si le joueur refuse son offre de sang. Acte III (Crimson Draughts) : seulement si du sang a été donné en Acte II, puis elle ne commerce que si l’on accepte sa potion Formula Gruna ; refuser fait d’elle une ennemie. Les pages d’objets ajoutent « si non acquis en Acte II » pour le rattrapage.

> « … now has no choice but to observe their evolution from afar. She then runs to disappear from Moonrise Towers (and the rest of Act Two). » — [Araj Oblodra](https://bg3.wiki/wiki/Araj_Oblodra) (rév. 438225)
> « If blood is donated in Act Two, Araj moves to the Lower City of Baldur's Gate in Act Three. On approaching her shop, Crimson Draughts, just east of The Blushing Mermaid, a series of explosions trigger and while Araj runs out on fire, she is nevertheless thrilled. She praises the character, as their blood has given her  … » — [Araj Oblodra](https://bg3.wiki/wiki/Araj_Oblodra) (rév. 438225)
> « … thara and Minsc) urge the player character not to drink it. If the player character refuses to drink, Araj does not become hostile at this stage, but does not act as a trader until they agree. » — [Araj Oblodra](https://bg3.wiki/wiki/Araj_Oblodra) (rév. 438225)

#### Talli (Quartermaster)
*Nature : maintenir-le-marchand-vivant.*

Si Isobel est sauvée et le Chant de la nuit libéré, Talli suit Jaheira jusqu’à Lunelevée et peut encore commercer. Sinon elle tombe avec l’auberge. L’alerte Isobel doit donc lister Cloak of Protection, Amulet of the Harpers et Yuan-Ti Scale Mail.

> « If Isobel is saved at the Last Light Inn, and once the Nightsong is freed from her cage and heads for Moonrise, Talli follows Jaheira to Moonrise Towers. There, she survives the initial off-screen assault, and moves near the entrance. She still can be traded with. » — [Talli](https://bg3.wiki/wiki/Talli) (rév. 434270)
> « When Marcus attacks the inn and attempts to kidnap Isobel during Resolve the Abduction, Talli always fails the save and is Impaled for the remainder of the battle. If Isobel is not saved, she and everyone in Last Light Inn turn into Shadow-Cursed Undead, save for Jaheira. » — [Talli](https://bg3.wiki/wiki/Talli) (rév. 434270)

**Restes à vérifier :**
- Date exacte de fermeture des boutiques du hall de Lunelevée (après l’assaut, avant l’entrée dans la colonie ?) : non établie par les pages lues. *(pages : Lann_Tarv, Moonrise_Towers, Roah_Moonglow ; portée : Achats chez Lann Tarv, Roah et Araj en Acte II : acheter avant l’ascension du toit de Lunelevée est une précaution, pas une échéance sourcée.)*

</details>

<details><summary><strong>Ferg Drogher / Ombrecœur (Shadowheart)</strong> — `hellrider-longbow`, `robe-supreme-defences`</summary>

#### Précaution à l’inverse de l’intuition
*Nature : precaution.*

Il faut acheter SANS Ombrecœur à proximité avant son dialogue avec Ferg. Si elle a rejeté Shar et se trouve près de lui, il la menace puis s’en va définitivement, fermant son commerce. Si elle a embrassé Shar, sa présence contourne le jet de Persuasion du stock spécial.

> « If Shadowheart rejected Shar, he threatens her and provides the same directions to the House of Grief for her to receive punishment. When this dialogue finishes, he walks away forever, locking the party out of his trade goods. » — [Ferg Drogher](https://bg3.wiki/wiki/Ferg_Drogher) (rév. 425473)
> « … ll it with a Persuasion check if Shadowheart is not nearby. If Shadowheart embraced Shar, having her near bypasses this check. The party can also bypass this check by using Speak with Dead on the Refugee Corpse on the cliffs of northeastern Rivington and learning about the Gemless Ring. » — [Ferg Drogher](https://bg3.wiki/wiki/Ferg_Drogher) (rév. 425473)

#### Stock spécial et contournement
*Nature : deverrouiller-le-marchand.*

La Robe of Supreme Defences est dans le stock spécial (Persuasion si Shadowheart n’est pas proche, ou Parler aux morts sur le cadavre de réfugié du nord-est de Rivington pour l’Anneau sans gemme). Le Hellrider Longbow est dans le stock normal.

> « Ferg has a special stock of goods. He can be convinced to sell it with a Persuasion check if Shadowheart is not nearby. If Shadowheart embraced Shar, having her near bypasses this check. The party can also bypass this check by using Speak with Dead on the Refugee Corpse on the cliffs of northeastern Rivington and learn … » — [Ferg Drogher](https://bg3.wiki/wiki/Ferg_Drogher) (rév. 425473)
> « [Special stock > Notable items sold] Hellrider Longbow » — [Ferg Drogher](https://bg3.wiki/wiki/Ferg_Drogher) (rév. 425473)
> « [Notable items sold > Special stock] Robe of Supreme Defences » — [Ferg Drogher](https://bg3.wiki/wiki/Ferg_Drogher) (rév. 425473)

**Ce que les sources n’exigent pas :**
- Ombrecœur n’est pas requise : la précaution est de l’éloigner avant le dialogue.

**Restes à vérifier :**
- Portée exacte du terme « nearby » (distance en mètres) : non indiquée. *(pages : Ferg_Drogher, Hellrider_Longbow ; portée : Les deux objets de Ferg ; à vérifier en jeu, non résoluble par le wiki.)*

</details>

<details><summary><strong>Rolan / Lorroakan : Sorcerous Sundries</strong> — `birthright`, `ring-of-regeneration`, `vest-soul-rejuvenation`</summary>

#### Quatre états, quatre disponibilités
*Nature : rattrapage.*

Rolan mort : Lorroakan (projection) vend. Les deux vivants : Rolan vend. Lorroakan mort, Rolan vivant : l’anneau est porté par Rolan dans la tour (peut disparaître) ; le gilet reste vendable via l’option de commerce en bas à gauche du dialogue. Les deux morts/absents : l’anneau est indisponible. Le conseil d’« acheter tôt » ne doit pas effacer ces rattrapages.

> « If Rolan and Lorroakan are both alive: Sold by Rolan in Sorcerous Sundries » — [Ring of Regeneration](https://bg3.wiki/wiki/Ring_of_Regeneration) (rév. 422391)
> « If Rolan is alive but Lorroakan is dead: Carried by Rolan in Ramazith's Tower shortly after Lorroakan is killed (may disappear from Rolan's inventory later) » — [Ring of Regeneration](https://bg3.wiki/wiki/Ring_of_Regeneration) (rév. 422391)
> « If both Rolan and Lorroakan are dead or missing: Ring is unavailable » — [Ring of Regeneration](https://bg3.wiki/wiki/Ring_of_Regeneration) (rév. 422391)
> « Sold by Rolan via trade option on the bottom left during the dialogue in Ramazith's Tower if Rolan is alive but Lorroakan is dead » — [Vest of Soul Rejuvenation](https://bg3.wiki/wiki/Vest_of_Soul_Rejuvenation) (rév. 424641)

#### Survie de Rolan en Acte II
*Nature : maintenir-le-marchand-vivant.*

Rolan quitte l’Ultime Lueur au premier repos/voyage rapide et doit être sauvé au Champ de bataille en ruine, sinon il meurt de la malédiction. S’il est mort, Lorroakan vend à sa place : aucun achat n’est perdu pour autant.

> « … g the Prodigious to party members with the w=20 background. If Rolan is not saved before long resting, he is overtaken by the Shadow Curse and dies. [note : If Rolan is made Temporarily Hostile while fighting the Shadows by, for example, accidentally hitting him with an AoE spell, the cutscene in which he leaves for th … » — [Rolan](https://bg3.wiki/wiki/Rolan) (rév. 431419)

**Restes à vérifier :**
- Birthright : la page n’indique pas les rattrapages quand les deux marchands sont absents ; seul l’anneau a un tableau complet. *(pages : Birthright, Rolan ; portée : Birthright uniquement.)*

</details>

<details><summary><strong>Hope / Maison de l’Espoir (Acte III)</strong> — `gloves-soul-catching`, `staff-of-spellpower`, `amulet-greater-health`, `gauntlets-hill-giant-strength`, `helldusk-gloves`</summary>

#### Gloves of Soul Catching : conditions conjointes
*Nature : choix-de-quete.*

Il faut libérer Hope avec le Orphic Hammer (récupéré dans l’Archive), PUIS vaincre Raphaël en gardant Hope en vie. « Battre Raphaël » seul est insuffisant : la quête peut aussi s’achever sur Hope morte, cendre ou jamais libérée.

> « Gloves of Soul Catching if Raphael is defeated while keeping Hope alive. » — [Save Hope](https://bg3.wiki/wiki/Save_Hope) (rév. 429343)
> « "Hope perished. We were unable to save her." » — [Save Hope](https://bg3.wiki/wiki/Save_Hope) (rév. 429343)
> « "Raphael doesn't tolerate betrayals - there's nothing left to save of Hope but ash." » — [Save Hope](https://bg3.wiki/wiki/Save_Hope) (rév. 429343)

#### Archive : piédestaux volables sans combat
*Nature : alternative.*

Amulet of Greater Health et Gauntlets of Hill Giant Strength sont sur des piédestaux piégés de l’Archive ; ils peuvent être pris sans combat en désamorçant le piège (Escamotage 20) sans toucher au Marteau/Contrat ni à Hope, ou via l’astuce du poids équivalent.

> « The amulet can be stolen without the fight if the trap is disabled first with a 20 and the Orphic Hammer, the Soul-Sworn Contract and Hope are left untouched. » — [Amulet of Greater Health](https://bg3.wiki/wiki/Amulet_of_Greater_Health) (rév. 415915)
> « notes = * These gauntlets can be stolen without a fight, if the trap is disabled first with a 20 and if the Orphic Hammer / Soul-Sworn Contract and Hope are left untouched. » — [Gauntlets of Hill Giant Strength](https://bg3.wiki/wiki/Gauntlets_of_Hill_Giant_Strength) (rév. 418818)

#### Helldusk Gloves : Haarlep
*Nature : butin-de-pnj.*

Portés par Haarlep dans le Boudoir ; refuser son jeu le rend hostile, le vaincre fait tomber les gants. Le jeu peut se contourner (la phrase magique se vole sans passer par lui) : dans ce cas, les gants dépendent d’un combat avec Haarlep.

> « where to find = Worn by Haarlep in the Boudoir » — [Helldusk Gloves](https://bg3.wiki/wiki/Helldusk_Gloves) (rév. 419450)
> « Refusing to play makes Haarlep hostile. Additionally, succeeding in a 25 during the "game" also makes him hostile. Defeating Haarlep makes him drop the location of Raphael's safe, as well as Helldusk Gloves. The safe contains the magic phrase needed to steal the contract/hammer. » — [Save Hope](https://bg3.wiki/wiki/Save_Hope) (rév. 429343)

**Restes à vérifier :**
- Staff of Spellpower : les contrôles Sagesse 10 + Arcanes 20 sont donnés, mais le lien avec l’avancement de « Save Hope » (avant/après le vol du Marteau) n’est pas lu en détail. *(pages : Staff_of_Spellpower, Save_Hope ; portée : Staff of Spellpower uniquement.)*

</details>

<details><summary><strong>Ethel, Mayrina et élixirs de Force de géant</strong> — `auntie-ethels-hair`, `elixir-hill-giant-strength`, `elixir-cloud-giant-strength`, `fey-semblance-amulet`</summary>

#### Élixir : Ethel est la source la plus précoce, pas la seule
*Nature : alternative.*

Ethel vend trois élixirs par repos long ou montée de niveau tant que sa boutique existe ; elle ferme définitivement quand elle révèle sa forme de guenaude, se retire dans le Tunnel envahi ou meurt. Mais l’élixir est aussi vendu par Araj, Derryth, Entharl Danthelon, Esther, Mattis, Oliver Tefoco et Talli, et peut être fabriqué. La fermeture d’Ethel ne rend donc pas l’élixir irrécupérable.

> « …  Emerald Grove before relocating to the Riverside Teahouse. Her shop becomes unavailable for the rest of the game once she first reveals her true hag form (for any reason), retreats into her Overgrown Tunnel, or is killed during the confrontation at the Riverside Teahouse.] » — [Auntie Ethel](https://bg3.wiki/wiki/Auntie_Ethel) (rév. 439151)
> « Entharl Danthelon at Danthelon's Dancing Axe » — [Elixir of Hill Giant Strength](https://bg3.wiki/wiki/Elixir_of_Hill_Giant_Strength) (rév. 438919)
> « Crafted via Alchemy by combining Salts of Hill Giant Fingernails (procured fromHill Giant Finger) and any Suspension » — [Elixir of Hill Giant Strength](https://bg3.wiki/wiki/Elixir_of_Hill_Giant_Strength) (rév. 438919)

#### Cheveu d’Ethel : unique et lié à un moment de combat
*Nature : choix-de-quete.*

Obtenu en combat quand Ethel est sous 20 % de PV, dans le Tunnel envahi / l’Abode ancienne (dialogue en plein combat) ; l’issue Mayrina + Cheveu passe par un jet de 20. Si Ethel meurt avant la scène de son repaire, le Cheveu n’est pas obtenable.

> « where to find = * Surrendered by Auntie Ethel in her Ancient Abode if reduced below 20% of her Hit Points and allowed to bargain for her life » — [Auntie Ethel's Hair](https://bg3.wiki/wiki/Auntie_Ethel's_Hair) (rév. 426001)
> « … damage. The spell Command is very helpful in this. However, if she is killed before the cut-scene in her lair, Auntie Ethel's Hair cannot be obtained.] In her lair, victims and thralls of the hag are found. Some of them can be freed, while others must usually be fought and are lost forever. » — [Auntie Ethel](https://bg3.wiki/wiki/Auntie_Ethel) (rév. 439151)

#### Fey Semblance Amulet : Mayrina vivante et conduite à Baldur’s Gate
*Nature : pnj-a-sauver.*

Récompense de Mayrina à la fin de la quête d’Acte III. Si Ethel garde Mayrina ou l’emmène (accord), Mayrina est introuvable en Acte III. Si Mayrina meurt, la page objet indique que Kled donne l’amulette (note « à vérifier » dans le wiki).

> « If Auntie Ethel was left with Mayrina in the Sunlit Wetlands or Ethel's deal was accepted and the hag took Mayrina with her, then Mayrina is nowhere to be found in Act Three. Otherwise Mayrina moves to Old Garlow's Place in the Lower City where she works with a group of hag survivors and is polymorphed into a sheep. Sh … » — [Mayrina](https://bg3.wiki/wiki/Mayrina) (rév. 438667)
> « notes = * If Mayrina is dead when Avenge the Hag Survivors is completed, this amulet is rewarded by Kled instead. [à vérifier, selon le wiki] » — [Fey Semblance Amulet](https://bg3.wiki/wiki/Fey_Semblance_Amulet) (rév. 418440)

**Restes à vérifier :**
- La page de l’objet cite « Avenge the Hag Survivors », celle de Mayrina « Help the Hag Survivors » : quelle quête déclenche la récompense n’est pas tranché. La mention « Kled » est marquée [verify] sur le wiki. *(pages : Fey_Semblance_Amulet, Mayrina ; portée : Fey Semblance Amulet.)*

</details>

<details><summary><strong>Bosquet d’Émeraude : Zevlor, Kagha, Mol</strong> — `hellriders-pride`, `broodmothers-revenge`, `ring-of-protection`, `cap-of-curing`</summary>

#### Hellrider’s Pride
*Nature : choix-de-quete.*

Porté par Zevlor : récompense pour avoir réglé Kagha / les chefs gobelins, ou butin/vol sur lui. Aller au Sentier de Rosemorne ou aux Terres maudites avant de résoudre le Rite des épines expulse les réfugiés, dont Zevlor ; son cadavre est alors parmi ceux du pont.

> « where to find = Carried by Zevlor and can be looted from him, stolen, or earned as a reward for Kill Kagha or Investigate Kagha » — [Hellrider's Pride](https://bg3.wiki/wiki/Hellrider's_Pride) (rév. 419462)
> « Travelling to the Rosymorn Monastery Trail or the Shadow-Cursed Lands before resolving Kagha's Rite of Thorns, results in the expulsion of all the tiefling refugees from the Emerald Grove; Zevlor's corpse is then among the bodies of all the other refugees near the bridge to the Blighted Village. » — [Zevlor](https://bg3.wiki/wiki/Zevlor) (rév. 439369)

#### Broodmother’s Revenge : porté par Kagha, pas une récompense
*Nature : butin-de-pnj.*

L’amulette est portée par Kagha dans le Sanctuaire intérieur ; la page documente qu’on peut l’avoir en gardant Kagha en vie (la rendre alliée, puis l’assommer en mode non létal et la piller). Un second exemplaire est listé sur une table appartenant à Koll (Haut Salle). La fiche d’équipe « résoudre la quête de Kagha » n’est donc pas la condition établie.

> « where to find = Carried by Kagha in the Emerald Grove » — [Broodmother's Revenge](https://bg3.wiki/wiki/Broodmother's_Revenge) (rév. 431623)
> « … ll be standing alone, along the pathway entering the grove. Attacking her and knocking her out with Toggle Non-Lethal Attacks makes her lootable yet keeps her alive. Following a long rest, Kagha will be awake again and upset, but non-hostile. Trading with her via bartering can bring her relationship with the party back … » — [Broodmother's Revenge](https://bg3.wiki/wiki/Broodmother's_Revenge) (rév. 431623)
> « where to find2 = On a table of goods, owned by Koll » — [Broodmother's Revenge](https://bg3.wiki/wiki/Broodmother's_Revenge) (rév. 431623)

#### Ring of Protection : Mol
*Nature : choix-de-quete.*

Récompense de « Voler l’idole sacrée ». La quête n’est obtenue que si l’on est en bons termes avec les enfants et si l’on choisit l’option d’aider Mol ; sinon le groupe est exclu de la quête et de sa récompense.

> « … ling refugees. Agreeing to steal the idol starts the quest. If not choosing the dialogue option to help Mol the party is locked out of the quest and its reward. » — [Steal the Sacred Idol](https://bg3.wiki/wiki/Steal_the_Sacred_Idol) (rév. 434284)

**Restes à vérifier :**
- Koll (HAUTE SALLE) : la page « Koll » est une désambiguïsation, l’acte et l’accessibilité du second exemplaire ne sont pas établis. *(pages : Broodmother's_Revenge ; portée : Seulement l’alternative Koll de Broodmother’s Revenge.)*

</details>

<details><summary><strong>Camp gobelin : Grat, Volo, Crusher, Roah (Acte I)</strong> — `whispering-promise`, `boots-aid-comfort`, `crushers-ring`, `bow-of-awareness`</summary>

#### Grat
*Nature : deverrouiller-le-marchand.*

Grat tient sa boutique dans le camp ; si les gobelins de la cour sont empoisonnés et en alerte, il ferme boutique. Boots of Aid and Comfort figurent dans son stock permanent.

> « Grat tends his makeshift shop which is in the main area of the Goblin Camp. He recently participated in a raid on Waukeen's Rest and is trying to sell the items he looted from the dead. If the goblins in the courtyard are poisoned and go on high alert, Grat closes his shop. » — [Grat](https://bg3.wiki/wiki/Grat) (rév. 414927)
> « [Store > Stock] Boots of Aid and Comfort » — [Grat](https://bg3.wiki/wiki/Grat) (rév. 414927)

#### The Whispering Promise : Volo OU Grat, mutuellement exclusifs
*Nature : alternative.*

La même bague est vendue par Volo (Bassin sacré, camp, selon la progression) ou par Grat, mais une seule fois : Grat ne la vend plus après le départ de Volo du camp gobelin. Volo ne commerce pas par dialogue au Bassin sacré (bouton Commerce).

> « If Volo is rescued and joins the party's camp, he sells the ring there if it was not previously acquired from him or Grat. Additionally, Grat no longer sells the ring after Volo leaves the Goblin Camp, even if Volo later dies or leaves the party's camp. » — [The Whispering Promise](https://bg3.wiki/wiki/The_Whispering_Promise) (rév. 424157)
> « Volo does not trade via dialogue at the Sacred Pool. One must click the trade button in the lower left while speaking with him to do so. The ring can also be stolen. » — [The Whispering Promise](https://bg3.wiki/wiki/The_Whispering_Promise) (rév. 424157)

**Restes à vérifier :**
- La page de Grat n’affiche pas la bague dans son tableau de stock lu ; seule la page de la bague l’indique. *(pages : Grat, The_Whispering_Promise ; portée : Source Grat de The Whispering Promise ; la source Volo, elle, est listée sur la page de Volo.)*

</details>

<details><summary><strong>Cirque des Derniers Jours : Akabi et Lucretious</strong> — `nyrulna`, `band-mystic-scoundrel`, `spellmight-gloves`</summary>

#### Akabi : le jackpot ouvre la jungle, un seul passage
*Nature : acces.*

Le jackpot téléporte seul le personnage qui parle à Akabi dans la jungle de Chult ; c’est la seule voie d’accès. Il faut soit voler sa Djinni Ring, soit le distraire (Barde, Performance 15) ; voler la bague ou distraire le Barde exclut définitivement les lots de consolation. Akabi ferme le jeu quand le jackpot est gagné, quand tous sont transformés en fromage, ou après seize tours.

> « … ty member, alone, to a Jungle in the distant land of Chult. This is the only way to reach this area and to obtain the items within, notably the trident Nyrulna and the ring Band of the Mystic Scoundrel. Therefore, it is recommended that the party member chosen to win Akabi's jackpot be capable of heavy combat stealth,  … » — [Akabi](https://bg3.wiki/wiki/Akabi) (rév. 425239)
> « … jackpot. However, stealing the ring or the Bard distraction permanently locks the party out of winning future consolation prizes. » — [Akabi](https://bg3.wiki/wiki/Akabi) (rév. 425239)
> « Akabi permanently closes down the game if one character wins the jackpot, all characters are turned to cheese, or if all consolation prizes are claimed by spinning the wheel 16 times. » — [Akabi](https://bg3.wiki/wiki/Akabi) (rév. 425239)

#### Spellmight Gloves
*Nature : choix-de-quete.*

Récompense de Lucretious quand les sept morceaux de Dribbles sont rapportés (ou, si les gants ont été volés, un peu d’or). Le cirque part après le prochain repos long : acheter aux marchands du cirque avant. Les gants peuvent aussi être volés ou pillés.

> « … cretious thanks them for returning the star of her show and rewards them with Spellmight Gloves (or a small amount of gold if the gloves were previously pickpocketed). She lets the party know that the circus will finally leave soon (after the next long rest), so they should buy from its merchants while they still can. » — [Lucretious](https://bg3.wiki/wiki/Lucretious) (rév. 425487)
> « notes = * These gloves can be also pickpocketed or looted. » — [Spellmight Gloves](https://bg3.wiki/wiki/Spellmight_Gloves) (rév. 423439)

</details>

<details><summary><strong>Lir’i’c / Plan astral (Boots of Uninhibited Kushigo)</strong> — `boots-uninhibited-kushigo`</summary>

#### Porteur toujours hostile
*Nature : butin-de-pnj.*

La prélate Lir’i’c est toujours hostile et doit être vaincue pour passer à l’Acte III : les bottes se récupèrent donc dans le combat obligatoire. Le « point de non-retour » est une inférence : aucune page lue ne dit qu’on ne peut pas revenir ; il est seulement établi que la rencontre est « en entrant dans l’Acte III ».

> « Lir'i'c is always hostile and she and the rest of the honor guard must be defeated in order to progress to Act Three. » — [Prelate Lir'i'c](https://bg3.wiki/wiki/Prelate_Lir'i'c) (rév. 431178)
> « where to find = Carried by Prelate Lir'i'c, as entering Act Three » — [Boots of Uninhibited Kushigo](https://bg3.wiki/wiki/Boots_of_Uninhibited_Kushigo) (rév. 416689)

**Restes à vérifier :**
- Impossibilité de retour au Plan astral après la transition vers l’Acte III : non sourcée sur les deux pages, ne pas la présenter comme établie. *(pages : Boots_of_Uninhibited_Kushigo, Prelate_Lir'i'c ; portée : Boots of Uninhibited Kushigo.)*

</details>

<details><summary><strong>Crèche Y’llek : Jeera, Gish et le coffre de l’Inquisiteur</strong> — `unseen-menace`, `gloves-of-dexterity`, `daredevil-gloves`, `ring-arcane-synergy`, `ring-elemental-infusion`, `gloves-belligerent-skies`, `strange-conduit-ring`, `necklace-elemental-augmentation`</summary>

#### Jeera : le commerce tient tant que la Crèche n’est pas hostile
*Nature : maintenir-le-marchand-vivant.*

A’jak’nir Jeera tient sa boutique au sud-est du point de passage ; si des hostilités éclatent dans la Crèche, elle y revient même enlevée ailleurs. La page ne dit pas qu’elle ferme à un moment précis. La fiche d’équipe « récupérer avant de quitter la Crèche » est donc une précaution non sourcée, pas une échéance établie.

> « … aypoint. [note : Even if kidnapped to a different location, she will teleport back should hostilities break out in the Crèche (Only verified for the Trielta Crags waypoint).] [note : A'jak'nir Jeera is supposed turn hostile if the party attempts to sell Vlaakith's Portrait or the Githyanki Egg to her but the former can … » — [A'jak'nir Jeera](https://bg3.wiki/wiki/A'jak'nir_Jeera) (rév. 416522)
> « [Shop > Notable items sold] Gloves of Dexterity » — [A'jak'nir Jeera](https://bg3.wiki/wiki/A'jak'nir_Jeera) (rév. 416522)

#### Objets de la chambre de l’Inquisiteur et des Gish
*Nature : copies.*

Coffre élégant (Gloves of Belligerent Skies), coffre (Strange Conduit Ring), vitrine (Necklace of Elemental Augmentation, qui a un second exemplaire en Acte III à Wyrm’s Crossing), Gish Far’aag et Gish Umr’a’ac (anneaux portés).

> « where to find2 = inside a Traveller's Chest on a shipwrecked ship Northwest of South Span Checkpoint » — [Necklace of Elemental Augmentation](https://bg3.wiki/wiki/Necklace_of_Elemental_Augmentation) (rév. 421264)
> « where to find = Worn by Gish Far'aag » — [Ring of Arcane Synergy](https://bg3.wiki/wiki/Ring_of_Arcane_Synergy) (rév. 438176)

**Restes à vérifier :**
- Fermeture ou départ de la Crèche après l’épisode de Lae’zel : non établie par les pages lues. *(pages : A'jak'nir_Jeera, Ring_of_Arcane_Synergy ; portée : Les objets de la Crèche ; ne pas la présenter comme une échéance.)*

</details>

<details><summary><strong>Tabernacle de Stormshore : Vicaire Humbletoes et coffres du sous-sol</strong> — `mantle-holy-warrior`, `reviving-hands`, `amulet-of-the-devout`</summary>

#### Vol dans le sous-sol vs commerce du Vicaire
*Nature : conflit-de-sources.*

Le Vicaire refuse de commercer avec quiconque vole dans le sous-sol, mais commerce encore avec un autre membre ou un personnage déguisé. Piller le coffre d’offrandes (Amulet of the Devout) maudit le personnage qui touche (« Castigated By Divinity »), sauf Jaheira avec Khalid’s Gift. Acheter Mantle of the Holy Warrior et The Reviving Hands avant de voler au sous-sol est donc une précaution documentée.

> « He refuses to trade with anyone who steals from the basement, but still trades if the offender is disguised or another party member talks to him instead. » — [Vicar Humbletoes](https://bg3.wiki/wiki/Vicar_Humbletoes) (rév. 414765)
> « Unless obtained by Jaheira while wearing Khalid's Gift, normal looting any of the items from the offering chests curses the interacting party member with Castigated By Divinity. » — [Amulet of the Devout](https://bg3.wiki/wiki/Amulet_of_the_Devout) (rév. 415922)

**Restes à vérifier :**
- Effet précis de « Stop the Presses » sur le commerce (attitude seule ou refus) : non détaillé. *(pages : Vicar_Humbletoes ; portée : Prix et disponibilité des deux achats.)*

</details>

## 4. Matrice par objet

Chaque cellule « Voies » est en logique **OU** entre voies ; les points entre crochets sont des conditions **ET** à réunir pour cette voie.

<details><summary>Matrice complète (104 objets)</summary>

### Acte 1

| ID | Porteur / source | Voies (OU) et conditions (ET) | Échéance | Rattrapage / alternative | Verdict |
| --- | --- | --- | --- | --- | --- |
| `the-spellsparkler` | Récompense de Florrick (1 parmi 3) | Sauver Florrick de l’auberge en feu (Relais de Waukeen) et la choisir parmi trois récompenses. [Florrick sauvée avant que les survivants meurent ET Choisir The Spellsparkler plutôt que The Joltshooter / The Sparky Points] | S’approcher de Waukeen’s Rest puis se reposer/voyager vite ou partir pour le Sentier de Rosemorne fait mourir les survivants. | La quête reste obtenable en Acte III à la prison de Wyrm’s Rock ; la récompense obtenue dans ce cas n’est pas vérifiée. — Joltshooter et Sparky Points sont les deux autres récompenses du même choix. | Audités avec contraintes |
| `melfs-first-staff` | Blurg (marchand) | Acheter à Blurg (colonie myconide). | — | Blurg vend aussi en Acte III au Lodge de la Société de la Brillance. | Audités sans contrainte spécifique identifiée |
| `phalar-aluve` | Épée dans la pierre (Outreterre) | Force 15, ou Religion 15, ou rituel paladin, ou prêtre d’Eilistraee, ou sang versé sur la pierre. | — | — | Audités sans contrainte spécifique identifiée |
| `unseen-menace` | A’jak’nir Jeera (Crèche Y’llek) | Acheter à Jeera. [Jeera non hostile] | La Crèche ne doit pas devenir hostile ; en cas d’hostilités, Jeera revient dans la Crèche (page de Jeera). | — | Audités avec contraintes |
| `sword-of-justice` | Anders (péage de la Route du Renouveau) | Piller Anders après le combat. [Anders vaincu] **OU** Lui apporter la tête de Karlach (récompense). [Tuer Karlach (option non recommandée)] | — | — | Audités avec contraintes |
| `bow-of-awareness` | Roah Moonglow (Sanctuaire brisé) | Acheter à Roah avant d’avoir tué les Zhentarim du sous-sol. [Roah non hostile] | Après le massacre du sous-sol Zhentarim : un dernier échange puis refus (pour le personnage qui lui parle). | — | Audités avec contraintes |
| `the-lifebringer` | Blurg | Acheter à Blurg (Acte I) ou au Lodge (Acte III). | — | — | Audités sans contrainte spécifique identifiée |
| `shadespell-circlet` | Omeluum | Acheter à Omeluum après la quête. [Quête « Aider Omeluum » terminée (anneau obtenu) ET Achat en Acte I] | — | Aucun : Omeluum sauvé en Acte III ne commerce plus. | Audités avec contraintes |
| `haste-helm` | Coffre moussu (Village dévasté) | Ouvrir le coffre. | — | — | Audités sans contrainte spécifique identifiée |
| `grymskull-helm` | Grym (Forge adamantine) | Vaincre Grym. | — | — | Audités sans contrainte spécifique identifiée |
| `protecty-sparkswall` | Coffre doré (pont piégé, Grymforge) | Ouvrir le coffre au bout du pont piégé. | — | — | Audités sans contrainte spécifique identifiée |
| `armure-adamantine` | Forge adamantine (Grymforge) | Couler le moule d’armure d’attelles avec du mithral. [Splint Mould ET Mithral Ore ET Accès à la forge] | — | Matériaux : Splint Mould + Mithral Ore (leurs emplacements ne sont pas audités ici). | Audités avec contraintes |
| `the-graceful-cloth` | Lady Esther (Sentier de Rosemorne) | Acheter à Lady Esther. [Esther non hostile] | — | — | Audités avec contraintes |
| `spidersilk-armour` | Minthara (Sanctuaire brisé) | Piller Minthara vaincue. [Minthara vaincue] | — | Inférence : si Minthara devient compagne, son équipement est transférable (non sourcé). | Audités avec contraintes |
| `bracers-of-defence` | Coffre doré (cave secrète de l’apothicaire) | Ouvrir le coffre. | — | — | Audités sans contrainte spécifique identifiée |
| `gloves-of-dexterity` | A’jak’nir Jeera | Acheter à Jeera. [Jeera non hostile] | — | — | Audités avec contraintes |
| `daredevil-gloves` | A’jak’nir Jeera | Acheter à Jeera. [Jeera non hostile] | — | — | Audités avec contraintes |
| `gloves-belligerent-skies` | Coffre élégant (chambre de l’Inquisiteur) | Ouvrir le coffre. | — | — | Audités sans contrainte spécifique identifiée |
| `gloves-growling-underdog` | Caisses de Dror Ragzlin (Camp gobelin) | Caisses derrière la grille. **OU** Caisse alternative sur le Sentier de Rosemorne (jet de Survie). [Survie] | — | — | Audités sans contrainte spécifique identifiée |
| `gloves-sparkle-hands` | Coffre (Sanctuaire décrépit) | Ouvrir le coffre au pied de la souche. | — | — | Audités sans contrainte spécifique identifiée |
| `gloves-cinder-sizzle` | Lady Esther | Acheter à Esther. [Esther non hostile] | — | — | Audités avec contraintes |
| `hellriders-pride` | Zevlor | Récompense de Zevlor (Kagha réglée ou chefs gobelins vaincus). [Zevlor vivant dans le Bosquet] **OU** Le piller ou le voler. | — | — | Audités avec contraintes |
| `disintegrating-night-walkers` | Nere (Grymforge) | Piller Nere vaincu. [Nere libéré puis vaincu] | — | — | Non résolus |
| `boots-stormy-clamour` | Omeluum | Acheter à Omeluum après la quête. [Rencontrer Omeluum via Blurg ET Ingrédients ET Boire la potion ET Obtenir l’anneau] | Acheter en Acte I : Omeluum sauvé en Acte III ne commerce plus. | — | Audités avec contraintes |
| `boots-of-speed` | Thulla (colonie myconide) | La soigner (Cure the Poisoned Gnome). [Retirer le poison] **OU** Voler ou piller ses bottes. | — | — | Audités avec contraintes |
| `boots-aid-comfort` | Grat (Camp gobelin) | Acheter à Grat. [Grat non fermé (cour non empoisonnée)] | Grat ferme si les gobelins de la cour sont empoisonnés et en alerte. | — | Audités avec contraintes |
| `amulet-misty-step` | Coffre de Polma OU Omeluum | Coffre doré près de Polma (Temple profané). **OU** Acheter à Omeluum après la quête. [Quête Omeluum terminée] | — | Un seul exemplaire : la première source atteinte l’emporte. | Audités avec contraintes |
| `pearl-of-power-amulet` | Omeluum | Acheter à Omeluum après la quête. [Quête Omeluum terminée] | — | — | Audités avec contraintes |
| `periapt-wound-closure` | Lady Esther | Acheter à Esther. [Esther non hostile] | — | — | Audités avec contraintes |
| `broodmothers-revenge` | Kagha | Piller Kagha (mort ou assommée en non létal). **OU** Table de Koll (Haute Salle). | — | — | Audités avec contraintes |
| `amulet-of-restoration` | Derryth Bonecloak OU coffre de la Maison des comptes | Acheter à Derryth (colonie). [Derryth non hostile] **OU** Coffre « Private Stash » (Maison des comptes, Acte III). | — | — | Audités avec contraintes |
| `sentient-amulet-rare` | Coffre adamantin (Grymforge) | Crocheter le coffre ; ramasser l’amulette lance la quête du moine maudit. | — | — | Audités sans contrainte spécifique identifiée |
| `necklace-elemental-augmentation` | Vitrine de la chambre de l’Inquisiteur | Vitrine (Crèche). **OU** Coffre d’épave (Wyrm’s Crossing). | — | — | Audités sans contrainte spécifique identifiée |
| `moondrop-pendant` | Coffre doré sélunite (Nid de l’ours-hibou) | Lire la prière sélunite devant le coffre. [Trouver la feuille de prière (Perception)] | — | — | Audités avec contraintes |
| `ring-of-protection` | Mol (Repaire des tieflings) | Terminer « Voler l’idole sacrée ». [Bons termes avec les enfants (Mirkon, Arabella, médaillon) ET Choisir « aider Mol »] | — | — | Audités avec contraintes |
| `crushers-ring` | Crusher (Camp gobelin) | Tuer Crusher ou lui retirer l’anneau du pied. | — | — | Audités sans contrainte spécifique identifiée |
| `caustic-band` | Derryth Bonecloak | Acheter à Derryth. [Derryth non hostile] | — | — | Audités avec contraintes |
| `strange-conduit-ring` | Coffre élégant (chambre de l’Inquisiteur) | Ouvrir le coffre. | — | — | Audités sans contrainte spécifique identifiée |
| `ring-arcane-synergy` | Gish Far’aag (Crèche Y’llek) | Piller Gish Far’aag. [Vaincre Gish Far’aag] | — | — | Audités avec contraintes |
| `ring-elemental-infusion` | Gish Umr’a’ac (infirmerie) | Piller Gish Umr’a’ac. | — | — | Audités sans contrainte spécifique identifiée |
| `whispering-promise` | Volo OU Grat | Acheter à Volo. **OU** Acheter à Grat (tant que Volo n’a pas quitté le camp). | — | Même bague ; une seule sera vendable. | Audités avec contraintes |
| `cap-of-curing` | Coffre gilded verrouillé (Bassin sacré) | Crocheter le coffre. [Bosquet accessible] | — | — | Audités avec contraintes |
| `auntie-ethels-hair` | Auntie Ethel (Abode ancienne) | Réduire Ethel sous 20 % de PV dans son repaire puis marchander. [Ethel vivante jusqu’à la scène ET Dialogue en plein combat] | — | — | Audités avec contraintes |
| `elixir-hill-giant-strength` | Ethel + sept autres marchands + fabrication | Acheter à Ethel (trois par repos long), tant qu’elle commerce. **OU** Autres marchands : Araj, Derryth, Entharl, Esther, Mattis, Oliver Tefoco, Talli. **OU** Fabriquer avec des sels d’ongles de géant des collines. | — | — | Audités avec contraintes |

### Acte 2

| ID | Porteur / source | Voies (OU) et conditions (ET) | Échéance | Rattrapage / alternative | Verdict |
| --- | --- | --- | --- | --- | --- |
| `charge-bound-warhammer` | Dammon (Ultime Lueur) | Acheter à Dammon en Acte II. [Dammon vivant ET Ultime Lueur protégée (Isobel sauvée) ET Avant l’entrée dans la colonie illithid] | Avant l’entrée dans la colonie illithid (Dammon indisponible ensuite jusqu’à l’Acte III). | — | Audités avec contraintes |
| `halberd-of-vigilance` | Lann Tarv (Lunelevée) | Acheter à Lann Tarv, rez-de-chaussée. [Lann Tarv non assommé/tué] | — | — | Audités avec contraintes |
| `drakethroat-glaive` | Roah Moonglow (Lunelevée) | Acheter à Roah à l’entrée de Lunelevée. [Roah vivante depuis l’Acte I] | — | Amont : Roah tuée en Acte I = boutique d’Acte II manquée. | Audités avec contraintes |
| `darkfire-shortbow` | Dammon (Ultime Lueur) | Acheter à Dammon en Acte II. [Dammon vivant ET Isobel sauvée ET Avant la colonie illithid] | Avant l’entrée dans la colonie illithid. | — | Audités avec contraintes |
| `sentinel-shield` | Lann Tarv (Lunelevée) | Acheter à Lann Tarv. [Lann Tarv non assommé/tué] | — | — | Audités avec contraintes |
| `ketherics-shield` | Ketheric Thorm | Vaincre Ketheric (toit de Lunelevée ou colonie illithid). **OU** Le voler pendant le combat du toit en lui faisant équiper une arme à deux mains. [Désarmer Ketheric ET Une arme à deux mains à proximité] | — | — | Audités sans contrainte spécifique identifiée |
| `hat-of-fire-acuity` | Bœuf étrange | Acte II : le tuer à l’Ultime Lueur (après qu’il ait repris sa forme). [Bœuf laissé vivant en Acte I ET Tuer le bœuf en Acte II] **OU** Acte III : le tuer à Rivington. [Bœuf laissé vivant ET Tuer le bœuf (pas l’issue « Aider le bœuf »)] | — | Rivington (Acte III). | Audités avec contraintes |
| `fistbreaker-helm` | Lann Tarv (Lunelevée) | Acheter à Lann Tarv. [Lann Tarv non assommé/tué] | — | — | Audités avec contraintes |
| `cloak-of-protection` | Quartermaster Talli | Acheter à Talli. [Isobel sauvée (sinon l’auberge tombe)] | — | — | Audités avec contraintes |
| `cloak-elemental-absorption` | Coffre des appartements de Ketheric | Ouvrir le coffre opulent. | — | — | Audités sans contrainte spécifique identifiée |
| `thunderskin-cloak` | Araj Oblodra | Acheter à Araj à Lunelevée. [Araj sur place (offre de sang acceptée)] **OU** Acte III : acheter à Crimson Draughts. [Sang donné en Acte II ET Accepter Formula Gruna] | — | Crimson Draughts (Acte III) si non acquis en Acte II. | Audités avec contraintes |
| `vivacious-cloak` | Coffre de voyageur (Grand Mausolée) | Crocheter le coffre. | — | — | Audités sans contrainte spécifique identifiée |
| `cloak-cunning-brume` | Mattis (Ultime Lueur) | Acheter à Mattis. [Mattis ayant survécu à l’Acte I ET Isobel sauvée] | — | — | Audités avec contraintes |
| `robe-exquisite-focus` | Araj Oblodra | Acheter à Araj à Lunelevée. [Araj sur place] **OU** Acte III : Crimson Draughts. [Sang donné en Acte II ET Formula Gruna acceptée] | — | Crimson Draughts (Acte III). | Audités avec contraintes |
| `yuan-ti-scale-mail` | Quartermaster Talli | Acheter à Talli. [Isobel sauvée] | — | — | Audités avec contraintes |
| `flawed-helldusk-gloves` | Dammon (fabrication) | Faire fabriquer par Dammon contre un Fer ou Alliage infernal par pièce. [Dammon vivant ET Un Infernal Iron/Alloy par pièce ET Avant l’entrée dans le Shadowfell] | Avant le Shadowfell (Gantelet de Shar), pas la fin d’acte. | Matériaux : Infernal Iron / Infernal Alloy (un par pièce) ; les mêmes sources servent aussi aux améliorations du cœur de Karlach. | Audités avec contraintes |
| `spineshudder-amulet` | Mimique (chambre d’Isobel, Lunelevée) | Ouvrir la mimique. | — | — | Audités sans contrainte spécifique identifiée |
| `spellcrux-amulet` | La Gardienne (prison de Lunelevée) | Vaincre la Gardienne. | — | — | Audités sans contrainte spécifique identifiée |
| `amulet-of-the-harpers` | Quartermaster Talli | Acheter à Talli. [Isobel sauvée] | — | — | Audités avec contraintes |
| `surgeons-subjugation-amulet` | Malus Thorm (Maison de guérison) | Vaincre Malus ou le faire tuer par ses infirmières. | — | — | Audités sans contrainte spécifique identifiée |
| `callous-glow-ring` | Coffre opulent (Gantelet de Shar) | Ouvrir le coffre près de Balthazar. | — | — | Audités sans contrainte spécifique identifiée |
| `coruscation-ring` | Coffre piégé (cave de l’Ultime Lueur) | Atteindre la cave et ouvrir le coffre. | — | — | Audités sans contrainte spécifique identifiée |
| `ring-mental-inhibition` | Coffre verrouillé (Maison dans les ombres profondes) | Crocheter le coffre. | — | — | Audités sans contrainte spécifique identifiée |
| `ring-spiteful-thunder` | Roah Moonglow (Lunelevée) | Acheter à Roah à l’entrée de Lunelevée. [Roah vivante depuis l’Acte I] | — | Amont : Roah tuée en Acte I = boutique d’Acte II manquée. | Audités avec contraintes |
| `ring-free-action` | Araj Oblodra | Acheter à Araj à Lunelevée. [Araj sur place] **OU** Crimson Draughts (Acte III). [Sang donné ET Formula Gruna] | — | Crimson Draughts. | Audités avec contraintes |
| `risky-ring` | Araj Oblodra | Acheter à Araj à Lunelevée. [Araj sur place] **OU** Crimson Draughts (Acte III). [Sang donné ET Formula Gruna] | — | Crimson Draughts. | Audités avec contraintes |
| `shadow-cloaked-ring` | Alpha des molosses d’ombre | Détruire les torches éternelles puis vaincre l’alpha. | — | — | Audités sans contrainte spécifique identifiée |
| `killers-sweetheart` | Épreuve du dédoublement (Gantelet de Shar) | Vaincre le double. | — | — | Audités sans contrainte spécifique identifiée |

### Acte 3

| ID | Porteur / source | Voies (OU) et conditions (ET) | Échéance | Rattrapage / alternative | Verdict |
| --- | --- | --- | --- | --- | --- |
| `markoheshkir` | Globe d’invulnérabilité (Tour de Ramazith) | Révéler le levier invisible (Voir l’invisible) et réussir Arcanes 20 pour désactiver le globe. [Accéder à l’étage inférieur de la Tour de Ramazith ET Voir l’invisible ET Arcanes 20 (une tentative par personnage ; un échec déclenche Désintégration)] | — | Amont : Atteindre la Tour de Ramazith (chaîne Lorroakan) ; sauter dans la tour est un crime si Lorroakan est vivant. | Audités avec contraintes |
| `staff-of-spellpower` | Coffre-fort de Raphaël (Maison de l’Espoir) | Gemme inerte (Sagesse 10) puis Gemme de contrôle infernal (Arcanes 20) pour ouvrir la porte. [Être dans la Maison de l’Espoir ET Sagesse 10 ET Arcanes 20 (un essai par personnage)] | — | — | Audités avec contraintes |
| `rhapsody` | Cazador Szarr (Donjon de Cazador) | Piller Cazador après le combat/le rituel. [Atteindre le Donjon de Cazador ET Cazador vaincu] | — | Amont : Dépend de la résolution du rituel d’Astarion (le groupe lance Rhapsody sur Cazador dans une branche). | Non résolus |
| `nyrulna` | Coffre peint verrouillé (Jungle d’Akabi) | Gagner le jackpot d’Akabi, puis crocheter le coffre (Escamotage 20) près du portail de sortie. [Jackpot gagné (500 po par tour, vol de la bague ou distraction de Barde) ET Escamotage 20] | Jackpot : une seule fois ; le jeu ferme après un jackpot, après le fromage général ou 16 tours. | — | Audités avec contraintes |
| `hellrider-longbow` | Ferg Drogher (Rivington) | Acheter à Ferg (stock normal) sans Ombrecœur à proximité. [Ombrecœur éloignée avant le dialogue de Ferg] | Si Ombrecœur (ayant rejeté Shar) est proche pendant le dialogue, Ferg part définitivement. | — | Audités avec contraintes |
| `the-dead-shot` | Fytz the Firecracker (Armurerie de Stormshore) | Acheter à Fytz. | — | — | Audités sans contrainte spécifique identifiée |
| `hood-of-the-weave` | Mystic Carrion (Manoir de Philgrave) | Acheter à Mystic Carrion. [Carrion non hostile] | Allié à Thrumbo ou jarres détruites = Carrion hostile. | — | Audités avec contraintes |
| `birthright` | Projection de Lorroakan ou Rolan (Sorcerous Sundries) | Acheter au marchand présent à l’accueil. [Au moins Rolan ou Lorroakan présent] | — | — | Audités avec contraintes |
| `pyroquickness-hat` | Coffre invisible (caveau d’Elminster) | Entrer dans le caveau (livre dans le bureau de Tolna ou bouton de la Tour de Ramazith), ouvrir la porte d’Elminster (Knock), voir le coffre invisible. [Accès au caveau ET Porte d’Elminster (Knock) ET Voir l’invisible / Lueur féerique] | — | — | Audités avec contraintes |
| `mask-of-soul-perception` | Coffre doré (chambre de Helsik) | Ouvrir le coffre avec la clé dorée ou Escamotage 20. [Accès à l’étage du Denier du Diable] | — | — | Audités avec contraintes |
| `cloak-of-the-weave` | Helsik (Denier du Diable) | Débloquer la « sélection curatée » (Perception 5 ×plusieurs + Arcanes 15), puis acheter. [Perception 5 ET Arcanes 15] | — | — | Audités avec contraintes |
| `cloak-of-displacement` | Entharl Danthelon | Acheter à Entharl. | — | — | Audités sans contrainte spécifique identifiée |
| `mantle-holy-warrior` | Vicar Humbletoes (Tabernacle de Stormshore) | Acheter au Vicaire. [Ne pas voler dans le sous-sol avec le personnage qui lui parle] | Il refuse tout commerce à qui vole dans le sous-sol (sauf déguisé ou autre membre). | — | Audités avec contraintes |
| `robe-of-the-weave` | Globe d’invulnérabilité (Tour de Ramazith) | Voir l’invisible + Arcanes 20. [Accès à la tour ET Arcanes 20] | — | — | Audités avec contraintes |
| `robe-supreme-defences` | Ferg Drogher (stock spécial) | Persuasion si Ombrecœur n’est pas proche, OU Parler aux morts sur le cadavre de réfugié (Anneau sans gemme), OU Ombrecœur proche si elle a embrassé Shar. [Ombrecœur éloignée (sauf voie Shar)] | — | — | Audités avec contraintes |
| `armour-of-persistence` | Dammon (Forge des Neuf) | Acheter à Dammon en Acte III. [Dammon survivant de bout en bout] | — | — | Audités avec contraintes |
| `vest-soul-rejuvenation` | Rolan ou Lorroakan (Sorcerous Sundries) | Acheter au marchand présent, ou via le commerce du dialogue dans la tour. | — | — | Audités avec contraintes |
| `spellmight-gloves` | Lucretious (Cirque des Derniers Jours) | Rapporter les sept morceaux de Dribbles. [Quête « Retrouver Dribbles le clown »] **OU** Voler ou piller les gants. | Le cirque part après le prochain repos long suivant la remise. | — | Audités avec contraintes |
| `helldusk-gloves` | Haarlep (Boudoir, Maison de l’Espoir) | Vaincre Haarlep. [Entrer dans le Boudoir ET Refuser ou perdre son jeu / le combattre] | — | — | Audités avec contraintes |
| `legacy-of-the-masters` | Dammon (Forge des Neuf) | Acheter à Dammon en Acte III. [Dammon survivant de bout en bout] | — | — | Audités avec contraintes |
| `gloves-soul-catching` | Hope (Maison de l’Espoir) | Libérer Hope avec le Orphic Hammer ET vaincre Raphaël avec Hope en vie. [Récupérer le Orphic Hammer ET Libérer Hope ET Vaincre Raphaël ET Hope vivante] | — | — | Audités avec contraintes |
| `reviving-hands` | Vicar Humbletoes | Acheter au Vicaire. [Ne pas voler dans le sous-sol avec le personnage qui lui parle] | — | — | Audités avec contraintes |
| `boots-of-persistence` | Dammon (Forge des Neuf) | Acheter à Dammon en Acte III. [Dammon survivant de bout en bout] | — | — | Audités avec contraintes |
| `boots-uninhibited-kushigo` | Prélate Lir’i’c (Plan astral) | Piller Lir’i’c (combat obligatoire). [Vaincre Lir’i’c] | — | — | Audités avec contraintes |
| `amulet-of-the-devout` | Coffre d’offrandes (sous-sol du Tabernacle) | Piller le coffre d’offrandes principal. [Accepter la malédiction « Castigated By Divinity » (sauf Jaheira avec Khalid’s Gift) ET Perdre le commerce du Vicaire pour ce personnage] | — | — | Audités avec contraintes |
| `amulet-greater-health` | Archive (Maison de l’Espoir) | Désamorcer le piège (Escamotage 20) et voler sans combattre. **OU** Combattre le gardien. | — | — | Audités avec contraintes |
| `fey-semblance-amulet` | Mayrina (ou Kled) | Terminer la quête des survivantes de la guenaude. [Mayrina emmenée à Baldur’s Gate] | — | — | Audités avec contraintes |
| `spell-savant-amulet` | Coffre-fort de haute sécurité n° 1 (Maison des comptes) | Ouvrir le coffre n° 1. [Clé du coffre n° 1 ou crochetage] | — | — | Non résolus |
| `band-mystic-scoundrel` | Sac à dos (Jungle d’Akabi) | Gagner le jackpot d’Akabi et fouiller le sac à dos (distinct du coffre de Nyrulna). [Jackpot gagné] | — | — | Audités avec contraintes |
| `ring-of-regeneration` | Rolan ou Lorroakan | Selon l’état de Rolan et de Lorroakan. [Rolan et/ou Lorroakan présent] | — | Rolan vivant + Lorroakan mort : porté dans la tour, peut disparaître. | Audités avec contraintes |
| `elixir-cloud-giant-strength` | Fabrication (Doigt de géant des nuages) | Fabriquer avec Salts of Cloud Giant Fingernails + toute suspension. [Doigt de géant des nuages (Blurg ou Derryth, niveau 6+)] | — | Matériaux : Cloud Giant Finger vendu par Blurg et Derryth à partir du niveau 6. | Audités avec contraintes |
| `gauntlets-hill-giant-strength` | Archive (Maison de l’Espoir) | Voler sans combat (piège désamorcé, poids équivalent). | — | — | Audités avec contraintes |

Les extraits probants de chaque ligne sont dans `audit-acquisitions.json` (`objets[].preuves`), avec la page, l’URL et la révision.

</details>

## 5. Index PNJ / quête → objets

<details><summary>Index (regroupé par porteur ou source)</summary>

| PNJ / source | Objets concernés |
| --- | --- |
| A’jak’nir Jeera | `unseen-menace`, `gloves-of-dexterity`, `daredevil-gloves` |
| Alpha des molosses d’ombre | `shadow-cloaked-ring` |
| Anders | `sword-of-justice` |
| Araj Oblodra | `thunderskin-cloak`, `robe-exquisite-focus`, `ring-free-action`, `risky-ring` |
| Archive | `amulet-greater-health`, `gauntlets-hill-giant-strength` |
| Auntie Ethel | `auntie-ethels-hair` |
| Blurg | `melfs-first-staff`, `the-lifebringer` |
| Bœuf étrange | `hat-of-fire-acuity` |
| Caisses de Dror Ragzlin | `gloves-growling-underdog` |
| Cazador Szarr | `rhapsody` |
| Coffre | `gloves-sparkle-hands` |
| Coffre adamantin | `sentient-amulet-rare` |
| Coffre d’offrandes | `amulet-of-the-devout` |
| Coffre de Polma | `amulet-misty-step` |
| Coffre de voyageur | `vivacious-cloak` |
| Coffre des appartements de Ketheric | `cloak-elemental-absorption` |
| Coffre doré | `mask-of-soul-perception`, `protecty-sparkswall`, `bracers-of-defence` |
| Coffre doré sélunite | `moondrop-pendant` |
| Coffre élégant | `gloves-belligerent-skies`, `strange-conduit-ring` |
| Coffre gilded verrouillé | `cap-of-curing` |
| Coffre invisible | `pyroquickness-hat` |
| Coffre moussu | `haste-helm` |
| Coffre opulent | `callous-glow-ring` |
| Coffre peint verrouillé | `nyrulna` |
| Coffre piégé | `coruscation-ring` |
| Coffre verrouillé | `ring-mental-inhibition` |
| Coffre-fort de haute sécurité n° 1 | `spell-savant-amulet` |
| Coffre-fort de Raphaël | `staff-of-spellpower` |
| Crusher | `crushers-ring` |
| Dammon | `charge-bound-warhammer`, `darkfire-shortbow`, `armour-of-persistence`, `flawed-helldusk-gloves`, `legacy-of-the-masters`, `boots-of-persistence` |
| Derryth Bonecloak | `amulet-of-restoration`, `caustic-band` |
| Entharl Danthelon | `cloak-of-displacement` |
| Épée dans la pierre | `phalar-aluve` |
| Épreuve du dédoublement | `killers-sweetheart` |
| Ethel | `elixir-hill-giant-strength` |
| Fabrication | `elixir-cloud-giant-strength` |
| Ferg Drogher | `hellrider-longbow`, `robe-supreme-defences` |
| Forge adamantine | `armure-adamantine` |
| Fytz the Firecracker | `the-dead-shot` |
| Gish Far’aag | `ring-arcane-synergy` |
| Gish Umr’a’ac | `ring-elemental-infusion` |
| Globe d’invulnérabilité | `markoheshkir`, `robe-of-the-weave` |
| Grat | `boots-aid-comfort` |
| Grym | `grymskull-helm` |
| Haarlep | `helldusk-gloves` |
| Helsik | `cloak-of-the-weave` |
| Hope | `gloves-soul-catching` |
| Kagha | `broodmothers-revenge` |
| Ketheric Thorm | `ketherics-shield` |
| La Gardienne | `spellcrux-amulet` |
| Lady Esther | `the-graceful-cloth`, `gloves-cinder-sizzle`, `periapt-wound-closure` |
| Lann Tarv | `halberd-of-vigilance`, `sentinel-shield`, `fistbreaker-helm` |
| Lucretious | `spellmight-gloves` |
| Malus Thorm | `surgeons-subjugation-amulet` |
| Mattis | `cloak-cunning-brume` |
| Mayrina | `fey-semblance-amulet` |
| Mimique | `spineshudder-amulet` |
| Minthara | `spidersilk-armour` |
| Mol | `ring-of-protection` |
| Mystic Carrion | `hood-of-the-weave` |
| Nere | `disintegrating-night-walkers` |
| Omeluum | `shadespell-circlet`, `boots-stormy-clamour`, `pearl-of-power-amulet` |
| Prélate Lir’i’c | `boots-uninhibited-kushigo` |
| Projection de Lorroakan | `birthright` |
| Quartermaster Talli | `cloak-of-protection`, `yuan-ti-scale-mail`, `amulet-of-the-harpers` |
| Récompense de Florrick | `the-spellsparkler` |
| Roah Moonglow | `drakethroat-glaive`, `bow-of-awareness`, `ring-spiteful-thunder` |
| Rolan | `vest-soul-rejuvenation`, `ring-of-regeneration` |
| Sac à dos | `band-mystic-scoundrel` |
| Thulla | `boots-of-speed` |
| Vicar Humbletoes | `mantle-holy-warrior`, `reviving-hands` |
| Vitrine de la chambre de l’Inquisiteur | `necklace-elemental-augmentation` |
| Volo | `whispering-promise` |
| Zevlor | `hellriders-pride` |

</details>

## 6. Index événements irréversibles → actions à faire AVANT

<details><summary>Index des événements</summary>

#### Quitter le Sentier de Rosemorne / l’ascenseur de Grymforge, ou aller aux Terres maudites, avec « Sauver les réfugiés » non résolue
- **Conséquence :** Réfugiés tués, Bosquet scellé. Dammon et Zevlor : établi par les pages. Mattis : inférence (même groupe de réfugiés).
- **À faire avant :** Vaincre les chefs gobelins et régler Kagha avant tout départ ; acheter à Mattis / Esther / Zevlor tant que le Bosquet est ouvert.
- **Objets :** `charge-bound-warhammer`, `darkfire-shortbow`, `flawed-helldusk-gloves`, `armour-of-persistence`, `boots-of-persistence`, `legacy-of-the-masters`, `cloak-cunning-brume`, `hellriders-pride`
> « [Rite of Thorns > Returning to the Grove] === Automatic failure === » — [Save the Refugees](https://bg3.wiki/wiki/Save_the_Refugees) (rév. 422653)
> « Travelling to the Rosymorn Monastery Trail or the Shadow-Cursed Lands before resolving Kagha's Rite of Thorns, results in the expulsion of all the tiefling refugees from the Emerald Grove; Zevlor's corpse is then among the bodies of all the other refugees near the bridge to the Blighted Village. » — [Zevlor](https://bg3.wiki/wiki/Zevlor) (rév. 439369)

#### S’approcher de Waukeen’s Rest puis se reposer, voyager vite ou partir pour Rosemorne
- **Conséquence :** Les survivants dont Florrick meurent.
- **À faire avant :** Sauver Florrick dans la même session.
- **Objets :** `the-spellsparkler`
> « Warning! Approaching Waukeen's Rest closely enough to trigger companion dialogue and then long resting, fast traveling (e.g. to camp) or venturing to Rosymorn Monastery Trail, causes the trapped survivors, including Florrick, to die. If this happens, this quest can still be obtained in Act Three. » — [Rescue the Grand Duke](https://bg3.wiki/wiki/Rescue_the_Grand_Duke) (rév. 408690)

#### Révéler la forme de guenaude d’Ethel, la laisser fuir, ou la tuer à la Maison de thé
- **Conséquence :** Sa boutique ferme définitivement ; Cheveu perdu si elle meurt avant la scène du repaire.
- **À faire avant :** Acheter les élixirs voulus ; autres marchands possibles (voir matrice).
- **Objets :** `elixir-hill-giant-strength`, `auntie-ethels-hair`
> « …  Emerald Grove before relocating to the Riverside Teahouse. Her shop becomes unavailable for the rest of the game once she first reveals her true hag form (for any reason), retreats into her Overgrown Tunnel, or is killed during the confrontation at the Riverside Teahouse.] » — [Auntie Ethel](https://bg3.wiki/wiki/Auntie_Ethel) (rév. 439151)
> « … damage. The spell Command is very helpful in this. However, if she is killed before the cut-scene in her lair, Auntie Ethel's Hair cannot be obtained.] In her lair, victims and thralls of the hag are found. Some of them can be freed, while others must usually be fought and are lost forever. » — [Auntie Ethel](https://bg3.wiki/wiki/Auntie_Ethel) (rév. 439151)

#### Tuer Roah en Acte I
- **Conséquence :** Boutique d’Acte II manquée.
- **À faire avant :** Ne pas la tuer ; acheter l’arc d’Acte I (`bow-of-awareness`) avant le massacre du sous-sol.
- **Objets :** `drakethroat-glaive`, `ring-spiteful-thunder`
> « If Roah is killed in Act One, the party misses out on purchasing items from her shop in Act Two. » — [Roah Moonglow](https://bg3.wiki/wiki/Roah_Moonglow) (rév. 431417)

#### Empoisonner les gobelins de la cour
- **Conséquence :** Grat ferme sa boutique.
- **À faire avant :** Acheter chez Grat avant ; la bague peut aussi venir de Volo.
- **Objets :** `boots-aid-comfort`, `whispering-promise`
> « Grat tends his makeshift shop which is in the main area of the Goblin Camp. He recently participated in a raid on Waukeen's Rest and is trying to sell the items he looted from the dead. If the goblins in the courtyard are poisoned and go on high alert, Grat closes his shop. » — [Grat](https://bg3.wiki/wiki/Grat) (rév. 414927)

#### Quitter la colonie myconide sans terminer la quête d’Omeluum
- **Conséquence :** Quête close sans aide ; le commerce n’est pas documenté.
- **À faire avant :** Terminer la quête et acheter en Acte I.
- **Objets :** `boots-stormy-clamour`, `shadespell-circlet`, `pearl-of-power-amulet`, `amulet-misty-step`
> « "We left the area before Omeluum could help. We'll need to find a cure somewhere else." » — [Help Omeluum Investigate the Parasite](https://bg3.wiki/wiki/Help_Omeluum_Investigate_the_Parasite) (rév. 419477)

#### Entrer dans le Shadowfell (Gantelet de Shar)
- **Conséquence :** Dammon ne fabrique plus rien ; commerce seul.
- **À faire avant :** Faire forger les trois pièces Helldusk voulues (un Fer/Alliage infernal par pièce).
- **Objets :** `flawed-helldusk-gloves`
> « Within Act Two, any special equipment can only be crafted before the party enters the Shadowfell in Gauntlet of Shar. After this, if Dammon survives, he remains at Last Light Inn, but only his trading menu is available. » — [Dammon](https://bg3.wiki/wiki/Dammon) (rév. 414844)

#### Laisser capturer/tuer Isobel, ou tuer le Chant de la nuit
- **Conséquence :** L’auberge tombe : occupants tués ou maudits.
- **À faire avant :** Acheter à Dammon, Talli et Mattis avant de risquer l’enlèvement ; sauver Isobel.
- **Objets :** `charge-bound-warhammer`, `darkfire-shortbow`, `flawed-helldusk-gloves`, `cloak-of-protection`, `amulet-of-the-harpers`, `yuan-ti-scale-mail`, `cloak-cunning-brume`, `elixir-hill-giant-strength`
> « If Isobel is captured or killed, the Inn falls. Everyone besides the party and Jaheira, who are protected by Selune's blessing, are either killed immediately or transformed by the shadow curse. The party has to face a massive battle against the shadow cursed residents: » — [Resolve the Abduction](https://bg3.wiki/wiki/Resolve_the_Abduction) (rév. 422327)
> « If the Nightsong is killed, Isobel becomes overwhelmed and unable to sustain her protection over the Inn, killing her and all others within. » — [Isobel](https://bg3.wiki/wiki/Isobel) (rév. 431344)

#### Entrer dans la colonie illithid
- **Conséquence :** Dammon indisponible jusqu’en Acte III.
- **À faire avant :** Acheter avant d’y entrer.
- **Objets :** `charge-bound-warhammer`, `darkfire-shortbow`
> « Last Light Inn [note : Dammon becomes unavailable when the party enter the Mind Flayer Colony near the end of Act Two and only reappears in the Lower City in Act Three.] in Act Two. » — [Dammon](https://bg3.wiki/wiki/Dammon) (rév. 414844)

#### Refuser le sang d’Araj en Acte II
- **Conséquence :** Araj quitte Lunelevée ; plus de rattrapage en Acte III.
- **À faire avant :** Acheter à Lunelevée, ou donner du sang et accepter Formula Gruna en Acte III.
- **Objets :** `thunderskin-cloak`, `robe-exquisite-focus`, `ring-free-action`, `risky-ring`
> « … now has no choice but to observe their evolution from afar. She then runs to disappear from Moonrise Towers (and the rest of Act Two). » — [Araj Oblodra](https://bg3.wiki/wiki/Araj_Oblodra) (rév. 438225)

#### Assommer ou tuer Lann Tarv
- **Conséquence :** Plus de commerce avec lui.
- **À faire avant :** Acheter avant tout conflit.
- **Objets :** `halberd-of-vigilance`, `sentinel-shield`, `fistbreaker-helm`
> « … arty member to prove their worth, they can respond: [note : If Lann Tarv is Knocked Out, he cannot be spoken to or traded with later. Doing this eliminates the earliest consistent source of Potion of Angelic Reprieve in the game.] » — [Lann Tarv](https://bg3.wiki/wiki/Lann_Tarv) (rév. 440150)

#### Dialogue de Ferg avec Ombrecœur proche (elle a rejeté Shar)
- **Conséquence :** Ferg part définitivement.
- **À faire avant :** Acheter sans Ombrecœur à proximité.
- **Objets :** `hellrider-longbow`, `robe-supreme-defences`
> « If Shadowheart rejected Shar, he threatens her and provides the same directions to the House of Grief for her to receive punishment. When this dialogue finishes, he walks away forever, locking the party out of his trade goods. » — [Ferg Drogher](https://bg3.wiki/wiki/Ferg_Drogher) (rév. 425473)

#### Rolan non sauvé avant un repos long (Champ de bataille)
- **Conséquence :** Rolan meurt ; Lorroakan vend à sa place.
- **À faire avant :** Pas d’action bloquante : seule la perte des deux ferme l’anneau.
- **Objets :** `birthright`, `ring-of-regeneration`, `vest-soul-rejuvenation`
> « … g the Prodigious to party members with the w=20 background. If Rolan is not saved before long resting, he is overtaken by the Shadow Curse and dies. [note : If Rolan is made Temporarily Hostile while fighting the Shadows by, for example, accidentally hitting him with an AoE spell, the cutscene in which he leaves for th … » — [Rolan](https://bg3.wiki/wiki/Rolan) (rév. 431419)

#### Gagner le jackpot d’Akabi, voler sa bague, ou seize tours
- **Conséquence :** Le jeu ferme ; la jungle n’est accessible qu’une fois.
- **À faire avant :** Préparer le personnage envoyé seul ; prendre les deux contenants.
- **Objets :** `nyrulna`, `band-mystic-scoundrel`
> « Akabi permanently closes down the game if one character wins the jackpot, all characters are turned to cheese, or if all consolation prizes are claimed by spinning the wheel 16 times. » — [Akabi](https://bg3.wiki/wiki/Akabi) (rév. 425239)

#### Repos long après la remise des gants par Lucretious
- **Conséquence :** Le cirque part.
- **À faire avant :** Acheter aux marchands du cirque avant.
- **Objets :** `spellmight-gloves`
> « … were previously pickpocketed). She lets the party know that the circus will finally leave soon (after the next long rest), so they should buy from its merchants while they still can. » — [Lucretious](https://bg3.wiki/wiki/Lucretious) (rév. 425487)

#### Voler dans le sous-sol du Tabernacle
- **Conséquence :** Le Vicaire refuse de commercer avec ce personnage.
- **À faire avant :** Acheter au Vicaire d’abord.
- **Objets :** `mantle-holy-warrior`, `reviving-hands`, `amulet-of-the-devout`
> « He refuses to trade with anyone who steals from the basement, but still trades if the offender is disguised or another party member talks to him instead. » — [Vicar Humbletoes](https://bg3.wiki/wiki/Vicar_Humbletoes) (rév. 414765)

#### S’allier à Thrumbo ou détruire les jarres de Mystic Carrion
- **Conséquence :** Carrion devient hostile.
- **À faire avant :** Acheter avant.
- **Objets :** `hood-of-the-weave`
> « If the party chooses to ally with Thrumbo or destroy any of Mystic Carrion's organ jars, he becomes hostile and attacks as soon as they return to Philgrave's Mansion. Likewise, if the party destroys any of Mystic Carrion's jars before ever meeting him, he is immediately hostile. » — [Mystic Carrion](https://bg3.wiki/wiki/Mystic_Carrion) (rév. 440839)

#### Laisser Ethel garder Mayrina ou accepter son accord
- **Conséquence :** Mayrina absente en Acte III.
- **À faire avant :** Libérer Mayrina et l’emmener.
- **Objets :** `fey-semblance-amulet`
> « … s deal was accepted and the hag took Mayrina with her, then Mayrina is nowhere to be found in Act Three. Otherwise Mayrina moves to Old Garlow's Place in the Lower City where she works with a group of hag survivors and is polymorphed into a sheep. She can be returned to her original form by casting Remove Curse on eith … » — [Mayrina](https://bg3.wiki/wiki/Mayrina) (rév. 438667)

</details>

## 7. Inconnus

Aucun inconnu n’est classé « sans risque ». Chaque ligne donne les pages lues, la question restante et la portée exacte.

| Origine | Question restante | Pages lues | Portée |
| --- | --- | --- | --- |
| chaine:dammon | Comportement exact si Dammon est présent mais le groupe a perdu Isobel après avoir déjà acheté : aucun passage lu ne dit qu’un achat déjà fait est repris (il n’y a pas de raison d’en douter, mais ce n’est pas écrit). | Dammon, Save_the_Refugees, Resolve_the_Abduction, Isobel | Achats d’Acte II seulement ; ne change pas la condition « Isobel sauvée » pour les achats futurs. |
| chaine:dammon | La page de Dammon ne décrit pas son état en Acte III si le groupe est passé par l’effondrement de l’auberge en ayant ensuite tué tous les occupants : le cas « Dammon mort » est le seul que les sources établissent comme impossible (un mort ne commerce pas). | Dammon | Acte III : stock Armour/Boots of Persistence, Legacy of the Masters. |
| chaine:omeluum | La page ne dit pas si Omeluum commerce encore quand le groupe a quitté la colonie sans terminer la quête mais y revient plus tard (le texte de fin de quête parle seulement d’un départ de la zone). | Omeluum, Help_Omeluum_Investigate_the_Parasite | Achats de Stormy Clamour / Shadespell Circlet / Pearl of Power : on ne sait pas si l’on peut « rattraper » après un départ. |
| chaine:moonrise | Date exacte de fermeture des boutiques du hall de Lunelevée (après l’assaut, avant l’entrée dans la colonie ?) : non établie par les pages lues. | Lann_Tarv, Moonrise_Towers, Roah_Moonglow | Achats chez Lann Tarv, Roah et Araj en Acte II : acheter avant l’ascension du toit de Lunelevée est une précaution, pas une échéance sourcée. |
| chaine:ferg | Portée exacte du terme « nearby » (distance en mètres) : non indiquée. | Ferg_Drogher, Hellrider_Longbow | Les deux objets de Ferg ; à vérifier en jeu, non résoluble par le wiki. |
| chaine:sundries | Birthright : la page n’indique pas les rattrapages quand les deux marchands sont absents ; seul l’anneau a un tableau complet. | Birthright, Rolan | Birthright uniquement. |
| chaine:hope | Staff of Spellpower : les contrôles Sagesse 10 + Arcanes 20 sont donnés, mais le lien avec l’avancement de « Save Hope » (avant/après le vol du Marteau) n’est pas lu en détail. | Staff_of_Spellpower, Save_Hope | Staff of Spellpower uniquement. |
| chaine:ethel | La page de l’objet cite « Avenge the Hag Survivors », celle de Mayrina « Help the Hag Survivors » : quelle quête déclenche la récompense n’est pas tranché. La mention « Kled » est marquée [verify] sur le wiki. | Fey_Semblance_Amulet, Mayrina | Fey Semblance Amulet. |
| chaine:bosquet | Koll (HAUTE SALLE) : la page « Koll » est une désambiguïsation, l’acte et l’accessibilité du second exemplaire ne sont pas établis. | Broodmother's_Revenge | Seulement l’alternative Koll de Broodmother’s Revenge. |
| chaine:gobelins | La page de Grat n’affiche pas la bague dans son tableau de stock lu ; seule la page de la bague l’indique. | Grat, The_Whispering_Promise | Source Grat de The Whispering Promise ; la source Volo, elle, est listée sur la page de Volo. |
| chaine:kushigo | Impossibilité de retour au Plan astral après la transition vers l’Acte III : non sourcée sur les deux pages, ne pas la présenter comme établie. | Boots_of_Uninhibited_Kushigo, Prelate_Lir'i'c | Boots of Uninhibited Kushigo. |
| chaine:creche | Fermeture ou départ de la Crèche après l’épisode de Lae’zel : non établie par les pages lues. | A'jak'nir_Jeera, Ring_of_Arcane_Synergy | Les objets de la Crèche ; ne pas la présenter comme une échéance. |
| chaine:stormshore | Effet précis de « Stop the Presses » sur le commerce (attitude seule ou refus) : non détaillé. | Vicar_Humbletoes | Prix et disponibilité des deux achats. |
| the-spellsparkler | La récompense d’Acte III (Florrick sauvée à Wyrm’s Rock) inclut-elle le choix de The Spellsparkler ? | Rescue_the_Grand_Duke, The_Spellsparkler | Seulement le rattrapage d’Acte III. |
| markoheshkir | Chemin d’accès complet à la tour selon les issues de la quête Lorroakan. | Ramazith's_Tower | Accès uniquement ; les jets sont établis. |
| staff-of-spellpower | Lien avec l’avancement de « Sauver Hope ». | Staff_of_Spellpower | Cet objet seul. |
| rhapsody | Rhapsody reste-t-elle pillable si Astarion tue lui-même Cazador (branches « convaincre » / « refuser d’aider ») ? | Rhapsody, Cazador_Szarr | Rhapsody : l’issue exacte des trois branches du rituel. |
| unseen-menace | Jeera commerce-t-elle après une hostilité de la Crèche ou le départ définitif du groupe ? | A'jak'nir_Jeera | Les quatre objets de Jeera (Unseen Menace, Gloves of Dexterity, Daredevil Gloves). |
| cloak-cunning-brume | Mattis reste-t-il marchand après la chute de l’auberge ? | Mattis | Cet objet seul. |
| mantle-holy-warrior | Effet précis du résultat de « Stop the Presses » sur son attitude. | Vicar_Humbletoes | Prix seulement. |
| armure-adamantine | Où se trouvent le moule et le mithral ? | Adamantine_Splint_Armour | Matériaux seulement. |
| the-graceful-cloth | Esther commerce-t-elle encore si la quête de l’œuf est refusée ou si elle est attaquée ? | Lady_Esther | Les trois objets d’Esther. |
| spidersilk-armour | L’armure est-elle récupérable si Minthara est recrutée ou épargnée ? | Spidersilk_Armour, Minthara | Seulement la voie sans mort. |
| flawed-helldusk-gloves | Où trouver chaque pièce d’Infernal Iron et lesquelles sont réservées à Karlach ? | Dammon, Flawed_Helldusk_Gloves | Matériaux seulement. |
| disintegrating-night-walkers | Les bottes sont-elles obtenables si Nere n’est pas tué (accord avec Brithvar, autres issues) ? | Nere, Disintegrating_Night_Walkers | Seulement les issues où Nere survit. |
| boots-uninhibited-kushigo | Possibilité de revenir au Plan astral après la transition. | Boots_of_Uninhibited_Kushigo | Non sourcé. |
| fey-semblance-amulet | Quelle quête précise donne la récompense ? | Fey_Semblance_Amulet | Cet objet. |
| broodmothers-revenge | Contexte de la table de Koll. | Koll | Alternative seulement. |
| spell-savant-amulet | Emplacement de la clé du coffre n° 1 et difficulté du crochetage. | Counting_House, Spell_Savant_Amulet | Cet objet. |
| ring-arcane-synergy | La fiche conseille de le prendre avant de quitter la Crèche : fermeture non sourcée. | Ring_of_Arcane_Synergy | Précaution seulement. |
| elixir-cloud-giant-strength | La disponibilité « garantie » d’un doigt à chaque rafraîchissement n’est pas établie. | Elixir_of_Cloud_Giant_Strength | Quantité d’élixirs. |

## 8. Erreurs et approximations du code actuel

Constats sur `main` ; aucune correction n’est apportée ici. Les liens wiki existants ne sont pas pris pour des preuves : chaque ligne a été recoupée sur le passage cité.

| Fichier | ID | Ligne | Gravité | Constat | Correction proposée |
| --- | --- | ---: | --- | --- | --- |
| `src/data/acquisition.js` | `chapeau-acuite-boeuf` | 108 | erreur | Les voies `boeuf-vu-ultime-lueur` / `boeuf-vu-rivington` lèvent l’alerte sur une simple rencontre. Le butin du bœuf précise que le chapeau n’est obtenu que si le bœuf est tué en Acte II ou III ; l’issue « Aider le bœuf diabolique » laisse l’anneau, pas le chapeau. | Remplacer les voies « rencontré vivant » par « bœuf tué à l’Ultime Lueur / à Rivington » ; garder « laissé vivant en Acte I » comme précaution. |
| `src/data/acquisition.js` | `dammon-survie` | 147 | approximation | Classée `a-verifier` / `precaution` avec le texte « incertain », alors que la chaîne de survie est documentée à plusieurs niveaux (réfugiés, Ultime Lueur, Isobel / Chant de la nuit). Elle ne mentionne pas non plus les achats d’Acte II ni Talli / Mattis. | Passer en `verifie`, décrire les trois niveaux (réfugiés ; Isobel ; indisponibilité entre les actes) et étendre aux objets d’Acte II. |
| `src/data/acquisition.js` | `dammon-achats-acte2` | 129 | approximation | Regroupe `flawed-helldusk-gloves` (fabriqué) avec deux achats et l’attache à `colonie-illithid`. Le wiki place l’échéance de fabrication AVANT le Shadowfell, pas à l’entrée de la colonie ; les achats suivent une autre échéance. | Scinder : fabrication Helldusk (échéance Shadowfell) / achats (colonie illithid) ; ajouter la dépendance Isobel. |
| `src/data/acquisition.js` | `ethel-elixirs` | 201 | surestimation | Sévérité `bloquant` + `irreversible: true` pour `elixir-hill-giant-strength`. L’élixir est vendu par sept autres marchands et se fabrique : seule la pile de trois par repos d’Ethel disparaît. | Abaisser à `attention` ; conserver l’alerte sur la source la plus précoce ; citer les alternatives. |
| `src/data/acquisition.js` | `kagha-broodmother` | 291 | approximation | Le texte « dépend de la résolution de la quête de Kagha » n’est pas dans le wiki : l’amulette est portée par Kagha (mort ou non létal) ; une seconde source (table de Koll) est listée. La récompense de la quête concerne Hellrider’s Pride (Zevlor). | Réécrire autour de « porté par Kagha » ; documenter l’assommer-non-létal et l’alternative Koll. |
| `src/data/acquisition.js` | `rolan-lorroakan` | 273 | approximation | Conseil « acheter avant de résoudre leur conflit » appliqué aux deux objets. Les quatre états documentés laissent les objets disponibles sauf si les deux sont absents, avec un risque de disparition seulement pour l’anneau porté par Rolan. `birthright` (même vendeur) est absent. | Représenter les quatre états ; distinguer l’anneau (peut disparaître) du gilet (commerce via dialogue) ; ajouter `birthright`. |
| `src/data/acquisition.js` | `akabi-jungle` | 237 | omission | Dit « Aucune sortie irréversible n’est établie ». Le jackpot est une occasion unique (le jeu ferme après un jackpot ou 16 tours) et voler la bague ou distraire en Barde exclut les lots de consolation. | Ajouter la mention du coût (500 po par tour) et de l’occasion unique. |
| `src/data/acquisition.js` | plusieurs | — | omission | Aucune condition n’existe pour : chaîne Omeluum (`boots-stormy-clamour`, `shadespell-circlet`, `pearl-of-power-amulet`, `amulet-misty-step`) ; Ferg (`hellrider-longbow`, `robe-supreme-defences`) ; Talli (`cloak-of-protection`, `amulet-of-the-harpers`, `yuan-ti-scale-mail`) ; Lann Tarv, Araj, Mattis ; Hope (`gloves-soul-catching`) ; Spellmight Gloves ; Whispering Promise ; Ring of Protection ; Humbletoes / sous-sol ; Mystic Carrion. | Ajouter les conditions correspondantes d’après la matrice (Follow-up 3/4). |
| `src/data/objets.js` | `amulet-misty-step` | — | omission | Une seule source (coffre de Polma). Le wiki liste aussi le stock d’Omeluum, avec un unique exemplaire pour les deux sources. | Ajouter la source Omeluum et la mention d’exclusivité. |
| `src/data/objets.js` | `cloak-of-the-weave` | — | approximation | Verrou `quete` pour le stock spécial de Helsik. Le wiki décrit un déblocage par jets de Perception et d’Arcanes, pas une quête. | Changer le verrou et le texte. |
| `src/data/objets.js` | `thunderskin-cloak` | — | approximation | Rattrapage « selon le parcours d’Araj » (également `ring-free-action`). Le wiki le précise : Crimson Draughts, si du sang a été donné en Acte II puis si la potion Formula Gruna est acceptée. | Remplacer par la chaîne exacte. |
| `src/data/objets.js` | `whispering-promise` | — | approximation | Source « Volo, Bosquet ou camp ». Le wiki distingue Volo (Bassin sacré via le bouton de commerce, ou camp) et Grat, mutuellement exclusifs. | Documenter l’exclusivité Volo / Grat. |
| `src/data/objets.js` | `shadespell-circlet` | — | résolu | Source `aConfirmer` : le stock d’Omeluum la contient bien. | Retirer `aConfirmer` après intégration de la chaîne Omeluum. |

<details><summary>Passages à l’appui</summary>

**chapeau-acuite-boeuf** (`src/data/acquisition.js`)
> « Hat of Fire Acuity (only if killed in Act Two or Act Three) » — [Strange Ox](https://bg3.wiki/wiki/Strange_Ox) (rév. 434001)
> « … much indeed. Ta-ta!" The quest then ends and it disappears, leaving behind its Shapeshifter's Boon Ring and a Slightly Slimy Note. [note : If the Shapeshifter's Boon Ring was obtained earlier, the Ox leaves a random potion of moderate value in place of the ring.] If the party enters the Lower City before speaking to th … » — [Strange Ox](https://bg3.wiki/wiki/Strange_Ox) (rév. 434001)

**dammon-survie** (`src/data/acquisition.js`)
> « [Battle at the Inn > The Fallen Inn] Dammon (if alive). » — [Resolve the Abduction](https://bg3.wiki/wiki/Resolve_the_Abduction) (rév. 422327)
> « … o finish business before proceeding. If the party continue, the quest automatically completes with the refugees being killed and the grove sealed (as if one sided/let the Shadow druids seal the grove). Despite the grove being sealed, it is still possible to enter: starting from the location of where one finds Edowin, i … » — [Save the Refugees](https://bg3.wiki/wiki/Save_the_Refugees) (rév. 422653)
> « If the Nightsong is killed, Isobel becomes overwhelmed and unable to sustain her protection over the Inn, killing her and all others within. » — [Isobel](https://bg3.wiki/wiki/Isobel) (rév. 431344)

**dammon-achats-acte2** (`src/data/acquisition.js`)
> « Within Act Two, any special equipment can only be crafted before the party enters the Shadowfell in Gauntlet of Shar. After this, if Dammon survives, he remains at Last Light Inn, but only his trading menu is available. » — [Dammon](https://bg3.wiki/wiki/Dammon) (rév. 414844)
> « Last Light Inn [note : Dammon becomes unavailable when the party enter the Mind Flayer Colony near the end of Act Two and only reappears in the Lower City in Act Three.] in Act Two. » — [Dammon](https://bg3.wiki/wiki/Dammon) (rév. 414844)

**ethel-elixirs** (`src/data/acquisition.js`)
> « Entharl Danthelon at Danthelon's Dancing Axe » — [Elixir of Hill Giant Strength](https://bg3.wiki/wiki/Elixir_of_Hill_Giant_Strength) (rév. 438919)
> « …  Emerald Grove before relocating to the Riverside Teahouse. Her shop becomes unavailable for the rest of the game once she first reveals her true hag form (for any reason), retreats into her Overgrown Tunnel, or is killed during the confrontation at the Riverside Teahouse.] » — [Auntie Ethel](https://bg3.wiki/wiki/Auntie_Ethel) (rév. 439151)

**kagha-broodmother** (`src/data/acquisition.js`)
> « where to find = Carried by Kagha in the Emerald Grove » — [Broodmother's Revenge](https://bg3.wiki/wiki/Broodmother's_Revenge) (rév. 431623)
> « where to find = Carried by Zevlor and can be looted from him, stolen, or earned as a reward for Kill Kagha or Investigate Kagha » — [Hellrider's Pride](https://bg3.wiki/wiki/Hellrider's_Pride) (rév. 419462)

**rolan-lorroakan** (`src/data/acquisition.js`)
> « If Rolan and Lorroakan are both alive: Sold by Rolan in Sorcerous Sundries » — [Ring of Regeneration](https://bg3.wiki/wiki/Ring_of_Regeneration) (rév. 422391)
> « Sold by Rolan via trade option on the bottom left during the dialogue in Ramazith's Tower if Rolan is alive but Lorroakan is dead » — [Vest of Soul Rejuvenation](https://bg3.wiki/wiki/Vest_of_Soul_Rejuvenation) (rév. 424641)

**akabi-jungle** (`src/data/acquisition.js`)
> « … jackpot. However, stealing the ring or the Bard distraction permanently locks the party out of winning future consolation prizes. » — [Akabi](https://bg3.wiki/wiki/Akabi) (rév. 425239)
> « Akabi permanently closes down the game if one character wins the jackpot, all characters are turned to cheese, or if all consolation prizes are claimed by spinning the wheel 16 times. » — [Akabi](https://bg3.wiki/wiki/Akabi) (rév. 425239)

**omissions** (`src/data/acquisition.js`)
> « If Shadowheart rejected Shar, he threatens her and provides the same directions to the House of Grief for her to receive punishment. When this dialogue finishes, he walks away forever, locking the party out of his trade goods. » — [Ferg Drogher](https://bg3.wiki/wiki/Ferg_Drogher) (rév. 425473)
> « Obtaining the ring by any means completes the quest Help Omeluum investigate the parasite, and Omeluum can then be traded with. [note : While Omeluum can be pickpocketed prior to trading, it teleports away after repeated pickpocket attempts.] » — [Omeluum](https://bg3.wiki/wiki/Omeluum) (rév. 428216)

**amulet-misty-step** (`src/data/objets.js`)
> « notes = * The amulet can only acquired once, at whichever of the two locations that is accessed first. It will not appear at the other location. » — [Amulet of Misty Step](https://bg3.wiki/wiki/Amulet_of_Misty_Step) (rév. 415916)

**cloak-of-the-weave** (`src/data/objets.js`)
> « … s Alchemy ingredients, Grenades, and Dyes but the party can unlock trading access to her "Curated Selection" by passing multiple 5s to notice the diabolic curios in her collection and at least one 15 to identify the items as genuine. The interacting party member can say "Must be a diabolist running this shop with so ma … » — [Helsik](https://bg3.wiki/wiki/Helsik) (rév. 439098)

**thunderskin-cloak** (`src/data/objets.js`)
> « If blood is donated in Act Two, Araj moves to the Lower City of Baldur's Gate in Act Three. On approaching her shop, Crimson Draughts, just east of The Blushing Mermaid, a series of explosions trigger and while Araj runs out on fire, she is nevertheless thrilled. She praises the character, as their blood has given her  … » — [Araj Oblodra](https://bg3.wiki/wiki/Araj_Oblodra) (rév. 438225)
> « … s to drink, Araj does not become hostile at this stage, but does not act as a trader until they agree. » — [Araj Oblodra](https://bg3.wiki/wiki/Araj_Oblodra) (rév. 438225)

**whispering-promise** (`src/data/objets.js`)
> « If Volo is rescued and joins the party's camp, he sells the ring there if it was not previously acquired from him or Grat. Additionally, Grat no longer sells the ring after Volo leaves the Goblin Camp, even if Volo later dies or leaves the party's camp. » — [The Whispering Promise](https://bg3.wiki/wiki/The_Whispering_Promise) (rév. 424157)

**shadespell-circlet** (`src/data/objets.js`)
> « [Shop > Notable items sold] The Shadespell Circlet » — [Omeluum](https://bg3.wiki/wiki/Omeluum) (rév. 428216)

</details>

## 9. Pages consultées

<details><summary>154 pages, avec révision</summary>

- [A'jak'nir Jeera](https://bg3.wiki/wiki/A'jak'nir_Jeera) — rév. 416522
- [Adamantine Splint Armour](https://bg3.wiki/wiki/Adamantine_Splint_Armour) — rév. 437941
- [Akabi](https://bg3.wiki/wiki/Akabi) — rév. 425239
- [Amulet of Greater Health](https://bg3.wiki/wiki/Amulet_of_Greater_Health) — rév. 415915
- [Amulet of Misty Step](https://bg3.wiki/wiki/Amulet_of_Misty_Step) — rév. 415916
- [Amulet of Restoration](https://bg3.wiki/wiki/Amulet_of_Restoration) — rév. 415917
- [Amulet of the Devout](https://bg3.wiki/wiki/Amulet_of_the_Devout) — rév. 415922
- [Amulet of the Harpers](https://bg3.wiki/wiki/Amulet_of_the_Harpers) — rév. 415924
- [Anders](https://bg3.wiki/wiki/Anders) — rév. 414957
- [Araj Oblodra](https://bg3.wiki/wiki/Araj_Oblodra) — rév. 438225
- [Armour of Persistence](https://bg3.wiki/wiki/Armour_of_Persistence) — rév. 438425
- [Auntie Ethel](https://bg3.wiki/wiki/Auntie_Ethel) — rév. 439151
- [Auntie Ethel's Hair](https://bg3.wiki/wiki/Auntie_Ethel's_Hair) — rév. 426001
- [Band of the Mystic Scoundrel](https://bg3.wiki/wiki/Band_of_the_Mystic_Scoundrel) — rév. 416287
- [Birthright](https://bg3.wiki/wiki/Birthright) — rév. 416461
- [Blurg](https://bg3.wiki/wiki/Blurg) — rév. 434059
- [Boots of Aid and Comfort](https://bg3.wiki/wiki/Boots_of_Aid_and_Comfort) — rév. 416676
- [Boots of Persistence](https://bg3.wiki/wiki/Boots_of_Persistence) — rév. 416684
- [Boots of Speed](https://bg3.wiki/wiki/Boots_of_Speed) — rév. 416686
- [Boots of Stormy Clamour](https://bg3.wiki/wiki/Boots_of_Stormy_Clamour) — rév. 416687
- [Boots of Uninhibited Kushigo](https://bg3.wiki/wiki/Boots_of_Uninhibited_Kushigo) — rév. 416689
- [Bow of Awareness](https://bg3.wiki/wiki/Bow_of_Awareness) — rév. 416714
- [Bracers of Defence](https://bg3.wiki/wiki/Bracers_of_Defence) — rév. 416721
- [Broodmother's Revenge](https://bg3.wiki/wiki/Broodmother's_Revenge) — rév. 431623
- [Callous Glow Ring](https://bg3.wiki/wiki/Callous_Glow_Ring) — rév. 416881
- [Cap of Curing](https://bg3.wiki/wiki/Cap_of_Curing) — rév. 416893
- [Caustic Band](https://bg3.wiki/wiki/Caustic_Band) — rév. 416928
- [Cazador Szarr](https://bg3.wiki/wiki/Cazador_Szarr) — rév. 431696
- [Charge-Bound Warhammer](https://bg3.wiki/wiki/Charge-Bound_Warhammer) — rév. 416997
- [Cloak of Cunning Brume](https://bg3.wiki/wiki/Cloak_of_Cunning_Brume) — rév. 439152
- [Cloak of Displacement](https://bg3.wiki/wiki/Cloak_of_Displacement) — rév. 417139
- [Cloak of Elemental Absorption](https://bg3.wiki/wiki/Cloak_of_Elemental_Absorption) — rév. 417140
- [Cloak of Protection](https://bg3.wiki/wiki/Cloak_of_Protection) — rév. 417141
- [Cloak of the Weave](https://bg3.wiki/wiki/Cloak_of_the_Weave) — rév. 417143
- [Coruscation Ring](https://bg3.wiki/wiki/Coruscation_Ring) — rév. 417321
- [Counting House](https://bg3.wiki/wiki/Counting_House) — rév. 440067
- [Crusher's Ring](https://bg3.wiki/wiki/Crusher's_Ring) — rév. 417417
- [Dammon](https://bg3.wiki/wiki/Dammon) — rév. 414844
- [Daredevil Gloves](https://bg3.wiki/wiki/Daredevil_Gloves) — rév. 417509
- [Darkfire Shortbow](https://bg3.wiki/wiki/Darkfire_Shortbow) — rév. 428897
- [Derryth Bonecloak](https://bg3.wiki/wiki/Derryth_Bonecloak) — rév. 433882
- [Devil's Fee](https://bg3.wiki/wiki/Devil's_Fee) — rév. 439103
- [Disintegrating Night Walkers](https://bg3.wiki/wiki/Disintegrating_Night_Walkers) — rév. 417785
- [Drakethroat Glaive](https://bg3.wiki/wiki/Drakethroat_Glaive) — rév. 417927
- [Elixir of Cloud Giant Strength](https://bg3.wiki/wiki/Elixir_of_Cloud_Giant_Strength) — rév. 438918
- [Elixir of Hill Giant Strength](https://bg3.wiki/wiki/Elixir_of_Hill_Giant_Strength) — rév. 438919
- [Ferg Drogher](https://bg3.wiki/wiki/Ferg_Drogher) — rév. 425473
- [Fey Semblance Amulet](https://bg3.wiki/wiki/Fey_Semblance_Amulet) — rév. 418440
- [Fistbreaker Helm](https://bg3.wiki/wiki/Fistbreaker_Helm) — rév. 428835
- [Flawed Helldusk Gloves](https://bg3.wiki/wiki/Flawed_Helldusk_Gloves) — rév. 418596
- [Florrick](https://bg3.wiki/wiki/Florrick) — rév. 431924
- [Fytz the Firecracker](https://bg3.wiki/wiki/Fytz_the_Firecracker) — rév. 425232
- [Gauntlets of Hill Giant Strength](https://bg3.wiki/wiki/Gauntlets_of_Hill_Giant_Strength) — rév. 418818
- [Gloves of Belligerent Skies](https://bg3.wiki/wiki/Gloves_of_Belligerent_Skies) — rév. 437701
- [Gloves of Cinder and Sizzle](https://bg3.wiki/wiki/Gloves_of_Cinder_and_Sizzle) — rév. 418966
- [Gloves of Dexterity](https://bg3.wiki/wiki/Gloves_of_Dexterity) — rév. 418968
- [Gloves of Soul Catching](https://bg3.wiki/wiki/Gloves_of_Soul_Catching) — rév. 418975
- [Gloves of the Growling Underdog](https://bg3.wiki/wiki/Gloves_of_the_Growling_Underdog) — rév. 418982
- [Grat](https://bg3.wiki/wiki/Grat) — rév. 414927
- [Grymskull Helm](https://bg3.wiki/wiki/Grymskull_Helm) — rév. 419203
- [Halberd of Vigilance](https://bg3.wiki/wiki/Halberd_of_Vigilance) — rév. 419263
- [Haste Helm](https://bg3.wiki/wiki/Haste_Helm) — rév. 419356
- [Hat of Fire Acuity](https://bg3.wiki/wiki/Hat_of_Fire_Acuity) — rév. 419370
- [Helldusk Gloves](https://bg3.wiki/wiki/Helldusk_Gloves) — rév. 419450
- [Hellrider Longbow](https://bg3.wiki/wiki/Hellrider_Longbow) — rév. 438372
- [Hellrider's Pride](https://bg3.wiki/wiki/Hellrider's_Pride) — rév. 419462
- [Help Omeluum Investigate the Parasite](https://bg3.wiki/wiki/Help_Omeluum_Investigate_the_Parasite) — rév. 419477
- [Helsik](https://bg3.wiki/wiki/Helsik) — rév. 439098
- [Hood of the Weave](https://bg3.wiki/wiki/Hood_of_the_Weave) — rév. 440565
- [Investigate Kagha](https://bg3.wiki/wiki/Investigate_Kagha) — rév. 428719
- [Isobel](https://bg3.wiki/wiki/Isobel) — rév. 431344
- [Kagha](https://bg3.wiki/wiki/Kagha) — rév. 429080
- [Ketheric's Shield](https://bg3.wiki/wiki/Ketheric's_Shield) — rév. 437960
- [Killer's Sweetheart](https://bg3.wiki/wiki/Killer's_Sweetheart) — rév. 420126
- [Lady Esther](https://bg3.wiki/wiki/Lady_Esther) — rév. 425220
- [Lann Tarv](https://bg3.wiki/wiki/Lann_Tarv) — rév. 440150
- [Last Light Inn](https://bg3.wiki/wiki/Last_Light_Inn) — rév. 434007
- [Legacy of the Masters](https://bg3.wiki/wiki/Legacy_of_the_Masters) — rév. 420282
- [Lorroakan](https://bg3.wiki/wiki/Lorroakan) — rév. 440233
- [Lucretious](https://bg3.wiki/wiki/Lucretious) — rév. 425487
- [Malus Thorm](https://bg3.wiki/wiki/Malus_Thorm) — rév. 440628
- [Mantle of the Holy Warrior](https://bg3.wiki/wiki/Mantle_of_the_Holy_Warrior) — rév. 432492
- [Markoheshkir](https://bg3.wiki/wiki/Markoheshkir) — rév. 420819
- [Mask of Soul Perception](https://bg3.wiki/wiki/Mask_of_Soul_Perception) — rév. 420847
- [Mattis](https://bg3.wiki/wiki/Mattis) — rév. 415091
- [Mayrina](https://bg3.wiki/wiki/Mayrina) — rév. 438667
- [Melf's First Staff](https://bg3.wiki/wiki/Melf's_First_Staff) — rév. 420890
- [Minthara](https://bg3.wiki/wiki/Minthara) — rév. 438228
- [Mol](https://bg3.wiki/wiki/Mol) — rév. 439374
- [Moondrop Pendant](https://bg3.wiki/wiki/Moondrop_Pendant) — rév. 421071
- [Moonrise Towers](https://bg3.wiki/wiki/Moonrise_Towers) — rév. 440840
- [Mystic Carrion](https://bg3.wiki/wiki/Mystic_Carrion) — rév. 440839
- [Necklace of Elemental Augmentation](https://bg3.wiki/wiki/Necklace_of_Elemental_Augmentation) — rév. 421264
- [Nere](https://bg3.wiki/wiki/Nere) — rév. 438414
- [Nyrulna](https://bg3.wiki/wiki/Nyrulna) — rév. 421413
- [Omeluum](https://bg3.wiki/wiki/Omeluum) — rév. 428216
- [Pearl of Power Amulet](https://bg3.wiki/wiki/Pearl_of_Power_Amulet) — rév. 421729
- [Periapt of Wound Closure](https://bg3.wiki/wiki/Periapt_of_Wound_Closure) — rév. 421757
- [Phalar Aluve](https://bg3.wiki/wiki/Phalar_Aluve) — rév. 432441
- [Prelate Lir'i'c](https://bg3.wiki/wiki/Prelate_Lir'i'c) — rév. 431178
- [Pyroquickness Hat](https://bg3.wiki/wiki/Pyroquickness_Hat) — rév. 422056
- [Ramazith's Tower](https://bg3.wiki/wiki/Ramazith's_Tower) — rév. 440048
- [Rescue the Grand Duke](https://bg3.wiki/wiki/Rescue_the_Grand_Duke) — rév. 408690
- [Resolve the Abduction](https://bg3.wiki/wiki/Resolve_the_Abduction) — rév. 422327
- [Rhapsody](https://bg3.wiki/wiki/Rhapsody) — rév. 438247
- [Ring of Arcane Synergy](https://bg3.wiki/wiki/Ring_of_Arcane_Synergy) — rév. 438176
- [Ring of Elemental Infusion](https://bg3.wiki/wiki/Ring_of_Elemental_Infusion) — rév. 422375
- [Ring of Free Action](https://bg3.wiki/wiki/Ring_of_Free_Action) — rév. 422381
- [Ring of Mental Inhibition](https://bg3.wiki/wiki/Ring_of_Mental_Inhibition) — rév. 422386
- [Ring of Protection](https://bg3.wiki/wiki/Ring_of_Protection) — rév. 422390
- [Ring of Regeneration](https://bg3.wiki/wiki/Ring_of_Regeneration) — rév. 422391
- [Ring of Spiteful Thunder](https://bg3.wiki/wiki/Ring_of_Spiteful_Thunder) — rév. 437998
- [Risky Ring](https://bg3.wiki/wiki/Risky_Ring) — rév. 422408
- [Roah Moonglow](https://bg3.wiki/wiki/Roah_Moonglow) — rév. 431417
- [Robe of Exquisite Focus](https://bg3.wiki/wiki/Robe_of_Exquisite_Focus) — rév. 422435
- [Robe of Supreme Defences](https://bg3.wiki/wiki/Robe_of_Supreme_Defences) — rév. 422438
- [Robe of the Weave](https://bg3.wiki/wiki/Robe_of_the_Weave) — rév. 422439
- [Rolan](https://bg3.wiki/wiki/Rolan) — rév. 431419
- [Save Hope](https://bg3.wiki/wiki/Save_Hope) — rév. 429343
- [Save the Refugees](https://bg3.wiki/wiki/Save_the_Refugees) — rév. 422653
- [Sentient Amulet (Rare)](https://bg3.wiki/wiki/Sentient_Amulet_(Rare)) — rév. 439835
- [Sentinel Shield](https://bg3.wiki/wiki/Sentinel_Shield) — rév. 432480
- [Shadow-Cloaked Ring](https://bg3.wiki/wiki/Shadow-Cloaked_Ring) — rév. 423025
- [Sorcerous Vault](https://bg3.wiki/wiki/Sorcerous_Vault) — rév. 425330
- [Spell Savant Amulet](https://bg3.wiki/wiki/Spell_Savant_Amulet) — rév. 423437
- [Spellcrux Amulet](https://bg3.wiki/wiki/Spellcrux_Amulet) — rév. 423438
- [Spellmight Gloves](https://bg3.wiki/wiki/Spellmight_Gloves) — rév. 423439
- [Spidersilk Armour](https://bg3.wiki/wiki/Spidersilk_Armour) — rév. 423461
- [Spineshudder Amulet](https://bg3.wiki/wiki/Spineshudder_Amulet) — rév. 437847
- [Staff of Spellpower](https://bg3.wiki/wiki/Staff_of_Spellpower) — rév. 423537
- [Steal the Sacred Idol](https://bg3.wiki/wiki/Steal_the_Sacred_Idol) — rév. 434284
- [Strange Conduit Ring](https://bg3.wiki/wiki/Strange_Conduit_Ring) — rév. 423637
- [Strange Ox](https://bg3.wiki/wiki/Strange_Ox) — rév. 434001
- [Surgeon's Subjugation Amulet](https://bg3.wiki/wiki/Surgeon's_Subjugation_Amulet) — rév. 423738
- [Sword of Justice](https://bg3.wiki/wiki/Sword_of_Justice) — rév. 423794
- [Talli](https://bg3.wiki/wiki/Talli) — rév. 434270
- [The Dead Shot](https://bg3.wiki/wiki/The_Dead_Shot) — rév. 423982
- [The Graceful Cloth](https://bg3.wiki/wiki/The_Graceful_Cloth) — rév. 438139
- [The Lifebringer](https://bg3.wiki/wiki/The_Lifebringer) — rév. 432476
- [The Protecty Sparkswall](https://bg3.wiki/wiki/The_Protecty_Sparkswall) — rév. 424085
- [The Reviving Hands](https://bg3.wiki/wiki/The_Reviving_Hands) — rév. 437700
- [The Shadespell Circlet](https://bg3.wiki/wiki/The_Shadespell_Circlet) — rév. 424101
- [The Sparkle Hands](https://bg3.wiki/wiki/The_Sparkle_Hands) — rév. 424109
- [The Spellsparkler](https://bg3.wiki/wiki/The_Spellsparkler) — rév. 424114
- [The Whispering Promise](https://bg3.wiki/wiki/The_Whispering_Promise) — rév. 424157
- [Thulla](https://bg3.wiki/wiki/Thulla) — rév. 438643
- [Thunderskin Cloak](https://bg3.wiki/wiki/Thunderskin_Cloak) — rév. 432479
- [Unseen Menace](https://bg3.wiki/wiki/Unseen_Menace) — rév. 424533
- [Vest of Soul Rejuvenation](https://bg3.wiki/wiki/Vest_of_Soul_Rejuvenation) — rév. 424641
- [Vicar Humbletoes](https://bg3.wiki/wiki/Vicar_Humbletoes) — rév. 414765
- [Vivacious Cloak](https://bg3.wiki/wiki/Vivacious_Cloak) — rév. 425212
- [Volo](https://bg3.wiki/wiki/Volo) — rév. 439137
- [Yuan-Ti Scale Mail](https://bg3.wiki/wiki/Yuan-Ti_Scale_Mail) — rév. 425077
- [Zevlor](https://bg3.wiki/wiki/Zevlor) — rév. 439369

</details>

## 10. Passage au Follow-up 3/4

Le Follow-up 3/4 ne doit pas être lancé comme « audit terminé » sans intégrer cette matrice : le rapport de couverture ci-dessus donne les trois verdicts, les non résolus et les inférences restantes. Les décisions de code (nouvelles conditions, corrections de la section 8) y sont à prendre ; cette branche ne les prend pas.
