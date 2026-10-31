import { describe, expect, it } from 'vitest'
import { BUILDS } from '../data/builds.js'
import { objetDe } from '../data/objets.js'
import { affecter, ajouterCopie, etatCopies, liberer, retirerCopie } from './copies.js'
import { besoinsEquipe, depassementsEquipes, statutPorteur, vueEquipe } from './equipe.js'
import { etatInitial, normaliserEtat } from './progression.js'
import { analyserBrut, decisionDistante, migrerVersCourant } from './sauvegarde.js'
import { VERSION_SCHEMA } from './schema.js'

const ROLES = BUILDS.map((build) => build.id)
const CAPE = 'cloak-of-protection'
const CHEVEU = 'auntie-ethels-hair'
const objetCape = objetDe(CAPE)

const planIdentique = (objet, roles = ROLES) =>
  roles.map((role) => ({ role, emplacements: [{ cle: `${role}|2|Cape|0`, slot: 'Cape', libelle: 'Cape', objet }] }))

const avec = (surcharge = {}) => ({ ...etatInitial(), ...surcharge })

describe('original obtenu, zéro copie, quatre plans identiques', () => {
  const etat = avec({ items: { [CAPE]: 'obtenu' } })

  it('ne compte qu’un exemplaire et aucun équipé', () => {
    const [besoin] = besoinsEquipe(planIdentique(CAPE), etat)
    expect(besoin).toMatchObject({ exemplaires: 1, equipes: 0, libres: 1, originalARecuperer: false })
    expect(besoin.copiesAPreparer).toBe(3)
    expect(ROLES.map((role) => statutPorteur(CAPE, role, etat))).toEqual(Array(4).fill('a-affecter'))
  })

  it('refuse la deuxième affectation : un seul exemplaire, un seul porteur', () => {
    let suivi
    const premier = affecter(objetCape, 'obtenu', suivi, ROLES[0])
    expect(premier.ok).toBe(true)
    const second = affecter(objetCape, 'obtenu', premier.suivi, ROLES[1])
    expect(second).toEqual({ ok: false, raison: 'aucun-exemplaire-libre' })
    expect(etatCopies(objetCape, 'obtenu', premier.suivi, []).affectes).toEqual([ROLES[0]])
  })

  it('après une affectation, les trois autres restent « copie à préparer », pas équipés', () => {
    const { suivi } = affecter(objetCape, 'obtenu', undefined, ROLES[0])
    const apres = avec({ items: { [CAPE]: 'obtenu' }, copies: { [CAPE]: suivi } })
    expect(ROLES.map((role) => statutPorteur(CAPE, role, apres))).toEqual([
      'equipe',
      'copie-a-preparer',
      'copie-a-preparer',
      'copie-a-preparer',
    ])
    const [besoin] = besoinsEquipe(planIdentique(CAPE), apres)
    expect(besoin).toMatchObject({ equipes: 1, libres: 0, copiesAPreparer: 3 })
  })
})

describe('original manquant ≠ copies manquantes', () => {
  it('sépare les deux actions', () => {
    const [besoin] = besoinsEquipe(planIdentique(CAPE), etatInitial())
    expect(besoin.originalARecuperer).toBe(true)
    // Une fois l'original obtenu, il en faudra encore trois autres.
    expect(besoin.copiesAPreparer).toBe(3)
    expect(statutPorteur(CAPE, ROLES[0], etatInitial())).toBe('original-a-recuperer')
  })

  it('un objet non copiable voulu par deux porteurs est un conflit, pas une copie à faire', () => {
    const [besoin] = besoinsEquipe(planIdentique(CHEVEU, ROLES.slice(0, 2)), avec({ items: { [CHEVEU]: 'obtenu' } }))
    expect(besoin.conflitUnique).toBe(true)
    expect(besoin.copiesAPreparer).toBe(0)
  })
})

describe('copies ajoutées, affectées, retirées, réaffectées', () => {
  it('ajoute des copies puis affecte sans jamais dépasser les exemplaires', () => {
    let suivi = ajouterCopie(objetCape, 'obtenu', undefined).suivi
    suivi = ajouterCopie(objetCape, 'obtenu', suivi).suivi
    expect(etatCopies(objetCape, 'obtenu', suivi, []).exemplaires).toBe(3)
    for (const role of ROLES.slice(0, 3)) suivi = affecter(objetCape, 'obtenu', suivi, role).suivi
    expect(affecter(objetCape, 'obtenu', suivi, ROLES[3]).ok).toBe(false)
    expect(etatCopies(objetCape, 'obtenu', suivi, []).affectes).toHaveLength(3)
  })

  it('refuse de retirer une copie portée, puis l’accepte une fois le porteur libéré', () => {
    let suivi = ajouterCopie(objetCape, 'obtenu', undefined).suivi
    suivi = affecter(objetCape, 'obtenu', suivi, ROLES[0]).suivi
    suivi = affecter(objetCape, 'obtenu', suivi, ROLES[1]).suivi
    expect(retirerCopie(objetCape, 'obtenu', suivi)).toEqual({ ok: false, raison: 'exemplaire-affecte' })
    suivi = liberer(suivi, ROLES[1])
    const retrait = retirerCopie(objetCape, 'obtenu', suivi)
    expect(retrait.ok).toBe(true)
    expect(retrait.suivi.exemplaires).toBe(1)
  })

  it('ne retire jamais l’original', () => {
    expect(retirerCopie(objetCape, 'obtenu', undefined)).toEqual({ ok: false, raison: 'original-uniquement' })
  })

  it('réaffecte sans dupliquer l’instance', () => {
    let suivi = affecter(objetCape, 'obtenu', undefined, ROLES[0]).suivi
    suivi = liberer(suivi, ROLES[0])
    suivi = affecter(objetCape, 'obtenu', suivi, ROLES[1]).suivi
    const vue = etatCopies(objetCape, 'obtenu', suivi, [])
    expect(vue.exemplaires).toBe(1)
    expect(vue.affectes).toEqual([ROLES[1]])
    // Libérer deux fois ne change rien.
    expect(liberer(liberer(suivi, ROLES[0]), ROLES[0]).affectes).toEqual([ROLES[1]])
  })

  it('un rôle ne porte jamais deux fois le même exemplaire', () => {
    let suivi = ajouterCopie(objetCape, 'obtenu', undefined).suivi
    suivi = affecter(objetCape, 'obtenu', suivi, ROLES[0]).suivi
    suivi = affecter(objetCape, 'obtenu', suivi, ROLES[0]).suivi
    expect(etatCopies(objetCape, 'obtenu', suivi, []).affectes).toEqual([ROLES[0]])
  })
})

describe('plans, actes et possession réelle', () => {
  const etat = avec({ items: { [CAPE]: 'obtenu' }, copies: { [CAPE]: { exemplaires: 1, affectes: [ROLES[0]], copieValidee: false } } })

  it('changer d’acte ne modifie ni la possession ni l’équipement', () => {
    const avant = JSON.stringify(etat)
    for (const acte of [1, 2, 3]) vueEquipe(ROLES, acte, etat)
    expect(JSON.stringify(etat)).toBe(avant)
  })

  it('la vue d’équipe couvre les quatre rôles aux trois actes', () => {
    for (const acte of [1, 2, 3]) {
      const vue = vueEquipe(ROLES, acte, etat)
      expect(vue.plans.map((plan) => plan.role)).toEqual(ROLES)
      for (const plan of vue.plans) expect(plan.emplacements.length).toBeGreaterThan(0)
    }
  })

  it('l’acte II prévoit la cape pour les quatre rôles, un seul est équipé', () => {
    const statuts = vueEquipe(ROLES, 2, etat).plans.map(
      (plan) => plan.emplacements.find((emplacement) => emplacement.objet === CAPE)?.statut,
    )
    expect(statuts.filter((statut) => statut === 'equipe')).toHaveLength(1)
    expect(statuts.filter((statut) => statut === 'copie-a-preparer')).toHaveLength(3)
  })

  it('signale deux objets équipés dans un slot limité à un', () => {
    const autreCape = 'cloak-of-displacement'
    expect(objetDe(autreCape)).toBeTruthy()
    const double = avec({
      items: { [CAPE]: 'obtenu', [autreCape]: 'obtenu' },
      copies: {
        [CAPE]: { exemplaires: 1, affectes: [ROLES[0]], copieValidee: false },
        [autreCape]: { exemplaires: 1, affectes: [ROLES[0]], copieValidee: false },
      },
    })
    expect(depassementsEquipes(ROLES[0], double)).toEqual([{ role: ROLES[0], slot: 'Cape', nombre: 2, limite: 1 }])
    expect(depassementsEquipes(ROLES[1], double)).toEqual([])
  })
})

describe('migration et compatibilité du suivi d’équipe', () => {
  const copiesBrutes = { [CAPE]: { exemplaires: 2, affectes: [ROLES[0]], copieValidee: true } }

  it('une ancienne sauvegarde (sans copies) migre vers un suivi vide, sans toucher aux statuts', () => {
    const { etat } = migrerVersCourant({ items: { [CAPE]: 'obtenu' }, checklist: {} })
    expect(etat.schema).toBe(VERSION_SCHEMA)
    expect(etat.items[CAPE]).toBe('obtenu')
    expect(etat.copies).toEqual({})
    expect(etat.choixAlternatives).toEqual({})
  })

  it('la migration est idempotente et conserve copies et affectations', () => {
    const courant = { ...etatInitial(), items: { [CAPE]: 'obtenu' }, copies: copiesBrutes }
    const une = migrerVersCourant(courant).etat
    const deux = migrerVersCourant(une).etat
    expect(deux).toEqual(une)
    expect(une.copies).toEqual(copiesBrutes)
  })

  it('relire un état courant (local ou cloud) ne change pas la forme du suivi', () => {
    const courant = normaliserEtat({ ...etatInitial(), copies: copiesBrutes })
    expect(normaliserEtat(JSON.parse(JSON.stringify(courant)))).toEqual(courant)
  })

  it('absorbe un suivi corrompu sans lever et sans inventer d’équipement', () => {
    const etat = normaliserEtat({ ...etatInitial(), copies: { [CAPE]: { exemplaires: 'x', affectes: [1, null, ROLES[0], ROLES[0]] } } })
    expect(etat.copies[CAPE].affectes).toEqual([ROLES[0]])
    // Sans original obtenu, aucun équipement n'est affiché.
    expect(statutPorteur(CAPE, ROLES[0], etat)).toBe('original-a-recuperer')
  })

  it('une sauvegarde d’une version future n’est ni lue comme courante ni écrasée', () => {
    const future = { ...etatInitial(), schema: VERSION_SCHEMA + 1, copies: copiesBrutes }
    expect(analyserBrut(future)).toEqual({ type: 'plus-recent', schema: VERSION_SCHEMA + 1 })
    expect(migrerVersCourant(future).etat.copies).toEqual({})
    const decision = decisionDistante({ statutLocal: 'ok', localVide: false, distantBrut: future, majLe: 'b', vuPrecedemment: 'a' })
    expect(decision).toMatchObject({ action: 'bloquer', raison: 'format-plus-recent', envoiAuto: false })
  })
})
