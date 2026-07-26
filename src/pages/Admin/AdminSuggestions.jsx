// [ADMIN] [SUGGESTIONS] Liste des suggestions reçues (section 10 + 11).
export function AdminSuggestions({ suggestions }) {
  return (
    <div className="challenge-list">
      {suggestions.length ? suggestions.map((s) => (
        <div className="challenge-item" key={s.id} style={{ alignItems: 'flex-start' }}>
          <div>
            <b>{s.name}</b>
            <small>{s.email} • {new Date(s.createdAt || s.created_at).toLocaleString('fr-FR')} {s.emailed ? '• ✉️ envoyée' : '• ✉️ non envoyée'}</small>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#35354b' }}>{s.message}</p>
          </div>
        </div>
      )) : <p className="empty-players">Aucune suggestion pour le moment.</p>}
    </div>
  )
}
