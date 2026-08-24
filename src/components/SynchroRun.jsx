import { useEffect, useRef, useState } from 'react'
import useProgression from '../hooks/useProgression.jsx'
import { genererCode, normaliserCode, nuageConfigure } from '../lib/nuage.js'

// ------------------------------------------------------------------
// Panneau de sauvegarde en ligne. Le code de run est la seule identité :
// le coller sur un autre appareil (ou l'envoyer à la team) suffit à
// retrouver la même progression.
// ------------------------------------------------------------------

const ETATS = {
  inactif: { libelle: 'Local seul', teinte: 'bg-gray-500/70' },
  chargement: { libelle: 'Connexion…', teinte: 'bg-amber-300/80 animate-pulse' },
  envoi: { libelle: 'Envoi…', teinte: 'bg-amber-300/80 animate-pulse' },
  synchro: { libelle: 'Sauvegardé', teinte: 'bg-emerald-400/90' },
  erreur: { libelle: 'Hors ligne', teinte: 'bg-red-400/90' },
}

/** « il y a 3 min » — suffisant ici, sans dépendance de formatage. */
function depuis(iso) {
  if (!iso) return null
  const secondes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  if (secondes < 60) return "à l'instant"
  const minutes = Math.round(secondes / 60)
  if (minutes < 60) return `il y a ${minutes} min`
  const heures = Math.round(minutes / 60)
  if (heures < 24) return `il y a ${heures} h`
  return `il y a ${Math.round(heures / 24)} j`
}

export default function SynchroRun() {
  const { codeRun, synchro, activerSynchro, arreterSynchro } = useProgression()
  const [ouvert, setOuvert] = useState(false)
  const [saisie, setSaisie] = useState('')
  const [copie, setCopie] = useState(false)
  const conteneur = useRef(null)
  const bouton = useRef(null)

  // Fermeture au clic extérieur et à l'échappement, comme le sélecteur de thème.
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

  if (!nuageConfigure()) return null

  const etat = ETATS[synchro.statut] ?? ETATS.inactif
  const saisieValide = Boolean(normaliserCode(saisie))

  function rejoindre(evenement) {
    evenement.preventDefault()
    if (activerSynchro(saisie)) setSaisie('')
  }

  async function copier() {
    try {
      await navigator.clipboard.writeText(codeRun)
      setCopie(true)
      setTimeout(() => setCopie(false), 1800)
    } catch {
      // Presse-papier refusé : le code reste sélectionnable à la main.
    }
  }

  return (
    <div ref={conteneur} className="relative">
      <button
        ref={bouton}
        type="button"
        onClick={() => setOuvert((precedent) => !precedent)}
        aria-haspopup="dialog"
        aria-expanded={ouvert}
        aria-label={`Sauvegarde en ligne : ${etat.libelle}`}
        className="flex items-center gap-2 rounded-full border border-or-700/40 px-2.5 py-1.5 transition-colors duration-300 hover:border-or-500/70 sm:px-3"
      >
        {/* Nuage tracé au trait, dans l'esprit des autres icônes */}
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-or-300" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M7 18a4 4 0 0 1-.4-7.98A5.5 5.5 0 0 1 17.5 9.5 3.75 3.75 0 0 1 17 18Z" strokeLinejoin="round" />
        </svg>
        <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${etat.teinte}`} />
        <span className="glyphe hidden text-or-300 lg:block">{etat.libelle}</span>
      </button>

      {ouvert && (
        <div
          role="dialog"
          aria-label="Sauvegarde en ligne"
          className="plaque absolute right-0 top-full z-50 mt-2 w-80 origin-top-right p-4"
        >
          <p className="glyphe pb-2">Sauvegarde en ligne</p>

          {codeRun ? (
            <>
              <p className="text-[0.7rem] leading-relaxed text-gray-400">
                Progression sauvegardée sous ce code. Colle-le sur un autre appareil pour
                retrouver la run — ou envoie-le à la team pour suivre la même.
              </p>

              <div className="mt-3 flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-sm border border-or-700/35 bg-encre/60 px-2.5 py-2 font-rune text-xs text-or-100">
                  {codeRun}
                </code>
                <button type="button" onClick={copier} className="bouton shrink-0">
                  {copie ? 'Copié' : 'Copier'}
                </button>
              </div>

              <p className="mt-3 flex items-center gap-2 text-[0.7rem] text-gray-500">
                <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${etat.teinte}`} />
                {synchro.statut === 'erreur'
                  ? `${synchro.erreur} — la progression reste enregistrée dans ce navigateur.`
                  : [etat.libelle, depuis(synchro.majLe)].filter(Boolean).join(' · ')}
              </p>

              <button
                type="button"
                onClick={arreterSynchro}
                className="mt-4 text-[0.7rem] uppercase tracking-[0.14em] text-gray-500 transition-colors hover:text-red-300"
              >
                Détacher cet appareil
              </button>
            </>
          ) : (
            <>
              <p className="text-[0.7rem] leading-relaxed text-gray-400">
                Pour l'instant la progression ne vit que dans ce navigateur. Génère un code de
                run pour la sauvegarder en ligne et la retrouver ailleurs.
              </p>

              <button
                type="button"
                onClick={() => activerSynchro(genererCode())}
                className="bouton mt-3 w-full"
              >
                Créer un code de run
              </button>

              <div className="filet my-4" />

              <form onSubmit={rejoindre}>
                <label className="glyphe block pb-1.5" htmlFor="code-run">
                  Rejoindre une run
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="code-run"
                    value={saisie}
                    onChange={(evenement) => setSaisie(evenement.target.value)}
                    placeholder="grimoire-ardente-472"
                    autoComplete="off"
                    spellCheck="false"
                    className="champ min-w-0 flex-1 normal-case tracking-normal"
                  />
                  <button type="submit" disabled={!saisieValide} className="bouton shrink-0 disabled:opacity-40">
                    Rejoindre
                  </button>
                </div>
                <p className="mt-2 text-[0.7rem] text-gray-500">
                  La progression en ligne remplacera celle de ce navigateur.
                </p>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  )
}
