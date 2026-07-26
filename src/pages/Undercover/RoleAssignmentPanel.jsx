// [UNDERCOVER] Attribution automatique ou manuelle des rôles (section 6).
const ROLE_LABELS = { civil: 'Civil', undercover: 'Undercover', mrwhite: 'M. White' }

export function RoleAssignmentPanel({
  players, assignMode, onAssignModeChange,
  undercoversCount, onUndercoversCountChange, whitesCount, onWhitesCountChange,
  manualRoles, onManualRoleChange,
}) {
  return (
    <div className="mb-2">
      <div className="auth-switch" style={{ marginBottom: '12px' }}>
        <button type="button" className={assignMode === 'auto' ? 'selected' : ''} onClick={() => onAssignModeChange('auto')}>🎲 Automatique</button>
        <button type="button" className={assignMode === 'manual' ? 'selected' : ''} onClick={() => onAssignModeChange('manual')}>✋ Manuelle</button>
      </div>

      {assignMode === 'auto' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <label>
            Nombre d'Undercovers
            <select value={undercoversCount} onChange={(e) => onUndercoversCountChange(Number(e.target.value))}>
              <option value="1">1 Undercover</option>
              <option value="2">2 Undercovers</option>
            </select>
          </label>
          <label>
            Nombre de M. White (sans mot)
            <select value={whitesCount} onChange={(e) => onWhitesCountChange(Number(e.target.value))}>
              <option value="0">0 M. White</option>
              <option value="1">1 M. White</option>
            </select>
          </label>
        </div>
      ) : (
        <div className="player-list" style={{ maxHeight: '220px', overflowY: 'auto' }}>
          {players.map((player) => (
            <div className="player" key={player.id}>
              <div><b>{player.name}</b></div>
              <select
                style={{ marginLeft: 'auto', width: 'auto', height: '34px' }}
                value={manualRoles[player.id] || ''}
                onChange={(e) => onManualRoleChange(player.id, e.target.value)}
              >
                <option value="">-- Rôle --</option>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
