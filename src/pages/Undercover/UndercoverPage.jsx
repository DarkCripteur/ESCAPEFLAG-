// [UNDERCOVER] Jeu de déduction : mode local (pass-the-device) et mode en ligne
// (salons partagés par code, polling toutes les 1.5s).
import { CircleCheck, CircleDot, CircleX, Copy, Crown, Globe, Monitor, Skull, VenetianMask } from 'lucide-react'
import { useUndercover } from '../../hooks/useUndercover'
import { useToast } from '../../hooks/useToast'
import { useFriends } from '../../hooks/useFriends'
import { colors } from '../../utils/quizData'
import { pickRandomPairFromTheme } from '../../utils/undercoverThemes'
import { ThemePicker } from './ThemePicker'
import { RoleAssignmentPanel } from './RoleAssignmentPanel'
import { MatchHistoryPanel } from './MatchHistoryPanel'

export function UndercoverPage() {
  const { notify } = useToast()
  const { friends } = useFriends()
  const uc = useUndercover()
  const {
    ucPlayers, ucNewPlayerName, setUcNewPlayerName, ucState, setUcState,
    ucRevealIndex, setUcRevealIndex, ucShowWord, setUcShowWord,
    ucUndercoversCount, setUcUndercoversCount, ucWhitesCount, setUcWhitesCount,
    ucSelectedPair, ucWinner, ucRound,
    ucThemeId, setUcThemeId, ucAssignMode, setUcAssignMode, ucManualRoles, setManualRole, setUcManualRoles,
    ucMode, setUcMode, ucRoomId, ucRoom, ucJoinIdInput, setUcJoinIdInput,
    ucClueInput, setUcClueInput, ucChatInput, setUcChatInput,
    customWordPairs, setCustomWordPairs, newCivilWord, setNewCivilWord, newUndercoverWord, setNewUndercoverWord,
    matchHistory, inviteFriendToRoom,
    getLocalPlayerId, createOnlineRoom, joinOnlineRoom, leaveOnlineRoom,
    chooseOnlineDistributor, setOnlineWords, submitOnlineClue, submitOnlineVote,
    sendOnlineChatMessage, resetOnlineRoom, addUcPlayer, removeUcPlayer,
    startUndercover, eliminateUcPlayer,
  } = uc

  return (
    <section className="detail-layout" id="undercover">
      <article className="detail-card">
        <div className="section-head">
          <div>
            <span className="eyebrow">UNDERCOVER • JEU MULTIJOUEUR</span>
            <h2>Jeu de déduction et d’espionnage</h2>
          </div>
          <span className="pill">{ucMode === 'local' ? 'Local / Un seul appareil' : `En Ligne / Salon ${ucRoomId}`}</span>
        </div>

        <div className="auth-switch" style={{ marginBottom: '20px' }}>
          <button type="button" className={ucMode === 'local' ? 'selected' : ''} onClick={() => { leaveOnlineRoom(); setUcMode('local') }} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Monitor size={14} /> Mode Local</button>
          <button type="button" className={ucMode === 'online' ? 'selected' : ''} onClick={() => setUcMode('online')} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Globe size={14} /> Mode En Ligne</button>
        </div>

        {/* --- MODE EN LIGNE (ONLINE) --- */}
        {ucMode === 'online' && !ucRoomId && (
          <div className="challenge-form">
            <h3>Rejoindre ou créer un salon de jeu en ligne</h3>
            <p style={{ color: '#767890', fontSize: '13px', marginBottom: '20px' }}>
              Jouez en ligne avec vos amis sur plusieurs appareils en temps réel.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', marginBottom: '20px' }}>
              <button type="button" onClick={createOnlineRoom} className="primary" style={{ height: '48px' }}>
                Créer un nouveau salon en ligne
              </button>
            </div>

            <div style={{ borderTop: '1px solid #efeadd', paddingTop: '20px', marginTop: '10px' }}>
              <h3>Rejoindre avec un code de salon</h3>
              <div className="challenge-form-row">
                <input
                  type="text"
                  placeholder="Code du salon (ex: AB3D9E)"
                  value={ucJoinIdInput}
                  onChange={(e) => setUcJoinIdInput(e.target.value.toUpperCase())}
                />
                <button type="button" onClick={() => joinOnlineRoom()} className="secondary" disabled={!ucJoinIdInput.trim()}>
                  Rejoindre
                </button>
              </div>
            </div>
          </div>
        )}

        {ucMode === 'online' && ucRoomId && ucRoom && (
          <div>
            {/* 1. SETUP / LOBBY PHASE */}
            {ucRoom.state === 'setup' && (
              <div className="challenge-form">
                <div className="goal-card accent" style={{ marginBottom: '20px' }}>
                  <span className="eyebrow">CODE D'INVITATION</span>
                  <h2
                    style={{ fontSize: '28px', margin: '5px 0', color: '#7253db', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    onClick={() => { navigator.clipboard.writeText(ucRoomId); notify('Code copié !') }}
                  >
                    {ucRoomId} <Copy size={22} />
                  </h2>
                  <p style={{ fontSize: '11px', color: '#a68c68' }}>Cliquez sur le code pour le copier et le partager avec vos amis.</p>
                </div>

                <h3>Joueurs présents ({ucRoom.players.length})</h3>
                <div className="player-list" style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '20px' }}>
                  {ucRoom.players.map((player, idx) => (
                    <div key={player.id} className="player">
                      <span className="rank">{idx + 1}</span>
                      <span className="avatar" style={{ background: colors[idx % colors.length] }}>{player.name.slice(0, 1).toUpperCase()}</span>
                      <div>
                        <b>{player.name}</b>
                        {player.isHost && <small style={{ color: '#ab843e', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Crown size={11} /> Hôte</small>}
                      </div>
                      {ucRoom.distributorId === player.id && (
                        <span className="pill" style={{ marginLeft: 'auto', background: '#eaf6ee', color: '#2f6b45' }}>Distributeur</span>
                      )}
                    </div>
                  ))}
                </div>

                {ucRoom.hostId === getLocalPlayerId() ? (
                  <div style={{ borderTop: '1px solid #efeadd', paddingTop: '15px' }}>
                    <h3>Paramètres de la partie (Hôte)</h3>
                    <label style={{ display: 'block', marginBottom: '15px' }}>
                      Distributeur des mots
                      <select value={ucRoom.distributorId || ''} onChange={(e) => chooseOnlineDistributor(e.target.value)}>
                        <option value="">-- Choisir un joueur --</option>
                        {ucRoom.players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </label>

                    <button
                      type="button"
                      className="primary"
                      style={{ width: '100%' }}
                      disabled={!ucRoom.distributorId}
                      onClick={() => setOnlineWords('?', '?', ucUndercoversCount, ucWhitesCount)}
                    >
                      Lancer la distribution <span>→</span>
                    </button>

                    {friends.length > 0 && (
                      <div style={{ borderTop: '1px solid #efeadd', marginTop: '18px', paddingTop: '15px' }}>
                        <h3>Inviter des amis par pseudo</h3>
                        <div className="player-list" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                          {friends.map((friend) => (
                            <div className="player" key={friend.id}>
                              <span className="avatar">{friend.avatar}</span>
                              <div><b>{friend.name}</b><small>@{friend.username}</small></div>
                              <button type="button" className="secondary small" style={{ marginLeft: 'auto' }} onClick={() => inviteFriendToRoom(friend.id)}>
                                Inviter
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="goal-card" style={{ background: '#f8f5ee', textAlign: 'center' }}>
                    <p style={{ margin: 0, color: '#767890' }}>En attente que l'hôte lance la partie et désigne le distributeur des mots...</p>
                  </div>
                )}
              </div>
            )}

            {/* 2. DISTRIBUTOR PANEL */}
            {ucRoom.state === 'reveal' && ucRoom.distributorId === getLocalPlayerId() && (ucRoom.civilWord === '?' || !ucRoom.civilWord) && (
              <div className="challenge-form">
                <h3>Panneau du Distributeur</h3>
                <p style={{ color: '#767890', fontSize: '13px', marginBottom: '15px' }}>
                  Vous êtes le distributeur désigné ! Choisissez un thème (ou saisissez vos propres mots) et les rôles.
                </p>

                <ThemePicker
                  themeId={ucThemeId}
                  onThemeChange={setUcThemeId}
                  customCount={customWordPairs.length}
                  onPickPair={(themeId) => {
                    const pair = themeId === 'custom'
                      ? customWordPairs[Math.floor(Math.random() * customWordPairs.length)]
                      : pickRandomPairFromTheme(themeId)
                    if (pair) {
                      setNewCivilWord(pair.civil)
                      setNewUndercoverWord(pair.undercover)
                    }
                  }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '15px 0' }}>
                  <label>
                    Mot des Civils
                    <input type="text" placeholder="Ex: Banane" value={newCivilWord} onChange={(e) => setNewCivilWord(e.target.value)} />
                  </label>
                  <label>
                    Mot des Undercovers
                    <input type="text" placeholder="Ex: Mangue" value={newUndercoverWord} onChange={(e) => setNewUndercoverWord(e.target.value)} />
                  </label>
                </div>

                <RoleAssignmentPanel
                  players={ucRoom.players.filter((p) => !p.isEliminated)}
                  assignMode={ucAssignMode}
                  onAssignModeChange={setUcAssignMode}
                  undercoversCount={ucUndercoversCount}
                  onUndercoversCountChange={setUcUndercoversCount}
                  whitesCount={ucWhitesCount}
                  onWhitesCountChange={setUcWhitesCount}
                  manualRoles={ucManualRoles}
                  onManualRoleChange={setManualRole}
                />

                <button
                  type="button"
                  className="primary"
                  style={{ width: '100%', margin: '20px 0' }}
                  disabled={!newCivilWord.trim() || !newUndercoverWord.trim()}
                  onClick={() => {
                    const activeIds = ucRoom.players.filter((p) => !p.isEliminated).map((p) => p.id)
                    const assignments = ucAssignMode === 'manual'
                      ? Object.fromEntries(activeIds.map((id) => [id, ucManualRoles[id]]).filter(([, role]) => role))
                      : undefined
                    if (ucAssignMode === 'manual' && Object.keys(assignments).length !== activeIds.length) {
                      notify('Attribuez un rôle à chaque joueur avant de distribuer.')
                      return
                    }
                    setOnlineWords(newCivilWord.trim(), newUndercoverWord.trim(), ucUndercoversCount, ucWhitesCount, assignments)
                    setNewCivilWord('')
                    setNewUndercoverWord('')
                    setUcManualRoles({})
                  }}
                >
                  Distribuer les mots secrets <span>→</span>
                </button>
              </div>
            )}

            {/* 3. REVEAL & CLUE SUBMIT PHASE */}
            {ucRoom.state === 'reveal' && (ucRoom.distributorId !== getLocalPlayerId() || (ucRoom.civilWord !== '?' && ucRoom.civilWord)) && (
              <div style={{ textAlign: 'center', padding: '15px 0' }}>
                <span className="eyebrow">PHASE D'INDICE & RÉVÉLATION</span>

                <div className="goal-card accent" style={{ margin: '20px auto', maxWidth: '380px', textAlign: 'center' }}>
                  <span className="eyebrow">VOTRE MOT SECRET</span>
                  <h2 style={{ fontSize: '28px', margin: '10px 0', color: '#ab843e' }}>
                    {ucRoom.players.find((p) => p.id === getLocalPlayerId())?.role === 'mrwhite' ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><VenetianMask size={24} /> Vous êtes M. White !</span> : ucRoom.players.find((p) => p.id === getLocalPlayerId())?.word}
                  </h2>
                  {ucRoom.players.find((p) => p.id === getLocalPlayerId())?.role === 'mrwhite' ? (
                    <p style={{ fontSize: '11px', color: '#a68c68' }}>Vous n'avez pas de mot secret. Écoutez attentivement les autres pour deviner le mot des Civils.</p>
                  ) : (
                    <p style={{ fontSize: '11px', color: '#a68c68' }}>Décrivez ce mot avec un seul indice sans le prononcer directement.</p>
                  )}
                </div>

                {!ucRoom.clues[getLocalPlayerId()] ? (
                  <div className="challenge-form" style={{ maxWidth: '380px', margin: '0 auto' }}>
                    <input type="text" placeholder="Entrez votre indice (un seul mot)" value={ucClueInput} onChange={(e) => setUcClueInput(e.target.value)} />
                    <button type="button" onClick={submitOnlineClue} className="primary" style={{ width: '100%', marginTop: '10px' }} disabled={!ucClueInput.trim()}>
                      Soumettre mon indice
                    </button>
                  </div>
                ) : (
                  <div className="goal-card" style={{ background: '#eaf6ee', color: '#2f6b45', maxWidth: '380px', margin: '0 auto' }}>
                    <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}><CircleCheck size={14} /> Votre indice a été soumis : <strong>{ucRoom.clues[getLocalPlayerId()]}</strong></p>
                  </div>
                )}

                <h3 style={{ marginTop: '30px' }}>Indicateur de soumission ({Object.keys(ucRoom.clues).length} / {ucRoom.players.filter((p) => !p.isEliminated).length})</h3>
                <div className="player-list">
                  {ucRoom.players.map((p, idx) => (
                    <div key={p.id} className="player" style={{ opacity: p.isEliminated ? 0.4 : 1 }}>
                      <span className="avatar" style={{ background: colors[idx % colors.length] }}>{p.name.slice(0, 1).toUpperCase()}</span>
                      <div>
                        <b>{p.name}</b>
                        <small style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>{p.isEliminated ? 'Éliminé' : ucRoom.clues[p.id] ? <><CircleCheck size={11} /> Indice soumis</> : 'En attente...'}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. DESCRIBE / PLAY PHASE */}
            {ucRoom.state === 'describe' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <span className="eyebrow">MANCHE {ucRoom.round}</span>
                  <h2>Nouvelle Phase de Description</h2>
                  <p style={{ color: '#767890', fontSize: '13px' }}>Entrez un nouvel indice pour orienter le débat.</p>
                </div>

                {!ucRoom.clues[getLocalPlayerId()] && !ucRoom.players.find((p) => p.id === getLocalPlayerId())?.isEliminated ? (
                  <div className="challenge-form" style={{ maxWidth: '380px', margin: '0 auto 20px' }}>
                    <input type="text" placeholder="Entrez votre nouvel indice" value={ucClueInput} onChange={(e) => setUcClueInput(e.target.value)} />
                    <button type="button" onClick={submitOnlineClue} className="primary" style={{ width: '100%', marginTop: '10px' }} disabled={!ucClueInput.trim()}>
                      Soumettre mon indice
                    </button>
                  </div>
                ) : (
                  <div className="goal-card" style={{ background: '#eaf6ee', color: '#2f6b45', maxWidth: '380px', margin: '0 auto 20px' }}>
                    <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}><CircleCheck size={14} /> Indice soumis. En attente des autres joueurs...</p>
                  </div>
                )}

                <div className="player-list">
                  {ucRoom.players.map((p, idx) => (
                    <div key={p.id} className="player" style={{ opacity: p.isEliminated ? 0.4 : 1 }}>
                      <span className="avatar" style={{ background: colors[idx % colors.length] }}>{p.name.slice(0, 1).toUpperCase()}</span>
                      <div>
                        <b>{p.name}</b>
                        <small>{p.isEliminated ? 'Éliminé' : ucRoom.clues[p.id] ? `Indice : ${ucRoom.clues[p.id]}` : 'Réflechit...'}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. VOTE PHASE */}
            {ucRoom.state === 'vote' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <span className="eyebrow">MANCHE {ucRoom.round} • ÉLIMINATION</span>
                  <h2>Débat & Votes</h2>
                  <p style={{ color: '#767890', fontSize: '13px' }}>Discutez dans le chat du salon et votez contre le joueur suspect.</p>
                </div>

                {!ucRoom.votes[getLocalPlayerId()] && !ucRoom.players.find((p) => p.id === getLocalPlayerId())?.isEliminated ? (
                  <div className="player-list">
                    {ucRoom.players.filter((p) => !p.isEliminated && p.id !== getLocalPlayerId()).map((p, idx) => (
                      <div key={p.id} className="player">
                        <span className="avatar" style={{ background: colors[idx % colors.length] }}>{p.name.slice(0, 1).toUpperCase()}</span>
                        <div>
                          <b>{p.name}</b>
                          <small>Indice: {ucRoom.clues[p.id] || '—'}</small>
                        </div>
                        <button type="button" onClick={() => submitOnlineVote(p.id)} className="secondary small" style={{ marginLeft: 'auto', borderColor: '#f4c6c6', color: '#c54b4b' }}>
                          Voter contre
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="goal-card" style={{ background: '#eaf6ee', color: '#2f6b45', textAlign: 'center', marginBottom: '20px' }}>
                    <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}><CircleCheck size={14} /> Votre vote a été enregistré. En attente des autres votes ({Object.keys(ucRoom.votes).length} / {ucRoom.players.filter((p) => !p.isEliminated).length}).</p>
                  </div>
                )}
              </div>
            )}

            {/* 6. RESULT PHASE */}
            {ucRoom.state === 'result' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div className="escape-stars" style={{ display: 'flex', justifyContent: 'center' }}><Crown size={32} /></div>
                <span className="eyebrow">FIN DE PARTIE</span>
                <h1 style={{ fontSize: '28px', margin: '10px 0' }}>Victoire des {ucRoom.winner} !</h1>

                <div className="goal-card accent" style={{ margin: '20px auto', maxWidth: '420px', textAlign: 'left' }}>
                  <h3>Révélation des mots de la partie :</h3>
                  <p>Civils : <strong>{ucRoom.civilWord}</strong></p>
                  <p>Undercovers : <strong>{ucRoom.undercoverWord}</strong></p>

                  <div style={{ marginTop: '15px', borderTop: '1px solid #efeadd', paddingTop: '10px' }}>
                    {ucRoom.players.map((p) => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', margin: '5px 0' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>{p.name} {p.isEliminated && <Skull size={13} />}</span>
                        <strong style={{ textTransform: 'capitalize' }}>{p.role === 'civil' ? 'Civil' : p.role === 'undercover' ? 'Undercover' : 'M. White'}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {ucRoom.hostId === getLocalPlayerId() ? (
                  <button type="button" onClick={resetOnlineRoom} className="primary" style={{ width: '100%' }}>
                    Relancer une manche <span>→</span>
                  </button>
                ) : (
                  <div className="goal-card" style={{ background: '#f8f5ee' }}>
                    <p style={{ margin: 0, color: '#767890' }}>En attente que l'hôte relance une nouvelle manche...</p>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderTop: '1px solid #efeadd', paddingTop: '15px' }}>
              <button type="button" onClick={leaveOnlineRoom} className="secondary small" style={{ marginLeft: 'auto' }}>
                Quitter le Salon
              </button>
            </div>
          </div>
        )}

        {/* --- MODE LOCAL --- */}
        {ucMode === 'local' && (
          <div>
            {ucState === 'setup' && (
              <div className="challenge-form">
                <h3>1. Configurer les joueurs</h3>
                <form onSubmit={addUcPlayer} className="challenge-form-row" style={{ marginBottom: '15px' }}>
                  <input required type="text" placeholder="Nom du joueur (ex. Fustel)" value={ucNewPlayerName} onChange={(e) => setUcNewPlayerName(e.target.value)} />
                  <button type="submit" className="primary small">Ajouter</button>
                </form>

                <div className="player-list" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '20px' }}>
                  {ucPlayers.map((player, idx) => (
                    <div key={player.id} className="player">
                      <span className="rank">{idx + 1}</span>
                      <span className="avatar" style={{ background: colors[idx % colors.length] }}>{player.name.slice(0, 1).toUpperCase()}</span>
                      <div><b>{player.name}</b></div>
                      <button type="button" onClick={() => removeUcPlayer(player.id)} className="secondary small" style={{ marginLeft: 'auto', color: '#d3564f', borderColor: '#f4c6c6' }}>
                        Retirer
                      </button>
                    </div>
                  ))}
                </div>

                <h3>2. Choisir un thème</h3>
                <ThemePicker themeId={ucThemeId} onThemeChange={setUcThemeId} customCount={customWordPairs.length} />

                <h3 style={{ marginTop: '20px' }}>3. Attribution des rôles</h3>
                <RoleAssignmentPanel
                  players={ucPlayers}
                  assignMode={ucAssignMode}
                  onAssignModeChange={setUcAssignMode}
                  undercoversCount={ucUndercoversCount}
                  onUndercoversCountChange={setUcUndercoversCount}
                  whitesCount={ucWhitesCount}
                  onWhitesCountChange={setUcWhitesCount}
                  manualRoles={ucManualRoles}
                  onManualRoleChange={setManualRole}
                />

                <button type="button" onClick={startUndercover} className="primary" style={{ width: '100%', marginTop: '20px' }}>
                  Distribuer les rôles et démarrer <span>→</span>
                </button>
              </div>
            )}

            {ucState === 'reveal' && (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <span className="eyebrow">ÉTAPE 2 : RÉVÉLATION SECRÈTE</span>
                <h3 style={{ fontSize: '22px', margin: '15px 0' }}>C'est au tour de : <strong style={{ color: '#7253db' }}>{ucPlayers[ucRevealIndex]?.name}</strong></h3>
                <p style={{ color: '#767890', marginBottom: '25px' }}>Passez l'appareil à {ucPlayers[ucRevealIndex]?.name}. Les autres joueurs ne doivent pas regarder l'écran.</p>

                {!ucShowWord ? (
                  <button type="button" onClick={() => setUcShowWord(true)} className="primary">
                    Afficher mon mot secret
                  </button>
                ) : (
                  <div className="goal-card accent" style={{ margin: '20px auto', maxWidth: '340px' }}>
                    <span className="eyebrow">VOTRE MOT SECRET</span>
                    <h2 style={{ fontSize: '28px', margin: '10px 0', color: '#ab843e' }}>
                      {ucPlayers[ucRevealIndex]?.role === 'mrwhite' ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}><VenetianMask size={24} /> Vous êtes M. White !</span> : ucPlayers[ucRevealIndex]?.word}
                    </h2>
                    {ucPlayers[ucRevealIndex]?.role === 'mrwhite' ? (
                      <p style={{ fontSize: '12px', color: '#a68c68' }}>Vous n'avez pas de mot. Votre but est de deviner le mot des Civils sans vous faire démasquer.</p>
                    ) : (
                      <p style={{ fontSize: '12px', color: '#a68c68' }}>Décrivez ce mot lors de votre tour sans le prononcer directement !</p>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setUcShowWord(false)
                        if (ucRevealIndex < ucPlayers.length - 1) setUcRevealIndex(ucRevealIndex + 1)
                        else setUcState('describe')
                      }}
                      className="primary small"
                      style={{ marginTop: '15px' }}
                    >
                      J'ai compris, masquer et continuer <span>→</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {ucState === 'describe' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                  <span className="eyebrow">MANCHE {ucRound}</span>
                  <h2>Phase de Description</h2>
                  <p style={{ color: '#767890', fontSize: '13px' }}>
                    Chaque joueur doit donner à tour de rôle **un seul mot** décrivant son mot secret.
                    <br />M. White doit essayer de s'adapter et d'inventer un mot cohérent pour se fondre dans la masse.
                  </p>
                </div>

                <div className="player-list" style={{ marginBottom: '25px' }}>
                  {ucPlayers.map((player, idx) => (
                    <div key={player.id} className="player" style={{ opacity: player.isEliminated ? 0.4 : 1 }}>
                      <span className="avatar" style={{ background: colors[idx % colors.length] }}>{player.name.slice(0, 1).toUpperCase()}</span>
                      <div>
                        <b>{player.name}</b>
                        <small style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>{player.isEliminated ? <><CircleX size={11} /> Éliminé</> : <><CircleDot size={11} color="#3b8a5c" /> En jeu</>}</small>
                      </div>
                      {!player.isEliminated && <span className="pill subtle" style={{ marginLeft: 'auto' }}>Doit parler</span>}
                    </div>
                  ))}
                </div>

                <button type="button" onClick={() => setUcState('vote')} className="primary" style={{ width: '100%' }}>
                  Passer au vote d'élimination <span>→</span>
                </button>
              </div>
            )}

            {ucState === 'vote' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                  <span className="eyebrow">VOTE ET ÉLIMINATION</span>
                  <h2>Qui est l’intrus ?</h2>
                  <p style={{ color: '#767890', fontSize: '13px' }}>Débattez ensemble pour démasquer l'Undercover ou M. White. Votez pour éliminer un joueur.</p>
                </div>

                <div className="player-list">
                  {ucPlayers.filter((p) => !p.isEliminated).map((player, idx) => (
                    <div key={player.id} className="player">
                      <span className="avatar" style={{ background: colors[idx % colors.length] }}>{player.name.slice(0, 1).toUpperCase()}</span>
                      <div><b>{player.name}</b></div>
                      <button type="button" onClick={() => eliminateUcPlayer(player.id)} className="secondary small" style={{ marginLeft: 'auto', color: '#c54b4b', borderColor: '#f4c6c6' }}>
                        Voter contre / Éliminer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ucState === 'result' && (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div className="escape-stars" style={{ display: 'flex', justifyContent: 'center' }}><Crown size={32} /></div>
                <span className="eyebrow" style={{ letterSpacing: '2px' }}>FIN DE PARTIE</span>
                <h1 style={{ fontSize: '28px', margin: '15px 0' }}>Victoire des {ucWinner} !</h1>

                <div className="goal-card accent" style={{ margin: '20px auto', maxWidth: '400px', textAlign: 'left' }}>
                  <h3>Révélation des mots de la partie :</h3>
                  <p>Civils : <strong>{ucSelectedPair.civil}</strong></p>
                  <p>Undercovers : <strong>{ucSelectedPair.undercover}</strong></p>

                  <div style={{ marginTop: '15px', borderTop: '1px solid #efeadd', paddingTop: '10px' }}>
                    {ucPlayers.map((player) => (
                      <div key={player.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', margin: '5px 0' }}>
                        <span>{player.name}</span>
                        <strong style={{ textTransform: 'capitalize' }}>{player.role === 'civil' ? 'Civil' : player.role === 'undercover' ? 'Undercover' : 'M. White'}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="button" onClick={() => setUcState('setup')} className="primary">
                  Rejouer une partie <span>→</span>
                </button>
              </div>
            )}
          </div>
        )}
      </article>

      <aside className="detail-card side-card">
        {/* ONLINE LIVE CHAT */}
        {ucMode === 'online' && ucRoomId && ucRoom && (
          <div style={{ marginBottom: '25px', borderBottom: '1px solid #efeadd', paddingBottom: '20px' }}>
            <div className="section-head"><div><span className="eyebrow">DISCUSSIONS</span><h2>Chat du Salon</h2></div></div>
            <div style={{ height: '180px', overflowY: 'auto', background: '#fbf8f3', border: '1px solid #ece7dd', borderRadius: '8px', padding: '10px', marginBottom: '10px' }}>
              {ucRoom.chat.length ? (
                ucRoom.chat.map((msg, idx) => (
                  <div key={idx} style={{ marginBottom: '8px', fontSize: '12px' }}>
                    <span style={{ color: '#7253db', fontWeight: '700' }}>{msg.sender}</span> <small style={{ color: '#9b98a6' }}>{msg.timestamp}</small>
                    <p style={{ margin: '2px 0 0 0', color: '#35354b' }}>{msg.message}</p>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '11px', color: '#9997a6', textAlign: 'center', marginTop: '60px' }}>Aucun message. Dites bonjour !</p>
              )}
            </div>
            <form onSubmit={sendOnlineChatMessage} style={{ display: 'flex', gap: '5px' }}>
              <input type="text" placeholder="Tapez un message..." value={ucChatInput} onChange={(e) => setUcChatInput(e.target.value)} style={{ flex: 1, height: '36px' }} />
              <button type="submit" className="primary small" style={{ height: '36px' }}>Envoyer</button>
            </form>
          </div>
        )}

        {/* PAIRES PERSONNALISÉES (thème "Personnalisé" du sélecteur de thème) */}
        <div style={{ marginBottom: '25px' }}>
          <div className="section-head"><div><span className="eyebrow">PERSONNALISÉ</span><h2>Vos paires de mots</h2></div></div>
          <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px' }}>
            {customWordPairs.length ? customWordPairs.map((pair, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (ucRoom?.distributorId === getLocalPlayerId()) {
                    setNewCivilWord(pair.civil)
                    setNewUndercoverWord(pair.undercover)
                    notify('Mots sélectionnés !')
                  }
                }}
                style={{
                  padding: '8px', background: '#fbf8f3', border: '1px solid #ece7dd', borderRadius: '6px', fontSize: '12px',
                  cursor: ucRoom?.distributorId === getLocalPlayerId() ? 'pointer' : 'default',
                  display: 'flex', justifyContent: 'space-between',
                }}
              >
                <span>Civil : <strong>{pair.civil}</strong></span>
                <span style={{ color: '#767890' }}>Intrus : <strong>{pair.undercover}</strong></span>
              </div>
            )) : <p className="empty-players">Ajoutez vos propres paires pour les retrouver dans le thème « Personnalisé ».</p>}
          </div>

          <div style={{ borderTop: '1px solid #efeadd', paddingTop: '10px' }}>
            <span className="eyebrow">AJOUTER UNE NOUVELLE PAIRE</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginTop: '5px' }}>
              <input type="text" placeholder="Civil" id="new-civil-input" style={{ height: '32px', fontSize: '11px' }} />
              <input type="text" placeholder="Intrus" id="new-undercover-input" style={{ height: '32px', fontSize: '11px' }} />
            </div>
            <button
              type="button"
              className="secondary small"
              style={{ width: '100%', marginTop: '5px', height: '30px', padding: '0' }}
              onClick={() => {
                const c = document.getElementById('new-civil-input')?.value?.trim()
                const u = document.getElementById('new-undercover-input')?.value?.trim()
                if (c && u) {
                  setCustomWordPairs([...customWordPairs, { civil: c, undercover: u }])
                  document.getElementById('new-civil-input').value = ''
                  document.getElementById('new-undercover-input').value = ''
                  notify('Paire ajoutée !')
                }
              }}
            >
              Ajouter la paire
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <MatchHistoryPanel matches={matchHistory} />
        </div>

        <div className="section-head"><div><span className="eyebrow">RÈGLES DU JEU</span><h2>Comment jouer</h2></div></div>
        <div className="info-block">
          {/* TODO(section 19): description du jeu Undercover à personnaliser. */}
          <p style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}><VenetianMask size={15} style={{ flexShrink: 0, marginTop: '2px' }} /> <span><b>Undercover</b> est un jeu de société de déduction et de bluff, à jouer entre 3 joueurs ou plus. Chacun reçoit un mot secret… sauf que tout le monde n'a pas exactement le même !</span></p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
            <li><b>Civils</b> : la majorité du groupe, tous avec le même mot secret.</li>
            <li><b>Undercover</b> : reçoivent un mot proche mais différent — ils doivent décrire leur mot sans se trahir, en essayant de deviner le mot des Civils.</li>
            <li><b>M. White</b> : ne reçoivent aucun mot. Ils doivent improviser en écoutant les indices des autres pour se fondre dans la masse.</li>
          </ul>
          <p style={{ marginTop: '10px' }}>
            À chaque manche, chaque joueur donne un indice (un mot) sur son mot secret sans jamais le prononcer directement. Après le tour de parole, tout le monde vote pour éliminer le joueur qui semble le plus suspect. Les Civils gagnent en éliminant tous les Undercover et M. White ; les infiltrés gagnent s'il n'en reste plus assez pour les repérer.
          </p>
          <p style={{ marginTop: '10px' }}>Choisissez un thème avant de démarrer pour orienter les mots (animaux, pays, métiers, films…), ou ajoutez vos propres paires personnalisées.</p>
        </div>
      </aside>
    </section>
  )
}
