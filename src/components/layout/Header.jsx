// [HEADER] Barre de navigation principale. Le lien Admin n'apparaît jamais ici
// (section 10 du cahier des charges) : la console d'administration n'est accessible
// qu'en tapant directement l'URL /admin.
// [MOBILE] En dessous de 860px (téléphones et tablettes en portrait), les 7 liens ne
// tiennent plus sur une ligne (texte tassé/coupé constaté sur iPhone réel) : la nav
// devient un tiroir plein écran ouvert via un bouton hamburger, plutôt qu'un simple
// retour à la ligne. Au-dessus de 860px, comportement desktop inchangé.
// Le statut "salle connectée" (auparavant seul dans GameStatusBar/.game-meta) vit
// maintenant ici, dans la même pastille arrondie que la nav, pour le look "carte
// flottante" demandé — GameStatusBar ne garde que l'info propre à la question en cours.
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Lightbulb, Menu, Volume2, VolumeX, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { SuggestionModal } from './SuggestionModal'
import { ThemeSwitch } from '../ui/ThemeSwitch'

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
  const { user, players, serverOnline } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [sound, setSound] = useState(true)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Empêche le défilement de la page derrière le tiroir ouvert, et permet de le
  // fermer avec Échap (clavier physique sur tablette).
  useEffect(() => {
    if (!menuOpen) return undefined
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event) => { if (event.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  return (
    <header className="topbar">
      <div className="topbar-top">
        {/* TODO(section 19): texte du header à personnaliser. */}
        <a className="brand" href="#top" aria-label="Escape Flag">
          <span className="brand-mark"><i /><i /><i /><b>★</b></span>
          <span>ESCAPE<span>FLAG</span></span>
        </a>

        <div className="top-actions">
          {user && (
            <button type="button" className="theme-toggle" onClick={() => setShowSuggestions(true)} aria-label="Envoyer une suggestion" title="Boîte à suggestions">
              <Lightbulb size={18} />
            </button>
          )}
          <ThemeSwitch theme={theme} onToggle={toggleTheme} />
          <button className="sound" onClick={() => setSound((value) => !value)} aria-label="Son">
            {sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          {user && (
            <NavLink to="/profil" className="profile">
              <span className="avatar small">{user.avatar}</span>
              <span className="online" />
              <span className="profile-name">{user.name}</span>
            </NavLink>
          )}
        </div>

        <button
          type="button"
          className="nav-toggle"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className="nav-row">
        {/* [MOBILE] La pastille de statut disparaît en dessous de 860px : elle fait
            doublon avec la barre d'onglets du bas + le tiroir hamburger, qui couvrent
            déjà la navigation mobile. Reste affichée en desktop/tablette large, seule
            navigation disponible à ces largeurs. `nav` est un frère (pas un enfant) de
            `.room-chip` : la masquer sur mobile ne doit jamais cacher `nav` avec elle,
            sans quoi le tiroir plein écran (position fixed) deviendrait inaccessible. */}
        <span className="room-chip">
          <span className={serverOnline ? 'live-dot' : 'offline-dot'} />
          SALLE CONNECTÉE <b>•</b> {players.length} JOUEUR{players.length !== 1 ? 'S' : ''}
        </span>
        <nav className={menuOpen ? 'open' : ''}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      {menuOpen && <div className="nav-overlay" onClick={() => setMenuOpen(false)} />}

      {user && <SuggestionModal open={showSuggestions} onClose={() => setShowSuggestions(false)} />}
    </header>
  )
}
