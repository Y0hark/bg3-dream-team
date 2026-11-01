import { createElement } from 'react'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import IconeObjet from './components/IconeObjet.jsx'
import ICONES_WIKI from './data/icones-wiki.json' with { type: 'json' }
import { ICONES } from './data/objets-meta.js'
import { OBJETS, objetDe } from './data/objets.js'
import { couvertureIcones, iconeDe, iconeValide } from './lib/icones.js'
import { nomsObjet } from './lib/localisation.js'

const DOSSIER = new URL('../public/icones/', import.meta.url)
const PRIORITAIRES = [
  'disintegrating-night-walkers',
  'boots-of-speed',
  'boots-stormy-clamour',
  'boots-uninhibited-kushigo',
  'markoheshkir',
  'hat-of-fire-acuity',
]
const rendre = (props) => renderToString(createElement(IconeObjet, props)).replaceAll('<!-- -->', '')

describe('icônes authentiques — couverture et provenance', () => {
  it('chaque objet du catalogue est couvert ou listé comme exception', () => {
    const { total, avecIcone, sansIcone } = couvertureIcones()
    expect(total).toBe(OBJETS.length)
    expect(avecIcone + sansIcone.length).toBe(total)
    const bloques = ICONES_WIKI.filter((ligne) => ligne.statut !== 'ok')
    expect(sansIcone.sort()).toEqual(bloques.map((ligne) => ligne.id).sort())
    for (const ligne of bloques) expect(ligne.raison).not.toBe('')
  })

  it('le tableau de provenance couvre exactement les IDs du catalogue', () => {
    expect(ICONES_WIKI.map((ligne) => ligne.id).sort()).toEqual(OBJETS.map((objet) => objet.id).sort())
  })

  it('chaque icône a un fichier local au sha1 attendu, une page objet et une page fichier du wiki', () => {
    for (const ligne of ICONES_WIKI.filter((l) => l.statut === 'ok')) {
      const chemin = new URL(ligne.fichier, DOSSIER)
      expect(existsSync(chemin), ligne.id).toBe(true)
      expect(createHash('sha1').update(readFileSync(chemin)).digest('hex'), ligne.id).toBe(ligne.sha1)
      expect(ligne.pageObjet, ligne.id).toBe(objetDe(ligne.id).wiki)
      expect(ligne.pageFichier, ligne.id).toMatch(/^https:\/\/bg3\.wiki\/wiki\/File:/)
    }
  })

  it('aucun fichier orphelin dans public/icones', () => {
    const attendus = new Set(ICONES_WIKI.filter((l) => l.statut === 'ok').map((l) => l.fichier))
    expect(readdirSync(DOSSIER).filter((nom) => !attendus.has(nom))).toEqual([])
  })

  it('les droits sont déclarés sans licence libre inventée', () => {
    for (const icone of Object.values(ICONES)) {
      expect(iconeValide(icone)).toBe(true)
      expect(icone.licence).toMatch(/Larian/)
      expect(icone.licence).not.toMatch(/CC BY/i)
    }
  })

  it('les visuels prioritaires du ticket sont présents', () => {
    for (const id of PRIORITAIRES) expect(iconeDe(objetDe(id)).src, id).not.toBeNull()
    expect(ICONES['boots-stormy-clamour'].source).toBe('https://bg3.wiki/wiki/File:Boots_of_Stormy_Clamour_Icon.png')
  })

  it('des objets distincts peuvent légitimement partager la même image du jeu', () => {
    const parSha = Map.groupBy(ICONES_WIKI.filter((l) => l.statut === 'ok'), (l) => l.sha1)
    const partages = [...parSha.values()].filter((groupe) => groupe.length > 1)
    expect(partages.length).toBeGreaterThan(0)
    // Un fichier par ID, même quand l'image source est partagée : les IDs restent indépendants.
    for (const groupe of partages) expect(new Set(groupe.map((l) => l.fichier)).size).toBe(groupe.length)
  })
})

describe('icônes authentiques — rendu', () => {
  it('sert l’image locale à taille fixe, sans URL wiki ni téléchargement au runtime', () => {
    const html = rendre({ objet: objetDe('boots-of-speed'), taille: 40 })
    expect(html).toContain('<img')
    expect(html).toContain('icones/boots-of-speed.png')
    expect(html).toContain('width="40"')
    expect(html).toContain('height="40"')
    expect(html).not.toContain('bg3.wiki')
  })

  it('aucun module applicatif ne référence le wiki pour charger une image', () => {
    const sources = ['components/IconeObjet.jsx', 'lib/icones.js'].map((f) => readFileSync(new URL('./' + f, import.meta.url), 'utf8'))
    for (const code of sources) expect(code).not.toMatch(/https?:\/\/bg3\.wiki/)
  })

  it('un asset absent retombe sur l’icône du type, à la même taille', () => {
    const html = rendre({ objet: { slot: 'Anneau', icone: null }, taille: 56 })
    expect(html).not.toContain('<img')
    expect(html).toContain('💍')
    expect(html).toContain('width:56px')
    expect(html).toContain('height:56px')
  })

  it('un emplacement vide reste un repli, jamais une image', () => {
    expect(rendre({ objet: { slot: 'Casque' } })).not.toContain('<img')
  })

  it('le nom FR et le nom EN restent indépendants de l’image', () => {
    const objet = objetDe('markoheshkir')
    expect(nomsObjet(objet).principal).toBe('Markoheshkir')
    // Avec un nom FR vérifié, l'EN reste affiché en secondaire ; l'image ne change pas.
    const avecFr = { ...objet, nomFr: 'Markoheshkir (FR)' }
    expect(nomsObjet(avecFr)).toEqual({ principal: 'Markoheshkir (FR)', secondaire: 'Markoheshkir' })
    expect(iconeDe(avecFr).src).toBe(iconeDe(objet).src)
    expect(iconeDe(objet).src).toContain('markoheshkir.png')
  })
})
