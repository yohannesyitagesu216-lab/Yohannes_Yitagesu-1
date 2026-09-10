import { Mail, Phone, MessageCircle, Leaf, ArrowUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="app-footer bg-[var(--bg-footer)] text-[var(--text-muted)] border-t border-[var(--border-color)]">
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
            <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">{t('ui.smartAgriculture')}</p>
            <div className="flex gap-3">
              <a href="https://t.me/jo572127" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:text-[var(--primary)] hover:bg-[var(--bg-primary)] transition-all">
                <MessageCircle size={18} />
              </a>
              <a href="mailto:yohannesyitagesu216@gmail.com" className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:text-[var(--primary)] hover:bg-[var(--bg-primary)] transition-all">
                <Mail size={18} />
              </a>
              <a href="tel:+251905859811" className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:text-[var(--primary)] hover:bg-[var(--bg-primary)] transition-all">
                <Phone size={18} />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-4 text-sm uppercase tracking-wide">{t('ui.platform')}</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="/dashboard" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors flex items-center gap-2"><span>→</span> {t('nav.dashboard')}</a></li>
              <li><a href="/crop-analysis" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors flex items-center gap-2"><span>→</span> {t('nav.cropAnalysis')}</a></li>
              <li><a href="/academy" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors flex items-center gap-2"><span>→</span> {t('nav.academy')}</a></li>
              <li><a href="/tools" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors flex items-center gap-2"><span>→</span> {t('nav.tools')}</a></li>
              <li><a href="/ai-chat" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors flex items-center gap-2"><span>→</span> {t('nav.aiChat')}</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-4 text-sm uppercase tracking-wide">{t('ui.resources')}</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#docs" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors flex items-center gap-2"><span>→</span> {t('ui.documentation')}</a></li>
              <li><a href="#guides" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors flex items-center gap-2"><span>→</span> {t('ui.guides')}</a></li>
              <li><a href="#faq" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors flex items-center gap-2"><span>→</span> {t('ui.faq')}</a></li>
              <li><a href="#blog" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors flex items-center gap-2"><span>→</span> {t('ui.blog')}</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-4 text-sm uppercase tracking-wide">{t('ui.company')}</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#about" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors flex items-center gap-2"><span>→</span> {t('ui.aboutUs')}</a></li>
              <li><a href="#contact" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors flex items-center gap-2"><span>→</span> {t('ui.contact')}</a></li>
              <li><a href="#privacy" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors flex items-center gap-2"><span>→</span> {t('ui.privacyPolicy')}</a></li>
              <li><a href="#terms" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors flex items-center gap-2"><span>→</span> {t('ui.termsOfService')}</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-4 text-sm uppercase tracking-wide">{t('ui.contact')}</h4>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[var(--text-muted)] text-xs uppercase tracking-wide mb-1">Email</p>
                <a href="mailto:yohannesyitagesu216@gmail.com" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors break-all">yohannesyitagesu216@gmail.com</a>
              </div>
              <div>
                <p className="text-[var(--text-muted)] text-xs uppercase tracking-wide mb-1">Phone</p>
                <a href="tel:+251905859811" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">+251 90 585 9811</a>
              </div>
              <div>
                <p className="text-[var(--text-muted)] text-xs uppercase tracking-wide mb-1">Telegram</p>
                <a href="https://t.me/jo572127" target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">@jo572127</a>
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)] hover:text-[var(--primary)] transition-all"
          >
            {t('ui.backToTop')}
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  )
}
