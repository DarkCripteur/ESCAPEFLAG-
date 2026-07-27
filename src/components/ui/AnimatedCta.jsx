// Bouton animé générique (section 5 du cahier des charges), utilisé comme bouton
// "Créer un compte". Mise à jour demandée : l'icône reste à gauche tant que le
// formulaire est en cours de remplissage, puis glisse vers la droite au clic avec
// une transition fluide, en passant par des états chargement/succès/erreur qui
// reflètent la vraie promesse renvoyée par `onConfirm` (comme SlideToLogin) — plutôt
// qu'un survol purement décoratif. Le style au clavier/hover d'origine est conservé.
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { Check, Loader2, X } from 'lucide-react'
import { useCallback, useState } from 'react'

function DotGridIcon() {
  return (
    <svg width={16} height={19} viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="1.61321" cy="1.61321" r="1.5" fill="black" />
      <circle cx="5.73583" cy="1.61321" r="1.5" fill="black" />
      <circle cx="5.73583" cy="5.5566" r="1.5" fill="black" />
      <circle cx="9.85851" cy="5.5566" r="1.5" fill="black" />
      <circle cx="9.85851" cy="9.5" r="1.5" fill="black" />
      <circle cx="13.9811" cy="9.5" r="1.5" fill="black" />
      <circle cx="5.73583" cy="13.4434" r="1.5" fill="black" />
      <circle cx="9.85851" cy="13.4434" r="1.5" fill="black" />
      <circle cx="1.61321" cy="17.3868" r="1.5" fill="black" />
      <circle cx="5.73583" cy="17.3868" r="1.5" fill="black" />
    </svg>
  )
}

function StatusIcon({ status }) {
  if (status === 'loading') return <Loader2 className="animate-spin" size={16} color="#1d2129" />
  if (status === 'success') return <Check size={16} color="#1d2129" />
  if (status === 'error') return <X size={16} color="#1d2129" />
  return <DotGridIcon />
}

/**
 * @param {{ onConfirm?: () => Promise<void>, children?: import('react').ReactNode, type?: string, disabled?: boolean }} props
 */
export function AnimatedCta({ children = 'C’est parti !', type = 'button', disabled = false, onConfirm, ...props }) {
  const [status, setStatus] = useState('idle')
  const busy = status === 'loading' || status === 'success'

  const handleClick = useCallback(
    async (event) => {
      if (disabled || busy) return
      if (onConfirm) {
        // Le bouton pilote lui-même l'appel plutôt que de laisser le <form> natif
        // soumettre : c'est ce qui permet d'afficher chargement/succès/erreur dessus.
        event.preventDefault()
        setStatus('loading')
        try {
          await onConfirm()
          setStatus('success')
        } catch {
          setStatus('error')
          setTimeout(() => setStatus('idle'), 1200)
        }
      }
      props.onClick?.(event)
    },
    [disabled, busy, onConfirm, props]
  )

  return (
    <StyledWrapper>
      <button type={onConfirm ? 'button' : type} className="Btn-Container" disabled={disabled || busy} onClick={handleClick}>
        {status === 'idle' ? (
          <>
            <motion.span layout className="icon-Container" key="icon"><StatusIcon status={status} /></motion.span>
            <motion.span layout className="text" key="text">{children}</motion.span>
          </>
        ) : (
          <>
            <motion.span layout className="text" key="text">{children}</motion.span>
            <motion.span layout className="icon-Container" key="icon"><StatusIcon status={status} /></motion.span>
          </>
        )}
      </button>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  /* [MOBILE] Largeur fixe à 170px d'origine : trop étroite pour "Créer mon compte",
     le texte se coupait en deux lignes dans le rond de 125px qui lui restait (visible
     sur mobile réel). La largeur s'adapte maintenant au contenu (min-width conservée
     pour l'esthétique du bouton), et le texte ne passe plus jamais à la ligne. */
  display: inline-flex;
  max-width: 100%;

  .Btn-Container {
    display: flex;
    width: auto;
    min-width: 170px;
    max-width: 100%;
    height: fit-content;
    background-color: #1d2129;
    border-radius: 40px;
    box-shadow: 0px 5px 10px #bebebe;
    justify-content: space-between;
    align-items: center;
    border: none;
    cursor: pointer;
  }
  .Btn-Container:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
  .icon-Container {
    width: 45px;
    height: 45px;
    background-color: #f59aff;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 3px solid #1d2129;
    flex-shrink: 0;
  }
  .text {
    flex: 1 1 auto;
    min-width: 0;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1em;
    letter-spacing: 0.6px;
    white-space: nowrap;
    padding: 0 16px;
  }
  .icon-Container svg {
    transition-duration: 1.5s;
  }
  .Btn-Container:hover:not(:disabled) .icon-Container svg {
    transition-duration: 1.5s;
    animation: arrow 1s linear infinite;
  }
  @keyframes arrow {
    0% {
      opacity: 0;
      margin-left: 0px;
    }
    100% {
      opacity: 1;
      margin-left: 10px;
    }
  }
`
