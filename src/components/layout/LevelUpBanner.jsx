// [QUIZ] Animation « Gain de niveau » (section 7), affichée par-dessus l'app le temps
// de quelques secondes puis rejouable en cliquant n'importe où.
import { AnimatePresence, motion } from 'framer-motion'
import { PartyPopper } from 'lucide-react'
import { useQuizGame } from '../../hooks/useQuizGame'

export function LevelUpBanner() {
  const { leveledUp, dismissLevelUp, level } = useQuizGame()

  return (
    <AnimatePresence>
      {leveledUp && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismissLevelUp}
        >
          <motion.div
            className="flex flex-col items-center gap-2 rounded-3xl bg-paper px-12 py-10 text-center shadow-2xl"
            initial={{ scale: 0.6, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <motion.span
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.8, repeat: 1 }}
            >
              <PartyPopper size={56} color="#f4a13a" />
            </motion.span>
            <span className="text-xs font-bold tracking-widest text-purple">NIVEAU SUPÉRIEUR</span>
            <h2 className="m-0 text-4xl font-extrabold text-ink">Niveau {level} !</h2>
            <p className="m-0 text-sm text-muted">Continuez à répondre pour débloquer encore plus de badges.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
