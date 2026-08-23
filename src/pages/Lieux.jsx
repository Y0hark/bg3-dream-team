import { useMemo } from 'react'
import EnteteSection from '../components/EnteteSection.jsx'
import LienExterne from '../components/LienExterne.jsx'
import Revelation from '../components/Revelation.jsx'
import { BadgeActe } from '../components/Badges.jsx'
import { ACTES } from '../data/actes.js'
import { ITEMS } from '../data/items.js'
import { LIEUX } from '../data/lieux.js'
import { estResolu, statutDe } from '../lib/progression.js'
import useProgression from '../hooks/useProgression.jsx'

export default function Lieux() {
  const { etat } = useProgression()

  // Items rattachés à chaque lieu, avec ce qu'il y reste à récupérer.
  const parLieu = useMemo(() => {
    const index = new Map(LIEUX.map((lieu) => [lieu.id, []]))
    for (const item of ITEMS) {
      if (item.lieu && index.has(item.lieu)) index.get(item.lieu).push(item)
    }
    return index
  }, [])

  const sansLieu = useMemo(() => ITEMS.filter((item) => !item.lieu), [])

  return (
    <div className="mx-auto max-w-grimoire px-5 py-12 sm:py-16">
      <EnteteSection
        surtitre="Où trouver quoi"
        titre="Cartes & lieux"
        chapeau="Les zones qui portent le loadout de la run. Aucune carte du jeu n’est copiée ici : chaque zone renvoie vers le wiki communautaire et vers une carte interactive externe."
      />

      {ACTES.map((acte) => {
        const lieux = LIEUX.filter((lieu) => lieu.acte === acte.numero)
        if (lieux.length === 0) return null

        return (
          <section key={acte.id} className="mb-12" aria-labelledby={`lieux-acte-${acte.numero}`}>
            <div className="mb-5 flex items-center gap-3">
              <h2 id={`lieux-acte-${acte.numero}`} className="grave text-xl tracking-[0.1em]">
                <span aria-hidden="true" className="mr-2">
                  {acte.icone}
                </span>
                {acte.nom}
              </h2>
              <span className="font-rune text-[0.62rem] uppercase tracking-[0.14em] text-gray-500">
                {acte.niveaux}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {lieux.map((lieu, index) => {
                const items = parLieu.get(lieu.id) ?? []
                const restants = items.filter((item) => !estResolu(statutDe(etat, item.id)))

                return (
                  <Revelation
                    key={lieu.id}
                    delai={index * 80}
                    className="group groupe-plaque h-full"
                  >
                    <article className="plaque equerres accent-vif flex h-full flex-col p-5">
                      <header className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-sm uppercase tracking-[0.08em] text-or-100">
                          {lieu.nom}
                        </h3>
                        <BadgeActe numero={lieu.acte} />
                      </header>

                      <p className="mt-3 text-sm leading-relaxed text-gray-400">{lieu.resume}</p>

                      {items.length > 0 && (
                        <ul className="mt-4 space-y-1.5">
                          {items.map((item) => {
                            const resolu = estResolu(statutDe(etat, item.id))
                            return (
                              <li
                                key={item.id}
                                className={`flex items-center gap-2 text-sm ${
                                  resolu ? 'text-gray-500 line-through' : 'text-gray-300'
                                }`}
                              >
                                <span aria-hidden="true" className="text-or-500">
                                  {resolu ? '◆' : '○'}
                                </span>
                                {item.nom}
                              </li>
                            )
                          })}
                        </ul>
                      )}

                      <p className="mt-4 font-rune text-[0.62rem] uppercase tracking-[0.14em] text-gray-500">
                        {items.length === 0
                          ? 'Aucun item rattaché'
                          : `${restants.length} item(s) encore à récupérer ici`}
                      </p>

                      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5">
                        <LienExterne href={lieu.wiki}>Wiki</LienExterne>
                        <LienExterne href={lieu.carte}>Carte interactive</LienExterne>
                      </div>
                    </article>
                  </Revelation>
                )
              })}
            </div>
          </section>
        )
      })}

      {sansLieu.length > 0 && (
        <Revelation className="plaque p-5">
          <p className="glyphe mb-3">Items encore à localiser</p>
          <ul className="flex flex-wrap gap-2">
            {sansLieu.map((item) => (
              <li
                key={item.id}
                className="rounded-full border border-or-700/35 px-2.5 py-1 font-rune text-[0.62rem] uppercase tracking-[0.12em] text-gray-400"
              >
                {item.nom}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-gray-500">
            Ces sources sont vérifiées et complétées au ticket 2/4.
          </p>
        </Revelation>
      )}
    </div>
  )
}
