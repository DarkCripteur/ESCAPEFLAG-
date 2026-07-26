// [AMIS] Recherche instantanée par pseudo, demandes reçues/envoyées, liste d'amis.
import { FieldIcon } from '../../components/ui/FieldIcon'
import { useFriends } from '../../hooks/useFriends'

export function AmisPage() {
  const {
    friends, sentRequests, receivedRequests,
    searchQuery, setSearchQuery, searchResults, searchLoading,
    sendRequest, respondToRequest, cancelRequest, removeFriend,
  } = useFriends()

  return (
    <section className="detail-layout">
      <article className="detail-card">
        <div className="section-head">
          <div><span className="eyebrow">AMIS</span><h2>Inviter un joueur par pseudo</h2></div>
          <span className="pill">Recherche instantanée</span>
        </div>

        <div className="challenge-form">
          <label htmlFor="friend-search">Rechercher un pseudo</label>
          <div className="field">
            <FieldIcon name="user" />
            <input
              id="friend-search"
              type="text"
              placeholder="Ex. fustel_gamer"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="player-list" style={{ marginBottom: '10px' }}>
          {searchLoading && <p className="empty-players">Recherche…</p>}
          {!searchLoading && searchQuery.trim() && !searchResults.length && (
            <p className="empty-players">Aucun joueur ne correspond à « {searchQuery.trim()} ».</p>
          )}
          {searchResults.map((player) => (
            <div className="player" key={player.id}>
              <span className="avatar">{player.avatar}</span>
              <div><b>{player.name}</b><small>@{player.username}</small></div>
              <button type="button" className="primary small" style={{ marginLeft: 'auto' }} onClick={() => sendRequest(player.username)}>
                Inviter
              </button>
            </div>
          ))}
        </div>

        <div className="section-head" style={{ marginTop: '20px' }}>
          <div><span className="eyebrow">REÇUES</span><h2>Demandes en attente ({receivedRequests.length})</h2></div>
        </div>
        <div className="challenge-list">
          {receivedRequests.length ? receivedRequests.map((request) => (
            <div className="challenge-item" key={request.id}>
              <div><b>{request.sender?.name || 'Joueur'}</b><small>@{request.sender?.username || '—'}</small></div>
              <div className="challenge-actions">
                <button type="button" className="primary small" onClick={() => respondToRequest(request.id, 'accept')}>Accepter</button>
                <button type="button" className="secondary small" onClick={() => respondToRequest(request.id, 'decline')}>Refuser</button>
              </div>
            </div>
          )) : <p className="empty-players">Aucune demande reçue pour le moment.</p>}
        </div>

        <div className="section-head" style={{ marginTop: '20px' }}>
          <div><span className="eyebrow">ENVOYÉES</span><h2>En attente de réponse ({sentRequests.length})</h2></div>
        </div>
        <div className="challenge-list">
          {sentRequests.length ? sentRequests.map((request) => (
            <div className="challenge-item" key={request.id}>
              <div><b>{request.receiver?.name || 'Joueur'}</b><small>@{request.receiver?.username || '—'}</small></div>
              <button type="button" className="secondary small" onClick={() => cancelRequest(request.id)}>Annuler</button>
            </div>
          )) : <p className="empty-players">Aucune invitation envoyée pour le moment.</p>}
        </div>
      </article>

      <aside className="detail-card side-card">
        <div className="section-head"><div><span className="eyebrow">MES AMIS</span><h2>Liste d’amis ({friends.length})</h2></div></div>
        <div className="player-list">
          {friends.length ? friends.map((friend) => (
            <div className="player" key={friend.id}>
              <span className="avatar">{friend.avatar}</span>
              <div><b>{friend.name}</b><small>@{friend.username}</small></div>
              <button type="button" className="secondary small" style={{ marginLeft: 'auto', color: '#d3564f', borderColor: '#f4c6c6' }} onClick={() => removeFriend(friend.friendshipId)}>
                Retirer
              </button>
            </div>
          )) : <p className="empty-players">Vous n’avez pas encore d’amis. Recherchez un pseudo pour l’inviter !</p>}
        </div>
      </aside>
    </section>
  )
}
