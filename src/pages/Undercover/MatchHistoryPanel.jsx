// [UNDERCOVER] Historique des parties (section 6).
export function MatchHistoryPanel({ matches }) {
  return (
    <div>
      <div className="section-head"><div><span className="eyebrow">HISTORIQUE</span><h2>Parties récentes</h2></div></div>
      <div className="player-list" style={{ maxHeight: '220px', overflowY: 'auto' }}>
        {matches.length ? matches.map((match) => {
          const date = new Date(match.createdAt || match.created_at)
          return (
            <div className="player" key={match.id} style={{ height: 'auto', padding: '8px 0' }}>
              <span style={{ fontSize: '18px' }}>{match.mode === 'online' ? '🌐' : '🖥️'}</span>
              <div>
                <b>Victoire : {match.winner}</b>
                <small>{match.civilWord || match.civil_word} / {match.undercoverWord || match.undercover_word} • {date.toLocaleDateString('fr-FR')}</small>
              </div>
            </div>
          )
        }) : <p className="empty-players">Aucune partie enregistrée pour le moment.</p>}
      </div>
    </div>
  )
}
