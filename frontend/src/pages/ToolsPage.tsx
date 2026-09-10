import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Beaker, Droplet, BarChart3, Bug, Sparkles } from 'lucide-react'

export default function ToolsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('soil')

  const SoilAnalyzer = () => {
    const [results, setResults] = useState<any>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [soilData, setSoilData] = useState({ ph: '', nitrogen: '', phosphorus: '', potassium: '', moisture: '' })

    const handleAnalyze = async () => {
      setIsAnalyzing(true)
      const score =
        (parseFloat(soilData.ph) >= 5.5 && parseFloat(soilData.ph) <= 7.5 ? 25 : 0) +
        (parseFloat(soilData.nitrogen) >= 40 ? 25 : 0) +
        (parseFloat(soilData.phosphorus) >= 30 ? 20 : 0) +
        (parseFloat(soilData.potassium) >= 30 ? 20 : 0) +
        (parseFloat(soilData.moisture) >= 30 && parseFloat(soilData.moisture) <= 70 ? 10 : 0)

      setTimeout(() => {
        setResults({
          score,
          status: score >= 80 ? 'Good' : 'Needs attention',
          recommendation: 'Use laboratory soil testing before fertilizer decisions.',
        })
        setIsAnalyzing(false)
      }, 250)
    }

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { label: t('tools.pH'), key: 'ph', placeholder: '6.5' },
            { label: t('tools.nitrogen'), key: 'nitrogen', placeholder: '50' },
            { label: t('tools.phosphorus'), key: 'phosphorus', placeholder: '40' },
            { label: t('tools.potassium'), key: 'potassium', placeholder: '35' },
          ].map((field) => (
            <div key={field.key} className="space-y-2">
              <label htmlFor={`soil-${field.key}`} className="block text-sm font-semibold text-[var(--text-primary)]">{field.label}</label>
              <input
                id={`soil-${field.key}`}
                type="number"
                placeholder={field.placeholder}
                value={(soilData as any)[field.key]}
                onChange={(e) => setSoilData({ ...soilData, [field.key]: e.target.value })}
                className="h-11 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3.5 text-[var(--text-primary)] shadow-sm transition-all placeholder:text-[var(--text-muted)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          ))}

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="soil-moisture" className="block text-sm font-semibold text-[var(--text-primary)]">{t('tools.moisture')}%</label>
            <input
              id="soil-moisture"
              type="number"
              placeholder="65"
              value={soilData.moisture}
              onChange={(e) => setSoilData({ ...soilData, moisture: e.target.value })}
              className="h-11 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3.5 text-[var(--text-primary)] shadow-sm transition-all placeholder:text-[var(--text-muted)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(14,165,233,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(14,165,233,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isAnalyzing ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              {t('common.loading')}
            </span>
          ) : (
            t('tools.analyze')
          )}
        </button>

        {results && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
              <p className="text-sm font-medium text-[var(--text-secondary)]">{t('ui.soilScore')}</p>
              <p className="mt-2 text-4xl font-bold tracking-tight text-[var(--text-primary)]">{results.score}/100</p>
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-3 rounded-full bg-gradient-to-r from-sky-500 to-cyan-600" style={{ width: `${results.score}%` }}></div>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
              <p className="text-lg font-semibold text-[var(--text-primary)]">{results.status}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{results.recommendation}</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  const IrrigationPlanner = () => {
    const [result, setResult] = useState<string | null>(null)
    return <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="irrigation-soil-moisture" className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">{t('ui.soilMoistureInput')}</label>
          <input id="irrigation-soil-moisture" type="number" placeholder="35" className="h-11 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3.5 text-[var(--text-primary)] shadow-sm transition-all placeholder:text-[var(--text-muted)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
        </div>
        <div>
          <label htmlFor="irrigation-rainfall" className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">{t('ui.rainfallForecast')}</label>
          <input id="irrigation-rainfall" type="number" placeholder="10" className="h-11 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3.5 text-[var(--text-primary)] shadow-sm transition-all placeholder:text-[var(--text-muted)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
        </div>
      </div>
      <button onClick={() => setResult('Irrigation is recommended within the next 24 hours.')} className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(14,165,233,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(14,165,233,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)]">
        {t('ui.getRecommendation')}
      </button>
      {result && <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 text-sm leading-6 text-[var(--text-secondary)] animate-fade-in">{t('ui.irrigationRecommended')}</div>}
    </div>
  }

  const YieldPredictor = () => {
    const [result, setResult] = useState<number | null>(null)
    return <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="yield-crop" className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">{t('ui.crop')}</label>
          <select id="yield-crop" className="h-11 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3.5 text-[var(--text-primary)] shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
            <option>Maize</option>
            <option>Wheat</option>
            <option>Tomato</option>
          </select>
        </div>
        <div>
          <label htmlFor="yield-farm-area" className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">{t('ui.farmArea')}</label>
          <input id="yield-farm-area" type="number" placeholder="2.5" className="h-11 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3.5 text-[var(--text-primary)] shadow-sm transition-all placeholder:text-[var(--text-muted)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
        </div>
      </div>
      <button onClick={() => setResult(3.8)} className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(14,165,233,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(14,165,233,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)]">
        {t('ui.predictYield')}
      </button>
      {result !== null && <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 text-sm leading-6 text-[var(--text-secondary)] animate-fade-in">{t('ui.estimatedYield', { value: result })}</div>}
    </div>
  }

  const PestAssessment = () => {
    const [result, setResult] = useState<string | null>(null)
    return <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="pest-temperature" className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">{t('ui.temperatureC')}</label>
          <input id="pest-temperature" type="number" placeholder="24" className="h-11 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3.5 text-[var(--text-primary)] shadow-sm transition-all placeholder:text-[var(--text-muted)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
        </div>
        <div>
          <label htmlFor="pest-humidity" className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">{t('ui.humidity')} %</label>
          <input id="pest-humidity" type="number" placeholder="65" className="h-11 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3.5 text-[var(--text-primary)] shadow-sm transition-all placeholder:text-[var(--text-muted)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
        </div>
      </div>
      <button onClick={() => setResult('Moderate risk. Inspect leaves weekly and use integrated pest management if pressure increases.')} className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(14,165,233,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(14,165,233,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)]">
        {t('ui.assessPestRisk')}
      </button>
      {result && <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 text-sm leading-6 text-[var(--text-secondary)] animate-fade-in">{t('ui.moderatePestRisk')}</div>}
    </div>
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="space-y-6 md:space-y-8">
        <div className="overflow-hidden rounded-[28px] border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-8 lg:p-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">
              <Sparkles size={14} />
              {t('ui.farmToolkit')}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
              {t('tools.title')}
            </h1>
            <p className="max-w-2xl text-base text-[var(--text-secondary)] sm:text-lg">
              {t('ui.toolkitDesc')}
            </p>
          </div>
        </div>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">{t('ui.availableTools')}</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{t('ui.chooseTool')}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { key: 'soil', label: t('tools.soilAnalysis'), icon: Beaker, desc: t('tools.soilAnalysisDesc'), active: 'from-amber-500 to-orange-500', idle: 'from-amber-500/10 to-orange-500/10' },
              { key: 'irrigation', label: t('ui.irrigationPlanning'), icon: Droplet, desc: t('ui.irrigationDesc'), active: 'from-sky-500 to-cyan-500', idle: 'from-sky-500/10 to-cyan-500/10' },
              { key: 'yield', label: t('ui.yieldPrediction'), icon: BarChart3, desc: t('ui.yieldDesc'), active: 'from-emerald-500 to-green-500', idle: 'from-emerald-500/10 to-green-500/10' },
              { key: 'pest', label: t('ui.pestAssessment'), icon: Bug, desc: t('ui.pestDesc'), active: 'from-red-500 to-pink-500', idle: 'from-red-500/10 to-pink-500/10' },
            ].map((tool) => {
              const Icon = tool.icon
              const isActive = activeTab === tool.key

              return (
                <button
                  key={tool.key}
                  type="button"
                  onClick={() => setActiveTab(tool.key)}
                  aria-pressed={isActive}
                  className={`group rounded-2xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] ${
                    isActive
                      ? 'border-transparent bg-gradient-to-br shadow-[0_18px_35px_rgba(14,165,233,0.14)] ' + tool.active + ' text-white'
                      : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-[0_10px_30px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 hover:border-primary-500/40 hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${isActive ? 'border-white/20 bg-white/12' : 'border-transparent bg-gradient-to-br ' + tool.idle}`}>
                      <Icon size={22} className={isActive ? 'text-white' : 'text-[var(--text-primary)]'} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{tool.label}</h3>
                      <p className={`mt-2 text-sm leading-6 ${isActive ? 'text-white/90' : 'text-[var(--text-secondary)]'}`}>{tool.desc}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-7">
          <div className="max-w-3xl">
            {activeTab === 'soil' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--text-primary)]">
                    <Beaker className="text-amber-600" size={28} />
                    {t('ui.soilHealthAnalyzer')}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">{t('ui.soilHealthDesc')}</p>
                </div>
                <SoilAnalyzer />
              </div>
            )}
            {activeTab === 'irrigation' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--text-primary)]">
                    <Droplet className="text-sky-600" size={28} />
                    {t('ui.irrigationPlanning')}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">{t('ui.irrigationDesc')}</p>
                </div>
                <IrrigationPlanner />
              </div>
            )}
            {activeTab === 'yield' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--text-primary)]">
                    <BarChart3 className="text-emerald-600" size={28} />
                    {t('ui.yieldPrediction')}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">{t('ui.yieldDesc')}</p>
                </div>
                <YieldPredictor />
              </div>
            )}
            {activeTab === 'pest' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--text-primary)]">
                    <Bug className="text-red-600" size={28} />
                    {t('ui.pestAssessment')}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">{t('ui.pestDesc')}</p>
                </div>
                <PestAssessment />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
