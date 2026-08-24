import { describe, expect, it } from 'vitest'
import { genererCode, normaliserCode, nuageConfigure } from './nuage.js'

// Le format des codes est aussi contraint côté base (contrainte CHECK et
// garde dans enregistrer_progression) : les deux doivent rester d'accord.
const FORMAT_BASE = /^[a-z0-9-]{6,48}$/

describe('normaliserCode', () => {
  it('nettoie casse, espaces, accents et ponctuation', () => {
    expect(normaliserCode('  Grimoire Ardente 472 ')).toBe('grimoire-ardente-472')
    expect(normaliserCode('Sombreterre_Dorée!!42')).toBe('sombreterre-doree-42')
    expect(normaliserCode('--baldur--gate--')).toBe('baldur-gate')
  })

  it('refuse ce qui ne peut pas être un code', () => {
    expect(normaliserCode('abc')).toBeNull()
    expect(normaliserCode('   ')).toBeNull()
    expect(normaliserCode('!!!')).toBeNull()
    expect(normaliserCode(null)).toBeNull()
    expect(normaliserCode('x'.repeat(49))).toBeNull()
  })

  it('est idempotent sur un code déjà propre', () => {
    expect(normaliserCode('grimoire-ardente-472')).toBe('grimoire-ardente-472')
  })
})

describe('genererCode', () => {
  it('produit des codes acceptés par la base et par la normalisation', () => {
    for (let essai = 0; essai < 50; essai += 1) {
      const code = genererCode()
      expect(code).toMatch(FORMAT_BASE)
      expect(normaliserCode(code)).toBe(code)
    }
  })
})

describe('nuageConfigure', () => {
  it('vaut vrai dès qu\'une URL et une clé sont présentes', () => {
    expect(nuageConfigure()).toBe(true)
  })
})
