// [QUIZ] Page principale : question en cours + classement en direct dans le panneau latéral.
import { Link } from 'react-router-dom'
import { Check, DoorOpen, Lightbulb, MoreHorizontal, Sparkle, Sparkles } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useQuizGame } from '../../hooks/useQuizGame'
import { colors, categories } from '../../utils/quizData'

export function JouerPage() {
  const { user, players } = useAuth()
  const {
    question, availableQuestions, current, selected, choose, finished, time, errors, hints, showHint, useHint, restart, progress,
    categoryFilter, setCategory,
  } = useQuizGame()

  return (
    <section className="content-grid" id="jouer">
      <article className="game-card">
        {!finished ? (
          <>
            <div className="room-line">
              <span>QUESTION {question + 1} SUR {availableQuestions.length}</span>
              <select
                className="difficulty"
                style={{ border: 'none', cursor: 'pointer' }}
                value={categoryFilter}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Filtrer par catégorie"
              >
                <option value="all">Toutes catégories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="question-intro">
              <span className="mini-star"><Sparkle size={18} /></span>
              <div><span className="eyebrow">QUIZ DE CULTURE GÉNÉRALE</span><h1>{current.prompt}</h1></div>
            </div>
            <div className="question-stage">
              {/* [QUIZ] La catégorie Culture générale utilise des classes Font Awesome
                  ("fa-solid fa-...", chargé via CDN dans index.html) ; les autres
                  catégories utilisent encore un emoji littéral — les deux formats
                  coexistent, distingués par ce préfixe plutôt que de tout convertir. */}
              <div className="question-icon">
                {current.icon?.startsWith('fa-') ? <i className={current.icon} /> : current.icon}
              </div>
              <div className="question-meta"><h3>{current.category}</h3><p>{current.explanation}</p></div>
            </div>
            <div className="answers">
              {current.options.map((choice, index) => (
                <button
                  key={choice}
                  onClick={() => choose(choice)}
                  className={`answer ${selected === choice ? (choice === current.answer ? 'correct' : 'wrong') : ''}`}
                >
                  <span>{String.fromCharCode(65 + index)}</span>{choice}
                  {selected === choice && choice === current.answer && <b><Check size={16} /></b>}
                </button>
              ))}
            </div>
            <div className="card-foot">
              <span>Choisis la bonne réponse pour monter de niveau.</span>
              <button onClick={useHint} disabled={!hints || showHint} className="hint">
                <Lightbulb size={16} /> {showHint ? current.explanation : `INDICE (${hints})`}
              </button>
            </div>
          </>
        ) : (
          <div className="escape-result">
            <div className="escape-stars"><Sparkles size={20} /></div>
            <div className="open-door" style={{ display: 'flex', justifyContent: 'center' }}><DoorOpen size={56} /></div>
            <span className="eyebrow">MISSION TERMINÉE</span>
            <h1>Vous êtes devenu·e un expert !</h1>
            <p>Temps final <b>{time}</b> · {errors} erreur{errors !== 1 ? 's' : ''}</p>
            <button className="primary" onClick={restart}>REJOUER <span>→</span></button>
          </div>
        )}
      </article>

      <aside className="side-panel">
        <div className="side-head">
          <div><span className="eyebrow">EN DIRECT</span><h2>Joueurs connectés <span>{players.length}</span></h2></div>
          <button className="more"><MoreHorizontal size={16} /></button>
        </div>
        <div className="you-row">
          <span className="rank">1</span>
          <span className="avatar">{user?.avatar}</span>
          <div><b>Vous</b><small>{question}/{availableQuestions.length} questions</small></div>
          <strong>{time}</strong>
        </div>
        <div className="mini-bar"><i style={{ width: `${Math.max(progress, 6)}%` }} /></div>
        <div className="player-list">
          {players.filter((player) => player.id !== user?.id).length ? (
            players.filter((player) => player.id !== user?.id).map((player, idx) => (
              <div className="player" key={player.id}>
                <span className="rank">{idx + 2}</span>
                <span className="avatar" style={{ background: colors[idx % colors.length] }}>{player.avatar}</span>
                <div><b>{player.name}</b><small>{player.country || 'Joueur actif'}</small></div>
                <strong>{player.xp || 0} XP</strong>
                <div className="player-progress"><i style={{ width: `${Math.min(100, (player.xp || 0) / 10)}%` }} /></div>
              </div>
            ))
          ) : (
            <p className="empty-players">Aucun autre joueur connecté pour le moment.</p>
          )}
        </div>
        <Link className="view-all" to="/classement">VOIR LE CLASSEMENT <span>→</span></Link>
        <div className="tips"><span><Sparkle size={16} /></span><p><b>Astuce du jour</b>Plus le niveau grimpe, plus les questions deviennent exigeantes.</p></div>
      </aside>
    </section>
  )
}
