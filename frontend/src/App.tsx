import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from './i18n/config'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import CropAnalysisPage from './pages/CropAnalysisPage'
import AcademyPage from './pages/AcademyPage'
import ToolsPage from './pages/ToolsPage'
import AIPage from './pages/AIPage'

function App() {
  const { t } = useTranslation()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    try {
      const savedTheme = localStorage.getItem('agrovision-theme')
      if (savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'system') {
        return savedTheme
      }
    } catch (error) {
      console.warn('Theme storage unavailable:', error)
    }
    return 'system'
  })

  useEffect(() => {
    const token = localStorage.getItem('agrovision_token')
    setIsAuthenticated(!!token)

    const savedLang = localStorage.getItem('agro_lang') || 'en'
    void i18n.changeLanguage(savedLang)
    setLoading(false)
  }, [])

  useEffect(() => {
    const applyTheme = () => {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const effectiveTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme
      document.documentElement.setAttribute('data-theme', effectiveTheme)
      document.body.setAttribute('data-theme', effectiveTheme)
      localStorage.setItem('agrovision-theme', theme)
    }

    applyTheme()
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => applyTheme()
    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [theme])

  useEffect(() => {
    const isArabic = i18n.language === 'ar'
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
    document.body.dir = isArabic ? 'rtl' : 'ltr'
  }, [i18n.language])

  const toggleTheme = () => {
    setTheme((current) => {
      if (current === 'light') return 'dark'
      if (current === 'dark') return 'system'
      return 'light'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full mx-auto mb-4"></div>
            <p className="text-[var(--text-secondary)] font-medium">{t('ui.loadingApp')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="app-shell flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        {isAuthenticated && <Navbar setIsAuthenticated={setIsAuthenticated} theme={theme} onToggleTheme={toggleTheme} />}
        <main className="app-main flex-1 bg-[var(--bg-primary)]">
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignupPage setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" /> : <ForgotPasswordPage />} />
            <Route path="/reset-password" element={isAuthenticated ? <Navigate to="/dashboard" /> : <ResetPasswordPage />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/crop-analysis" element={<ProtectedRoute><CropAnalysisPage /></ProtectedRoute>} />
            <Route path="/academy" element={<ProtectedRoute><AcademyPage /></ProtectedRoute>} />
            <Route path="/tools" element={<ProtectedRoute><ToolsPage /></ProtectedRoute>} />
            <Route path="/ai-chat" element={<ProtectedRoute><AIPage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
