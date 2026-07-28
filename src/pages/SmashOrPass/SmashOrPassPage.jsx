// [SMASH OR PASS] Nouveau jeu (section 8) : upload de photos, pioche de cartes,
// vote Smash/Pass avec commentaire optionnel.
import { useRef } from 'react'
import { Camera, Heart, Upload, X } from 'lucide-react'
import { useSmashPassGame } from '../../hooks/useSmashPassGame'
import { photoUrl } from '../../services/smashPassService'
import { SwipeCard } from './SwipeCard'

export function SmashOrPassPage() {
  const {
    feed, currentPhoto, feedLoading, myPhotos, uploading, comment, setComment,
    swipeDirection, uploadPhoto, deleteMyPhoto, vote, refreshFeed,
  } = useSmashPassGame()
  const fileInputRef = useRef(null)

  return (
    <section className="detail-layout">
      <article className="detail-card">
        <div className="section-head">
          <div><span className="eyebrow">SMASH OR PASS</span><h2>Découvrez et votez</h2></div>
          <span className="pill">{feed.length} carte{feed.length !== 1 ? 's' : ''} restante{feed.length !== 1 ? 's' : ''}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) uploadPhoto(file)
              e.target.value = ''
            }}
          />
          <button type="button" className="secondary" disabled={uploading} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }} onClick={() => fileInputRef.current?.click()}>
            {uploading ? 'Envoi en cours…' : <><Upload size={16} /> Importer une photo (téléphone ou ordinateur)</>}
          </button>
        </div>

        {feedLoading ? (
          <p className="empty-players" style={{ textAlign: 'center' }}>Chargement des cartes…</p>
        ) : currentPhoto ? (
          <>
            <SwipeCard photo={currentPhoto} swipeDirection={swipeDirection} onVote={vote} />

            <div style={{ maxWidth: '360px', margin: '18px auto 0' }}>
              <input
                type="text"
                placeholder="Un commentaire ? (facultatif)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '18px' }}>
              <button
                type="button"
                onClick={() => vote('pass')}
                aria-label="Pass"
                style={{ width: '64px', height: '64px', borderRadius: '50%', border: '1px solid #f4c6c6', background: '#fff0f1', color: '#d3564f', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
              >
                <X size={26} />
              </button>
              <button
                type="button"
                onClick={() => vote('smash')}
                aria-label="Smash"
                style={{ width: '64px', height: '64px', borderRadius: '50%', border: '1px solid #bfe4cb', background: '#eaf6ee', color: '#2f6b45', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
              >
                <Heart size={26} />
              </button>
            </div>
          </>
        ) : (
          <div className="escape-result" style={{ padding: '30px 20px' }}>
            <div className="open-door" style={{ display: 'flex', justifyContent: 'center' }}><Camera size={56} /></div>
            <h1 style={{ fontSize: '20px' }}>Plus de cartes pour le moment</h1>
            <p>Revenez plus tard, ou importez une photo pour alimenter le jeu.</p>
            <button className="primary small" onClick={refreshFeed}>Actualiser</button>
          </div>
        )}
      </article>

      <aside className="detail-card side-card">
        <div className="section-head"><div><span className="eyebrow">COMMENT JOUER</span><h2>Le principe</h2></div></div>
        <div className="info-block">
          {/* TODO(section 19): description du jeu Smash or Pass à personnaliser. */}
          <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Camera size={14} /> Importez une photo, puis parcourez celles des autres joueurs.</p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
            <li>Glissez la carte à <b>droite</b> (ou appuyez sur <Heart size={12} style={{ verticalAlign: '-1px' }} />) pour <b>Smash</b>.</li>
            <li>Glissez-la à <b>gauche</b> (ou appuyez sur <X size={12} style={{ verticalAlign: '-1px' }} />) pour <b>Pass</b>.</li>
            <li>Un commentaire est possible mais jamais obligatoire.</li>
          </ul>
          <p style={{ marginTop: '10px' }}>Vous ne votez jamais sur vos propres photos, et chaque carte ne repasse pas deux fois.</p>
        </div>

        <div className="section-head" style={{ marginTop: '20px' }}><div><span className="eyebrow">MES PHOTOS</span><h2>Mes envois ({myPhotos.length})</h2></div></div>
        <div className="player-list" style={{ maxHeight: '260px', overflowY: 'auto' }}>
          {myPhotos.length ? myPhotos.map((photo) => (
            <div className="player" key={photo.id} style={{ height: 'auto', padding: '8px 0' }}>
              <img src={photoUrl(photo.imageUrl || photo.image_url)} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
              <div>
                <b style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Heart size={12} /> {photo.smashCount ?? 0} · <X size={12} /> {photo.passCount ?? 0}</b>
                <small>{new Date(photo.createdAt || photo.created_at).toLocaleDateString('fr-FR')}</small>
              </div>
              <button type="button" className="secondary small" style={{ marginLeft: 'auto', color: '#d3564f', borderColor: '#f4c6c6' }} onClick={() => deleteMyPhoto(photo.id)}>
                Retirer
              </button>
            </div>
          )) : <p className="empty-players">Vous n’avez pas encore importé de photo.</p>}
        </div>
      </aside>
    </section>
  )
}
