import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import BarreProgression from '../components/BarreProgression.jsx'
import EnteteSection from '../components/EnteteSection.jsx'
import Revelation from '../components/Revelation.jsx'
import { BadgeActe, BadgePriorite } from '../components/Badges.jsx'
import { ACTES } from '../data/actes.js'
import { BUILDS, buildDe } from '../data/builds.js'
import { ITEMS } from '../data/items.js'
import { accentDe, variableAccent } from '../lib/accents.js'
import {
  compter,
  itemsCritiques,
  itemsRates,
  progressionParActe,
  progressionParPersonnage,
  trierItems,
} from '../lib/progression.js'
import useProgression from '../hooks/useProgression.jsx'

/** Grand chiffre de synthèse (items résolus, ratés, actes bouclés…). */
function Compteur({ valeur, libelle, teinte = 'text-or-100' }) {
  return (
    <div className="plaque px-5 py-4">
      <p className={`font-display text-3xl leading-none ${teinte}`}>{valeur}</p>
      <p className="glyphe mt-2">{libelle}</p>
    </div>
  )
}

function BoutonReset() {
  const { reinitialiser } = useProgression()
  const [confirme, setConfirme] = useState(false)

  if (!confirme) {
    return (
      <button type="button" className="bouton" onClick={() => setConfirme(true)}>
        Reset progression
      </button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="font-rune text-[0.65rem] uppercase tracking-[0.14em] text-red-300">
        Effacer toute la progression ?
      </p>
      <button
        type="button"
        className="bouton border-red-400/50 text-red-300 hover:border-red-300 hover:text-red-200"
        onClick={() => {
          reinitialiser()
          setConfirme(false)
        }}
      >
        Confirmer
      </button>
      <button type="button" className="bouton" onClick={() => setConfirme(false)}>
        Annuler
      </button>
    </div>
  )
}

export default function Dashboard() {
  const { etat } = useProgression()

  const global = useMemo(() => compter(ITEMS, etat), [etat])
  const parActe = useMemo(() => progressionParActe(ITEMS, etat), [etat])
  const parPersonnage = useMemo(() => progressionParPersonnage(ITEMS, etat, BUILDS), [etat])
  const rates = useMemo(() => trierItems(itemsRates(ITEMS, etat)), [etat])
  const critiques = useMemo(() => trierItems(itemsCritiques(ITEMS, etat)).slice(0, 6), [etat])

  return (
    <div className="mx-auto max-w-grimoire px-5 py-12 sm:py-16">
      <EnteteSection
        surtitre="Mode Honneur · une seule sauvegarde"
        titre="BG3 Honor Run Tracker"
        chapeau="La synthèse de la run : où en est l’équipe, ce qui reste à récupérer acte par acte, et ce qui a été manqué. Tout est stocké dans ce navigateur — rien ne part sur un serveur."
        aside={<BoutonReset />}
      />

      {/* --- Chiffres de tête ---------------------------------------- */}
      <Revelation className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Compteur valeur={`${global.pourcentage} %`} libelle="Loadout résolu" />
        <Compteur valeur={`${global.resolus}/${global.total}`} libelle="Items sécurisés" />
        <Compteur
          valeur={global.restants}
          libelle="Encore à récupérer"
          teinte="text-amber-100"
        />
        <Compteur
          valeur={global.rates}
          libelle="Ratés"
          teinte={global.rates > 0 ? 'text-red-300' : 'text-gray-400'}
        />
      </Revelation>

      <Revelation className="plaque mt-4 p-5">
        <BarreProgression
          libelle="Progression globale"
          detail={`${global.resolus} résolus · ${global.rates} ratés · ${global.restants} restants`}
          pourcentage={global.pourcentage}
        />
      </Revelation>

      {/* --- L'équipe -------------------------------------------------- */}
      <section className="mt-14" aria-labelledby="titre-equipe">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 id="titre-equipe" className="grave text-xl tracking-[0.1em]">
            L’équipe
          </h2>
          <Link
            to="/builds"
            className="font-rune text-[0.65rem] uppercase tracking-[0.18em] text-or-500 transition-colors hover:text-or-100"
          >
            Toutes les fiches →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {parPersonnage.map(({ build, ...progression }, index) => {
            const accent = accentDe(build)
            return (
              <Revelation
                key={build.id}
                delai={index * 90}
                className="group groupe-plaque"
                style={variableAccent(build)}
              >
                <Link
                  to={`/builds/${build.id}`}
                  className="plaque equerres accent-vif flex h-full flex-col p-5"
                >
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="sceau-carte text-2xl">
                      {build.icone}
                    </span>
                    <div className="min-w-0">
                      <p className={`font-display text-sm uppercase tracking-[0.1em] ${accent.texte}`}>
                        {build.personnage}
                      </p>
                      <p className="truncate font-rune text-[0.62rem] uppercase tracking-[0.14em] text-gray-500">
                        {build.role}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-snug text-gray-300">{build.nom}</p>
                  <BarreProgression
                    className="mt-auto pt-5"
                    libelle="Loadout"
                    detail={`${progression.resolus}/${progression.total}`}
                    pourcentage={progression.pourcentage}
                    teinte={accent.barre}
                  />
                </Link>
              </Revelation>
            )
          })}
        </div>
      </section>

      {/* --- Les actes ------------------------------------------------- */}
      <section className="mt-14" aria-labelledby="titre-actes">
        <h2 id="titre-actes" className="grave mb-6 text-xl tracking-[0.1em]">
          Progression par acte
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {parActe.map(({ acte, ...progression }, index) => (
            <Revelation key={acte.id} delai={index * 90} className="plaque flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg uppercase tracking-[0.12em] text-or-100">
                    <span aria-hidden="true" className="mr-2">
                      {acte.icone}
                    </span>
                    {acte.nom}
                  </p>
                  <p className="mt-1 font-rune text-[0.62rem] uppercase tracking-[0.14em] text-gray-500">
                    {acte.niveaux}
                  </p>
                </div>
                <BadgeActe numero={acte.numero} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">{acte.resume}</p>
              <BarreProgression
                className="mt-auto pt-5"
                libelle="Items de l’acte"
                detail={`${progression.resolus}/${progression.total}`}
                pourcentage={progression.pourcentage}
              />
            </Revelation>
          ))}
        </div>
      </section>

      {/* --- Risques --------------------------------------------------- */}
      <section className="mt-14" aria-labelledby="titre-risques">
        <h2 id="titre-risques" className="grave mb-6 text-xl tracking-[0.1em]">
          Risques et urgences
        </h2>

        <div className="grid gap-4 lg:grid-cols-2">
          <Revelation className="plaque p-5">
            <p className="glyphe mb-4">Items ratés</p>
            {rates.length === 0 ? (
              <p className="text-sm text-gray-400">
                Aucun item marqué « Raté ». La run est propre pour l’instant.
              </p>
            ) : (
              <ul className="space-y-3">
                {rates.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-red-300 line-through">{item.nom}</span>
                    <BadgeActe numero={item.acte} />
                    <BadgePriorite priorite={item.priorite} />
                    <span className="font-rune text-[0.62rem] uppercase tracking-[0.14em] text-gray-500">
                      {buildDe(item.personnage)?.personnage ?? 'Équipe'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Revelation>

          <Revelation delai={90} className="plaque p-5">
            <p className="glyphe mb-4">Prochaines priorités</p>
            {critiques.length === 0 ? (
              <p className="text-sm text-gray-400">
                Tous les items S+ et S sont sécurisés. Il reste à finir les priorités basses.
              </p>
            ) : (
              <ul className="space-y-3">
                {critiques.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-200">{item.nom}</span>
                    <BadgeActe numero={item.acte} />
                    <BadgePriorite priorite={item.priorite} />
                    <span className="font-rune text-[0.62rem] uppercase tracking-[0.14em] text-gray-500">
                      {buildDe(item.personnage)?.personnage ?? 'Équipe'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              to="/items"
              className="mt-5 inline-flex font-rune text-[0.65rem] uppercase tracking-[0.18em] text-or-500 transition-colors hover:text-or-100"
            >
              Ouvrir le catalogue →
            </Link>
          </Revelation>
        </div>
      </section>

      {/* --- Rappel des checklists ------------------------------------- */}
      <Revelation className="plaque mt-14 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="grave text-base tracking-[0.1em]">Avant chaque point de non-retour</p>
          <p className="mt-1 text-sm text-gray-400">
            {ACTES.length} checklists de fin d’acte : ce qui doit être vrai avant de franchir la porte.
          </p>
        </div>
        <Link to="/checklist" className="bouton">
          Ouvrir les checklists
        </Link>
      </Revelation>
    </div>
  )
}
