import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { apiClient } from '../lib/api'
import i18n from '../i18n/config'
import { AlertCircle, ArrowRight, CheckCircle2, Droplets, Eye, EyeOff, Leaf, Loader, Lock, Mail, Moon, Play, ScanLine, ShieldAlert, Sprout, Sun, TrendingUp } from 'lucide-react'

interface LoginPageProps {
  setIsAuthenticated: (value: boolean) => void
}

export default function LoginPage({ setIsAuthenticated }: LoginPageProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (
    document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
  ))

  const changeLanguage = (language: string) => {
    void i18n.changeLanguage(language)
    localStorage.setItem('agro_lang', language)
  }

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
    document.body.setAttribute('data-theme', nextTheme)
    localStorage.setItem('agrovision-theme', nextTheme)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await apiClient.login(email, password)
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

  const insights = [
    { title: 'Disease Detected', value: 'Early Blight', detail: '92% confidence', icon: ScanLine },
    { title: 'Soil Analysis', value: 'pH 6.8', detail: 'N 42 • P 18 • K 36', icon: Sprout },
    { title: 'Yield Prediction', value: '+28%', detail: 'Expected Increase', icon: TrendingUp },
    { title: 'Irrigation Plan', value: 'Optimal', detail: 'Soil Moisture', icon: Droplets },
    { title: 'Pest Risk', value: 'Low Risk', detail: '7 days', icon: ShieldAlert },
  ]

  const renderVisualPanel = (compact = false) => (
    <div className={`relative z-10 h-full text-white ${compact ? 'p-6 sm:p-8' : 'min-h-screen p-8 xl:p-12'}`}>
      <div className="flex items-center gap-3 animate-[fadeIn_0.8s_ease-out]">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400 text-[#07352b] shadow-[0_10px_28px_rgba(16,185,129,0.32)]"><Leaf size={24} strokeWidth={2.5} /></span>
        <div>
          <p className="text-lg font-bold tracking-tight">AgroVision AI</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-100/80">Smarter Agriculture · Brighter Future</p>
        </div>
      </div>

      <div className="mt-5 w-full max-w-[300px] rounded-[14px] border border-white/10 bg-[rgba(5,17,19,0.42)] px-3 py-2 shadow-[0_16px_34px_rgba(0,0,0,0.14)] backdrop-blur-xl">
        <p className="px-1 pb-1 text-[9px] font-bold uppercase tracking-[0.24em] text-emerald-200/80">AI Farm Insights</p>
        <div className="space-y-0">
          {insights.map(({ title, value, detail, icon: Icon }, index) => (
            <div
              key={title}
              className={`flex min-h-[38px] items-center justify-between gap-2 px-1 py-1 ${index < insights.length - 1 ? 'border-b border-white/10' : ''}`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-300/20">
                  <Icon size={13} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-semibold text-white">{title}</p>
                  <p className="truncate text-[9px] text-white/60">{detail}</p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[10px] font-bold text-emerald-300">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative mt-8 max-w-2xl animate-[fadeIn_0.9s_ease-out] lg:absolute lg:bottom-8 lg:left-8 lg:right-auto lg:mt-0 lg:max-w-xl xl:left-12 xl:bottom-12">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200"><CheckCircle2 size={14} />AI-Powered Agriculture</p>
        <h2 className="max-w-xl text-3xl font-bold leading-[1.04] sm:text-4xl xl:text-5xl">{t('landing.hero')}</h2>
        <p className="mt-4 max-w-[560px] text-[15px] leading-[1.6] text-white/82">AgroVision AI uses artificial intelligence to help farmers detect crop diseases, analyze soil, plan irrigation, predict yield, manage pests, and get expert advice — all in one platform.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/signup" className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-xs font-bold text-[#063429] shadow-lg shadow-emerald-950/25 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-300">{t('landing.getStarted')}<ArrowRight size={15} /></Link>
          <button type="button" onClick={() => document.getElementById('login-email')?.focus()} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:bg-white/15"><Play size={13} fill="currentColor" />{t('landing.learnMore')}</button>
        </div>
        <div className="mt-5 hidden flex-wrap gap-x-5 gap-y-2 text-[10px] font-semibold text-white/65 sm:flex"><span>AI Prediction</span><span>Expert Guidance</span><span>Higher Yield</span><span>Sustainable Farming</span></div>
      </div>
    </div>
  )

  return (
    <div className="login-page relative w-full min-h-screen overflow-hidden bg-[#061d1d] text-[var(--text-primary)]">
      <img src="/front.png" alt="Farmer in a field using an AI agriculture app" className="absolute inset-0 h-full w-full object-contain object-center" style={{ width: '100vw', height: '100vh', minHeight: '100vh', objectFit: 'contain', objectPosition: 'center' }} />
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 min-h-screen w-full lg:grid lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-stretch">
        <section className="relative order-2 min-h-[380px] overflow-visible bg-transparent sm:min-h-[440px] lg:order-1 lg:block lg:min-h-screen">{renderVisualPanel(true)}</section>
        <section className="login-section relative order-1 flex min-h-screen w-full flex-col justify-center bg-transparent px-4 py-5 sm:px-6 lg:order-2 lg:px-8 xl:px-12">
          <div className="login-card animate-[slideUp_0.8s_ease-out] mx-auto w-full max-w-[470px] rounded-[18px] border border-[rgba(40,220,170,0.25)] bg-[rgba(3,22,34,0.78)] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.26)] backdrop-blur-[20px] sm:p-7 lg:p-6">
            <div className="mb-6 flex items-center gap-3 sm:mb-7 lg:mb-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-[#07352b] shadow-[0_10px_24px_rgba(16,185,129,0.25)]"><Leaf size={21} /></span>
              <div><p className="font-bold text-white">AgroVision <span className="text-emerald-500">AI</span></p><p className="text-[10px] uppercase tracking-[0.16em] text-emerald-100/80">{t('common.tagline')}</p></div>
            </div>

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-500">{t('auth.login')}</p>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t('dashboard.welcome')}!</h1>
            <p id="login-description" className="mt-3 text-sm leading-6 text-slate-200/90 lg:mt-2">AI-powered crop disease detection, farm intelligence, education, and multilingual support in one platform.</p>

            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200" role="alert">
                <AlertCircle className="mt-0.5 shrink-0" size={18} /><p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} aria-describedby="login-description" className="mt-6 space-y-4 sm:space-y-5 lg:mt-4 lg:space-y-4">
              <div>
                <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-slate-100">{t('auth.email')}</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-300" size={19} style={{ insetInlineStart: '1rem' }} />
                  <input id="login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t('ui.placeholderEmail')} className="w-full rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] py-3.5 text-sm text-white outline-none transition placeholder:text-slate-300/80 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10" style={{ paddingInlineStart: '3rem', paddingInlineEnd: '1rem' }} required />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="mb-2 block text-sm font-semibold text-slate-100">{t('auth.password')}</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-300" size={19} style={{ insetInlineStart: '1rem' }} />
                  <input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] py-3.5 text-sm text-white outline-none transition placeholder:text-slate-300/80 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10" style={{ paddingInlineStart: '3rem', paddingInlineEnd: '3rem' }} required />
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-400" style={{ insetInlineEnd: '1rem' }} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-200">
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 rounded border-[rgba(255,255,255,0.15)] accent-emerald-500" />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="font-semibold text-emerald-400 hover:text-emerald-300">Forgot your password?</Link>
              </div>

              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? <><Loader size={19} className="animate-spin" />{t('common.loading')}</> : t('auth.loginButton')}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs text-slate-300 lg:my-4"><span className="h-px flex-1 bg-[rgba(255,255,255,0.12)]" /><span>Don't have an account?</span><span className="h-px flex-1 bg-[rgba(255,255,255,0.12)]" /></div>
            <Link to="/signup" className="flex w-full items-center justify-center rounded-xl border border-emerald-400/60 bg-[rgba(16,185,129,0.08)] px-5 py-3 text-sm font-bold text-emerald-400 transition duration-300 hover:-translate-y-0.5 hover:bg-[rgba(16,185,129,0.14)]">Create Account</Link>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(255,255,255,0.12)] pt-5 text-xs text-slate-200 lg:mt-4 lg:pt-4">
              <label htmlFor="login-language" className="sr-only">Language</label>
              <div className="flex items-center gap-2"><span aria-hidden="true">🌐</span><select id="login-language" value={i18n.language} onChange={(event) => changeLanguage(event.target.value)} className="bg-transparent font-semibold text-slate-100 outline-none" aria-label="Language">
                <option value="en">English</option><option value="ar">العربية</option><option value="am">አማርኛ</option><option value="om">Afaan Oromo</option><option value="fr">Français</option><option value="es">Español</option>
              </select></div>
              <button type="button" onClick={toggleTheme} className="flex items-center gap-2 rounded-lg px-2 py-1.5 font-semibold text-slate-200 transition hover:bg-[rgba(255,255,255,0.05)]" aria-label={t('ui.toggleTheme')} title={theme === 'dark' ? t('ui.lightMode') : t('ui.darkMode')}><span aria-hidden="true">{theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}</span>{theme === 'dark' ? t('ui.lightMode') : t('ui.darkMode')}</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
