import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import App from './App.jsx'

// L'app n'est jamais rendue côté serveur : on stube le strict minimum
// navigateur pour pouvoir la monter une fois et détecter les erreurs.
globalThis.document = { documentElement: { dataset: {} } }
globalThis.window = { matchMedia: () => ({ matches: false }) }
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

const ROUTES = ['/', '/builds', '/builds/sam-freeze-thunder', '/loadout', '/items', '/items?acte=2&statut=rate', '/lieux', '/checklist', '/inconnue']

describe('rendu des routes', () => {
  it.each(ROUTES)('rend %s sans erreur', (route) => {
    const html = renderToString(
      createElement(MemoryRouter, { initialEntries: [route] }, createElement(App)),
    )
    expect(html.length).toBeGreaterThan(200)
  })
})
