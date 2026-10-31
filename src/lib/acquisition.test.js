import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { AlerteAcquisition, BadgesAcquisition } from '../components/AlertesAcquisition.jsx'
import RecapZone from '../components/RecapZone.jsx'
import { FournisseurProgression } from '../hooks/useProgression.jsx'
import { CATEGORIES, CONDITIONS, EVENEMENTS, SEVERITES, conditionDe } from '../data/acquisition.js'
import { BUILDS } from '../data/builds.js'
import { LIEUX } from '../data/lieux.js'
import { OBJETS, objetDe } from '../data/objets.js'
import {
  alertesObjet,
  badgesObjet,
  evaluerCondition,
  niveauAudit,
  objetsDuPlan,
  recapZone,
  tableauCouverture,
  zoneParDefaut,
} from './acquisition.js'
import { avecEvenement, avecStatutAlerte, normaliserAcquisition } from './acquisition-etat.js'
import { nomsObjet } from './localisation.js'
import { aDeLaProgression, migrerVersCourant } from './sauvegarde.js'
import { etatInitial, normaliserEtat } from './progression.js'

const etat = (modif = {}) => ({ ...etatInitial(), ...modif })
const avec = (acquisition) => etat({ acquisition: { ...etatInitial().acquisition, ...acquisition } })

describe('conditions — intégrité des données', () => {
  it('référencent des objets, des zones et des événements existants', () => {
    const evenements = new Set(EVENEMENTS.map((evenement) => evenement.id))
    for (const condition of CONDITIONS) {
      expect(CATEGORIES[condition.categorie], condition.id).toBeDefined()
      expect(SEVERITES[condition.severite], condition.id).toBeDefined()
      for (const id of condition.objets) expect(objetDe(id), `${condition.id} → ${id}`).not.toBeNull()
      if (condition.zone) expect(LIEUX.some((lieu) => lieu.id === condition.zone), condition.id).toBe(true)
      if (condition.evenement) expect(evenements.has(condition.evenement), condition.id).toBe(true)
      for (const voie of condition.voies) expect(evenements.has(voie.id), voie.id).toBe(true)
    }
    for (const evenement of EVENEMENTS) {
      expect(LIEUX.some((lieu) => lieu.id === evenement.zone), evenement.id).toBe(true)
    }
  })

  it('chaque condition est sourcée, et une conséquence forte ne repose pas sur une source vide', () => {
    for (const condition of CONDITIONS) {
      expect(condition.sources.length, condition.id).toBeGreaterThan(0)
      expect(condition.discret.length, condition.id).toBeGreaterThan(10)
      expect(condition.detail.length, condition.id).toBeGreaterThan(10)
      if (condition.irreversible) {
        // Pas d'irréversible inventé : source recoupée ou fiche, jamais « à vérifier ».
        expect(condition.confiance, condition.id).not.toBe('a-verifier')
        expect(condition.evenement, condition.id).not.toBeNull()
      }
    }
  })

  it('un cas réel sourcé pour chaque catégorie utilisée ; compagnon-requis reste vide sans être inventé', () => {
    const utilisees = new Set(CONDITIONS.map((condition) => condition.categorie))
    for (const categorie of Object.keys(CATEGORIES)) {
      if (categorie === 'compagnon-requis') expect(utilisees.has(categorie)).toBe(false)
      else expect(utilisees.has(categorie), categorie).toBe(true)
    }
  })

  it('n’affirme jamais « Ombrecœur obligatoire »', () => {
    const texte = JSON.stringify(CONDITIONS).toLowerCase()
    expect(texte).not.toMatch(/ombrec(œ|oe)ur (obligatoire|indispensable|requis)/)
  })

  it('Mystic Scoundrel et Nyrulna : deux contenants distincts, une seule alerte partagée', () => {
    const condition = conditionDe('akabi-jungle')
    expect(condition.objets).toEqual(expect.arrayContaining(['nyrulna', 'band-mystic-scoundrel']))
    expect(condition.detail).toMatch(/coffre/)
    expect(condition.detail).toMatch(/sac à dos/)
    expect(CONDITIONS.filter((autre) => autre.objets.includes('nyrulna'))).toHaveLength(1)
  })
})

describe('évaluation — trois résultats, jamais de feu vert par défaut', () => {
  it('événement inconnu : « inconnu », pas satisfait', () => {
    const resultat = evaluerCondition(conditionDe('kushigo-plan-astral'), etat())
    expect(resultat.resultat).toBe('inconnu')
  })

  it('une condition incertaine reste « à vérifier » même après un départ déclaré', () => {
    const condition = conditionDe('creche-arcane-synergy')
    const declare = avec({ evenements: { 'depart-creche-yllek': true } })
    expect(evaluerCondition(condition, declare).resultat).toBe('inconnu')
  })

  it('plusieurs voies : une seule suffit (logique alternative)', () => {
    const condition = conditionDe('chapeau-acuite-boeuf')
    expect(evaluerCondition(condition, etat()).resultat).toBe('inconnu')
    const resultat = evaluerCondition(condition, avec({ evenements: { 'boeuf-vu-rivington': true } }))
    expect(resultat).toMatchObject({ resultat: 'satisfait', raison: 'voie' })
    expect(evaluerCondition(condition, avec({ evenements: { 'boeuf-vu-ultime-lueur': true } })).resultat).toBe('satisfait')
  })

  it('départ irréversible déclaré sans l’objet : non satisfait ; l’original obtenu prime', () => {
    const condition = conditionDe('kushigo-plan-astral')
    const declare = avec({ evenements: { 'depart-plan-astral': true } })
    expect(evaluerCondition(condition, declare)).toMatchObject({ resultat: 'non-satisfait', raison: 'ferme' })
    const obtenu = { ...declare, items: { 'boots-uninhibited-kushigo': 'obtenu' } }
    expect(evaluerCondition(condition, obtenu).resultat).toBe('satisfait')
  })

  it('condition devenue impossible : Roah tuée ferme la boutique d’Acte II', () => {
    const condition = conditionDe('roah-vivante-acte2')
    const resultat = evaluerCondition(condition, avec({ evenements: { 'roah-tuee': true } }))
    expect(resultat.resultat).toBe('non-satisfait')
  })

  it('un événement temporaire (Dammon) n’est pas présenté comme une perte définitive', () => {
    const condition = conditionDe('dammon-achats-acte2')
    expect(evaluerCondition(condition, avec({ evenements: { 'colonie-illithid': true } })).resultat).toBe('inconnu')
  })

  it('ignorer masque sans résoudre ; restaurer ramène l’alerte', () => {
    const condition = conditionDe('kushigo-plan-astral')
    let courant = etat()
    courant = { ...courant, acquisition: avecStatutAlerte(courant.acquisition, condition.id, 'ignore') }
    const ignoree = evaluerCondition(condition, courant)
    expect(ignoree).toMatchObject({ ignoree: true, resultat: 'inconnu' })
    expect(badgesObjet('boots-uninhibited-kushigo', courant)).toHaveLength(0)
    expect(recapZone('plan-astral', courant).ignorees).toHaveLength(1)
    expect(recapZone('plan-astral', courant).ouvertes).toHaveLength(0)

    courant = { ...courant, acquisition: avecStatutAlerte(courant.acquisition, condition.id, null) }
    expect(evaluerCondition(condition, courant).ignoree).toBe(false)
    expect(badgesObjet('boots-uninhibited-kushigo', courant)).toHaveLength(1)
  })

  it('« fait » est une déclaration réversible, pas une possession', () => {
    const condition = conditionDe('kushigo-plan-astral')
    const fait = etat({ acquisition: avecStatutAlerte(etatInitial().acquisition, condition.id, 'fait') })
    expect(evaluerCondition(condition, fait)).toMatchObject({ resultat: 'satisfait', raison: 'declare' })
    expect(fait.items).toEqual({})
  })

  it('original obtenu : lève l’alerte sans toucher aux copies ni à l’équipement', () => {
    const condition = conditionDe('akabi-jungle')
    const courant = etat({
      items: { nyrulna: 'obtenu', 'band-mystic-scoundrel': 'obtenu' },
      copies: { nyrulna: { exemplaires: 0, affectes: [], copieValidee: false } },
    })
    const avant = JSON.stringify(courant.copies)
    expect(evaluerCondition(condition, courant).resultat).toBe('satisfait')
    expect(JSON.stringify(courant.copies)).toBe(avant)
  })

  it('copies prévues sans original : une seule alerte d’acquisition, jamais une par copie', () => {
    const courant = etat({ copies: { 'hat-of-fire-acuity': { exemplaires: 3, affectes: ['sorcier-feu', 'sidekick-savoir-vie'], copieValidee: false } } })
    expect(alertesObjet('hat-of-fire-acuity', courant)).toHaveLength(1)
    expect(badgesObjet('hat-of-fire-acuity', courant)).toHaveLength(1)
  })
})

describe('récapitulatif de zone', () => {
  it('filtre par équipe et dédoublonne une alerte commune à plusieurs objets/rôles', () => {
    const tous = recapZone('antre-ethel', etat(), { alternatives: true })
    const ids = tous.ouvertes.map(({ condition }) => condition.id)
    expect(new Set(ids).size).toBe(ids.length)
    const alerte = tous.ouvertes.find(({ condition }) => condition.id === 'ethel-elixirs')
    expect(alerte.objets).toEqual(['elixir-hill-giant-strength'])
    expect(alerte.roles.length).toBeGreaterThan(0)

    const sansEquipe = recapZone('antre-ethel', etat(), { roles: ['paladin-hexblade'], alternatives: false })
    expect(sansEquipe.ouvertes.some(({ condition }) => condition.id === 'ethel-elixirs')).toBe(
      objetsDuPlan(etat(), { roles: ['paladin-hexblade'] }).includes('elixir-hill-giant-strength'),
    )
  })

  it('les alternatives sont proposées sans noyer la liste principale', () => {
    const principal = objetsDuPlan(etat())
    const toutes = objetsDuPlan(etat(), { alternatives: true })
    expect(toutes.length).toBeGreaterThan(principal.length)
    for (const id of principal) expect(toutes).toContain(id)
  })

  it('départ déclaré : l’alerte passe en impossible dans le récapitulatif de la zone', () => {
    const recap = recapZone('plan-astral', avec({ evenements: { 'depart-plan-astral': true } }), { alternatives: true })
    expect(recap.ouvertes[0].evaluation.resultat).toBe('non-satisfait')
    expect(recap.rienDeBloquant).toBe(false)
  })

  it('« Rien de bloquant » uniquement sans alerte ouverte ni objet manquant', () => {
    const resolu = etat({ items: { 'boots-uninhibited-kushigo': 'obtenu' } })
    const recap = recapZone('plan-astral', resolu, { alternatives: true })
    expect(recap.ouvertes).toHaveLength(0)
    expect(recap.manquants).toHaveLength(0)
    expect(recap.rienDeBloquant).toBe(true)
    expect(recapZone('plan-astral', etat(), { alternatives: true }).rienDeBloquant).toBe(false)
  })

  it('signale séparément les objets pertinents non audités', () => {
    const recap = recapZone('tours-aubelune', etat(), { alternatives: true })
    expect(recap.nonAudites.length).toBeGreaterThan(0)
    for (const id of recap.nonAudites) expect(niveauAudit(id)).toBe('non-audite')
  })
})

describe('couverture d’audit', () => {
  it('classe chaque objet du catalogue dans exactement un niveau', () => {
    const couverture = tableauCouverture()
    expect(couverture.total).toBe(OBJETS.length)
    expect(couverture.contraintes.length + couverture['sans-contrainte'].length + couverture['non-audite'].length).toBe(
      OBJETS.length,
    )
    expect(couverture.contraintes.length).toBeGreaterThan(0)
  })

  it('l’absence de condition n’est jamais la preuve d’un objet sans risque', () => {
    for (const id of tableauCouverture()['non-audite']) {
      const objet = objetDe(id)
      const neutre = objet.sources.every((s) => (!s.verrou || s.verrou === 'aucun') && !s.aConfirmer && s.lieu !== null)
      expect(neutre, id).toBe(false)
    }
  })
})

describe('persistance — additive, sans perte', () => {
  it('une ancienne sauvegarde garde ses statuts et reçoit un suivi vide, discret', () => {
    const ancien = { schema: 2, composition: etatInitial().composition, items: { nyrulna: 'obtenu' }, checklist: { x: true } }
    const normalise = normaliserEtat(ancien)
    expect(normalise.items).toEqual({ nyrulna: 'obtenu' })
    expect(normalise.acquisition).toEqual({ evenements: {}, statuts: {}, spoilers: 'discret' })
  })

  it('écarte les clés inconnues et corrompues, garde les valides', () => {
    const brut = {
      evenements: { 'roah-tuee': true, inconnu: true, 'depart-plan-astral': 'oui' },
      statuts: { 'kushigo-plan-astral': 'ignore', 'roah-vivante-acte2': 'nimporte', fantome: 'fait' },
      spoilers: 'detail',
    }
    expect(normaliserAcquisition(brut)).toEqual({
      evenements: { 'roah-tuee': true },
      statuts: { 'kushigo-plan-astral': 'ignore' },
      spoilers: 'detail',
    })
    expect(normaliserAcquisition('n’importe quoi')).toEqual(etatInitial().acquisition)
  })

  it('déclarer puis retirer revient à l’état de départ', () => {
    const base = etatInitial().acquisition
    const declare = avecEvenement(base, 'roah-tuee', true)
    expect(declare.evenements['roah-tuee']).toBe(true)
    expect(avecEvenement(declare, 'roah-tuee', false)).toEqual(base)
  })

  it('un suivi renseigné compte comme progression (jamais traité comme vide)', () => {
    expect(aDeLaProgression(etatInitial())).toBe(false)
    expect(aDeLaProgression(avec({ evenements: { 'roah-tuee': true } }))).toBe(true)
  })

  it('la migration d’une sauvegarde courante conserve le suivi', () => {
    const courant = { ...etatInitial(), acquisition: avecEvenement(etatInitial().acquisition, 'roah-tuee', true) }
    expect(migrerVersCourant(courant).etat.acquisition.evenements).toEqual({ 'roah-tuee': true })
  })
})

describe('interface — spoilers, clavier, mobile', () => {
  globalThis.document = { documentElement: { dataset: {} } }
  globalThis.window = { matchMedia: () => ({ matches: false }) }
  const rendre = (element, stockage = null) => {
    const faux = {
      getItem: (cle) => (cle === 'bg3-progression' && stockage ? JSON.stringify(stockage) : null),
      setItem: () => {},
      removeItem: () => {},
    }
    globalThis.localStorage = faux
    globalThis.window.localStorage = faux
    return renderToString(
      createElement(MemoryRouter, null, createElement(FournisseurProgression, null, element)),
    ).replaceAll('<!-- -->', '')
  }
  const sauvegarde = (acquisition) => ({ ...etatInitial(), acquisition: { ...etatInitial().acquisition, ...acquisition } })
  const alerteDe = (id, zone, options = { alternatives: true }) =>
    recapZone(zone, etat(), options).ouvertes.find(({ condition }) => condition.id === id)

  it('la page des lieux affiche le récapitulatif dans la zone proposée d’emblée', () => {
    const options = { roles: BUILDS.map((build) => build.id), alternatives: false }
    const zone = zoneParDefaut(etat(), options)
    const condition = recapZone(zone.id, etat(), options).ouvertes[0].condition
    const html = rendre(createElement(RecapZone))
    expect(html).toContain('Avant de quitter cette zone')
    expect(html).toContain(`data-recap-zone="${zone.id}"`)
    expect(html).toContain(condition.libelleDiscret)
    expect(html).toContain(SEVERITES[condition.severite].nom)
  })

  it('mode discret : urgence visible, détail masqué, bouton d’accès au clavier', () => {
    const alerte = alerteDe('kushigo-plan-astral', 'plan-astral')
    const html = rendre(createElement('ul', null, createElement(AlerteAcquisition, { alerte })))
    expect(html).toContain('Perte possible')
    expect(html).toContain(alerte.condition.libelleDiscret)
    expect(html).not.toContain(alerte.condition.detail.slice(0, 40))
    expect(html).toMatch(/<button[^>]*aria-expanded="false"[^>]*aria-controls="detail-kushigo-plan-astral"/)
  })

  it('mode détail : l’explication et les sources sont lues sans clic', () => {
    const alerte = alerteDe('kushigo-plan-astral', 'plan-astral')
    const html = rendre(
      createElement('ul', null, createElement(AlerteAcquisition, { alerte })),
      sauvegarde({ spoilers: 'detail' }),
    )
    expect(html).toContain(alerte.condition.detail.slice(0, 40))
    expect(html).toContain('bg3.wiki/wiki/Boots_of_Uninhibited_Kushigo')
  })

  it('le mode discret masque les noms d’objets d’une rencontre ; le détail les rend', () => {
    const alerte = alerteDe('ethel-cheveu', 'antre-ethel')
    expect(alerte.condition.masquerObjets).toBe(true)
    const nom = nomsObjet(objetDe('auntie-ethels-hair')).principal
    const discret = rendre(createElement('ul', null, createElement(AlerteAcquisition, { alerte })))
    expect(discret).toContain('masqués en mode discret')
    expect(discret).not.toContain(nom)
    expect(discret).toContain('Perte possible')
    const detail = rendre(createElement('ul', null, createElement(AlerteAcquisition, { alerte })), sauvegarde({ spoilers: 'detail' }))
    expect(detail).toContain(nom)
  })

  it('les décisions sont des boutons nommés d’au moins 44 px, à l’état annoncé', () => {
    const alerte = alerteDe('kushigo-plan-astral', 'plan-astral')
    const html = rendre(createElement('ul', null, createElement(AlerteAcquisition, { alerte })))
    expect(html).toMatch(/role="group" aria-label="Décision pour l’alerte/)
    for (const nom of ['À vérifier', 'Fait', 'Ignorer']) expect(html).toContain(`>${nom}</button>`)
    expect(html).toMatch(/aria-pressed="true"[^>]*min-h-\[44px\][^>]*>À vérifier/)
  })

  it('un départ déclaré s’annonce comme condition devenue impossible', () => {
    const condition = conditionDe('kushigo-plan-astral')
    const declare = etat({ acquisition: { ...etatInitial().acquisition, evenements: { 'depart-plan-astral': true } } })
    const alerte = recapZone('plan-astral', declare, { alternatives: true }).ouvertes[0]
    const html = rendre(createElement('ul', null, createElement(AlerteAcquisition, { alerte })), declare)
    expect(html).toContain('Condition devenue impossible')
    expect(condition.irreversible).toBe(true)
  })

  it('le badge d’objet reste court et nomme l’incertitude', () => {
    const html = rendre(createElement(BadgesAcquisition, { objetId: 'chapeau-inexistant' }))
    expect(html).toBe('')
    const badges = badgesObjet('hat-of-fire-acuity', etat())
    expect(badges[0].libelle).toBe('À vérifier sur votre version')
    const court = rendre(createElement(BadgesAcquisition, { objetId: 'boots-uninhibited-kushigo' }))
    expect(court).toContain('Avant départ')
  })
})
