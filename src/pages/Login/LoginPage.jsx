// [LOGIN] Formulaire de connexion : pseudo + mot de passe uniquement (section 3).
import { FieldIcon } from '../../components/ui/FieldIcon'
import { SlideToLogin } from '../../components/ui/SlideToLogin'
import { useAuth } from '../../hooks/useAuth'

export function LoginPage() {
  const { auth, setAuth, loginAccount, authError, authLoading, showPassword, setShowPassword, rememberAuth, setRememberAuth } = useAuth()

  const handleSlideConfirm = () => loginAccount({ preventDefault() {} })
  // Le glisser-déposer gère déjà l'affichage de l'erreur ; la soumission clavier
  // classique (Entrée) ne doit pas générer un rejet de promesse non intercepté.
  const handleFormSubmit = (event) => { loginAccount(event).catch(() => {}) }

  return (
    <form className="auth-form" onSubmit={handleFormSubmit}>
      <label htmlFor="login-username">
        Pseudo
        <div className={`field ${auth.username ? (auth.username.trim().length >= 3 ? 'valid' : 'invalid') : ''}`}>
          <FieldIcon name="user" />
          <input
            id="login-username"
            required
            minLength={3}
            autoComplete="username"
            placeholder="Votre pseudo"
            value={auth.username}
            onChange={(event) => setAuth({ ...auth, username: event.target.value })}
          />
          {auth.username.trim().length >= 3 && <FieldIcon name="check" className="field-icon field-icon-right" />}
        </div>
      </label>

      <label htmlFor="login-password">
        Mot de passe
        <div className="password-input-group">
          <div className={`field ${auth.password ? (auth.password.length >= 8 ? 'valid' : 'invalid') : ''}`}>
            <FieldIcon name="lock" />
            <input
              id="login-password"
              required
              type={showPassword ? 'text' : 'password'}
              minLength={8}
              autoComplete="current-password"
              placeholder="8 caractères minimum"
              value={auth.password}
              onChange={(event) => setAuth({ ...auth, password: event.target.value })}
            />
          </div>
          <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)}>
            {showPassword ? 'Masquer' : 'Afficher'}
          </button>
        </div>
      </label>

      <label className="remember-option">
        <input type="checkbox" checked={rememberAuth} onChange={(event) => setRememberAuth(event.target.checked)} />
        <span>Se souvenir de moi</span>
      </label>

      {authError && (
        <p className="auth-error">
          <FieldIcon name="alert" />
          <span>{authError}</span>
        </p>
      )}

      {/* Bouton de connexion demandé par le cahier des charges (glisser pour valider). */}
      <div style={{ marginTop: '18px' }}>
        <SlideToLogin onConfirm={handleSlideConfirm} disabled={authLoading || !auth.username.trim() || auth.password.length < 8} />
      </div>

      {/* Bouton natif conservé, masqué visuellement, pour garder le formulaire soumissible au clavier (Entrée). */}
      <button type="submit" className="sr-only" disabled={authLoading} aria-hidden="true" tabIndex={-1}>
        Se connecter
      </button>
    </form>
  )
}
