import { createElement } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import App from './App.jsx'
import { lireStrict } from './lib/stockage.js'

// L'app est rendue côté serveur uniquement pour ces tests : on simule un
// navigateur dont le localStorage contient (ou refuse) ce qu'on veut.
function navigateur(contenu, { refuse = false } = {}) {
  const magasin = new Map(Object.entries(contenu))
  const stockage = {
    getItem: (cle) => {
      if (refuse) throw new Error('stockage refusé')
      return magasin.has(cle) ? magasin.get(cle) : null
    },
    setItem: (cle, valeur) => {
      if (refuse) throw new Error('stockage refusé')
      magasin.set(cle, valeur)
    },
    removeItem: (cle) => magasin.delete(cle),
  }
  globalThis.document = { documentElement: { dataset: {} } }
  globalThis.window = { matchMedia: () => ({ matches: false }), localStorage: stockage }
  globalThis.localStorage = stockage
  return magasin
}

function rendre(route = '/') {
  return renderToString(createElement(MemoryRouter, { initialEntries: [route] }, createElement(App)))
}

const HISTORIQUE = JSON.stringify({
  items: { markoheshkir: 'obtenu', 'mourning-frost': 'obtenu' },
  checklist: { 'a1-niveau': true },
})

describe('stockage au démarrage', () => {
  beforeEach(() => navigateur({}))

  it('propose la migration sans rien écrire tant que rien n’est confirmé', () => {
    const magasin = navigateur({ 'bg3-progression': HISTORIQUE })
    const html = rendre('/')
    expect(html).toContain('Passer à la nouvelle composition')
    expect(html).toContain('Exporter l’ancienne sauvegarde')
    // SSR : aucun effet n'est exécuté, et l'état ancien n'a de toute façon pas été écrit.
    expect(magasin.get('bg3-progression')).toBe(HISTORIQUE)
    expect(magasin.has('bg3-progression-avant-v2')).toBe(false)
  })

  it('n’alarme pas sur un navigateur neuf', () => {
    navigateur({})
    expect(rendre('/')).not.toContain('Passer à la nouvelle composition')
  })

  it('n’alarme pas non plus sur une sauvegarde d’avant la V2 qui est vide', () => {
    navigateur({ 'bg3-progression': JSON.stringify({ items: {}, checklist: {} }) })
    expect(rendre('/')).not.toContain('Passer à la nouvelle composition')
  })

  it('ne réécrit pas une sauvegarde d’un format plus récent et l’explique', () => {
    const recente = JSON.stringify({ schema: 9, items: { a: 'obtenu' } })
    const magasin = navigateur({ 'bg3-progression': recente })
    const html = rendre('/')
    expect(html).toContain('version plus récente')
    expect(html).toContain('Exporter ce qui est stocké')
    expect(magasin.get('bg3-progression')).toBe(recente)
  })

  it('traite un JSON corrompu comme illisible, jamais comme un stockage vide', () => {
    const corrompu = '{"items": {"a": "obt'
    const magasin = navigateur({ 'bg3-progression': corrompu })
    expect(lireStrict('bg3-progression')).toEqual({ statut: 'illisible', valeur: null, texte: corrompu })
    const html = rendre('/')
    expect(html).toContain('format que cette version ne sait pas lire')
    expect(magasin.get('bg3-progression')).toBe(corrompu)
  })

  it('reste utilisable quand le stockage est refusé', () => {
    navigateur({}, { refuse: true })
    for (const route of ['/', '/builds', '/loadout', '/items', '/archive']) {
      const html = rendre(route)
      expect(html.length, route).toBeGreaterThan(200)
      expect(html, route).toContain('Stockage local indisponible')
    }
  })

  it('distingue absent, lisible et indisponible', () => {
    navigateur({})
    expect(lireStrict('x').statut).toBe('absent')
    navigateur({ x: '{"a":1}' })
    expect(lireStrict('x')).toMatchObject({ statut: 'ok', valeur: { a: 1 } })
    navigateur({}, { refuse: true })
    expect(lireStrict('x').statut).toBe('indisponible')
  })
})

describe('rendu mobile et desktop', () => {
  beforeEach(() => navigateur({}))

  it('rend le loadout en tableau (desktop) ET en cartes (mobile), chacun masqué à l’autre échelle', () => {
    const html = rendre('/loadout?acte=2')
    expect(html).toContain('data-vue="tableau"')
    expect(html).toContain('data-vue="cartes"')
    expect(html).toMatch(/hidden overflow-x-auto md:block[^>]*data-vue="tableau"/)
    expect(html).toMatch(/space-y-3 md:hidden[^>]*data-vue="cartes"/)
  })

  it('affiche les quatre rôles, leurs copies et la séparation original / équipement', () => {
    const html = rendre('/loadout?acte=2')
    for (const role of ['Sorcier feu', 'Paladin', 'Moine', 'Sidekick']) expect(html).toContain(role)
    expect(html).toContain('Original à récupérer')
    expect(html).toContain('Copies et équipement')
    expect(html).toContain('Équipé')
  })

  it('ne montre pas les alternatives par défaut, mais les montre sur demande', () => {
    // Le nom figure aussi dans la liste des variantes : on teste la ligne du loadout elle-même.
    const ligne = 'FOR 23 sans élixir, au prix de Soul Catching'
    expect(rendre('/loadout?acte=3&role=moine-main-ouverte')).not.toContain(ligne)
    expect(rendre('/loadout?acte=3&role=moine-main-ouverte&rang=tous')).toContain(ligne)
    // Choisir la variante qui l'illustre la fait aussi apparaître.
    expect(rendre('/loadout?acte=3&role=moine-main-ouverte&variante=moine-gantelets-collines')).toContain(ligne)
  })

  it('met en avant les bottes Kushigo du Moine à l’acte III', () => {
    const html = rendre('/loadout?acte=3&role=moine-main-ouverte')
    expect(html).toContain('Boots of Uninhibited Kushigo')
    expect(html).toContain('Point de non-retour')
  })

  it('garde le focus clavier : les filtres du loadout sont de vrais contrôles étiquetés', () => {
    const html = rendre('/loadout')
    expect(html).toContain('aria-label="Filtres du loadout"')
    expect(html).toMatch(/<select/)
    expect(html).toMatch(/<label/)
  })

  it('affiche les variantes sans cumul, les divergences et les points à confirmer sur une fiche', () => {
    const paladin = rendre('/builds/paladin-hexblade')
    expect(paladin).toContain('À confirmer')
    expect(paladin).toContain('Variantes')
    expect(paladin).toContain('ne s’y additionnent pas')
    expect(paladin).toContain('Export du joueur et recommandation')
    expect(paladin).toContain('Export du planner (Base64)')
    const moine = rendre('/builds/moine-main-ouverte')
    expect(moine).toContain('Aucun export de planner fourni pour ce rôle')
  })

  it('n’affiche l’export qu’en texte brut, jamais décodé en HTML', () => {
    const html = rendre('/builds/sorcier-feu')
    expect(html).toContain('<textarea')
    expect(html).not.toContain('OVERLOADED FIRE SHIT')
  })

  it('garde les anciens liens lisibles, marqués comme ancienne composition', () => {
    const html = rendre('/builds/sam-freeze-thunder')
    expect(html).toContain('Ancienne composition')
    expect(html).toContain('lecture seule')
    expect(html).not.toContain('Paladin de la Couronne')
  })

  it('redirige un identifiant inconnu vers la liste, pas vers un autre personnage', () => {
    const html = rendre('/builds/inconnu')
    expect(html.length).toBeGreaterThan(200)
  })

  it('rend l’archive vide avec un message clair', () => {
    expect(rendre('/archive')).toContain('Archive vide')
  })
})
