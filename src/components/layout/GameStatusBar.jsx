// Bandeau "salle connectée" + cartes progression/score, affiché sur toutes les vues
// (comportement d'origine : ce n'est pas propre à la page Jouer).
import { useAuth } from '../../hooks/useAuth'
import { useQuizGame } from '../../hooks/useQuizGame'

export function GameStatusBar() {
  const { players, serverOnline, profile } = useAuth()
  const { question, progress, errors, availableQuestions } = useQuizGame()

  return (
    <>
      <section className="game-meta">
        <div className="room-title">
          <span className={serverOnline ? 'live-dot' : 'offline-dot'} /> {serverOnline ? 'SALLE CONNECTÉE' : 'SALLE HORS LIGNE'} <b>•</b> {players.length} JOUEUR{players.length !== 1 ? 'S' : ''}
        </div>
        <div className="puzzle-tag"><span>QUESTION {String(question + 1).padStart(2, '0')}</span> <b>•</b> CULTURE GÉNÉRALE</div>
      </section>

      <section className="dashboard">
        <div className="status-card progress-card">
          <span className="status-label">PROGRESSION</span>
          <div className="progress-figure"><strong>{progress}%</strong><span>{question}/{availableQuestions.length} questions</span></div>
          <div className="bar"><i style={{ width: `${progress}%` }} /></div>
        </div>
        <div className="status-card score-card">
          <span className="status-label">SCORE</span>
          <strong>{Math.max(0, 900 - errors * 45 + profile.streak * 10)}</strong>
          <small><span className="coin">✦</span> +250 XP par bonne réponse</small>
        </div>
      </section>
    </>
  )
}
