import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ACTES, acteDe, libelleActe } from './actes.js'
import { BUILDS, buildDe } from './builds.js'
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
    expect(doublons(BUILDS.map((build) => build.id))).toEqual([])
    expect(doublons(LIEUX.map((lieu) => lieu.id))).toEqual([])
    expect(doublons(CHECKLISTS.flatMap((liste) => liste.entrees.map((entree) => entree.id)))).toEqual([])
  })
})

describe('builds', () => {
  it('couvre les 4 personnages de la run', () => {
    expect(BUILDS).toHaveLength(4)
    expect(BUILDS.map((build) => build.personnage)).toEqual([
      'Sam',
      'Baptiste',
      'Lilian',
      'Sidekick',
    ])
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

  it('résout un identifiant connu, et rien d’autre', () => {
    expect(buildDe('sam-freeze-thunder')?.personnage).toBe('Sam')
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

describe('items', () => {
  it('référencent un acte, un personnage et une priorité valides', () => {
    for (const item of ITEMS) {
      expect(NUMEROS_ACTES).toContain(item.acte)
      expect(BUILDS.map((build) => build.id)).toContain(item.personnage)
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

  it('couvre chaque personnage et chaque acte', () => {
    for (const build of BUILDS) {
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
    for (const build of BUILDS) {
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
