import { libelleActe } from '../data/actes.js'
import { infosStatut } from '../lib/progression.js'

// Classes écrites en entier : Tailwind ne détecte pas les noms construits.
const TEINTES_PRIORITE = {
  'S+': 'border-red-400/50 text-red-200 bg-red-500/10',
  S: 'border-amber-300/50 text-amber-100 bg-amber-400/10',
  A: 'border-sky-400/45 text-sky-200 bg-sky-500/10',
  B: 'border-or-700/40 text-gray-400',
}

const TEINTES_ACTE = {
  1: 'border-emerald-400/40 text-emerald-200',
  2: 'border-purple-400/40 text-purple-200',
  3: 'border-amber-300/40 text-amber-100',
}

const socle =
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-rune text-[0.62rem] uppercase tracking-[0.14em]'

/** Badge d'acte — volontairement gros : il doit se lire à distance. */
export function BadgeActe({ numero, className = '' }) {
  return (
    <span className={`${socle} ${TEINTES_ACTE[numero] ?? 'border-or-700/40 text-gray-400'} ${className}`}>
      {libelleActe(numero)}
    </span>
  )
}

export function BadgePriorite({ priorite, className = '' }) {
  const critique = priorite === 'S+'
  return (
    <span
      className={`${socle} ${critique ? 'sceau-critique' : ''} ${
        TEINTES_PRIORITE[priorite] ?? 'border-or-700/40 text-gray-400'
      } ${className}`}
      title={critique ? 'Priorité maximale : à ne pas rater' : undefined}
    >
      {priorite}
    </span>
  )
}

export function BadgeStatut({ statut, className = '' }) {
  const infos = infosStatut(statut)
  return (
    <span className={`${socle} ${infos.puce} ${className}`}>
      <span aria-hidden="true">{infos.icone}</span>
      {infos.nom}
    </span>
  )
}
