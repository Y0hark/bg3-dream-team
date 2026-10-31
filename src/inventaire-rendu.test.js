import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import App from './App.jsx'
import IconeObjet from './components/IconeObjet.jsx'
import { BUILDS } from './data/builds.js'
import { objetDe } from './data/objets.js'

globalThis.document = { documentElement: { dataset: {} } }
globalThis.window = { matchMedia: () => ({ matches: false }) }
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} }

// React sépare les nœuds texte adjacents par des commentaires : on les retire.
const rendre = (route) =>
  renderToString(createElement(MemoryRouter, { initialEntries: [route] }, createElement(App))).replaceAll('<!-- -->', '')

describe('inventaire visuel — rendu', () => {
  it.each(BUILDS.flatMap((build) => [1, 2, 3].map((acte) => [build.id, acte])))(
    '%s acte %i : emplacements, boutons nommés, pas de dialogue ouvert',
    (role, acte) => {
      const html = rendre(`/builds/${role}?acte=${acte}`)
      expect(html).toContain(`data-inventaire="${role}"`)
      expect(html).toContain('Prévu pour l’acte')
      expect(html).toContain('Équipé dans la run')
      expect(html).toMatch(/aria-label="Options pour Casque"/)
      expect(html).toMatch(/aria-haspopup="dialog"/)
      expect(html).not.toContain('role="dialog"')
    },
  )

  it('le sélecteur d’acte expose l’acte courant', () => {
    const html = rendre('/builds/sorcier-feu?acte=3')
    expect(html).toMatch(/aria-pressed="true"[^>]*>Acte III/)
    expect(html).toContain('Inventaire · Acte III')
  })

  it('un acte invalide retombe sur l’acte I', () => {
    expect(rendre('/builds/sorcier-feu?acte=9')).toContain('Inventaire · Acte I')
  })

  it('le premier écran se limite à l’essentiel et garde l’information longue derrière un dépliant fermé', () => {
    const html = rendre('/builds/paladin-hexblade')
    expect(html).toContain('L’essentiel')
    expect(html).toMatch(/<details id="depliant-leveling"(?![^>]*\sopen)/)
    expect(html).toMatch(/<details id="depliant-export"(?![^>]*\sopen)/)
    // L'information reste présente dans la page.
    expect(html).toContain('Leveling 1 → 12')
    expect(html).toContain('Export du joueur et recommandation')
  })

  it('le point à confirmer de l’ordre Paladin reste signalé sur la vue progression', () => {
    expect(rendre('/builds/paladin-hexblade')).toContain('point')
  })

  it('l’icône sans image vérifiée retombe sur le glyphe du type, à dimensions fixes', () => {
    const objet = objetDe('fistbreaker-helm')
    const html = renderToString(createElement(IconeObjet, { objet, taille: 40 }))
    expect(html).not.toContain('<img')
    expect(html).toContain('width:40px')
    expect(html).toContain('height:40px')
    expect(html).toContain('aria-hidden="true"')
  })

  it('le loadout garde le tableau de suivi derrière un dépliant nommé', () => {
    const html = rendre('/loadout?role=moine-main-ouverte&acte=2')
    expect(html).toContain('Suivi détaillé : obtention, copies et équipement')
    expect(html).toContain('data-inventaire="moine-main-ouverte"')
  })
})

describe('vue d’équipe — rendu', () => {
  it.each([1, 2, 3])('acte %i : les quatre rôles, bascule mobile et besoins', (acte) => {
    const html = rendre(`/equipe?acte=${acte}`)
    for (const build of BUILDS) expect(html).toContain(`data-role="${build.id}"`)
    expect(html).toContain('data-besoins')
    expect(html).toContain('Ce qu’il reste à préparer')
    expect(html).toContain('PLANS')
    expect(html).toContain('role="group" aria-label="Rôle affiché"')
    expect(html).toContain('aria-live="polite"')
  })

  it('un seul rôle est visible sur mobile, les autres ne le sont que sur bureau', () => {
    const html = rendre('/equipe?role=moine-main-ouverte')
    expect(html).toMatch(/data-role="moine-main-ouverte"[^>]*class="plaque min-w-0 p-4 "/)
    expect(html).toMatch(/data-role="sorcier-feu"[^>]*class="plaque min-w-0 p-4 hidden lg:block"/)
  })

  it('chaque emplacement renvoie vers l’inventaire du rôle à l’acte', () => {
    expect(rendre('/equipe?acte=2')).toContain('href="/builds/sorcier-feu?acte=2#inventaire-sorcier-feu"')
  })

  it('sans original, propose de le récupérer et n’affiche aucun équipé', () => {
    const html = rendre('/equipe?acte=2')
    expect(html).toContain('Originaux à récupérer')
    expect(html).not.toContain('Libérer l’exemplaire')
  })

  it('la barre de navigation expose l’Équipe', () => {
    expect(rendre('/')).toContain('href="/equipe"')
  })
})
