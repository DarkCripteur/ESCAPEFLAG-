// [MOBILE] Barre d'onglets fixe en bas de l'écran (<860px), en plus du tiroir
// hamburger complet (Header.jsx) qui reste la seule voie vers Undercover/Smash or
// Pass sur mobile — cette barre ne reprend que les 5 destinations les plus
// fréquentes, façon appli native, pour un accès direct sans ouvrir le tiroir.
import { NavLink } from 'react-router-dom'
import { Gamepad2, Target, Trophy, User, Users } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Jouer', end: true, Icon: Gamepad2 },
  { to: '/profil', label: 'Profil', Icon: User },
  { to: '/classement', label: 'Classement', Icon: Trophy },
  { to: '/defis', label: 'Défis', Icon: Target },
  { to: '/amis', label: 'Amis', Icon: Users },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      {tabs.map(({ to, label, end, Icon }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `bottom-nav-link ${isActive ? 'active' : ''}`}>
          <Icon size={20} strokeWidth={2.2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
