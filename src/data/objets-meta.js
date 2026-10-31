// ------------------------------------------------------------------
// Métadonnées de localisation, d'icônes et d'usage des objets de objets.js,
// indexées par ID d'objet et fusionnées dans OBJETS (pas un second catalogue :
// un ID absent d'ici garde simplement les valeurs par défaut).
//
// NOMS_FR — { id: { nom, source } } : traduction française OFFICIELLE du nom
// en jeu, avec la source qui l'atteste. Vide tant que rien n'a été vérifié :
// un nom n'est jamais déduit ni inventé. Sans entrée, l'interface retombe sur
// le nom anglais (le nom en jeu), champ par champ.
//
// ICONES — { id: { fichier, source, licence, attribution } } : image locale
// (sous public/icones/) dont la réutilisation est vérifiée. Vide tant que la
// provenance et la licence d'aucune image ne sont clarifiées : l'interface
// affiche alors l'icône de repli du type d'équipement, jamais une image
// récupérée au hasard ni au runtime.
//
// USAGES — étiquettes d'usage d'un objet, d'après son effet décrit dans
// objets.js : degats | defense | mobilite | controle | utilitaire.
// ------------------------------------------------------------------

export const USAGES = ['degats', 'defense', 'mobilite', 'controle', 'utilitaire']

export const NOMS_USAGES = {
  degats: 'Dégâts',
  defense: 'Défense',
  mobilite: 'Mobilité',
  controle: 'Contrôle',
  utilitaire: 'Utilitaire',
}

export const NOMS_FR = {}

export const ICONES = {}

const D = 'degats'
const F = 'defense'
const M = 'mobilite'
const C = 'controle'
const U = 'utilitaire'

export const USAGES_OBJETS = {
  'the-spellsparkler': [D, F],
  'melfs-first-staff': [D],
  markoheshkir: [D, U],
  'staff-of-spellpower': [D, U],
  rhapsody: [D],
  'phalar-aluve': [U, C],
  'unseen-menace': [D],
  'sword-of-justice': [D, F],
  'charge-bound-warhammer': [D],
  'halberd-of-vigilance': [D, U],
  'drakethroat-glaive': [U],
  nyrulna: [D, M],
  'bow-of-awareness': [U],
  'darkfire-shortbow': [F, U],
  'hellrider-longbow': [U],
  'the-dead-shot': [D],
  'sentinel-shield': [F, U],
  'ketherics-shield': [D],
  'the-lifebringer': [F],
  'shadespell-circlet': [D, C],
  'hat-of-fire-acuity': [D, C],
  'fistbreaker-helm': [D, U],
  'hood-of-the-weave': [D],
  birthright: [D, C],
  'pyroquickness-hat': [D],
  'haste-helm': [M],
  'grymskull-helm': [F],
  'mask-of-soul-perception': [D, U],
  'cloak-of-protection': [F],
  'cloak-of-the-weave': [D],
  'cloak-of-displacement': [F],
  'cloak-elemental-absorption': [F],
  'thunderskin-cloak': [C, F],
  'vivacious-cloak': [F],
  'cloak-cunning-brume': [M, F],
  'mantle-holy-warrior': [D, U],
  'protecty-sparkswall': [D, F],
  'robe-exquisite-focus': [D],
  'robe-of-the-weave': [D, F],
  'robe-supreme-defences': [F],
  'armure-adamantine': [F],
  'armour-of-persistence': [F],
  'yuan-ti-scale-mail': [F],
  'the-graceful-cloth': [F, U],
  'vest-soul-rejuvenation': [F],
  'spidersilk-armour': [F],
  'bracers-of-defence': [F],
  'gloves-of-dexterity': [D],
  'daredevil-gloves': [D],
  'spellmight-gloves': [D],
  'helldusk-gloves': [D],
  'flawed-helldusk-gloves': [D],
  'gloves-belligerent-skies': [C],
  'gloves-growling-underdog': [D],
  'legacy-of-the-masters': [D],
  'gloves-sparkle-hands': [D, F],
  'gloves-cinder-sizzle': [D],
  'gloves-soul-catching': [D, F],
  'hellriders-pride': [F, U],
  'reviving-hands': [F, U],
  'disintegrating-night-walkers': [M, F],
  'boots-stormy-clamour': [C],
  'boots-of-speed': [M],
  'boots-of-persistence': [M],
  'boots-aid-comfort': [F],
  'boots-uninhibited-kushigo': [D],
  'amulet-misty-step': [M],
  'pearl-of-power-amulet': [U],
  'spineshudder-amulet': [C, D],
  'spellcrux-amulet': [U],
  'amulet-of-the-harpers': [F],
  'amulet-of-the-devout': [D, U],
  'amulet-greater-health': [F],
  'fey-semblance-amulet': [F],
  'surgeons-subjugation-amulet': [C],
  'periapt-wound-closure': [F, U],
  'broodmothers-revenge': [D],
  'amulet-of-restoration': [U],
  'sentient-amulet-rare': [U],
  'necklace-elemental-augmentation': [D],
  'spell-savant-amulet': [U, D],
  'moondrop-pendant': [M, F],
  'ring-of-protection': [F],
  'crushers-ring': [M],
  'callous-glow-ring': [D],
  'coruscation-ring': [D],
  'ring-mental-inhibition': [C],
  'ring-spiteful-thunder': [C],
  'ring-free-action': [F, M],
  'risky-ring': [D],
  'shadow-cloaked-ring': [D],
  'caustic-band': [D],
  'strange-conduit-ring': [D],
  'killers-sweetheart': [D],
  'ring-arcane-synergy': [D],
  'ring-elemental-infusion': [D],
  'band-mystic-scoundrel': [U],
  'ring-of-regeneration': [F],
  'whispering-promise': [U],
  'cap-of-curing': [U],
  'auntie-ethels-hair': [U],
  'elixir-hill-giant-strength': [D],
  'elixir-cloud-giant-strength': [D],
  'gauntlets-hill-giant-strength': [D],
}
