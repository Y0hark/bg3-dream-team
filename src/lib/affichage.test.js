import { describe, expect, it } from 'vitest'
import { BUILDS } from '../data/builds.js'
import { LIEUX } from '../data/lieux.js'
import { ITEMS } from '../data/items.js'
import {
  affichageInitial,
  avecActe,
  avecMode,
  avecZone,
  normaliserAffichage,
  prochainesActions,
  resumeRoles,
} from './affichage.js'
import { etatInitial } from './progression.js'

const roles = BUILDS.map((build) => build.id)

describe('préférences d’affichage', () => {
  it('première visite : Préparer, aucune zone ni acte', () => {
    expect(affichageInitial()).toEqual({ mode: 'preparer', acte: null, zone: null })
    expect(normaliserAffichage(null)).toEqual(affichageInitial())
    expect(normaliserAffichage('n’importe quoi')).toEqual(affichageInitial())
  })

  it('écarte les valeurs inconnues sans lever', () => {
    expect(normaliserAffichage({ mode: 'hacker', zone: 'nulle-part', acte: 9 })).toEqual(affichageInitial())
  })

  it('la zone déclarée impose son acte', () => {
    const lieu = LIEUX.find((entree) => entree.acte === 2)
    expect(normaliserAffichage({ mode: 'en-partie', zone: lieu.id, acte: 1 })).toEqual({
      mode: 'en-partie',
      zone: lieu.id,
      acte: 2,
    })
    expect(avecZone(affichageInitial(), lieu.id)).toMatchObject({ zone: lieu.id, acte: 2 })
  })

  it('un acte seul reste valable ; changer d’acte oublie une zone d’un autre acte', () => {
    const lieu = LIEUX.find((entree) => entree.acte === 2)
    expect(avecActe(affichageInitial(), 3)).toMatchObject({ acte: 3, zone: null })
    expect(avecActe(avecZone(affichageInitial(), lieu.id), 2).zone).toBe(lieu.id)
    expect(avecActe(avecZone(affichageInitial(), lieu.id), 3).zone).toBeNull()
  })

  it('un mode invalide est ignoré', () => {
    expect(avecMode(affichageInitial(), 'x')).toEqual(affichageInitial())
    expect(avecMode(affichageInitial(), 'en-partie').mode).toBe('en-partie')
  })
})

describe('résumé d’équipe en partie', () => {
  it('sépare prévu et équipé, et ne produit aucun score', () => {
    const resumes = resumeRoles(roles, 1, etatInitial())
    expect(resumes.map((resume) => resume.role)).toEqual(roles)
    for (const resume of resumes) {
      expect(resume.equipes).toBe(0)
      expect(resume.prevus).toBeGreaterThan(0)
      expect(Object.keys(resume)).not.toContain('pourcentage')
    }
  })

  it('un original obtenu sans affectation reste à affecter, pas équipé', () => {
    const vide = resumeRoles(roles, 1, etatInitial())
    const objet = ITEMS.find((item) => item.acte === 1)
    const etat = { ...etatInitial(), items: { [objet.id]: 'obtenu' } }
    const apres = resumeRoles(roles, 1, etat)
    expect(apres.reduce((somme, r) => somme + r.equipes, 0)).toBe(0)
    expect(apres.reduce((somme, r) => somme + r.originauxARecuperer, 0)).toBeLessThanOrEqual(
      vide.reduce((somme, r) => somme + r.originauxARecuperer, 0),
    )
  })

  it('les actions découlent des statuts et ne changent pas l’état', () => {
    const etat = etatInitial()
    const avant = JSON.stringify(etat)
    const actions = prochainesActions(roles, 1, etat)
    expect(actions.some((action) => action.type === 'original')).toBe(true)
    expect(JSON.stringify(etat)).toBe(avant)
  })
})
