// Palette d'accent par personnage. Les classes sont écrites en entier :
// Tailwind ne détecte pas les noms de classes construits à la volée.
export const ACCENTS = {
  sky: {
    // Alimente la variable CSS --accent (lueurs, bordures animées). On pointe
    // vers la variable de thème plutôt que des canaux figés : l'accent suit
    // donc la palette active (cf. les blocs [data-theme] de src/index.css).
    rgb: 'var(--c-sky-400)',
    halo: 'from-sky-500/25',
    trait: 'bg-sky-400/70',
    puce: 'border-sky-400/40 text-sky-200/90',
    texte: 'text-sky-200',
    texteVif: 'text-sky-300',
    bord: 'border-sky-400/40',
    bordDoux: 'border-sky-400/20',
    fond: 'bg-sky-500/10',
    fondDoux: 'bg-sky-500/[0.05]',
    barre: 'bg-sky-400/80',
    barreFantome: 'bg-sky-400/25',
  },
  purple: {
    rgb: 'var(--c-purple-400)',
    halo: 'from-purple-500/25',
    trait: 'bg-purple-400/70',
    puce: 'border-purple-400/40 text-purple-200/90',
    texte: 'text-purple-200',
    texteVif: 'text-purple-300',
    bord: 'border-purple-400/40',
    bordDoux: 'border-purple-400/20',
    fond: 'bg-purple-500/10',
    fondDoux: 'bg-purple-500/[0.05]',
    barre: 'bg-purple-400/80',
    barreFantome: 'bg-purple-400/25',
  },
  emerald: {
    rgb: 'var(--c-emerald-400)',
    halo: 'from-emerald-500/25',
    trait: 'bg-emerald-400/70',
    puce: 'border-emerald-400/40 text-emerald-200/90',
    texte: 'text-emerald-200',
    texteVif: 'text-emerald-300',
    bord: 'border-emerald-400/40',
    bordDoux: 'border-emerald-400/20',
    fond: 'bg-emerald-500/10',
    fondDoux: 'bg-emerald-500/[0.05]',
    barre: 'bg-emerald-400/80',
    barreFantome: 'bg-emerald-400/25',
  },
  amber: {
    rgb: 'var(--c-amber-300)',
    halo: 'from-amber-400/25',
    trait: 'bg-amber-300/70',
    puce: 'border-amber-300/40 text-amber-100/90',
    texte: 'text-amber-100',
    texteVif: 'text-amber-200',
    bord: 'border-amber-300/40',
    bordDoux: 'border-amber-300/20',
    fond: 'bg-amber-400/10',
    fondDoux: 'bg-amber-400/[0.05]',
    barre: 'bg-amber-300/80',
    barreFantome: 'bg-amber-300/25',
  },
}

export const ACCENT_DEFAUT = ACCENTS.amber

export function accentDe(build) {
  return ACCENTS[build?.couleurAccent] ?? ACCENT_DEFAUT
}

/**
 * Style inline exposant la couleur d'accent aux animations CSS.
 * Les lueurs et bordures animées lisent `rgb(var(--accent) / …)`.
 */
export function variableAccent(build) {
  return { '--accent': accentDe(build).rgb }
}
