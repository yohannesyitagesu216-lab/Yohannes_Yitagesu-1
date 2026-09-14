import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Bell, BookOpen, Bot, Camera, ChevronDown, LayoutDashboard, Leaf, LogOut, Menu, Moon, Search, Settings, Sun, Wrench, X } from 'lucide-react'
import { apiClient } from '../lib/api'

interface NavbarProps {
  setIsAuthenticated: (value: boolean) => void
  theme: 'light' | 'dark' | 'system'
  onToggleTheme: () => void
}

export default function Navbar({ setIsAuthenticated, theme, onToggleTheme }: NavbarProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    let active = true
    void apiClient.getProfile().then((response) => {
      if (active && response?.success && response.data?.name) setUserName(response.data.name)
    }).catch(() => undefined)
    return () => { active = false }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('agrovision_token')
    setIsAuthenticated(false)
    navigate('/login')
  }

  const handleLanguageChange = (lang: string) => {
    const normalizedLang = ['en', 'am', 'om', 'fr', 'ar', 'es'].includes(lang) ? lang : 'en'
    void i18n.changeLanguage(normalizedLang)
    localStorage.setItem('agro_lang', normalizedLang)
  }

  const navigation = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/crop-analysis', label: t('nav.cropAnalysis'), icon: Camera },
    { to: '/academy', label: t('nav.academy'), icon: BookOpen },
    { to: '/tools', label: t('nav.tools'), icon: Wrench },
    { to: '/ai-chat', label: t('nav.aiChat'), icon: Bot },
  ]

  const renderNavigation = (mobile = false) => navigation.map(({ to, label, icon: Icon }) => (
    <Link
      key={to}
      to={to}
      onClick={() => setIsMenuOpen(false)}
      className={`${mobile ? 'flex' : 'hidden lg:flex'} group items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
        location.pathname === to
          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.22)]'
          : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
      }`}
    >
      <Icon size={18} strokeWidth={1.8} />
      <span>{label}</span>
    </Link>
  ))

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[244px] flex-col border-r border-white/10 bg-[#061426] px-4 py-5 lg:flex">
        <Link to="/dashboard" className="mb-10 flex items-center gap-3 px-3" aria-label="AgroVision dashboard">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-[0_10px_24px_rgba(16,185,129,0.3)]">
            <Leaf size={23} />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-white">AgroVision <span className="text-emerald-400">AI</span></span>
        </Link>

        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Workspace</p>
        <nav className="space-y-1">{renderNavigation()}</nav>

        <div className="mt-auto space-y-1">
          <Link to="/tools" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
            <Settings size={18} strokeWidth={1.8} />
            <span>{t('common.settings')}</span>
          </Link>
          <button type="button" onClick={handleLogout} aria-label={t('common.logout')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
            <LogOut size={18} strokeWidth={1.8} />
            <span>{t('common.logout')}</span>
          </button>
          <div className="mt-4 rounded-2xl border border-emerald-400/15 bg-gradient-to-br from-emerald-400/15 to-cyan-400/5 p-4">
            <p className="text-xs font-semibold text-emerald-300">{t('ui.smartAgriculture')}</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">Field intelligence for stronger harvests.</p>
          </div>
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-40 border-b border-[var(--border-color)] bg-[color-mix(in_srgb,var(--bg-primary)_86%,transparent)] backdrop-blur-xl lg:left-[244px]">
        <div className="flex h-[76px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white"><Leaf size={20} /></span>
            <span className="font-extrabold tracking-tight text-[var(--text-primary)]">AgroVision <span className="text-emerald-500">AI</span></span>
          </Link>

          <label className="hidden max-w-md flex-1 items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3.5 py-2.5 md:flex lg:max-w-lg">
            <Search size={18} className="text-[var(--text-muted)]" />
            <input aria-label="Search AgroVision" placeholder="Search crops, diseases, or topics..." className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]" />
          </label>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button type="button" aria-label="Notifications" className="relative hidden h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition-colors hover:text-[var(--primary)] sm:inline-flex">
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </button>
            <button type="button" aria-label={t('ui.toggleTheme')} title={theme === 'dark' ? t('ui.lightMode') : t('ui.darkMode')} onClick={onToggleTheme} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition-colors hover:text-[var(--primary)]">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <select aria-label="Language" value={['en', 'am', 'om', 'fr', 'ar', 'es'].includes(i18n.language) ? i18n.language : 'en'} onChange={(e) => handleLanguageChange(e.target.value)} className="hidden h-10 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-2 text-sm font-semibold text-[var(--text-primary)] outline-none sm:block">
              <option value="en">EN</option><option value="am">አማ</option><option value="om">OM</option><option value="fr">FR</option><option value="ar">عربي</option><option value="es">ES</option>
            </select>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-sm font-extrabold text-white">{userName.charAt(0).toUpperCase() || 'A'}</span>
              <div className="hidden xl:block"><p className="text-sm font-bold text-[var(--text-primary)]">{userName || 'AgroVision user'}</p><p className="text-[11px] text-[var(--text-muted)]">Farm manager</p></div>
              <ChevronDown size={15} className="text-[var(--text-muted)]" />
            </div>
            <button type="button" onClick={() => setIsMenuOpen((open) => !open)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] lg:hidden" aria-label="Open navigation menu">
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {isMenuOpen && <div className="border-t border-[var(--border-color)] bg-[var(--bg-primary)] p-4 lg:hidden animate-slide-in"><div className="mb-3 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Language</span><select aria-label="Mobile language" value={['en', 'am', 'om', 'fr', 'ar', 'es'].includes(i18n.language) ? i18n.language : 'en'} onChange={(e) => handleLanguageChange(e.target.value)} className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1.5 text-sm font-semibold text-[var(--text-primary)] outline-none"><option value="en">English</option><option value="am">አማርኛ</option><option value="om">Afaan Oromo</option><option value="fr">Français</option><option value="ar">العربية</option><option value="es">Español</option></select></div><nav className="space-y-1">{renderNavigation(true)}</nav><button type="button" onClick={handleLogout} className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"><LogOut size={18} />{t('common.logout')}</button></div>}
      </header>
    </>
  )
}
