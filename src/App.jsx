import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import './tailwind.css'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'
import { AuthProvider } from './contexts/AuthContext'
import { QuizProvider } from './contexts/QuizContext'
import { UndercoverProvider } from './contexts/UndercoverContext'
import { FriendsProvider } from './contexts/FriendsContext'
import { RootLayout } from './components/layout/RootLayout'
import { JouerPage } from './pages/Jouer/JouerPage'
import { ProfilPage } from './pages/Profil/ProfilPage'
import { ClassementPage } from './pages/Classement/ClassementPage'
import { DefisPage } from './pages/Defis/DefisPage'
import { UndercoverPage } from './pages/Undercover/UndercoverPage'
import { AmisPage } from './pages/Amis/AmisPage'
import { SmashOrPassPage } from './pages/SmashOrPass/SmashOrPassPage'
import { AdminLayout } from './pages/Admin/AdminLayout'

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <QuizProvider>
            <UndercoverProvider>
              <FriendsProvider>
                <BrowserRouter>
                  <Routes>
                    <Route element={<RootLayout />}>
                      <Route index element={<JouerPage />} />
                      <Route path="profil" element={<ProfilPage />} />
                      <Route path="classement" element={<ClassementPage />} />
                      <Route path="defis" element={<DefisPage />} />
                      <Route path="undercover" element={<UndercoverPage />} />
                      <Route path="amis" element={<AmisPage />} />
                      <Route path="smash-or-pass" element={<SmashOrPassPage />} />
                    </Route>
                    {/* [ADMIN] Route de premier niveau (pas imbriquée dans RootLayout) : interface
                        propre, sans barre XP/niveau ni navigation de jeu. Volontairement absente
                        de la navigation joueur (section 10) — accessible seulement en tapant l'URL. */}
                    <Route path="admin" element={<AdminLayout />} />
                  </Routes>
                </BrowserRouter>
              </FriendsProvider>
            </UndercoverProvider>
          </QuizProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
