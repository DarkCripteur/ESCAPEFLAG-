// [FOOTER] Bandeau de progression, affiché sur toutes les vues (comportement d'origine).
import { useAuth } from '../../hooks/useAuth'
import { useQuizGame } from '../../hooks/useQuizGame'

export function Footer() {
  const { profile } = useAuth()
  const { level, nextLevel, errors, hints } = useQuizGame()

  return (
    <section className="bottom-strip">
      {/* TODO(section 19): texte du footer à personnaliser. */}
      <div>
        <span className="eyebrow">TA PROGRESSION</span>
        <b>Niveau {level} <em>{profile.completed >= 6 ? 'Explorateur expert' : 'Explorateur'}</em></b>
      </div>
      <div className="xp">
        <span>{profile.xp} / {nextLevel} XP</span>
        <div className="bar"><i style={{ width: `${Math.min(100, (profile.xp / nextLevel) * 100)}%` }} /></div>
      </div>
      <div className="stats">
        <span>◉ {errors} erreur{errors !== 1 ? 's' : ''}</span>
        <span>☼ {hints} indice</span>
        <span>⚡ Série x{profile.streak}</span>
      </div>
    </section>
  )
}
