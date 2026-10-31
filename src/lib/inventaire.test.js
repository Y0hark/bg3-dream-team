import { describe, expect, it } from 'vitest'
import { BUILDS, BUILDS_ANCIENS } from '../data/builds.js'
import { LIMITES_SLOTS, SLOTS_REQUIS } from '../data/loadouts.js'
import { actionClavier } from '../components/Dialogue.jsx'
import { vuesCaracteristiques } from '../components/PanneauCaracteristiques.jsx'
import { avecChoix, cleChoix, normaliserChoix } from './alternatives.js'
import {
  ORDRE_SLOTS,
  SEUIL_ALTERNATIVES,
  avertissementsCompatibilite,
  ficheObjet,
  inventaireRole,
  optionsVisibles,
  usagesDisponibles,
} from './inventaire.js'
import { etatInitial, normaliserEtat } from './progression.js'

const ROLES = BUILDS.map((build) => build.id)
const ACTES = [1, 2, 3]

describe('inventaire par rôle et par acte', () => {
  it.each(ROLES.flatMap((role) => ACTES.map((acte) => [role, acte])))('%s, acte %i : slots requis couverts', (role, acte) => {
    const emplacements = inventaireRole(role, acte, etatInitial())
    const slots = new Set(emplacements.map((entree) => entree.slot))
    for (const slot of SLOTS_REQUIS) expect(slots.has(slot)).toBe(true)
    // Les slots à deux exemplaires ont deux emplacements distincts.
    expect(emplacements.filter((entree) => entree.slot === 'Anneau')).toHaveLength(LIMITES_SLOTS.Anneau)
    expect(emplacements.map((entree) => ORDRE_SLOTS.indexOf(entree.slot))).toEqual(
      [...emplacements.map((entree) => ORDRE_SLOTS.indexOf(entree.slot))].sort((a, b) => a - b),
    )
  })

  it('ne porte jamais deux fois le même objet dans un slot', () => {
    for (const role of ROLES) {
      for (const acte of ACTES) {
        const portes = inventaireRole(role, acte, etatInitial())
          .map((entree) => entree.courante?.objet)
          .filter(Boolean)
        expect(new Set(portes).size).toBe(portes.length)
      }
    }
  })

  it('un emplacement sans objet voulu est « vide » ; sinon « prévu », jamais « équipé » par défaut', () => {
    const etats = ROLES.flatMap((role) => ACTES.flatMap((acte) => inventaireRole(role, acte, etatInitial()).map((e) => e.etat)))
    expect(etats).toContain('vide')
    expect(etats).toContain('prevu')
    expect(etats).not.toContain('equipe')
    expect(etats).not.toContain('disponible')
  })

  it('distingue prévu, disponible (original obtenu) et équipé (exemplaire affecté)', () => {
    const base = inventaireRole('sorcier-feu', 2, etatInitial())
    const casque = base.find((entree) => entree.slot === 'Casque')
    const objet = casque.courante.objet
    expect(casque.etat).toBe('prevu')

    const obtenu = { ...etatInitial(), items: { [objet]: 'obtenu' } }
    expect(inventaireRole('sorcier-feu', 2, obtenu).find((e) => e.slot === 'Casque').etat).toBe('disponible')

    const equipe = { ...obtenu, copies: { [objet]: { exemplaires: 1, affectes: ['sorcier-feu'], copieValidee: false } } }
    expect(inventaireRole('sorcier-feu', 2, equipe).find((e) => e.slot === 'Casque').etat).toBe('equipe')
    // Équipé pour un autre rôle : pas équipé pour celui-ci.
    const autre = { ...obtenu, copies: { [objet]: { exemplaires: 1, affectes: ['moine-main-ouverte'], copieValidee: false } } }
    expect(inventaireRole('sorcier-feu', 2, autre).find((e) => e.slot === 'Casque').etat).toBe('disponible')
  })

  it('un objet conservé d’un acte précédent reste visible et signalé', () => {
    const conserves = ACTES.slice(1).flatMap((acte) =>
      ROLES.flatMap((role) => inventaireRole(role, acte, etatInitial()).filter((e) => e.conserveDepuis)),
    )
    expect(conserves.length).toBeGreaterThan(0)
    for (const entree of conserves) expect(entree.conserveDepuis).toBeLessThan(entree.courante.acte + 1)
  })
})

describe('choix d’alternatives', () => {
  const role = 'sorcier-feu'
  const acte = 2

  it('choisir une alternative change le plan, jamais la possession ni l’équipement', () => {
    const avant = etatInitial()
    const casque = inventaireRole(role, acte, avant).find((entree) => entree.slot === 'Casque')
    const alternative = casque.options.find((option) => option.rang === 'alternative')
    const apres = {
      ...avant,
      choixAlternatives: avecChoix(avant.choixAlternatives, role, acte, 'Casque', 0, alternative.objet, casque.reference.objet),
    }
    const nouveau = inventaireRole(role, acte, apres).find((entree) => entree.slot === 'Casque')
    expect(nouveau.courante.objet).toBe(alternative.objet)
    expect(nouveau.choisie).toBe(true)
    expect(nouveau.reference.objet).toBe(casque.reference.objet)
    expect(apres.items).toEqual(avant.items)
    expect(apres.copies).toEqual(avant.copies)
    expect(nouveau.etat).toBe('prevu')
  })

  it('revenir à la référence supprime la clé', () => {
    const choix = avecChoix({}, role, acte, 'Casque', 0, 'fistbreaker-helm', 'hat-of-fire-acuity')
    expect(choix).toEqual({ [cleChoix(role, acte, 'Casque')]: 'fistbreaker-helm' })
    expect(avecChoix(choix, role, acte, 'Casque', 0, null)).toEqual({})
    expect(avecChoix(choix, role, acte, 'Casque', 0, 'hat-of-fire-acuity', 'hat-of-fire-acuity')).toEqual({})
  })

  it('un choix est propre à son acte et à son rôle', () => {
    const choix = avecChoix({}, role, acte, 'Casque', 0, 'fistbreaker-helm', 'hat-of-fire-acuity')
    const etat = { ...etatInitial(), choixAlternatives: choix }
    expect(inventaireRole(role, 3, etat).find((e) => e.slot === 'Casque').choisie).toBe(false)
    expect(inventaireRole('moine-main-ouverte', acte, etat).every((e) => !e.choisie)).toBe(true)
  })

  it('un anneau a une clé par emplacement et n’est jamais porté deux fois', () => {
    expect(cleChoix(role, acte, 'Anneau', 0)).toBe('sorcier-feu|2|Anneau')
    expect(cleChoix(role, acte, 'Anneau', 1)).toBe('sorcier-feu|2|Anneau#2')
    const anneaux = inventaireRole(role, acte, etatInitial()).filter((e) => e.slot === 'Anneau')
    const [un, deux] = anneaux
    expect(un.options.map((o) => o.objet)).not.toContain(deux.courante.objet)
    expect(deux.options.map((o) => o.objet)).not.toContain(un.courante.objet)

    const libre = anneaux[0].options.find((option) => option.objet !== un.courante.objet)
    const choix = avecChoix({}, role, acte, 'Anneau', 1, deux.options.find((o) => o.objet !== deux.courante.objet && o.objet !== un.courante.objet)?.objet ?? libre.objet, deux.reference.objet)
    const apres = inventaireRole(role, acte, { ...etatInitial(), choixAlternatives: choix }).filter((e) => e.slot === 'Anneau')
    expect(apres[0].courante.objet).not.toBe(apres[1].courante.objet)
  })

  it('ignore à la lecture les clés invalides sans rien casser', () => {
    const lu = normaliserChoix({
      'sorcier-feu|2|Casque': 'fistbreaker-helm',
      'sorcier-feu|2|Casque#2': 'fistbreaker-helm',
      'sorcier-feu|2|Anneau#3': 'ring-of-protection',
      'sorcier-feu|2|Anneau#1': 'ring-of-protection',
      'fantome|2|Casque': 'fistbreaker-helm',
      'sorcier-feu|2|Casque_': 12,
    })
    expect(lu).toEqual({ 'sorcier-feu|2|Casque': 'fistbreaker-helm' })
  })

  it('survit à un aller-retour de sauvegarde et à une ancienne sauvegarde sans le champ', () => {
    const choix = avecChoix({}, 'sorcier-feu', 2, 'Casque', 0, 'fistbreaker-helm', 'hat-of-fire-acuity')
    const relu = normaliserEtat(JSON.parse(JSON.stringify({ ...etatInitial(), choixAlternatives: choix })))
    expect(relu.choixAlternatives).toEqual(choix)
    expect(normaliserEtat({ items: { 'fistbreaker-helm': 'obtenu' } }).choixAlternatives).toEqual({})
  })
})

describe('options par emplacement', () => {
  const casque = inventaireRole('sorcier-feu', 3, etatInitial()).find((entree) => entree.slot === 'Casque')

  it('montre la référence puis au plus trois alternatives, le reste derrière « Voir toutes »', () => {
    expect(casque.options.length).toBeGreaterThan(SEUIL_ALTERNATIVES + 1)
    const visibles = optionsVisibles(casque.options)
    expect(visibles[0]).toBe(casque.reference)
    expect(visibles.filter((option) => option.rang !== 'principal')).toHaveLength(SEUIL_ALTERNATIVES)
    expect(optionsVisibles(casque.options, { toutes: true })).toHaveLength(casque.options.length)
  })

  it('le filtre d’usage conserve la référence et n’expose que des usages existants', () => {
    const usages = usagesDisponibles(casque.options)
    expect(usages.length).toBeGreaterThan(0)
    for (const usage of usages) {
      const filtrees = optionsVisibles(casque.options, { toutes: true, usage })
      expect(filtrees[0]).toBe(casque.reference)
      for (const option of filtrees.filter((o) => o.rang !== 'principal')) expect(option.usages).toContain(usage)
    }
  })

  it('chaque option porte une phrase comparative ou, pour la référence, son intérêt', () => {
    for (const option of casque.options) {
      expect(option.rang === 'principal' ? option.interet : option.comparaison).toBeTruthy()
    }
  })
})

describe('fiche et compatibilité', () => {
  it('la fiche donne effet, acquisition et jamais de champ vide pour l’acquisition', () => {
    for (const role of ROLES) {
      for (const emplacement of inventaireRole(role, 3, etatInitial())) {
        const fiche = ficheObjet(emplacement.courante)
        if (!emplacement.courante?.objet) {
          expect(fiche).toBeNull()
          continue
        }
        expect(fiche.nom).toBeTruthy()
        expect(fiche.effet).toBeTruthy()
        expect(fiche.acquisition.length).toBeGreaterThan(0)
      }
    }
  })

  it('n’affirme aucune compatibilité arme / bouclier / mains libres', () => {
    const tous = ROLES.flatMap((role) =>
      ACTES.flatMap((acte) => avertissementsCompatibilite(role, inventaireRole(role, acte, etatInitial()))),
    )
    for (const texte of tous) expect(texte).not.toMatch(/compatible\s+avec|est compatible/i)
    const moine = avertissementsCompatibilite('moine-main-ouverte', [{ slot: 'Arme', courante: { objet: 'x' } }])
    expect(moine.join(' ')).toMatch(/mains libres/)
  })
})

describe('boîte de dialogue au clavier', () => {
  it('Échap ferme', () => {
    expect(actionClavier({ touche: 'Escape', indice: 2, total: 5 })).toEqual({ type: 'fermer' })
  })
  it('Tab boucle du dernier au premier, Maj+Tab du premier au dernier', () => {
    expect(actionClavier({ touche: 'Tab', indice: 4, total: 5 })).toEqual({ type: 'focus', cible: 0 })
    expect(actionClavier({ touche: 'Tab', majuscule: true, indice: 0, total: 5 })).toEqual({ type: 'focus', cible: 4 })
    expect(actionClavier({ touche: 'Tab', indice: 1, total: 5 })).toBeNull()
    expect(actionClavier({ touche: 'Tab', indice: -1, total: 0 })).toBeNull()
  })
})

describe('vues de caractéristiques', () => {
  it('la création est toujours distincte ; les autres vues n’existent que si les données existent', () => {
    for (const build of BUILDS) {
      const vues = vuesCaracteristiques(build).map((vue) => vue.id)
      expect(vues[0]).toBe('creation')
      expect(vues.includes('equipement')).toBe((build.caracteristiques.fixees ?? []).length > 0)
      expect(vues.includes('respec')).toBe((build.caracteristiques.variantes ?? []).length > 0)
      expect(vues.includes('export')).toBe(Boolean(build.export?.caracteristiques))
    }
    const paladin = vuesCaracteristiques(BUILDS.find((build) => build.id === 'paladin-hexblade')).map((vue) => vue.id)
    expect(paladin).toEqual(expect.arrayContaining(['creation', 'progression', 'respec', 'export']))
  })

  it('une ancienne composition n’a qu’une vue « valeurs de la fiche »', () => {
    expect(vuesCaracteristiques(BUILDS_ANCIENS[0]).map((vue) => vue.id)).toEqual(['fiche'])
  })
})
