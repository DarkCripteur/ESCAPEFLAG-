// [LOGIN] [REGISTER] Overlay affiché tant qu'aucun utilisateur n'est connecté.
// Bascule entre les pages Login/Register sans navigation d'URL (l'app reste sur la
// route demandée une fois connecté), comme dans le comportement d'origine.
import { useAuth } from '../../hooks/useAuth'
import { LoginPage } from '../../pages/Login/LoginPage'
import { RegisterPage } from '../../pages/Register/RegisterPage'

export function AuthOverlay() {
  const { authMode, setAuthMode, setAuthNotice, setAuthError, setAuth } = useAuth()

  const switchMode = (mode) => {
    setAuthMode(mode)
    setAuthNotice('')
    setAuthError('')
    setAuth((previous) => ({ ...previous, name: previous.name || '' }))
  }

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <a className="brand" href="#top">
          <span className="brand-mark"><i /><i /><i /><b>★</b></span>
          <span>ESCAPE<span>FLAG</span></span>
        </a>

        <div className="auth-title">
          <h2>{authMode === 'register' ? 'Créer un compte' : 'Bon retour !'}</h2>
          <p>{authMode === 'register' ? 'Rejoignez l’aventure en quelques secondes.' : 'Connectez-vous pour reprendre votre progression.'}</p>
          <div className="auth-switch">
            <button type="button" className={authMode === 'login' ? 'selected' : ''} onClick={() => switchMode('login')}>Connexion</button>
            <button type="button" className={authMode === 'register' ? 'selected' : ''} onClick={() => switchMode('register')}>Créer un compte</button>
          </div>
        </div>

        {authMode === 'register' ? <RegisterPage /> : <LoginPage />}
      </div>
    </div>
  )
}
