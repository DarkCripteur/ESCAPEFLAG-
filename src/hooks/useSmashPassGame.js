// [SMASH OR PASS] État de la page : pioche de photos, upload, vote, mes photos.
import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { useToast } from './useToast'
import * as smashPassService from '../services/smashPassService'

export function useSmashPassGame() {
  const { accessToken } = useAuth()
  const { notify } = useToast()

  const [feed, setFeed] = useState([])
  const [feedLoading, setFeedLoading] = useState(true)
  const [myPhotos, setMyPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [comment, setComment] = useState('')
  const [swipeDirection, setSwipeDirection] = useState(null)

  const loadFeed = async () => {
    setFeedLoading(true)
    try {
      setFeed(await smashPassService.fetchFeed(accessToken))
    } catch (error) {
      notify(error.message)
    } finally {
      setFeedLoading(false)
    }
  }

  const loadMyPhotos = async () => {
    try {
      setMyPhotos(await smashPassService.fetchMyPhotos(accessToken))
    } catch (error) {
      notify(error.message)
    }
  }

  useEffect(() => {
    if (!accessToken) return
    loadFeed()
    loadMyPhotos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

  const uploadPhoto = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      await smashPassService.uploadPhoto(file, accessToken)
      notify('Photo envoyée !')
      await loadMyPhotos()
    } catch (error) {
      notify(error.message)
    } finally {
      setUploading(false)
    }
  }

  const deleteMyPhoto = async (id) => {
    try {
      await smashPassService.deletePhoto(id, accessToken)
      setMyPhotos((previous) => previous.filter((p) => p.id !== id))
      notify('Photo supprimée.')
    } catch (error) {
      notify(error.message)
    }
  }

  // Retire la carte du haut de la pioche après l'animation de sortie (Smash → droite,
  // Pass → gauche, comme demandé section 8), puis envoie le vote au serveur.
  const vote = async (choice) => {
    const current = feed[0]
    if (!current) return
    setSwipeDirection(choice === 'smash' ? 'right' : 'left')
    const submittedComment = comment
    setComment('')
    setTimeout(async () => {
      setFeed((previous) => previous.slice(1))
      setSwipeDirection(null)
      try {
        await smashPassService.castVote(current.id, choice, submittedComment, accessToken)
      } catch (error) {
        notify(error.message)
      }
    }, 260)
  }

  return {
    feed,
    currentPhoto: feed[0] || null,
    feedLoading,
    myPhotos,
    uploading,
    comment,
    setComment,
    swipeDirection,
    uploadPhoto,
    deleteMyPhoto,
    vote,
    refreshFeed: loadFeed,
  }
}
