// [UNDERCOVER] Bannière app-wide pour les invitations à rejoindre un salon en ligne
// par pseudo (section 6) — affichée où que le joueur se trouve, pas seulement sur
// l'onglet Undercover, puisqu'une invitation peut arriver à tout moment.
import { useUndercover } from '../../hooks/useUndercover'

export function GameInviteBanner() {
  const { gameInvites, acceptGameInvite, declineGameInvite } = useUndercover()

  if (!gameInvites.length) return null

  return (
    <div style={{ maxWidth: 1170, margin: '0 auto', padding: '0 28px' }}>
      {gameInvites.map((invite) => (
        <div
          key={invite.id}
          className="goal-card accent"
          style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}
        >
          <span style={{ fontSize: '20px' }}>🎮</span>
          <p style={{ margin: 0, flex: 1 }}>
            <b>{invite.senderName}</b> vous invite à rejoindre le salon Undercover <b>{invite.roomId}</b>.
          </p>
          <button type="button" className="primary small" onClick={() => acceptGameInvite(invite)}>Rejoindre</button>
          <button type="button" className="secondary small" onClick={() => declineGameInvite(invite)}>Ignorer</button>
        </div>
      ))}
    </div>
  )
}
