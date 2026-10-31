import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ACTES, acteDe, libelleActe } from './actes.js'
import { BUILDS, BUILDS_ANCIENS, buildDe, REFERENCES } from './builds.js'
import { EXPORT_PALADIN_HEXBLADE, EXPORT_SORCIER_FEU } from './exports-planner.js'
import {
  caracteristiquesEffectives,
  donsParNiveau,
  plafondsSorts,
  totauxClasses,
} from '../lib/niveaux.js'
import { ITEMS, PRIORITES, itemDe } from './items.js'
import { LIEUX, lieuDe } from './lieux.js'
import { CHECKLISTS } from './checklists.js'
import { ACCENTS } from '../lib/accents.js'
import { CLE_THEME, THEMES } from '../lib/themes.js'

const NUMEROS_ACTES = ACTES.map((acte) => acte.numero)

function doublons(valeurs) {
  const vus = new Set()
  return valeurs.filter((valeur) => (vus.has(valeur) ? true : (vus.add(valeur), false)))
}

describe('identifiants', () => {
  it('sont uniques dans chaque jeu de données', () => {
    expect(doublons(ITEMS.map((item) => item.id))).toEqual([])
    expect(doublons([...BUILDS, ...BUILDS_ANCIENS].map((build) => build.id))).toEqual([])
    expect(doublons(LIEUX.map((lieu) => lieu.id))).toEqual([])
    expect(doublons(CHECKLISTS.flatMap((liste) => liste.entrees.map((entree) => entree.id)))).toEqual([])
  })
})

describe('builds', () => {
  it('couvre les 4 rôles de la composition active', () => {
    expect(BUILDS.map((build) => build.id)).toEqual([
      'sorcier-feu',
      'paladin-hexblade',
      'moine-main-ouverte',
      'sidekick-savoir-vie',
    ])
    expect(BUILDS.map((build) => build.personnage)).toEqual([
      'Sorcier feu',
      'Paladin',
      'Moine',
      'Sidekick',
    ])
  })

  it('n’affecte aucun joueur à un rôle tant que ce n’est pas confirmé', () => {
    for (const build of BUILDS) expect(build.joueur, build.id).toBeNull()
  })

  it('ne réutilise aucun identifiant de l’ancienne composition ni nom de joueur', () => {
    const anciens = new Set(BUILDS_ANCIENS.map((build) => build.id))
    for (const build of BUILDS) {
      expect(anciens.has(build.id), build.id).toBe(false)
      expect(build.id).not.toMatch(/sam|baptiste|lilian/i)
    }
  })

  it('renvoie chaque rôle vers sa fiche Notion', () => {
    for (const build of BUILDS) {
      expect(build.reference.notion, build.id).toBe(REFERENCES[build.id])
      expect(build.reference.notion).toMatch(/^https:\/\/app\.notion\.com\/p\/[0-9a-f]{32}$/)
    }
  })

  it('décrit un leveling complet de 1 à 12', () => {
    for (const build of BUILDS) {
      expect(build.leveling.map((palier) => palier.niveau)).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
      ])
      for (const palier of build.leveling) {
        expect(palier.classe.length).toBeGreaterThan(0)
        expect(palier.gains.length).toBeGreaterThan(0)
      }
    }
  })

  it('porte un accent de couleur connu et les six caractéristiques', () => {
    for (const build of BUILDS) {
      expect(Object.keys(ACCENTS)).toContain(build.couleurAccent)
      expect(Object.keys(build.stats)).toEqual(['FOR', 'DEX', 'CON', 'INT', 'SAG', 'CHA'])
    }
  })

  it('prend chaque don à un palier de classe qui en donne un', () => {
    // Un don se prend au 4e/8e/12e niveau d'UNE classe : sur un multiclasse,
    // le niveau de personnage ne suffit pas. Le palier correspondant doit donc
    // annoncer le don dans son `gains`, sinon la fiche promet un don fantôme.
    for (const build of BUILDS) {
      for (const feat of build.feats) {
        const palier = build.leveling.find((entree) => entree.niveau === feat.niveau)
        expect(palier, `${build.id} : aucun palier au niveau ${feat.niveau}`).toBeDefined()
        expect(palier.gains, `${build.id} niveau ${feat.niveau} n’annonce pas de don`).toMatch(/Don/)
      }
      const niveaux = build.feats.map((feat) => feat.niveau)
      expect(niveaux).toEqual([...niveaux].sort((a, b) => a - b))
    }
  })

  it('n’annonce un don dans le leveling que s’il est détaillé dans les dons', () => {
    for (const build of BUILDS) {
      const niveauxDons = new Set(build.feats.map((feat) => feat.niveau))
      for (const palier of build.leveling.filter((entree) => /Don\s*:/.test(entree.gains))) {
        expect(niveauxDons, `${build.id} niveau ${palier.niveau}`).toContain(palier.niveau)
      }
    }
  })

  it('résout un rôle actif, retrouve l’ancienne composition et rien d’autre', () => {
    expect(buildDe('sorcier-feu')?.personnage).toBe('Sorcier feu')
    expect(buildDe('sorcier-feu')?.ancienne).toBeUndefined()
    // Les anciens liens et items y renvoient encore : ils restent lisibles,
    // marqués comme appartenant à l'ancienne composition.
    expect(buildDe('sam-freeze-thunder')?.personnage).toBe('Sam')
    expect(buildDe('sam-freeze-thunder')?.ancienne).toBe(true)
    expect(buildDe('inconnu')).toBeNull()
  })

  it('renvoie chaque entrée de lexique vers une fiche bg3.wiki en https', () => {
    // Les termes laissés en anglais (VF non vérifiée) doivent tous être
    // cliquables vers le wiki : c'est là qu'on lève le doute en jeu.
    for (const build of BUILDS) {
      for (const entree of build.lexique ?? []) {
        expect(entree.nom?.length, `${build.id} : entrée de lexique sans nom`).toBeGreaterThan(0)
        expect(entree.wiki, `${build.id} : lexique « ${entree.nom} »`).toMatch(
          /^https:\/\/bg3\.wiki\/wiki\/\S+$/,
        )
      }
    }
  })
})

describe('progression 1 → 12', () => {
  const RESUME = (totaux) =>
    Object.entries(totaux)
      .map(([classe, niveau]) => `${classe} ${niveau}`)
      .sort()
      .join(' / ')

  it('prend une classe à chaque niveau de personnage, 12 niveaux au total', () => {
    for (const build of BUILDS) {
      expect(build.ordre, build.id).toHaveLength(12)
      expect(build.leveling, build.id).toHaveLength(12)
    }
  })

  it('totalise les niveaux de classe annoncés par le split', () => {
    for (const build of BUILDS) {
      expect(totauxClasses(build.ordre), build.id).toEqual(build.repartitionFinale)
      const somme = Object.values(build.repartitionFinale).reduce((a, b) => a + b, 0)
      expect(somme).toBe(12)
    }
    expect(RESUME(totauxClasses(buildDe('moine-main-ouverte').ordre))).toBe('Moine 8 / Roublard 4')
    expect(RESUME(totauxClasses(buildDe('sidekick-savoir-vie').ordre))).toBe('Barde 10 / Clerc 2')
    expect(RESUME(totauxClasses(buildDe('paladin-hexblade').ordre))).toBe('Occultiste 8 / Paladin 4')
  })

  it('suit l’ordre annoncé : Moine 6 → Roublard 3 → Moine 8 → Roublard 4', () => {
    const { ordre } = buildDe('moine-main-ouverte')
    expect(totauxClasses(ordre, 6)).toEqual({ Moine: 6 })
    expect(totauxClasses(ordre, 9)).toEqual({ Moine: 6, Roublard: 3 })
    expect(totauxClasses(ordre, 11)).toEqual({ Moine: 8, Roublard: 3 })
    expect(totauxClasses(ordre, 12)).toEqual({ Moine: 8, Roublard: 4 })
  })

  it('suit l’ordre annoncé du Sidekick : Vie 1 → Savoir 6 → Vie 2 → Savoir 10', () => {
    const { ordre } = buildDe('sidekick-savoir-vie')
    expect(totauxClasses(ordre, 1)).toEqual({ Clerc: 1 })
    expect(totauxClasses(ordre, 7)).toEqual({ Clerc: 1, Barde: 6 })
    expect(totauxClasses(ordre, 8)).toEqual({ Clerc: 2, Barde: 6 })
    expect(totauxClasses(ordre, 12)).toEqual({ Clerc: 2, Barde: 10 })
  })

  it('n’accorde un don qu’aux paliers de classe qui en donnent', () => {
    // Un don se prend au 4e / 8e / 12e niveau d'UNE classe, pas du personnage.
    for (const build of BUILDS) {
      const niveaux = donsParNiveau(build.ordre).map((don) => don.niveau)
      expect(build.feats.map((feat) => feat.niveau), build.id).toEqual(niveaux)
    }
    // Moine 8 / Voleur 4 : trois dons ; 9/3 : deux seulement.
    expect(donsParNiveau(buildDe('moine-main-ouverte').ordre).map((don) => don.niveau)).toEqual([4, 11, 12])
    const neuf = buildDe('moine-main-ouverte').variantes.find((v) => v.id === 'moine-9-3')
    expect(donsParNiveau(neuf.ordre)).toHaveLength(2)
    // Le Sidekick n'a que deux dons (Barde 4 et Barde 8), aucun à Clerc 2.
    expect(donsParNiveau(buildDe('sidekick-savoir-vie').ordre).map((don) => don.niveau)).toEqual([5, 10])
  })

  it('décrit chaque variante avec un nombre de dons qui correspond à ses niveaux', () => {
    for (const build of BUILDS) {
      for (const variante of build.variantes) {
        expect(variante.cumulAvecPrincipal, `${build.id}/${variante.id}`).toBe(false)
        if (!variante.ordre) continue
        expect(variante.ordre, `${build.id}/${variante.id}`).toHaveLength(12)
        expect(donsParNiveau(variante.ordre), `${build.id}/${variante.id}`).toHaveLength(variante.dons)
      }
    }
  })

  it('compare les répartitions du Paladin avec les emplacements de pacte et dons réels', () => {
    const { comparaisonRepartitions } = buildDe('paladin-hexblade')
    expect(comparaisonRepartitions).toHaveLength(5)
    for (const ligne of comparaisonRepartitions) {
      expect(ligne.ordre, ligne.id).toHaveLength(12)
      expect(donsParNiveau(ligne.ordre), ligne.id).toHaveLength(ligne.dons)
      expect(plafondsSorts(totauxClasses(ligne.ordre)).emplacementPacteNiveau, ligne.id).toBe(ligne.pacte)
    }
  })

  it('garde la route recommandée du Paladin distincte de la répartition finale', () => {
    const paladin = buildDe('paladin-hexblade')
    const { lignes, statut } = paladin.routeRecommandee
    expect(statut).toBe('a-confirmer')
    expect(lignes.map((ligne) => ligne.niveau)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    for (const ligne of lignes) {
      expect(Object.values(ligne.repartition).reduce((a, b) => a + b, 0)).toBe(ligne.niveau)
    }
    // Respécialisation au niveau 7, puis même 4/8 à la fin : deux routes, une répartition.
    expect(lignes.find((ligne) => ligne.respec).niveau).toBe(7)
    expect(lignes[11].repartition).toEqual(paladin.repartitionFinale)
    expect(paladin.routeRecommandee.lignes).not.toEqual(
      paladin.ordre.map((_, index) => ({ niveau: index + 1, repartition: totauxClasses(paladin.ordre, index + 1) })),
    )
    // L'ordre de l'export laisse la seconde attaque (Occultiste 5) au niveau 9.
    expect(totauxClasses(paladin.export.ordre, 9).Occultiste).toBe(5)
    expect(totauxClasses(paladin.export.ordre, 8).Occultiste).toBe(4)
    // Et l'incertitude est écrite dans les données, pas seulement dans ce test.
    expect(paladin.aConfirmer.map((entree) => entree.id)).toContain('paladin-ordre-niveaux')
  })
})

describe('sorts connus et emplacements', () => {
  it('ne confond pas emplacement de niveau 6 et sort de niveau 6 connu (Sidekick 10/2)', () => {
    const plafonds = plafondsSorts(totauxClasses(buildDe('sidekick-savoir-vie').ordre))
    expect(plafonds.emplacementMax).toBe(6)
    expect(plafonds.sortConnuMax).toBe(5)
  })

  it('donne au Sorcier pur des sorts de niveau 6 appris, mais pas aux variantes qui s’arrêtent avant', () => {
    const sorcier = buildDe('sorcier-feu')
    expect(plafondsSorts(totauxClasses(sorcier.ordre)).sortConnuMax).toBe(6)
    const voleur93 = sorcier.variantes.find((v) => v.id === 'voleur-9-3')
    expect(plafondsSorts(totauxClasses(voleur93.ordre)).sortConnuMax).toBe(5)
    const voleur84 = sorcier.variantes.find((v) => v.id === 'voleur-8-4')
    expect(plafondsSorts(totauxClasses(voleur84.ordre)).sortConnuMax).toBe(4)
    // 11/1 Fiélon : l'Occultiste n'ajoute pas de niveau de lanceur aux emplacements du Sorcier.
    const fielon = sorcier.variantes.find((v) => v.id === 'fielon-11-1')
    const plafondsFielon = plafondsSorts(totauxClasses(fielon.ordre))
    expect(plafondsFielon.emplacementOrdinaireMax).toBe(6)
    expect(plafondsFielon.emplacementPacteNiveau).toBe(1)
    expect(plafondsFielon.sortConnuMax).toBe(6)
  })

  it('sépare emplacements de pacte (niveau 4) et sorts de Paladin (niveau 1) sur le 4/8', () => {
    const plafonds = plafondsSorts(totauxClasses(buildDe('paladin-hexblade').ordre))
    expect(plafonds.emplacementPacteNiveau).toBe(4)
    expect(plafonds.emplacementOrdinaireMax).toBe(1)
    expect(plafonds.sortConnuMax).toBe(4)
  })

  it('ne donne aucun emplacement au Moine / Roublard', () => {
    const plafonds = plafondsSorts(totauxClasses(buildDe('moine-main-ouverte').ordre))
    expect(plafonds.emplacementMax).toBe(0)
    expect(plafonds.sortConnuMax).toBe(0)
  })

  it('liste les Secrets magiques du Sidekick aux bons niveaux', () => {
    const { secrets } = buildDe('sidekick-savoir-vie')
    expect(secrets).toEqual([
      { niveau: 7, sorts: ['Contresort', 'Mot de guérison de groupe'] },
      { niveau: 12, sorts: ['Hâte', 'Invocation d’élémentaire'] },
    ])
    expect(secrets.flatMap((s) => s.sorts)).not.toContain('Aide')
  })
})

describe('caractéristiques', () => {
  it('ne compte jamais deux fois une valeur fixée par un élixir ou un objet', () => {
    const moine = buildDe('moine-main-ouverte').caracteristiques
    expect(caracteristiquesEffectives(moine, 12).FOR).toBe(8)
    expect(caracteristiquesEffectives(moine, 12, { fixees: ['elixir-geant-collines'] }).FOR).toBe(21)
    expect(caracteristiquesEffectives(moine, 12, { fixees: ['elixir-geant-nuages'] }).FOR).toBe(27)
    // Les deux élixirs ne s'additionnent pas : seule la plus haute valeur compte.
    expect(
      caracteristiquesEffectives(moine, 12, { fixees: ['elixir-geant-collines', 'elixir-geant-nuages'] }).FOR,
    ).toBe(27)
    // Greater Health fixe CON 23 : ce n'est pas 16 + 7.
    expect(caracteristiquesEffectives(moine, 12, { fixees: ['greater-health'] }).CON).toBe(23)
  })

  it('applique les bonus de dons seulement à partir de leur niveau', () => {
    const moine = buildDe('moine-main-ouverte').caracteristiques
    expect(caracteristiquesEffectives(moine, 3).CON).toBe(15)
    expect(caracteristiquesEffectives(moine, 4).CON).toBe(16)
    expect(caracteristiquesEffectives(moine, 10).SAG).toBe(16)
    expect(caracteristiquesEffectives(moine, 11).SAG).toBe(18)
  })

  it('mène le Paladin exporté à CHA 18, pas à 20', () => {
    const paladin = buildDe('paladin-hexblade')
    expect(caracteristiquesEffectives(paladin.export.caracteristiques, 12).CHA).toBe(18)
    // La respécialisation de la fiche est une autre route, étiquetée comme telle.
    const [respec] = paladin.caracteristiques.variantes
    expect(caracteristiquesEffectives(respec, 12).CHA).toBe(20)
  })

  it('distingue les deux routes de caractéristiques du Sorcier et le Cheveu', () => {
    const sorcier = buildDe('sorcier-feu').caracteristiques
    expect(caracteristiquesEffectives(sorcier, 12).CHA).toBe(20)
    const [cheveu] = sorcier.variantes
    const base = { ...cheveu, bonusPermanents: sorcier.bonusPermanents }
    expect(caracteristiquesEffectives(base, 4).CHA).toBe(19)
    expect(caracteristiquesEffectives(base, 4, { permanents: ['cheveu-ethel'] }).CHA).toBe(20)
    // L'export du Sorcier monte à 19 (17 + 2), pas à 20.
    expect(caracteristiquesEffectives(buildDe('sorcier-feu').export.caracteristiques, 12).CHA).toBe(19)
  })

  it('plafonne le bonus de DEX du Graceful Cloth', () => {
    const moine = buildDe('moine-main-ouverte').caracteristiques
    const [tissu] = moine.bonusEquipement
    expect(Math.min(moine.creation.DEX + tissu.valeur, tissu.plafond)).toBe(18)
    expect(tissu.plafond).toBe(20)
  })

  it('réserve le Cheveu au Sorcier et ne déclare aucun bonus permanent duplicable', () => {
    for (const build of BUILDS) {
      for (const bonus of build.caracteristiques.bonusPermanents) {
        expect(bonus.copiable, `${build.id}/${bonus.id}`).toBe(false)
      }
    }
    const porteurs = BUILDS.filter((b) => b.caracteristiques.bonusPermanents.some((p) => p.id === 'cheveu-ethel'))
    expect(porteurs.map((b) => b.id)).toEqual(['sorcier-feu'])
  })

  it('porte les six caractéristiques à la création', () => {
    for (const build of BUILDS) {
      expect(Object.keys(build.caracteristiques.creation)).toEqual(['FOR', 'DEX', 'CON', 'INT', 'SAG', 'CHA'])
      expect(build.stats).toEqual(build.caracteristiques.creation)
    }
  })
})

describe('exports de planner et divergences', () => {
  it('conserve les exports présents à l’identique, comme chaînes Base64', () => {
    const base64 = /^[A-Za-z0-9+/]+={0,2}$/
    expect(EXPORT_SORCIER_FEU).toMatch(base64)
    expect(EXPORT_PALADIN_HEXBLADE).toMatch(base64)
    expect(buildDe('sorcier-feu').export.planner).toBe(EXPORT_SORCIER_FEU)
    expect(buildDe('paladin-hexblade').export.planner).toBe(EXPORT_PALADIN_HEXBLADE)
    // Ce sont des exports de planner, pas des hash Git : ils décodent en JSON.
    for (const brut of [EXPORT_SORCIER_FEU, EXPORT_PALADIN_HEXBLADE]) {
      const json = JSON.parse(Buffer.from(brut, 'base64').toString('utf8'))
      expect(json.chardata.race).toBeTruthy()
      expect(json.leveldata).toHaveLength(12)
    }
  })

  it('décrit l’export Paladin tel que la chaîne le contient', () => {
    const json = JSON.parse(Buffer.from(EXPORT_PALADIN_HEXBLADE, 'base64').toString('utf8'))
    expect(json.chardata.race).toBe('Half-Orc')
    expect(json.leveldata.map((niveau) => niveau.class)).toEqual([
      ...Array(4).fill('Paladin'),
      ...Array(8).fill('Warlock'),
    ])
    expect(json.leveldata[0].subclass).toMatch(/Crown/)
  })

  it('décrit l’export Sorcier tel que la chaîne le contient', () => {
    const json = JSON.parse(Buffer.from(EXPORT_SORCIER_FEU, 'base64').toString('utf8'))
    expect(json.chardata.subrace).toBe('Lightfoot Halfling')
    expect(json.leveldata.every((niveau) => niveau.class === 'Sorcerer')).toBe(true)
  })

  it('n’invente aucun export pour les rôles dont le champ SHA est vide', () => {
    expect(buildDe('moine-main-ouverte').export).toBeNull()
    expect(buildDe('sidekick-savoir-vie').export).toBeNull()
  })

  it('aligne les dons exportés sur la route de l’export', () => {
    for (const id of ['sorcier-feu', 'paladin-hexblade']) {
      const { export: exporte } = buildDe(id)
      expect(exporte.dons.map((don) => don.niveau), id).toEqual(
        donsParNiveau(exporte.ordre).map((don) => don.niveau),
      )
    }
  })

  it('rend visibles les divergences export / recommandation du Sorcier et du Paladin', () => {
    const sorcier = buildDe('sorcier-feu')
    const paladin = buildDe('paladin-hexblade')
    expect(sorcier.divergences.length).toBeGreaterThan(0)
    expect(paladin.divergences.length).toBeGreaterThan(0)
    for (const divergence of [...sorcier.divergences, ...paladin.divergences]) {
      expect(divergence.recommandation.length, divergence.id).toBeGreaterThan(0)
      expect(divergence.export.length, divergence.id).toBeGreaterThan(0)
    }
    // Pas de build hybride silencieux : le don de niveau 4 du Sorcier diffère, et c'est dit.
    expect(sorcier.feats[0].nom).not.toBe(sorcier.export.dons[0].nom)
    expect(sorcier.divergences.map((d) => d.id)).toContain('sorcier-don-4')
    expect(paladin.divergences.map((d) => d.id)).toContain('paladin-cha')
  })

  it('garde l’ancienne référence Vengeance distincte de l’export Couronne', () => {
    const paladin = buildDe('paladin-hexblade')
    expect(paladin.export.serment).toBe('Couronne')
    expect(paladin.export.race).toBe('Demi-orque')
    expect(paladin.ancienneReference.serment).toBe('Vengeance')
    expect(paladin.ancienneReference.race).toBe('Duergar')
  })

  it('signale ce que les fiches laissent ouvert', () => {
    for (const build of BUILDS) {
      expect(build.aConfirmer.length, build.id).toBeGreaterThan(0)
      for (const entree of build.aConfirmer) {
        expect(entree.id.startsWith(build.id.split('-')[0]), entree.id).toBe(true)
        expect(entree.texte.length).toBeGreaterThan(0)
      }
    }
  })
})

describe('items', () => {
  it('référencent un acte, un personnage et une priorité valides', () => {
    for (const item of ITEMS) {
      expect(NUMEROS_ACTES).toContain(item.acte)
      expect(buildDe(item.personnage), `build inconnu pour ${item.id}`).not.toBeNull()
      expect(PRIORITES).toContain(item.priorite)
      expect(item.slot.length).toBeGreaterThan(0)
    }
  })

  it('ne pointent que vers des lieux existants', () => {
    for (const item of ITEMS) {
      if (item.lieu === null) continue
      expect(lieuDe(item.lieu), `lieu inconnu pour ${item.id}`).not.toBeNull()
    }
  })

  it('n’exposent que des liens externes en https, jamais d’asset local', () => {
    for (const item of ITEMS) {
      if (!item.wiki) continue
      expect(item.wiki.startsWith('https://')).toBe(true)
    }
  })

  it('déclarent explicitement les sources à confirmer', () => {
    // Un item sans lieu doit l'assumer : l'UI affiche « À localiser ».
    for (const item of ITEMS.filter((entree) => entree.lieu === null)) {
      expect(item.aConfirmer, `${item.id} sans lieu doit porter aConfirmer`).toBe(true)
    }
  })

  it('couvre chaque personnage catalogué et chaque acte', () => {
    // Le catalogue d'items est encore celui de l'ancienne composition : il est
    // refait pour les rôles actifs dans le ticket loadouts (2/4).
    for (const build of BUILDS_ANCIENS) {
      expect(ITEMS.some((item) => item.personnage === build.id)).toBe(true)
    }
    for (const numero of NUMEROS_ACTES) {
      expect(ITEMS.some((item) => item.acte === numero)).toBe(true)
    }
  })

  it('portent tous une source et un lien wiki', () => {
    // Le catalogue est encodé depuis les fiches bg3.wiki : une entrée sans
    // source ni lien serait de la mémoire, pas une donnée vérifiée.
    for (const item of ITEMS) {
      expect(item.source?.length, `source manquante pour ${item.id}`).toBeGreaterThan(0)
      expect(item.wiki, `wiki manquant pour ${item.id}`).toMatch(/^https:\/\/bg3\.wiki\/wiki\/\S+$/)
    }
  })

  it('couvrent tous les slots portables de chaque personnage', () => {
    // Le loadout n'est utile que s'il est complet : un slot oublié, c'est un
    // emplacement joué vide pendant toute la run.
    const REQUIS = ['Casque', 'Cape', 'Armure', 'Gants', 'Bottes', 'Amulette', 'Anneau']
    for (const build of BUILDS_ANCIENS) {
      const slots = new Set(
        ITEMS.filter((item) => item.personnage === build.id).map((item) => item.slot),
      )
      for (const slot of REQUIS) {
        expect(slots, `${build.id} n’a rien au slot ${slot}`).toContain(slot)
      }
      expect([...slots].some((slot) => slot.startsWith('Arme')), `${build.id} n’a pas d’arme`).toBe(
        true,
      )
    }
  })

  it('résout un identifiant connu', () => {
    expect(itemDe('markoheshkir')?.nom).toBe('Markoheshkir')
    expect(itemDe('inconnu')).toBeNull()
  })
})

describe('lieux', () => {
  // MapGenie ne publie que ces trois cartes pour BG3 : toute autre URL de carte
  // est un lien mort (l'ancienne `/maps/faerun` renvoyait un 404).
  const CARTES = new Set([
    'https://mapgenie.io/baldurs-gate-3/maps/wilderness',
    'https://mapgenie.io/baldurs-gate-3/maps/shadow-cursed-lands',
    'https://mapgenie.io/baldurs-gate-3/maps/baldurs-gate',
  ])

  it('portent un acte valide et des liens externes bien formés', () => {
    for (const lieu of LIEUX) {
      expect(NUMEROS_ACTES).toContain(lieu.acte)
      expect(lieu.wiki, `wiki manquant pour ${lieu.id}`).toMatch(/^https:\/\/bg3\.wiki\/wiki\/\S+$/)
      if (lieu.carte !== null) expect(CARTES, `carte inconnue pour ${lieu.id}`).toContain(lieu.carte)
    }
  })

  it('rattachent chaque item à un lieu du bon acte, ou à un lieu antérieur', () => {
    // Un item d'Acte II ne peut pas être rangé dans une zone d'Acte III : on
    // ne peut plus y revenir. L'inverse est permis (un marchand d'Acte I qui
    // reste accessible), mais reste rare : le test cadre le sens du temps.
    for (const item of ITEMS) {
      const lieu = lieuDe(item.lieu)
      if (lieu === null) continue
      expect(lieu.acte, `${item.id} est rangé dans un lieu d’un acte postérieur`).toBeLessThanOrEqual(
        item.acte,
      )
    }
  })
})

describe('actes et checklists', () => {
  it('donnent une checklist par acte', () => {
    expect(CHECKLISTS.map((liste) => liste.acte)).toEqual(NUMEROS_ACTES)
    for (const liste of CHECKLISTS) {
      expect(liste.entrees.length).toBeGreaterThan(0)
    }
  })

  it('libellent proprement un acte inconnu', () => {
    expect(libelleActe(1)).toBe('Acte I')
    expect(libelleActe(9)).toBe('Acte à confirmer')
    expect(acteDe(9)).toBeNull()
  })
})

describe('thèmes', () => {
  // Le script anti-flash de index.html duplique la liste des thèmes : s'ils
  // divergent, un thème choisi retomberait silencieusement sur le défaut.
  const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')

  it('sont alignés avec le script anti-flash de index.html', () => {
    const liste = html.match(/var themes = \[(.*?)\]/)?.[1]
    expect(liste).toBeDefined()
    const idsHtml = liste.split(',').map((entree) => entree.trim().replace(/['"]/g, ''))
    expect(idsHtml).toEqual(THEMES.map((theme) => theme.id))
  })

  it('partagent la même clé de stockage que le script anti-flash', () => {
    expect(html).toContain(`localStorage.getItem('${CLE_THEME}')`)
  })
})
