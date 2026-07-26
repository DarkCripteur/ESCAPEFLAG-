// [HEADER] Barre de navigation principale. Le lien Admin n'apparaît jamais ici
// (section 10 du cahier des charges) : la console d'administration n'est accessible
// qu'en tapant directement l'URL /admin.
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Icon } from '../ui/Icon'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { SuggestionModal } from './SuggestionModal'

const navItems = [
  { to: '/', label: 'JOUER', end: true },
  { to: '/profil', label: 'PROFIL' },
  { to: '/classement', label: 'CLASSEMENT' },
  { to: '/defis', label: 'DÉFIS' },
  { to: '/amis', label: 'AMIS' },
  { to: '/undercover', label: 'UNDERCOVER' },
  { to: '/smash-or-pass', label: 'SMASH OR PASS' },
]

export function Header() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [sound, setSound] = useState(true)
  const [showSuggestions, setShowSuggestions] = useState(false)

  return (
    <header className="topbar">
      {/* TODO(section 19): texte du header à personnaliser. */}
      <a className="brand" href="#top" aria-label="Escape Flag">
        <span className="brand-mark"><i /><i /><i /><b>★</b></span>
        <span>ESCAPE<span>FLAG</span></span>
      </a>
      <nav>
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="top-actions">
        {user && (
          <button type="button" className="theme-toggle" onClick={() => setShowSuggestions(true)} aria-label="Envoyer une suggestion" title="Boîte à suggestions">
            💡
          </button>
        )}
        <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Changer de thème">
          {theme === 'light' ? '☾' : '☀'}
        </button>
        <button className="sound" onClick={() => setSound((value) => !value)} aria-label="Son">
          <Icon>{sound ? '♬' : '♪̸'}</Icon>
        </button>
        {user && (
          <NavLink to="/profil" className="profile">
            <span className="avatar small">{user.avatar}</span>
            <span className="online" /> {user.name}
          </NavLink>
        )}
      </div>
      {user && <SuggestionModal open={showSuggestions} onClose={() => setShowSuggestions(false)} />}
    </header>
  )
}
