/**
 * Section dépliable nommée : l'information longue reste consultable mais ne
 * domine plus le premier écran. Natif (`details`) : clavier et lecteurs
 * d'écran gérés par le navigateur.
 */
export default function Depliant({ id, titre, resume = null, ouvert = false, children }) {
  return (
    <details id={id} open={ouvert || undefined} className="plaque group/dep mt-4 px-5 py-1">
      <summary className="flex min-h-[44px] cursor-pointer list-none flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2">
        <span className="grave text-base tracking-[0.1em]">{titre}</span>
        <span className="flex items-center gap-3 font-rune text-[0.62rem] uppercase tracking-[0.14em] text-gray-400">
          {resume}
          <span aria-hidden="true" className="transition-transform group-open/dep:rotate-90">
            ▸
          </span>
        </span>
      </summary>
      <div className="pb-5 pt-2">{children}</div>
    </details>
  )
}
