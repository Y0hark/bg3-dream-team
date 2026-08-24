import { Link, NavLink } from 'react-router-dom'
import SelecteurTheme from './SelecteurTheme.jsx'
import SynchroRun from './SynchroRun.jsx'

const LIENS = [
  { to: '/', libelle: 'Dashboard', exact: true },
  { to: '/builds', libelle: 'Builds' },
  { to: '/loadout', libelle: 'Loadout' },
  { to: '/items', libelle: 'Items' },
  { to: '/lieux', libelle: 'Cartes & lieux' },
  { to: '/checklist', libelle: 'Checklist' },
]

const lienBase =
  'relative whitespace-nowrap py-1 text-[0.65rem] uppercase tracking-[0.18em] text-gray-300 transition-colors hover:text-or-100 sm:text-xs sm:tracking-[0.2em] ' +
  'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 ' +
  'after:bg-or-300 after:transition-transform after:duration-300 hover:after:scale-x-100'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-or-700/25 bg-encre/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-grimoire items-center justify-between gap-4 px-4 py-3 sm:px-5 sm:py-4">
        <Link to="/" className="group flex shrink-0 items-center gap-3">
          {/* Sceau de couverture : quatre pierres pour quatre builds */}
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-or-500/50 text-or-300 transition-colors duration-300 group-hover:border-or-300 group-hover:text-or-100"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <circle cx="12" cy="4.6" r="2.3" />
              <circle cx="19.4" cy="12" r="2.3" />
              <circle cx="12" cy="19.4" r="2.3" />
              <circle cx="4.6" cy="12" r="2.3" />
            </svg>
          </span>
          {/* Sous 1024px le sceau seul tient lieu de logo : la barre ne déborde plus */}
          <span className="grave hidden text-sm leading-none tracking-[0.16em] lg:block">
            BG3 Honor Run
          </span>
        </Link>

        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          {/* Sur petit écran la liste défile latéralement plutôt que de se replier
              dans un menu : six sections, toutes atteignables d'un geste. */}
          <ul className="flex min-w-0 items-center gap-4 overflow-x-auto sm:gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {LIENS.map((lien) => (
              <li key={lien.to}>
                <NavLink
                  to={lien.to}
                  end={lien.exact}
                  className={({ isActive }) =>
                    `${lienBase} ${isActive ? 'text-or-100 after:scale-x-100' : ''}`
                  }
                >
                  {lien.libelle}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Sauvegarde en ligne, par code de run partageable */}
          <SynchroRun />

          {/* Bascule de thème : 4 palettes, mémorisée en localStorage */}
          <SelecteurTheme />
        </div>
      </nav>
    </header>
  )
}
