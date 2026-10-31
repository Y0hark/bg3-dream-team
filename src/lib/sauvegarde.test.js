import { describe, expect, it } from 'vitest'
import { ITEMS } from '../data/items.js'
import { CHECKLISTS } from '../data/checklists.js'
import {
  analyserBrut,
  aDeLaProgression,
  decisionDistante,
  exporterSauvegarde,
  migrerVersCourant,
} from './sauvegarde.js'
import { completudeLoadout, etatInitial, itemsDuPlan, normaliserEtat, progressionParPersonnage } from './progression.js'
import { affecter, ajouterCopie } from './copies.js'
import { objetDe } from '../data/objets.js'
import { BUILDS } from '../data/builds.js'

const ID_CONNU = 'markoheshkir'
const ID_CHECKLIST = CHECKLISTS[0].entrees[0].id

// Une sauvegarde d'avant la V2 : pas de numéro de schéma, items de l'ancienne équipe.
const HISTORIQUE = {
  items: {
    [ID_CONNU]: 'obtenu',
    'amulet-greater-health': 'rate',
    'mourning-frost': 'obtenu', // objet de l'ancienne équipe, absent du catalogue actif
    'titanstring-bow': 'remplace',
  },
  checklist: { [ID_CHECKLIST]: true, 'a1-ancienne-entree': true },
}

describe('analyserBrut', () => {
  it('reconnaît chaque situation de stockage', () => {
    expect(analyserBrut(null).type).toBe('neuf')
    expect(analyserBrut(undefined).type).toBe('neuf')
    expect(analyserBrut(HISTORIQUE).type).toBe('ancien')
    expect(analyserBrut({ schema: 1, items: {} }).type).toBe('ancien')
    expect(analyserBrut(etatInitial()).type).toBe('courant')
    expect(analyserBrut({ schema: 3 })).toEqual({ type: 'plus-recent', schema: 3 })
  })

  it('juge illisible ce qui n’est pas un objet ou porte un schéma absurde', () => {
    for (const brut of ['texte', 42, [1, 2], true, { schema: 'deux' }, { schema: 0 }, { schema: 1.5 }, { schema: -1 }]) {
      expect(analyserBrut(brut).type, JSON.stringify(brut)).toBe('illisible')
    }
  })
})

describe('migration V1 → V2', () => {
  it('conserve la progression des objets à ID inchangé', () => {
    const { etat, rapport } = migrerVersCourant(HISTORIQUE)
    expect(etat.items[ID_CONNU]).toBe('obtenu')
    expect(etat.items['amulet-greater-health']).toBe('rate')
    expect(rapport.conserves).toBe(2)
  })

  it('range en archive ce que le catalogue actif ne connaît plus, sans rien perdre', () => {
    const { etat, rapport } = migrerVersCourant(HISTORIQUE)
    expect(etat.items).not.toHaveProperty('mourning-frost')
    expect(etat.archive.items).toEqual({ 'mourning-frost': 'obtenu', 'titanstring-bow': 'remplace' })
    expect(rapport.archives).toBe(2)
    expect(rapport.itemsArchives.sort()).toEqual(['mourning-frost', 'titanstring-bow'])
    // Tout ce qui était coché ou statué se retrouve dans l'état ou dans l'archive.
    const retrouves = { ...etat.items, ...etat.archive.items }
    for (const id of Object.keys(HISTORIQUE.items)) expect(retrouves, id).toHaveProperty(id)
  })

  it('migre la checklist par identifiant et archive les entrées disparues', () => {
    const { etat } = migrerVersCourant(HISTORIQUE)
    expect(etat.checklist[ID_CHECKLIST]).toBe(true)
    expect(etat.checklist).not.toHaveProperty('a1-ancienne-entree')
    expect(etat.archive.checklist['a1-ancienne-entree']).toBe(true)
  })

  it('ne transfère jamais l’ancienne équipe vers un nouveau rôle', () => {
    const { etat } = migrerVersCourant({
      items: {},
      checklist: {},
      personnages: ['sam', 'baptiste', 'lilian', 'sidekick'],
      affectations: { 'sam-freeze-thunder': ['markoheshkir'] },
    })
    const brut = JSON.stringify(etat)
    for (const ancien of ['sam-freeze-thunder', 'baptiste-hexblade-spores', 'lilian-arcane-archer', 'sidekick-bard-cleric']) {
      expect(brut).not.toContain(ancien)
    }
    expect(etat.copies).toEqual({})
    expect(Object.keys(etat.copies).length).toBe(0)
  })

  it('est idempotente : migrer deux fois donne la même sauvegarde', () => {
    const une = migrerVersCourant(HISTORIQUE).etat
    const deux = migrerVersCourant(une)
    expect(deux.etat).toEqual(une)
    expect(deux.rapport.archives).toBe(0)
    expect(migrerVersCourant(deux.etat).etat).toEqual(une)
  })

  it('repart d’un état neuf sans lever sur un JSON invalide ou un format incompatible', () => {
    for (const brut of ['pas du json', 42, [], { schema: 'x' }, { schema: 9, items: { a: 'obtenu' } }, null]) {
      const { etat } = migrerVersCourant(brut)
      expect(etat, JSON.stringify(brut)).toEqual(etatInitial())
    }
  })

  it('ignore les statuts inconnus et les types faux, et les signale dans le rapport', () => {
    const { etat, rapport } = migrerVersCourant({
      items: { [ID_CONNU]: 'statut-bizarre', 'amulet-greater-health': 12, 'cloak-of-protection': 'obtenu' },
      checklist: { [ID_CHECKLIST]: 'oui' },
    })
    expect(etat.items).toEqual({ 'cloak-of-protection': 'obtenu' })
    expect(rapport.ignores.sort()).toEqual(['items.amulet-greater-health', `items.${ID_CONNU}`])
    expect(etat.checklist).toEqual({})
  })

  it('traite des identifiants inconnus comme archivés, pas comme erreur', () => {
    const { etat } = migrerVersCourant({ items: { 'objet-fantome': 'obtenu' }, checklist: {} })
    expect(etat.archive.items).toEqual({ 'objet-fantome': 'obtenu' })
  })

  it('ne touche pas à l’objet reçu', () => {
    const copie = JSON.stringify(HISTORIQUE)
    migrerVersCourant(HISTORIQUE)
    expect(JSON.stringify(HISTORIQUE)).toBe(copie)
  })

  it('relit une sauvegarde déjà courante sans la modifier', () => {
    const courante = normaliserEtat({ ...etatInitial(), items: { [ID_CONNU]: 'obtenu' }, archive: { items: { vieux: 'obtenu' }, checklist: {} } })
    expect(migrerVersCourant(courante).etat).toEqual(courante)
  })

  it('sait dire s’il y a quelque chose à perdre', () => {
    expect(aDeLaProgression(etatInitial())).toBe(false)
    expect(aDeLaProgression(migrerVersCourant(HISTORIQUE).etat)).toBe(true)
  })
})

describe('exporter l’ancienne sauvegarde', () => {
  it('embarque la sauvegarde d’origine telle quelle et le schéma courant', () => {
    const texte = exporterSauvegarde(HISTORIQUE, etatInitial())
    const json = JSON.parse(texte)
    expect(json.sauvegardeAvantMigration).toEqual(HISTORIQUE)
    expect(json.schemaCourant).toBe(2)
    expect(json.composition).toBe('honneur-v2')
  })
})

describe('décision face à l’état distant (cloud)', () => {
  const base = { statutLocal: 'ok', localVide: false, majLe: '2026-10-31T10:00:00Z', vuPrecedemment: null }

  it('envoie le local quand le serveur ne connaît pas encore le code', () => {
    expect(decisionDistante({ ...base, distantBrut: null })).toEqual({ action: 'envoyer-local', envoiAuto: true })
  })

  it('applique un état distant au format courant quand un autre appareil a écrit', () => {
    const decision = decisionDistante({ ...base, distantBrut: etatInitial() })
    expect(decision.action).toBe('appliquer-distant')
    expect(decision.envoiAuto).toBe(true)
  })

  it('garde le local quand le serveur n’a rien de neuf', () => {
    const decision = decisionDistante({ ...base, distantBrut: etatInitial(), vuPrecedemment: base.majLe })
    expect(decision.action).toBe('envoyer-local')
  })

  it('n’écrase JAMAIS un format plus récent, ni automatiquement ni en le remplaçant', () => {
    const decision = decisionDistante({ ...base, distantBrut: { schema: 7, items: {} } })
    expect(decision.action).toBe('bloquer')
    expect(decision.raison).toBe('format-plus-recent')
    expect(decision.envoiAuto).toBe(false)
    expect(decision.message.length).toBeGreaterThan(20)
  })

  it('bloque aussi un format illisible, avec une explication', () => {
    const decision = decisionDistante({ ...base, distantBrut: 'n’importe quoi' })
    expect(decision).toMatchObject({ action: 'bloquer', raison: 'illisible', envoiAuto: false })
  })

  it('empêche un ancien état cloud de remplacer silencieusement la sauvegarde migrée', () => {
    const decision = decisionDistante({ ...base, distantBrut: HISTORIQUE })
    expect(decision.action).toBe('bloquer')
    expect(decision.raison).toBe('ancien-client')
    expect(decision.envoiAuto).toBe(false)
  })

  it('migre l’ancien état distant seulement si le local est vide', () => {
    const decision = decisionDistante({ ...base, localVide: true, distantBrut: HISTORIQUE })
    expect(decision.action).toBe('appliquer-distant-migre')
  })

  it('attend la confirmation de migration locale avant toute synchronisation', () => {
    const decision = decisionDistante({ ...base, statutLocal: 'migration-proposee', distantBrut: etatInitial() })
    expect(decision).toMatchObject({ action: 'attendre-migration', envoiAuto: false })
  })

  it('reprend une session sans rien de neuf côté serveur, sans envoyer tant que la migration attend', () => {
    const decision = decisionDistante({
      ...base,
      statutLocal: 'migration-proposee',
      distantBrut: etatInitial(),
      vuPrecedemment: base.majLe,
    })
    expect(decision.envoiAuto).toBe(false)
  })
})

describe('progression du plan et complétude des loadouts', () => {
  it('ne compte pas les variantes optionnelles dans le dénominateur', () => {
    const plan = itemsDuPlan(ITEMS)
    expect(plan.length).toBeLessThan(ITEMS.length)
    expect(plan.every((item) => item.dansLePlan)).toBe(true)
    // Un objet seulement alternatif / situationnel / réserve n'est pas dans le plan.
    expect(ITEMS.find((item) => item.id === 'pearl-of-power-amulet').dansLePlan).toBe(false)
    expect(ITEMS.find((item) => item.id === 'hat-of-fire-acuity').dansLePlan).toBe(true)
  })

  it('compte la progression par rôle sur les objets que le rôle porte, même partagés', () => {
    const etat = { ...etatInitial(), items: { 'cloak-of-protection': 'obtenu' } }
    const parRole = progressionParPersonnage(ITEMS, etat, BUILDS)
    for (const ligne of parRole) {
      expect(ligne.total, ligne.build.id).toBeGreaterThan(0)
      expect(ligne.obtenus, ligne.build.id).toBe(1)
    }
  })

  it('distingue l’original obtenu de l’exemplaire équipé', () => {
    const base = { ...etatInitial(), items: { 'cloak-of-protection': 'obtenu' } }
    const avant = completudeLoadout('sorcier-feu', base, 2)
    expect(avant.equipes).toBe(0)
    expect(avant.aAffecter).toBe(1)
    expect(avant.aAcquerir).toBe(avant.total - 1)

    const protection = objetDe('cloak-of-protection')
    const suivi = affecter(protection, 'obtenu', undefined, 'sorcier-feu').suivi
    const apres = completudeLoadout('sorcier-feu', { ...base, copies: { 'cloak-of-protection': suivi } }, 2)
    expect(apres.equipes).toBe(1)
    // Les trois autres rôles n'ont pas gagné d'équipement pour autant.
    for (const role of ['paladin-hexblade', 'moine-main-ouverte', 'sidekick-savoir-vie']) {
      expect(completudeLoadout(role, { ...base, copies: { 'cloak-of-protection': suivi } }, 2).equipes, role).toBe(0)
    }
  })

  it('ne gonfle pas l’équipement en ajoutant des copies sans les affecter', () => {
    const protection = objetDe('cloak-of-protection')
    const suivi = ajouterCopie(protection, 'obtenu', undefined).suivi
    const etat = { ...etatInitial(), items: { 'cloak-of-protection': 'obtenu' }, copies: { 'cloak-of-protection': suivi } }
    expect(completudeLoadout('sorcier-feu', etat, 2).equipes).toBe(0)
  })

  it('ne compte aucun équipement sans original obtenu, même si le suivi le prétend', () => {
    const etat = {
      ...etatInitial(),
      copies: { 'cloak-of-protection': { exemplaires: 4, affectes: ['sorcier-feu'], copieValidee: true } },
    }
    expect(completudeLoadout('sorcier-feu', etat, 2).equipes).toBe(0)
  })

  it('reste à zéro sur un état vide', () => {
    const vide = completudeLoadout('moine-main-ouverte', etatInitial())
    expect(vide.equipes).toBe(0)
    expect(vide.pourcentage).toBe(0)
    expect(vide.total).toBeGreaterThan(0)
  })
})

describe('copie de secours avant migration', () => {
  const stockageEn = (initial = {}, { refuse = false } = {}) => {
    const magasin = new Map(Object.entries(initial))
    return {
      magasin,
      lire: (cle) => (magasin.has(cle) ? magasin.get(cle) : null),
      ecrire: (cle, valeur) => {
        if (refuse) return false
        magasin.set(cle, valeur)
        return true
      },
    }
  }

  it('écrit la copie de secours avec la sauvegarde d’origine, intacte', async () => {
    const { sauvegarderAvantMigration } = await import('./sauvegarde.js')
    const stockage = stockageEn()
    expect(sauvegarderAvantMigration(HISTORIQUE, stockage)).toEqual({ ok: true, creee: true })
    expect(stockage.magasin.get('bg3-progression-avant-v2')).toEqual(HISTORIQUE)
  })

  it('n’écrase jamais une copie de secours déjà présente', async () => {
    const { sauvegarderAvantMigration } = await import('./sauvegarde.js')
    const stockage = stockageEn({ 'bg3-progression-avant-v2': { items: { premier: 'obtenu' } } })
    expect(sauvegarderAvantMigration(HISTORIQUE, stockage)).toEqual({ ok: true, creee: false })
    expect(stockage.magasin.get('bg3-progression-avant-v2')).toEqual({ items: { premier: 'obtenu' } })
  })

  it('signale l’échec quand le stockage refuse, pour que rien d’autre ne soit écrit', async () => {
    const { sauvegarderAvantMigration } = await import('./sauvegarde.js')
    const stockage = stockageEn({}, { refuse: true })
    expect(sauvegarderAvantMigration(HISTORIQUE, stockage)).toEqual({ ok: false, raison: 'copie-impossible' })
    expect(stockage.magasin.size).toBe(0)
  })
})

describe('reset de la progression', () => {
  it('efface la progression de la composition active mais garde l’archive', async () => {
    const { reinitialiserProgression } = await import('./progression.js')
    const { etat } = migrerVersCourant(HISTORIQUE)
    const reset = reinitialiserProgression(etat)
    expect(reset.items).toEqual({})
    expect(reset.checklist).toEqual({})
    expect(reset.copies).toEqual({})
    expect(reset.archive).toEqual(etat.archive)
    expect(Object.keys(reset.archive.items)).toContain('mourning-frost')
    expect(reset.schema).toBe(2)
  })
})
