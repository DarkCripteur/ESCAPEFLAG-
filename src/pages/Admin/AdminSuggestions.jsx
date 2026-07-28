// [ADMIN] [SUGGESTIONS] Liste des suggestions reçues (section 10 + 11).
import { MessageSquare, MessageSquareOff } from 'lucide-react'

export function AdminSuggestions({ suggestions }) {
  return (
    <div className="challenge-list">
      {suggestions.length ? suggestions.map((s) => (
        <div className="challenge-item" key={s.id} style={{ alignItems: 'flex-start' }}>
          <div>
            <b>{s.name}</b>
            <small style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              {s.email} • {new Date(s.createdAt || s.created_at).toLocaleString('fr-FR')} •
              {/* `emailed` : nom de champ historique, désigne maintenant l'envoi WhatsApp (voir suggestionController.js). */}
              {s.emailed ? <><MessageSquare size={12} /> WhatsApp envoyé</> : <><MessageSquareOff size={12} /> WhatsApp non envoyé</>}
            </small>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#35354b' }}>{s.message}</p>
          </div>
        </div>
      )) : <p className="empty-players">Aucune suggestion pour le moment.</p>}
    </div>
  )
}
