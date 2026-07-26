// [DÉFIS] Invitations de défi entre joueurs (simulation locale, persistée dans localStorage).
import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

const CHALLENGES_STORAGE_KEY = 'escape-flag-challenges'

export function useChallenges() {
  const { user } = useAuth()
  const { notify } = useToast()

  const [challengeTarget, setChallengeTarget] = useState(null)
  const [challengeDraft, setChallengeDraft] = useState('')
  const [challengeInvites, setChallengeInvites] = useState(() => {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(window.localStorage.getItem(CHALLENGES_STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify(challengeInvites))
    }
  }, [challengeInvites])

  const challengePlayer = (player) => {
    setChallengeTarget(player)
    notify(`Défi envoyé à ${player.name}`)
  }

  const sendChallengeInvite = (event) => {
    event.preventDefault()
    const trimmed = challengeDraft.trim()
    if (!trimmed || !user) return
    const invite = {
      id: Date.now(),
      type: 'sent',
      recipient: trimmed,
      sender: user.name,
      status: 'En attente',
      createdAt: new Date().toLocaleString('fr-FR'),
    }
    setChallengeInvites((previous) => [invite, ...previous])
    setChallengeDraft('')
    setChallengeTarget({ name: trimmed })
    notify(`Invitation envoyée à ${trimmed}`)
  }

  const receiveChallengeInvite = () => {
    const sample = ['amira@email.com', 'samba@email.com', 'mariam@email.com']
    const randomEmail = sample[Math.floor(Math.random() * sample.length)]
    const invite = {
      id: Date.now() + 1,
      type: 'received',
      recipient: user?.name || 'Vous',
      sender: 'Système',
      status: 'À valider',
      createdAt: new Date().toLocaleString('fr-FR'),
      email: randomEmail,
    }
    setChallengeInvites((previous) => [invite, ...previous])
    notify(`Défi reçu de ${randomEmail}`)
  }

  const resolveInvite = (id, action) => {
    setChallengeInvites((previous) => previous.map((invite) => (invite.id === id ? { ...invite, status: action === 'accept' ? 'Accepté' : 'Refusé' } : invite)))
    notify(action === 'accept' ? 'Défi accepté' : 'Défi refusé')
  }

  return {
    challengeTarget,
    challengeDraft,
    setChallengeDraft,
    challengeInvites,
    challengePlayer,
    sendChallengeInvite,
    receiveChallengeInvite,
    resolveInvite,
  }
}
