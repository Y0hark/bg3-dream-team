import { describe, expect, it } from 'vitest'
import { BUILDS, buildDe } from '../data/builds.js'
import { ITEMS } from '../data/items.js'
import { LOADOUTS } from '../data/loadouts.js'
import { OBJETS, objetDe } from '../data/objets.js'
import { USAGES } from '../data/objets-meta.js'
import {
  actesAcquisition,
  actesRecommandes,
  cleChoix,
  lignesSansContexte,
  natureDe,
  normaliserChoix,
  optionsDuSlot,
} from './alternatives.js'
import { etapesCaracteristiques, valeurDe } from './etapes-caracteristiques.js'
import { couvertureIcones, iconeDe, iconeValide, repliDe } from './icones.js'
import {
  champLocalise,
  couvertureFrancaise,
  correspondRecherche,
  descriptionObjet,
  nomObjet,
  nomsObjet,
} from './localisation.js'
import { etatInitial, filtrerItems, FILTRES_VIDES, normaliserEtat } from './progression.js'

describe('repli FR/EN champ par champ', () => {
  it('retombe sur l’anglais pour un champ français absent, vide ou blanc', () => {
    expect(champLocalise({ fr: 'Épée', en: 'Sword' })).toEqual({ texte: 'Épée', langue: 'fr' })
    for (const fr of [undefined, null, '', '   ']) {
      expect(champLocalise({ fr, en: 'Sword' })).toEqual({ texte: 'Sword', langue: 'en' })
    }
    expect(champLocalise({ fr: '', en: '' })).toBeNull()
  })

  it('est indépendant d’un champ à l’autre (nom FR présent, description absente)', () => {
    const objet = { nom: 'Rhapsody', nomFr: 'Rhapsodie', sourceNomFr: 'jeu', effet: '', effetEn: 'Light dagger' }
    expect(nomObjet(objet)).toEqual({ texte: 'Rhapsodie', langue: 'fr', officiel: true })
    expect(descriptionObjet(objet)).toMatchObject({ texte: 'Light dagger', langue: 'en' })
  })

  it('ne marque jamais un nom FR sans source comme officiel et n’affiche jamais undefined', () => {
    expect(nomObjet({ nom: 'Rhapsody', nomFr: 'Rhapsodie' }).officiel).toBe(false)
    for (const objet of OBJETS) {
      const nom = nomObjet(objet)
      expect(nom.texte).not.toMatch(/undefined|null/)
      expect(nom.texte.length).toBeGreaterThan(0)
      expect(descriptionObjet(objet).texte).not.toMatch(/undefined/)
    }
  })

  it('garde le nom anglais consultable à côté du nom français', () => {
    expect(nomsObjet({ nom: 'Rhapsody', nomFr: 'Rhapsodie' })).toEqual({ principal: 'Rhapsodie', secondaire: 'Rhapsody' })
    expect(nomsObjet({ nom: 'Rhapsody' })).toEqual({ principal: 'Rhapsody', secondaire: null })
    expect(nomsObjet({})).toEqual({ principal: '', secondaire: null })
  })

  it('documente la couverture avec numérateur, dénominateur et exceptions', () => {
    const couverture = couvertureFrancaise()
    expect(couverture.total).toBe(OBJETS.length)
    expect(couverture.descriptions).toBe(OBJETS.length)
    expect(couverture.nomsOfficiels + couverture.sansNomOfficiel.length).toBe(couverture.total)
  })
})

describe('recherche bilingue', () => {
  const rhapsody = { nom: 'Rhapsody', nomFr: 'Rhapsodie évanouie', slot: 'Arme' }

  it('trouve par le nom français, le nom anglais, sans accent ni casse', () => {
    expect(correspondRecherche(rhapsody, 'rhapsodie evanouie')).toBe(true)
    expect(correspondRecherche(rhapsody, 'RHAPSODY')).toBe(true)
    expect(correspondRecherche(rhapsody, 'évanouie')).toBe(true)
    expect(correspondRecherche(rhapsody, 'introuvable')).toBe(false)
    expect(correspondRecherche(rhapsody, '  ')).toBe(true)
  })

  it('est utilisée par le filtre du catalogue', () => {
    const items = [{ id: 'a', nom: 'Rhapsody', nomFr: 'Rhapsodie évanouie', slot: 'Arme', acte: 1 }]
    const trouve = (recherche) => filtrerItems(items, { ...FILTRES_VIDES, recherche }, etatInitial()).length
    expect(trouve('evanouie')).toBe(1)
    expect(trouve('rhapsody')).toBe(1)
    expect(trouve('zzz')).toBe(0)
  })
})

describe('icônes', () => {
  it('replie sur l’icône du type quand aucune image vérifiée n’existe', () => {
    const icone = iconeDe({ slot: 'Anneau', icone: null })
    expect(icone.src).toBeNull()
    expect(icone.repli).toBe(repliDe('Anneau'))
    expect(repliDe('Inconnu')).toBeTruthy()
  })

  it('refuse une image sans provenance, licence ou attribution complètes', () => {
    expect(iconeValide({ fichier: 'a.webp' })).toBe(false)
    const complete = { fichier: 'a.webp', source: 's', licence: 'l', attribution: 'a' }
    expect(iconeValide(complete)).toBe(true)
    expect(iconeDe({ slot: 'Arme', icone: complete }, '/base/').src).toBe('/base/icones/a.webp')
    expect(iconeDe({ slot: 'Arme', icone: { fichier: 'a.webp' } }).src).toBeNull()
  })

  it('couvre chaque slot du catalogue par une icône de repli', () => {
    for (const objet of OBJETS) expect(repliDe(objet.slot)).not.toBe('❖')
    const couverture = couvertureIcones()
    expect(couverture.avecIcone + couverture.sansIcone.length).toBe(couverture.total)
  })
})

describe('identifiants stables et vue dérivée', () => {
  it('garde le même ID d’objet entre catalogue et vue des pages', () => {
    for (const item of ITEMS) expect(objetDe(item.id)?.nom).toBe(item.nom)
    expect(new Set(OBJETS.map((objet) => objet.id)).size).toBe(OBJETS.length)
  })

  it('ne dépend ni du nom traduit ni de l’acte pour l’ID', () => {
    const avant = OBJETS.map((objet) => objet.id)
    const traduit = OBJETS.map((objet) => ({ ...objet, nomFr: 'Autre nom' })).map((objet) => objet.id)
    expect(traduit).toEqual(avant)
    for (const id of avant) expect(id).toMatch(/^[a-z0-9-]+$/)
  })

  it('donne à chaque objet au moins un usage connu', () => {
    for (const objet of OBJETS) {
      expect(objet.usages.length).toBeGreaterThan(0)
      for (const usage of objet.usages) expect(USAGES).toContain(usage)
    }
  })

  it('couvre tous les objets des loadouts actifs', () => {
    for (const ligne of LOADOUTS) if (ligne.objet) expect(objetDe(ligne.objet)).not.toBeNull()
  })
})

describe('alternatives par rôle, acte et slot', () => {
  it('distingue référence, équivalente, situationnelle et transition par le rang', () => {
    expect(natureDe({ rang: 'principal' })).toBe('reference')
    expect(natureDe({ rang: 'alternative' })).toBe('equivalente')
    expect(natureDe({ rang: 'situationnel' })).toBe('situationnelle')
    expect(natureDe({ rang: 'reserve' })).toBe('transition')
  })

  it('sépare acte d’acquisition et actes recommandés', () => {
    const ligne = { acte: 1, jusquA: 3 }
    expect(actesRecommandes(ligne)).toEqual([1, 2, 3])
    expect(actesRecommandes({ acte: 2 })).toEqual([2])
    // Un objet d’acte 1 reste recommandé en acte 3 dans les données réelles.
    const longue = LOADOUTS.find((l) => l.objet && actesRecommandes(l).length > 1 && actesAcquisition(l.objet)[0] < Math.max(...actesRecommandes(l)))
    expect(longue).toBeTruthy()
  })

  it('renvoie des options étiquetées avec comparaison pour les non-références', () => {
    const options = optionsDuSlot('sorcier-feu', 1, 'Casque')
    const reference = options.find((o) => o.nature === 'reference')
    const alternative = options.find((o) => o.nature === 'equivalente')
    expect(reference.comparaison).toBeNull()
    expect(alternative.comparaison).toContain('Référence')
    expect(alternative.usages.length).toBeGreaterThan(0)
  })

  it('signale les alternatives sans contexte explicite plutôt que de les déclarer équivalentes', () => {
    const sans = lignesSansContexte()
    expect(Array.isArray(sans)).toBe(true)
    for (const ligne of sans) expect(ligne.rang).toBe('alternative')
  })

  it('ne déduit aucune équivalence de la rareté', () => {
    for (const objet of OBJETS) expect(objet).not.toHaveProperty('rarete')
  })

  it('valide les choix stockés sans jamais lever ni réinitialiser', () => {
    const ligne = LOADOUTS.find((l) => l.rang === 'alternative' && l.objet)
    const cle = cleChoix(ligne.role, ligne.acte, ligne.slot)
    expect(normaliserChoix({ [cle]: ligne.objet })).toEqual({ [cle]: ligne.objet })
    expect(normaliserChoix({ [cle]: 'objet-inconnu', 'x|9|Arme': 'a', mauvais: 3 })).toEqual({})
    for (const brut of [null, undefined, [], 'x', 3]) expect(normaliserChoix(brut)).toEqual({})
  })

  it('relit un état sans choix (ancienne sauvegarde) et conserve les choix valides', () => {
    expect(normaliserEtat({ items: { x: 'obtenu' } }).choixAlternatives).toEqual({})
    const ligne = LOADOUTS.find((l) => l.rang === 'alternative' && l.objet)
    const cle = cleChoix(ligne.role, ligne.acte, ligne.slot)
    expect(normaliserEtat({ choixAlternatives: { [cle]: ligne.objet } }).choixAlternatives).toEqual({ [cle]: ligne.objet })
  })

  it('un choix d’alternative ne touche ni la possession ni l’équipement', () => {
    const ligne = LOADOUTS.find((l) => l.rang === 'alternative' && l.objet)
    const cle = cleChoix(ligne.role, ligne.acte, ligne.slot)
    const etat = normaliserEtat({ items: { [ligne.objet]: 'obtenu' }, choixAlternatives: { [cle]: ligne.objet } })
    expect(etat.items).toEqual({ [ligne.objet]: 'obtenu' })
    expect(etat.copies).toEqual({})
  })
})

describe('étapes de caractéristiques', () => {
  it('Paladin : CHA 16 à la création, 18 avec un seul +2, Alerte ne donne pas 20', () => {
    const paladin = buildDe('paladin-hexblade')
    const etapes = etapesCaracteristiques(paladin)
    expect(etapes.creation.CHA).toBe(16)
    expect(etapes.progression.at(-1).valeurs.CHA).toBe(18)
    expect(etapes.export.CHA).toBe(18)
    expect(etapes.equipees.every((e) => e.stat !== 'CHA')).toBe(true)
  })

  it('Paladin : la respécialisation reste distincte de l’export', () => {
    const etapes = etapesCaracteristiques(buildDe('paladin-hexblade'))
    expect(etapes.respecialisations).toHaveLength(1)
    expect(etapes.respecialisations[0].final.CHA).toBe(20)
    expect(etapes.export.CHA).toBe(18)
    expect(etapes.respecialisations[0].condition).toMatch(/distincte de l’export/)
  })

  it('Moine : FOR naturelle ≠ FOR sous élixir, sans FOR élevée implicite', () => {
    const moine = buildDe('moine-main-ouverte')
    const sans = etapesCaracteristiques(moine)
    expect(sans.creation.FOR).toBe(8)
    expect(sans.equipees.every((e) => e.effective === null && e.selectionnee === false)).toBe(true)
    expect(valeurDe(moine.caracteristiques, 'FOR', 12)).toMatchObject({ naturelle: 8, effective: 8, dependDUnChoix: true })

    const collines = etapesCaracteristiques(moine, { selection: { fixees: ['elixir-geant-collines'] } })
    expect(collines.equipees.find((e) => e.id === 'elixir-geant-collines')).toMatchObject({ naturelle: 8, fixee: 21, effective: 21 })
    expect(collines.equipees.find((e) => e.id === 'elixir-geant-nuages').effective).toBeNull()
    expect(valeurDe(moine.caracteristiques, 'FOR', 12, { fixees: ['elixir-geant-nuages'] })).toMatchObject({ naturelle: 8, effective: 27, dependDUnChoix: false })
  })

  it('ne double jamais une valeur fixée avec un bonus de don (CON du Moine)', () => {
    const moine = buildDe('moine-main-ouverte')
    const sante = etapesCaracteristiques(moine, { selection: { fixees: ['greater-health'] } }).equipees.find((e) => e.id === 'greater-health')
    expect(sante.naturelle).toBe(16)
    expect(sante.effective).toBe(23)
  })

  it('Sorcier : le Cheveu n’agit que s’il est choisi, une seule fois', () => {
    const sorcier = buildDe('sorcier-feu')
    const sans = etapesCaracteristiques(sorcier)
    expect(sans.permanents[0]).toMatchObject({ id: 'cheveu-ethel', obtenu: false })
    expect(sans.progression.at(-1).valeurs.CHA).toBe(20)
    // Route Cheveu : CHA 17 à la création, +2 au niveau 4, +1 permanent seulement une fois choisi.
    const routeCheveu = sorcier.caracteristiques.variantes.find((v) => v.id === 'route-cheveu')
    const avec = { ...routeCheveu, bonusPermanents: sorcier.caracteristiques.bonusPermanents }
    expect(valeurDe(avec, 'CHA', 4).effective).toBe(19)
    expect(valeurDe(avec, 'CHA', 4, { permanents: ['cheveu-ethel'] }).effective).toBe(20)
  })

  it('porte un état de vérification et une référence sur chaque valeur fixée', () => {
    for (const build of BUILDS) {
      for (const fixe of build.caracteristiques.fixees ?? []) {
        expect(['fiche', 'a-confirmer', 'verifie']).toContain(fixe.verification)
        expect(fixe.reference).toMatch(/^https:\/\//)
      }
    }
  })
})
