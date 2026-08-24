import { describe, expect, it } from 'vitest'
import {
  FILTRES_VIDES,
  STATUT_DEFAUT,
  compter,
  estResolu,
  etatInitial,
  filtrerItems,
  filtresActifs,
  filtresDepuisParams,
  filtresVersParams,
  grouperParActe,
  itemsCritiques,
  itemsRates,
  normaliserEtat,
  progressionChecklists,
  progressionParActe,
  statutBascule,
  statutDe,
  statutValide,
  trierItems,
} from './progression.js'

const items = [
  { id: 'a', nom: 'Alpha', slot: 'Gants', acte: 1, personnage: 'sam', priorite: 'S+', note: 'foudre' },
  { id: 'b', nom: 'Beta', slot: 'Bottes', acte: 1, personnage: 'lilian', priorite: 'B', note: '' },
  { id: 'c', nom: 'Gamma', slot: 'Casque', acte: 2, personnage: 'sam', priorite: 'S', note: '' },
  { id: 'd', nom: 'Delta', slot: 'Cape', acte: 3, personnage: 'sam', priorite: 'A', note: '' },
]

const etat = { items: { a: 'obtenu', b: 'rate', c: 'remplace' }, checklist: {} }

describe('statuts', () => {
  it('retombe sur « à récupérer » pour une valeur inconnue', () => {
    expect(statutValide('n’importe quoi')).toBe(STATUT_DEFAUT)
    expect(statutDe(etatInitial(), 'a')).toBe(STATUT_DEFAUT)
    expect(statutDe(etat, 'a')).toBe('obtenu')
  })

  it('ne compte comme résolu que « obtenu » et « remplacé »', () => {
    expect(estResolu('obtenu')).toBe(true)
    expect(estResolu('remplace')).toBe(true)
    expect(estResolu('rate')).toBe(false)
    expect(estResolu(STATUT_DEFAUT)).toBe(false)
  })

  it('bascule entre « à récupérer » et « obtenu »', () => {
    expect(statutBascule(STATUT_DEFAUT)).toBe('obtenu')
    expect(statutBascule('obtenu')).toBe(STATUT_DEFAUT)
    // Un item raté que l'on coche redevient obtenu, pas « à récupérer ».
    expect(statutBascule('rate')).toBe('obtenu')
  })
})

describe('normaliserEtat', () => {
  it('ignore les entrées corrompues et le statut par défaut', () => {
    const nettoye = normaliserEtat({
      items: { a: 'obtenu', b: 'inconnu', c: STATUT_DEFAUT, d: 42 },
      checklist: { x: true, y: 'oui' },
      parasite: 'ignoré',
    })
    expect(nettoye).toEqual({ items: { a: 'obtenu' }, checklist: { x: true } })
  })

  it('accepte un stockage vide ou invalide', () => {
    expect(normaliserEtat(null)).toEqual(etatInitial())
    expect(normaliserEtat('nope')).toEqual(etatInitial())
  })
})

describe('compter', () => {
  it('agrège obtenus, ratés, remplacés et restants', () => {
    expect(compter(items, etat)).toEqual({
      total: 4,
      obtenus: 1,
      rates: 1,
      remplaces: 1,
      resolus: 2,
      restants: 1,
      pourcentage: 50,
    })
  })

  it('renvoie 0 % sur un lot vide plutôt que NaN', () => {
    expect(compter([], etat).pourcentage).toBe(0)
  })

  it('ne monte à 100 % que si tout est résolu', () => {
    const partiel = compter(items, { items: { a: 'obtenu', b: 'obtenu', c: 'obtenu' } })
    expect(partiel.pourcentage).toBe(75)
    const complet = compter(items, {
      items: { a: 'obtenu', b: 'obtenu', c: 'obtenu', d: 'remplace' },
    })
    expect(complet.pourcentage).toBe(100)
  })
})

describe('progressionParActe', () => {
  it('répartit les items sur les trois actes', () => {
    const parActe = progressionParActe(items, etat)
    expect(parActe.map((entree) => entree.total)).toEqual([2, 1, 1])
    expect(parActe[0].obtenus).toBe(1)
  })
})

describe('filtres', () => {
  it('filtre par acte, personnage, priorité et statut', () => {
    const parActe = filtrerItems(items, { ...FILTRES_VIDES, acte: '1' }, etat)
    expect(parActe.map((item) => item.id)).toEqual(['a', 'b'])

    const parPersonnage = filtrerItems(items, { ...FILTRES_VIDES, personnage: 'sam' }, etat)
    expect(parPersonnage).toHaveLength(3)

    const parPriorite = filtrerItems(items, { ...FILTRES_VIDES, priorite: 'S+' }, etat)
    expect(parPriorite.map((item) => item.id)).toEqual(['a'])

    const parStatut = filtrerItems(items, { ...FILTRES_VIDES, statut: 'rate' }, etat)
    expect(parStatut.map((item) => item.id)).toEqual(['b'])
  })

  it('cherche dans le nom, le slot et les notes, sans tenir compte de la casse', () => {
    expect(filtrerItems(items, { ...FILTRES_VIDES, recherche: 'FOUDRE' }, etat)).toHaveLength(1)
    expect(filtrerItems(items, { ...FILTRES_VIDES, recherche: 'bottes' }, etat)).toHaveLength(1)
    expect(filtrerItems(items, { ...FILTRES_VIDES, recherche: '   ' }, etat)).toHaveLength(4)
  })

  it('combine les critères', () => {
    const resultat = filtrerItems(
      items,
      { ...FILTRES_VIDES, personnage: 'sam', statut: 'obtenu' },
      etat,
    )
    expect(resultat.map((item) => item.id)).toEqual(['a'])
  })

  it('sait dire si un filtre est actif', () => {
    expect(filtresActifs(FILTRES_VIDES)).toBe(false)
    expect(filtresActifs({ ...FILTRES_VIDES, acte: '2' })).toBe(true)
  })
})

describe('listes de suivi', () => {
  it('remonte les items ratés', () => {
    expect(itemsRates(items, etat).map((item) => item.id)).toEqual(['b'])
  })

  it('remonte les S+/S encore à récupérer, et seulement ceux-là', () => {
    const critiques = itemsCritiques(items, { items: { a: 'obtenu' } })
    expect(critiques.map((item) => item.id)).toEqual(['c'])
  })
})

describe('trierItems', () => {
  it('trie par acte, puis par priorité décroissante, puis par nom', () => {
    const desordre = [items[3], items[2], items[1], items[0]]
    expect(trierItems(desordre).map((item) => item.id)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('ne modifie pas le tableau source', () => {
    const source = [items[3], items[0]]
    trierItems(source)
    expect(source.map((item) => item.id)).toEqual(['d', 'a'])
  })
})

describe('grouperParActe', () => {
  it('regroupe dans l’ordre des actes et omet les actes vides', () => {
    const groupes = grouperParActe([items[3], items[0], items[1]])
    expect(groupes.map((groupe) => groupe.acte.numero)).toEqual([1, 3])
    expect(groupes[0].items.map((item) => item.id)).toEqual(['a', 'b'])
  })

  it('rend un tableau vide pour une sélection vide', () => {
    expect(grouperParActe([])).toEqual([])
  })
})

describe('progressionChecklists', () => {
  const checklists = [
    { acte: 1, entrees: [{ id: 'a1-x' }, { id: 'a1-y' }] },
    { acte: 2, entrees: [{ id: 'a2-x' }] },
  ]

  it('compte les cases cochées par acte et au global', () => {
    const vue = progressionChecklists(checklists, {
      items: {},
      checklist: { 'a1-x': true, 'a2-x': true },
    })
    expect(vue.coches).toBe(2)
    expect(vue.total).toBe(3)
    expect(vue.pourcentage).toBe(67)
    expect(vue.parActe.map((entree) => entree.complet)).toEqual([false, true])
    expect(vue.actesValides).toBe(1)
  })

  it('rattache chaque checklist à son acte', () => {
    const vue = progressionChecklists(checklists, etatInitial())
    expect(vue.parActe[0].acte.nom).toBe('Acte I')
    expect(vue.pourcentage).toBe(0)
  })
})

describe('filtres dans l’URL', () => {
  it('n’écrit que les filtres actifs', () => {
    expect(filtresVersParams(FILTRES_VIDES)).toEqual({})
    expect(filtresVersParams({ ...FILTRES_VIDES, acte: '2', recherche: 'gants' })).toEqual({
      acte: '2',
      recherche: 'gants',
    })
  })

  it('relit une query string et fait l’aller-retour', () => {
    const filtres = { ...FILTRES_VIDES, acte: '3', personnage: 'sam-freeze-thunder', statut: 'rate' }
    const relus = filtresDepuisParams(new URLSearchParams(filtresVersParams(filtres)))
    expect(relus).toEqual(filtres)
  })

  it('ignore une valeur inconnue plutôt que de vider le catalogue', () => {
    const relus = filtresDepuisParams(
      new URLSearchParams({ acte: '9', personnage: 'inconnu', priorite: 'Z', statut: 'volé' }),
    )
    expect(relus).toEqual(FILTRES_VIDES)
  })
})
