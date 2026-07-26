import { createContext, useCallback, useState } from 'react'

export const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState('')

  const notify = useCallback((message) => {
    setToast(message)
    setTimeout(() => setToast(''), 1800)
  }, [])

  return <ToastContext.Provider value={{ toast, notify }}>{children}</ToastContext.Provider>
}
