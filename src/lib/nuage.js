// ------------------------------------------------------------------
// Sauvegarde distante de la progression (Supabase, offre gratuite).
//
// Aucun compte : une run est identifiée par un « code de run » partageable,
// qui fait office de secret. La table n'est pas exposée directement — on
// passe par deux fonctions SQL (charger_progression / enregistrer_progression),
// ce qui empêche d'énumérer les runs des autres joueurs.
//
// La clé ci-dessous est la clé *publiable* : elle est faite pour vivre dans
// le bundle d'un site statique. Elle n'ouvre aucun accès en dehors des deux
// fonctions ci-dessus.
// ------------------------------------------------------------------

const env = import.meta.env ?? {}

export const URL_NUAGE = env.VITE_SUPABASE_URL || 'https://ajoosueheanjjobinosj.supabase.co'
export const CLE_NUAGE = env.VITE_SUPABASE_KEY || 'sb_publishable_5_7mX3p1NTDixTvU8bvhzQ_FaOulcf3'

/** Sans configuration, toute l'interface de synchro reste masquée. */
export function nuageConfigure() {
  return Boolean(URL_NUAGE && CLE_NUAGE)
}

// --- Codes de run --------------------------------------------------

// Le format est contraint côté base : ^[a-z0-9-]{6,48}$
const FORMAT_CODE = /^[a-z0-9-]{6,48}$/

const ADJECTIFS = [
  // Sans accent ni ponctuation : le format des codes est restreint à [a-z0-9-].
  'ardente', 'obscure', 'doree', 'funeste', 'sacree', 'maudite', 'ultime',
  'silencieuse', 'brulante', 'astrale', 'infernale', 'tenace',
]
const NOMS = [
  'nautiloide', 'illithide', 'grimoire', 'avernus', 'baldur', 'sceau',
  'sombreterre', 'gobelinerie', 'moonrise', 'cazador', 'orpheus', 'ombrelune',
]

function auHasard(liste) {
  return liste[Math.floor(Math.random() * liste.length)]
}

/** Code lisible et dictable au téléphone : « grimoire-ardente-472 ». */
export function genererCode() {
  const numero = String(Math.floor(Math.random() * 900) + 100)
  // Le passage par normaliserCode garantit qu'un mot ajouté un jour dans les
  // listes ne produira jamais un code que la base refuserait.
  return normaliserCode(`${auHasard(NOMS)}-${auHasard(ADJECTIFS)}-${numero}`)
}

/**
 * Normalise une saisie humaine : casse, espaces, accents et ponctuation.
 * Renvoie null si le résultat ne peut pas être un code valide.
 */
export function normaliserCode(brut) {
  if (typeof brut !== 'string') return null
  const propre = brut
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return FORMAT_CODE.test(propre) ? propre : null
}

// --- Appels RPC ----------------------------------------------------

class ErreurNuage extends Error {}

async function appeler(fonction, corps) {
  let reponse
  try {
    reponse = await fetch(`${URL_NUAGE}/rest/v1/rpc/${fonction}`, {
      method: 'POST',
      headers: {
        apikey: CLE_NUAGE,
        Authorization: `Bearer ${CLE_NUAGE}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(corps),
    })
  } catch {
    // Hors ligne, DNS, CORS… : rien d'exploitable à afficher de plus.
    throw new ErreurNuage('Serveur injoignable')
  }

  if (!reponse.ok) {
    throw new ErreurNuage(`Le serveur a refusé la requête (${reponse.status})`)
  }
  return reponse.json()
}

/**
 * Lit la progression d'une run. Renvoie null si le code n'existe pas encore
 * côté serveur — c'est le cas normal d'une run qu'on vient de créer.
 */
export async function chargerDistant(code) {
  const lignes = await appeler('charger_progression', { p_code: code })
  const ligne = Array.isArray(lignes) ? lignes[0] : lignes
  if (!ligne?.etat) return null
  return { etat: ligne.etat, majLe: ligne.maj_le ?? null }
}

/** Écrit la progression et renvoie l'horodatage retenu par le serveur. */
export async function enregistrerDistant(code, etat) {
  const majLe = await appeler('enregistrer_progression', { p_code: code, p_etat: etat })
  return typeof majLe === 'string' ? majLe : new Date().toISOString()
}
