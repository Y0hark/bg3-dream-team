import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import EnteteSection from '../components/EnteteSection.jsx'
import EtatVide from '../components/EtatVide.jsx'
import FiltresItems from '../components/FiltresItems.jsx'
import ItemCard from '../components/ItemCard.jsx'
import BarreProgression from '../components/BarreProgression.jsx'
import Revelation from '../components/Revelation.jsx'
import { BadgeActe } from '../components/Badges.jsx'
import { ITEMS } from '../data/items.js'
import {
  FILTRES_VIDES,
  compter,
  filtrerItems,
  filtresDepuisParams,
  filtresVersParams,
  grouperParActe,
  statutDe,
  trierItems,
} from '../lib/progression.js'
import useProgression from '../hooks/useProgression.jsx'

export default function Items() {
  const { etat } = useProgression()

  // Les filtres vivent dans l'URL : une vue filtrée survit au rechargement
  // et peut être envoyée telle quelle à un coéquipier.
  const [params, setParams] = useSearchParams()
  const filtres = useMemo(() => filtresDepuisParams(params), [params])

  const setFiltres = useCallback(
    (miseAJour) => {
      setParams(
        (precedents) => {
          const actuels = filtresDepuisParams(precedents)
          const suivants =
            typeof miseAJour === 'function' ? miseAJour(actuels) : miseAJour
          return filtresVersParams(suivants)
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const resultats = useMemo(
    () => trierItems(filtrerItems(ITEMS, filtres, etat)),
    [filtres, etat],
  )
  const progression = useMemo(() => compter(resultats, etat), [resultats, etat])
  // 53 items en une seule grille ne se lisent pas : on découpe par acte,
  // qui est l'ordre dans lequel la run les récupère.
  const groupes = useMemo(() => grouperParActe(resultats), [resultats])

  return (
    <div className="mx-auto max-w-grimoire px-5 py-12 sm:py-16">
      <EnteteSection
        surtitre="Catalogue"
        titre="Items de la run"
        chapeau="Filtrez par acte, personnage, priorité ou statut. Un clic sur un statut le met à jour ; la progression est mémorisée dans ce navigateur, et les filtres sont dans l’adresse de la page — elle se partage telle quelle."
      />

      <FiltresItems
        filtres={filtres}
        setFiltres={setFiltres}
        resultats={resultats.length}
        total={ITEMS.length}
      />

      {resultats.length > 0 && (
        <Revelation className="plaque mb-8 p-5">
          <BarreProgression
            libelle="Sélection courante"
            detail={`${progression.resolus}/${progression.total} résolus · ${progression.rates} ratés`}
            pourcentage={progression.pourcentage}
          />
        </Revelation>
      )}

      {resultats.length === 0 ? (
        <EtatVide
          titre="Aucun item ne correspond"
          message="Aucun item du catalogue ne satisfait cette combinaison de filtres. Élargissez la recherche ou réinitialisez les filtres."
          action={
            <button type="button" className="bouton mt-2" onClick={() => setFiltres(FILTRES_VIDES)}>
              Réinitialiser les filtres
            </button>
          }
        />
      ) : (
        <div className="space-y-12">
          {groupes.map(({ acte, items }) => {
            const compte = compter(items, etat)
            return (
              <section key={acte.id} aria-labelledby={`items-acte-${acte.numero}`}>
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-or-700/25 pb-3">
                  <div className="flex items-center gap-3">
                    <h2 id={`items-acte-${acte.numero}`} className="grave text-lg tracking-[0.1em]">
                      <span aria-hidden="true" className="mr-2">
                        {acte.icone}
                      </span>
                      {acte.nom}
                    </h2>
                    <BadgeActe numero={acte.numero} />
                  </div>
                  <p className="font-rune text-[0.65rem] uppercase tracking-[0.14em] text-gray-500">
                    {compte.resolus}/{compte.total} résolus
                    {compte.rates > 0 ? ` · ${compte.rates} ratés` : ''}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((item, index) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      statut={statutDe(etat, item.id)}
                      index={index}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
