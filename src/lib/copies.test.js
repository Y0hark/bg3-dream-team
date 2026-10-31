import { describe, expect, it } from 'vitest'
import { LOADOUTS } from '../data/loadouts.js'
import { objetDe } from '../data/objets.js'
import {
  affecter,
  ajouterCopie,
  alertesExclusivite,
  besoinsObjet,
  copiePossible,
  depassementsSlots,
  etatCopies,
  normaliserSuivi,
} from './copies.js'

const PROTECTION = objetDe('cloak-of-protection')
const CHEVEU = objetDe('auntie-ethels-hair')
const CHAPEAU = objetDe('hat-of-fire-acuity')
const COPIES = { copiesAutorisees: true }
const SANS_COPIES = { copiesAutorisees: false }

describe('besoins par objet', () => {
  it('compte les rôles qui portent l’objet en principal à un acte donné', () => {
    expect(besoinsObjet('cloak-of-protection', 2).sort()).toEqual([
      'moine-main-ouverte',
      'paladin-hexblade',
      'sidekick-savoir-vie',
      'sorcier-feu',
    ])
    // À l'acte I la cape n'est pas encore obtenable : personne ne la porte.
    expect(besoinsObjet('cloak-of-protection', 1)).toEqual([])
    // Une alternative n'est pas un besoin : la cape n'est qu'alternative à l'acte III.
    expect(besoinsObjet('cloak-of-protection', 3)).toEqual([])
  })
})

describe('original, exemplaires et équipement effectif', () => {
  const besoins = besoinsObjet('cloak-of-protection', 2)

  it('n’équipe pas les quatre rôles parce que l’original est obtenu', () => {
    const etat = etatCopies(PROTECTION, 'obtenu', undefined, besoins, COPIES)
    expect(etat.exemplaires).toBe(1)
    expect(etat.affectes).toEqual([])
    expect(etat.libres).toBe(1)
    expect(etat.besoinRestant).toHaveLength(4)
  })

  it('ne compte aucun exemplaire tant que l’original n’est pas obtenu', () => {
    for (const statut of ['a-recuperer', 'rate', 'remplace']) {
      const etat = etatCopies(PROTECTION, statut, { exemplaires: 3, affectes: ['sorcier-feu'] }, besoins, COPIES)
      expect(etat.exemplaires, statut).toBe(0)
      expect(etat.affectes, statut).toEqual([])
      expect(etat.libres, statut).toBe(0)
    }
  })

  it('refuse d’affecter plus de rôles qu’il n’y a d’exemplaires libres', () => {
    const premier = affecter(PROTECTION, 'obtenu', undefined, 'sorcier-feu', COPIES)
    expect(premier.ok).toBe(true)
    const second = affecter(PROTECTION, 'obtenu', premier.suivi, 'paladin-hexblade', COPIES)
    expect(second).toEqual({ ok: false, raison: 'aucun-exemplaire-libre' })
  })

  it('suit des copies : chaque exemplaire ajouté libère une affectation', () => {
    let suivi = affecter(PROTECTION, 'obtenu', undefined, 'sorcier-feu', COPIES).suivi
    suivi = ajouterCopie(PROTECTION, 'obtenu', suivi, COPIES).suivi
    suivi = affecter(PROTECTION, 'obtenu', suivi, 'paladin-hexblade', COPIES).suivi
    const etat = etatCopies(PROTECTION, 'obtenu', suivi, besoins, COPIES)
    expect(etat.exemplaires).toBe(2)
    expect(etat.affectes).toEqual(['sorcier-feu', 'paladin-hexblade'])
    expect(etat.libres).toBe(0)
    expect(etat.besoinRestant.sort()).toEqual(['moine-main-ouverte', 'sidekick-savoir-vie'])
  })

  it('ne surcompte jamais les affectations au-delà des exemplaires disponibles', () => {
    const suivi = { exemplaires: 2, affectes: ['a', 'b', 'c', 'd'], copieValidee: true }
    const etat = etatCopies(PROTECTION, 'obtenu', suivi, besoins, COPIES)
    expect(etat.affectes).toHaveLength(2)
    expect(etat.libres).toBe(0)
  })

  it('affecter deux fois le même rôle ne consomme pas un second exemplaire', () => {
    const une = affecter(PROTECTION, 'obtenu', undefined, 'sorcier-feu', COPIES)
    const deux = affecter(PROTECTION, 'obtenu', une.suivi, 'sorcier-feu', COPIES)
    expect(deux.ok).toBe(true)
    expect(etatCopies(PROTECTION, 'obtenu', deux.suivi, besoins, COPIES).libres).toBe(0)
  })

  it('ne demande à valider une copie que s’il y en a une', () => {
    const seul = etatCopies(PROTECTION, 'obtenu', { exemplaires: 1, copieValidee: true }, besoins, COPIES)
    expect(seul.copieAValider).toBe(false)
    expect(seul.copieValidee).toBe(false)
    const copie = etatCopies(PROTECTION, 'obtenu', { exemplaires: 2 }, besoins, COPIES)
    expect(copie.copieAValider).toBe(true)
    const validee = etatCopies(PROTECTION, 'obtenu', { exemplaires: 2, copieValidee: true }, besoins, COPIES)
    expect(validee.copieValidee).toBe(true)
  })
})

describe('original raté et autre source', () => {
  it('bloque la copie sans autre source documentée', () => {
    expect(copiePossible(PROTECTION, 'rate', COPIES)).toBe('non')
    expect(ajouterCopie(PROTECTION, 'rate', undefined, COPIES)).toEqual({ ok: false, raison: 'copie-impossible' })
  })

  it('laisse une autre source documentée rouvrir la porte', () => {
    expect(copiePossible(CHAPEAU, 'rate', COPIES)).toBe('autre-source')
    expect(copiePossible(CHAPEAU, 'obtenu', COPIES)).toBe('oui')
    expect(copiePossible(CHAPEAU, 'a-recuperer', COPIES)).toBe('non')
  })
})

describe('ce que les copies ne dupliquent pas', () => {
  it('ne duplique pas le Cheveu, même avec un suivi qui prétend le contraire', () => {
    const etat = etatCopies(CHEVEU, 'obtenu', { exemplaires: 4, affectes: ['sorcier-feu', 'paladin-hexblade'] }, [], COPIES)
    expect(etat.exemplaires).toBe(1)
    expect(etat.affectes).toEqual(['sorcier-feu'])
    expect(ajouterCopie(CHEVEU, 'obtenu', undefined, COPIES).ok).toBe(false)
  })

  it('revient à un exemplaire par objet quand les copies sont désactivées', () => {
    const etat = etatCopies(PROTECTION, 'obtenu', { exemplaires: 4 }, besoinsObjet('cloak-of-protection', 2), SANS_COPIES)
    expect(etat.exemplaires).toBe(1)
    expect(copiePossible(PROTECTION, 'obtenu', SANS_COPIES)).toBe('non')
  })
})

describe('alertes d’exclusivité', () => {
  it('ne lève aucune fausse alerte quand les copies sont activées', () => {
    expect(alertesExclusivite(LOADOUTS, COPIES)).toEqual([])
  })

  it('retrouve les conflits historiques quand les copies sont désactivées', () => {
    const alertes = alertesExclusivite(LOADOUTS, SANS_COPIES)
    const cape = alertes.find((alerte) => alerte.objet === 'cloak-of-protection' && alerte.acte === 2)
    expect(cape.roles).toHaveLength(4)
    expect(alertes.map((alerte) => alerte.objet)).toContain('disintegrating-night-walkers')
  })

  it('garde l’alerte pour un objet non copiable recommandé à deux rôles', () => {
    const lignes = [
      { role: 'sorcier-feu', acte: 1, jusquA: 3, slot: 'Consommable', objet: 'auntie-ethels-hair', rang: 'principal' },
      { role: 'moine-main-ouverte', acte: 1, jusquA: 3, slot: 'Consommable', objet: 'auntie-ethels-hair', rang: 'principal' },
    ]
    expect(alertesExclusivite(lignes, COPIES).map((alerte) => alerte.objet)).toEqual([
      'auntie-ethels-hair',
      'auntie-ethels-hair',
      'auntie-ethels-hair',
    ])
  })
})

describe('slots : une copie ne fait pas porter deux amulettes', () => {
  it('ne signale aucun dépassement dans les loadouts livrés', () => {
    for (const role of ['sorcier-feu', 'paladin-hexblade', 'moine-main-ouverte', 'sidekick-savoir-vie']) {
      for (const acte of [1, 2, 3]) expect(depassementsSlots(role, acte), `${role} ${acte}`).toEqual([])
    }
  })

  it('détecte deux amulettes et trois anneaux en principal', () => {
    const lignes = [
      { role: 'r', acte: 1, jusquA: null, slot: 'Amulette', objet: 'spineshudder-amulet', rang: 'principal' },
      { role: 'r', acte: 1, jusquA: null, slot: 'Amulette', objet: 'amulet-greater-health', rang: 'principal' },
      { role: 'r', acte: 1, jusquA: null, slot: 'Anneau', objet: 'caustic-band', rang: 'principal' },
      { role: 'r', acte: 1, jusquA: null, slot: 'Anneau', objet: 'crushers-ring', rang: 'principal' },
      { role: 'r', acte: 1, jusquA: null, slot: 'Anneau', objet: 'ring-of-protection', rang: 'principal' },
      { role: 'r', acte: 1, jusquA: null, slot: 'Amulette', objet: 'pearl-of-power-amulet', rang: 'reserve' },
    ]
    const depassements = depassementsSlots('r', 1, lignes)
    expect(depassements.map((d) => d.slot).sort()).toEqual(['Amulette', 'Anneau'])
    expect(depassements.find((d) => d.slot === 'Amulette').nombre).toBe(2)
  })
})

describe('normaliserSuivi', () => {
  it('absorbe les valeurs inconnues, partielles ou corrompues', () => {
    expect(normaliserSuivi(null)).toEqual({ exemplaires: 0, affectes: [], copieValidee: false })
    expect(normaliserSuivi('x')).toEqual({ exemplaires: 0, affectes: [], copieValidee: false })
    expect(normaliserSuivi({ exemplaires: -3, affectes: [1, 'a', 'a'], copieValidee: 'oui' })).toEqual({
      exemplaires: 0,
      affectes: ['a'],
      copieValidee: false,
    })
    expect(normaliserSuivi({ exemplaires: 5000 }).exemplaires).toBe(99)
  })
})
