// Cartes progression/score + info question en cours, affichées sur toutes les vues
// (comportement d'origine : ce n'est pas propre à la page Jouer). Le statut "salle
// connectée" vit désormais dans Header/.nav-pill (pastille fusionnée avec la nav).
import { useAuth } from '../../hooks/useAuth'
import { useQuizGame } from '../../hooks/useQuizGame'

export function GameStatusBar() {
  const { profile } = useAuth()
  const { question, progress, errors, availableQuestions } = useQuizGame()

  return (
    <>
      <section className="game-meta">
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
