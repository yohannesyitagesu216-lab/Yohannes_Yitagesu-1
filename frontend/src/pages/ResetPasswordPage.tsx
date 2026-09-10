import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Lock, AlertCircle, CheckCircle, Loader, Eye, EyeOff } from 'lucide-react'
import { apiClient } from '../lib/api'

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [invalidToken, setInvalidToken] = useState(false)
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) setInvalidToken(true)
  }, [token])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (!password || !confirmPassword) return setError(t('ui.passwordFieldsRequired'))
    if (password.length < 6) return setError(t('auth.passwordTooShort'))
    if (password !== confirmPassword) return setError(t('ui.passwordMismatch'))
    setLoading(true)
    try {
      const response = await apiClient.resetPassword(token!, password)
      if (response.data.success) {
        setSuccess(true)
        setTimeout(() => navigate('/login'), 2000)
      } else setError(response.data.message || t('errors.serverError'))
    } catch (err: any) {
      const message = err.response?.data?.message || t('errors.serverError')
      setError(message)
      if (message.toLowerCase().includes('invalid') || message.toLowerCase().includes('expired')) setInvalidToken(true)
    } finally {
      setLoading(false)
    }
  }

  if (invalidToken) return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in text-center space-y-4">
        <div className="w-16 h-16 bg-[rgba(239,68,68,0.1)] rounded-full flex items-center justify-center mx-auto"><AlertCircle className="text-red-600" size={32} /></div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">{t('ui.invalidLink')}</h2>
        <p className="text-[var(--text-secondary)]">{t('ui.invalidLinkDesc')}</p>
        <Link to="/forgot-password" className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg">{t('ui.requestNewLink')}</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"><Lock className="text-white" size={32} /></div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">{t('ui.createNewPassword')}</h1>
          <p className="text-[var(--text-secondary)] font-medium">{t('ui.newPasswordHint')}</p>
        </div>
        <div className="bg-[var(--bg-card)] rounded-2xl shadow-lg p-8 space-y-6 border border-[var(--border-color)]">
          {success ? (
            <div className="text-center space-y-4"><CheckCircle className="text-[var(--primary)] mx-auto" size={48} /><h2 className="text-2xl font-bold text-[var(--text-primary)]">{t('ui.passwordReset')}</h2><p className="text-[var(--text-secondary)]">{t('auth.resetPasswordDesc')}</p></div>
          ) : (
            <>
              {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"><AlertCircle className="text-red-600" size={20} /><p className="text-red-800 text-sm">{error}</p></div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block text-sm font-semibold text-[var(--text-primary)]">{t('ui.newPassword')}<div className="relative mt-2"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} /><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t('ui.passwordHint')} className="w-full pl-10 pr-10 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)]" required /><button type="button" aria-label={t('auth.password')} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div></label>
                <label className="block text-sm font-semibold text-[var(--text-primary)]">{t('auth.confirmPassword')}<div className="relative mt-2"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} /><input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder={t('ui.reenterPassword')} className="w-full pl-10 pr-10 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)]" required /><button type="button" aria-label={t('auth.password')} onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div></label>
                <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg disabled:opacity-50">{loading ? <><Loader size={20} className="animate-spin inline mr-2" />{t('common.loading')}</> : t('ui.resetPasswordButton')}</button>
              </form>
              <div className="text-center text-sm text-[var(--text-secondary)]">{t('ui.rememberPassword')} <Link to="/login" className="text-primary-600 font-semibold">{t('ui.loginHere')}</Link></div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
