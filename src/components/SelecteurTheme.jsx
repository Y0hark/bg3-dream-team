import { useEffect, useRef, useState } from 'react'
import useTheme from '../hooks/useTheme.js'
import { THEMES, themeDe } from '../lib/themes.js'

const FAMILLES = [
  { cle: 'sombre', titre: 'Veillée' },
  { cle: 'clair', titre: 'Grand jour' },
]

/** Trois pastilles empilées : fond, métal, accent du thème. */
function Echantillon({ teintes, taille = 'h-2.5 w-2.5' }) {
  return (
    <span aria-hidden="true" className="flex items-center gap-1">
      {teintes.map((teinte) => (
        <span
          key={teinte}
          className={`${taille} rounded-full border border-voile/[0.18]`}
          style={{ backgroundColor: teinte }}
        />
      ))}
    </span>
  )
}

export default function SelecteurTheme() {
  const [theme, changerTheme] = useTheme()
  const [ouvert, setOuvert] = useState(false)
  const conteneur = useRef(null)
  const bouton = useRef(null)

  const actuel = themeDe(theme)

  // Fermeture au clic extérieur et à l'échappement, avec retour du focus.
  useEffect(() => {
    if (!ouvert) return

    function auClic(evenement) {
      if (!conteneur.current?.contains(evenement.target)) setOuvert(false)
    }
    function auClavier(evenement) {
      if (evenement.key !== 'Escape') return
      setOuvert(false)
      bouton.current?.focus()
    }

    document.addEventListener('mousedown', auClic)
    document.addEventListener('keydown', auClavier)
    return () => {
      document.removeEventListener('mousedown', auClic)
      document.removeEventListener('keydown', auClavier)
    }
  }, [ouvert])

  return (
    <div ref={conteneur} className="relative">
      <button
        ref={bouton}
        type="button"
        onClick={() => setOuvert((etat) => !etat)}
        aria-haspopup="menu"
        aria-expanded={ouvert}
        aria-label={`Thème : ${actuel.nom}. Changer de thème`}
        className="flex items-center gap-2 rounded-full border border-or-700/40 px-2.5 py-1.5 transition-colors duration-300 hover:border-or-500/70 sm:px-3"
      >
        <Echantillon teintes={actuel.echantillon} />
        <span className="glyphe hidden text-or-300 lg:block">{actuel.nom}</span>
      </button>

      {ouvert && (
        <div
          role="menu"
          aria-label="Thèmes"
          className="plaque absolute right-0 top-full z-50 mt-2 w-72 origin-top-right p-2"
        >
          {FAMILLES.map((famille) => (
            <div key={famille.cle} className="mb-1 last:mb-0">
              <p className="glyphe px-2 pb-1 pt-1.5">{famille.titre}</p>
              {THEMES.filter((entree) => entree.famille === famille.cle).map((entree) => {
                const choisi = entree.id === theme
                return (
                  <button
                    key={entree.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={choisi}
                    onClick={() => {
                      changerTheme(entree.id)
                      setOuvert(false)
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-left transition-colors ${
                      choisi ? 'bg-or-500/15' : 'hover:bg-or-500/10'
                    }`}
                  >
                    <Echantillon teintes={entree.echantillon} />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-sm leading-tight ${
                          choisi ? 'text-or-100' : 'text-gray-300'
                        }`}
                      >
                        {entree.nom}
                      </span>
                      <span className="block truncate text-[0.7rem] leading-tight text-gray-500">
                        {entree.resume}
                      </span>
                    </span>
                    {/* Le thème actif porte un point d'or plutôt qu'une coche */}
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 shrink-0 rounded-full bg-or-300 transition-opacity ${
                        choisi ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
