// [ADMIN] Interface dédiée à la console d'administration, distincte de l'interface
// joueur : pas de barre XP/niveau/progression, pas de navigation de jeu, pas de
// bannière d'invitation — un compte admin gère le site, il n'y "joue" pas depuis
// cette page. Monté comme route de premier niveau dans App.jsx (pas imbriqué dans
// RootLayout), avec sa propre gestion de la connexion (même AuthOverlay, réutilisé).
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { useToast } from '../../hooks/useToast'
import { AuthOverlay } from '../../components/layout/AuthOverlay'
import { AdminPage } from './AdminPage'

export function AdminLayout() {
  const { user, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { toast } = useToast()

  // Un compte connecté mais non-admin n'a rien à faire ici : renvoyé vers le site
  // joueur plutôt que de voir (même vide) une console d'administration.
  if (user && !isAdmin) return <Navigate to="/" replace />

  return (
    <main className={`app-shell ${theme === 'dark' ? 'theme-dark' : ''}`}>
      <header className="topbar">
        <span className="brand" aria-label="Escape Flag Admin">
          <span className="brand-mark"><i /><i /><i /><b>★</b></span>
          <span>ESCAPE<span>FLAG</span></span>
        </span>
        <span className="pill">Console admin</span>
        <div className="top-actions">
          <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Changer de thème">
            {theme === 'light' ? '☾' : '☀'}
          </button>
          {user && (
            <>
              <Link to="/" className="secondary small" style={{ textDecoration: 'none' }}>← Retour au site</Link>
              <span className="profile" style={{ cursor: 'default' }}>
                <span className="avatar small">{user.avatar}</span> {user.name}
              </span>
            </>
          )}
        </div>
      </header>

      {user && <AdminPage />}
      {toast && <div className="toast">{toast}</div>}
      {!user && <AuthOverlay />}
    </main>
  )
}
