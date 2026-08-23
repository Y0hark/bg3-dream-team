import { useMemo, useState } from 'react'
import EnteteSection from '../components/EnteteSection.jsx'
import EtatVide from '../components/EtatVide.jsx'
import FiltresItems from '../components/FiltresItems.jsx'
import ItemCard from '../components/ItemCard.jsx'
import BarreProgression from '../components/BarreProgression.jsx'
import Revelation from '../components/Revelation.jsx'
import { ITEMS } from '../data/items.js'
import {
  FILTRES_VIDES,
  compter,
  filtrerItems,
  statutDe,
  trierItems,
} from '../lib/progression.js'
import useProgression from '../hooks/useProgression.jsx'

export default function Items() {
  const { etat } = useProgression()
  const [filtres, setFiltres] = useState(FILTRES_VIDES)

  const resultats = useMemo(
    () => trierItems(filtrerItems(ITEMS, filtres, etat)),
    [filtres, etat],
  )
  const progression = useMemo(() => compter(resultats, etat), [resultats, etat])

  return (
    <div className="mx-auto max-w-grimoire px-5 py-12 sm:py-16">
      <EnteteSection
        surtitre="Catalogue"
        titre="Items de la run"
        chapeau="Filtrez par acte, personnage, priorité ou statut. Un clic sur un statut le met à jour ; la progression est mémorisée dans ce navigateur."
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {resultats.map((item, index) => (
            <ItemCard key={item.id} item={item} statut={statutDe(etat, item.id)} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}
