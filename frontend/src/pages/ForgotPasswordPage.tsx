import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Mail, KeyRound, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { apiClient } from '../lib/api'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await apiClient.forgotPassword(email)
      if (response.data.success) {
        setSubmitted(true)
      } else {
        setError(response.data.message || t('errors.serverError'))
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
            <KeyRound className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            {t('auth.resetPassword')}
          </h1>
          <p className="text-[var(--text-secondary)] font-medium">{t('auth.resetPasswordDesc')}</p>
        </div>

        {/* Form Card */}
        <div className="bg-[var(--bg-card)] rounded-2xl shadow-lg p-8 space-y-6 border border-[var(--border-color)] hover:shadow-xl transition-shadow">
          {!submitted ? (
            <>
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-slide-in">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[var(--text-primary)]">
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('ui.placeholderEmail')}
                      className="w-full pl-10 pr-4 py-2 border border-[var(--border-color)] rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                      required
                    />
                  </div>
                </div>

                <p className="text-sm text-[var(--text-secondary)]">
                  {t('ui.resetEmailHelp')}
                </p>

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
                    t('ui.sendResetLink')
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="text-[var(--primary)]" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">{t('ui.emailSent')}</h2>
              <p className="text-[var(--text-secondary)]">
                We've sent a password reset link to <strong>{email}</strong>. Please check your email and click the link to reset your password.
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                {t('ui.spamHint')}
              </p>
            </div>
          )}

          {/* Back to Login Link */}
          <div className="text-center pt-4 border-t border-[var(--border-color)]">
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              {t('ui.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
