/**
 * Gouttière de progression. `teinte` est une classe de fond complète
 * (cf. src/lib/accents.js) pour que Tailwind la détecte à la compilation.
 */
export default function BarreProgression({
  valeur,
  total,
  pourcentage,
  libelle,
  detail,
  teinte = 'bg-or-300/80',
  className = '',
}) {
  const part =
    typeof pourcentage === 'number'
      ? pourcentage
      : total > 0
        ? Math.round((valeur / total) * 100)
        : 0

  return (
    <div className={className}>
      {(libelle || detail) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          {libelle && <span className="glyphe text-or-300">{libelle}</span>}
          {detail && <span className="font-rune text-[0.7rem] text-gray-400">{detail}</span>}
        </div>
      )}
      <div
        className="gouttiere"
        role="progressbar"
        aria-valuenow={part}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={libelle ? `${libelle} : ${part} %` : `Progression : ${part} %`}
      >
        <span className={teinte} style={{ width: `${part}%` }} />
      </div>
    </div>
  )
}
