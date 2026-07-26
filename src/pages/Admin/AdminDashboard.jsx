// [ADMIN] Tableau de bord : statistiques globales.
export function AdminDashboard({ metrics }) {
  return (
    <div className="admin-metrics" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
      <div><strong>{metrics.users ?? 0}</strong><span>Comptes</span></div>
      <div><strong>{metrics.sessions ?? 0}</strong><span>Sessions</span></div>
      <div><strong>{metrics.activeSessions ?? 0}</strong><span>En cours</span></div>
      <div><strong>{metrics.photos ?? 0}</strong><span>Photos Smash or Pass</span></div>
      <div><strong>{metrics.votes ?? 0}</strong><span>Votes</span></div>
      <div><strong>{metrics.bannedUsers ?? 0}</strong><span>Comptes bannis</span></div>
      <div><strong>{metrics.suggestions ?? 0}</strong><span>Suggestions reçues</span></div>
    </div>
  )
}
