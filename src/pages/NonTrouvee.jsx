import { Link } from 'react-router-dom'
import EtatVide from '../components/EtatVide.jsx'

export default function NonTrouvee() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-24">
      <EtatVide
        titre="Page introuvable"
        message="Cette adresse ne correspond à aucune section du tracker."
        action={
          <Link to="/" className="bouton mt-2">
            Retour au dashboard
          </Link>
        }
      />
    </div>
  )
}
