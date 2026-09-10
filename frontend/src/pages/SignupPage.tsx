import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { apiClient } from '../lib/api'
import { User, Mail, Lock, Leaf, AlertCircle, Loader, Eye, EyeOff } from 'lucide-react'

interface SignupPageProps {
  setIsAuthenticated: (value: boolean) => void
}

export default function SignupPage({ setIsAuthenticated }: SignupPageProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError(t('auth.passwordTooShort'))
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.register(name, email, password)
      if (response.success) {
        localStorage.setItem('agrovision_token', response.data.token)
        setIsAuthenticated(true)
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('errors.serverError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Leaf className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">{t('ui.joinAgroVision')}</h1>
          <p className="text-[var(--text-secondary)] font-medium">{t('auth.signup')}</p>
        </div>

        {/* Form Card */}
        <div className="bg-[var(--bg-card)] rounded-2xl shadow-lg p-8 space-y-6 border border-[var(--border-color)] hover:shadow-xl transition-shadow">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-slide-in">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="signup-name" className="block text-sm font-semibold text-[var(--text-primary)]">
                {t('auth.fullName')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" size={20} />
                <input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('ui.placeholderName')}
                  className="w-full pl-10 pr-4 py-2 border border-[var(--border-color)] rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="signup-email" className="block text-sm font-semibold text-[var(--text-primary)]">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" size={20} />
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('ui.placeholderEmail')}
                  className="w-full pl-10 pr-4 py-2 border border-[var(--border-color)] rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="signup-password" className="block text-sm font-semibold text-[var(--text-primary)]">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" size={20} />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-2 border border-[var(--border-color)] rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 text-sm text-[var(--text-primary)] cursor-pointer">
              <input type="checkbox" className="mt-1" required />
              <span>{t('ui.agreeTerms')}</span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                t('auth.signupButton')
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-4 border-t border-[var(--border-color)]">
            <p className="text-[var(--text-secondary)] text-sm mb-2">
              {t('auth.haveAccount')}
            </p>
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              {t('auth.login')}
            </Link>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-gray-600 text-sm mt-6">
          {t('common.appName')} - {t('common.tagline')}
        </p>
      </div>
    </div>
  )
}
