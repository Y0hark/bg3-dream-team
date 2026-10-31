import { useState } from 'react'
import { Link } from 'react-router-dom'
import LienExterne from './LienExterne.jsx'
import { CATEGORIES, CONFIANCES, PORTEES, SEVERITES, evenementDe } from '../data/acquisition.js'
import { objetDe } from '../data/objets.js'
import { buildDe } from '../data/builds.js'
import { LIBELLE_A_VERIFIER, RESULTATS, alertesObjet, badgesObjet } from '../lib/acquisition.js'
import { nomsObjet } from '../lib/localisation.js'
import useProgression from '../hooks/useProgression.jsx'

const socle =
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-rune text-[0.58rem] uppercase tracking-[0.12em]'

// Classes écrites en entier : Tailwind ne détecte pas les noms construits.
const TEINTES_SEVERITE = {
  bloquant: 'border-red-400/50 text-red-200',
  attention: 'border-amber-300/45 text-amber-200',
  info: 'border-sky-400/45 text-sky-200',
}

/** Badges courts d'un objet : jamais la seule source d'information (le détail est à la fiche). */
export function BadgesAcquisition({ objetId, className = '' }) {
  const { etat } = useProgression()
  const badges = badgesObjet(objetId, etat)
  if (badges.length === 0) return null
  return (
    <ul className={`flex flex-wrap gap-1 ${className}`} aria-label="Alertes d’acquisition">
      {badges.map((badge) => (
        <li key={badge.id} className={`${socle} ${TEINTES_SEVERITE[badge.severite]}`}>
          <span aria-hidden="true">⚠</span>
          {badge.libelle}
          {badge.resultat === 'non-satisfait' && <span> · impossible</span>}
        </li>
      ))}
    </ul>
  )
}

function EtatsAlerte({ condition, evaluation }) {
  const { definirStatutAlerte } = useProgression()
  const choix = [
    { id: null, nom: 'À vérifier' },
    { id: 'fait', nom: 'Fait' },
    { id: 'ignore', nom: 'Ignorer' },
  ]
  const courant = evaluation.statutUtilisateur
  return (
    <div role="group" aria-label={`Décision pour l’alerte ${condition.libelleDiscret}`} className="flex flex-wrap gap-1.5">
      {choix.map((entree) => (
        <button
          key={entree.nom}
          type="button"
          aria-pressed={courant === entree.id}
          onClick={() => definirStatutAlerte(condition.id, entree.id)}
          className={`bouton min-h-[44px] min-w-[44px] ${courant === entree.id ? '!border-or-300 !text-or-100 bg-voile/[0.06]' : ''}`}
        >
          {entree.nom}
        </button>
      ))}
    </div>
  )
}

function nomsDesObjets(ids) {
  return ids.map((id) => nomsObjet(objetDe(id)).principal)
}

/**
 * Une alerte. En mode discret : catégorie, sévérité, zone et texte court ; le
 * détail (et, si la condition le demande, les noms d'objets) n'apparaît qu'à la
 * demande. La sévérité reste toujours visible : le mode discret masque
 * l'explication, jamais l'existence de l'urgence.
 */
export function AlerteAcquisition({ alerte, nomZone = null }) {
  const { etat } = useProgression()
  const [revele, setRevele] = useState(false)
  const { condition, evaluation, objets, roles = [] } = alerte
  const detailParDefaut = etat.acquisition?.spoilers === 'detail'
  const detailVisible = revele || detailParDefaut
  const masquerObjets = condition.masquerObjets && !detailVisible
  const idDetail = `detail-${condition.id}`

  return (
    <li className="rounded border border-or-700/25 bg-voile/[0.02] p-3 text-sm leading-relaxed text-gray-300">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`${socle} ${TEINTES_SEVERITE[condition.severite]}`}>{SEVERITES[condition.severite].nom}</span>
        <span className={`${socle} border-or-700/40 text-gray-300`}>{CATEGORIES[condition.categorie].nom}</span>
        <span className={`${socle} border-or-700/30 text-gray-400`}>{PORTEES[condition.portee]}</span>
        {condition.confiance === 'a-verifier' && (
          <span className={`${socle} border-amber-300/45 text-amber-200`}>{LIBELLE_A_VERIFIER}</span>
        )}
        <span className={`${socle} border-or-700/30 text-gray-400`}>{RESULTATS[evaluation.resultat]}</span>
        {nomZone && <span className="text-xs text-gray-500">· {nomZone}</span>}
      </div>

      <p className="mt-2 text-gray-100">{condition.libelleDiscret}</p>
      <p className="mt-1 text-xs text-gray-400">{condition.discret}</p>

      {evaluation.resultat === 'non-satisfait' && (
        <p className="mt-2 text-xs text-red-200">
          Condition devenue impossible d’après votre déclaration ({evenementDe(condition.evenement)?.nom}). Aucun objet
          obtenu ne la satisfait. Annulez la déclaration si elle est erronée.
        </p>
      )}
      {evaluation.resultat === 'satisfait' && (
        <p className="mt-2 text-xs text-emerald-300">
          {evaluation.raison === 'original' && 'Original obtenu : alerte levée (les copies restent à préparer à part).'}
          {evaluation.raison === 'voie' && 'Une voie alternative est déclarée.'}
          {evaluation.raison === 'declare' && 'Marquée « fait » par vous.'}
        </p>
      )}

      <p className="mt-2 text-xs text-gray-400">
        {masquerObjets ? (
          <span>Objets concernés : masqués en mode discret.</span>
        ) : (
          <span>
            Concerne :{' '}
            {objets.map((id, index) => (
              <span key={id}>
                {index > 0 && ', '}
                <Link className="underline decoration-or-700/60 underline-offset-2" to={`/items?recherche=${encodeURIComponent(objetDe(id).nom)}`}>
                  {nomsDesObjets([id])[0]}
                </Link>
              </span>
            ))}
            {roles.length > 0 && <span> · {roles.map((role) => buildDe(role)?.personnage ?? role).join(', ')}</span>}
          </span>
        )}
      </p>

      <button
        type="button"
        className="bouton mt-2 min-h-[44px]"
        aria-expanded={detailVisible}
        aria-controls={idDetail}
        onClick={() => setRevele((valeur) => !valeur)}
        disabled={detailParDefaut}
      >
        {detailVisible ? 'Masquer le détail' : 'Afficher le détail (spoilers)'}
      </button>

      {detailVisible && (
        <div id={idDetail} className="mt-2 space-y-2 text-xs text-gray-300">
          <p>{condition.detail}</p>
          {condition.voies.length > 0 && (
            <VoiesAlerte condition={condition} />
          )}
          <p className="text-gray-400">
            {CONFIANCES[condition.confiance]}.{' '}
            {condition.sources.map((source, index) => (
              <span key={index} className="mr-2">
                {source.url ? <LienExterne href={source.url}>{source.libelle}</LienExterne> : source.libelle}
              </span>
            ))}
          </p>
        </div>
      )}

      <div className="mt-3">
        <EtatsAlerte condition={condition} evaluation={evaluation} />
      </div>
    </li>
  )
}

function VoiesAlerte({ condition }) {
  const { etat, declarerEvenement } = useProgression()
  return (
    <div>
      <p className="glyphe">Voies alternatives (une suffit)</p>
      <ul className="mt-1 space-y-1">
        {condition.voies.map((voie) => {
          const declaree = Boolean(etat.acquisition?.evenements?.[voie.id])
          return (
            <li key={voie.id}>
              <button
                type="button"
                className="bouton min-h-[44px]"
                aria-pressed={declaree}
                onClick={() => declarerEvenement(voie.id, !declaree)}
              >
                {declaree ? '✓ ' : ''}
                {voie.libelle}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Section « Alertes d’acquisition » d'une fiche d'objet : toutes les conditions, y compris levées ou ignorées. */
export function FicheAcquisition({ objetId }) {
  const { etat } = useProgression()
  const alertes = alertesObjet(objetId, etat)
  if (alertes.length === 0) return null
  return (
    <section aria-labelledby={`alertes-${objetId}`}>
      <h3 id={`alertes-${objetId}`} className="glyphe">
        Alertes d’acquisition
      </h3>
      <ul className="mt-2 space-y-2">
        {alertes.map(({ condition, evaluation }) => (
          <AlerteAcquisition key={condition.id} alerte={{ condition, evaluation, objets: [objetId] }} />
        ))}
      </ul>
    </section>
  )
}
