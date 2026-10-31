import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import BarreProgression from '../components/BarreProgression.jsx'
import Depliant from '../components/Depliant.jsx'
import InventaireRole from '../components/InventaireRole.jsx'
import PanneauCaracteristiques from '../components/PanneauCaracteristiques.jsx'
import EnteteSection from '../components/EnteteSection.jsx'
import ItemCard from '../components/ItemCard.jsx'
import LienExterne from '../components/LienExterne.jsx'
import Revelation from '../components/Revelation.jsx'
import EtatVide from '../components/EtatVide.jsx'
import { ACTES } from '../data/actes.js'
import { buildDe } from '../data/builds.js'
import { ITEMS } from '../data/items.js'
import { ITEMS_ANCIENS } from '../data/items-anciens.js'
import { accentDe, variableAccent } from '../lib/accents.js'
import { compter, concerneRole, infosStatut, itemsDuPlan, statutDe, trierItems } from '../lib/progression.js'
import useAffichage from '../hooks/useAffichage.jsx'
import useProgression from '../hooks/useProgression.jsx'

function Liste({ titre, entrees, accent }) {
  if (!entrees?.length) return null
  return (
    <div className="rounded border border-or-700/20 p-5">
      <h3 className="grave text-sm tracking-[0.1em]">{titre}</h3>
      <div aria-hidden="true" className={`mt-3 h-px w-10 ${accent.trait}`} />
      <ul className="mt-4 space-y-3">
        {entrees.map((entree) => (
          <li key={entree} className="flex gap-3 text-sm leading-relaxed text-gray-300">
            <span aria-hidden="true" className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${accent.barre}`} />
            {entree}
          </li>
        ))}
      </ul>
    </div>
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
  const { mode, acte: acteDeclare } = useAffichage()
  const [params, setParams] = useSearchParams()
  const acteBrut = Number(params.get('acte'))
  // L'URL prime ; sans paramètre, En partie reprend l'acte déclaré, Préparer l'acte I.
  const acteParDefaut = mode === 'en-partie' && acteDeclare ? acteDeclare : 1
  const acte = ACTES.some((entree) => entree.numero === acteBrut) ? acteBrut : acteParDefaut

  function choisirActe(numero) {
    const suivant = new URLSearchParams(params)
    if (numero === acteParDefaut) suivant.delete('acte')
    else suivant.set('acte', String(numero))
    setParams(suivant, { replace: true })
  }

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
  const aConfirmer = !build.ancienne ? (build.aConfirmer ?? []) : []
  const vigilance = build.vigilance?.[0] ?? null

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

      {/* En partie : l'inventaire d'abord ; Préparer : l'essentiel d'abord. Mêmes blocs, autre ordre. */}
      {mode === 'en-partie' ? (
        <>
      {/* --- Inventaire par acte ----------------------------------------- */}
      {!build.ancienne && (
        <Revelation className="plaque mt-4 p-5 sm:p-6">
          <InventaireRole role={build.id} acte={acte} onActe={choisirActe} accent={accent} />
          <p className="mt-4 text-xs text-gray-400">
            Suivi d’obtention, copies et équipement de tous les rôles :{' '}
            <Link to={`/loadout?role=${build.id}&acte=${acte}`} className="underline underline-offset-4 hover:text-or-100">
              loadouts de ce rôle
            </Link>
            .
          </p>
        </Revelation>
      )}

      {/* --- Lecture immédiate : trois points et les avertissements critiques --- */}
      <Revelation className="plaque p-5 sm:p-6" data-resume>
        <h2 className="grave text-base tracking-[0.1em]">L’essentiel</h2>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-gray-300">
          <li>
            <span className="glyphe">Rôle · </span>
            {build.role}
          </li>
          <li>
            <span className="glyphe">Répartition finale · </span>
            {build.split}
          </li>
          {vigilance && (
            <li className="text-amber-100">
              <span className="font-rune text-[0.65rem] uppercase tracking-[0.14em] text-amber-200">Vigilance · </span>
              {vigilance}
            </li>
          )}
        </ul>
        {aConfirmer.length > 0 && (
          <p role="note" className="mt-4 text-xs leading-relaxed text-amber-200">
            ⚠ {aConfirmer.length} point{aConfirmer.length > 1 ? 's' : ''} à confirmer, dont : {aConfirmer[0].texte.split('.')[0]}.{' '}
            <a href="#depliant-a-confirmer" className="underline underline-offset-4">
              Tout lire
            </a>
          </p>
        )}
      </Revelation>
        </>
      ) : (
        <>
      {/* --- Lecture immédiate : trois points et les avertissements critiques --- */}
      <Revelation className="plaque p-5 sm:p-6" data-resume>
        <h2 className="grave text-base tracking-[0.1em]">L’essentiel</h2>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-gray-300">
          <li>
            <span className="glyphe">Rôle · </span>
            {build.role}
          </li>
          <li>
            <span className="glyphe">Répartition finale · </span>
            {build.split}
          </li>
          {vigilance && (
            <li className="text-amber-100">
              <span className="font-rune text-[0.65rem] uppercase tracking-[0.14em] text-amber-200">Vigilance · </span>
              {vigilance}
            </li>
          )}
        </ul>
        {aConfirmer.length > 0 && (
          <p role="note" className="mt-4 text-xs leading-relaxed text-amber-200">
            ⚠ {aConfirmer.length} point{aConfirmer.length > 1 ? 's' : ''} à confirmer, dont : {aConfirmer[0].texte.split('.')[0]}.{' '}
            <a href="#depliant-a-confirmer" className="underline underline-offset-4">
              Tout lire
            </a>
          </p>
        )}
      </Revelation>

      {/* --- Inventaire par acte ----------------------------------------- */}
      {!build.ancienne && (
        <Revelation className="plaque mt-4 p-5 sm:p-6">
          <InventaireRole role={build.id} acte={acte} onActe={choisirActe} accent={accent} />
          <p className="mt-4 text-xs text-gray-400">
            Suivi d’obtention, copies et équipement de tous les rôles :{' '}
            <Link to={`/loadout?role=${build.id}&acte=${acte}`} className="underline underline-offset-4 hover:text-or-100">
              loadouts de ce rôle
            </Link>
            .
          </p>
        </Revelation>
      )}
        </>
      )}

      {/* --- Caractéristiques, en vues nommées --------------------------- */}
      <Revelation className="plaque mt-4 p-5 sm:p-6">
        <h2 className="grave text-base tracking-[0.1em]">Caractéristiques</h2>
        <div className="mt-4">
          <PanneauCaracteristiques build={build} accent={accent} />
        </div>
      </Revelation>

      {/* --- Développements : repliés, jamais supprimés --------------------- */}
      <div className="mt-8">
        <Depliant id="depliant-leveling" titre="Leveling 1 → 12" resume={`${build.leveling.length} paliers`}>
          <ol className="space-y-2">
            {build.leveling.map((palier) => (
              <li
                key={palier.niveau}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded border border-or-700/20 px-4 py-3"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${accent.bord} font-rune text-xs text-or-100`}
                >
                  {palier.niveau}
                </span>
                <span className={`font-rune text-[0.7rem] uppercase tracking-[0.16em] ${accent.texteVif}`}>
                  {palier.classe}
                </span>
                <span className="min-w-0 flex-1 basis-48 text-sm leading-relaxed text-gray-300">{palier.gains}</span>
              </li>
            ))}
          </ol>
        </Depliant>

        <Depliant id="depliant-dons" titre="Dons" resume={`${build.feats.length} dons`}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {build.feats.map((feat) => (
              <div key={feat.nom} className="rounded border border-or-700/20 p-4">
                <p className="glyphe">Niveau {feat.niveau}</p>
                <p className="mt-2 font-display text-sm uppercase tracking-[0.08em] text-or-100">{feat.nom}</p>
                {feat.note && <p className="mt-2 text-sm leading-relaxed text-gray-400">{feat.note}</p>}
              </div>
            ))}
          </div>
        </Depliant>

        <Depliant id="depliant-jeu" titre="Jeu, synergies et vigilance">
          <div className="grid gap-4 lg:grid-cols-3">
            <Liste titre="Boucle de jeu" entrees={build.boucle} accent={accent} />
            <Liste titre="Synergies d’équipe" entrees={build.synergies} accent={accent} />
            <Liste titre="Points de vigilance" entrees={build.vigilance} accent={accent} />
          </div>
        </Depliant>

        {aConfirmer.length > 0 && (
          <Depliant id="depliant-a-confirmer" titre="À confirmer" resume={`${aConfirmer.length} points`}>
            <ul className="space-y-2">
              {aConfirmer.map((point) => (
                <li key={point.id} className="rounded border border-amber-300/30 px-4 py-3 text-sm leading-relaxed text-amber-100/90">
                  <span className="font-rune text-[0.65rem] uppercase tracking-[0.14em] text-amber-200">À confirmer · </span>
                  {point.texte}
                </li>
              ))}
            </ul>
            {build.routeRecommandee && (
              <p className="mt-4 rounded border border-or-700/20 px-4 py-3 text-sm leading-relaxed text-gray-300">
                <span className="font-rune text-[0.65rem] uppercase tracking-[0.14em] text-amber-200">Route recommandée (à confirmer) · </span>
                {build.routeRecommandee.texte}
              </p>
            )}
          </Depliant>
        )}

        {!build.ancienne && build.variantes?.length > 0 && (
          <Depliant id="depliant-variantes" titre="Variantes" resume={`${build.variantes.length}`}>
            <p className="max-w-2xl text-sm leading-relaxed text-gray-400">
              Chaque variante est un choix distinct du build principal : ses bénéfices ne s’y additionnent pas.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {build.variantes.map((variante) => (
                <div key={variante.id} className="rounded border border-or-700/20 p-5">
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
          </Depliant>
        )}

        {!build.ancienne && (build.divergences?.length > 0 || build.export) && (
          <Depliant id="depliant-export" titre="Export du joueur et recommandation">
            {build.export ? (
              <ExportPlanner exporte={build.export} />
            ) : (
              <p className="text-sm text-gray-400">Aucun export de planner fourni pour ce rôle.</p>
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
            {build.reference?.notion && (
              <p className="mt-6 text-sm text-gray-400">
                Source : <LienExterne href={build.reference.notion}>fiche Notion du build</LienExterne>. Fiche
                documentée, non testée en jeu.
              </p>
            )}
          </Depliant>
        )}

        {build.lexique?.length > 0 && (
          <Depliant id="depliant-lexique" titre="Références bg3.wiki" resume={`${build.lexique.length} termes`}>
            <p className="max-w-2xl text-sm leading-relaxed text-gray-400">
              Termes de sorts, aptitudes et conditions laissés en anglais faute de traduction FR vérifiée en jeu.
              Suivre le lien pour voir l’icône et le libellé exact.
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
          </Depliant>
        )}

        <Depliant
          id="depliant-objets"
          titre={build.ancienne ? 'Loadout de l’ancienne composition' : 'Objets du plan'}
          resume={build.ancienne ? null : `${progression.resolus}/${progression.total} sécurisés`}
        >
          {!build.ancienne && (
            <BarreProgression
              className="mb-4 w-full max-w-xs"
              libelle="Objets du plan sécurisés"
              detail={`${progression.resolus}/${progression.total}`}
              pourcentage={progression.pourcentage}
              teinte={accent.barre}
            />
          )}
          {build.ancienne ? (
            itemsAnciens.length === 0 ? (
              <EtatVide titre="Aucun item rattaché" message="Aucun item de l’ancien catalogue n’est rattaché à ce build." />
            ) : (
              <ul className="space-y-2">
                {itemsAnciens.map((item) => {
                  const statut = etat.items?.[item.id] ?? etat.archive?.items?.[item.id]
                  return (
                    <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-3 rounded border border-or-700/20 px-5 py-3 text-sm text-gray-300">
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
            <EtatVide titre="Aucun item rattaché" message="Aucun objet du plan n’est rattaché à ce rôle." />
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
        </Depliant>
      </div>
    </div>
  )
}
