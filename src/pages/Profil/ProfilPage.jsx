// Page joueur : profil personnel et progression.
import { useAuth } from '../../hooks/useAuth'
import { useQuizGame } from '../../hooks/useQuizGame'
import { badgeDefinitions } from '../../utils/badges'

export function ProfilPage() {
  const { user, profile, players } = useAuth()
  const { level, nextLevel, errors, hints, earnedBadgeIds } = useQuizGame()

  const rankedPlayers = [...players].sort((left, right) => (right.xp || 0) - (left.xp || 0))
  const userRank = rankedPlayers.findIndex((player) => player.id === user?.id) + 1 || rankedPlayers.length + 1

  return (
    <section className="detail-layout">
      <article className="detail-card">
        <div className="section-head">
          <div><span className="eyebrow">PROFIL</span><h2>Profil personnel</h2></div>
          <span className="pill">{user?.name || 'Joueur'}</span>
        </div>
        <div className="profile-hero">
          <div className="avatar large">{user?.avatar || 'U'}</div>
          <div>
            <h3>{user?.name || 'Nom à renseigner'}</h3>
            <p>{user?.country ? `${user.country} • ${user.countryCode || ''}` : 'Connexion en cours'}</p>
            <div className="profile-badges"><span>XP {profile.xp}</span><span>Niveau {level}</span><span>Série {profile.streak}</span></div>
          </div>
        </div>
        <div className="stats-grid">
          <div className="mini-stat"><strong>{profile.completed}</strong><span>Questions réussies</span></div>
          <div className="mini-stat"><strong>{profile.challenges}</strong><span>Défis lancés</span></div>
          <div className="mini-stat"><strong>{errors}</strong><span>Erreurs</span></div>
          <div className="mini-stat"><strong>{hints}</strong><span>Indices restants</span></div>
        </div>
        <div className="info-block">
          <h3>Profil professionnel</h3>
          <p>Ce tableau suit votre montée en niveau, vos performances et vos défis en cours.</p>
          <ul>
            <li>Objectif : atteindre le rang supérieur du classement.</li>
            <li>Compétence : répondre rapidement aux questions de culture générale.</li>
            <li>Statut : {profile.completed >= 6 ? 'Expert' : 'En apprentissage'}</li>
          </ul>
        </div>
        <div className="info-block">
          <h3>Badges ({earnedBadgeIds.length}/{badgeDefinitions.length})</h3>
          <div className="profile-badges" style={{ flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
            {badgeDefinitions.map((badge) => {
              const earned = earnedBadgeIds.includes(badge.id)
              return (
                <span
                  key={badge.id}
                  title={badge.description}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', opacity: earned ? 1 : 0.35, filter: earned ? 'none' : 'grayscale(1)' }}
                >
                  <badge.icon size={13} /> {badge.label}
                </span>
              )
            })}
          </div>
        </div>
      </article>
      <aside className="detail-card side-card">
        <div className="section-head"><div><span className="eyebrow">OBJECTIFS</span><h2>Prochain palier</h2></div></div>
        <div className="goal-card">
          <h3>{nextLevel} XP</h3>
          <p>Encore {Math.max(0, nextLevel - profile.xp)} XP avant le niveau suivant.</p>
          <div className="bar"><i style={{ width: `${Math.min(100, (profile.xp / nextLevel) * 100)}%` }} /></div>
        </div>
        <div className="goal-card accent">
          <h3>Rang actuel</h3>
          <p>{userRank > 0 ? `Vous êtes au rang #${userRank} sur ${rankedPlayers.length || 1} joueurs.` : 'Le classement se remplit au fur et à mesure des connexions.'}</p>
        </div>
      </aside>
    </section>
  )
}
