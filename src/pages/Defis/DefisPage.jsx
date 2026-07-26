// [DÉFIS] Envoi et réception d'invitations à défier un autre joueur.
import { FieldIcon } from '../../components/ui/FieldIcon'
import { useChallenges } from '../../hooks/useChallenges'
import { isValidEmail } from '../../utils/validators'

export function DefisPage() {
  const {
    challengeTarget, challengeDraft, setChallengeDraft, challengeInvites,
    sendChallengeInvite, receiveChallengeInvite, resolveInvite,
  } = useChallenges()

  return (
    <section className="detail-layout">
      <article className="detail-card">
        <div className="section-head">
          <div><span className="eyebrow">DÉFIS</span><h2>Envoyer et recevoir</h2></div>
          <span className="pill">Mail</span>
        </div>
        <form className="challenge-form" onSubmit={sendChallengeInvite}>
          <label htmlFor="challenge-email">Envoyer un défi par e-mail</label>
          <div className="challenge-form-row">
            <div className={`field ${challengeDraft ? (isValidEmail(challengeDraft) ? 'valid' : 'invalid') : ''}`}>
              <FieldIcon name="mail" />
              <input
                id="challenge-email"
                type="email"
                value={challengeDraft}
                onChange={(event) => setChallengeDraft(event.target.value)}
                placeholder="prenom@email.com"
              />
              {challengeDraft && isValidEmail(challengeDraft) && <FieldIcon name="check" className="field-icon field-icon-right" />}
            </div>
            <button type="submit" className="primary small" disabled={!challengeDraft.trim() || !isValidEmail(challengeDraft)}>Envoyer</button>
          </div>
          {challengeDraft && !isValidEmail(challengeDraft) && <span className="field-hint">Format d’e-mail invalide</span>}
        </form>
        <button type="button" className="secondary" onClick={receiveChallengeInvite}>Recevoir un défi</button>
        <div className="challenge-list">
          {challengeInvites.length ? (
            challengeInvites.map((invite) => (
              <div className="challenge-item" key={invite.id}>
                <div>
                  <b>{invite.type === 'sent' ? `Envoyé à ${invite.recipient}` : `${invite.sender} vous a défié`}</b>
                  <small>{invite.email || invite.recipient} • {invite.status} • {invite.createdAt}</small>
                </div>
                {invite.type === 'received' ? (
                  <div className="challenge-actions">
                    <button type="button" className="primary small" onClick={() => resolveInvite(invite.id, 'accept')}>Accepter</button>
                    <button type="button" className="secondary small" onClick={() => resolveInvite(invite.id, 'reject')}>Refuser</button>
                  </div>
                ) : (
                  <span className="pill subtle">{invite.status}</span>
                )}
              </div>
            ))
          ) : (
            <p className="empty-players">Aucun défi pour le moment.</p>
          )}
        </div>
      </article>
      <aside className="detail-card side-card">
        <div className="section-head"><div><span className="eyebrow">STATUT</span><h2>Défi courant</h2></div></div>
        <div className="goal-card accent">
          <h3>{challengeTarget ? `Défi ciblé : ${challengeTarget.name}` : 'Sélectionnez un joueur'}</h3>
          <p>Les invitations sont gérées depuis l’application avec un suivi simple de réception et d’envoi.</p>
        </div>
      </aside>
    </section>
  )
}
