// [SUGGESTIONS] Formulaire de suggestion (section 11), ouvert depuis un bouton du
// header — accessible depuis n'importe quel écran sans encombrer la navigation.
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { submitSuggestion } from '../../services/suggestionService'

export function SuggestionModal({ open, onClose }) {
  const { accessToken } = useAuth()
  const { notify } = useToast()
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (message.trim().length < 10) {
      notify('Votre suggestion doit contenir au moins 10 caractères.')
      return
    }
    setSending(true)
    try {
      await submitSuggestion(message.trim(), accessToken)
      notify('Merci pour votre suggestion !')
      setMessage('')
      onClose()
    } catch (error) {
      notify(error.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-[420px] rounded-2xl border border-line bg-paper p-6 shadow-2xl"
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="section-head" style={{ marginBottom: '14px' }}>
              <div><span className="eyebrow">BOÎTE À SUGGESTIONS</span><h2 style={{ margin: '4px 0 0' }}>Une idée à nous soumettre ?</h2></div>
              <button type="button" className="secondary small" onClick={onClose}><X size={14} /></button>
            </div>
            <p style={{ color: '#767890', fontSize: '13px', marginBottom: '14px' }}>
              Vos suggestions nous aident à améliorer Escape Flag. Votre message est transmis à l’équipe.
            </p>
            <form onSubmit={handleSubmit}>
              <textarea
                required
                minLength={10}
                maxLength={2000}
                rows={5}
                placeholder="Décrivez votre idée, un bug rencontré, ou tout ce que vous aimeriez voir dans le jeu…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ width: '100%', border: '1px solid #ddd9de', borderRadius: '8px', padding: '10px 12px', font: 'inherit', fontSize: '13px', resize: 'vertical' }}
              />
              <button type="submit" className="primary" style={{ width: '100%', marginTop: '14px' }} disabled={sending}>
                {sending ? 'Envoi…' : 'Envoyer la suggestion'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
