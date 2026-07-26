// [ADMIN] Contenu de la console d'administration (onglets). L'accès (connecté +
// rôle admin/modérateur) est déjà vérifié par AdminLayout, qui monte ce composant.
import { useAuth } from '../../hooks/useAuth'
import { useAdminPanel } from '../../hooks/useAdminPanel'
import { AdminDashboard } from './AdminDashboard'
import { AdminUsers } from './AdminUsers'
import { AdminPhotos } from './AdminPhotos'
import { AdminComments } from './AdminComments'
import { AdminSuggestions } from './AdminSuggestions'

const TABS = [
  { id: 'dashboard', label: 'Tableau de bord' },
  { id: 'users', label: 'Utilisateurs' },
  { id: 'photos', label: 'Photos' },
  { id: 'comments', label: 'Commentaires' },
  { id: 'suggestions', label: 'Suggestions' },
]

export function AdminPage() {
  const { user } = useAuth()
  const panel = useAdminPanel()

  return (
    <section className="detail-layout">
      <article className="detail-card">
        <div className="section-head">
          <div><span className="eyebrow">ADMIN</span><h2>Console d’administration</h2></div>
          <span className="pill">Vue privée</span>
        </div>

        <div className="auth-switch" style={{ gridTemplateColumns: `repeat(${TABS.length}, 1fr)`, marginBottom: '20px' }}>
          {TABS.map((t) => (
            <button key={t.id} type="button" className={panel.tab === t.id ? 'selected' : ''} onClick={() => panel.setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {panel.loading && panel.tab === 'dashboard' ? (
          <p className="empty-players">Chargement…</p>
        ) : panel.tab === 'dashboard' ? (
          <AdminDashboard metrics={panel.metrics} />
        ) : panel.tab === 'users' ? (
          <AdminUsers
            players={panel.players}
            userQuery={panel.userQuery}
            setUserQuery={panel.setUserQuery}
            onSearch={panel.searchUsers}
            currentUserId={user.id}
            isAdminRole={user.role === 'admin'}
            onToggleBan={panel.toggleBan}
            onChangeRole={panel.changeRole}
          />
        ) : panel.tab === 'photos' ? (
          <AdminPhotos photos={panel.photos} onDelete={panel.removePhoto} />
        ) : panel.tab === 'comments' ? (
          <AdminComments comments={panel.comments} onDelete={panel.removeComment} />
        ) : (
          <AdminSuggestions suggestions={panel.suggestions} />
        )}
      </article>
    </section>
  )
}
