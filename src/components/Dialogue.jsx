import { useEffect, useRef } from 'react'

const FOCALISABLES =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Touche pressée dans une boîte de dialogue : Échap ferme, Tab reste dans la
 * boîte. Pure (pas de DOM) pour être testable : renvoie l'action à réaliser.
 */
export function actionClavier({ touche, majuscule = false, indice, total }) {
  if (touche === 'Escape') return { type: 'fermer' }
  if (touche !== 'Tab' || total === 0) return null
  if (majuscule && indice <= 0) return { type: 'focus', cible: total - 1 }
  if (!majuscule && indice >= total - 1) return { type: 'focus', cible: 0 }
  return null
}

/**
 * Fiche persistante : fenêtre modale accessible. Le focus entre dans la boîte,
 * reste piégé tant qu'elle est ouverte ; fermeture par Échap, bouton « Fermer »
 * ou clic hors de la boîte.
 */
export default function Dialogue({ titre, idTitre, onFermer, children }) {
  const boite = useRef(null)

  // Le retour du focus au déclencheur est géré par le parent : la fiche et la
  // liste d'options se remplacent l'une l'autre sans perdre le déclencheur.
  useEffect(() => {
    boite.current?.querySelector('[data-focus-initial]')?.focus()
  }, [])

  function surTouche(evenement) {
    const focalisables = [...boite.current.querySelectorAll(FOCALISABLES)]
    const action = actionClavier({
      touche: evenement.key,
      majuscule: evenement.shiftKey,
      indice: focalisables.indexOf(document.activeElement),
      total: focalisables.length,
    })
    if (!action) return
    evenement.preventDefault()
    if (action.type === 'fermer') onFermer()
    else focalisables[action.cible]?.focus()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-2 sm:items-center sm:p-6"
      onMouseDown={(evenement) => {
        if (evenement.target === evenement.currentTarget) onFermer()
      }}
    >
      <div
        ref={boite}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitre}
        onKeyDown={surTouche}
        className="plaque max-h-[88vh] w-full max-w-xl overflow-y-auto overflow-x-hidden break-words p-5"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id={idTitre} className="grave min-w-0 text-base tracking-[0.1em]">
            {titre}
          </h2>
          <button
            type="button"
            data-focus-initial
            onClick={onFermer}
            aria-label="Fermer"
            className="bouton flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
