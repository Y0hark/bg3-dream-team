import { BadgeActe, BadgePriorite } from './Badges.jsx'
import LienExterne from './LienExterne.jsx'
import Revelation from './Revelation.jsx'
import { buildDe } from '../data/builds.js'
import { lieuDe } from '../data/lieux.js'
import { accentDe, variableAccent } from '../lib/accents.js'
import { STATUTS, estResolu } from '../lib/progression.js'
import useProgression from '../hooks/useProgression.jsx'

/** Segments de statut : un clic = un statut, pas de menu déroulant à ouvrir. */
function SelecteurStatut({ item, statut }) {
  const { definirStatut } = useProgression()

  return (
    <div
      role="group"
      aria-label={`Statut de ${item.nom}`}
      className="flex flex-wrap gap-1.5"
    >
      {STATUTS.map((entree) => {
        const actif = entree.id === statut
        return (
          <button
            key={entree.id}
            type="button"
            aria-pressed={actif}
            onClick={() => definirStatut(item.id, entree.id)}
            className={`rounded-sm border px-2 py-1 font-rune text-[0.6rem] uppercase tracking-[0.12em] transition-colors ${
              actif ? entree.puce : 'border-or-700/25 text-gray-500 hover:border-or-500/50 hover:text-gray-300'
            }`}
          >
            <span aria-hidden="true" className="mr-1">
              {entree.icone}
            </span>
            {entree.nom}
          </button>
        )
      })}
    </div>
  )
}

export default function ItemCard({ item, statut, index = 0, montrerPersonnage = true }) {
  const build = buildDe(item.personnage)
  const accent = accentDe(build)
  const lieu = lieuDe(item.lieu)
  const resolu = estResolu(statut)

  return (
    <Revelation
      as="article"
      delai={Math.min(index, 8) * 60}
      className="group groupe-plaque h-full"
      style={variableAccent(build)}
    >
      <div
        className={`plaque accent-vif flex h-full flex-col p-5 transition-opacity ${
          resolu ? 'opacity-70' : ''
        }`}
      >
        {/* Liseré d'accent : la couleur dit à qui appartient l'item */}
        <span
          aria-hidden="true"
          className={`absolute inset-y-0 left-0 w-0.5 ${accent.barre}`}
        />

        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3
              className={`font-display text-sm uppercase tracking-[0.08em] ${
                statut === 'rate' ? 'text-red-300 line-through' : 'text-or-100'
              }`}
            >
              {item.nom}
            </h3>
            <p className="mt-1 font-rune text-[0.65rem] uppercase tracking-[0.14em] text-gray-500">
              {item.slot}
              {montrerPersonnage && build ? ` · ${build.personnage}` : ''}
            </p>
          </div>
          <BadgePriorite priorite={item.priorite} />
        </header>

        <div className="mt-3 flex flex-wrap gap-2">
          <BadgeActe numero={item.acte} />
          {item.aConfirmer && (
            <span className="inline-flex items-center rounded-full border border-or-700/40 px-2.5 py-1 font-rune text-[0.62rem] uppercase tracking-[0.14em] text-gray-500">
              Source à confirmer
            </span>
          )}
        </div>

        {item.note && <p className="mt-3 text-sm leading-relaxed text-gray-300">{item.note}</p>}

        <dl className="mt-4 space-y-1.5 text-xs text-gray-400">
          <div className="flex gap-2">
            <dt className="glyphe shrink-0 pt-0.5">Lieu</dt>
            <dd className="min-w-0">{lieu ? lieu.nom : 'À localiser'}</dd>
          </div>
          {item.source && (
            <div className="flex gap-2">
              <dt className="glyphe shrink-0 pt-0.5">Source</dt>
              <dd className="min-w-0">{item.source}</dd>
            </div>
          )}
        </dl>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <LienExterne href={item.wiki}>Fiche wiki</LienExterne>
          <LienExterne href={lieu?.carte}>Carte</LienExterne>
        </div>

        <div className="mt-auto pt-5">
          <SelecteurStatut item={item} statut={statut} />
        </div>
      </div>
    </Revelation>
  )
}
