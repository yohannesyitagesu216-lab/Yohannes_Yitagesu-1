import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { apiClient } from '../lib/api'
import { User, Mail, Lock, Leaf, AlertCircle, Loader, Eye, EyeOff, ArrowRight, CheckCircle2, Droplets, Play, ScanLine, ShieldAlert, Sprout, TrendingUp } from 'lucide-react'

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

  const insights = [
    { title: 'Disease Detected', value: 'Early Blight', detail: '92% confidence', icon: ScanLine },
    { title: 'Soil Analysis', value: 'pH 6.8', detail: 'N 42 • P 18 • K 36', icon: Sprout },
    { title: 'Yield Prediction', value: '+28%', detail: 'Expected Increase', icon: TrendingUp },
    { title: 'Irrigation Plan', value: 'Optimal', detail: 'Soil Moisture', icon: Droplets },
    { title: 'Pest Risk', value: 'Low Risk', detail: '7 days', icon: ShieldAlert },
  ]

  return (
    <div className="signup-page relative w-full min-h-screen overflow-hidden bg-[#061d1d] text-white">
      <img src="/front.png" alt="Farmer in a field using an AI agriculture app" className="signup-background absolute inset-0 h-full w-full object-cover object-center" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(3,20,18,0.88)_0%,rgba(3,35,26,0.42)_46%,rgba(3,16,15,0.90)_100%)]" />

      <div className="relative z-10 min-h-screen w-full lg:grid lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-stretch">
        <section className="relative order-2 min-h-[700px] overflow-visible p-6 sm:min-h-[720px] sm:p-8 lg:order-1 lg:min-h-screen lg:p-8 xl:p-12">
          <div className="flex items-center gap-3 animate-[fadeIn_0.8s_ease-out]">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400 text-[#07352b] shadow-[0_10px_28px_rgba(16,185,129,0.32)]"><Leaf size={24} strokeWidth={2.5} /></span>
            <div><p className="text-lg font-bold tracking-tight">AgroVision AI</p><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-100/80">Smarter Agriculture · Brighter Future</p></div>
          </div>

          <div className="mt-5 w-full max-w-[300px] rounded-[14px] border border-white/10 bg-[rgba(5,17,19,0.42)] px-3 py-2 shadow-[0_16px_34px_rgba(0,0,0,0.14)] backdrop-blur-xl">
            <p className="px-1 pb-1 text-[9px] font-bold uppercase tracking-[0.24em] text-emerald-200/80">AI Farm Insights</p>
            {insights.map(({ title, value, detail, icon: Icon }, index) => (
              <div key={title} className={`flex min-h-[38px] items-center justify-between gap-2 px-1 py-1 ${index < insights.length - 1 ? 'border-b border-white/10' : ''}`}>
                <div className="flex min-w-0 items-center gap-2"><span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-300/20"><Icon size={13} /></span><div className="min-w-0"><p className="truncate text-[10px] font-semibold text-white">{title}</p><p className="truncate text-[9px] text-white/60">{detail}</p></div></div>
                <p className="shrink-0 text-right text-[10px] font-bold text-emerald-300">{value}</p>
              </div>
            ))}
          </div>

          <div className="relative mt-8 max-w-2xl animate-[fadeIn_0.9s_ease-out] lg:absolute lg:bottom-8 lg:left-8 lg:right-auto lg:mt-0 lg:max-w-xl xl:left-12 xl:bottom-12">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200"><CheckCircle2 size={14} />AI-Powered Agriculture</p>
            <h1 className="max-w-xl text-3xl font-bold leading-[1.04] sm:text-4xl xl:text-5xl">Grow Smarter.<br />Farm Better.<br /><span className="text-emerald-400">Harvest More.</span></h1>
            <p className="mt-4 max-w-[560px] text-[15px] leading-[1.6] text-white/82">AgroVision AI uses artificial intelligence to help farmers detect crop diseases, analyze soil, plan irrigation, predict yield, manage pests, and get expert advice — all in one platform.</p>
            <div className="mt-5 flex flex-wrap gap-3"><Link to="/signup" className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-xs font-bold text-[#063429] shadow-lg shadow-emerald-950/25 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-300">Create Account<ArrowRight size={15} /></Link><button type="button" onClick={() => document.getElementById('signup-name')?.focus()} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:bg-white/15"><Play size={13} fill="currentColor" />Learn More</button></div>
            <div className="mt-5 hidden flex-wrap gap-x-5 gap-y-2 text-[10px] font-semibold text-white/65 sm:flex"><span>AI Prediction</span><span>Expert Guidance</span><span>Higher Yield</span><span>Sustainable Farming</span></div>
          </div>
        </section>

        <section className="relative order-1 flex min-h-screen w-full flex-col justify-center bg-transparent px-4 py-5 sm:px-6 lg:order-2 lg:px-8 lg:py-0 xl:px-12">
          <div className="signup-card mx-auto w-full max-w-[480px] rounded-[18px] border border-[rgba(30,220,170,0.28)] bg-[rgba(3,22,34,0.78)] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-[20px] sm:p-7 lg:p-6 2xl:p-8">
            <div className="mb-6 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-[#07352b] shadow-[0_10px_24px_rgba(16,185,129,0.25)]"><Leaf size={21} /></span><div><p className="font-bold text-white">AgroVision <span className="text-emerald-500">AI</span></p><p className="text-[10px] uppercase tracking-[0.16em] text-emerald-100/80">{t('common.tagline')}</p></div></div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Create Account</p>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Join AgroVision AI</h2>
            <p className="mt-3 text-sm leading-6 text-slate-200/90">Create your account and start farming smarter.</p>

            {error && <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200" role="alert"><AlertCircle className="mt-0.5 shrink-0" size={18} /><p className="text-sm">{error}</p></div>}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div><label htmlFor="signup-name" className="mb-2 block text-sm font-semibold text-slate-100">Full Name</label><div className="relative"><User className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-300" size={19} style={{ insetInlineStart: '1rem' }} /><input id="signup-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full rounded-xl border border-white/12 bg-white/5 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-300/80 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10" style={{ paddingInlineStart: '3rem', paddingInlineEnd: '1rem' }} required /></div></div>
              <div><label htmlFor="signup-email" className="mb-2 block text-sm font-semibold text-slate-100">Email Address</label><div className="relative"><Mail className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-300" size={19} style={{ insetInlineStart: '1rem' }} /><input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-white/12 bg-white/5 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-300/80 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10" style={{ paddingInlineStart: '3rem', paddingInlineEnd: '1rem' }} required /></div></div>
              <div><label htmlFor="signup-password" className="mb-2 block text-sm font-semibold text-slate-100">Password</label><div className="relative"><Lock className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-300" size={19} style={{ insetInlineStart: '1rem' }} /><input id="signup-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a strong password" className="w-full rounded-xl border border-white/12 bg-white/5 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-300/80 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10" style={{ paddingInlineStart: '3rem', paddingInlineEnd: '3rem' }} required /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((prev) => !prev)} className="absolute top-1/2 -translate-y-1/2 text-slate-300 transition-colors hover:text-emerald-400" style={{ insetInlineEnd: '1rem' }}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></div>
              <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-200"><input type="checkbox" className="mt-1 h-4 w-4 accent-emerald-500" required /><span>I agree to the <a href="#terms" className="font-semibold text-emerald-400 hover:text-emerald-300">Terms of Service</a> and <a href="#privacy" className="font-semibold text-emerald-400 hover:text-emerald-300">Privacy Policy</a></span></label>
              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60">{loading ? <><Loader size={19} className="animate-spin" />{t('common.loading')}</> : 'Create Account'}</button>
            </form>

            <div className="mt-6 border-t border-white/10 pt-5 text-center"><p className="text-sm text-slate-300">Already have an account?</p><Link to="/login" className="mt-2 inline-block font-semibold text-emerald-400 transition-colors hover:text-emerald-300">Sign In</Link></div>
          </div>
        </section>
      </div>
    </div>
  )
}
