// Primitive de bouton réutilisable (remplace la dépendance shadcn/ui absente de ce
// projet). Utilisée notamment comme socle du bouton "glisser pour se connecter".
import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

const variantClasses = {
  primary: 'bg-purple text-white hover:brightness-110',
  ghost: 'bg-transparent text-inherit hover:bg-black/5',
}

const sizeClasses = {
  default: 'h-9 px-4 text-sm',
  icon: 'h-9 w-9 p-0',
}

export const Button = forwardRef(function Button({ className, variant = 'primary', size = 'default', ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
})
