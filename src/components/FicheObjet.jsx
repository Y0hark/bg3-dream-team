import { FicheAcquisition } from './AlertesAcquisition.jsx'
import { BadgeActe } from './Badges.jsx'
import LienExterne from './LienExterne.jsx'
import SuiviCopies from './SuiviCopies.jsx'
import { NOMS_USAGES } from '../data/objets-meta.js'
import { objetDe } from '../data/objets.js'
import { NOMS_NATURES } from '../lib/alternatives.js'
import { ETATS_EMPLACEMENT, LIBELLES_PLAN, ficheObjet } from '../lib/inventaire.js'
import { statutDe } from '../lib/progression.js'
import useProgression from '../hooks/useProgression.jsx'

const socle =
  'inline-flex items-center rounded-full border px-2.5 py-1 font-rune text-[0.62rem] uppercase tracking-[0.14em]'

export function BadgesUsages({ usages }) {
  if (!usages?.length) return null
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Usages">
      {usages.map((usage) => (
        <li key={usage} className={`${socle} border-or-700/40 text-gray-300`}>
          {NOMS_USAGES[usage]}
        </li>
      ))}
    </ul>
  )
}

/** Extrait non interactif d'une fiche : survol et focus, jamais la seule source d'information. */
export function ApercuObjet({ emplacement }) {
  const fiche = ficheObjet(emplacement?.courante)
  if (!emplacement) {
    return (
      <p className="text-sm leading-relaxed text-gray-400">
        Survolez ou sélectionnez un emplacement pour lire son effet. Toucher ou valider un objet ouvre sa fiche
        complète.
      </p>
    )
  }
  if (!fiche) {
    return (
      <div>
        <p className="glyphe">{emplacement.libelle}</p>
        <p className="mt-2 text-sm leading-relaxed text-gray-400">
          {emplacement.courante?.interet ?? 'Aucune recommandation encodée pour cet emplacement à cet acte.'}
        </p>
      </div>
    )
  }
  const premiere = fiche.acquisition[0]
  return (
    <div>
      <p className="glyphe">{emplacement.libelle}</p>
      <p className="mt-1 font-display text-sm uppercase tracking-[0.08em] text-or-100">{fiche.nom}</p>
      <p className="mt-2 text-sm leading-relaxed text-gray-300">{fiche.effet}</p>
      {fiche.interet && <p className="mt-2 text-xs leading-relaxed text-gray-400">Pour ce rôle : {fiche.interet}</p>}
      {premiere && (
        <p className="mt-2 text-xs leading-relaxed text-gray-400">
          Acquisition : acte {premiere.acte}
          {premiere.lieu ? ` · ${premiere.lieu}` : ' · lieu à localiser'}
        </p>
      )}
      {fiche.avertissements.length > 0 && (
        <p className="mt-2 text-xs leading-relaxed text-amber-200">⚠ {fiche.avertissements.join(' · ')}</p>
      )}
    </div>
  )
}

/** Fiche persistante : effet, intérêt pour le rôle, acquisition, avertissements et actions de suivi. */
export default function FicheObjet({ emplacement, option, role, acte, onChanger }) {
  const { etat, basculerItem } = useProgression()
  const fiche = ficheObjet(option)
  const objet = option?.objet ? objetDe(option.objet) : null
  const estCourante = emplacement.courante === option

  if (!fiche || !objet) {
    return (
      <p className="text-sm leading-relaxed text-gray-300">
        {option?.interet ?? 'Aucun objet n’est recommandé pour cet emplacement à cet acte.'}
      </p>
    )
  }

  const statut = statutDe(etat, objet.id)

  return (
    <div className="space-y-4 text-sm leading-relaxed text-gray-300">
      <div>
        <p className="font-display text-base uppercase tracking-[0.08em] text-or-100">{fiche.nom}</p>
        {fiche.nomSecondaire && <p className="text-xs text-gray-500">{fiche.nomSecondaire}</p>}
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className={`${socle} border-or-700/40 text-gray-300`}>{emplacement.libelle}</span>
          <span className={`${socle} border-sky-400/45 text-sky-200`}>{NOMS_NATURES[fiche.nature]}</span>
          {estCourante && <span className={`${socle} border-emerald-400/45 text-emerald-300`}>Prévu pour l’acte</span>}
        </div>
      </div>

      <p>{fiche.effet}</p>
      {fiche.interet && (
        <p>
          <span className="glyphe">Intérêt pour ce rôle · </span>
          {fiche.interet}
        </p>
      )}
      {fiche.condition && (
        <p className="text-amber-200/90">
          <span className="font-rune text-[0.65rem] uppercase tracking-[0.12em]">Condition · </span>
          {fiche.condition}
        </p>
      )}
      <BadgesUsages usages={fiche.usages} />

      <section aria-labelledby={`acq-${fiche.id}`}>
        <h3 id={`acq-${fiche.id}`} className="glyphe">
          Acquisition
        </h3>
        <ul className="mt-2 space-y-2">
          {fiche.acquisition.map((source, index) => (
            <li key={index} className="rounded border border-or-700/20 p-3 text-xs">
              <span className="flex flex-wrap items-center gap-2">
                <BadgeActe numero={source.acte} />
                <span className="text-gray-200">{source.lieu ?? 'Lieu à localiser'}</span>
                {source.rattrapage && <span className="text-gray-400">· rattrapage</span>}
                {source.aConfirmer && <span className="text-amber-200">· à confirmer</span>}
              </span>
              <span className="mt-2 block leading-relaxed text-gray-400">{source.texte}</span>
              {source.verrou && <span className="mt-1 block text-amber-200">⚠ {source.verrou}</span>}
              {source.lienLieu && (
                <span className="mt-1 block">
                  <LienExterne href={source.lienLieu} className="min-h-[44px]">Voir la zone</LienExterne>
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <FicheAcquisition objetId={objet.id} />

      <section aria-labelledby={`suivi-${fiche.id}`} className="space-y-2">
        <h3 id={`suivi-${fiche.id}`} className="glyphe">
          Suivi de la run
        </h3>
        <p className="text-xs text-gray-400">
          {LIBELLES_PLAN.prevu} : choix de plan, sans effet sur la possession. {LIBELLES_PLAN.equipe} :{' '}
          {ETATS_EMPLACEMENT[emplacement.etat] === 'Équipé' && estCourante ? 'oui, un exemplaire est affecté.' : 'non affecté pour l’instant.'}
        </p>
        <button
          type="button"
          className="bouton min-h-[44px]"
          onClick={() => basculerItem(objet.id)}
          aria-pressed={statut === 'obtenu'}
        >
          {statut === 'obtenu' ? 'Original obtenu — remettre à récupérer' : 'Marquer l’original comme obtenu'}
        </button>
        <SuiviCopies objet={objet} role={role} acte={acte} />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <LienExterne href={fiche.wiki} className="min-h-[44px] min-w-[44px]">Wiki</LienExterne>
        {onChanger && (
          <button type="button" className="bouton min-h-[44px]" onClick={onChanger}>
            Options de l’emplacement
          </button>
        )}
      </div>
    </div>
  )
}
