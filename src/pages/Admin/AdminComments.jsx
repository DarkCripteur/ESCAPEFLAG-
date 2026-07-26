// [ADMIN] Gestion commentaires Smash or Pass : suppression de contenu (section 10).
export function AdminComments({ comments, onDelete }) {
  return (
    <div className="challenge-list">
      {comments.length ? comments.map((comment) => (
        <div className="challenge-item" key={comment.id}>
          <div>
            <b>@{comment.voterUsername}</b>
            <small>{comment.comment}</small>
          </div>
          <button type="button" className="secondary small" style={{ color: '#d3564f', borderColor: '#f4c6c6' }} onClick={() => onDelete(comment)}>
            Supprimer
          </button>
        </div>
      )) : <p className="empty-players">Aucun commentaire pour le moment.</p>}
    </div>
  )
}
