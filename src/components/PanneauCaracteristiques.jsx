import { useState } from 'react'
import { etapesCaracteristiques } from '../lib/etapes-caracteristiques.js'

const VERIFICATIONS = {
  fiche: { libelle: 'Fiche, non testé en jeu', classes: 'border-or-700/40 text-gray-300' },
  'a-confirmer': { libelle: 'À confirmer', classes: 'border-amber-300/45 text-amber-200' },
  verifie: { libelle: 'Vérifié en jeu', classes: 'border-emerald-400/45 text-emerald-300' },
}

const socle =
  'inline-flex items-center rounded-full border px-2.5 py-1 font-rune text-[0.62rem] uppercase tracking-[0.14em]'

function Valeurs({ valeurs, stats, accent }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {stats.map((nom) => (
        <div key={nom} className={`rounded-sm border ${accent.bordDoux} ${accent.fondDoux} px-2 py-2 text-center`}>
          <p className="glyphe">{nom}</p>
          <p className="mt-1 font-display text-lg text-or-100">{valeurs[nom]}</p>
        </div>
      ))}
    </div>
  )
}

/** Vues disponibles : seulement celles que les données du build alimentent. */
export function vuesCaracteristiques(build) {
  if (!build.caracteristiques) return [{ id: 'fiche', nom: 'Valeurs de la fiche' }]
  const etapes = etapesCaracteristiques(build)
  return [
    { id: 'creation', nom: 'Création' },
    etapes.progression.length > 0 && { id: 'progression', nom: 'Progression' },
    etapes.respecialisations.length > 0 && { id: 'respec', nom: 'Respécialisation' },
    etapes.equipees.length > 0 && { id: 'equipement', nom: 'Équipement' },
    etapes.export && { id: 'export', nom: 'Export utilisateur' },
  ].filter(Boolean)
}

/**
 * Caractéristiques en vues nommées : la création n'est pas une cible
 * équipée, la progression n'est pas une respécialisation, et l'export du
 * joueur reste distinct de la référence éditoriale.
 */
export default function PanneauCaracteristiques({ build, accent }) {
  const vues = vuesCaracteristiques(build)
  const [vue, setVue] = useState(vues[0].id)
  const actuelle = vues.some((entree) => entree.id === vue) ? vue : vues[0].id
  const etapes = build.caracteristiques ? etapesCaracteristiques(build) : null
  const ordreAConfirmer = build.aConfirmer?.find((point) => point.id.includes('ordre-niveaux'))

  return (
    <div>
      <div role="group" aria-label="Vue des caractéristiques" className="flex flex-wrap gap-2">
        {vues.map((entree) => (
          <button
            key={entree.id}
            type="button"
            aria-pressed={entree.id === actuelle}
            onClick={() => setVue(entree.id)}
            className={`bouton min-h-[44px] ${entree.id === actuelle ? '!border-or-300 !text-or-100 bg-voile/[0.06]' : ''}`}
          >
            {entree.nom}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {actuelle === 'fiche' && (
          <>
            <Valeurs valeurs={build.stats} stats={Object.keys(build.stats)} accent={accent} />
            <p className="mt-3 text-xs text-gray-400">Valeurs de la fiche de l’ancienne composition, sans étapes détaillées.</p>
          </>
        )}

        {actuelle === 'creation' && (
          <>
            <Valeurs valeurs={etapes.creation} stats={etapes.stats} accent={accent} />
            <p className="mt-3 text-xs leading-relaxed text-gray-400">
              Valeurs au moment de la création du personnage : ce n’est ni la cible au niveau 12 ni les valeurs
              équipées.
            </p>
          </>
        )}

        {actuelle === 'progression' && (
          <>
            <ul className="space-y-3">
              {etapes.progression.map((etape) => (
                <li key={etape.niveau}>
                  <p className="mb-2 text-xs text-gray-300">
                    <span className="glyphe">Niveau {etape.niveau}</span> · {etape.sources.join(', ')}
                  </p>
                  <Valeurs valeurs={etape.valeurs} stats={etapes.stats} accent={accent} />
                </li>
              ))}
            </ul>
            {etapes.permanents.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs text-gray-400">
                {etapes.permanents.map((bonus) => (
                  <li key={bonus.id}>
                    {bonus.source ?? bonus.nom ?? bonus.id} : {bonus.obtenu ? 'obtenu' : 'bonus permanent non sélectionné, non compté ci-dessus'}
                  </li>
                ))}
              </ul>
            )}
            {ordreAConfirmer && (
              <p role="note" className="mt-3 text-xs leading-relaxed text-amber-200">
                ⚠ Ordre de progression à confirmer : {ordreAConfirmer.texte}
              </p>
            )}
          </>
        )}

        {actuelle === 'respec' && (
          <ul className="space-y-4">
            {etapes.respecialisations.map((respec) => (
              <li key={respec.id}>
                <p className="mb-2 text-xs text-gray-300">
                  <span className="glyphe">{respec.nom}</span>
                </p>
                <Valeurs valeurs={respec.final} stats={etapes.stats} accent={accent} />
                {respec.condition && <p className="mt-2 text-xs text-gray-400">{respec.condition}</p>}
                <p className="mt-2 text-xs text-gray-400">Proposition de la fiche, distincte de l’export du joueur.</p>
              </li>
            ))}
          </ul>
        )}

        {actuelle === 'equipement' && (
          <>
            <p className="mb-3 text-xs leading-relaxed text-gray-400">
              Valeurs fixées par un objet ou un élixir : elles remplacent la valeur naturelle si elles sont plus
              élevées, sans s’additionner. Aucune n’est comptée tant que vous ne l’avez pas choisie.
            </p>
            <ul className="space-y-2">
              {etapes.equipees.map((fixe) => {
                const verification = VERIFICATIONS[fixe.verification] ?? VERIFICATIONS.fiche
                return (
                  <li key={fixe.id} className="rounded border border-or-700/20 p-3 text-xs leading-relaxed text-gray-300">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-gray-100">{fixe.source}</span>
                      <span className={`${socle} ${verification.classes}`}>{verification.libelle}</span>
                    </span>
                    <span className="mt-1 block">
                      {fixe.stat} fixée à {fixe.fixee} (naturelle : {fixe.naturelle})
                    </span>
                    {fixe.condition && <span className="mt-1 block text-gray-400">{fixe.condition}</span>}
                  </li>
                )
              })}
            </ul>
          </>
        )}

        {actuelle === 'export' && (
          <>
            <Valeurs valeurs={etapes.export} stats={etapes.stats} accent={accent} />
            <p className="mt-3 text-xs leading-relaxed text-gray-400">
              Valeurs de l’export du joueur au niveau 12 : à comparer à la référence éditoriale, jamais fusionnées avec
              elle.
            </p>
          </>
        )}
      </div>

      {build.notesStats && actuelle === vues[0].id && (
        <p className="mt-4 text-xs leading-relaxed text-gray-400">{build.notesStats}</p>
      )}
    </div>
  )
}
