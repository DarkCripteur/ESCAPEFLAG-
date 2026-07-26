// [ADMIN] Gestion utilisateurs : recherche, rôle, bannissement (section 10).
import { FieldIcon } from '../../components/ui/FieldIcon'

const ROLES = ['player', 'moderator', 'admin']

export function AdminUsers({ players, userQuery, setUserQuery, onSearch, currentUserId, isAdminRole, onToggleBan, onChangeRole }) {
  return (
    <div>
      <form
        className="challenge-form-row"
        style={{ marginBottom: '18px' }}
        onSubmit={(e) => { e.preventDefault(); onSearch() }}
      >
        <div className="field">
          <FieldIcon name="user" />
          <input
            type="text"
            placeholder="Rechercher par pseudo ou nom"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
          />
        </div>
        <button type="submit" className="secondary small">Rechercher</button>
      </form>

      <div className="admin-table">
        <div className="admin-row admin-head">
          <span>Joueur</span>
          <span>Statut</span>
          <span>Rôle</span>
          <span>Action</span>
        </div>
        {players.length ? players.map((player) => {
          const isSelf = player.id === currentUserId
          return (
            <div className="admin-row" key={player.id}>
              <span>{player.name} <small style={{ color: '#9b98a6' }}>@{player.username || '—'}</small></span>
              <span>{player.banned ? <b style={{ color: '#c54b4b' }}>Banni{player.bannedReason ? ` (${player.bannedReason})` : ''}</b> : 'Actif'}</span>
              <span>
                <select
                  value={player.role}
                  disabled={!isAdminRole || isSelf}
                  onChange={(e) => onChangeRole(player, e.target.value)}
                  style={{ width: 'auto', height: '32px' }}
                >
                  {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </span>
              <span>
                <button
                  type="button"
                  className="secondary small"
                  disabled={isSelf}
                  style={player.banned ? {} : { color: '#d3564f', borderColor: '#f4c6c6' }}
                  onClick={() => onToggleBan(player)}
                >
                  {player.banned ? 'Débannir' : 'Bannir'}
                </button>
              </span>
            </div>
          )
        }) : <p className="empty-players">Aucun utilisateur trouvé.</p>}
      </div>
    </div>
  )
}
