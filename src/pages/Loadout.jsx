import { Link, useSearchParams } from 'react-router-dom'
import { useMemo } from 'react'
import BarreProgression from '../components/BarreProgression.jsx'
import EnteteSection from '../components/EnteteSection.jsx'
import EtatVide from '../components/EtatVide.jsx'
import InventaireRole, { SelecteurActe } from '../components/InventaireRole.jsx'
import LienExterne from '../components/LienExterne.jsx'
import Revelation from '../components/Revelation.jsx'
import SuiviCopies from '../components/SuiviCopies.jsx'
import { BadgeActe, BadgeStatut } from '../components/Badges.jsx'
import { ACTES } from '../data/actes.js'
import { BUILDS, COPIES_AUTORISEES } from '../data/builds.js'
import { RANGS, SLOTS_LOADOUT, loadoutsDe } from '../data/loadouts.js'
import { lieuDe } from '../data/lieux.js'
import { objetDe } from '../data/objets.js'
import { accentDe, variableAccent } from '../lib/accents.js'
import { completudeLoadout, estResolu, statutDe } from '../lib/progression.js'
import useProgression from '../hooks/useProgression.jsx'

const LIBELLES_RANG = {
  principal: 'Principal',
  alternative: 'Alternative',
  situationnel: 'Situationnel',
  reserve: 'Réserve',
}

const TEINTES_RANG = {
  principal: 'border-amber-300/50 text-amber-100 bg-amber-400/10',
  alternative: 'border-sky-400/45 text-sky-200 bg-sky-500/10',
  situationnel: 'border-purple-400/40 text-purple-200',
  reserve: 'border-or-700/40 text-gray-400',
}

const VERROUS = {
  quete: 'Dépend d’une quête',
  pnj: 'Dépend d’un PNJ (peut disparaître)',
  'zone-dangereuse': 'Zone dangereuse',
  'point-de-non-retour': 'Point de non-retour : à prendre avant de partir',
  'ressource-unique': 'Ressource unique de la run',
}

function ordre(ligne) {
  return SLOTS_LOADOUT.indexOf(ligne.slot) * 10 + RANGS.indexOf(ligne.rang)
}

function BadgeRang({ rang }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-rune text-[0.62rem] uppercase tracking-[0.14em] ${TEINTES_RANG[rang]}`}
    >
      {LIBELLES_RANG[rang]}
    </span>
  )
}

/** Où et à quel prix l'obtenir : sources, rattrapage et risque de verrouillage. */
function Acquisition({ objet }) {
  return (
    <ul className="space-y-1 text-xs text-gray-400">
      {objet.sources.map((source, index) => {
        const lieu = lieuDe(source.lieu)
        return (
          <li key={index}>
            <span className="text-gray-300">{source.rattrapage ? 'Rattrapage' : 'Source'} · Acte {source.acte}</span>
            {' — '}
            {lieu ? lieu.nom : 'À localiser'}
            {source.aConfirmer && ' · à confirmer'}
            {source.verrou !== 'aucun' && (
              <span className="ml-1 text-amber-200">⚠ {VERROUS[source.verrou]}</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function Designation({ ligne, objet }) {
  if (!objet) {
    return (
      <div>
        <span className="text-sm text-gray-400">Libre</span>
        <p className="mt-1 text-xs text-gray-500">{ligne.interet}</p>
      </div>
    )
  }
  return (
    <div>
      <span className="text-sm text-gray-200">{objet.nom}</span>
      <p className="mt-1 text-xs leading-relaxed text-gray-400">{ligne.interet}</p>
      {ligne.condition && (
        <p className="mt-1 text-xs leading-relaxed text-amber-200/90">
          <span className="font-rune uppercase tracking-[0.12em]">Condition · </span>
          {ligne.condition}
        </p>
      )}
      <p className="mt-1">
        <LienExterne href={objet.wiki}>Wiki</LienExterne>
      </p>
    </div>
  )
}

function CaseObtenu({ objet, statut, basculerItem }) {
  return (
    <label className="flex items-center gap-2 text-xs text-gray-400">
      <input
        type="checkbox"
        className="h-4 w-4 accent-current"
        checked={statut === 'obtenu'}
        onChange={() => basculerItem(objet.id)}
        aria-label={`Marquer l’original de ${objet.nom} comme obtenu`}
      />
      <BadgeStatut statut={statut} />
    </label>
  )
}

function LignesRole({ lignes, role, acte, etat, basculerItem }) {
  return (
    <>
      {/* Desktop : un tableau, un slot par ligne. */}
      <div className="hidden overflow-x-auto md:block" data-vue="tableau">
        <table className="w-full min-w-[58rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-or-700/25">
              {['Slot', 'Recommandation', 'Rang', 'Acquisition', 'Original', 'Copies et équipement'].map((entete) => (
                <th key={entete} scope="col" className="glyphe px-3 py-2">
                  {entete}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lignes.map((ligne, index) => {
              const objet = ligne.objet ? objetDe(ligne.objet) : null
              const statut = objet ? statutDe(etat, objet.id) : null
              return (
                <tr
                  key={`${ligne.slot}-${ligne.objet}-${index}`}
                  className={`border-b border-or-700/15 align-top ${statut && estResolu(statut) ? 'opacity-80' : ''}`}
                >
                  <td className="px-3 py-3 font-rune text-[0.68rem] uppercase tracking-[0.12em] text-gray-500">
                    {ligne.slot}
                  </td>
                  <td className="px-3 py-3">
                    <Designation ligne={ligne} objet={objet} />
                  </td>
                  <td className="px-3 py-3">
                    <BadgeRang rang={ligne.rang} />
                  </td>
                  <td className="px-3 py-3">{objet && <Acquisition objet={objet} />}</td>
                  <td className="px-3 py-3">
                    {objet && <CaseObtenu objet={objet} statut={statut} basculerItem={basculerItem} />}
                  </td>
                  <td className="px-3 py-3">
                    {objet && ligne.rang === 'principal' ? (
                      <SuiviCopies objet={objet} role={role} acte={acte} />
                    ) : (
                      objet && <span className="text-xs text-gray-500">Option : pas comptée dans l’équipement du plan.</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile : une carte par slot, rien à faire défiler latéralement. */}
      <ul className="space-y-3 md:hidden" data-vue="cartes">
        {lignes.map((ligne, index) => {
          const objet = ligne.objet ? objetDe(ligne.objet) : null
          const statut = objet ? statutDe(etat, objet.id) : null
          return (
            <li
              key={`${ligne.slot}-${ligne.objet}-${index}`}
              className="rounded border border-or-700/20 p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="font-rune text-[0.68rem] uppercase tracking-[0.12em] text-gray-500">
                  {ligne.slot}
                </span>
                <BadgeRang rang={ligne.rang} />
              </div>
              <Designation ligne={ligne} objet={objet} />
              {objet && (
                <div className="mt-3 space-y-3">
                  <Acquisition objet={objet} />
                  <CaseObtenu objet={objet} statut={statut} basculerItem={basculerItem} />
                  {ligne.rang === 'principal' && <SuiviCopies objet={objet} role={role} acte={acte} />}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}

function Variantes({ build, variante, onChoisir }) {
  const choisie = build.variantes.find((entree) => entree.id === variante)
  return (
    <div className="mb-5">
      <label className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
        <span className="glyphe">Variante</span>
        <select
          className="rounded border border-or-700/30 bg-encre px-2 py-1 text-sm text-gray-200"
          value={choisie ? choisie.id : ''}
          onChange={(evenement) => onChoisir(evenement.target.value)}
          aria-label={`Variante du build ${build.personnage}`}
        >
          <option value="">Build principal</option>
          {build.variantes.map((entree) => (
            <option key={entree.id} value={entree.id}>
              {entree.nom}
            </option>
          ))}
        </select>
      </label>
      {choisie && (
        <div className="mt-3 rounded border border-or-700/20 p-4 text-xs leading-relaxed text-gray-300">
          <p>{choisie.verdict}</p>
          <p className="mt-2 text-gray-500">
            Cette variante ne cumule pas ses bénéfices avec le build principal.
          </p>
        </div>
      )}
    </div>
  )
}

export default function Loadout() {
  const { etat, basculerItem } = useProgression()
  const [params, setParams] = useSearchParams()

  const acteBrut = Number(params.get('acte'))
  const acte = ACTES.some((entree) => entree.numero === acteBrut) ? acteBrut : 1
  const roleBrut = params.get('role')
  const rolesAffiches = BUILDS.some((build) => build.id === roleBrut)
    ? BUILDS.filter((build) => build.id === roleBrut)
    : BUILDS
  const tousLesRangs = params.get('rang') === 'tous'
  const varianteBrut = params.get('variante') ?? ''

  function maj(cle, valeur, defaut) {
    const suivant = new URLSearchParams(params)
    if (!valeur || valeur === defaut) suivant.delete(cle)
    else suivant.set(cle, valeur)
    setParams(suivant, { replace: true })
  }

  const parRole = useMemo(
    () =>
      rolesAffiches.map((build) => {
        const lignes = loadoutsDe(build.id, acte)
          .filter((ligne) => tousLesRangs || ligne.rang === 'principal' || ligne.variante === varianteBrut)
          .sort((a, b) => ordre(a) - ordre(b))
        return { build, lignes, completude: completudeLoadout(build.id, etat, acte) }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rolesAffiches.map((build) => build.id).join(), acte, tousLesRangs, varianteBrut, etat],
  )

  const actifs = BUILDS.length

  return (
    <div className="mx-auto max-w-grimoire px-5 py-12 sm:py-16">
      <EnteteSection
        surtitre="Par rôle et par acte"
        titre="Loadouts cibles"
        chapeau="Le plan d’équipement, acte par acte et slot par slot. L’original d’un objet, les exemplaires disponibles et l’exemplaire réellement affecté à un rôle sont suivis séparément : obtenir l’original n’équipe aucun des quatre rôles."
      />

      {COPIES_AUTORISEES && (
        <p className="plaque mb-6 px-5 py-4 text-xs leading-relaxed text-gray-300">
          Copies d’équipement autorisées (Ombrecœur / Invocation de réplique). Elles ne dupliquent ni le Cheveu, ni les
          bonus permanents, ni les élixirs, et ne lèvent pas les limites de slots : une amulette, une cape, deux anneaux
          par personnage. Leurs passifs et leur persistance sont à valider sur la version installée.
        </p>
      )}

      <form className="mb-8 flex flex-wrap items-end gap-4" aria-label="Filtres du loadout" onSubmit={(e) => e.preventDefault()}>
        <div>
          <span className="glyphe mb-1 block text-xs">Acte</span>
          <SelecteurActe acte={acte} onChoisir={(numero) => maj('acte', String(numero), '1')} />
        </div>
        <label className="text-xs text-gray-400">
          <span className="glyphe mb-1 block">Rôle</span>
          <select
            className="rounded border border-or-700/30 bg-encre px-2 py-1 text-sm text-gray-200"
            value={rolesAffiches.length === actifs ? '' : rolesAffiches[0].id}
            onChange={(evenement) => maj('role', evenement.target.value, '')}
          >
            <option value="">Les {actifs} rôles</option>
            {BUILDS.map((build) => (
              <option key={build.id} value={build.id}>
                {build.personnage}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 pb-1 text-xs text-gray-400">
          <input
            type="checkbox"
            className="h-4 w-4 accent-current"
            checked={tousLesRangs}
            onChange={(evenement) => maj('rang', evenement.target.checked ? 'tous' : '', '')}
          />
          Montrer alternatives, situationnels et réserves
        </label>
      </form>

      <div className="space-y-8">
        {parRole.map(({ build, lignes, completude }, index) => {
          const accent = accentDe(build)
          return (
            <Revelation
              key={build.id}
              delai={index * 80}
              className="plaque p-5 sm:p-6"
              style={variableAccent(build)}
            >
              <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="text-2xl">
                    {build.icone}
                  </span>
                  <div>
                    <Link
                      to={`/builds/${build.id}`}
                      className={`font-display text-base uppercase tracking-[0.1em] ${accent.texte} transition-colors hover:text-or-100`}
                    >
                      {build.personnage} — {build.nom}
                    </Link>
                    <p className="mt-1 font-rune text-[0.62rem] uppercase tracking-[0.14em] text-gray-500">
                      {build.split} · <BadgeActe numero={acte} />
                    </p>
                  </div>
                </div>
                <BarreProgression
                  className="w-full max-w-xs"
                  libelle="Équipé"
                  detail={`${completude.equipes}/${completude.total}`}
                  pourcentage={completude.pourcentage}
                  teinte={accent.barre}
                />
              </header>

              <p className="mb-4 text-xs text-gray-500">
                {completude.aAcquerir} à acquérir · {completude.aAffecter} obtenu(s) à affecter · {completude.equipes} équipé(s)
              </p>

              <Variantes
                build={build}
                variante={varianteBrut}
                onChoisir={(valeur) => maj('variante', valeur, '')}
              />

              <InventaireRole role={build.id} acte={acte} accent={accent} />

              <details className="mt-6 rounded border border-or-700/20 p-4" data-detail-suivi>
                <summary className="min-h-[44px] cursor-pointer font-rune text-xs uppercase tracking-[0.14em] text-or-300">
                  Suivi détaillé : obtention, copies et équipement
                </summary>
                <div className="mt-4">
                  {lignes.length === 0 ? (
                    <EtatVide
                      titre="Rien à cet acte"
                      message="Aucune recommandation n’est encodée pour ce rôle à cet acte."
                    />
                  ) : (
                    <LignesRole lignes={lignes} role={build.id} acte={acte} etat={etat} basculerItem={basculerItem} />
                  )}
                </div>
              </details>
            </Revelation>
          )
        })}
      </div>
    </div>
  )
}
