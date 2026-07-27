// Bouton de connexion. Porté à l'origine depuis un composant "glisser pour valider"
// (TypeScript + shadcn/ui). Mise à jour demandée : le clic doit suffire, glisser ne
// doit plus être nécessaire — un clic anime automatiquement le curseur jusqu'au bout
// (animation programmatique via `animate()` sur la motion value), puis enchaîne sur
// les états chargement/succès/erreur reflétant la vraie promesse renvoyée par
// `onConfirm`. Le geste de glisser reste disponible en plus, il n'a pas été retiré.
import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Check, Loader2, SendHorizontal, X } from 'lucide-react'
import { Button } from './Button'
import { cn } from '../../utils/cn'

const DRAG_CONSTRAINTS = { left: 0, right: 155 }
const DRAG_THRESHOLD = 0.9

// [MOBILE] 12rem (192px) d'origine : le label centré sur toute la largeur passait
// derrière le curseur circulaire (côté gauche), masquant les premières lettres
// (visible sur mobile réel). Le bouton est élargi et le label n'est plus centré que
// dans l'espace libre à droite du curseur, pour ne plus jamais chevaucher.
const BUTTON_STATES = {
  initial: { width: '15rem' },
  completed: { width: '8rem' },
}

const SPRING = { type: 'spring', stiffness: 400, damping: 40, mass: 0.8 }

function StatusIcon({ status }) {
  if (status === 'loading') return <motion.div key="loading" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}><Loader2 className="animate-spin" size={20} /></motion.div>
  if (status === 'success') return <motion.div key="success" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}><Check size={20} /></motion.div>
  if (status === 'error') return <motion.div key="error" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}><X size={20} /></motion.div>
  return null
}

/**
 * @param {{ onConfirm: () => Promise<void>, label?: string, disabled?: boolean }} props
 */
export function SlideToLogin({ onConfirm, label = 'Cliquez pour vous connecter', disabled = false }) {
  const [isDragging, setIsDragging] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [status, setStatus] = useState('idle')
  const dragHandleRef = useRef(null)

  const dragX = useMotionValue(0)
  const springX = useSpring(dragX, SPRING)
  const dragProgress = useTransform(springX, [0, DRAG_CONSTRAINTS.right], [0, 1])
  const adjustedWidth = useTransform(springX, (x) => x + 10)

  const runConfirm = useCallback(async () => {
    setStatus('loading')
    try {
      await onConfirm?.()
      setStatus('success')
    } catch {
      setStatus('error')
      // Laisse le temps de voir l'icône d'erreur puis relâche le bouton pour réessayer.
      setTimeout(() => {
        setCompleted(false)
        setStatus('idle')
        dragX.set(0)
      }, 1200)
    }
  }, [onConfirm, dragX])

  // Le bouton est "immédiatement actif au clic" (demandé) : plus besoin de glisser
  // soi-même, l'animation de glissement se joue automatiquement jusqu'au bout.
  const handleActivate = useCallback(() => {
    if (completed || disabled) return
    setCompleted(true)
    animate(dragX, DRAG_CONSTRAINTS.right, { type: 'tween', duration: 0.32, ease: 'easeOut' })
    void runConfirm()
  }, [completed, disabled, dragX, runConfirm])

  const handleDragStart = useCallback(() => {
    if (completed || disabled) return
    setIsDragging(true)
  }, [completed, disabled])

  const handleDragEnd = () => {
    if (completed || disabled) return
    setIsDragging(false)
    const progress = dragProgress.get()
    if (progress >= DRAG_THRESHOLD) {
      setCompleted(true)
      void runConfirm()
    } else {
      dragX.set(0)
    }
  }

  const handleDrag = (_event, info) => {
    if (completed || disabled) return
    const newX = Math.max(0, Math.min(info.offset.x, DRAG_CONSTRAINTS.right))
    dragX.set(newX)
  }

  return (
    <motion.div
      animate={completed ? BUTTON_STATES.completed : BUTTON_STATES.initial}
      transition={SPRING}
      onClick={handleActivate}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleActivate() } }}
      className={cn('shadow-button-inset relative flex h-11 items-center justify-center rounded-full bg-lilac mx-auto', !completed && !disabled && 'cursor-pointer')}
    >
      {!completed && (
        <motion.div style={{ width: adjustedWidth }} className="absolute inset-y-0 left-0 z-0 rounded-full bg-purple" />
      )}
      {!completed && (
        <span className="pointer-events-none absolute inset-y-0 left-11 right-2 flex items-center justify-center whitespace-nowrap text-xs font-semibold tracking-normal text-ink/70">
          {label}
        </span>
      )}

      <AnimatePresence>
        {!completed && (
          <motion.div
            ref={dragHandleRef}
            drag="x"
            dragConstraints={DRAG_CONSTRAINTS}
            dragElastic={0.05}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrag={handleDrag}
            style={{ x: springX }}
            className="absolute -left-1 z-10 flex cursor-grab items-center justify-start active:cursor-grabbing"
          >
            <Button
              type="button"
              disabled={disabled}
              size="icon"
              onClick={(event) => { event.stopPropagation(); handleActivate() }}
              className={cn('rounded-full drop-shadow-xl', isDragging && 'scale-105 transition-transform')}
            >
              <SendHorizontal className="size-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {completed && (
          <motion.div className="absolute inset-0 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button type="button" disabled className="size-full rounded-full transition-all duration-300">
              <AnimatePresence mode="wait">
                <StatusIcon status={status} />
              </AnimatePresence>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
