import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import BarreProgression from '../components/BarreProgression.jsx'
import EnteteSection from '../components/EnteteSection.jsx'
import EtatVide from '../components/EtatVide.jsx'
import LienExterne from '../components/LienExterne.jsx'
import Revelation from '../components/Revelation.jsx'
import { BadgeActe, BadgePriorite, BadgeStatut } from '../components/Badges.jsx'
import { BUILDS } from '../data/builds.js'
import { ITEMS } from '../data/items.js'
import { lieuDe } from '../data/lieux.js'
import { accentDe, variableAccent } from '../lib/accents.js'
import { compter, estResolu, statutDe, trierItems } from '../lib/progression.js'
import useProgression from '../hooks/useProgression.jsx'

/** Tableau du loadout d'un personnage : un slot par ligne, statut cliquable. */
function TableauLoadout({ items, etat, basculerItem }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[46rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-or-700/25">
            {['Obtenu', 'Slot', 'Item', 'Acte', 'Priorité', 'Lieu', 'Statut'].map((entete) => (
              <th key={entete} scope="col" className="glyphe px-3 py-2">
                {entete}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const statut = statutDe(etat, item.id)
            const lieu = lieuDe(item.lieu)
            return (
              <tr
                key={item.id}
                className={`border-b border-or-700/15 transition-colors hover:bg-voile/[0.03] ${
                  estResolu(statut) ? 'opacity-70' : ''
                }`}
              >
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-current"
                    checked={statut === 'obtenu'}
                    onChange={() => basculerItem(item.id)}
                    aria-label={`Marquer ${item.nom} comme obtenu`}
                  />
                </td>
                <td className="px-3 py-3 font-rune text-[0.68rem] uppercase tracking-[0.12em] text-gray-500">
                  {item.slot}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`text-sm ${statut === 'rate' ? 'text-red-300 line-through' : 'text-gray-200'}`}
                  >
                    {item.nom}
                  </span>
                  <br />
                  <LienExterne href={item.wiki}>Wiki</LienExterne>
                </td>
                <td className="px-3 py-3">
                  <BadgeActe numero={item.acte} />
                </td>
                <td className="px-3 py-3">
                  <BadgePriorite priorite={item.priorite} />
                </td>
                <td className="px-3 py-3 text-sm text-gray-400">
                  {lieu ? lieu.nom : 'À localiser'}
                </td>
                <td className="px-3 py-3">
                  <BadgeStatut statut={statut} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function Loadout() {
  const { etat, basculerItem } = useProgression()

  const parPersonnage = useMemo(
    () =>
      BUILDS.map((build) => {
        const items = trierItems(ITEMS.filter((item) => item.personnage === build.id))
        return { build, items, progression: compter(items, etat) }
      }),
    [etat],
  )

  return (
    <div className="mx-auto max-w-grimoire px-5 py-12 sm:py-16">
      <EnteteSection
        surtitre="Par personnage"
        titre="Loadouts cibles"
        chapeau="Le plan d’équipement final, slot par slot. La case à cocher bascule l’item entre « À récupérer » et « Obtenu » ; les statuts « Raté » et « Remplacé » se posent depuis le catalogue."
      />

      <div className="space-y-8">
        {parPersonnage.map(({ build, items, progression }, index) => {
          const accent = accentDe(build)
          return (
            <Revelation
              key={build.id}
              delai={index * 80}
              className="plaque p-5 sm:p-6"
              style={variableAccent(build)}
            >
              <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="text-2xl">
                    {build.icone}
                  </span>
                  <div>
                    <Link
                      to={`/builds/${build.id}`}
                      className={`font-display text-base uppercase tracking-[0.1em] ${accent.texte} transition-colors hover:text-or-100`}
                    >
                      {build.personnage} — {build.nom}
                    </Link>
                    <p className="mt-1 font-rune text-[0.62rem] uppercase tracking-[0.14em] text-gray-500">
                      {build.split}
                    </p>
                  </div>
                </div>
                <BarreProgression
                  className="w-full max-w-xs"
                  libelle="Items sécurisés"
                  detail={`${progression.resolus}/${progression.total}`}
                  pourcentage={progression.pourcentage}
                  teinte={accent.barre}
                />
              </header>

              {items.length === 0 ? (
                <EtatVide
                  titre="Loadout à encoder"
                  message="Les items de ce personnage arrivent au ticket 2/4."
                />
              ) : (
                <TableauLoadout items={items} etat={etat} basculerItem={basculerItem} />
              )}
            </Revelation>
          )
        })}
      </div>
    </div>
  )
}
