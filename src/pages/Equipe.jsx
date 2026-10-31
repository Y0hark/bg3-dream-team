import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BadgesAcquisition } from '../components/AlertesAcquisition.jsx'
import BarreProgression from '../components/BarreProgression.jsx'
import EnteteSection from '../components/EnteteSection.jsx'
import IconeObjet from '../components/IconeObjet.jsx'
import { SelecteurActe } from '../components/InventaireRole.jsx'
import { ACTES } from '../data/actes.js'
import { BUILDS } from '../data/builds.js'
import { objetDe } from '../data/objets.js'
import { accentDe, variableAccent } from '../lib/accents.js'
import { STATUTS_PORTEUR, vueEquipe } from '../lib/equipe.js'
import { nomsObjet } from '../lib/localisation.js'
import { completudeLoadout } from '../lib/progression.js'
import useProgression from '../hooks/useProgression.jsx'

const socle =
  'inline-flex items-center rounded-full border px-2 py-0.5 font-rune text-[0.58rem] uppercase tracking-[0.12em]'

// Classes écrites en entier : Tailwind ne détecte pas les noms construits.
const TEINTES_STATUT = {
  vide: 'border-or-700/30 text-gray-500',
  equipe: 'border-emerald-400/45 text-emerald-300',
  'a-affecter': 'border-sky-400/45 text-sky-200',
  'copie-a-preparer': 'border-amber-300/45 text-amber-200',
  'original-a-recuperer': 'border-or-700/40 text-gray-300',
  indisponible: 'border-red-400/45 text-red-300',
}

const nomDe = (objetId) => {
  const objet = objetDe(objetId)
  return objet ? nomsObjet(objet).principal : objetId
}

const nomRole = (roleId) => BUILDS.find((build) => build.id === roleId)?.personnage ?? roleId

function Cellule({ emplacement, role, acte, onAffecter, onLiberer }) {
  const objet = emplacement.objet ? objetDe(emplacement.objet) : null
  const nom = objet ? nomsObjet(objet).principal : 'Aucune option choisie'
  const { statut } = emplacement

  return (
    <li className="min-w-0 rounded border border-or-700/25 bg-voile/[0.02] p-2" data-emplacement={emplacement.cle}>
      <p className="px-1 font-rune text-[0.6rem] uppercase tracking-[0.14em] text-gray-500">{emplacement.libelle}</p>
      {/* Même slot, même icône et même fiche que l'inventaire individuel. */}
      <Link
        to={`/builds/${role}?acte=${acte}#inventaire-${role}`}
        aria-label={`${emplacement.libelle} de ${nomRole(role)} : ${nom}. Ouvrir l’emplacement et ses alternatives`}
        className="mt-1 flex min-h-[44px] items-start gap-2 rounded-sm p-1 transition-colors hover:bg-voile/[0.05]"
      >
        <IconeObjet objet={objet ?? { slot: emplacement.slot }} taille={40} />
        <span className="min-w-0 flex-1">
          <span className="block break-words text-sm leading-snug text-gray-100">{nom}</span>
          <span className="mt-1 flex flex-wrap gap-1">
            <span className={`${socle} ${TEINTES_STATUT[statut]}`}>{STATUTS_PORTEUR[statut]}</span>
            {emplacement.choisie && <span className={`${socle} border-sky-400/45 text-sky-200`}>Alternative</span>}
          </span>
          {objet && <BadgesAcquisition objetId={objet.id} className="mt-1" />}
        </span>
      </Link>
      {objet && statut === 'equipe' && (
        <button type="button" className="bouton mt-2 min-h-[44px] w-full" onClick={() => onLiberer(objet.id)}>
          Libérer l’exemplaire
        </button>
      )}
      {objet && statut === 'a-affecter' && (
        <button type="button" className="bouton mt-2 min-h-[44px] w-full" onClick={() => onAffecter(objet.id)}>
          Affecter un exemplaire
        </button>
      )}
    </li>
  )
}

function Besoins({ vue, onCopie }) {
  const { originauxARecuperer, copiesAPreparer, conflitsUniques, slotsSansOption } = vue
  const rien =
    originauxARecuperer.length + copiesAPreparer.length + conflitsUniques.length + slotsSansOption.length === 0

  return (
    <section aria-labelledby="besoins-equipe" className="plaque mb-6 p-5" data-besoins>
      <h2 id="besoins-equipe" className="glyphe mb-3 text-xs">
        Ce qu’il reste à préparer
      </h2>
      {rien && <p className="text-xs text-gray-400">Rien à préparer : chaque porteur du plan a son exemplaire.</p>}
      <div className="grid gap-4 md:grid-cols-3">
        {originauxARecuperer.length > 0 && (
          <div data-besoin="originaux">
            <h3 className="font-rune text-[0.62rem] uppercase tracking-[0.14em] text-gray-300">
              Originaux à récupérer
            </h3>
            <ul className="mt-2 space-y-1 text-xs text-gray-400">
              {originauxARecuperer.map((besoin) => (
                <li key={besoin.objet}>
                  {nomDe(besoin.objet)} — voulu par {besoin.roles.map(nomRole).join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}
        {copiesAPreparer.length > 0 && (
          <div data-besoin="copies">
            <h3 className="font-rune text-[0.62rem] uppercase tracking-[0.14em] text-gray-300">
              Copies à préparer
            </h3>
            <ul className="mt-2 space-y-2 text-xs text-gray-400">
              {copiesAPreparer.map((besoin) => (
                <li key={besoin.objet}>
                  {nomDe(besoin.objet)} — {besoin.copiesAPreparer} copie{besoin.copiesAPreparer > 1 ? 's' : ''} de plus
                  <span className="ml-1 text-gray-500">
                    ({besoin.exemplaires} exemplaire{besoin.exemplaires > 1 ? 's' : ''}, {besoin.roles.length} porteur
                    {besoin.roles.length > 1 ? 's' : ''} prévu{besoin.roles.length > 1 ? 's' : ''})
                  </span>
                  {!besoin.originalARecuperer && (
                    <button
                      type="button"
                      className="bouton ml-2 min-h-[44px]"
                      aria-label={`Ajouter une copie de ${nomDe(besoin.objet)}`}
                      onClick={() => onCopie(besoin.objet)}
                    >
                      + Copie
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {(slotsSansOption.length > 0 || conflitsUniques.length > 0) && (
          <div data-besoin="choix">
            <h3 className="font-rune text-[0.62rem] uppercase tracking-[0.14em] text-gray-300">À trancher</h3>
            <ul className="mt-2 space-y-1 text-xs text-gray-400">
              {slotsSansOption.map((slot) => (
                <li key={`${slot.role}-${slot.libelle}`}>
                  {nomRole(slot.role)} — {slot.libelle} : aucune option choisie
                </li>
              ))}
              {conflitsUniques.map((besoin) => (
                <li key={besoin.objet} className="text-amber-200">
                  ⚠ {nomDe(besoin.objet)} ne se copie pas : un seul porteur possible ({besoin.roles.map(nomRole).join(', ')}
                  {' '}le visent)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

export default function Equipe() {
  const { etat, ajouterExemplaire, affecterExemplaire, liberer } = useProgression()
  const [params, setParams] = useSearchParams()
  const [annonce, setAnnonce] = useState('')

  const acteBrut = Number(params.get('acte'))
  const acte = ACTES.some((entree) => entree.numero === acteBrut) ? acteBrut : 1
  const roleBrut = params.get('role')
  // Mobile : un rôle à la fois ; bureau : les quatre côte à côte.
  const roleMobile = BUILDS.some((build) => build.id === roleBrut) ? roleBrut : BUILDS[0].id

  const vue = useMemo(() => vueEquipe(BUILDS.map((build) => build.id), acte, etat), [acte, etat])

  function maj(cle, valeur, defaut) {
    const suivant = new URLSearchParams(params)
    if (!valeur || valeur === defaut) suivant.delete(cle)
    else suivant.set(cle, valeur)
    setParams(suivant, { replace: true })
  }

  const affecter = (role) => (objetId) => {
    affecterExemplaire(objetId, role)
    setAnnonce(`${nomDe(objetId)} : un exemplaire est affecté à ${nomRole(role)}.`)
  }
  const liberer_ = (role) => (objetId) => {
    liberer(objetId, role)
    setAnnonce(`${nomDe(objetId)} : l’exemplaire de ${nomRole(role)} est libéré, il peut être réaffecté.`)
  }
  const copier = (objetId) => {
    ajouterExemplaire(objetId)
    setAnnonce(`${nomDe(objetId)} : une copie ajoutée, sans affectation.`)
  }

  return (
    <div className="mx-auto max-w-grimoire px-5 py-12 sm:py-16">
      <EnteteSection
        surtitre="Les quatre rôles"
        titre="Équipe"
        chapeau="Qui porte quoi, et ce qu’il reste à préparer. Les cartes comparent les PLANS de l’acte choisi ; le badge d’état dit si l’exemplaire est réellement équipé. L’équipement réel est global à la run : changer d’acte ou d’option n’équipe rien et ne déplace aucun exemplaire."
      />

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <span className="glyphe mb-1 block text-xs">Acte comparé</span>
          <SelecteurActe acte={acte} onChoisir={(numero) => maj('acte', String(numero), '1')} />
        </div>
        <div className="lg:hidden">
          <span className="glyphe mb-1 block text-xs">Rôle</span>
          <div role="group" aria-label="Rôle affiché" className="flex flex-wrap gap-2">
            {BUILDS.map((build) => (
              <button
                key={build.id}
                type="button"
                aria-pressed={build.id === roleMobile}
                onClick={() => maj('role', build.id, BUILDS[0].id)}
                className={`bouton min-h-[44px] ${build.id === roleMobile ? '!border-or-300 !text-or-100 bg-voile/[0.06]' : ''}`}
              >
                <span aria-hidden="true">{build.icone}</span> {build.personnage}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Besoins vue={vue} onCopie={copier} />

      <p role="status" aria-live="polite" className="mb-4 min-h-[1.25rem] text-xs text-emerald-300" data-annonce>
        {annonce}
      </p>

      <div className="grid gap-6 lg:grid-cols-4" data-vue-equipe>
        {vue.plans.map((plan, index) => {
          const build = BUILDS.find((entree) => entree.id === plan.role)
          const accent = accentDe(build)
          const completude = completudeLoadout(plan.role, etat, acte)
          return (
            <section
              key={plan.role}
              data-role={plan.role}
              aria-label={`${build.personnage}, acte ${acte}`}
              className={`plaque min-w-0 p-4 ${plan.role === roleMobile ? '' : 'hidden lg:block'}`}
              style={variableAccent(build)}
            >
              <header className="mb-3">
                <Link
                  to={`/builds/${plan.role}?acte=${acte}`}
                  className={`font-display text-sm uppercase tracking-[0.1em] ${accent.texte} transition-colors hover:text-or-100`}
                >
                  <span aria-hidden="true">{build.icone}</span> {build.personnage}
                </Link>
                <p className="mt-1 font-rune text-[0.6rem] uppercase tracking-[0.14em] text-gray-500">{build.nom}</p>
                <BarreProgression
                  className="mt-3"
                  libelle="Équipé"
                  detail={`${completude.equipes}/${completude.total}`}
                  pourcentage={completude.pourcentage}
                  teinte={accent.barre}
                />
              </header>
              {plan.depassements.length > 0 && (
                <ul className="mb-3 space-y-1" aria-label="Limites de slots dépassées">
                  {plan.depassements.map((depassement) => (
                    <li key={depassement.slot} className="text-xs text-amber-200">
                      ⚠ {depassement.nombre} objets équipés en « {depassement.slot} » (limite {depassement.limite}).
                    </li>
                  ))}
                </ul>
              )}
              <ul className="space-y-2">
                {plan.emplacements.map((emplacement) => (
                  <Cellule
                    key={`${index}-${emplacement.cle}`}
                    emplacement={emplacement}
                    role={plan.role}
                    acte={acte}
                    onAffecter={affecter(plan.role)}
                    onLiberer={liberer_(plan.role)}
                  />
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
