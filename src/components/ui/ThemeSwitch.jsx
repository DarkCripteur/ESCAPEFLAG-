// [DARK MODE] Bouton de changement de thème "pilule" (sphère lumineuse qui glisse d'un
// bout à l'autre selon le thème actif), plutôt que l'icône seule d'origine. Même
// pattern que AnimatedCta.jsx pour l'animation : ordre JSX conditionnel + `layout`
// (Framer Motion anime automatiquement le repositionnement), pas de calcul manuel de
// position. Utilisé par Header.jsx (site joueur) et AdminLayout.jsx (console admin).
import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'

export function ThemeSwitch({ theme, onToggle }) {
  const isDark = theme === 'dark'

  return (
    <button type="button" className="theme-switch" onClick={onToggle} aria-label="Changer de thème" aria-pressed={isDark}>
      {isDark ? (
        <>
          <motion.span layout className="theme-switch-icon-static" key="static"><Sun size={14} /></motion.span>
          <motion.span layout className="theme-switch-label" key="label">Changer le thème</motion.span>
          <motion.span layout className="theme-switch-knob theme-switch-knob-dark" key="knob"><Moon size={16} /></motion.span>
        </>
      ) : (
        <>
          <motion.span layout className="theme-switch-knob theme-switch-knob-light" key="knob"><Sun size={16} /></motion.span>
          <motion.span layout className="theme-switch-label" key="label">Changer le thème</motion.span>
          <motion.span layout className="theme-switch-icon-static" key="static"><Moon size={14} /></motion.span>
        </>
      )}
    </button>
  )
}
