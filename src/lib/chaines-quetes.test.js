import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { AlerteAcquisition } from '../components/AlertesAcquisition.jsx'
import { FournisseurProgression } from '../hooks/useProgression.jsx'
import { CONDITIONS, conditionDe } from '../data/acquisition.js'
import { evaluerCondition, recapZone } from './acquisition.js'
import { normaliserAcquisition } from './acquisition-etat.js'
import { etatInitial, normaliserEtat } from './progression.js'

// Follow-up 3/4 : chaînes de quêtes vérifiées et alertes en amont. Chaque scénario
// reprend une preuve de docs/audit-acquisitions.json ; aucun ne touche le jeu.
const audit = JSON.parse(readFileSync(new URL('../../docs/audit-acquisitions.json', import.meta.url), 'utf8'))

const avec = (evenements = {}, extra = {}) => ({
  ...etatInitial(),
  ...extra,
  acquisition: { ...etatInitial().acquisition, evenements },
})
const declares = (...ids) => Object.fromEntries(ids.map((id) => [id, true]))
const evaluer = (id, etat, objets) => evaluerCondition(conditionDe(id), etat, objets)

describe('preuves — toute condition vérifiée renvoie à l’audit', () => {
  it('cite des pages et révisions présentes dans docs/audit-acquisitions.json', () => {
    const revisions = new Map(audit.pages.map((page) => [page.page, page.rev]))
    for (const condition of CONDITIONS.filter((c) => c.confiance === 'verifie')) {
      expect(condition.preuves?.length, condition.id).toBeGreaterThan(0)
      for (const preuve of condition.preuves) {
        expect(revisions.get(preuve.page), `${condition.id} → ${preuve.page}`).toBe(preuve.rev)
      }
    }
  })
})

describe('Dammon — jalons passés et état présent', () => {
  const survie = 'dammon-survie'

  it('rien déclaré : à vérifier, jamais un feu vert', () => {
    expect(evaluer(survie, avec()).resultat).toBe('inconnu')
  })

  it('Bosquet sauvé mais refuge perdu : le jalon d’Acte I ne protège pas l’Acte II', () => {
    const etat = avec(declares('refugies-sauves', 'isobel-perdue'))
    expect(evaluer(survie, etat)).toMatchObject({ resultat: 'non-satisfait', raison: 'ferme' })
  })

  it('Marcus repoussé puis Chant de la nuit tuée : le jalon ne couvre pas la perte ultérieure', () => {
    const jalonSeul = avec(declares('isobel-sauvee-marcus'))
    expect(evaluer(survie, jalonSeul).resultat).toBe('inconnu')
    const apres = avec(declares('isobel-sauvee-marcus', 'chantenuit-tuee'))
    expect(evaluer(survie, apres)).toMatchObject({ resultat: 'non-satisfait', fermeturesDeclarees: ['chantenuit-tuee'] })
  })

  it('Dammon mort avant les stocks d’Acte III : ces achats ne sont plus atteignables', () => {
    const etat = avec(declares('dammon-mort'))
    expect(evaluer(survie, etat, ['armour-of-persistence', 'boots-of-persistence', 'legacy-of-the-masters']).resultat).toBe(
      'non-satisfait',
    )
  })

  it('PNJ mort après l’objet déjà obtenu : l’original prime, sans toucher aux copies', () => {
    const etat = avec(declares('dammon-mort'), { items: { 'armour-of-persistence': 'obtenu' } })
    expect(evaluer(survie, etat, ['armour-of-persistence'])).toMatchObject({ resultat: 'satisfait', raison: 'original' })
    expect(evaluer(survie, etat, ['boots-of-persistence']).resultat).toBe('non-satisfait')
  })

  it('les jalons montrent la progression sans lever l’alerte', () => {
    const evaluation = evaluer(survie, avec(declares('refugies-sauves')))
    expect(evaluation.resultat).toBe('inconnu')
    expect(evaluation.etapes.map((e) => e.faite)).toEqual([true, false])
    expect(evaluation.prochaineEtape.id).toBe('isobel-sauvee-marcus')
  })

  it('l’échéance de colonie ne vise que le stock d’Acte II ; la fabrication a la sienne (Shadowfell)', () => {
    expect(conditionDe('dammon-achats-acte2').objets).not.toContain('flawed-helldusk-gloves')
    expect(conditionDe('dammon-achats-acte2').objets).not.toContain('armour-of-persistence')
    expect(conditionDe('dammon-forge-helldusk').evenement).toBe('shadowfell-entre')
    expect(evaluer('dammon-forge-helldusk', avec(declares('shadowfell-entre'))).resultat).toBe('non-satisfait')
    expect(evaluer('dammon-achats-acte2', avec(declares('colonie-illithid'))).resultat).toBe('inconnu')
  })

  it('une seule alerte partagée au Bosquet, avec objets, rôles et geste concret', () => {
    const recap = recapZone('bosquet-emeraude', avec())
    const alertes = recap.ouvertes.filter(({ condition }) => condition.id === survie)
    expect(alertes).toHaveLength(1)
    const [alerte] = alertes
    expect(alerte.objets).toEqual(expect.arrayContaining(['armour-of-persistence', 'flawed-helldusk-gloves']))
    expect(alerte.roles.length).toBeGreaterThan(0)
    expect(alerte.action).toMatch(/réfugiés/)
    expect(recap.ouvertes.filter(({ condition }) => condition.objets.includes('armour-of-persistence'))).toHaveLength(1)
  })

  it('la même alerte précède la perte à l’Ultime Lueur, avec son geste propre', () => {
    const recap = recapZone('auberge-derniere-lumiere', avec())
    const alerte = recap.ouvertes.find(({ condition }) => condition.id === survie)
    expect(alerte.action).toMatch(/Isobel/)
  })
})

describe('Omeluum — rencontre, quête, commerce, achat', () => {
  const id = 'omeluum-commerce'

  it('rencontré sans quête : jamais une acquisition', () => {
    const evaluation = evaluer(id, avec(declares('omeluum-rencontre')))
    expect(evaluation.resultat).toBe('inconnu')
    expect(evaluation.prochaineEtape.id).toBe('omeluum-quete-finie')
  })

  it('quête finie sans achat : reste ouverte, il reste à acheter l’original', () => {
    const evaluation = evaluer(id, avec(declares('omeluum-rencontre', 'omeluum-quete-finie', 'omeluum-commerce-ouvert')))
    expect(evaluation.resultat).toBe('inconnu')
    expect(evaluation.prochaineEtape).toMatchObject({ id: null, libelle: expect.stringMatching(/Acheter/) })
  })

  it('original acquis, copies absentes : alerte levée, les copies restent une tâche d’équipement', () => {
    const etat = avec(declares('omeluum-rencontre'), {
      items: { 'boots-stormy-clamour': 'obtenu' },
      copies: { 'boots-stormy-clamour': { exemplaires: 0, affectes: [], copieValidee: false } },
    })
    const avant = JSON.stringify(etat.copies)
    expect(evaluer(id, etat, ['boots-stormy-clamour'])).toMatchObject({ resultat: 'satisfait', raison: 'original' })
    expect(JSON.stringify(etat.copies)).toBe(avant)
  })

  it('quitter la colonie sans aide reste informatif, et le sauvetage d’Acte III n’est pas exigé', () => {
    expect(evaluer(id, avec(declares('omeluum-quitte-sans-aide'))).resultat).toBe('inconnu')
    const condition = conditionDe(id)
    expect(condition.nonExigences.join(' ')).toMatch(/Acte III/)
    expect(condition.etapes.map((e) => e.id)).not.toContain('omeluum-sauve')
  })
})

describe('compagnon et marchands doubles', () => {
  it('Ferg : Ombrecœur proche sans état narratif défavorable ne ferme rien', () => {
    expect(evaluer('ferg-ombrecoeur', avec(declares('ombrecoeur-proche-ferg'))).resultat).toBe('inconnu')
    expect(evaluer('ferg-ombrecoeur', avec(declares('ombrecoeur-rejete-shar'))).resultat).toBe('inconnu')
  })

  it('Ferg : Ombrecœur proche ET Shar rejeté ferme le commerce (obligation ET)', () => {
    const etat = avec(declares('ombrecoeur-rejete-shar', 'ombrecoeur-proche-ferg'))
    expect(evaluer('ferg-ombrecoeur', etat).resultat).toBe('non-satisfait')
  })

  it('Ferg : sans Ombrecœur, l’original acheté lève l’alerte ; aucun compagnon n’est requis', () => {
    const etat = avec({}, { items: { 'hellrider-longbow': 'obtenu' } })
    expect(evaluer('ferg-ombrecoeur', etat, ['hellrider-longbow']).resultat).toBe('satisfait')
    expect(JSON.stringify(conditionDe('ferg-ombrecoeur'))).not.toMatch(/requise? obligatoire|indispensable/i)
  })

  it('Rolan / Lorroakan : une méthode fermée n’éteint pas l’autre', () => {
    const rolanMort = evaluer('rolan-lorroakan-anneau', avec(declares('rolan-mort')))
    expect(rolanMort.resultat).toBe('inconnu')
    expect(rolanMort.methodes.map((m) => m.ouverte)).toEqual([false, true])
    const lorroakanMort = evaluer('rolan-lorroakan-anneau', avec(declares('lorroakan-mort')))
    expect(lorroakanMort.resultat).toBe('inconnu')
  })

  it('Rolan / Lorroakan : les deux absents ferment l’anneau, mais pas le gilet (non documenté)', () => {
    const etat = avec(declares('rolan-mort', 'lorroakan-mort'))
    expect(evaluer('rolan-lorroakan-anneau', etat).resultat).toBe('non-satisfait')
    expect(evaluer('rolan-lorroakan', etat).resultat).toBe('inconnu')
  })

  it('Rolan / Lorroakan : original acquis malgré les deux absents', () => {
    const etat = avec(declares('rolan-mort', 'lorroakan-mort'), { items: { 'ring-of-regeneration': 'obtenu' } })
    expect(evaluer('rolan-lorroakan-anneau', etat, ['ring-of-regeneration']).resultat).toBe('satisfait')
  })
})

describe('Bœuf étrange — rencontre ≠ butin', () => {
  const id = 'chapeau-acuite-boeuf'

  it('bœuf vu vivant sans chapeau acquis : un jalon, l’alerte reste ouverte', () => {
    const evaluation = evaluer(id, avec(declares('boeuf-vu-ultime-lueur', 'boeuf-vu-rivington')))
    expect(evaluation.resultat).toBe('inconnu')
    expect(conditionDe(id).voies).toEqual([])
    expect(evaluation.prochaineEtape.libelle).toMatch(/chapeau/)
  })

  it('une méthode fermée (auberge tombée) laisse Rivington ouverte : jamais « impossible »', () => {
    const evaluation = evaluer(id, avec(declares('isobel-perdue')))
    expect(evaluation.resultat).toBe('inconnu')
    expect(evaluation.methodes.map((m) => [m.id, m.ouverte])).toEqual([
      ['ultime-lueur', false],
      ['rivington', true],
    ])
  })

  it('toutes les méthodes fermées : non satisfait ; l’original obtenu prime', () => {
    const fermees = declares('chantenuit-tuee', 'boeuf-aide-acte3')
    expect(evaluer(id, avec(fermees)).resultat).toBe('non-satisfait')
    expect(evaluer(id, avec(fermees, { items: { 'hat-of-fire-acuity': 'obtenu' } })).resultat).toBe('satisfait')
  })
})

describe('compatibilité des statuts locaux et cloud', () => {
  it('un ancien « fait » sur une condition redéfinie est écarté ; « ignorer » et les événements restent', () => {
    const ancien = {
      evenements: { 'boeuf-vu-rivington': true, 'colonie-illithid': true },
      statuts: { 'dammon-survie': 'fait', 'chapeau-acuite-boeuf': 'fait', 'dammon-achats-acte2': 'ignore', 'kushigo-plan-astral': 'fait' },
      spoilers: 'detail',
    }
    const migre = normaliserAcquisition(ancien)
    expect(migre.statuts).toEqual({ 'dammon-achats-acte2': 'ignore', 'kushigo-plan-astral': 'fait' })
    expect(migre.evenements).toEqual(ancien.evenements)
    expect(migre.version).toBe(2)
  })

  it('un « fait » déclaré sous la nouvelle version est conservé, et la migration est idempotente', () => {
    const migre = normaliserAcquisition({ statuts: { 'dammon-survie': 'fait' } })
    expect(migre.statuts).toEqual({})
    const courant = { ...migre, statuts: { 'dammon-survie': 'fait' } }
    expect(normaliserAcquisition(courant).statuts).toEqual({ 'dammon-survie': 'fait' })
    expect(normaliserAcquisition(normaliserAcquisition(courant))).toEqual(normaliserAcquisition(courant))
  })

  it('même chemin pour une sauvegarde complète (locale ou cloud)', () => {
    const brut = { ...etatInitial(), acquisition: { evenements: {}, statuts: { 'rolan-lorroakan': 'fait' }, spoilers: 'discret' } }
    expect(normaliserEtat(brut).acquisition.statuts).toEqual({})
  })
})

describe('affichage — geste concret, jalons et preuves accessibles', () => {
  globalThis.window = { matchMedia: () => ({ matches: false }) }
  const rendre = (element) => {
    const faux = { getItem: () => null, setItem: () => {}, removeItem: () => {} }
    globalThis.localStorage = faux
    globalThis.window.localStorage = faux
    return renderToString(createElement(MemoryRouter, null, createElement(FournisseurProgression, null, element))).replaceAll(
      '<!-- -->',
      '',
    )
  }

  it('l’alerte amont affiche le geste, des liens vers les objets et reste un seul bloc', () => {
    const alerte = recapZone('bosquet-emeraude', avec()).ouvertes.find(({ condition }) => condition.id === 'dammon-survie')
    const html = rendre(createElement('ul', null, createElement(AlerteAcquisition, { alerte, nomZone: 'Bosquet' })))
    expect(html).toContain('À faire ici')
    expect(html).toContain('quête des réfugiés')
    expect(html).toContain('/items?recherche=')
    expect(html).toMatch(/aria-expanded="false"/)
    expect(html).toMatch(/min-h-\[44px\]/)
    // Mode discret : l'explication spoiler n'est pas affichée d'emblée.
    expect(html).not.toContain('Les jalons ne se substituent pas')
  })
})
