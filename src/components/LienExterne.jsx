/**
 * Lien sortant (wiki, carte interactive). Une URL absente affiche
 * « Lien à compléter » : jamais de lien mort dans l'interface.
 */
export default function LienExterne({ href, children, className = '' }) {
  if (!href) {
    return (
      <span
        className={`font-rune text-[0.65rem] uppercase tracking-[0.16em] text-gray-500 ${className}`}
        title="Aucune URL renseignée pour cette entrée"
      >
        Lien à compléter
      </span>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={`group/lien inline-flex items-center gap-1 font-rune text-[0.65rem] uppercase tracking-[0.16em] text-or-500 transition-colors hover:text-or-100 ${className}`}
    >
      {children}
      <span aria-hidden="true" className="transition-transform group-hover/lien:translate-x-0.5">
        ↗
      </span>
    </a>
  )
}
