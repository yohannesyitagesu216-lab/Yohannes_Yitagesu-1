import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { Activity, BookOpen, Bot, CloudSun, Copy, Droplet, FileImage, History, Leaf, Loader, Mic, Pause, Plus, Send, ShieldAlert, Sparkles, Sprout, Stethoscope, Trash2, Volume2, VolumeX, Wind, X, Zap } from 'lucide-react'
import { apiClient } from '../lib/api'

interface Message { id: string; role: 'user' | 'assistant'; content: string; timestamp: Date; imageUrl?: string; prediction?: any }
interface ChatSession { id: string; title: string; messages: Message[]; updatedAt: number }
interface RecognitionResult extends Event { results: ArrayLike<{ [index: number]: { transcript: string } }> }
interface Recognition { lang: string; continuous: boolean; interimResults: boolean; start: () => void; stop: () => void; abort: () => void; onresult: ((event: RecognitionResult) => void) | null; onerror: (() => void) | null; onend: (() => void) | null }
type RecognitionConstructor = new () => Recognition

const storageKey = 'agrovision-copilot-chats'

function loadSessions(): ChatSession[] {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]') as ChatSession[]
    return stored.map((session) => ({ ...session, messages: session.messages.map((message) => ({ ...message, timestamp: new Date(message.timestamp) })) }))
  } catch { return [] }
}

function messageContent(content: string) {
  const lines = content.split('\n')
  const tableRows: Array<{ index: number; cells: string[] }> = []
  lines.forEach((line, index) => {
    if (line.trim().startsWith('|') && line.trim().endsWith('|') && !/^\|[\s|:-]+\|$/.test(line.trim())) {
      tableRows.push({ index, cells: line.trim().slice(1, -1).split('|').map((cell) => cell.trim()) })
    }
  })
  return lines.map((line, index) => {
    const text = line.trim()
    const table = tableRows.find((row) => row.index === index)
    if (table) {
      const isHeader = tableRows[0]?.index === index
      return <div key={index} className={`grid gap-2 border-b border-[var(--border-color)] py-2 ${isHeader ? 'font-bold text-emerald-400' : ''}`} style={{ gridTemplateColumns: `repeat(${table.cells.length}, minmax(0, 1fr))` }}>{table.cells.map((cell, cellIndex) => <span key={cellIndex}>{renderInline(cell)}</span>)}</div>
    }
    if (/^\|[\s|:-]+\|$/.test(text)) return null
    if (!text) return <div key={index} className="h-2" />
    if (text.startsWith('### ')) return <h4 key={index} className="mt-3 font-bold">{text.slice(4)}</h4>
    if (text.startsWith('## ')) return <h3 key={index} className="mt-3 text-base font-bold">{text.slice(3)}</h3>
    if (/^[-*]\s/.test(text)) return <li key={index} className="ms-4 list-disc">{text.slice(2)}</li>
    if (/^\d+[.)]\s/.test(text)) return <li key={index} className="ms-4 list-decimal">{text.replace(/^\d+[.)]\s/, '')}</li>
    return <p key={index}>{renderInline(line)}</p>
  })
}

function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => part.startsWith('**') && part.endsWith('**') ? <strong key={index}>{part.slice(2, -2)}</strong> : part)
}

function getChatErrorMessage(error: any) {
  if (error?.response?.status === 401) return 'Your session has expired. Please sign in again.'
  if (error?.response?.status === 408 || error?.code === 'ECONNABORTED') return 'The AI request timed out. Please try again shortly.'
  if (error?.response?.status === 502 || error?.response?.status === 503) return error.response.data?.message || 'The AI or weather service is temporarily unavailable. Please try again shortly.'
  if (!error?.response) return 'The AI service is unreachable. Please try again shortly.'
  return error.response.data?.message || 'The AI assistant could not complete that request.'
}

export default function AIPage() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const rtl = i18n.language.startsWith('ar')
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<Recognition | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions)
  const [activeId, setActiveId] = useState('')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [voiceId, setVoiceId] = useState<string | null>(null)
  const [paused, setPaused] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(true)
  const [context, setContext] = useState<{ weather?: any; predictions: any[]; progress?: any; user?: any }>({ predictions: [] })

  const activeSession = sessions.find((session) => session.id === activeId) || sessions[0]
  const messages = activeSession?.messages || []

  useEffect(() => {
    if (!sessions.length) { const session = { id: crypto.randomUUID(), title: 'New conversation', messages: [], updatedAt: Date.now() }; setSessions([session]); setActiveId(session.id) }
    else if (!activeId || !sessions.some((session) => session.id === activeId)) setActiveId(sessions[0].id)
  }, [sessions, activeId])
  useEffect(() => { if (sessions.length) localStorage.setItem(storageKey, JSON.stringify(sessions)) }, [sessions])
  useEffect(() => {
    const lessonContext = (location.state as { lessonContext?: string } | null)?.lessonContext
    if (lessonContext) { setInput(`Help me understand this lesson and give me one practical agriculture example.\n\n${lessonContext}`); window.history.replaceState({}, document.title, window.location.pathname) }
  }, [location.state])
  useEffect(() => {
    let mounted = true
    Promise.allSettled([apiClient.getPredictions(), apiClient.getAcademyProgress(), apiClient.getProfile()]).then(([predictions, progress, user]) => {
      if (!mounted) return
      setContext({ predictions: predictions.status === 'fulfilled' && predictions.value.success ? (predictions.value.data as any[]).slice(0, 3) : [], progress: progress.status === 'fulfilled' && progress.value.success ? progress.value.data : undefined, user: user.status === 'fulfilled' && user.value.success ? user.value.data : undefined })
    })
    return () => { mounted = false }
  }, [])

  const updateActive = (update: (session: ChatSession) => ChatSession) => setSessions((current) => current.map((session) => session.id === activeSession?.id ? update(session) : session))
  const history = (items: Message[]) => items.slice(-10).map((message) => ({ role: message.role, content: message.content }))

  const send = async (text = input.trim()) => {
    if (!text || loading || !activeSession) return
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: text, timestamp: new Date(), imageUrl: preview || undefined }
    const next = [...messages, userMessage]
    updateActive((session) => ({ ...session, title: session.messages.length ? session.title : text.slice(0, 32), messages: next, updatedAt: Date.now() }))
    setInput(''); setPreview(null); setImage(null); setLoading(true)
    try {
      const response = await apiClient.chat(text, i18n.language, history(next))
      if (response?.data?.context) setContext((current) => ({ ...current, weather: response.data.context.weather || undefined }))
      const reply: Message = { id: crypto.randomUUID(), role: 'assistant', content: response?.data?.reply || 'I could not generate a response right now.', timestamp: new Date() }
      setSessions((current) => current.map((session) => session.id === activeSession.id ? { ...session, messages: [...next, reply], updatedAt: Date.now() } : session))
    } catch (requestError: any) {
      const reply: Message = { id: crypto.randomUUID(), role: 'assistant', content: getChatErrorMessage(requestError), timestamp: new Date() }
      setSessions((current) => current.map((session) => session.id === activeSession.id ? { ...session, messages: [...next, reply], updatedAt: Date.now() } : session))
    } finally { setLoading(false) }
  }

  const chooseImage = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) { setError('Images must be smaller than 5MB.'); return }
    setImage(file); setError(''); const reader = new FileReader(); reader.onload = () => setPreview(String(reader.result)); reader.readAsDataURL(file)
  }
  const analyzeImage = async () => {
    if (!image || analyzing || !activeSession) return
    setAnalyzing(true); setError('')
    try {
      const response = await apiClient.uploadPrediction(image); const prediction = response.data as any
      const result = `## ${prediction.crop || 'Crop'} Disease Analysis\n\n**Disease:** ${prediction.disease}\n\n**Confidence:** ${Number(prediction.confidence || 0).toFixed(1)}%\n\n### Symptoms\n${prediction.symptoms || 'Compare the image with local field symptoms.'}\n\n### Treatment\n${prediction.treatment || 'Follow local agricultural extension guidance.'}\n\n### Prevention\n${prediction.prevention || 'Monitor the crop regularly and remove affected material safely.'}`
      const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: 'Analyze this crop image.', timestamp: new Date(), imageUrl: preview || undefined }
      const assistant: Message = { id: crypto.randomUUID(), role: 'assistant', content: result, timestamp: new Date(), prediction }
      updateActive((session) => ({ ...session, messages: [...session.messages, userMessage, assistant], updatedAt: Date.now() }))
      setContext((current) => ({ ...current, predictions: [prediction, ...current.predictions].slice(0, 3) })); setPreview(null); setImage(null)
    } catch (requestError: any) { setError(requestError?.response?.data?.message || 'Image analysis failed. Please try again.') }
    finally { setAnalyzing(false) }
  }
  const startVoice = () => {
    const browserWindow = window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor }
    const Constructor = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition
    if (!Constructor) { setError('Voice input is not supported by this browser.'); return }
    const recognition = new Constructor(); recognition.lang = i18n.language === 'ar' ? 'ar-SA' : i18n.language === 'am' ? 'am-ET' : i18n.language === 'om' ? 'om-ET' : i18n.language; recognition.continuous = true; recognition.interimResults = true
    setError(''); setRecording(true); recognition.onresult = (event) => { let transcript = ''; for (let index = 0; index < event.results.length; index += 1) transcript += event.results[index][0].transcript; setInput(transcript) }; recognition.onerror = () => { setRecording(false); setTranscribing(false); setError('Microphone input failed. Check browser permission and try again.') }; recognition.onend = () => { setRecording(false); setTranscribing(false) }; recognitionRef.current = recognition; recognition.start()
  }
  const stopVoice = () => { setTranscribing(true); recognitionRef.current?.stop(); window.setTimeout(() => setTranscribing(false), 500) }
  const speak = (message: Message) => {
    if (!('speechSynthesis' in window)) return
    if (voiceId === message.id && !paused) { window.speechSynthesis.pause(); setPaused(true); return }
    if (voiceId === message.id && paused) { window.speechSynthesis.resume(); setPaused(false); return }
    window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(message.content); utterance.lang = i18n.language; utterance.onend = () => { setVoiceId(null); setPaused(false) }; window.speechSynthesis.speak(utterance); setVoiceId(message.id); setPaused(false)
  }
  const newChat = () => { const session = { id: crypto.randomUUID(), title: 'New conversation', messages: [], updatedAt: Date.now() }; setSessions((current) => [session, ...current]); setActiveId(session.id) }
  const actions = useMemo(() => [
    { label: 'Analyze Crop', icon: Leaf, action: () => inputRef.current?.click() },
    { label: 'Weather', icon: CloudSun, action: () => void send('What is the current weather for my farm?') },
    { label: 'Soil Analysis', icon: Droplet, action: () => navigate('/tools') },
    { label: 'Irrigation', icon: Wind, action: () => navigate('/tools') },
    { label: 'Yield Prediction', icon: Activity, action: () => navigate('/tools') },
    { label: 'Academy Tutor', icon: BookOpen, action: () => setInput('Help me understand my current Academy lesson.') },
    { label: 'Pest Risk', icon: ShieldAlert, action: () => navigate('/tools') },
  ], [navigate])
  const latest = context.predictions[0]

  return <div className="ai-copilot page-frame pb-8 pt-6 sm:pt-8" dir={rtl ? 'rtl' : 'ltr'}>
    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => chooseImage(event.target.files?.[0])} />
    <header className="mb-5 flex flex-wrap items-center justify-between gap-4"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-400"><Sparkles size={15} /> AgroVision AI Copilot</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl">{t('ai.title')}</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">Your intelligent field partner for decisions, diagnosis, and learning.</p></div><div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-400"><span className="h-2 w-2 rounded-full bg-emerald-400" /> AI online</div></header>
    <div className="grid min-h-[680px] overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-[0_24px_65px_var(--card-shadow)] lg:grid-cols-[220px_minmax(0,1fr)_235px]">
      <aside className={`${historyOpen ? 'block' : 'hidden'} border-b border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 lg:block lg:border-b-0 lg:border-e`}><div className="mb-5 flex items-center justify-between"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]"><History size={15} /> History</p><button type="button" aria-label="New chat" onClick={newChat} className="rounded-lg bg-emerald-500 p-2 text-white"><Plus size={16} /></button></div><button type="button" onClick={newChat} className="mb-3 flex w-full items-center gap-2 rounded-xl border border-dashed border-emerald-400/35 px-3 py-2.5 text-sm font-bold text-emerald-400 hover:bg-emerald-400/10"><Plus size={16} /> New Chat</button><div className="space-y-1">{sessions.map((session) => <button key={session.id} type="button" onClick={() => setActiveId(session.id)} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-start text-sm ${session.id === activeSession?.id ? 'bg-emerald-500/15 font-bold text-emerald-400' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'}`}><span className="truncate">{session.title}</span></button>)}</div>{activeSession?.messages.length ? <button type="button" onClick={() => { setSessions((current) => current.filter((session) => session.id !== activeSession.id)); setActiveId('') }} className="mt-6 flex items-center gap-2 px-3 text-xs text-red-400"><Trash2 size={14} /> Delete chat</button> : null}</aside>
      <section className="flex min-w-0 flex-col"><div className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-3 sm:px-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 text-white"><Bot size={21} /></div><div><p className="text-sm font-bold text-[var(--text-primary)]">AgroVision Copilot</p><p className="text-[11px] text-emerald-400">Ready to help with your farm</p></div></div><button type="button" onClick={() => setHistoryOpen((open) => !open)} className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] lg:hidden" aria-label="Toggle chat history"><History size={18} /></button></div><div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">{!messages.length ? <EmptyState actions={actions} /> : messages.map((message) => <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}><div className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[78%] ${message.role === 'user' ? 'rounded-br-md bg-gradient-to-br from-violet-500 to-cyan-600 text-white' : 'rounded-bl-md border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)]'}`}>{message.imageUrl ? <img src={message.imageUrl} alt="Uploaded crop" className="mb-3 max-h-48 w-full rounded-xl object-cover" /> : null}{message.role === 'assistant' ? <div>{messageContent(message.content)}</div> : <p className="whitespace-pre-wrap">{message.content}</p>}<div className="mt-3 flex items-center justify-between text-[10px] opacity-65"><span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>{message.role === 'assistant' ? <span className="flex items-center gap-2"><button type="button" aria-label="Copy response" onClick={() => void navigator.clipboard?.writeText(message.content)}><Copy size={13} /></button><button type="button" aria-label={voiceId === message.id && !paused ? 'Pause response' : 'Speak response'} onClick={() => speak(message)}>{voiceId === message.id && !paused ? <Pause size={13} /> : <Volume2 size={13} />}</button>{voiceId === message.id ? <button type="button" aria-label="Stop response" onClick={() => { window.speechSynthesis.cancel(); setVoiceId(null) }}><VolumeX size={13} /></button> : null}</span> : null}</div></div></div>)}{loading ? <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><Loader size={16} className="animate-spin text-emerald-400" /> Copilot is thinking...</div> : null}</div>{error ? <div className="mx-4 mb-2 rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2 text-xs text-red-400 sm:mx-6">{error}</div> : null}{preview ? <div className="mx-4 mb-2 flex items-center gap-3 rounded-xl border border-cyan-400/25 bg-cyan-400/10 p-2 sm:mx-6"><img src={preview} alt="Selected crop preview" className="h-12 w-12 rounded-lg object-cover" /><span className="flex-1 text-xs font-semibold text-[var(--text-secondary)]">Crop image ready for analysis</span><button type="button" onClick={() => { setPreview(null); setImage(null) }} aria-label="Remove image"><X size={16} /></button><button type="button" onClick={() => void analyzeImage()} disabled={analyzing} className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-bold text-white">{analyzing ? 'Analyzing...' : 'Analyze'}</button></div> : null}<div className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)] p-3 sm:p-4"><div className="mb-3 flex gap-2 overflow-x-auto pb-1">{actions.map(({ label, icon: Icon, action }) => <button key={label} type="button" onClick={action} className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-[11px] font-bold text-[var(--text-secondary)] hover:border-emerald-400/50 hover:text-emerald-400"><Icon size={13} />{label}</button>)}</div><div className="flex items-end gap-2"><button type="button" onClick={recording ? stopVoice : startVoice} aria-label={recording ? 'Stop recording' : 'Start voice input'} className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${recording ? 'bg-red-500 text-white animate-pulse' : 'border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)]'}`}><Mic size={19} /></button><button type="button" onClick={() => inputRef.current?.click()} aria-label="Upload crop image" className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] sm:flex"><FileImage size={19} /></button><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send() } }} rows={1} placeholder={transcribing ? 'Transcribing...' : t('ai.placeholder')} disabled={loading || transcribing} className="min-h-12 max-h-32 min-w-0 flex-1 resize-none rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]" /><button type="button" onClick={() => void send()} disabled={loading || !input.trim()} aria-label="Send message" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-[#052033] disabled:opacity-40"><Send size={19} /></button></div>{recording ? <button type="button" onClick={() => { recognitionRef.current?.abort(); setRecording(false); setTranscribing(false); setInput('') }} className="mt-2 text-xs font-semibold text-red-400">Cancel recording</button> : null}</div></section>
      <aside className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 lg:border-t-0 lg:border-s"><p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]"><Zap size={15} /> Context</p><div className="space-y-3">{context.user ? <ContextCard icon={Leaf} label="Current user" value={context.user.name} /> : null}{latest ? <ContextCard icon={Stethoscope} label="Latest disease result" value={`${latest.crop || 'Crop'} · ${latest.disease}`} tone="amber" /> : null}{context.weather ? <ContextCard icon={CloudSun} label="Weather" value={`${context.weather.temperature}°C · ${context.weather.humidity}% humidity`} tone="cyan" /> : null}{context.progress && Array.isArray(context.progress) ? <ContextCard icon={BookOpen} label="Academy progress" value={`${context.progress.filter((item: any) => item.completed).length} completed lessons`} tone="purple" /> : null}</div><div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4"><p className="text-xs font-bold text-emerald-400">Recommendations</p><p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">Upload a crop image for a real diagnosis, or ask about weather, soil, irrigation, yield, or Academy lessons.</p></div></aside>
    </div>
  </div>
}

function EmptyState({ actions }: { actions: Array<{ label: string; icon: typeof Leaf; action: () => void }> }) {
  return <div className="flex min-h-[430px] flex-col items-center justify-center text-center"><div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-white shadow-[0_18px_40px_rgba(16,185,129,0.25)]"><Sprout size={38} /></div><h2 className="text-2xl font-extrabold text-[var(--text-primary)]">🌱 Hello! I&apos;m your AgroVision AI Copilot.</h2><p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">What would you like to do today?</p><div className="mt-6 grid max-w-lg grid-cols-2 gap-2 sm:grid-cols-4">{actions.slice(0, 4).map(({ label, icon: Icon, action }) => <button key={label} type="button" onClick={action} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-2 text-xs font-semibold text-[var(--text-secondary)] hover:border-emerald-400/50 hover:text-emerald-400"><Icon size={19} />{label}</button>)}</div></div>
}

function ContextCard({ icon: Icon, label, value, tone = 'green' }: { icon: typeof Leaf; label: string; value: string; tone?: 'green' | 'amber' | 'cyan' | 'purple' }) {
  const colors = { green: 'text-emerald-400 bg-emerald-400/10', amber: 'text-amber-400 bg-amber-400/10', cyan: 'text-cyan-400 bg-cyan-400/10', purple: 'text-violet-400 bg-violet-400/10' }
  return <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{label}</p><div className="mt-2 flex items-center gap-2"><span className={`rounded-lg p-1.5 ${colors[tone]}`}><Icon size={15} /></span><p className="text-xs font-semibold leading-5 text-[var(--text-primary)]">{value}</p></div></div>
}