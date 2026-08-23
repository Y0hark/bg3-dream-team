import { useMemo } from 'react'
import BarreProgression from '../components/BarreProgression.jsx'
import EnteteSection from '../components/EnteteSection.jsx'
import Revelation from '../components/Revelation.jsx'
import { BadgeActe } from '../components/Badges.jsx'
import { acteDe } from '../data/actes.js'
import { CHECKLISTS } from '../data/checklists.js'
import { ITEMS } from '../data/items.js'
import { compter } from '../lib/progression.js'
import useProgression from '../hooks/useProgression.jsx'

export default function Checklist() {
  const { etat, basculerChecklist } = useProgression()

  const parActe = useMemo(
    () =>
      CHECKLISTS.map((checklist) => {
        const coches = checklist.entrees.filter((entree) => etat.checklist[entree.id]).length
        const items = compter(
          ITEMS.filter((item) => item.acte === checklist.acte),
          etat,
        )
        return { checklist, coches, items }
      }),
    [etat],
  )

  return (
    <div className="mx-auto max-w-grimoire px-5 py-12 sm:py-16">
      <EnteteSection
        surtitre="Points de non-retour"
        titre="Checklists de run"
        chapeau="En Honneur, il n’y a pas de retour en arrière. Ces listes valident qu’un acte est réellement terminé avant de franchir la porte suivante."
      />

      <div className="space-y-6">
        {parActe.map(({ checklist, coches, items }, index) => {
          const acte = acteDe(checklist.acte)
          const total = checklist.entrees.length
          const complet = coches === total

          return (
            <Revelation key={checklist.acte} delai={index * 90} className="plaque p-5 sm:p-6">
              <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <BadgeActe numero={checklist.acte} />
                    {complet && (
                      <span className="font-rune text-[0.62rem] uppercase tracking-[0.14em] text-emerald-300">
                        Acte validé
                      </span>
                    )}
                  </div>
                  <h2 className="grave mt-3 text-base tracking-[0.08em]">{checklist.titre}</h2>
                  {acte && (
                    <p className="mt-1 font-rune text-[0.62rem] uppercase tracking-[0.14em] text-gray-500">
                      {acte.sousTitre} · {acte.niveaux}
                    </p>
                  )}
                </div>

                <div className="w-full max-w-xs space-y-3">
                  <BarreProgression
                    libelle="Checklist"
                    detail={`${coches}/${total}`}
                    pourcentage={total === 0 ? 0 : Math.round((coches / total) * 100)}
                    teinte={complet ? 'bg-emerald-400/80' : 'bg-or-300/80'}
                  />
                  <BarreProgression
                    libelle="Items de l’acte"
                    detail={`${items.resolus}/${items.total}`}
                    pourcentage={items.pourcentage}
                  />
                </div>
              </header>

              <ul className="space-y-1">
                {checklist.entrees.map((entree) => {
                  const coche = Boolean(etat.checklist[entree.id])
                  return (
                    <li key={entree.id}>
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-sm px-3 py-2.5 transition-colors hover:bg-voile/[0.04] ${
                          coche ? 'text-gray-500' : 'text-gray-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 shrink-0"
                          checked={coche}
                          onChange={() => basculerChecklist(entree.id)}
                        />
                        <span className={`text-sm leading-relaxed ${coche ? 'line-through' : ''}`}>
                          {entree.texte}
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </Revelation>
          )
        })}
      </div>
    </div>
  )
}
