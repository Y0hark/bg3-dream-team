import { useMemo } from 'react'
import BuildCard from '../components/BuildCard.jsx'
import EnteteSection from '../components/EnteteSection.jsx'
import { Link } from 'react-router-dom'
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
        surtitre="Quatre rôles, une seule run"
        titre="Les builds de la dream team"
        chapeau={
          <>
            Chaque fiche détaille le leveling 1 → 12, les variantes, la boucle de jeu, les synergies d’équipe et les points de vigilance du mode Honneur. Aucun joueur n’est encore affecté à un rôle. Les builds de l’ancienne équipe restent consultables dans{' '}
            <Link to="/archive" className="underline underline-offset-4 hover:text-or-100">
              l’archive
            </Link>
            .
          </>
        }
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
