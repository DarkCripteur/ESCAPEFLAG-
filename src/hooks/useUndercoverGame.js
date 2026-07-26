// [UNDERCOVER] Logique complète du jeu, local (pass-the-device) et en ligne (polling serveur).
import { useEffect, useRef, useState } from 'react'
import { useAuth } from './useAuth'
import { useToast } from './useToast'
import * as undercoverService from '../services/undercoverService'
import { pickRandomPairFromTheme } from '../utils/undercoverThemes'

export function useUndercoverGame() {
  const { user, accessToken } = useAuth()
  const { notify } = useToast()

  // État du jeu local (pass-the-device)
  const [ucPlayers, setUcPlayers] = useState([
    { id: 1, name: 'Joueur 1', role: '', word: '', isEliminated: false },
    { id: 2, name: 'Joueur 2', role: '', word: '', isEliminated: false },
    { id: 3, name: 'Joueur 3', role: '', word: '', isEliminated: false },
  ])
  const [ucNewPlayerName, setUcNewPlayerName] = useState('')
  const [ucState, setUcState] = useState('setup')
  const [ucRevealIndex, setUcRevealIndex] = useState(0)
  const [ucShowWord, setUcShowWord] = useState(false)
  const [ucUndercoversCount, setUcUndercoversCount] = useState(1)
  const [ucWhitesCount, setUcWhitesCount] = useState(0)
  const [ucSelectedPair, setUcSelectedPair] = useState({ civil: 'Chocolat', undercover: 'Nutella' })
  const [ucWinner, setUcWinner] = useState('')
  const [ucRound, setUcRound] = useState(1)

  // [UNDERCOVER] Thèmes + attribution manuelle des rôles (section 6), valables pour
  // les deux modes (le panneau du distributeur en ligne réutilise les mêmes réglages).
  const [ucThemeId, setUcThemeId] = useState('objets')
  const [ucAssignMode, setUcAssignMode] = useState('auto')
  const [ucManualRoles, setUcManualRoles] = useState({})

  // État du mode en ligne
  const [ucMode, setUcMode] = useState('local')
  const [ucRoomId, setUcRoomId] = useState('')
  const [ucRoom, setUcRoom] = useState(null)
  const [ucJoinIdInput, setUcJoinIdInput] = useState('')
  const [ucClueInput, setUcClueInput] = useState('')
  const [ucChatInput, setUcChatInput] = useState('')
  const [customWordPairs, setCustomWordPairs] = useState([])
  const [newCivilWord, setNewCivilWord] = useState('')
  const [newUndercoverWord, setNewUndercoverWord] = useState('')

  // [UNDERCOVER] Historique des parties.
  const [matchHistory, setMatchHistory] = useState([])
  const localMatchRecordedRef = useRef(false)
  const onlineMatchRecordedRef = useRef(false)

  // [UNDERCOVER] Invitations par pseudo à rejoindre un salon en ligne.
  const [gameInvites, setGameInvites] = useState([])

  const getLocalPlayerId = () => user?.id || 'guest-' + (user?.name || 'anonyme')

  const loadMatchHistory = async () => {
    if (!accessToken) return
    try {
      setMatchHistory(await undercoverService.fetchMatches(accessToken))
    } catch (error) {
      console.warn('Historique Undercover indisponible', error)
    }
  }

  useEffect(() => {
    loadMatchHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

  // Enregistre la partie locale une seule fois, à l'arrivée sur l'écran de résultat.
  useEffect(() => {
    if (ucMode !== 'local') return
    if (ucState === 'result' && ucWinner && !localMatchRecordedRef.current) {
      localMatchRecordedRef.current = true
      undercoverService
        .recordMatch(
          {
            mode: 'local',
            winner: ucWinner,
            civilWord: ucSelectedPair.civil,
            undercoverWord: ucSelectedPair.undercover,
            players: ucPlayers.map((p) => ({ name: p.name, role: p.role, eliminated: p.isEliminated })),
          },
          accessToken
        )
        .then(loadMatchHistory)
        .catch((error) => console.warn('Enregistrement de la partie impossible', error))
    }
    if (ucState !== 'result') localMatchRecordedRef.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ucState, ucMode])

  // Enregistre la partie en ligne une seule fois, côté hôte uniquement (sinon chaque
  // joueur connecté enregistrerait sa propre copie de la même partie en la pollant).
  useEffect(() => {
    if (ucMode !== 'online' || !ucRoom) return
    if (ucRoom.state === 'result' && ucRoom.hostId === getLocalPlayerId() && !onlineMatchRecordedRef.current) {
      onlineMatchRecordedRef.current = true
      undercoverService
        .recordMatch(
          {
            mode: 'online',
            winner: ucRoom.winner,
            civilWord: ucRoom.civilWord,
            undercoverWord: ucRoom.undercoverWord,
            players: ucRoom.players.map((p) => ({ name: p.name, role: p.role, eliminated: p.isEliminated })),
          },
          accessToken
        )
        .then(loadMatchHistory)
        .catch((error) => console.warn('Enregistrement de la partie impossible', error))
    }
    if (ucRoom.state !== 'result') onlineMatchRecordedRef.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ucRoom?.state, ucMode])

  // [UNDERCOVER] Invitations reçues : scrutation légère tant qu'une session est active.
  useEffect(() => {
    if (!user?.id) {
      setGameInvites([])
      return undefined
    }
    const poll = async () => setGameInvites(await undercoverService.fetchGameInvites(getLocalPlayerId()))
    poll()
    const interval = setInterval(poll, 4000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const inviteFriendToRoom = async (receiverId) => {
    if (!ucRoomId) return
    try {
      await undercoverService.sendGameInvite(ucRoomId, user?.name || 'Un joueur', receiverId)
      notify('Invitation envoyée !')
    } catch (err) {
      notify(err.message)
    }
  }

  const acceptGameInvite = async (invite) => {
    await joinOnlineRoom(invite.roomId)
    await undercoverService.dismissGameInvite(getLocalPlayerId(), invite.id)
    setGameInvites((previous) => previous.filter((i) => i.id !== invite.id))
  }

  const declineGameInvite = async (invite) => {
    await undercoverService.dismissGameInvite(getLocalPlayerId(), invite.id)
    setGameInvites((previous) => previous.filter((i) => i.id !== invite.id))
  }

  const createOnlineRoom = async () => {
    try {
      const data = await undercoverService.createRoom(user?.name || 'Hôte', getLocalPlayerId())
      setUcRoom(data)
      setUcRoomId(data.id)
      setUcMode('online')
      notify(`Salon créé : ${data.id}`)
    } catch (err) {
      notify(err.message)
    }
  }

  const joinOnlineRoom = async (rid = ucJoinIdInput) => {
    if (!rid.trim()) return
    try {
      const data = await undercoverService.joinRoom(rid.toUpperCase(), user?.name || 'Joueur', getLocalPlayerId())
      setUcRoom(data)
      setUcRoomId(data.id)
      setUcMode('online')
      notify(`Vous avez rejoint le salon : ${data.id}`)
    } catch (err) {
      notify(err.message)
    }
  }

  const leaveOnlineRoom = async () => {
    if (!ucRoomId) return
    try {
      await undercoverService.leaveRoom(ucRoomId, getLocalPlayerId())
    } catch {
      // Ignoré : quitter un salon déjà fermé n'est pas une erreur pour l'utilisateur.
    }
    setUcRoomId('')
    setUcRoom(null)
    setUcMode('local')
    setUcState('setup')
  }

  const chooseOnlineDistributor = async (distributorId) => {
    try {
      setUcRoom(await undercoverService.chooseDistributor(ucRoomId, distributorId, getLocalPlayerId()))
    } catch (err) {
      notify(err.message)
    }
  }

  const setOnlineWords = async (civilWord, undercoverWord, undercovers, whites, assignments) => {
    try {
      setUcRoom(await undercoverService.setWords(ucRoomId, getLocalPlayerId(), civilWord, undercoverWord, undercovers, whites, assignments))
    } catch (err) {
      notify(err.message)
    }
  }

  const submitOnlineClue = async () => {
    if (!ucClueInput.trim()) return
    try {
      setUcRoom(await undercoverService.submitClue(ucRoomId, getLocalPlayerId(), ucClueInput.trim()))
      setUcClueInput('')
    } catch (err) {
      notify(err.message)
    }
  }

  const submitOnlineVote = async (targetId) => {
    try {
      setUcRoom(await undercoverService.submitVote(ucRoomId, getLocalPlayerId(), targetId))
    } catch (err) {
      notify(err.message)
    }
  }

  const sendOnlineChatMessage = async (e) => {
    e?.preventDefault()
    if (!ucChatInput.trim()) return
    try {
      setUcRoom(await undercoverService.sendChat(ucRoomId, user?.name || 'Joueur', ucChatInput.trim()))
      setUcChatInput('')
    } catch (err) {
      notify(err.message)
    }
  }

  const resetOnlineRoom = async () => {
    try {
      setUcRoom(await undercoverService.resetRoom(ucRoomId, getLocalPlayerId()))
    } catch (err) {
      notify(err.message)
    }
  }

  // Effet de scrutation périodique (polling)
  useEffect(() => {
    if (!ucRoomId || ucMode !== 'online') return undefined
    const interval = setInterval(async () => {
      const data = await undercoverService.fetchRoom(ucRoomId, getLocalPlayerId())
      if (data) setUcRoom(data)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 1500)
    return () => clearInterval(interval)
  }, [ucRoomId, ucMode])

  const addUcPlayer = (e) => {
    e?.preventDefault()
    if (!ucNewPlayerName.trim()) return
    setUcPlayers([...ucPlayers, { id: Date.now(), name: ucNewPlayerName.trim(), role: '', word: '', isEliminated: false }])
    setUcNewPlayerName('')
  }

  const removeUcPlayer = (id) => {
    if (ucPlayers.length <= 3) {
      notify('Il faut au moins 3 joueurs !')
      return
    }
    setUcPlayers(ucPlayers.filter((p) => p.id !== id))
  }

  const setManualRole = (playerId, role) => {
    setUcManualRoles((previous) => ({ ...previous, [playerId]: role }))
  }

  const pickPairForTheme = () => {
    if (ucThemeId === 'custom') {
      if (!customWordPairs.length) return null
      return customWordPairs[Math.floor(Math.random() * customWordPairs.length)]
    }
    return pickRandomPairFromTheme(ucThemeId)
  }

  const startUndercover = () => {
    if (ucPlayers.length < 3) {
      notify('Il faut au moins 3 joueurs !')
      return
    }

    const pair = pickPairForTheme()
    if (!pair) {
      notify('Ajoutez au moins une paire personnalisée pour ce thème.')
      return
    }

    let roleByPlayerId = {}
    if (ucAssignMode === 'manual') {
      const missing = ucPlayers.some((p) => !ucManualRoles[p.id])
      if (missing) {
        notify('Attribuez un rôle à chaque joueur avant de démarrer.')
        return
      }
      const undercovers = ucPlayers.filter((p) => ucManualRoles[p.id] === 'undercover').length
      const whites = ucPlayers.filter((p) => ucManualRoles[p.id] === 'mrwhite').length
      if (undercovers + whites >= ucPlayers.length) {
        notify('Il doit y avoir au moins un Civil dans le jeu !')
        return
      }
      roleByPlayerId = ucManualRoles
    } else {
      const totalSpecial = Number(ucUndercoversCount) + Number(ucWhitesCount)
      if (totalSpecial >= ucPlayers.length) {
        notify('Il doit y avoir au moins un Civil dans le jeu !')
        return
      }
      const roles = []
      for (let i = 0; i < ucUndercoversCount; i++) roles.push('undercover')
      for (let i = 0; i < ucWhitesCount; i++) roles.push('mrwhite')
      while (roles.length < ucPlayers.length) roles.push('civil')
      roles.sort(() => Math.random() - 0.5)
      ucPlayers.forEach((player, idx) => {
        roleByPlayerId[player.id] = roles[idx]
      })
    }

    setUcSelectedPair(pair)
    const updated = ucPlayers.map((player) => {
      const role = roleByPlayerId[player.id]
      let word = ''
      if (role === 'civil') word = pair.civil
      else if (role === 'undercover') word = pair.undercover
      else word = 'M. White (Vous n’avez pas de mot !)'
      return { ...player, role, word, isEliminated: false }
    })

    setUcPlayers(updated)
    setUcManualRoles({})
    setUcState('reveal')
    setUcRevealIndex(0)
    setUcShowWord(false)
    setUcWinner('')
    setUcRound(1)
  }

  const eliminateUcPlayer = (id) => {
    const updated = ucPlayers.map((p) => (p.id === id ? { ...p, isEliminated: true } : p))
    setUcPlayers(updated)

    const activeCivils = updated.filter((p) => !p.isEliminated && p.role === 'civil')
    const activeUndercovers = updated.filter((p) => !p.isEliminated && p.role === 'undercover')
    const activeWhites = updated.filter((p) => !p.isEliminated && p.role === 'mrwhite')

    if (activeUndercovers.length === 0 && activeWhites.length === 0) {
      setUcWinner('Civils')
      setUcState('result')
    } else if (activeCivils.length <= activeUndercovers.length + activeWhites.length) {
      setUcWinner('Undercovers / M. White')
      setUcState('result')
    } else {
      setUcState('describe')
      setUcRound((r) => r + 1)
    }
  }

  return {
    ucPlayers, ucNewPlayerName, setUcNewPlayerName, ucState, setUcState,
    ucRevealIndex, setUcRevealIndex, ucShowWord, setUcShowWord,
    ucUndercoversCount, setUcUndercoversCount, ucWhitesCount, setUcWhitesCount,
    ucSelectedPair, ucWinner, ucRound,
    ucThemeId, setUcThemeId, ucAssignMode, setUcAssignMode, ucManualRoles, setManualRole, setUcManualRoles,
    ucMode, setUcMode, ucRoomId, ucRoom, ucJoinIdInput, setUcJoinIdInput,
    ucClueInput, setUcClueInput, ucChatInput, setUcChatInput,
    customWordPairs, setCustomWordPairs, newCivilWord, setNewCivilWord, newUndercoverWord, setNewUndercoverWord,
    matchHistory, gameInvites, inviteFriendToRoom, acceptGameInvite, declineGameInvite,
    getLocalPlayerId, createOnlineRoom, joinOnlineRoom, leaveOnlineRoom,
    chooseOnlineDistributor, setOnlineWords, submitOnlineClue, submitOnlineVote,
    sendOnlineChatMessage, resetOnlineRoom, addUcPlayer, removeUcPlayer,
    startUndercover, eliminateUcPlayer,
  }
}
