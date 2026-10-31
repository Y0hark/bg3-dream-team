import { createElement } from 'react'
import { readFileSync, existsSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import App from './App.jsx'
import { ACTES } from './data/actes.js'
import { BUILDS, BUILDS_ANCIENS } from './data/builds.js'
import { CHECKLISTS, PRIORITES_ENTREE, estRequise } from './data/checklists.js'
import { ITEMS } from './data/items.js'
import { LIEUX, lieuDe } from './data/lieux.js'
import { LOADOUTS, loadoutsDe } from './data/loadouts.js'
import { OBJETS, objetDe } from './data/objets.js'
import { RISQUES } from './data/risques.js'
import { affecter, ajouterCopie } from './lib/copies.js'
import { chargerDistant, enregistrerDistant } from './lib/nuage.js'
import { donsParNiveau, plafondsSorts, totauxClasses } from './lib/niveaux.js'
import {
  completudeLoadout,
  compter,
  compterChecklist,
  etatInitial,
  itemsDuPlan,
  progressionChecklists,
} from './lib/progression.js'
import { decisionDistante, migrerVersCourant } from './lib/sauvegarde.js'

const ROLES = BUILDS.map((build) => build.id)
const LECTURE = (chemin) => readFileSync(new URL(chemin, import.meta.url), 'utf8')

function navigateur() {
  const magasin = new Map()
  const stockage = {
    getItem: (cle) => (magasin.has(cle) ? magasin.get(cle) : null),
    setItem: (cle, valeur) => magasin.set(cle, valeur),
    removeItem: (cle) => magasin.delete(cle),
  }
  globalThis.document = { documentElement: { dataset: {} } }
  globalThis.window = { matchMedia: () => ({ matches: false }), localStorage: stockage }
  globalThis.localStorage = stockage
  return magasin
}

function rendre(route, basename) {
  return renderToString(
    createElement(MemoryRouter, { initialEntries: [route], basename }, createElement(App)),
  )
}

describe('checklists de la nouvelle composition', () => {
  const entrees = CHECKLISTS.flatMap((liste) => liste.entrees.map((entree) => ({ ...entree, acte: liste.acte })))

  it('donnent une checklist par acte, avec des IDs stables, uniques et propres à la V2', () => {
    expect(CHECKLISTS.map((liste) => liste.acte)).toEqual(ACTES.map((acte) => acte.numero))
    const ids = entrees.map((entree) => entree.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id, id).toMatch(/^v2-a[123]-[a-z-]+$/)
    for (const entree of entrees) expect(entree.id.startsWith(`v2-a${entree.acte}-`), entree.id).toBe(true)
  })

  it('décrit chaque entrée : priorité, raison de ne pas attendre, rôles / objet / lieu valides', () => {
    for (const entree of entrees) {
      expect(PRIORITES_ENTREE, entree.id).toContain(entree.priorite)
      expect(entree.texte.length, entree.id).toBeGreaterThan(0)
      expect(entree.raison.length, `${entree.id} sans raison`).toBeGreaterThan(0)
      for (const role of entree.roles) expect(ROLES, entree.id).toContain(role)
      if (entree.objet) expect(objetDe(entree.objet), `objet orphelin ${entree.id}`).not.toBeNull()
      if (entree.lieu) expect(lieuDe(entree.lieu), `lieu orphelin ${entree.id}`).not.toBeNull()
    }
  })

  it('ne rattache un objet à un acte qu’après une source existante', () => {
    for (const entree of entrees.filter((e) => e.objet)) {
      const objet = objetDe(entree.objet)
      // Une entrée d'anticipation agit avant l'obtention (laisser un PNJ vivre en Acte I).
      if (entree.anticipation) continue
      expect(
        objet.sources.some((source) => source.acte <= entree.acte),
        `${entree.id} : ${entree.objet} n’est pas obtenable à l’acte ${entree.acte}`,
      ).toBe(true)
      if (entree.lieu) expect(lieuDe(entree.lieu).acte, entree.id).toBeLessThanOrEqual(entree.acte)
    }
  })

  it('distingue obligatoire, rattrapable, optionnel — et en garde dans chaque acte', () => {
    for (const liste of CHECKLISTS) {
      const priorites = new Set(liste.entrees.map((entree) => entree.priorite))
      expect(priorites, `acte ${liste.acte}`).toContain('obligatoire')
      expect(liste.entrees.some((entree) => !estRequise(entree)), `acte ${liste.acte}`).toBe(true)
    }
  })

  it('documente une alternative pour tout obligatoire lié à un objet critique ou à un point de non-retour', () => {
    // Un objet raté ne doit pas afficher la run entière comme impossible.
    for (const entree of entrees.filter((e) => e.priorite === 'obligatoire' && e.objet)) {
      const objet = objetDe(entree.objet)
      const aUnRattrapage = objet.sources.some((source) => source.rattrapage)
      expect(
        Boolean(entree.alternative) || aUnRattrapage,
        `${entree.id} obligatoire sans alternative documentée`,
      ).toBe(true)
    }
  })

  it('ne bloque pas un acte sur les entrées facultatives', () => {
    const acte1 = CHECKLISTS[0]
    const obligatoires = acte1.entrees.filter(estRequise).map((entree) => entree.id)
    const etat = { ...etatInitial(), checklist: Object.fromEntries(obligatoires.map((id) => [id, true])) }
    const compte = compterChecklist(acte1, etat)
    expect(compte.complet).toBe(true)
    expect(compte.pourcentage).toBe(100)
    expect(compte.optionnelles).toBeGreaterThan(0)
    expect(compte.optionnellesCochees).toBe(0)
    // Cocher une facultative seule ne valide rien.
    const facultative = acte1.entrees.find((entree) => !estRequise(entree)).id
    expect(compterChecklist(acte1, { ...etatInitial(), checklist: { [facultative]: true } }).complet).toBe(false)
    expect(progressionChecklists(CHECKLISTS, etat).actesValides).toBe(1)
  })

  it('encode chaque point imposé par le ticket', () => {
    const par = (id) => entrees.find((entree) => entree.id === id)
    // Acte 1
    expect(par('v2-a1-elixirs')).toMatchObject({ roles: ['moine-main-ouverte'], lieu: 'antre-ethel', priorite: 'obligatoire' })
    expect(par('v2-a1-cheveu').roles).toEqual(['sorcier-feu'])
    expect(par('v2-a1-spellsparkler').objet).toBe('the-spellsparkler')
    expect(par('v2-a1-whispering-promise').objet).toBe('whispering-promise')
    expect(par('v2-a1-hellriders-pride').objet).toBe('hellriders-pride')
    expect(par('v2-a1-boeuf').texte).toMatch(/bœuf vivre au Bosquet/)
    expect(par('v2-a1-copies').priorite).toBe('obligatoire')
    // Acte 2
    expect(par('v2-a2-chapeau').texte).toMatch(/Dammon/)
    expect(par('v2-a2-spineshudder').objet).toBe('spineshudder-amulet')
    expect(par('v2-a2-prisonniers').priorite).toBe('obligatoire')
    // Transition vers l'acte 3
    expect(par('v2-a3-kushigo')).toMatchObject({
      moment: 'transition',
      priorite: 'obligatoire',
      objet: 'boots-uninhibited-kushigo',
      lieu: 'plan-astral',
      roles: ['moine-main-ouverte'],
    })
    expect(par('v2-a3-kushigo').texte).toMatch(/avant de repartir/)
    // Acte 3
    expect(par('v2-a3-ferg').lieu).toBe('rivington')
    expect(par('v2-a3-nyrulna').lieu).not.toBe(par('v2-a3-mystic-scoundrel').objet)
    expect(par('v2-a3-mystic-scoundrel').objet).toBe('band-mystic-scoundrel')
    expect(par('v2-a3-reviving-hands').objet).toBe('reviving-hands')
    expect(par('v2-a3-hope').priorite).toBe('optionnel')
    expect(par('v2-a3-hope').raison).toMatch(/pas une obligation|options?/)
  })

  it('place le transit Kushigo en tête de l’acte III, avant les achats', () => {
    expect(CHECKLISTS[2].entrees[0].id).toBe('v2-a3-kushigo')
  })
})

describe('cohérence gameplay sensible', () => {
  it('ne donne aucun sort de niveau 6 connu ni Aide native au Sidekick 10/2', () => {
    const sidekick = BUILDS.find((build) => build.id === 'sidekick-savoir-vie')
    const plafonds = plafondsSorts(totauxClasses(sidekick.ordre))
    expect(plafonds.sortConnuMax).toBeLessThan(plafonds.emplacementMax)
    const texte = [...sidekick.leveling.map((p) => p.gains), ...sidekick.secrets.flatMap((s) => s.sorts)].join(' ')
    expect(texte).not.toMatch(/\bAide\b/)
    expect(texte).not.toMatch(/Restauration partielle/)
  })

  it('n’accorde ni Aura de protection ni Attaque supplémentaire du Paladin au 4/8', () => {
    const paladin = BUILDS.find((build) => build.id === 'paladin-hexblade')
    const totaux = totauxClasses(paladin.ordre)
    expect(totaux.Paladin).toBeLessThan(5) // Attaque supplémentaire : Paladin 5
    expect(totaux.Paladin).toBeLessThan(6) // Aura de protection : Paladin 6
    for (const palier of paladin.leveling) {
      expect(palier.gains.replace(/pas d’Aura de protection/gi, '')).not.toMatch(/Aura de protection/)
      expect(palier.gains).not.toMatch(/Attaque supplémentaire/)
    }
    // La seconde attaque vient du Pacte approfondi, à Occultiste 5.
    expect(paladin.leveling.find((p) => p.classe === 'Occultiste 5').gains).toMatch(/Pacte approfondi/)
  })

  it('n’impose pas Mouillé au Sorcier feu : ni Création d’eau dans son plan, ni setup eau / foudre', () => {
    const sorcier = BUILDS.find((build) => build.id === 'sorcier-feu')
    const plan = [...sorcier.leveling.map((p) => p.gains), ...sorcier.boucle].join(' ')
    expect(plan).not.toMatch(/Création d’eau/)
    expect(plan).not.toMatch(/Mouillé/)
    expect(sorcier.vigilance.join(' ')).toMatch(/Mouillé n’est pas un buff au feu/)
    expect(RISQUES.find((risque) => risque.id === 'mouille').roles).toEqual(['sorcier-feu'])
  })

  it('n’a qu’un élixir principal actif et garde l’élixir de Force propre au Moine', () => {
    for (const role of ROLES) {
      for (const acte of [1, 2, 3]) {
        const consommables = loadoutsDe(role, acte).filter((l) => l.slot === 'Consommable' && l.rang === 'principal')
        expect(consommables.length, `${role} acte ${acte}`).toBeLessThanOrEqual(1)
      }
    }
    const roles = (id) => LOADOUTS.filter((l) => l.objet === id).map((l) => l.role)
    expect(new Set(roles('elixir-hill-giant-strength'))).toEqual(new Set(['moine-main-ouverte']))
    expect(objetDe('elixir-hill-giant-strength').effet).toMatch(/incompatible avec Soif de sang ou Vigilance/)
  })

  it('traite Hâte comme une action de sort, avec une seule concentration par personnage', () => {
    const risque = RISQUES.find((r) => r.id === 'hate')
    expect(risque.texte).toMatch(/une seule concentration/i)
    expect(risque.texte).toMatch(/Léthargie/)
    expect(risque.texte).toMatch(/action de sort/)
  })

  it('garde les bonus d’arme hors des poings et des sorts (Moine, Sorcier)', () => {
    for (const ligne of LOADOUTS.filter((l) => ['moine-main-ouverte', 'sorcier-feu'].includes(l.role) && l.objet)) {
      expect(['caustic-band', 'strange-conduit-ring', 'broodmothers-revenge'], `${ligne.role}/${ligne.objet}`).not.toContain(
        ligne.objet,
      )
    }
    const moine = BUILDS.find((b) => b.id === 'moine-main-ouverte')
    expect(moine.vigilance.join(' ')).toMatch(/Caustic Band, Strange Conduit, Broodmother’s Revenge/)
  })

  it('traite chaque risque comme une donnée vérifiable ou un rappel éditorial déclaré', () => {
    const ids = RISQUES.map((risque) => risque.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const risque of RISQUES) {
      expect(['bloquant', 'attention'], risque.id).toContain(risque.gravite)
      expect(['donnees', 'editorial'], risque.id).toContain(risque.verifie)
      for (const role of risque.roles) expect(ROLES, risque.id).toContain(role)
      expect(risque.texte.length, risque.id).toBeGreaterThan(20)
    }
    // Les risques de l'ancienne équipe ne guident plus la run.
    for (const id of ['tempete', 'archer-arcanique', 'sorlock']) expect(ids).not.toContain(id)
  })

  it('ne garde aucun terme de l’ancienne composition dans les données actives', () => {
    const actif = JSON.stringify({ BUILDS, OBJETS, LOADOUTS, CHECKLISTS, RISQUES, LIEUX, ITEMS })
    const interdits = [
      /Freeze Thunder/,
      /Frontliner/,
      /Archer Arcanique|Arcane Archer/,
      /Gloom Stalker/,
      /Sorlock/,
      /Titanstring/,
      /Winter’s Clutches/,
      /Mourning Frost/,
      /Cercle des Spores/,
      /Tempestuous/,
    ]
    for (const motif of interdits) expect(actif, String(motif)).not.toMatch(motif)
    for (const nom of ['Sam', 'Baptiste', 'Lilian']) expect(actif, nom).not.toMatch(new RegExp(`\\b${nom}\\b`))
    // Ils vivent bien, eux, dans l'ancienne composition archivée.
    expect(JSON.stringify(BUILDS_ANCIENS)).toMatch(/Freeze Thunder/)
  })
})

describe('recette — nouvelle run', () => {
  it('parcourt composition, builds, actes, loadouts et lieux sans référence cassée', () => {
    for (const build of BUILDS) {
      expect(build.leveling).toHaveLength(12)
      for (const acte of [1, 2, 3]) {
        const lignes = loadoutsDe(build.id, acte)
        expect(lignes.length, `${build.id} acte ${acte}`).toBeGreaterThan(0)
        for (const ligne of lignes.filter((l) => l.objet)) {
          const objet = objetDe(ligne.objet)
          for (const source of objet.sources) if (source.lieu) expect(lieuDe(source.lieu)).not.toBeNull()
        }
      }
    }
  })

  it('marque un original puis affecte des copies sans double comptage', () => {
    const protection = objetDe('cloak-of-protection')
    let etat = { ...etatInitial(), items: { 'cloak-of-protection': 'obtenu' } }
    const equipes = () => ROLES.map((role) => completudeLoadout(role, etat, 2).equipes)

    expect(equipes()).toEqual([0, 0, 0, 0]) // l'original seul n'équipe personne

    const suivi = (copies) => etat.copies['cloak-of-protection'] ?? copies
    let r = affecter(protection, 'obtenu', undefined, 'sorcier-feu')
    etat = { ...etat, copies: { 'cloak-of-protection': r.suivi } }
    expect(equipes()).toEqual([1, 0, 0, 0])

    expect(affecter(protection, 'obtenu', suivi(), 'paladin-hexblade').ok).toBe(false) // pas d'exemplaire libre

    for (const role of ['paladin-hexblade', 'moine-main-ouverte', 'sidekick-savoir-vie']) {
      etat = { ...etat, copies: { 'cloak-of-protection': ajouterCopie(protection, 'obtenu', suivi()).suivi } }
      r = affecter(protection, 'obtenu', suivi(), role)
      etat = { ...etat, copies: { 'cloak-of-protection': r.suivi } }
    }
    expect(equipes()).toEqual([1, 1, 1, 1])
    expect(etat.copies['cloak-of-protection'].exemplaires).toBe(4)
    // L'acquisition, elle, n'a compté qu'un original.
    expect(compter(itemsDuPlan(ITEMS), etat).obtenus).toBe(1)
  })

  it('ne gonfle pas la progression quand on ajoute des variantes optionnelles', () => {
    const plan = itemsDuPlan(ITEMS)
    const principaux = new Set(LOADOUTS.filter((l) => l.rang === 'principal' && l.objet).map((l) => l.objet))
    expect(plan.map((item) => item.id).sort()).toEqual([...principaux].sort())
    const nonPlan = ITEMS.filter((item) => !item.dansLePlan)
    expect(nonPlan.length).toBeGreaterThan(0)
    // Obtenir toutes les options ne fait pas bouger le dénominateur du plan.
    const tout = { ...etatInitial(), items: Object.fromEntries(nonPlan.map((item) => [item.id, 'obtenu'])) }
    expect(compter(plan, tout).obtenus).toBe(0)
    expect(compter(plan, tout).total).toBe(plan.length)
  })
})

describe('recette — ancienne run', () => {
  it('propose la migration, garde la sauvegarde récupérable et ne remappe aucun ancien rôle', () => {
    const ancien = {
      items: { markoheshkir: 'obtenu', 'amulet-greater-health': 'rate', 'titanstring-bow': 'obtenu', 'mourning-frost': 'obtenu' },
      checklist: { 'a1-niveau': true, 'a2-shar': true },
    }
    const copie = JSON.stringify(ancien)
    const { etat, rapport } = migrerVersCourant(ancien)
    expect(JSON.stringify(ancien)).toBe(copie)
    expect(etat.items).toEqual({ markoheshkir: 'obtenu', 'amulet-greater-health': 'rate' })
    expect(Object.keys(etat.archive.items).sort()).toEqual(['mourning-frost', 'titanstring-bow'])
    // Les cases de checklist de l'ancienne équipe ne valident rien de la nouvelle.
    expect(etat.checklist).toEqual({})
    expect(Object.keys(etat.archive.checklist).sort()).toEqual(['a1-niveau', 'a2-shar'])
    expect(rapport.checklistArchivee).toBe(2)
    expect(migrerVersCourant(etat).etat).toEqual(etat)
  })
})

describe('recette — hors ligne et cloud absent ou en panne', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('échoue proprement quand le serveur est injoignable, sans toucher à l’état local', async () => {
    vi.stubGlobal('fetch', () => Promise.reject(new TypeError('network')))
    await expect(chargerDistant('code-de-run')).rejects.toThrow('Serveur injoignable')
    await expect(enregistrerDistant('code-de-run', etatInitial())).rejects.toThrow('Serveur injoignable')
  })

  it('échoue proprement sur une réponse d’erreur du serveur', async () => {
    vi.stubGlobal('fetch', () => Promise.resolve({ ok: false, status: 503, json: async () => ({}) }))
    await expect(chargerDistant('code-de-run')).rejects.toThrow(/503/)
  })

  it('n’annonce jamais « synchronisé » pour un état distant bloqué', () => {
    for (const distantBrut of [{ schema: 5 }, 'x', { items: {} }]) {
      const decision = decisionDistante({
        statutLocal: 'ok',
        localVide: false,
        distantBrut,
        majLe: '2026-10-31T10:00:00Z',
        vuPrecedemment: null,
      })
      expect(decision.action).toBe('bloquer')
      expect(decision.envoiAuto).toBe(false)
    }
  })

  it('reste utilisable sans configuration cloud : toutes les routes se rendent', () => {
    navigateur()
    for (const route of ['/', '/builds', '/loadout', '/items', '/lieux', '/checklist', '/archive']) {
      expect(rendre(route).length, route).toBeGreaterThan(200)
    }
  })
})

describe('liens profonds et sous-chemin GitHub Pages', () => {
  beforeEach(() => navigateur())

  it('sert chaque route sous un sous-chemin /bg3-dream-team/ avec ses filtres en URL (base alternative)', () => {
    const html = rendre('/bg3-dream-team/loadout?acte=3&role=moine-main-ouverte', '/bg3-dream-team')
    expect(html).toContain('Boots of Uninhibited Kushigo')
    const items = rendre('/bg3-dream-team/items?personnage=moine-main-ouverte', '/bg3-dream-team')
    expect(items).toContain('Boots of Uninhibited Kushigo')
    expect(items).not.toContain('The Spellsparkler')
    const filtre = rendre('/bg3-dream-team/items?acte=1&priorite=S%2B', '/bg3-dream-team')
    expect(filtre.length).toBeGreaterThan(200)
  })

  it('retombe sur « Page introuvable » pour une route inconnue, sans casser le shell', () => {
    const html = rendre('/bg3-dream-team/n-importe-quoi', '/bg3-dream-team')
    expect(html).toContain('Page introuvable')
    expect(html).toContain('Dashboard')
  })

  it('ne dépend d’aucun paramètre inconnu : un filtre périmé retombe sur « tous »', () => {
    const html = rendre('/items?acte=9&statut=renomme&personnage=inconnu&priorite=Z')
    expect(html).toContain('Items de la run')
    expect(html).not.toContain('Aucun item ne correspond')
  })

  it('rend aussi les routes à la racine du domaine personnalisé (configuration actuelle)', () => {
    const html = rendre('/loadout?acte=3&role=moine-main-ouverte')
    expect(html).toContain('Boots of Uninhibited Kushigo')
    expect(rendre('/builds/moine-main-ouverte')).toContain('Moine Main ouverte')
  })

  it('garde le déploiement tel quel : base, repli 404 et tests avant mise en ligne', () => {
    const vite = LECTURE('../vite.config.js')
    const base = vite.match(/base:\s*'([^']*)'/)?.[1]
    expect(base).toBeDefined()
    // Le README décrit la base réellement configurée — il ne décrit plus l'ancienne.
    expect(LECTURE('../README.md')).toContain(`\`base\` vaut \`${base}\``)
    expect(existsSync(new URL('../scripts/pages-404.mjs', import.meta.url))).toBe(true)
    expect(LECTURE('../scripts/pages-404.mjs')).toMatch(/404\.html/)
    const workflow = LECTURE('../.github/workflows/deploy.yml')
    expect(workflow).toMatch(/npm test/)
    expect(workflow).toMatch(/npm run build/)
    // Les tests tournent AVANT l'envoi à Pages.
    expect(workflow.indexOf('npm test')).toBeLessThan(workflow.indexOf('upload-pages-artifact'))
  })
})

describe('README', () => {
  const readme = LECTURE('../README.md')

  it('décrit la composition actuelle et plus l’ancienne', () => {
    for (const mot of ['Sorcier feu', 'Paladin', 'Moine', 'Sidekick']) expect(readme).toContain(mot)
    for (const mot of ['Freeze Thunder', 'Arcane Archer', 'Gloom Stalker', 'Cercle des Spores']) {
      expect(readme).not.toContain(mot)
    }
    expect(readme).not.toMatch(/\bSam\b|\bBaptiste\b|\bLilian\b/)
  })

  it('annonce des comptes qui correspondent aux données', () => {
    const nombre = (motif) => Number(readme.match(motif)?.[1])
    expect(nombre(/\*\*(\d+) objets\*\*/)).toBe(OBJETS.length)
    expect(nombre(/\*\*(\d+) lieux\*\*/)).toBe(LIEUX.length)
    expect(nombre(/\*\*(\d+) lignes de loadout\*\*/)).toBe(LOADOUTS.length)
  })

  it('documente les routes réellement présentes', () => {
    const app = LECTURE('./App.jsx')
    for (const [, chemin] of app.matchAll(/path="(\/[a-z/:]*)"/g)) {
      const cle = chemin.replace('/:id', '')
      if (cle === '') continue
      expect(readme, chemin).toContain(`\`${chemin}\``)
    }
  })

  it('documente les clés de stockage, le schéma et la migration', () => {
    for (const mot of ['bg3-progression', 'bg3-progression-avant-v2', 'bg3-code-run', 'schéma', 'copie de secours', 'archive']) {
      expect(readme, mot).toContain(mot)
    }
  })

  it('ne promet ni déploiement ni test en jeu', () => {
    expect(readme).toMatch(/non testées? en jeu|pas testées? en jeu/i)
    expect(readme).toMatch(/hotfix/)
  })

  it('cite uniquement des scripts npm qui existent', () => {
    const scripts = JSON.parse(LECTURE('../package.json')).scripts
    for (const [, nom] of readme.matchAll(/npm run ([a-z:-]+)/g)) expect(Object.keys(scripts), nom).toContain(nom)
  })
})

describe('mêmes dons, mêmes plafonds : recoupement final des quatre fiches', () => {
  it('garde les nombres de dons annoncés par les fiches', () => {
    const dons = Object.fromEntries(BUILDS.map((build) => [build.id, donsParNiveau(build.ordre).length]))
    expect(dons).toEqual({
      'sorcier-feu': 3,
      'paladin-hexblade': 3,
      'moine-main-ouverte': 3,
      'sidekick-savoir-vie': 2,
    })
  })
})
