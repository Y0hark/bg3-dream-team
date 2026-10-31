import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import App from './App.jsx'
import { CLE_AFFICHAGE, CLE_PROGRESSION } from './lib/stockage.js'

const memoire = {}
globalThis.document = { documentElement: { dataset: {} } }
globalThis.window = {
  matchMedia: () => ({ matches: false }),
  localStorage: {
    getItem: (cle) => memoire[cle] ?? null,
    setItem: (cle, valeur) => {
      memoire[cle] = valeur
    },
    removeItem: (cle) => {
      delete memoire[cle]
    },
  },
}

const rendre = (route, affichage = null) => {
  for (const cle of Object.keys(memoire)) delete memoire[cle]
  if (affichage) memoire[CLE_AFFICHAGE] = JSON.stringify(affichage)
  return renderToString(createElement(MemoryRouter, { initialEntries: [route] }, createElement(App))).replaceAll('<!-- -->', '')
}

describe('modes Préparer / En partie — rendu', () => {
  it('première visite : Préparer, tableau de bord complet', () => {
    const html = rendre('/')
    expect(html).toMatch(/aria-pressed="true"[^>]*>Préparer/)
    expect(html).toMatch(/aria-pressed="false"[^>]*>En partie/)
    expect(html).toContain('Progression par acte')
    expect(html).not.toContain('data-en-partie')
  })

  it('En partie sans zone : propose de la choisir, donne les plans d’acte, n’invente aucune action', () => {
    const html = rendre('/', { mode: 'en-partie' })
    expect(html).toContain('data-en-partie')
    expect(html).toContain('data-sans-zone')
    expect(html).toContain('Aucun acte ni zone déclarés')
    expect(html).toContain('href="/equipe?acte=2"')
    expect(html).not.toContain('data-prochaines-actions')
    expect(html).not.toContain('Progression par acte')
    expect(html).toContain('ne lit pas la sauvegarde du jeu')
  })

  it('En partie avec une zone : récapitulatif de départ, actions, accès direct à l’inventaire de chaque rôle', () => {
    const html = rendre('/', { mode: 'en-partie', zone: 'bosquet-emeraude' })
    expect(html).toContain('Avant de quitter cette zone')
    expect(html).toContain('data-prochaines-actions')
    expect(html).toContain('Acte I')
    for (const role of ['sorcier-feu', 'paladin-hexblade']) {
      expect(html).toContain(`href="/builds/${role}?acte=1#inventaire-${role}"`)
    }
    expect((html.match(/data-role-resume=/g) ?? []).length).toBe(4)
    // Pas d'export ni de justification longue en tête.
    expect(html).not.toContain('Export du planner')
    expect(html).not.toMatch(/>\s*\d+\s?%\s*</)
  })

  it('un affichage corrompu retombe sur Préparer sans erreur', () => {
    expect(rendre('/', { mode: 'x', zone: 42 })).toContain('Progression par acte')
  })

  it('Préparer : le résumé d’un rôle ouvre l’inventaire en un lien', () => {
    const html = rendre('/')
    expect(html).toContain('href="/builds/moine-main-ouverte#inventaire-moine-main-ouverte"')
  })

  it('basculer de mode ne lit ni n’écrit la progression', () => {
    rendre('/', { mode: 'en-partie', zone: 'bosquet-emeraude' })
    expect(memoire[CLE_PROGRESSION]).toBeUndefined()
  })

  it('fiche de build : En partie place l’inventaire avant l’essentiel, Préparer l’inverse', () => {
    const ordre = (html) => [html.indexOf('data-inventaire='), html.indexOf('data-resume')]
    const [invPartie, essPartie] = ordre(rendre('/builds/paladin-hexblade', { mode: 'en-partie' }))
    const [invPrep, essPrep] = ordre(rendre('/builds/paladin-hexblade'))
    expect(invPartie).toBeLessThan(essPartie)
    expect(essPrep).toBeLessThan(invPrep)
  })

  it('En partie reprend l’acte déclaré sur la fiche, l’URL gardant la priorité', () => {
    expect(rendre('/builds/paladin-hexblade', { mode: 'en-partie', acte: 3 })).toContain('Inventaire · Acte III')
    expect(rendre('/builds/paladin-hexblade?acte=2', { mode: 'en-partie', acte: 3 })).toContain('Inventaire · Acte II')
    expect(rendre('/builds/paladin-hexblade', { mode: 'preparer', acte: 3 })).toContain('Inventaire · Acte I')
  })
})
