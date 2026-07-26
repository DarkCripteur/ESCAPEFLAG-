// [DARK MODE] Thème clair/sombre (section 13) : persisté par joueur (localStorage),
// avec la préférence système comme repli au tout premier chargement.
import { createContext, useEffect, useState } from 'react'

export const ThemeContext = createContext(null)

const THEME_STORAGE_KEY = 'escape-flag-theme'

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // Stockage indisponible (navigation privée stricte, etc.) : on retombe sur la
    // préférence système ci-dessous sans faire planter l'application.
  }
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.body.dataset.theme = theme
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Idem : la persistance est un confort, pas une exigence bloquante.
    }
  }, [theme])

  const toggleTheme = () => setTheme((value) => (value === 'light' ? 'dark' : 'light'))

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>
}
