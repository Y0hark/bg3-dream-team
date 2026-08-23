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

  it('résout un identifiant connu, et rien d’autre', () => {
    expect(buildDe('sam-freeze-thunder')?.personnage).toBe('Sam')
    expect(buildDe('inconnu')).toBeNull()
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

  it('résout un identifiant connu', () => {
    expect(itemDe('markoheshkir')?.nom).toBe('Markoheshkir')
    expect(itemDe('inconnu')).toBeNull()
  })
})

describe('lieux', () => {
  it('portent un acte valide et des liens externes bien formés', () => {
    for (const lieu of LIEUX) {
      expect(NUMEROS_ACTES).toContain(lieu.acte)
      for (const lien of [lieu.wiki, lieu.carte]) {
        if (lien === null) continue
        expect(lien.startsWith('https://')).toBe(true)
      }
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
