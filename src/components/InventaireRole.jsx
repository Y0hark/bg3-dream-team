import { useEffect, useMemo, useRef, useState } from 'react'
import { BadgesAcquisition } from './AlertesAcquisition.jsx'
import Dialogue from './Dialogue.jsx'
import FicheObjet, { ApercuObjet } from './FicheObjet.jsx'
import IconeObjet from './IconeObjet.jsx'
import SelecteurOptions from './SelecteurOptions.jsx'
import { ACTES } from '../data/actes.js'
import { objetDe } from '../data/objets.js'
import {
  ETATS_EMPLACEMENT,
  LIBELLES_PLAN,
  avertissementsCompatibilite,
  avertissementsObjet,
  inventaireRole,
} from '../lib/inventaire.js'
import { nomsObjet } from '../lib/localisation.js'
import useProgression from '../hooks/useProgression.jsx'

const socle =
  'inline-flex items-center rounded-full border px-2 py-0.5 font-rune text-[0.58rem] uppercase tracking-[0.12em]'

// Classes écrites en entier : Tailwind ne détecte pas les noms construits.
const TEINTES_ETAT = {
  vide: 'border-or-700/30 text-gray-500',
  prevu: 'border-or-700/40 text-gray-300',
  disponible: 'border-sky-400/45 text-sky-200',
  equipe: 'border-emerald-400/45 text-emerald-300',
}

/** Sélecteur d'acte partagé : trois boutons, jamais un menu à ouvrir. */
export function SelecteurActe({ acte, onChoisir, libelle = 'Acte' }) {
  return (
    <div role="group" aria-label={libelle} className="flex flex-wrap gap-2">
      {ACTES.map((entree) => (
        <button
          key={entree.numero}
          type="button"
          aria-pressed={entree.numero === acte}
          onClick={() => onChoisir(entree.numero)}
          className={`bouton min-h-[44px] min-w-[44px] ${entree.numero === acte ? '!border-or-300 !text-or-100 bg-voile/[0.06]' : ''}`}
        >
          {entree.nom}
        </button>
      ))}
    </div>
  )
}

function Emplacement({ emplacement, onFiche, onOptions, onApercu }) {
  const { courante } = emplacement
  const objet = courante?.objet ? objetDe(courante.objet) : null
  const noms = objet ? nomsObjet(objet) : null
  const alertes = objet ? avertissementsObjet(objet) : []
  const nom = noms?.principal ?? 'Libre'

  return (
    <li
      className="flex min-w-0 flex-col rounded border border-or-700/25 bg-voile/[0.02] p-2"
      onMouseEnter={() => onApercu(emplacement)}
      onFocus={() => onApercu(emplacement)}
    >
      <p className="px-1 font-rune text-[0.6rem] uppercase tracking-[0.14em] text-gray-500">{emplacement.libelle}</p>
      <button
        type="button"
        onClick={onFiche}
        aria-haspopup="dialog"
        aria-label={`${emplacement.libelle} : ${nom}, ${ETATS_EMPLACEMENT[emplacement.etat]}. Ouvrir la fiche`}
        className="mt-1 flex min-h-[44px] w-full min-w-0 items-start gap-2 rounded-sm p-1 text-left transition-colors hover:bg-voile/[0.05]"
      >
        <IconeObjet objet={objet ?? { slot: emplacement.slot }} taille={40} />
        <span className="min-w-0 flex-1">
          <span className="block break-words text-sm leading-snug text-gray-100">{nom}</span>
          <span className="mt-1 flex flex-wrap gap-1">
            <span className={`${socle} ${TEINTES_ETAT[emplacement.etat]}`}>{ETATS_EMPLACEMENT[emplacement.etat]}</span>
            {emplacement.choisie && <span className={`${socle} border-sky-400/45 text-sky-200`}>Alternative</span>}
            {emplacement.conserveDepuis && (
              <span className={`${socle} border-or-700/40 text-gray-400`}>Conservé · acte {emplacement.conserveDepuis}</span>
            )}
            {alertes.length > 0 && (
              <span className={`${socle} border-amber-300/45 text-amber-200`} title={alertes.join(' · ')}>
                ⚠ À vérifier
              </span>
            )}
          </span>
          {objet && <BadgesAcquisition objetId={objet.id} className="mt-1" />}
        </span>
      </button>
      <button
        type="button"
        onClick={onOptions}
        aria-haspopup="dialog"
        aria-label={`Options pour ${emplacement.libelle}`}
        disabled={emplacement.options.length === 0}
        className="bouton mt-2 min-h-[44px] w-full disabled:opacity-40"
      >
        Options{emplacement.options.length > 1 ? ` (${emplacement.options.length})` : ''}
      </button>
    </li>
  )
}

/**
 * Inventaire d'un rôle pour l'acte choisi : un emplacement par slot, avec son
 * état (vide / prévu / disponible / équipé). L'acte et les alternatives sont
 * des choix de PLAN ; la possession et l'équipement ne changent que par les
 * actions de suivi explicites de la fiche.
 */
export default function InventaireRole({ role, acte, onActe, accent }) {
  const { etat, choisirAlternative } = useProgression()
  const emplacements = useMemo(() => inventaireRole(role, acte, etat), [role, acte, etat])
  const compat = useMemo(() => avertissementsCompatibilite(role, emplacements), [role, emplacements])
  // Quel emplacement est consulté, et quelle vue : fiche d'une option ou liste d'options.
  const [vue, setVue] = useState(null)
  const [apercu, setApercu] = useState(null)
  const idVue = useRef(0)

  // L'emplacement est relu à chaque rendu : un choix récent se reflète aussitôt dans la fiche.
  const emplacement = vue ? emplacements.find((entree) => entree.cle === vue.cle) : null
  const survol = apercu ? emplacements.find((entree) => entree.cle === apercu.cle) : null

  // Déclencheur du premier dialogue ouvert : le focus y revient à la fermeture.
  const declencheur = useRef(null)
  useEffect(() => {
    if (vue === null && declencheur.current) {
      if (declencheur.current.isConnected) declencheur.current.focus()
      declencheur.current = null
    }
  }, [vue])

  function ouvrir(type, cible, option = null) {
    if (!vue) declencheur.current = document.activeElement
    idVue.current += 1
    setVue({ type, cle: cible.cle, option })
  }

  function choisir(objetId) {
    choisirAlternative(role, acte, emplacement.slot, emplacement.indice, objetId, emplacement.reference?.objet ?? null)
    setVue(null)
  }

  const nomActe = ACTES.find((entree) => entree.numero === acte)?.nom

  return (
    <section aria-labelledby={`inventaire-${role}`} data-inventaire={role}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <h3 id={`inventaire-${role}`} className={`font-display text-sm uppercase tracking-[0.1em] ${accent?.texte ?? 'text-or-100'}`}>
          Inventaire · {nomActe}
        </h3>
        {onActe && <SelecteurActe acte={acte} onChoisir={onActe} />}
      </div>
      <p className="mb-3 text-xs leading-relaxed text-gray-400">
        <strong className="font-normal text-gray-200">{LIBELLES_PLAN.prevu}</strong> : le plan du rôle, avec vos
        alternatives. <strong className="font-normal text-gray-200">{LIBELLES_PLAN.equipe}</strong> : seulement ce que
        vous avez affecté dans le suivi. Changer d’acte ou d’option n’équipe rien.
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <ul className="grid min-w-0 grid-cols-1 gap-2 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {emplacements.map((entree) => (
            <Emplacement
              key={entree.cle}
              emplacement={entree}
              onFiche={() => ouvrir('fiche', entree, entree.courante)}
              onOptions={() => ouvrir('options', entree)}
              onApercu={(cible) => setApercu(cible)}
            />
          ))}
        </ul>
        <aside
          aria-label="Aperçu de l’objet"
          className="plaque min-w-0 self-start break-words p-4 lg:sticky lg:top-20"
          data-apercu
        >
          <ApercuObjet emplacement={survol} />
        </aside>
      </div>

      {compat.length > 0 && (
        <ul className="mt-3 space-y-1" aria-label="Compatibilité à vérifier">
          {compat.map((texte) => (
            <li key={texte} className="text-xs leading-relaxed text-amber-200">
              ⚠ {texte}
            </li>
          ))}
        </ul>
      )}

      {vue && emplacement && (
        <Dialogue
          key={`${vue.type}-${idVue.current}`}
          idTitre={`dialogue-${role}`}
          titre={vue.type === 'options' ? `Options — ${emplacement.libelle}` : emplacement.libelle}
          onFermer={() => setVue(null)}
        >
          {vue.type === 'options' ? (
            <SelecteurOptions
              emplacement={emplacement}
              onChoisir={choisir}
              onFiche={(option) => ouvrir('fiche-options', emplacement, option)}
            />
          ) : (
            <>
              {vue.type === 'fiche-options' && (
                <button type="button" className="bouton mb-4 min-h-[44px]" onClick={() => ouvrir('options', emplacement)}>
                  ← Retour aux options
                </button>
              )}
              <FicheObjet
                emplacement={emplacement}
                option={vue.option}
                role={role}
                acte={acte}
                onChanger={vue.type === 'fiche' ? () => ouvrir('options', emplacement) : null}
              />
            </>
          )}
        </Dialogue>
      )}
    </section>
  )
}
