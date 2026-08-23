import { useMemo } from 'react'
import BuildCard from '../components/BuildCard.jsx'
import EnteteSection from '../components/EnteteSection.jsx'
import { BUILDS } from '../data/builds.js'
import { ITEMS } from '../data/items.js'
import { progressionParPersonnage } from '../lib/progression.js'
import useProgression from '../hooks/useProgression.jsx'

export default function Builds() {
  const { etat } = useProgression()
  const progressions = useMemo(
    () => progressionParPersonnage(ITEMS, etat, BUILDS),
    [etat],
  )

  return (
    <div className="mx-auto max-w-grimoire px-5 py-12 sm:py-16">
      <EnteteSection
        surtitre="Quatre builds, une seule run"
        titre="Les builds de la dream team"
        chapeau="Splits validés au cadrage : chaque fiche détaille le leveling 1 → 12, la boucle de jeu, les synergies d’équipe et les points de vigilance propres au mode Honneur."
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {BUILDS.map((build, index) => {
          const { build: _, ...progression } =
            progressions.find((entree) => entree.build.id === build.id) ?? {}
          return (
            <BuildCard
              key={build.id}
              build={build}
              index={index}
              progression={progression.total ? progression : null}
            />
          )
        })}
      </div>
    </div>
  )
}
