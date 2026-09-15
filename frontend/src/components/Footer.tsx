import { Mail, Phone, MessageCircle, Leaf, ArrowUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="app-footer border-t border-white/10 bg-[#031522] text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-16">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-cyan-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                <Leaf size={24} />
              </div>
              <div>
                <span className="font-bold text-lg text-[var(--text-primary)]">AgroVision</span>
                <p className="text-xs text-[var(--text-secondary)]">AI</p>
              </div>
            </div>
            <p className="mb-4 max-w-xs text-sm leading-relaxed text-slate-300">Smart agriculture powered by artificial intelligence. Transform your farming with data-driven decisions.</p>
            <div className="flex gap-3">
              <a href="https://t.me/jo572127" target="_blank" rel="noreferrer" aria-label="Chat on Telegram" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-emerald-400 transition-all hover:-translate-y-0.5 hover:bg-emerald-400/10 hover:text-emerald-300">
                <MessageCircle size={18} />
              </a>
              <a href="mailto:yohannesyitagesu216@gmail.com" aria-label="Email AgroVision AI" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-emerald-400 transition-all hover:-translate-y-0.5 hover:bg-emerald-400/10 hover:text-emerald-300">
                <Mail size={18} />
              </a>
              <a href="tel:+251905859811" aria-label="Call AgroVision AI" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-emerald-400 transition-all hover:-translate-y-0.5 hover:bg-emerald-400/10 hover:text-emerald-300">
                <Phone size={18} />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">{t('ui.platform')}</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="/dashboard" className="flex items-center gap-2 text-slate-300 transition-all hover:translate-x-1 hover:text-emerald-300"><span>→</span> {t('nav.dashboard')}</a></li>
              <li><a href="/crop-analysis" className="flex items-center gap-2 text-slate-300 transition-all hover:translate-x-1 hover:text-emerald-300"><span>→</span> {t('nav.cropAnalysis')}</a></li>
              <li><a href="/academy" className="flex items-center gap-2 text-slate-300 transition-all hover:translate-x-1 hover:text-emerald-300"><span>→</span> {t('nav.academy')}</a></li>
              <li><a href="/tools" className="flex items-center gap-2 text-slate-300 transition-all hover:translate-x-1 hover:text-emerald-300"><span>→</span> {t('nav.tools')}</a></li>
              <li><a href="/ai-chat" className="flex items-center gap-2 text-slate-300 transition-all hover:translate-x-1 hover:text-emerald-300"><span>→</span> {t('nav.aiChat')}</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">{t('ui.resources')}</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#docs" className="flex items-center gap-2 text-slate-300 transition-all hover:translate-x-1 hover:text-emerald-300"><span>→</span> {t('ui.documentation')}</a></li>
              <li><a href="#guides" className="flex items-center gap-2 text-slate-300 transition-all hover:translate-x-1 hover:text-emerald-300"><span>→</span> {t('ui.guides')}</a></li>
              <li><a href="#faq" className="flex items-center gap-2 text-slate-300 transition-all hover:translate-x-1 hover:text-emerald-300"><span>→</span> {t('ui.faq')}</a></li>
              <li><a href="#blog" className="flex items-center gap-2 text-slate-300 transition-all hover:translate-x-1 hover:text-emerald-300"><span>→</span> {t('ui.blog')}</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">{t('ui.company')}</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#about" className="flex items-center gap-2 text-slate-300 transition-all hover:translate-x-1 hover:text-emerald-300"><span>→</span> {t('ui.aboutUs')}</a></li>
              <li><a href="#contact" className="flex items-center gap-2 text-slate-300 transition-all hover:translate-x-1 hover:text-emerald-300"><span>→</span> {t('ui.contact')}</a></li>
              <li><a href="#privacy" className="flex items-center gap-2 text-slate-300 transition-all hover:translate-x-1 hover:text-emerald-300"><span>→</span> {t('ui.privacyPolicy')}</a></li>
              <li><a href="#terms" className="flex items-center gap-2 text-slate-300 transition-all hover:translate-x-1 hover:text-emerald-300"><span>→</span> {t('ui.termsOfService')}</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">{t('ui.contact')}</h4>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[var(--text-muted)] text-xs uppercase tracking-wide mb-1">Email</p>
                <a href="mailto:yohannesyitagesu216@gmail.com" className="break-all text-emerald-300 transition-colors hover:text-emerald-200">yohannesyitagesu216@gmail.com</a>
              </div>
              <div>
                <p className="text-[var(--text-muted)] text-xs uppercase tracking-wide mb-1">Phone</p>
                <a href="tel:+251905859811" className="text-emerald-300 transition-colors hover:text-emerald-200">+251 90 585 9811</a>
              </div>
              <div>
                <p className="text-[var(--text-muted)] text-xs uppercase tracking-wide mb-1">Telegram</p>
                <a href="https://t.me/jo572127" target="_blank" rel="noreferrer" className="text-emerald-300 transition-colors hover:text-emerald-200">@jo572127</a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border-color)]"></div>

        {/* Bottom Footer */}
        <div className="py-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">
              &copy; {new Date().getFullYear()} <span className="font-semibold text-[var(--text-primary)]">AgroVision AI</span> · Smart Agriculture Platform
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-2">Created by <span className="text-[var(--text-secondary)] font-medium">Yohannes</span></p>
          </div>
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-400/10 hover:text-emerald-300"
          >
            {t('ui.backToTop')}
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  )
}
