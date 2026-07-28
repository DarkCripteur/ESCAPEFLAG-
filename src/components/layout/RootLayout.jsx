import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { GameStatusBar } from './GameStatusBar'
import { AuthOverlay } from './AuthOverlay'
import { GameInviteBanner } from './GameInviteBanner'
import { LevelUpBanner } from './LevelUpBanner'
import { BottomNav } from './BottomNav'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { useToast } from '../../hooks/useToast'

export function RootLayout() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const { toast } = useToast()

  return (
    <main className={`app-shell ${theme === 'dark' ? 'theme-dark' : ''}`}>
      <Header />
      <GameStatusBar />
      {user && <GameInviteBanner />}
      <Outlet />
      <Footer />
      {toast && <div className="toast">{toast}</div>}
      {user && <LevelUpBanner />}
      {user && <BottomNav />}
      {!user && <AuthOverlay />}
    </main>
  )
}
