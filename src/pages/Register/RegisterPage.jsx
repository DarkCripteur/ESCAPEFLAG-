// [REGISTER] Formulaire d'inscription (section 3) : nom, pseudo unique, e-mail,
// téléphone international (pays/indicatif/drapeau/recherche, section 12), mot de
// passe + confirmation.
import { FieldIcon } from '../../components/ui/FieldIcon'
import { AnimatedCta } from '../../components/ui/AnimatedCta'
import { PhoneCountryPicker } from '../../components/ui/PhoneCountryPicker'
import { useAuth } from '../../hooks/useAuth'
import { countries } from '../../data/countries'
import { isValidEmail, isValidUsername, getPasswordStrength } from '../../utils/validators'

export function RegisterPage() {
  const { auth, setAuth, registerAccount, authError, authNotice, authLoading, showPassword, setShowPassword } = useAuth()
  const passwordStrength = getPasswordStrength(auth.password)
  const passwordsMatch = auth.passwordConfirmation.length > 0 && auth.password === auth.passwordConfirmation
  const selectedCountry = countries.find((c) => c.name === auth.country) || null

  // Le bouton "Créer un compte" pilote lui-même la soumission (pour ses états
  // chargement/succès/erreur) ; la touche Entrée doit rester possible mais sans
  // provoquer de rejet de promesse non intercepté (comme LoginPage).
  const handleFormSubmit = (event) => { registerAccount(event).catch(() => {}) }

  return (
    <form className="auth-form" onSubmit={handleFormSubmit}>
      <label htmlFor="register-name">
        Nom complet
        <div className={`field ${auth.name ? (auth.name.trim().length >= 2 ? 'valid' : 'invalid') : ''}`}>
          <FieldIcon name="user" />
          <input
            id="register-name"
            required
            minLength={2}
            placeholder="Ex. Fustel"
            value={auth.name}
            onChange={(event) => setAuth({ ...auth, name: event.target.value })}
          />
          {auth.name.trim().length >= 2 && <FieldIcon name="check" className="field-icon field-icon-right" />}
        </div>
      </label>

      <label htmlFor="register-username">
        Pseudo de jeu (unique)
        <div className={`field ${auth.username ? (isValidUsername(auth.username) ? 'valid' : 'invalid') : ''}`}>
          <FieldIcon name="user" />
          <input
            id="register-username"
            required
            minLength={3}
            maxLength={24}
            autoComplete="username"
            placeholder="Ex. fustel_gamer"
            value={auth.username}
            onChange={(event) => setAuth({ ...auth, username: event.target.value })}
          />
          {isValidUsername(auth.username) && <FieldIcon name="check" className="field-icon field-icon-right" />}
        </div>
        {auth.username && !isValidUsername(auth.username) && <span className="field-hint">3 à 24 caractères : lettres, chiffres, underscore.</span>}
      </label>

      <label htmlFor="register-email">
        Email
        <div className={`field ${auth.email ? (isValidEmail(auth.email) ? 'valid' : 'invalid') : ''}`}>
          <FieldIcon name="mail" />
          <input
            id="register-email"
            required
            type="email"
            placeholder="prenom@email.com"
            value={auth.email}
            onChange={(event) => setAuth({ ...auth, email: event.target.value })}
          />
          {auth.email && isValidEmail(auth.email) && <FieldIcon name="check" className="field-icon field-icon-right" />}
        </div>
      </label>

      <label htmlFor="register-phone">
        Téléphone
        <div className="phone-input-group">
          <PhoneCountryPicker
            value={selectedCountry}
            onChange={(country) => setAuth({ ...auth, country: country.name, countryCode: country.dialCode })}
          />
          <div className="field">
            <FieldIcon name="phone" />
            <input
              id="register-phone"
              required
              type="tel"
              placeholder="XX XXX XX XX"
              value={auth.phone}
              onChange={(event) => setAuth({ ...auth, phone: event.target.value })}
            />
          </div>
        </div>
        {!selectedCountry && <span className="field-hint" style={{ color: '#8c8797' }}>Choisissez votre pays pour l’indicatif téléphonique.</span>}
      </label>

      <label htmlFor="register-password">
        Mot de passe
        <div className="password-input-group">
          <div className={`field ${auth.password ? (auth.password.length >= 8 ? 'valid' : 'invalid') : ''}`}>
            <FieldIcon name="lock" />
            <input
              id="register-password"
              required
              type={showPassword ? 'text' : 'password'}
              minLength={8}
              autoComplete="new-password"
              placeholder="8 caractères minimum"
              value={auth.password}
              onChange={(event) => setAuth({ ...auth, password: event.target.value })}
            />
          </div>
          <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)}>
            {showPassword ? 'Masquer' : 'Afficher'}
          </button>
        </div>
        {auth.password && (
          <div className={`password-strength ${passwordStrength.level}`}>
            <div className="password-strength-bar"><i style={{ width: `${passwordStrength.percent}%` }} /></div>
            <small>{passwordStrength.label}</small>
          </div>
        )}
      </label>

      <label htmlFor="register-password-confirm">
        Confirmation du mot de passe
        <div className={`field ${auth.passwordConfirmation ? (passwordsMatch ? 'valid' : 'invalid') : ''}`}>
          <FieldIcon name="lock" />
          <input
            id="register-password-confirm"
            required
            type={showPassword ? 'text' : 'password'}
            minLength={8}
            autoComplete="new-password"
            placeholder="Retapez le mot de passe"
            value={auth.passwordConfirmation}
            onChange={(event) => setAuth({ ...auth, passwordConfirmation: event.target.value })}
          />
          {passwordsMatch && <FieldIcon name="check" className="field-icon field-icon-right" />}
        </div>
        {auth.passwordConfirmation && !passwordsMatch && <span className="field-hint">Les mots de passe ne correspondent pas.</span>}
      </label>

      {authError && (
        <p className="auth-error">
          <FieldIcon name="alert" />
          <span>{authError}</span>
        </p>
      )}

      {authNotice && (
        <p className="auth-notice">
          <FieldIcon name="check" />
          <span>{authNotice}</span>
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '18px' }}>
        <AnimatedCta onConfirm={() => registerAccount({ preventDefault() {} })} disabled={authLoading}>
          Créer mon compte
        </AnimatedCta>
      </div>

      {/* Bouton natif conservé, masqué visuellement, pour garder le formulaire soumissible au clavier (Entrée). */}
      <button type="submit" className="sr-only" disabled={authLoading} aria-hidden="true" tabIndex={-1}>
        Créer mon compte
      </button>
    </form>
  )
}
