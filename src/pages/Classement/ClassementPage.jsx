// [CLASSEMENT] Réservé aux amis : il faut avoir ajouté au moins un ami pour voir un
// classement (demandé explicitement) — sinon incitation à se rendre sur /amis.
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useFriends } from '../../hooks/useFriends'
import { useQuizGame } from '../../hooks/useQuizGame'
import { colors } from '../../utils/quizData'

export function ClassementPage() {
  const { user, profile } = useAuth()
  const { friends } = useFriends()
  const { level } = useQuizGame()

  const hasFriends = friends.length > 0
  const selfEntry = user ? { id: user.id, name: user.name, avatar: user.avatar, country: user.country, xp: profile.xp, completed: profile.completed } : null
  const rankedPlayers = hasFriends && selfEntry
    ? [selfEntry, ...friends].sort((left, right) => (right.xp || 0) - (left.xp || 0))
    : []
  const userRank = rankedPlayers.findIndex((player) => player.id === user?.id) + 1 || rankedPlayers.length + 1

  return (
    <section className="detail-layout">
      <article className="detail-card">
        <div className="section-head">
          <div><span className="eyebrow">CLASSEMENT</span><h2>Classement entre amis</h2></div>
          <span className="pill">Réservé à vos amis</span>
        </div>
        {!hasFriends ? (
          <div className="goal-card accent" style={{ textAlign: 'center', padding: '30px 20px' }}>
            <h3>Ajoutez des amis pour débloquer le classement</h3>
            <p>Le classement n’affiche que vous et vos amis. Rendez-vous sur la page Amis pour envoyer une première invitation.</p>
            <Link className="primary small" to="/amis" style={{ display: 'inline-block', marginTop: '10px', textDecoration: 'none' }}>
              Ajouter un ami <span>→</span>
            </Link>
          </div>
        ) : (
          <div className="leaderboard-list">
            {rankedPlayers.map((player, index) => (
              <div className={`leaderboard-row ${player.id === user?.id ? 'is-self' : ''}`} key={player.id}>
                <span className="rank-pill">#{index + 1}</span>
                <div className="leaderboard-person">
                  <span className="avatar" style={{ background: colors[index % colors.length] }}>{player.avatar}</span>
                  <div><b>{player.id === user?.id ? `${player.name} (vous)` : player.name}</b><small>{player.country || 'Joueur connecté'}</small></div>
                </div>
                <div className="leaderboard-meta">
                  <strong>{player.xp || 0} XP</strong>
                  <span>{player.completed || 0} question{(player.completed || 0) !== 1 ? 's' : ''} réussies • Niveau {Math.max(1, Math.floor((player.xp || 0) / 900) + 1)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>
      <aside className="detail-card side-card">
        <div className="section-head"><div><span className="eyebrow">VOTRE PLACE</span><h2>Votre rang</h2></div></div>
        <div className="goal-card">
          <h3>{hasFriends ? `#${userRank || '—'}` : '—'}</h3>
          <p>{hasFriends ? `Vous êtes au rang ${userRank} parmi vous et vos amis.` : 'Ajoutez des amis pour apparaître dans un classement.'}</p>
        </div>
        <div className="goal-card accent">
          <h3>Niveau {level}</h3>
          <p>Le niveau augmente avec vos bonnes réponses et votre progression dans le quiz.</p>
        </div>
      </aside>
    </section>
  )
}
