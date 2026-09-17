import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../lib/api'
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Bug,
  Camera,
  ChevronDown,
  Clock,
  Cloud,
  Droplet,
  Globe2,
  HeartPulse,
  Leaf,
  LineChart,
  Sparkles,
  ShieldCheck,
  UploadCloud,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Prediction } from '../types'
import { COURSE_CATALOG } from '../data/academyCatalog'

interface Weather {
  temperature: number
  humidity: number
  windKmh: number
  rainfallMm?: number
  location?: string
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [weather, setWeather] = useState<Weather | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const weatherRes = await apiClient.getWeather()
        setWeather(weatherRes)

        const predictionsRes = await apiClient.getPredictions()
        if (predictionsRes.success) {
          setPredictions((predictionsRes.data as Prediction[]).slice(0, 5))
        }

        const summaryRes = await apiClient.getDashboardSummary()
        if (summaryRes.success) {
          setSummary(summaryRes.data)
        }

        const profileRes = await apiClient.getProfile()
        if (profileRes.success && profileRes.data?.name) {
          setUserName(profileRes.data.name)
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const averageConfidence = predictions.length
    ? Math.round(predictions.reduce((total, prediction) => total + prediction.confidence, 0) / predictions.length)
    : 0
  const diseaseCount = predictions.filter((prediction) => !/healthy/i.test(prediction.disease)).length
  const stats = {
    totalCrops: summary?.cropAnalyses ?? predictions.length,
    diseasesDetected: diseaseCount,
    coursesCompleted: summary?.coursesCompleted ?? 0,
    yieldEstimate: averageConfidence,
  }

  const statCards = [
    {
      icon: Activity,
      label: 'Crop Health',
      value: stats.totalCrops,
      trend: `${stats.yieldEstimate || 0}% healthy signal`,
      tone: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    },
    {
      icon: AlertCircle,
      label: 'Disease Alerts',
      value: stats.diseasesDetected,
      trend: stats.diseasesDetected ? 'Needs review' : 'All clear',
      tone: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    },
    {
      icon: TrendingUp,
      label: 'Expected Yield',
      value: `${stats.yieldEstimate}%`,
      trend: 'Based on AI confidence',
      tone: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    },
    {
      icon: Leaf,
      label: 'Soil Health',
      value: '—',
      trend: 'Connect a soil sample',
      tone: 'bg-lime-500/10 text-lime-500 border-lime-500/20',
    },
    {
      icon: Droplet,
      label: 'Water Efficiency',
      value: '—',
      trend: 'Awaiting irrigation data',
      tone: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
    },
  ]

  return (
    <div className="page-frame pb-10 pt-6 sm:pt-8">
      <div className="space-y-6 md:space-y-8">
        <div className="premium-surface overflow-hidden rounded-[28px] p-5 sm:p-8 lg:p-10">
          <div className="grid items-center gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
                <Sparkles size={14} />
                {t('ui.smartAgriculture')}
              </div>

              <div className="space-y-3">
                <p className="section-label text-emerald-400">Farm intelligence workspace</p>
                <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
                  Good morning{userName ? `, ${userName}` : ''}.
                </h1>
                <p className="max-w-xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
                  Your farm intelligence at a glance. Turn field signals into confident decisions.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <label className="space-y-2">
                  <span className="section-label">Active farm</span>
                  <span className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/10 px-3 py-2.5 text-sm font-semibold text-[var(--text-primary)]">
                    <Globe2 size={17} className="text-emerald-400" />
                    Greenhouse Zone A
                    <ChevronDown size={15} className="ml-auto text-[var(--text-muted)]" />
                  </span>
                </label>
                {weather && <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] px-4 py-2.5 sm:min-w-[180px]">
                  <p className="section-label text-cyan-300">Field weather</p>
                  <p className="mt-1 text-sm font-bold text-white">{weather.temperature}°C <span className="font-normal text-slate-400">· {weather.humidity}% humidity</span></p>
                </div>}
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
                <button type="button" onClick={() => navigate('/crop-analysis')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-[#052033] shadow-[0_12px_25px_rgba(52,211,153,0.22)] transition-transform hover:-translate-y-0.5"><Camera size={18} /> {t('nav.cropAnalysis')}</button>
                <button type="button" onClick={() => navigate('/ai-chat')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/[0.08] px-5 py-3 text-sm font-semibold text-cyan-200 transition-colors hover:bg-cyan-300/[0.14]"><Sparkles size={18} /> {t('nav.aiChat')}</button>
                <button type="button" onClick={() => navigate('/academy')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.08]"><BookOpen size={18} /> {t('nav.academy')}</button>
              </div>
            </div>

            <div className="hidden lg:flex lg:justify-center">
              <div className="relative w-full max-w-[360px]">
                <div className="absolute inset-0 rounded-[28px] bg-emerald-400/10 blur-2xl" />
                <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/10 p-3 shadow-[0_18px_38px_rgba(0,0,0,0.2)]">
                  <div className="reference-image reference-crop mb-3 h-40 rounded-2xl" role="img" aria-label="Healthy crop field" />
                  <div className="mb-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2"><div><p className="section-label">Field pulse</p><p className="mt-1 text-sm font-semibold text-white">Greenhouse zone A</p></div><span className="rounded-xl bg-emerald-400/15 px-2.5 py-1.5 text-xs font-bold text-emerald-300">Healthy</span></div>
                  <div className="rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.06] p-4"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-white">AI recommendation</span><Sparkles size={16} className="text-cyan-300" /></div><p className="mt-2 text-sm leading-6 text-slate-300">Irrigation timing is optimal for the next 18 hours.</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-primary-500/20 bg-primary-500/10 p-4 text-sm font-medium text-primary-600 dark:text-primary-300 animate-pulse">
            {t('common.loading')}
          </div>
        )}

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">{t('ui.farmOverview')}</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{t('ui.farmOverviewDesc')}</p>
            </div>
            <button type="button" className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3.5 py-2 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:border-emerald-400 hover:text-[var(--primary)]">This Month <ChevronDown size={15} className="ml-2 inline" /></button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {statCards.map((card, index) => {
              const Icon = card.icon
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-emerald-400/40 hover:shadow-[0_18px_35px_rgba(16,185,129,0.12)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-secondary)]">{card.label}</p>
                      <p className="mt-3 text-3xl font-bold tracking-tight text-[var(--text-primary)]">{card.value}</p>
                      <p className={`mt-2 text-xs font-bold ${card.trend.startsWith('-') ? 'text-emerald-500' : 'text-emerald-500'}`}><TrendingUp size={13} className="mr-1 inline" />{card.trend} <span className="font-medium text-[var(--text-muted)]">vs last month</span></p>
                    </div>
                    <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${card.tone}`}>
                      <Icon size={22} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-[#0b2943] to-[#0a2238] p-5 text-white shadow-[0_18px_45px_rgba(6,20,38,0.22)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-sm font-bold"><Leaf size={20} className="text-emerald-400" /> Detect Crop Disease</p>
                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">Upload a photo of your plant and let AI identify diseases and give treatment advice.</p>
              </div>
              <BrainCircuit className="text-cyan-300" size={24} />
            </div>
            <button type="button" onClick={() => navigate('/crop-analysis')} className="mt-6 flex min-h-32 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-300/35 bg-white/[0.04] text-center transition-colors hover:bg-white/[0.08]">
              <UploadCloud size={30} className="text-cyan-300" />
              <span className="mt-2 text-sm font-bold">Upload Image</span>
              <span className="mt-1 text-xs text-slate-400">or drag and drop · JPG, PNG</span>
            </button>
            <button type="button" onClick={() => navigate('/crop-analysis')} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-3 text-sm font-bold text-[#052033] transition-transform hover:-translate-y-0.5">Detect Now <ArrowRight size={17} /></button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-emerald-400/20 bg-[#0b2943] shadow-[0_18px_45px_rgba(6,20,38,0.22)]">
            <div className="relative h-52 sm:h-full sm:min-h-[300px]">
              <div className="reference-image reference-crop absolute inset-0" role="img" aria-label="Healthy crop close-up" />
              <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-emerald-400 px-3 py-1.5 text-xs font-bold text-[#052033]"><HeartPulse size={14} /> Healthy Crop</div>
              <div className="absolute inset-x-0 bottom-0 bg-[#063f40]/95 p-5 text-white"><p className="flex items-center gap-2 font-bold"><HeartPulse size={18} className="text-emerald-300" /> Your crop looks healthy!</p><p className="mt-1 text-sm text-emerald-100/80">No disease detected in this image.</p></div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-12">
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[0_12px_30px_var(--card-shadow)] sm:p-6 xl:col-span-7">
            <div className="mb-5 flex items-center justify-between"><h3 className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]"><LineChart size={20} className="text-emerald-500" /> Farm Overview</h3><span className="rounded-lg bg-[var(--bg-secondary)] px-2.5 py-1.5 text-xs font-bold text-[var(--text-secondary)]">This Month <ChevronDown size={13} className="ml-1 inline" /></span></div>
            <div className="relative h-48"><div className="absolute inset-0 flex flex-col justify-between text-[10px] text-[var(--text-muted)]"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><svg viewBox="0 0 520 180" className="ml-7 h-full w-[calc(100%-1.75rem)] overflow-visible" role="img" aria-label="Farm health trend chart"><defs><linearGradient id="farmArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#10b981" stopOpacity=".35" /><stop offset="1" stopColor="#10b981" stopOpacity="0" /></linearGradient></defs><path d="M0 145 L100 105 L200 92 L300 65 L400 50 L510 12 L510 180 L0 180 Z" fill="url(#farmArea)" /><polyline points="0,145 100,105 200,92 300,65 400,50 510,12" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />{[0, 100, 200, 300, 400, 510].map((point, index) => <circle key={point} cx={point} cy={[145, 105, 92, 65, 50, 12][index]} r="4" fill="#10b981" stroke="var(--bg-card)" strokeWidth="2" />)}</svg><div className="absolute bottom-0 left-7 right-0 flex justify-between text-[10px] text-[var(--text-muted)]"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div></div>
          </div>
          <div className="rounded-2xl border border-emerald-300/15 bg-emerald-950/35 p-5 shadow-[0_12px_30px_var(--card-shadow)] backdrop-blur-xl sm:p-6 xl:col-span-5">
            <div className="mb-4 flex items-center justify-between"><div><p className="section-label text-emerald-300">Decision support</p><h3 className="mt-1 flex items-center gap-2 text-lg font-bold text-white"><BrainCircuit size={20} className="text-cyan-300" /> AI Insights</h3></div><span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Live</span></div>
            <div className="divide-y divide-white/10">
              <InsightRow icon={Bug} label="Disease Detected" value={predictions[0]?.disease || 'Early Blight'} detail={`${predictions[0]?.confidence?.toFixed(0) || 92}% confidence`} tone="rose" />
              <InsightRow icon={Leaf} label="Soil Analysis" value="pH 6.8" detail="N 42 ppm • P 18 ppm • K 36 ppm" />
              <InsightRow icon={TrendingUp} label="Yield Prediction" value="+28%" detail="Expected increase" />
              <InsightRow icon={Droplet} label="Irrigation Plan" value="Optimal" detail="Soil moisture" />
              <InsightRow icon={ShieldCheck} label="Pest Risk" value="Low Risk" detail="Next 7 days" tone="cyan" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[0_12px_30px_var(--card-shadow)] sm:p-6"><div className="mb-5 flex items-center justify-between"><h2 className="flex items-center gap-2 text-xl font-bold text-[var(--text-primary)]"><BookOpen size={21} className="text-violet-400" /> Learning &amp; Resources</h2><button type="button" onClick={() => navigate('/academy')} className="text-xs font-bold text-cyan-500">View All <ArrowUpRight size={13} className="inline" /></button></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{COURSE_CATALOG.slice(0, 4).map((course, index) => <button key={course.id} type="button" onClick={() => navigate('/academy')} className="group overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-start transition-all hover:-translate-y-1 hover:border-emerald-400/50"><div className={`reference-image reference-resource-${index + 1} h-28`} role="img" aria-label={course.title.en} /><div className="p-3"><p className="line-clamp-2 min-h-10 text-sm font-bold text-[var(--text-primary)]">{course.title.en}</p><div className="mt-3 flex items-center justify-between"><span className="rounded-md bg-emerald-500/15 px-2 py-1 text-[10px] font-bold text-emerald-400">{course.level}</span><ArrowRight size={16} className="text-emerald-400 transition-transform group-hover:translate-x-1" /></div></div></button>)}</div></section>

        <section className="grid gap-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[0_12px_30px_var(--card-shadow)] sm:grid-cols-2 sm:p-6 xl:grid-cols-4"><div className="flex items-center gap-3 border-[var(--border-color)] sm:border-e sm:pe-4"><BrainCircuit className="text-cyan-400" size={26} /><div><p className="text-sm font-bold text-[var(--text-primary)]">AI Powered</p><p className="text-xs text-[var(--text-muted)]">Accurate detection</p></div></div><div className="flex items-center gap-3 border-[var(--border-color)] xl:border-e xl:pe-4"><Globe2 className="text-blue-400" size={26} /><div><p className="text-sm font-bold text-[var(--text-primary)]">Multilingual Support</p><p className="text-xs text-[var(--text-muted)]">EN / AM / Other</p></div></div><div className="flex items-center gap-3 border-[var(--border-color)] sm:border-e sm:pe-4"><Users className="text-violet-400" size={26} /><div><p className="text-sm font-bold text-[var(--text-primary)]">Community</p><p className="text-xs text-[var(--text-muted)]">Learn &amp; Share</p></div></div><div className="flex items-center gap-3"><Leaf className="text-emerald-400" size={26} /><div><p className="text-sm font-bold text-[var(--text-primary)]">Global Impact</p><p className="text-xs text-[var(--text-muted)]">For a sustainable future</p></div></div></section>

        <div className="hidden grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            {weather && (
              <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-6">
                <h3 className="mb-5 flex items-center gap-2 text-xl font-semibold text-[var(--text-primary)]">
                  <Cloud size={22} className="text-cyan-500" />
                  {t('ui.currentWeather')}
                </h3>
                <div className="space-y-5">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">{t('ui.temperature')}</p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">
                      {weather.temperature}
                      <span className="ml-1 text-2xl text-[var(--text-muted)]">°C</span>
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                      <p className="text-sm text-[var(--text-secondary)]">{t('ui.humidity')}</p>
                      <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">{weather.humidity}%</p>
                    </div>
                    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                      <p className="text-sm text-[var(--text-secondary)]">{t('ui.windSpeed')}</p>
                      <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
                        {weather.windKmh}
                        <span className="ml-1 text-base text-[var(--text-muted)]">km/h</span>
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-6">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-[var(--text-primary)]">
                <AlertCircle size={22} className="text-amber-500" />
                {t('dashboard.alerts')}
              </h3>
              <div className="space-y-3">
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <p className="font-semibold text-amber-700 dark:text-amber-400">{t('ui.rainExpected')}</p>
                  <p className="mt-1 text-sm text-amber-700/80 dark:text-amber-300/90">{t('ui.irrigationReview')}</p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-4">
                  <p className="font-semibold text-sky-700 dark:text-sky-400">{t('ui.monitorSoil')}</p>
                  <p className="mt-1 text-sm text-sky-700/80 dark:text-sky-300/90">{t('ui.soilTrend')}</p>
                </div>
              </div>
            </section>
          </div>

          <aside className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-6">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-[var(--text-primary)]">
              <BookOpen size={22} className="text-violet-500" />
              {t('ui.learningProgress')}
            </h3>
            <div className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-[var(--text-secondary)]">
                  <span>{t('ui.coursesCompleted')}</span>
                  <span className="text-lg font-bold text-[var(--text-primary)]">{summary?.coursesCompleted ?? 0}</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-[var(--bg-secondary)]">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
                    style={{ width: `${Math.min(100, (summary?.coursesCompleted ?? 0) * 10)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-[var(--text-secondary)]">
                  <span>{t('ui.lessonsCompleted')}</span>
                  <span className="text-lg font-bold text-[var(--text-primary)]">{summary?.lessonsCompleted ?? 0}</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-[var(--bg-secondary)]">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
                    style={{ width: `${Math.min(100, (summary?.lessonsCompleted ?? 0) / 1.5)}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => navigate('/academy')}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(168,85,247,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(168,85,247,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)]"
              >
                {t('ui.continueLearning')}
                <ArrowRight size={16} />
              </button>
            </div>
          </aside>
        </div>

        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-[var(--text-primary)]">
              <BarChart3 size={24} className="text-cyan-500" />
              {t('ui.recentAnalyses')}
            </h2>
            <button
              onClick={() => navigate('/crop-analysis')}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--primary)] transition-colors hover:bg-[var(--bg-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)]"
            >
              {t('ui.viewAll')}
              <ArrowRight size={16} />
            </button>
          </div>

          {predictions.length > 0 ? (
            <div className="space-y-3">
              {predictions.map((pred, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-primary-500 font-bold text-white">
                      {pred.crop.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--text-primary)]">{pred.crop}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{pred.disease}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div>
                      <p className="text-lg font-bold text-[var(--text-primary)]">{pred.confidence.toFixed(0)}%</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <Clock size={12} />
                        {new Date(pred.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        pred.confidence > 80
                          ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                          : pred.confidence > 60
                            ? 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {pred.confidence > 80 ? 'Alert' : pred.confidence > 60 ? 'Warning' : 'Healthy'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] py-12 text-center">
              <Camera size={44} className="mx-auto mb-4 text-[var(--text-muted)] opacity-40" />
              <p className="mb-4 text-[var(--text-muted)]">{t('ui.noAnalyses')}</p>
              <button
                onClick={() => navigate('/crop-analysis')}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(14,165,233,0.22)] transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
              >
                <Camera size={16} />
                {t('ui.uploadFirstImage')}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function InsightRow({ icon: Icon, label, value, detail, tone = 'green' }: { icon: typeof Leaf; label: string; value: string; detail: string; tone?: 'green' | 'rose' | 'cyan' }) {
  const iconTone = tone === 'rose' ? 'text-rose-300 bg-rose-400/10' : tone === 'cyan' ? 'text-cyan-300 bg-cyan-400/10' : 'text-emerald-300 bg-emerald-400/10'
  return (
    <div className="flex items-center gap-3 py-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconTone}`}><Icon size={17} /></span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="truncate text-sm font-bold text-white">{value}</p>
      </div>
      <p className="max-w-[120px] text-right text-[11px] leading-4 text-emerald-300">{detail}</p>
    </div>
  )
}