import { Link } from 'react-router-dom'
import Revelation from './Revelation.jsx'
import BarreProgression from './BarreProgression.jsx'
import { accentDe, variableAccent } from '../lib/accents.js'

export default function BuildCard({ build, index = 0, progression }) {
  const accent = accentDe(build)

  return (
    <Revelation
      as="article"
      delai={index * 110}
      className="group groupe-plaque"
      style={variableAccent(build)}
    >
      <Link
        to={`/builds/${build.id}`}
        className="plaque equerres accent-vif flex h-full flex-col overflow-hidden p-6"
      >
        {/* Lueur d'accent : le sceau chauffe quand on approche */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${accent.halo} to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100`}
        />

        <header className="relative flex items-start justify-between gap-4">
          <span aria-hidden="true" className="sceau-carte text-4xl">
            {build.icone}
          </span>
          <span className={`glyphe ${accent.texteVif}`}>{build.personnage}</span>
        </header>

        {/* Hauteur réservée pour deux lignes : les quatre cartes restent alignées */}
        <h3 className="grave relative mt-5 min-h-[3.25rem] text-lg leading-snug tracking-[0.08em]">
          {build.nom}
        </h3>

        <p className="relative mt-1 font-rune text-[0.7rem] uppercase tracking-[0.16em] text-gray-400">
          {build.split}
        </p>

        <div aria-hidden="true" className={`relative mt-4 h-px w-10 ${accent.trait}`} />

        <p className="relative mt-4 text-sm leading-relaxed text-gray-300">{build.resume}</p>

        <ul className="relative mt-5 flex flex-wrap gap-2">
          <li
            className={`rounded-full border px-2.5 py-1 font-rune text-[0.62rem] uppercase tracking-[0.14em] ${accent.puce}`}
          >
            {build.role}
          </li>
        </ul>

        {progression && (
          <BarreProgression
            className="relative mt-6"
            libelle="Loadout"
            detail={`${progression.resolus}/${progression.total}`}
            pourcentage={progression.pourcentage}
            teinte={accent.barre}
          />
        )}

        <p className="relative mt-auto flex items-center gap-2 pt-6 font-rune text-[0.65rem] uppercase tracking-[0.2em] text-or-500 transition-colors duration-300 group-hover:text-or-100">
          Ouvrir la fiche
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </p>
      </Link>
    </Revelation>
  )
}
