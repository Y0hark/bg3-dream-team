import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { CONDITIONS } from './acquisition.js'
import { OBJETS } from './objets.js'

// Garde de couverture de docs/audit-acquisitions.json (Follow-up 2/4) : le rapport
// d'audit ne doit ni omettre un objet du catalogue, ni citer un ID disparu, ni
// classer un inconnu « sans risque ». Il ne vérifie pas le contenu du wiki.
const audit = JSON.parse(readFileSync(new URL('../../docs/audit-acquisitions.json', import.meta.url), 'utf8'))

const STATUTS = ['contraintes', 'sans-contrainte', 'non-resolu']

describe('audit des acquisitions', () => {
  it('couvre exactement les IDs actifs du catalogue, sans doublon', () => {
    const catalogue = OBJETS.map((objet) => objet.id).sort()
    expect([...audit.ids].sort()).toEqual(catalogue)
    expect(audit.objets.map((objet) => objet.id).sort()).toEqual(catalogue)
  })

  it('répartit chaque objet dans un seul verdict de couverture', () => {
    const classes = STATUTS.flatMap((statut) => audit.couverture[statut])
    expect([...classes].sort()).toEqual([...audit.ids].sort())
    audit.objets.forEach((objet) => {
      expect(STATUTS).toContain(objet.statut)
      expect(audit.couverture[objet.statut]).toContain(objet.id)
    })
  })

  it('cite une preuve complète pour chaque objet', () => {
    audit.objets.forEach((objet) => {
      expect(objet.preuves.length, objet.id).toBeGreaterThan(0)
      objet.preuves.forEach((preuve) => {
        expect(preuve.url, objet.id).toMatch(/^https:\/\/bg3\.wiki\/wiki\//)
        expect(preuve.rev, objet.id).toMatch(/^\d+$/)
        expect(preuve.extrait.length, objet.id).toBeGreaterThan(10)
      })
    })
  })

  it('décrit chaque objet avec contraintes par au moins une voie', () => {
    audit.objets
      .filter((objet) => objet.statut === 'contraintes')
      .forEach((objet) => {
        expect(objet.voies.length, objet.id).toBeGreaterThan(0)
        expect(objet.porteur, objet.id).toBeTruthy()
      })
  })

  it('ne classe jamais un inconnu « sans risque » et en précise la portée', () => {
    expect(audit.inconnus.length).toBeGreaterThan(0)
    audit.inconnus.forEach((inconnu) => {
      expect(inconnu.pages.length).toBeGreaterThan(0)
      expect(inconnu.question).toBeTruthy()
      expect(inconnu.portee).toBeTruthy()
      expect(`${inconnu.question} ${inconnu.portee}`).not.toMatch(/aucun risque|sans risque/i)
    })
    audit.couverture['non-resolu'].forEach((id) => {
      const objet = audit.objets.find((o) => o.id === id)
      expect(objet.inconnus.length, id).toBeGreaterThan(0)
    })
  })

  it('référence des chaînes et des objets existants', () => {
    const ids = new Set(audit.ids)
    audit.objets.forEach((objet) => {
      objet.chaines.forEach((chaine) => expect(audit.chaines[chaine], `${objet.id} → ${chaine}`).toBeDefined())
    })
    Object.entries(audit.chaines).forEach(([nom, chaine]) => {
      chaine.objets.forEach((id) => expect(ids.has(id), `${nom} → ${id}`).toBe(true))
    })
    audit.indexEvenements.forEach((evenement) => {
      evenement.objets.forEach((id) => expect(ids.has(id), evenement.evenement).toBe(true))
    })
    audit.indexPnj.forEach((entree) => entree.objets.forEach((id) => expect(ids.has(id), entree.pnj).toBe(true)))
  })

  it('situe chaque erreur relevée sur un ID ou une condition qui existe', () => {
    const conditions = new Set(CONDITIONS.map((condition) => condition.id))
    const ids = new Set(audit.ids)
    audit.erreurs.forEach((erreur) => {
      if (erreur.id === null) return
      const existe = erreur.fichier.endsWith('acquisition.js') ? conditions.has(erreur.id) : ids.has(erreur.id)
      expect(existe, `${erreur.fichier} ${erreur.id}`).toBe(true)
      expect(erreur.preuves.length, erreur.id).toBeGreaterThan(0)
    })
  })
})
