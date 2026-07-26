// [UNDERCOVER] Salons multijoueurs en mémoire (pas de persistance, pas de repli
// JSON/Supabase — comportement volontairement différent du reste de l'API).
import crypto from 'crypto'
import { configured, supabase } from '../services/supabaseClient.js'
import { readJsonFile, writeJsonFile } from '../services/dataStore.js'
import { recordMatchSchema, sendGameInviteSchema } from '../validators/undercoverValidators.js'

const undercoverRooms = {}
// [UNDERCOVER] Invitations à rejoindre un salon en ligne, par pseudo (section 6).
// En mémoire comme les salons eux-mêmes : une invitation non consultée ne survit
// pas à un redémarrage du serveur, ce qui est acceptable (elle expire naturellement
// avec le salon qu'elle référence).
const pendingGameInvites = {}

export function createRoom(req, res) {
  const { hostName, hostId } = req.body
  if (!hostName || !hostId) return res.status(400).json({ message: 'Données manquantes.' })

  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase()
  undercoverRooms[roomId] = {
    id: roomId,
    hostId,
    players: [{ id: hostId, name: hostName, role: '', word: '', isEliminated: false, isHost: true }],
    state: 'setup',
    distributorId: null,
    civilWord: '',
    undercoverWord: '',
    undercoversCount: 1,
    whitesCount: 0,
    round: 1,
    votes: {},
    clues: {},
    chat: [],
    winner: '',
  }
  res.json(undercoverRooms[roomId])
}

export function joinRoom(req, res) {
  const { roomId, playerName, playerId } = req.body
  if (!roomId || !playerName || !playerId) return res.status(400).json({ message: 'Données manquantes.' })

  const room = undercoverRooms[roomId.toUpperCase()]
  if (!room) return res.status(404).json({ message: 'Salon introuvable.' })

  const existing = room.players.find((p) => p.id === playerId)
  if (!existing) {
    if (room.state !== 'setup') {
      return res.status(400).json({ message: 'La partie a déjà commencé dans ce salon.' })
    }
    room.players.push({ id: playerId, name: playerName, role: '', word: '', isEliminated: false, isHost: false })
  }
  res.json(room)
}

export function leaveRoom(req, res) {
  const { roomId, playerId } = req.body
  const room = undercoverRooms[roomId?.toUpperCase()]
  if (room) {
    room.players = room.players.filter((p) => p.id !== playerId)
    if (room.hostId === playerId && room.players.length > 0) {
      room.players[0].isHost = true
      room.hostId = room.players[0].id
    }
    if (room.players.length === 0) {
      delete undercoverRooms[roomId.toUpperCase()]
    }
  }
  res.json({ success: true })
}

export function getRoom(req, res) {
  const { roomId } = req.params
  const { playerId } = req.query
  const room = undercoverRooms[roomId.toUpperCase()]
  if (!room) return res.status(404).json({ message: 'Salon introuvable.' })

  const sanitizedPlayers = room.players.map((p) => {
    const isSelf = p.id === playerId
    const revealAll = room.state === 'result'
    return {
      id: p.id,
      name: p.name,
      isEliminated: p.isEliminated,
      isHost: p.isHost,
      role: isSelf || revealAll ? p.role : '',
      word: isSelf || revealAll ? p.word : '',
    }
  })

  res.json({ ...room, players: sanitizedPlayers })
}

export function chooseDistributor(req, res) {
  const { roomId, distributorId, hostId } = req.body
  const room = undercoverRooms[roomId?.toUpperCase()]
  if (!room) return res.status(404).json({ message: 'Salon introuvable.' })
  if (room.hostId !== hostId) return res.status(403).json({ message: 'Seul l’hôte peut choisir le distributeur.' })

  room.distributorId = distributorId
  res.json(room)
}

// `assignments` (optionnel) : { [playerId]: 'civil' | 'undercover' | 'mrwhite' },
// pour l'attribution manuelle des rôles (section 6). Quand fourni et valide, il
// remplace le tirage aléatoire ; sinon, comportement automatique inchangé.
export function setWords(req, res) {
  const { roomId, distributorId, civilWord, undercoverWord, undercoversCount, whitesCount, assignments } = req.body
  const room = undercoverRooms[roomId?.toUpperCase()]
  if (!room) return res.status(404).json({ message: 'Salon introuvable.' })
  if (room.distributorId !== distributorId) return res.status(403).json({ message: 'Seul le distributeur peut soumettre les mots.' })

  room.civilWord = civilWord
  room.undercoverWord = undercoverWord

  const activePlayers = room.players.filter((p) => !p.isEliminated)
  let roles

  if (assignments && typeof assignments === 'object' && Object.keys(assignments).length) {
    const validRoles = ['civil', 'undercover', 'mrwhite']
    const missing = activePlayers.some((p) => !validRoles.includes(assignments[p.id]))
    if (missing) return res.status(400).json({ message: 'Attribution manuelle incomplète ou invalide.' })

    room.undercoversCount = activePlayers.filter((p) => assignments[p.id] === 'undercover').length
    room.whitesCount = activePlayers.filter((p) => assignments[p.id] === 'mrwhite').length
    if (room.undercoversCount + room.whitesCount >= activePlayers.length) {
      return res.status(400).json({ message: 'Il doit rester au moins un Civil.' })
    }

    room.players = room.players.map((p) => {
      if (p.isEliminated) return { ...p, role: '', word: '' }
      const role = assignments[p.id]
      const word = role === 'civil' ? civilWord : role === 'undercover' ? undercoverWord : 'M. White'
      return { ...p, role, word }
    })
  } else {
    room.undercoversCount = Number(undercoversCount || 1)
    room.whitesCount = Number(whitesCount || 0)
    const totalSpecial = room.undercoversCount + room.whitesCount
    if (totalSpecial >= activePlayers.length) {
      return res.status(400).json({ message: 'Trop de rôles spéciaux pour le nombre de joueurs.' })
    }

    roles = []
    for (let i = 0; i < room.undercoversCount; i++) roles.push('undercover')
    for (let i = 0; i < room.whitesCount; i++) roles.push('mrwhite')
    while (roles.length < activePlayers.length) roles.push('civil')
    roles.sort(() => Math.random() - 0.5)

    let roleIdx = 0
    room.players = room.players.map((p) => {
      if (p.isEliminated) return { ...p, role: '', word: '' }
      const role = roles[roleIdx++]
      const word = role === 'civil' ? civilWord : role === 'undercover' ? undercoverWord : 'M. White'
      return { ...p, role, word }
    })
  }

  room.state = 'reveal'
  room.votes = {}
  room.clues = {}
  room.winner = ''
  room.round = 1

  res.json(room)
}

export function submitClue(req, res) {
  const { roomId, playerId, clue } = req.body
  const room = undercoverRooms[roomId?.toUpperCase()]
  if (!room) return res.status(404).json({ message: 'Salon introuvable.' })

  room.clues[playerId] = clue

  const activePlayers = room.players.filter((p) => !p.isEliminated)
  const cluesCount = Object.keys(room.clues).length
  if (cluesCount >= activePlayers.length) {
    room.state = 'vote'
  }
  res.json(room)
}

export function submitVote(req, res) {
  const { roomId, voterId, targetId } = req.body
  const room = undercoverRooms[roomId?.toUpperCase()]
  if (!room) return res.status(404).json({ message: 'Salon introuvable.' })

  room.votes[voterId] = targetId

  const activePlayers = room.players.filter((p) => !p.isEliminated)
  const votesCount = Object.keys(room.votes).length
  if (votesCount >= activePlayers.length) {
    const tallies = {}
    Object.values(room.votes).forEach((tid) => {
      tallies[tid] = (tallies[tid] || 0) + 1
    })

    let maxVotes = -1
    let eliminatedId = null
    Object.entries(tallies).forEach(([tid, count]) => {
      if (count > maxVotes) {
        maxVotes = count
        eliminatedId = tid
      }
    })

    if (eliminatedId) {
      room.players = room.players.map((p) => (p.id === eliminatedId ? { ...p, isEliminated: true } : p))
    }

    const updatedActive = room.players.filter((p) => !p.isEliminated)
    const activeCivils = updatedActive.filter((p) => p.role === 'civil')
    const activeUndercovers = updatedActive.filter((p) => p.role === 'undercover')
    const activeWhites = updatedActive.filter((p) => p.role === 'mrwhite')

    if (activeUndercovers.length === 0 && activeWhites.length === 0) {
      room.winner = 'Civils'
      room.state = 'result'
    } else if (activeCivils.length <= activeUndercovers.length + activeWhites.length) {
      room.winner = 'Undercovers / M. White'
      room.state = 'result'
    } else {
      room.votes = {}
      room.clues = {}
      room.state = 'describe'
      room.round += 1
    }
  }
  res.json(room)
}

export function postChat(req, res) {
  const { roomId, sender, message } = req.body
  const room = undercoverRooms[roomId?.toUpperCase()]
  if (!room) return res.status(404).json({ message: 'Salon introuvable.' })

  room.chat.push({
    sender,
    message,
    timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  })
  res.json(room)
}

export function resetRoom(req, res) {
  const { roomId, hostId } = req.body
  const room = undercoverRooms[roomId?.toUpperCase()]
  if (!room) return res.status(404).json({ message: 'Salon introuvable.' })
  if (room.hostId !== hostId) return res.status(403).json({ message: 'Seul l’hôte peut relancer la partie.' })

  room.players = room.players.map((p) => ({ ...p, role: '', word: '', isEliminated: false }))
  room.state = 'setup'
  room.distributorId = null
  room.civilWord = ''
  room.undercoverWord = ''
  room.round = 1
  room.votes = {}
  room.clues = {}
  room.winner = ''
  res.json(room)
}

// [UNDERCOVER] Historique des parties : contrairement aux salons, c'est persisté
// (Supabase si configuré, sinon data/undercoverMatches.json) puisqu'il doit survivre
// au-delà d'une partie et être consultable plus tard par le joueur.
export async function recordMatch(req, res, next) {
  try {
    const input = recordMatchSchema.parse(req.body)
    const userId = req.user.id

    if (configured && supabase) {
      try {
        const { data, error } = await supabase
          .from('undercover_matches')
          .insert({
            user_id: userId,
            mode: input.mode,
            winner: input.winner,
            civil_word: input.civilWord,
            undercover_word: input.undercoverWord,
            players: input.players,
          })
          .select()
          .single()
        if (!error && data) return res.status(201).json({ match: data })
      } catch {
        // Repli local ci-dessous.
      }
    }

    const matches = readJsonFile('undercoverMatches.json')
    const match = {
      id: crypto.randomUUID(),
      userId,
      mode: input.mode,
      winner: input.winner,
      civilWord: input.civilWord,
      undercoverWord: input.undercoverWord,
      players: input.players,
      createdAt: new Date().toISOString(),
    }
    matches.unshift(match)
    writeJsonFile('undercoverMatches.json', matches.slice(0, 200))
    res.status(201).json({ match })
  } catch (error) {
    next(error)
  }
}

export async function listMatches(req, res, next) {
  try {
    const userId = req.user.id

    if (configured && supabase) {
      try {
        const { data, error } = await supabase
          .from('undercover_matches')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20)
        if (!error && data) return res.json({ matches: data })
      } catch {
        // Repli local ci-dessous.
      }
    }

    const matches = readJsonFile('undercoverMatches.json')
      .filter((m) => m.userId === userId)
      .slice(0, 20)
    res.json({ matches })
  } catch (error) {
    next(error)
  }
}

export function sendGameInvite(req, res, next) {
  try {
    const input = sendGameInviteSchema.parse(req.body)
    const room = undercoverRooms[input.roomId.toUpperCase()]
    if (!room) return res.status(404).json({ message: 'Salon introuvable.' })

    if (!pendingGameInvites[input.receiverId]) pendingGameInvites[input.receiverId] = []
    // Évite d'empiler plusieurs invitations identiques si on clique deux fois.
    const alreadyInvited = pendingGameInvites[input.receiverId].some((invite) => invite.roomId === room.id)
    if (!alreadyInvited) {
      pendingGameInvites[input.receiverId].push({
        id: crypto.randomUUID(),
        roomId: room.id,
        senderName: input.senderName,
        createdAt: new Date().toISOString(),
      })
    }
    res.status(201).json({ success: true })
  } catch (error) {
    next(error)
  }
}

export function listGameInvites(req, res) {
  const { userId } = req.params
  res.json({ invites: pendingGameInvites[userId] || [] })
}

export function dismissGameInvite(req, res) {
  const { userId, inviteId } = req.params
  if (pendingGameInvites[userId]) {
    pendingGameInvites[userId] = pendingGameInvites[userId].filter((invite) => invite.id !== inviteId)
  }
  res.json({ success: true })
}
