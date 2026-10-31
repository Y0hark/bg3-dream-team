import { Link } from 'react-router-dom'
import EnteteSection from '../components/EnteteSection.jsx'
import EtatVide from '../components/EtatVide.jsx'
import Revelation from '../components/Revelation.jsx'
import { BUILDS_ANCIENS } from '../data/builds-anciens.js'
import { ITEMS_ANCIENS } from '../data/items-anciens.js'
import { infosStatut } from '../lib/progression.js'
import useProgression from '../hooks/useProgression.jsx'

const NOMS_ANCIENS = new Map(ITEMS_ANCIENS.map((item) => [item.id, item.nom]))

function telecharger(nom, texte) {
  const lien = document.createElement('a')
  lien.href = URL.createObjectURL(new Blob([texte], { type: 'application/json' }))
  lien.download = nom
  lien.click()
  URL.revokeObjectURL(lien.href)
}

/**
 * Ce que le catalogue actif ne connaît plus. Rien n'y est supprimé : c'est la
 * trace de l'ancienne composition, récupérable et exportable.
 */
export default function Archive() {
  const { etat, exporterDonnees } = useProgression()
  const items = Object.entries(etat.archive?.items ?? {})
  const checklist = Object.keys(etat.archive?.checklist ?? {})

  return (
    <div className="mx-auto max-w-grimoire px-5 py-12 sm:py-16">
      <EnteteSection
        surtitre="Ancienne composition"
        titre="Archive"
        chapeau="Les objets et cases de l’ancienne équipe que la nouvelle composition ne reprend pas. Ils ne sont pas transférés à un nouveau rôle : ils restent ici, récupérables, et exportables à tout moment."
        aside={
          <button type="button" className="bouton" onClick={() => telecharger('bg3-archive.json', exporterDonnees())}>
            Exporter les données
          </button>
        }
      />

      <Revelation className="plaque mb-8 p-6">
        <h2 className="grave text-base tracking-[0.1em]">Anciens builds</h2>
        <ul className="mt-4 space-y-2 text-sm text-gray-300">
          {BUILDS_ANCIENS.map((build) => (
            <li key={build.id}>
              <Link to={`/builds/${build.id}`} className="underline decoration-or-500/50 underline-offset-4 hover:text-or-100">
                {build.personnage} — {build.nom}
              </Link>{' '}
              <span className="text-gray-500">({build.split})</span>
            </li>
          ))}
        </ul>
      </Revelation>

      {items.length === 0 && checklist.length === 0 ? (
        <EtatVide
          titre="Archive vide"
          message="Aucune progression de l’ancienne composition n’a été mise de côté sur cet appareil."
        />
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          <Revelation className="plaque p-6">
            <h2 className="grave text-base tracking-[0.1em]">Objets ({items.length})</h2>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              {items.map(([id, statut]) => (
                <li key={id} className="flex justify-between gap-3">
                  <span>{NOMS_ANCIENS.get(id) ?? id}</span>
                  <span className="text-gray-500">{infosStatut(statut).nom}</span>
                </li>
              ))}
            </ul>
          </Revelation>
          <Revelation className="plaque p-6">
            <h2 className="grave text-base tracking-[0.1em]">Cases de checklist ({checklist.length})</h2>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              {checklist.map((id) => (
                <li key={id}>{id}</li>
              ))}
            </ul>
          </Revelation>
        </div>
      )}
    </div>
  )
}
