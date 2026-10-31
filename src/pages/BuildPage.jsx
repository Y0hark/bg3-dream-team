import { Link, Navigate, useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import BarreProgression from '../components/BarreProgression.jsx'
import EnteteSection from '../components/EnteteSection.jsx'
import ItemCard from '../components/ItemCard.jsx'
import LienExterne from '../components/LienExterne.jsx'
import Revelation from '../components/Revelation.jsx'
import EtatVide from '../components/EtatVide.jsx'
import { buildDe } from '../data/builds.js'
import { ITEMS } from '../data/items.js'
import { ITEMS_ANCIENS } from '../data/items-anciens.js'
import { accentDe, variableAccent } from '../lib/accents.js'
import { compter, concerneRole, infosStatut, itemsDuPlan, statutDe, trierItems } from '../lib/progression.js'
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

/** Texte copiable tel quel : jamais décodé ni rendu en HTML. */
function ExportPlanner({ exporte }) {
  const [copie, setCopie] = useState(false)

  async function copier() {
    try {
      await navigator.clipboard.writeText(exporte.planner)
      setCopie(true)
      setTimeout(() => setCopie(false), 1600)
    } catch {
      setCopie(false)
    }
  }

  return (
    <div>
      <p className="text-sm leading-relaxed text-gray-400">
        {exporte.provenance}. Chaîne Base64 du planner de build — pas un hash Git. Les choix de l’export sont affichés
        ci-dessous à côté de la recommandation de la fiche, sans être fusionnés.
      </p>
      <textarea
        readOnly
        aria-label="Export du planner (Base64)"
        className="mt-3 h-24 w-full rounded border border-or-700/30 bg-encre p-3 font-mono text-[0.65rem] text-gray-300"
        value={exporte.planner}
      />
      <button type="button" className="bouton mt-3" onClick={copier}>
        {copie ? 'Copié' : 'Copier le texte brut'}
      </button>
    </div>
  )
}

export default function BuildPage() {
  const { id } = useParams()
  const build = buildDe(id)
  const { etat } = useProgression()

  // Rôle actif : les objets que ce rôle porte en principal (même partagés avec
  // un autre rôle). Ancienne composition : lecture seule depuis l'ancien catalogue.
  const items = useMemo(
    () => trierItems(itemsDuPlan(ITEMS).filter((item) => concerneRole(item, id))),
    [id],
  )
  const itemsAnciens = useMemo(() => ITEMS_ANCIENS.filter((item) => item.personnage === id), [id])
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

      {build.ancienne && (
        <p role="note" className="plaque mb-8 border-amber-300/40 px-5 py-4 text-sm leading-relaxed text-amber-100">
          Ancienne composition : ce build ne fait plus partie de l’équipe active et n’est pas associé à l’un des quatre
          nouveaux rôles. Cette vue est en lecture seule.{' '}
          <Link to="/builds" className="underline underline-offset-4">
            Voir la composition active
          </Link>{' '}
          ·{' '}
          <Link to="/archive" className="underline underline-offset-4">
            Archive
          </Link>
        </p>
      )}

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

      {!build.ancienne && build.aConfirmer?.length > 0 && (
        <section className="mt-12" aria-labelledby="titre-a-confirmer">
          <h2 id="titre-a-confirmer" className="grave text-xl tracking-[0.1em]">
            À confirmer
          </h2>
          <ul className="mt-4 space-y-2">
            {build.aConfirmer.map((point) => (
              <li key={point.id} className="plaque border-amber-300/30 px-5 py-3 text-sm leading-relaxed text-amber-100/90">
                <span className="font-rune text-[0.65rem] uppercase tracking-[0.14em] text-amber-200">À confirmer · </span>
                {point.texte}
              </li>
            ))}
          </ul>
          {build.routeRecommandee && (
            <p className="plaque mt-4 px-5 py-4 text-sm leading-relaxed text-gray-300">
              <span className="font-rune text-[0.65rem] uppercase tracking-[0.14em] text-amber-200">Route recommandée (à confirmer) · </span>
              {build.routeRecommandee.texte}
            </p>
          )}
        </section>
      )}

      {!build.ancienne && build.variantes?.length > 0 && (
        <section className="mt-12" aria-labelledby="titre-variantes">
          <h2 id="titre-variantes" className="grave text-xl tracking-[0.1em]">
            Variantes
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-400">
            Chaque variante est un choix distinct du build principal : ses bénéfices ne s’y additionnent pas.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {build.variantes.map((variante) => (
              <div key={variante.id} className="plaque p-5">
                <p className="font-display text-sm uppercase tracking-[0.08em] text-or-100">{variante.nom}</p>
                <p className="mt-1 glyphe">{variante.dons} don{variante.dons > 1 ? 's' : ''}</p>
                {variante.gains?.length > 0 && (
                  <p className="mt-3 text-sm leading-relaxed text-gray-300">
                    <span className="text-emerald-300">Gagne · </span>
                    {variante.gains.join(' ; ')}
                  </p>
                )}
                {variante.pertes?.length > 0 && (
                  <p className="mt-2 text-sm leading-relaxed text-gray-300">
                    <span className="text-red-300">Perd · </span>
                    {variante.pertes.join(' ; ')}
                  </p>
                )}
                <p className="mt-3 text-sm leading-relaxed text-gray-400">{variante.verdict}</p>
                {variante.ordreAConfirmer && (
                  <p className="mt-2 text-xs text-amber-200">Ordre de prise des niveaux à confirmer.</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {!build.ancienne && (build.divergences?.length > 0 || build.export) && (
        <section className="mt-12" aria-labelledby="titre-export">
          <h2 id="titre-export" className="grave text-xl tracking-[0.1em]">
            Export du joueur et recommandation
          </h2>
          {build.export ? (
            <div className="mt-4">
              <ExportPlanner exporte={build.export} />
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-400">Aucun export de planner fourni pour ce rôle.</p>
          )}
          {build.divergences?.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-or-700/25">
                    {['Sujet', 'Recommandation de la fiche', 'Export de l’utilisateur'].map((entete) => (
                      <th key={entete} scope="col" className="glyphe px-3 py-2">
                        {entete}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {build.divergences.map((divergence) => (
                    <tr key={divergence.id} className="border-b border-or-700/15 align-top text-gray-300">
                      <th scope="row" className="px-3 py-3 text-left font-normal text-or-100">
                        {divergence.sujet}
                      </th>
                      <td className="px-3 py-3">{divergence.recommandation}</td>
                      <td className="px-3 py-3">{divergence.export}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {!build.ancienne && build.reference?.notion && (
        <p className="mt-8 text-sm text-gray-400">
          Source : <LienExterne href={build.reference.notion}>fiche Notion du build</LienExterne>. Fiche documentée, non
          testée en jeu.
        </p>
      )}

      {/* --- Références bg3.wiki -------------------------------------- */}
      {build.lexique?.length > 0 && (
        <section className="mt-12" aria-labelledby="titre-lexique">
          <h2 id="titre-lexique" className="grave text-xl tracking-[0.1em]">
            Références bg3.wiki
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-400">
            Termes de sorts, aptitudes et conditions laissés en anglais faute de traduction FR
            vérifiée en jeu. Suivre le lien pour voir l’icône et le libellé exact.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {build.lexique.map((entree) => (
              <li key={entree.nom}>
                <LienExterne
                  href={entree.wiki}
                  className="rounded-sm border border-or-700/30 bg-voile/[0.03] px-3 py-1.5 !text-[0.7rem] !normal-case !tracking-normal !text-gray-300 hover:!text-or-100"
                >
                  {entree.nom}
                </LienExterne>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* --- Loadout du personnage ------------------------------------- */}
      <section className="mt-12" aria-labelledby="titre-loadout">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 id="titre-loadout" className="grave text-xl tracking-[0.1em]">
            {build.ancienne ? 'Loadout de l’ancienne composition' : 'Objets du plan'}
          </h2>
          {!build.ancienne && (
            <BarreProgression
              className="w-full max-w-xs"
              libelle="Objets du plan sécurisés"
              detail={`${progression.resolus}/${progression.total}`}
              pourcentage={progression.pourcentage}
              teinte={accent.barre}
            />
          )}
        </div>

        {build.ancienne ? (
          itemsAnciens.length === 0 ? (
            <EtatVide titre="Aucun item rattaché" message="Aucun item de l’ancien catalogue n’est rattaché à ce build." />
          ) : (
            <ul className="space-y-2">
              {itemsAnciens.map((item) => {
                const statut = etat.items?.[item.id] ?? etat.archive?.items?.[item.id]
                return (
                  <li key={item.id} className="plaque flex flex-wrap items-baseline justify-between gap-3 px-5 py-3 text-sm text-gray-300">
                    <span>
                      {item.nom} <span className="text-gray-500">· {item.slot}</span>
                    </span>
                    <span className="text-gray-500">{infosStatut(statut).nom}</span>
                  </li>
                )
              })}
            </ul>
          )
        ) : items.length === 0 ? (
          <EtatVide
            titre="Aucun item rattaché"
            message="Aucun objet du plan n’est rattaché à ce rôle."
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-400">
              Le détail par acte, les alternatives, les copies et l’équipement effectif sont dans{' '}
              <Link to={`/loadout?role=${build.id}`} className="underline underline-offset-4 hover:text-or-100">
                les loadouts de ce rôle
              </Link>
              .
            </p>
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
          </>
        )}
      </section>
    </div>
  )
}
