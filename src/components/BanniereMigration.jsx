import { Link } from 'react-router-dom'
import useProgression from '../hooks/useProgression.jsx'

/** Télécharge un texte JSON — la copie de secours reste entre les mains de l'utilisateur. */
function telecharger(nom, texte) {
  const lien = document.createElement('a')
  lien.href = URL.createObjectURL(new Blob([texte], { type: 'application/json' }))
  lien.download = nom
  lien.click()
  URL.revokeObjectURL(lien.href)
}

function Cadre({ children, ton = 'or' }) {
  const teinte =
    ton === 'alerte'
      ? 'border-red-400/40 bg-red-950/30 text-red-100'
      : 'border-or-500/40 bg-encre/80 text-gray-200'
  return (
    <section role="status" className={`border-b px-5 py-4 text-sm leading-relaxed ${teinte}`}>
      <div className="mx-auto flex max-w-grimoire flex-wrap items-center justify-between gap-4">{children}</div>
    </section>
  )
}

/**
 * Trois situations où l'on ne doit surtout pas écrire en silence :
 *  - une sauvegarde d'avant la V2 attend la confirmation du changement de composition ;
 *  - le stockage local est dans un format plus récent ou illisible ;
 *  - la sauvegarde en ligne est plus récente, illisible ou écrite par une ancienne version.
 */
export default function BanniereMigration() {
  const {
    statutStockage,
    rapportMigration,
    erreurMigration,
    confirmerMigration,
    exporterDonnees,
    synchro,
    forcerEnvoi,
  } = useProgression()

  if (statutStockage === 'migration-proposee') {
    const r = rapportMigration
    return (
      <Cadre>
        <div className="max-w-3xl">
          <p className="font-display text-base uppercase tracking-[0.1em] text-or-100">
            Nouvelle composition : Sorcier feu, Paladin, Moine, Sidekick
          </p>
          <p className="mt-2 text-gray-300">
            Votre progression d’avant la V2 est conservée à l’identique pour les {r?.conserves ?? 0} objet(s) du catalogue
            qui n’ont pas changé. {r?.archives ? `${r.archives} objet(s) de l’ancienne équipe ne sont pas transférables : ils sont rangés dans l’archive, récupérables et exportables, jamais supprimés. ` : ''}
            Aucune affectation de l’ancienne équipe n’est reportée sur un nouveau rôle. Une copie de secours est écrite avant tout changement.
          </p>
          {erreurMigration && <p className="mt-2 text-red-300">{erreurMigration}</p>}
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="bouton" onClick={confirmerMigration}>
            Passer à la nouvelle composition
          </button>
          <button type="button" className="bouton" onClick={() => telecharger('bg3-sauvegarde-avant-v2.json', exporterDonnees())}>
            Exporter l’ancienne sauvegarde
          </button>
        </div>
      </Cadre>
    )
  }

  if (statutStockage === 'format-plus-recent' || statutStockage === 'illisible') {
    return (
      <Cadre ton="alerte">
        <p className="max-w-3xl">
          {statutStockage === 'format-plus-recent'
            ? 'Ce navigateur contient une sauvegarde écrite par une version plus récente de l’application. Pour ne pas l’abîmer, l’enregistrement automatique est coupé : actualisez la page ou mettez l’application à jour.'
            : 'La sauvegarde de ce navigateur a un format que cette version ne sait pas lire. Elle n’a pas été modifiée et l’enregistrement automatique est coupé.'}
        </p>
        <button type="button" className="bouton" onClick={() => telecharger('bg3-sauvegarde-illisible.json', exporterDonnees())}>
          Exporter ce qui est stocké
        </button>
      </Cadre>
    )
  }

  if (synchro.statut === 'bloque' || synchro.statut === 'attente-migration') {
    return (
      <Cadre ton={synchro.statut === 'bloque' ? 'alerte' : 'or'}>
        <p className="max-w-3xl">{synchro.message}</p>
        {synchro.raison === 'ancien-client' && (
          <div className="flex flex-wrap gap-3">
            <button type="button" className="bouton" onClick={forcerEnvoi}>
              Écraser la sauvegarde en ligne avec la mienne
            </button>
          </div>
        )}
      </Cadre>
    )
  }

  return null
}

export function LienArchive() {
  return (
    <Link to="/archive" className="underline decoration-or-500/50 underline-offset-4 hover:text-or-100">
      Voir l’archive de l’ancienne composition
    </Link>
  )
}
