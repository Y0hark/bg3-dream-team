import { Link, Navigate, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import BarreProgression from '../components/BarreProgression.jsx'
import EnteteSection from '../components/EnteteSection.jsx'
import ItemCard from '../components/ItemCard.jsx'
import Revelation from '../components/Revelation.jsx'
import EtatVide from '../components/EtatVide.jsx'
import { buildDe } from '../data/builds.js'
import { ITEMS } from '../data/items.js'
import { accentDe, variableAccent } from '../lib/accents.js'
import { compter, statutDe, trierItems } from '../lib/progression.js'
import useProgression from '../hooks/useProgression.jsx'

function Liste({ titre, entrees, accent }) {
  if (!entrees?.length) return null
  return (
    <Revelation className="plaque p-6">
      <h2 className="grave text-base tracking-[0.1em]">{titre}</h2>
      <div aria-hidden="true" className={`mt-3 h-px w-10 ${accent.trait}`} />
      <ul className="mt-4 space-y-3">
        {entrees.map((entree) => (
          <li key={entree} className="flex gap-3 text-sm leading-relaxed text-gray-300">
            <span aria-hidden="true" className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${accent.barre}`} />
            {entree}
          </li>
        ))}
      </ul>
    </Revelation>
  )
}

export default function BuildPage() {
  const { id } = useParams()
  const build = buildDe(id)
  const { etat } = useProgression()

  const items = useMemo(
    () => trierItems(ITEMS.filter((item) => item.personnage === id)),
    [id],
  )
  const progression = useMemo(() => compter(items, etat), [items, etat])

  // Un identifiant inconnu (lien périmé, faute de frappe) revient à la liste.
  if (!build) return <Navigate to="/builds" replace />

  const accent = accentDe(build)

  return (
    <div className="mx-auto max-w-grimoire px-5 py-12 sm:py-16" style={variableAccent(build)}>
      <EnteteSection
        surtitre={
          <>
            <Link to="/builds" className="transition-colors hover:text-or-100">
              Builds
            </Link>
            {' · '}
            {build.personnage}
          </>
        }
        titre={build.nom}
        chapeau={build.resume}
        aside={
          <div className="text-right">
            <p className={`font-rune text-xs uppercase tracking-[0.14em] ${accent.texteVif}`}>
              {build.role}
            </p>
            <p className="mt-1 font-rune text-[0.65rem] uppercase tracking-[0.14em] text-gray-500">
              {build.split}
            </p>
          </div>
        }
      />

      {/* --- Caractéristiques ----------------------------------------- */}
      <Revelation className="plaque p-6">
        <h2 className="grave text-base tracking-[0.1em]">Caractéristiques cibles</h2>
        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Object.entries(build.stats).map(([nom, valeur]) => (
            <div key={nom} className={`rounded-sm border ${accent.bordDoux} ${accent.fondDoux} px-3 py-3 text-center`}>
              <p className="glyphe">{nom}</p>
              <p className="mt-1 font-display text-xl text-or-100">{valeur}</p>
            </div>
          ))}
        </div>
        {build.notesStats && (
          <p className="mt-4 text-sm leading-relaxed text-gray-400">{build.notesStats}</p>
        )}
      </Revelation>

      {/* --- Leveling -------------------------------------------------- */}
      <section className="mt-12" aria-labelledby="titre-leveling">
        <h2 id="titre-leveling" className="grave mb-6 text-xl tracking-[0.1em]">
          Leveling 1 → 12
        </h2>
        <ol className="space-y-2">
          {build.leveling.map((palier, index) => (
            <Revelation
              key={palier.niveau}
              as="li"
              variante="gauche"
              delai={Math.min(index, 8) * 45}
              className="plaque flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-4"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${accent.bord} font-rune text-xs text-or-100`}
              >
                {palier.niveau}
              </span>
              <span className={`font-rune text-[0.7rem] uppercase tracking-[0.16em] ${accent.texteVif}`}>
                {palier.classe}
              </span>
              <span className="min-w-[12rem] flex-1 text-sm leading-relaxed text-gray-300">
                {palier.gains}
              </span>
            </Revelation>
          ))}
        </ol>
      </section>

      {/* --- Dons ------------------------------------------------------ */}
      <section className="mt-12" aria-labelledby="titre-dons">
        <h2 id="titre-dons" className="grave mb-6 text-xl tracking-[0.1em]">
          Dons
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {build.feats.map((feat, index) => (
            <Revelation key={feat.nom} delai={index * 80} className="plaque p-5">
              <p className="glyphe">Niveau {feat.niveau}</p>
              <p className="mt-2 font-display text-sm uppercase tracking-[0.08em] text-or-100">
                {feat.nom}
              </p>
              {feat.note && <p className="mt-2 text-sm leading-relaxed text-gray-400">{feat.note}</p>}
            </Revelation>
          ))}
        </div>
      </section>

      {/* --- Jeu ------------------------------------------------------- */}
      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        <Liste titre="Boucle de jeu" entrees={build.boucle} accent={accent} />
        <Liste titre="Synergies d’équipe" entrees={build.synergies} accent={accent} />
        <Liste titre="Points de vigilance" entrees={build.vigilance} accent={accent} />
      </div>

      {/* --- Loadout du personnage ------------------------------------- */}
      <section className="mt-12" aria-labelledby="titre-loadout">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 id="titre-loadout" className="grave text-xl tracking-[0.1em]">
            Loadout cible
          </h2>
          <BarreProgression
            className="w-full max-w-xs"
            libelle="Items sécurisés"
            detail={`${progression.resolus}/${progression.total}`}
            pourcentage={progression.pourcentage}
            teinte={accent.barre}
          />
        </div>

        {items.length === 0 ? (
          <EtatVide
            titre="Aucun item rattaché"
            message="Aucun item du catalogue n’est rattaché à ce personnage."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => (
              <ItemCard
                key={item.id}
                item={item}
                statut={statutDe(etat, item.id)}
                index={index}
                montrerPersonnage={false}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
