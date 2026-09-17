import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { apiClient } from '../lib/api'
import { Upload, Loader, AlertCircle, Check, Camera, Sparkles, Download, Share2, ArrowLeft } from 'lucide-react'

export default function CropAnalysisPage() {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      validateAndSetFile(selectedFile)
    }
  }

  const handleDragDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      validateAndSetFile(droppedFile)
    }
  }

  const validateAndSetFile = (selectedFile: File) => {
    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setError(t('errors.invalidFile'))
      return
    }

    // Validate file size (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError(t('cropAnalysis.imageFormat'))
      return
    }

    setFile(selectedFile)
    setError('')

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleAnalyze = async () => {
    if (!file) {
      setError(t('cropAnalysis.chooseImage'))
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await apiClient.uploadPrediction(file)
      if (res.success) {
        setResult(res.data)
        setFile(null)
        setPreview(null)
      } else {
        setError(res.message || t('errors.serverError'))
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('errors.serverError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-frame space-y-6 pb-10 pt-6 sm:pt-8">
      {/* Hero Section */}
      <div className="glass-panel overflow-hidden rounded-[24px] border-cyan-300/15 bg-gradient-to-br from-emerald-950/40 via-[var(--bg-card)] to-cyan-950/30 p-6 md:p-9">
        <div className="space-y-4">
          <div className="section-label inline-flex items-center gap-2 text-cyan-300">
            <Sparkles size={16} />
            {t('ui.aiCropDetection')}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
            {t('cropAnalysis.title')}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[var(--text-secondary)] md:text-lg">
            {t('cropAnalysis.description')}
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="glass-panel overflow-hidden rounded-[24px]">
        <div className="p-5 sm:p-7">
          <div className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3 animate-slide-in">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDragDrop}
              className="group cursor-pointer rounded-[20px] border border-dashed border-emerald-300/25 bg-emerald-300/[0.03] p-8 text-center transition-all hover:border-cyan-300/60 hover:bg-cyan-300/[0.04] md:p-16"
            >
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-primary-500 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-all"></div>
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-300/25 bg-cyan-300/[0.08]">
                      <Upload className="text-cyan-600 group-hover:text-cyan-500 transition-colors" size={40} />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
                    {preview ? t('ui.changeImage') : t('ui.uploadCropImage')}
                  </h3>
                  <p className="text-[var(--text-secondary)] mb-2">{t('ui.dragDropImage')}</p>
                  <p className="text-xs text-[var(--text-muted)]">JPG, PNG, or WEBP • Max 5MB</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Preview */}
            {preview && (
              <div className="space-y-4 animate-fade-in">
                <div className="relative rounded-xl overflow-hidden h-64 md:h-96 bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="col-span-2 py-4 bg-gradient-to-r from-cyan-500 to-primary-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-base"
                  >
                    {loading ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        {t('ui.analyzing')}
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        {t('ui.analyzeNow')}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setPreview(null)
                      setFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    disabled={loading}
                    className="py-4 border-2 border-[var(--border-color)] text-[var(--text-primary)] font-semibold rounded-xl hover:border-primary-500 hover:bg-[var(--bg-secondary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <ArrowLeft size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Result Header */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-primary-500/10 border border-cyan-500/20 rounded-2xl p-6 md:p-8">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[var(--text-secondary)] text-sm font-medium mb-2">{t('ui.analysisResult')}</p>
                  <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                    {result.disease}
                  </h2>
                  <p className="text-lg text-[var(--text-secondary)] mt-2">{t('ui.detectedOn', { crop: result.crop })}</p>
                </div>
                <div className="text-right">
                  <p className="text-[var(--text-secondary)] text-sm font-medium mb-1">{t('cropAnalysis.confidence')}</p>
                  <p className="text-4xl font-bold text-cyan-600">{result.confidence.toFixed(1)}%</p>
                </div>
              </div>
              <div className="w-full bg-[var(--bg-secondary)] rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-primary-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${result.confidence}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Key Information Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Disease Info Card */}
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-color)] shadow-md hover:shadow-lg transition-all">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{t('ui.conditionStatus')}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-cyan-600 uppercase tracking-wider mb-1">{t('ui.cropType')}</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{result.crop}</p>
                </div>
                <div className="pt-3 border-t border-[var(--border-color)]">
                  <p className="text-xs font-semibold text-cyan-600 uppercase tracking-wider mb-1">{t('ui.detectedDisease')}</p>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">{result.disease}</p>
                </div>
                <div className="pt-3 border-t border-[var(--border-color)]">
                  <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">{t('ui.riskLevel')}</p>
                  <p className="text-lg font-semibold text-red-600">{t('ui.highRisk')}</p>
                </div>
              </div>
            </div>

            {/* Treatment Card */}
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-color)] shadow-md hover:shadow-lg transition-all">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-amber-500" />
                {t('cropAnalysis.treatment')}
              </h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">{result.treatment}</p>
            </div>

            {/* Prevention Card */}
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-color)] shadow-md hover:shadow-lg transition-all">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Check size={20} className="text-green-500" />
                {t('cropAnalysis.prevention')}
              </h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">{result.prevention}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-color)]">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">{t('ui.observedSymptoms')}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">{result.symptoms || 'No symptom description was returned.'}</p>
            </div>
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-color)]">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">{t('ui.likelyCauses')}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">{result.causes || 'The cause cannot be confirmed from this image alone.'}</p>
            </div>
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-color)]">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">{t('ui.recommendedNextActions')}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">{result.nextActions || 'Confirm the result locally before treatment.'}</p>
            </div>
            <div className="bg-amber-500/10 rounded-2xl p-6 border border-amber-500/30">
              <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-300 mb-3">{t('ui.chemicalSafety')}</h3>
              <p className="text-amber-800 dark:text-amber-200 leading-relaxed">{result.chemicalSafety || t('ui.safetyFallback')}</p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 flex gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-[var(--text-secondary)] text-sm">{t('cropAnalysis.disclaimer')}</p>
          </div>

          {/* Action Buttons */}
          <div className="grid sm:grid-cols-3 gap-3">
            <button
              onClick={() => {
                setResult(null)
                setPreview(null)
                setFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-primary-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Camera size={18} />
              {t('ui.analyzeAnother')}
            </button>
            <button className="px-6 py-3 border-2 border-[var(--border-color)] text-[var(--text-primary)] font-semibold rounded-lg hover:border-primary-500 transition-all flex items-center justify-center gap-2">
              <Download size={18} />
              {t('ui.saveResult')}
            </button>
            <button className="px-6 py-3 border-2 border-[var(--border-color)] text-[var(--text-primary)] font-semibold rounded-lg hover:border-primary-500 transition-all flex items-center justify-center gap-2">
              <Share2 size={18} />
              {t('ui.share')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
