// ------------------------------------------------------------------
// Collecte des icônes d'objets depuis le BG3 Wiki — script de PRÉPARATION,
// jamais exécuté par le site ni par le build. Usage : node scripts/collecter-icones.mjs
//
// Pour chaque objet de objets.js : la page de l'objet (champ `wiki`) est
// interrogée via l'API MediaWiki, l'image est résolue parmi les fichiers de
// la page (jamais une URL construite depuis le nom), téléchargée dans
// public/icones/<id>.<ext>, et consignée dans src/data/icones-wiki.json
// (page objet, page fichier, URL, sha1, dimensions, statut).
// Débit limité (1 requête/s) et cache : un fichier déjà présent avec le bon
// sha1 n'est pas retéléchargé.
// ------------------------------------------------------------------
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { OBJETS } from '../src/data/objets.js'

const API = 'https://bg3.wiki/w/api.php'
const UA = 'bg3-dream-team-asset-collector (contact: samuelgaliere.pro@gmail.com)'
const DELAI_MS = 1000
const DOSSIER = new URL('../public/icones/', import.meta.url)
const SORTIE = new URL('../src/data/icones-wiki.json', import.meta.url)

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function api(params) {
  await pause(DELAI_MS)
  const url = `${API}?${new URLSearchParams({ format: 'json', ...params })}`
  const reponse = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!reponse.ok) throw new Error(`API ${reponse.status} : ${url}`)
  return reponse.json()
}

const premierePage = (json) => Object.values(json.query.pages)[0]
const norme = (texte) => texte.toLowerCase().replace(/[^a-z0-9]+/g, '')

/** Fichier d'icône d'inventaire parmi les fichiers de la page de l'objet. */
function choisirFichier(titrePage, fichiers) {
  const base = norme(titrePage)
  const icones = fichiers
    .map((f) => f.title.replace(/^File:/, ''))
    .filter((nom) => /\.(png|webp|jpe?g)$/i.test(nom))
  const exact = icones.find((nom) => norme(nom.replace(/\.[a-z]+$/i, '')) === base + 'icon')
  if (exact) return { nom: exact, type: 'inventaire' }
  const proche = icones.find((nom) => {
    const n = norme(nom.replace(/\.[a-z]+$/i, ''))
    return n.endsWith('icon') && (n.includes(base) || base.includes(n.slice(0, -4)))
  })
  if (proche) return { nom: proche, type: 'inventaire' }
  return null
}

/** Dernier recours : visuel tooltip publié sous le nom de l'objet. */
function choisirTooltip(titrePage, fichiers) {
  const base = norme(titrePage)
  const nom = fichiers
    .map((f) => f.title.replace(/^File:/, ''))
    .find((n) => /\.(png|webp)$/i.test(n) && norme(n).startsWith(base) && !/dyed|model/i.test(n))
  return nom ? { nom, type: 'tooltip' } : null
}

/**
 * Repli : l'image principale de la fiche (infobox). Pour beaucoup d'objets, le
 * jeu réutilise un sprite de base partagé (ex. « Ring F Silver A 1 ») : c'est
 * le visuel authentique de l'objet, pas un fichier à son nom.
 */
async function imageInfobox(titre) {
  const json = await api({ action: 'parse', page: titre, prop: 'text', disablelimitreport: '1', redirects: '1' })
  const html = json.parse?.text?.['*'] ?? ''
  const balise = html.match(/<img[^>]*alt="[^"]* (?:image|controller icon)"[^>]*>/)?.[0]
  const chemin = balise?.match(/src="([^"]+)"/)?.[1]
  if (!chemin) return null
  const nom = chemin.replace(/^\/w\/images\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\//, '').split('/')[0]
  return { nom: decodeURIComponent(nom).replace(/_/g, ' '), type: 'infobox-partagee' }
}

const manifeste = []
for (const objet of OBJETS) {
  const titrePage = decodeURIComponent(objet.wiki.replace('https://bg3.wiki/wiki/', '')).replace(/_/g, ' ')
  const ligne = { id: objet.id, nom: objet.nom, pageObjet: objet.wiki, statut: 'bloque', raison: '' }
  try {
    const page = premierePage(await api({ action: 'query', titles: titrePage, prop: 'images', imlimit: '100', redirects: '1' }))
    if (page.missing !== undefined) throw new Error('page objet introuvable')
    let choix = choisirFichier(page.title, page.images ?? [])
    if (!choix) choix = await imageInfobox(page.title)
    if (!choix) choix = choisirTooltip(page.title, page.images ?? [])
    if (!choix) throw new Error('aucun fichier d’icône identifié sur la page')
    const info = premierePage(await api({ action: 'query', titles: `File:${choix.nom}`, prop: 'imageinfo', iiprop: 'url|size|mime|sha1' })).imageinfo?.[0]
    if (!info) throw new Error(`fichier absent : ${choix.nom}`)
    const extension = choix.nom.split('.').pop().toLowerCase()
    const fichier = `${objet.id}.${extension}`
    Object.assign(ligne, {
      fichier, typeVisuel: choix.type, pageFichier: info.descriptionurl, urlSource: info.url,
      sha1: info.sha1, largeur: info.width, hauteur: info.height, statut: 'ok',
    })
    const chemin = new URL(fichier, DOSSIER)
    const aJour = existsSync(chemin) && createHash('sha1').update(readFileSync(chemin)).digest('hex') === info.sha1
    if (!aJour) {
      await pause(DELAI_MS)
      const image = await fetch(info.url, { headers: { 'User-Agent': UA } })
      if (!image.ok) throw new Error(`téléchargement ${image.status}`)
      mkdirSync(DOSSIER, { recursive: true })
      writeFileSync(chemin, Buffer.from(await image.arrayBuffer()))
    }
  } catch (erreur) {
    ligne.raison = erreur.message
  }
  console.log(ligne.statut === 'ok' ? 'OK ' : 'KO ', objet.id, ligne.fichier ?? ligne.raison)
  manifeste.push(ligne)
}

writeFileSync(SORTIE, JSON.stringify(manifeste, null, 2) + '\n')
const ok = manifeste.filter((l) => l.statut === 'ok').length
console.log(`\n${ok}/${manifeste.length} icônes collectées`)
