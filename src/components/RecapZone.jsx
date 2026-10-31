import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlerteAcquisition } from './AlertesAcquisition.jsx'
import { ACTES } from '../data/actes.js'
import { EVENEMENTS } from '../data/acquisition.js'
import { BUILDS } from '../data/builds.js'
import { LIEUX } from '../data/lieux.js'
import { objetDe } from '../data/objets.js'
import { nomsObjet } from '../lib/localisation.js'
import { recapZone, zoneParDefaut, zonesAvecAlertes } from '../lib/acquisition.js'
import useProgression from '../hooks/useProgression.jsx'

function lienFiche(id) {
  return `/items?recherche=${encodeURIComponent(objetDe(id).nom)}`
}

/** Déclaration d'un fait ou d'un départ : confirmation avant d'écrire, annulable ensuite. */
function Declarations({ zoneId }) {
  const { etat, declarerEvenement } = useProgression()
  const [enAttente, setEnAttente] = useState(null)
  const evenements = EVENEMENTS.filter((evenement) => evenement.zone === zoneId)
  if (evenements.length === 0) return null

  return (
    <div className="mt-4">
      <h4 className="glyphe">Ce que vous avez vu ou fait dans cette zone</h4>
      <p className="mt-1 text-xs text-gray-400">
        Vous déclarez : le site ne surveille pas le jeu. Chaque déclaration se retire.
      </p>
      <ul className="mt-2 space-y-2">
        {evenements.map((evenement) => {
          const declare = Boolean(etat.acquisition?.evenements?.[evenement.id])
          const confirmation = enAttente === evenement.id
          return (
            <li key={evenement.id} className="flex flex-wrap items-center gap-2 text-sm text-gray-300">
              <span className="min-w-0 flex-1">{evenement.nom}</span>
              {declare ? (
                <button type="button" className="bouton min-h-[44px]" onClick={() => declarerEvenement(evenement.id, false)}>
                  Retirer la déclaration
                </button>
              ) : confirmation ? (
                <span className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="bouton min-h-[44px]"
                    onClick={() => {
                      declarerEvenement(evenement.id, true)
                      setEnAttente(null)
                    }}
                  >
                    Confirmer la déclaration
                  </button>
                  <button type="button" className="bouton min-h-[44px]" onClick={() => setEnAttente(null)}>
                    Annuler
                  </button>
                </span>
              ) : (
                <button type="button" className="bouton min-h-[44px]" onClick={() => setEnAttente(evenement.id)}>
                  Déclarer
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * « Avant de quitter cette zone » — composant réutilisé tel quel par le
 * ticket 5 (aucun second moteur d'alertes : tout vient de lib/acquisition.js).
 */
export default function RecapZone({ zoneInitiale = null }) {
  const { etat, definirSpoilers } = useProgression()
  const [roles, setRoles] = useState(BUILDS.map((build) => build.id))
  const [alternatives, setAlternatives] = useState(false)
  const [zoneId, setZoneId] = useState(zoneInitiale)
  const options = useMemo(() => ({ roles, alternatives }), [roles, alternatives])

  const zones = useMemo(() => zonesAvecAlertes(etat, options), [etat, options])
  const courante = zoneId && LIEUX.some((lieu) => lieu.id === zoneId) ? zoneId : (zoneParDefaut(etat, options)?.id ?? LIEUX[0].id)
  const recap = useMemo(() => recapZone(courante, etat, options), [courante, etat, options])
  const discret = etat.acquisition?.spoilers !== 'detail'

  const basculerRole = (id) =>
    setRoles((precedent) => (precedent.includes(id) ? precedent.filter((role) => role !== id) : [...precedent, id]))

  return (
    <section aria-labelledby="recap-zone" className="plaque mb-12 p-5" data-recap-zone={courante}>
      <h2 id="recap-zone" className="grave text-xl tracking-[0.1em]">
        Avant de quitter cette zone
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-400">
        Ce récapitulatif lit votre plan et ce que vous déclarez. Il ne lit pas la sauvegarde du jeu et ne garantit pas
        qu’une zone est sans risque.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <label className="flex min-w-0 flex-col gap-1 text-xs text-gray-400">
          <span className="glyphe">Zone</span>
          <select
            className="min-h-[44px] rounded border border-or-700/40 bg-transparent px-2 text-sm text-gray-100"
            value={courante}
            onChange={(evenement) => setZoneId(evenement.target.value)}
          >
            {ACTES.map((acte) => (
              <optgroup key={acte.numero} label={acte.nom}>
                {LIEUX.filter((lieu) => lieu.acte === acte.numero).map((lieu) => (
                  <option key={lieu.id} value={lieu.id}>
                    {lieu.nom}
                    {zones.some((zone) => zone.id === lieu.id) ? ' ●' : ''}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <fieldset className="min-w-0">
          <legend className="glyphe">Équipe</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {BUILDS.map((build) => (
              <button
                key={build.id}
                type="button"
                aria-pressed={roles.includes(build.id)}
                onClick={() => basculerRole(build.id)}
                className={`bouton min-h-[44px] ${roles.includes(build.id) ? '!border-or-300 !text-or-100 bg-voile/[0.06]' : ''}`}
              >
                {build.personnage}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={alternatives}
            onClick={() => setAlternatives((valeur) => !valeur)}
            className={`bouton min-h-[44px] ${alternatives ? '!border-or-300 !text-or-100 bg-voile/[0.06]' : ''}`}
          >
            Inclure les alternatives
          </button>
          <button
            type="button"
            aria-pressed={!discret}
            onClick={() => definirSpoilers(discret ? 'detail' : 'discret')}
            className={`bouton min-h-[44px] ${!discret ? '!border-or-300 !text-or-100 bg-voile/[0.06]' : ''}`}
          >
            {discret ? 'Mode discret : afficher les détails' : 'Détails affichés : revenir au mode discret'}
          </button>
        </div>
      </div>

      <div className="mt-5" aria-live="polite">
        {recap.rienDeBloquant && (
          <p className="rounded border border-emerald-400/30 p-3 text-sm text-emerald-300">
            Rien de bloquant identifié dans les données vérifiées pour {recap.zone?.nom}.
            {recap.ignorees.length > 0 && ` ${recap.ignorees.length} alerte(s) ignorée(s) restent non résolues.`}
          </p>
        )}

        {recap.manquants.length > 0 && (
          <div className="mb-4">
            <h3 className="glyphe">Objets prévus encore manquants ici</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {recap.manquants.map((objet) => (
                <li key={objet.id}>
                  <Link className="bouton inline-flex min-h-[44px] items-center" to={lienFiche(objet.id)}>
                    {objet.nom}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {recap.ouvertes.length > 0 && (
          <div className="mb-4">
            <h3 className="glyphe">Alertes ouvertes</h3>
            <ul className="mt-2 space-y-2">
              {recap.ouvertes.map((alerte) => (
                <AlerteAcquisition key={alerte.condition.id} alerte={alerte} nomZone={recap.zone?.nom} />
              ))}
            </ul>
          </div>
        )}

        {recap.nonAudites.length > 0 && (
          <p className="mb-4 text-xs text-gray-400">
            Objets du plan non audités ici (aucune condition connue ne prouve l’absence de risque) :{' '}
            {recap.nonAudites.map((id) => nomsObjet(objetDe(id)).principal).join(', ')}.
          </p>
        )}

        <Declarations zoneId={courante} />

        {recap.ignorees.length > 0 && (
          <details className="mt-4">
            <summary className="min-h-[44px] cursor-pointer py-2 text-sm text-gray-300">
              Alertes ignorées ({recap.ignorees.length}) — non résolues, à restaurer si besoin
            </summary>
            <ul className="mt-2 space-y-2">
              {recap.ignorees.map((alerte) => (
                <AlerteAcquisition key={alerte.condition.id} alerte={alerte} nomZone={recap.zone?.nom} />
              ))}
            </ul>
          </details>
        )}

        {recap.resolues.length > 0 && (
          <details className="mt-4">
            <summary className="min-h-[44px] cursor-pointer py-2 text-sm text-gray-300">
              Alertes levées ({recap.resolues.length})
            </summary>
            <ul className="mt-2 space-y-2">
              {recap.resolues.map((alerte) => (
                <AlerteAcquisition key={alerte.condition.id} alerte={alerte} nomZone={recap.zone?.nom} />
              ))}
            </ul>
          </details>
        )}
      </div>
    </section>
  )
}
