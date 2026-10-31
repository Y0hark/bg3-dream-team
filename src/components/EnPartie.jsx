import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import RecapZone from './RecapZone.jsx'
import { ACTES, acteDe } from '../data/actes.js'
import { BUILDS } from '../data/builds.js'
import { LIEUX } from '../data/lieux.js'
import { objetDe } from '../data/objets.js'
import { accentDe, variableAccent } from '../lib/accents.js'
import { prochainesActions, resumeRoles } from '../lib/affichage.js'
import { nomsObjet } from '../lib/localisation.js'
import useAffichage from '../hooks/useAffichage.jsx'
import useProgression from '../hooks/useProgression.jsx'

const roles = BUILDS.map((build) => build.id)
const nomRole = (id) => BUILDS.find((build) => build.id === id)?.personnage ?? id
const nomObjet = (id) => {
  const objet = objetDe(id)
  return objet ? nomsObjet(objet).principal : id
}

function textAction(action) {
  const porteurs = action.roles?.map(nomRole).join(', ')
  if (action.type === 'affecter') {
    return `${nomRole(action.role)} : ${action.nombre} exemplaire${action.nombre > 1 ? 's' : ''} libre${action.nombre > 1 ? 's' : ''} à affecter`
  }
  if (action.type === 'copie') return `${nomObjet(action.objet)} : ${action.nombre} copie${action.nombre > 1 ? 's' : ''} à préparer (${porteurs})`
  if (action.type === 'conflit') return `${nomObjet(action.objet)} ne se copie pas : un seul porteur possible (${porteurs})`
  return `${nomObjet(action.objet)} : original à récupérer (${porteurs})`
}

/** Choix de l'acte et de la zone joués : déclaratif, local à l'appareil. */
function DeclarationZone() {
  const { acte, zone, declarerActe, declarerZone } = useAffichage()

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div>
        <span className="glyphe mb-1 block text-xs">Acte joué</span>
        <div role="group" aria-label="Acte joué" className="flex flex-wrap gap-2">
          {ACTES.map((entree) => (
            <button
              key={entree.numero}
              type="button"
              aria-pressed={acte === entree.numero}
              onClick={() => declarerActe(acte === entree.numero ? null : entree.numero)}
              className={`bouton min-h-[44px] ${acte === entree.numero ? '!border-or-300 !text-or-100 bg-voile/[0.06]' : ''}`}
            >
              {entree.nom}
            </button>
          ))}
        </div>
      </div>
      <label className="flex min-w-0 flex-col gap-1 text-xs text-gray-400">
        <span className="glyphe">Zone</span>
        <select
          className="min-h-[44px] max-w-full rounded border border-or-700/40 bg-transparent px-2 text-sm text-gray-100"
          value={zone ?? ''}
          onChange={(evenement) => declarerZone(evenement.target.value || null)}
        >
          <option value="">Zone non déclarée</option>
          {ACTES.map((entree) => (
            <optgroup key={entree.numero} label={entree.nom}>
              {LIEUX.filter((lieu) => lieu.acte === entree.numero).map((lieu) => (
                <option key={lieu.id} value={lieu.id}>
                  {lieu.nom}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
    </div>
  )
}

/**
 * Tableau de bord « En partie » : même état, mêmes calculs que Préparer, mais
 * l'acte joué d'abord. Le site ne lit pas la sauvegarde du jeu : tout ici vient
 * de ce que vous avez renseigné.
 */
export default function EnPartie() {
  const { etat } = useProgression()
  const { acte, zone, declarerZone } = useAffichage()
  const resumes = useMemo(() => (acte ? resumeRoles(roles, acte, etat) : []), [acte, etat])
  const actions = useMemo(() => (acte ? prochainesActions(roles, acte, etat) : []), [acte, etat])

  return (
    <div data-en-partie>
      <section aria-labelledby="titre-declaration" className="plaque mb-6 p-5">
        <h2 id="titre-declaration" className="grave text-xl tracking-[0.1em]">
          Où en êtes-vous ?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-400">
          Le site ne lit pas la sauvegarde du jeu : il se base sur la zone que vous déclarez et sur le suivi que vous
          renseignez. Changer de zone ne modifie ni votre possession, ni vos plans, ni vos décisions de quête.
        </p>
        <div className="mt-4">
          <DeclarationZone />
        </div>
        {!zone && (
          <p role="note" className="mt-4 text-sm text-amber-200" data-sans-zone>
            {acte
              ? 'Zone non déclarée : choisissez-la pour voir les alertes de départ qui la concernent. Aucune prochaine action propre à une zone n’est supposée.'
              : 'Aucun acte ni zone déclarés : choisissez-en un, ou ouvrez directement le plan d’un acte.'}
          </p>
        )}
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Plan d’acte">
          {ACTES.map((entree) => (
            <li key={entree.numero}>
              <Link className="bouton inline-flex min-h-[44px] items-center" to={`/equipe?acte=${entree.numero}`}>
                Plan {entree.nom}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {zone && <RecapZone zone={zone} onZone={declarerZone} />}

      {acte && (
        <section aria-labelledby="titre-actions" className="plaque mb-6 p-5" data-prochaines-actions>
          <h2 id="titre-actions" className="grave text-xl tracking-[0.1em]">
            Prochaines actions · {acteDe(acte)?.nom}
          </h2>
          <p className="mt-2 text-xs text-gray-400">
            Déduites de vos statuts et de vos exemplaires. Une liste vide ne signifie pas que l’acte est terminé : elle
            dit seulement que rien de connu n’est à faire.
          </p>
          {actions.length === 0 ? (
            <p className="mt-3 text-sm text-gray-300">Aucune action d’équipement connue pour cet acte.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {actions.map((action) => (
                <li key={`${action.type}-${action.role ?? action.objet}`} className={`text-sm ${action.type === 'conflit' ? 'text-amber-200' : 'text-gray-200'}`}>
                  {action.type === 'conflit' && <span aria-hidden="true">⚠ </span>}
                  {textAction(action)}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 flex flex-wrap gap-2">
            <Link className="bouton inline-flex min-h-[44px] items-center" to={`/equipe?acte=${acte}`}>
              Vue d’équipe
            </Link>
            <Link className="bouton inline-flex min-h-[44px] items-center" to="/items">
              Fiches d’objets
            </Link>
          </p>
        </section>
      )}

      {acte && (
        <section aria-labelledby="titre-roles" className="mb-6" data-roles-en-partie>
          <h2 id="titre-roles" className="grave mb-4 text-xl tracking-[0.1em]">
            Équipement des quatre rôles
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {resumes.map((resume) => {
              const build = BUILDS.find((entree) => entree.id === resume.role)
              const accent = accentDe(build)
              return (
                <article key={resume.role} className="plaque flex flex-col p-5" style={variableAccent(build)} data-role-resume={resume.role}>
                  <p className={`font-display text-sm uppercase tracking-[0.1em] ${accent.texte}`}>
                    <span aria-hidden="true">{build.icone}</span> {build.personnage}
                  </p>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="glyphe">Prévu</dt>
                      <dd className="text-gray-100">{resume.prevus} objets</dd>
                    </div>
                    <div>
                      <dt className="glyphe">Équipé</dt>
                      <dd className="text-gray-100">{resume.equipes}</dd>
                    </div>
                  </dl>
                  <p className="mt-2 text-xs text-gray-400">
                    Prévu : le plan avec vos alternatives. Équipé : ce que vous avez affecté.
                  </p>
                  <Link
                    className="bouton mt-auto inline-flex min-h-[44px] items-center justify-center"
                    to={`/builds/${resume.role}?acte=${acte}#inventaire-${resume.role}`}
                  >
                    Ouvrir l’inventaire
                  </Link>
                </article>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
