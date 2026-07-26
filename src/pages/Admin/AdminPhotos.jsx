// [ADMIN] Gestion photos Smash or Pass : suppression de contenu (section 10).
import { photoUrl } from '../../services/smashPassService'

export function AdminPhotos({ photos, onDelete }) {
  return (
    <div>
      {photos.length ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '14px' }}>
          {photos.map((photo) => (
            <div key={photo.id} style={{ border: '1px solid #ece7dd', borderRadius: '10px', overflow: 'hidden', background: '#fbf8f3' }}>
              <img
                src={photoUrl(photo.imageUrl || photo.image_url)}
                alt=""
                style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ padding: '8px' }}>
                <small style={{ display: 'block', color: '#8d8997' }}>@{photo.uploaderUsername}</small>
                <button type="button" className="secondary small" style={{ width: '100%', marginTop: '6px', color: '#d3564f', borderColor: '#f4c6c6' }} onClick={() => onDelete(photo)}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : <p className="empty-players">Aucune photo pour le moment.</p>}
    </div>
  )
}
