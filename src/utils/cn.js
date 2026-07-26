// Fusionne des classes CSS conditionnelles (équivalent minimal de clsx, sans dépendance
// supplémentaire : le projet n'a pas besoin de la déduplication de tailwind-merge).
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
