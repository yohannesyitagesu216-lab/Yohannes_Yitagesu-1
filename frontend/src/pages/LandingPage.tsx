import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, Wheat, Rocket, Zap, BookOpen, Wrench, ArrowRight, Check } from 'lucide-react'

interface LandingPageProps {
  setIsAuthenticated: (value: boolean) => void
}

export default function LandingPage(_props: LandingPageProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const handleQuickStart = () => {
    navigate('/login')
  }

  const features = [
    {
      icon: Zap,
      title: t('landing.featureAI'),
      description: t('landing.featureAIDesc'),
    },
    {
      icon: Leaf,
      title: t('landing.featureAnalytics'),
      description: t('landing.featureAnalyticsDesc'),
    },
    {
      icon: BookOpen,
      title: t('landing.featureEducation'),
      description: t('landing.featureEducationDesc'),
    },
    {
      icon: Wrench,
      title: t('landing.featureTools'),
      description: t('landing.featureToolsDesc'),
    },
  ]

  return (
    <div className="bg-[var(--bg-primary)]">
      <div className="flex justify-end max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <label className="sr-only" htmlFor="public-language">Language</label>
        <select
          id="public-language"
          value={['en', 'am', 'om', 'fr', 'ar', 'es'].includes(i18n.language) ? i18n.language : 'en'}
          onChange={(event) => {
            const language = ['en', 'am', 'om', 'fr', 'ar', 'es'].includes(event.target.value) ? event.target.value : 'en'
            void i18n.changeLanguage(language)
            localStorage.setItem('agro_lang', language)
          }}
          className="px-3 py-2 border border-[var(--border-color)] rounded-lg text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-secondary)]"
        >
          <option value="en">English</option>
          <option value="am">አማርኛ</option>
          <option value="om">Afaan Oromo</option>
          <option value="fr">Français</option>
          <option value="ar">العربية</option>
          <option value="es">Español</option>
        </select>
      </div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-blue-50 to-[var(--bg-primary)] dark:from-primary-900/20 dark:via-blue-900/10 dark:to-[var(--bg-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] leading-tight mb-6">
                {t('landing.hero')}
              </h1>
              <p className="text-xl text-[var(--text-secondary)] mb-8">
                {t('landing.heroDesc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleQuickStart}
                  className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {t('landing.getStarted')}
                  <ArrowRight size={20} />
                </button>
                <Link
                  to="/login"
                  className="px-8 py-3 border-2 border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-all duration-300"
                >
                  {t('auth.login')}
                </Link>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="relative h-96 animate-slide-in">
              <div className="absolute inset-0 bg-gradient-to-t from-primary-200/20 to-transparent rounded-3xl"></div>
              <div className="absolute top-10 right-10 w-24 h-24 bg-primary-100 rounded-full opacity-60 animate-pulse-soft"></div>
              <div className="absolute bottom-20 left-10 w-32 h-32 bg-blue-100 rounded-full opacity-60 animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
              <div className="relative flex items-center justify-center h-full">
                <Wheat size={96} className="text-primary-600" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32 bg-[var(--bg-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
              {t('landing.features')}
            </h2>
            <p className="text-xl text-[var(--text-secondary)]">
              {t('ui.smartAgriculture')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="p-6 bg-[var(--bg-card)] rounded-2xl hover:shadow-lg hover:bg-[var(--bg-secondary)] transition-all duration-300 transform hover:scale-105 animate-fade-in border border-[var(--border-color)]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mb-4">
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--text-secondary)]">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 sm:py-32 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Rocket size={96} className="text-[var(--primary)]" strokeWidth={1.5} />
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-6">
                {t('ui.whyAgroVision')}
              </h2>
              <ul className="space-y-4">
                {[
                  t('ui.benefitDetection'),
                  t('ui.benefitAnalytics'),
                  t('ui.benefitLanguages'),
                  t('ui.benefitEducation'),
                  t('ui.benefitTools'),
                  t('ui.benefitAssistant'),
                ].map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3 text-lg text-[var(--text-secondary)]">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={16} className="text-white" />
                    </div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-[var(--bg-primary)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-6">
            {t('ui.readyFarm')}
          </h2>
          <p className="text-xl text-[var(--text-secondary)] mb-8">
            {t('ui.joinFarmers')}
          </p>
          <button
            onClick={handleQuickStart}
            className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
          >
            {t('landing.getStarted')}
            <ArrowRight size={24} />
          </button>
        </div>
      </section>
    </div>
  )
}
