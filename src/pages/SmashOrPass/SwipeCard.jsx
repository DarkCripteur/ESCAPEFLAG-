// [SMASH OR PASS] Carte glissable : glisser à droite = Smash, à gauche = Pass
// (comportement demandé section 8), avec les boutons comme alternative accessible.
import { motion } from 'framer-motion'
import { photoUrl } from '../../services/smashPassService'

const SWIPE_THRESHOLD = 120

const exitVariants = {
  left: { x: -400, opacity: 0, rotate: -18 },
  right: { x: 400, opacity: 0, rotate: 18 },
  none: { x: 0, opacity: 1, rotate: 0 },
}

export function SwipeCard({ photo, swipeDirection, onVote }) {
  return (
    <motion.div
      drag="x"
      dragElastic={0.6}
      onDragEnd={(_event, info) => {
        if (info.offset.x > SWIPE_THRESHOLD) onVote('smash')
        else if (info.offset.x < -SWIPE_THRESHOLD) onVote('pass')
      }}
      animate={swipeDirection || 'none'}
      variants={exitVariants}
      initial={{ scale: 0.94, opacity: 0 }}
      whileTap={{ cursor: 'grabbing' }}
      style={{ cursor: 'grab', touchAction: 'pan-y' }}
      className="relative mx-auto flex h-[420px] w-full max-w-[360px] items-center justify-center overflow-hidden rounded-2xl border border-line bg-black shadow-lg"
    >
      <img src={photoUrl(photo.imageUrl || photo.image_url)} alt="" className="h-full w-full object-cover" draggable={false} />
    </motion.div>
  )
}
