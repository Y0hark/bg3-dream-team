import { ACTES } from '../data/actes.js'
import { BUILDS } from '../data/builds.js'
import { PRIORITES } from '../data/items.js'
import { FILTRES_VIDES, STATUTS, filtresActifs } from '../lib/progression.js'

function Selecteur({ id, libelle, valeur, options, onChange }) {
  return (
    <label htmlFor={id} className="block min-w-0">
      <span className="glyphe mb-1.5 block">{libelle}</span>
      <select
        id={id}
        className="champ"
        value={valeur}
        onChange={(evenement) => onChange(evenement.target.value)}
      >
        {options.map((option) => (
          <option key={option.valeur} value={option.valeur}>
            {option.libelle}
          </option>
        ))}
      </select>
    </label>
  )
}

/**
 * Barre de filtres du catalogue. Sur mobile les champs s'empilent : ils
 * restent tous accessibles sans menu caché.
 */
export default function FiltresItems({ filtres, setFiltres, resultats, total }) {
  const modifier = (cle) => (valeur) => setFiltres((precedent) => ({ ...precedent, [cle]: valeur }))
  const actifs = filtresActifs(filtres)

  return (
    <section className="plaque mb-8 p-5" aria-label="Filtres du catalogue">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Selecteur
          id="filtre-acte"
          libelle="Acte"
          valeur={filtres.acte}
          onChange={modifier('acte')}
          options={[
            { valeur: 'tous', libelle: 'Tous les actes' },
            ...ACTES.map((acte) => ({ valeur: String(acte.numero), libelle: acte.nom })),
          ]}
        />
        <Selecteur
          id="filtre-personnage"
          libelle="Personnage"
          valeur={filtres.personnage}
          onChange={modifier('personnage')}
          options={[
            { valeur: 'tous', libelle: 'Toute l’équipe' },
            ...BUILDS.map((build) => ({ valeur: build.id, libelle: build.personnage })),
          ]}
        />
        <Selecteur
          id="filtre-priorite"
          libelle="Priorité"
          valeur={filtres.priorite}
          onChange={modifier('priorite')}
          options={[
            { valeur: 'tous', libelle: 'Toutes priorités' },
            ...PRIORITES.map((priorite) => ({ valeur: priorite, libelle: priorite })),
          ]}
        />
        <Selecteur
          id="filtre-statut"
          libelle="Statut"
          valeur={filtres.statut}
          onChange={modifier('statut')}
          options={[
            { valeur: 'tous', libelle: 'Tous statuts' },
            ...STATUTS.map((statut) => ({ valeur: statut.id, libelle: statut.nom })),
          ]}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <label htmlFor="filtre-recherche" className="min-w-0 flex-1">
          <span className="glyphe mb-1.5 block">Recherche</span>
          <input
            id="filtre-recherche"
            type="search"
            className="champ normal-case tracking-normal"
            placeholder="Nom d’item, slot, source…"
            value={filtres.recherche}
            onChange={(evenement) => modifier('recherche')(evenement.target.value)}
          />
        </label>

        <div className="flex items-center gap-4">
          <p className="font-rune text-[0.7rem] uppercase tracking-[0.14em] text-gray-400">
            {resultats} / {total} items
          </p>
          <button
            type="button"
            className="bouton disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => setFiltres(FILTRES_VIDES)}
            disabled={!actifs}
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </section>
  )
}
