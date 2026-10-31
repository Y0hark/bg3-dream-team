import { LIBELLES_MODE, MODES } from '../lib/affichage.js'
import { LIEUX } from '../data/lieux.js'
import { acteDe } from '../data/actes.js'
import useAffichage from '../hooks/useAffichage.jsx'

const DESCRIPTIONS = {
  preparer: 'Comparer, choisir des alternatives, lire les sources.',
  'en-partie': 'L’essentiel de votre zone, sans les justifications.',
}

/**
 * Deux préréglages de lecture des mêmes pages — pas deux applications. Le
 * choix est mémorisé sur cet appareil et ne touche pas à la progression.
 */
export default function BarreMode() {
  const { mode, acte, zone, definirMode } = useAffichage()
  const lieu = LIEUX.find((entree) => entree.id === zone)
  const declare = lieu ? `${acteDe(lieu.acte)?.nom} · ${lieu.nom}` : acte ? acteDe(acte)?.nom : null

  return (
    <div className="border-b border-or-700/20 bg-encre/60" data-barre-mode>
      <div className="mx-auto flex max-w-grimoire flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 sm:px-5">
        <div role="group" aria-label="Mode d’affichage" className="flex gap-2">
          {MODES.map((valeur) => (
            <button
              key={valeur}
              type="button"
              aria-pressed={mode === valeur}
              onClick={() => definirMode(valeur)}
              className={`bouton min-h-[44px] ${mode === valeur ? '!border-or-300 !text-or-100 bg-voile/[0.06]' : ''}`}
            >
              {LIBELLES_MODE[valeur]}
            </button>
          ))}
        </div>
        <p className="min-w-0 flex-1 basis-48 text-xs text-gray-400">
          {DESCRIPTIONS[mode]}
          {mode === 'en-partie' && (
            <>
              {' '}
              <span className="text-gray-300">{declare ? `Vous jouez : ${declare}.` : 'Zone non déclarée.'}</span>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
