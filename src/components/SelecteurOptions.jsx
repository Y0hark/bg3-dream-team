import { useState } from 'react'
import IconeObjet from './IconeObjet.jsx'
import { BadgesUsages } from './FicheObjet.jsx'
import { NOMS_USAGES } from '../data/objets-meta.js'
import { objetDe } from '../data/objets.js'
import { NOMS_NATURES } from '../lib/alternatives.js'
import { SEUIL_ALTERNATIVES, optionsVisibles, usagesDisponibles } from '../lib/inventaire.js'
import { nomsObjet } from '../lib/localisation.js'

const socle =
  'inline-flex items-center rounded-full border px-2.5 py-1 font-rune text-[0.62rem] uppercase tracking-[0.14em]'

const TEINTES_NATURE = {
  reference: 'border-amber-300/50 text-amber-100 bg-amber-400/10',
  equivalente: 'border-sky-400/45 text-sky-200 bg-sky-500/10',
  situationnelle: 'border-purple-400/40 text-purple-200',
  transition: 'border-or-700/40 text-gray-400',
}

/**
 * Liste des options d'un emplacement : la référence, puis jusqu'à trois
 * alternatives (« Voir toutes les options » pour le reste). Choisir une option
 * modifie le plan du rôle uniquement — jamais la possession ni l'équipement.
 */
export default function SelecteurOptions({ emplacement, onChoisir, onFiche }) {
  const [toutes, setToutes] = useState(false)
  const [usage, setUsage] = useState(null)

  const usages = usagesDisponibles(emplacement.options)
  const visibles = optionsVisibles(emplacement.options, { toutes, usage })
  const masquees = optionsVisibles(emplacement.options, { toutes: true, usage }).length - visibles.length
  const choisi = emplacement.courante?.objet
  const reference = emplacement.reference

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-gray-400">
        Choisir une option change le plan de ce rôle pour cet acte. L’objet n’est pas marqué comme obtenu ni équipé.
      </p>

      {emplacement.choisie && reference && (
        <button type="button" className="bouton min-h-[44px]" onClick={() => onChoisir(null)}>
          Revenir à la référence
        </button>
      )}

      {usages.length > 1 && (
        <div role="group" aria-label="Filtrer par usage" className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={usage === null}
            onClick={() => setUsage(null)}
            className={`${socle} min-h-[44px] ${usage === null ? 'border-or-300 text-or-100' : 'border-or-700/30 text-gray-400'}`}
          >
            Tous
          </button>
          {usages.map((entree) => (
            <button
              key={entree}
              type="button"
              aria-pressed={usage === entree}
              onClick={() => setUsage(entree)}
              className={`${socle} min-h-[44px] ${usage === entree ? 'border-or-300 text-or-100' : 'border-or-700/30 text-gray-400'}`}
            >
              {NOMS_USAGES[entree]}
            </button>
          ))}
        </div>
      )}

      <ul className="space-y-3">
        {visibles.map((option) => {
          const objet = objetDe(option.objet)
          const noms = nomsObjet(objet)
          const actif = option.objet === choisi
          return (
            <li key={option.objet} className={`rounded border p-3 ${actif ? 'border-emerald-400/45' : 'border-or-700/20'}`}>
              <div className="flex items-start gap-3">
                <IconeObjet objet={objet} taille={40} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-100">{noms.principal}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <span className={`${socle} ${TEINTES_NATURE[option.nature]}`}>{NOMS_NATURES[option.nature]}</span>
                    {actif && <span className={`${socle} border-emerald-400/45 text-emerald-300`}>Choisi pour ce plan</span>}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-gray-300">
                {option.comparaison ?? option.interet}
              </p>
              <div className="mt-2">
                <BadgesUsages usages={option.usages} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="bouton min-h-[44px]"
                  disabled={actif}
                  onClick={() => onChoisir(option.objet)}
                >
                  {actif ? 'Choisi' : option === reference ? 'Utiliser la référence' : 'Choisir'}
                </button>
                <button type="button" className="bouton min-h-[44px]" onClick={() => onFiche(option)}>
                  Fiche et acquisition
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {masquees > 0 && (
        <button type="button" className="bouton min-h-[44px]" onClick={() => setToutes(true)}>
          Voir toutes les options ({masquees} de plus)
        </button>
      )}
      {toutes && emplacement.options.length > SEUIL_ALTERNATIVES + 1 && (
        <button type="button" className="bouton min-h-[44px]" onClick={() => setToutes(false)}>
          Réduire la liste
        </button>
      )}
    </div>
  )
}
