import { useCallback, useEffect, useState } from 'react'
import { CLE_THEME, THEME_DEFAUT, themeValide } from '../lib/themes.js'

/**
 * Le thème vit sur <html data-theme="…">. Le script inline de index.html l'a
 * déjà posé avant le premier rendu (pas de flash) : on se contente de le lire
 * puis de le tenir à jour.
 */
function themeInitial() {
  const pose = document.documentElement.dataset.theme
  if (pose) return themeValide(pose)

  try {
    return themeValide(localStorage.getItem(CLE_THEME))
  } catch {
    // Mode privé ou stockage refusé : on retombe sur le grimoire.
    return THEME_DEFAUT
  }
}

export default function useTheme() {
  const [theme, setThemeEtat] = useState(themeInitial)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const changerTheme = useCallback((id) => {
    const choisi = themeValide(id)
    setThemeEtat(choisi)
    try {
      localStorage.setItem(CLE_THEME, choisi)
    } catch {
      // Le thème restera valable pour la session, sans être mémorisé.
    }
  }, [])

  return [theme, changerTheme]
}
