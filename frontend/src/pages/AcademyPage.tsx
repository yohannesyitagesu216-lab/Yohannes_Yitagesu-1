import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle, ChevronRight, Clock, Globe2, Menu, MessageCircle, Search, X } from 'lucide-react'
import { apiClient } from '../lib/api'
import { AcademyProgress } from '../types'
import { ACADEMY_LANGUAGES, COURSE_CATALOG, COURSE_CATALOG as COURSES, COURSE_LESSON_COUNTS, loadAcademyCourse } from '../data/academyCatalog'
import type { AcademyCourse, AcademyLanguage, AcademyLesson } from '../data/academyContent'

const getIds = (key: string) => {
  try { return JSON.parse(localStorage.getItem(key) || '[]') as string[] } catch { return [] }
}

export default function AcademyPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const language = (ACADEMY_LANGUAGES.some((item) => item.code === i18n.language) ? i18n.language : 'en') as AcademyLanguage
  const rtl = language === 'ar'
  const [view, setView] = useState<'catalog' | 'course' | 'lesson'>('catalog')
  const [courseId, setCourseId] = useState<string | null>(null)
  const [unitId, setUnitId] = useState<string | null>(null)
  const [lessonId, setLessonId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [completed, setCompleted] = useState<string[]>(() => getIds('agro_academy_done'))
  const [bookmarks, setBookmarks] = useState<string[]>(() => getIds('agro_bookmarks'))
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loadedCourse, setLoadedCourse] = useState<AcademyCourse | null>(null)
  const [courseLoading, setCourseLoading] = useState(false)

  useEffect(() => {
    document.documentElement.dir = rtl ? 'rtl' : 'ltr'
    document.documentElement.lang = language
    localStorage.setItem('agro_lang', language)
  }, [language, rtl])

  useEffect(() => {
    let active = true
    void apiClient.getAcademyProgress().then((response) => {
      if (!active || !response?.success || !Array.isArray(response.data)) return
      const ids = (response.data as AcademyProgress[]).filter((item) => item.completed).map((item) => item.lesson_id)
      setCompleted(ids)
      localStorage.setItem('agro_academy_done', JSON.stringify(ids))
    }).catch(() => undefined)
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!courseId || view === 'catalog') return
    let active = true
    setCourseLoading(true)
    void loadAcademyCourse(courseId).then((nextCourse) => {
      if (active) setLoadedCourse(nextCourse || null)
    }).finally(() => {
      if (active) setCourseLoading(false)
    })
    return () => { active = false }
  }, [courseId, view])

  const course = loadedCourse
  const unit = course?.units.find((item) => item.id === unitId)
  const lesson = unit?.lessons.find((item) => item.id === lessonId)
  const totalLessons = Object.values(COURSE_LESSON_COUNTS).reduce((total, count) => total + count, 0)
  const filteredCourses = useMemo(() => COURSE_CATALOG.filter((item) => `${item.title[language]} ${item.description[language]}`.toLowerCase().includes(query.toLowerCase())), [language, query])

  const openLesson = (selectedCourse: AcademyCourse, selectedUnit: AcademyCourse['units'][number], selectedLesson: AcademyLesson) => {
    setCourseId(selectedCourse.id); setUnitId(selectedUnit.id); setLessonId(selectedLesson.id)
    setView('lesson'); setAnswers({}); setSubmitted(false); setSidebarOpen(false)
  }
  const toggleBookmark = () => {
    if (!lesson) return
    const next = bookmarks.includes(lesson.id) ? bookmarks.filter((id) => id !== lesson.id) : [...bookmarks, lesson.id]
    setBookmarks(next); localStorage.setItem('agro_bookmarks', JSON.stringify(next))
  }
  const submitQuiz = () => {
    if (!lesson) return
    setSubmitted(true)
    const questions = lesson.quiz[language]
    const score = Math.round(questions.filter((question, index) => answers[index] === question.correct).length / questions.length * 100)
    if (score >= 70 && !completed.includes(lesson.id)) {
      const next = [...completed, lesson.id]
      setCompleted(next); localStorage.setItem('agro_academy_done', JSON.stringify(next))
      void apiClient.saveAcademyProgress(lesson.id, courseId || '', true, score).catch(() => undefined)
    }
  }
  const goNext = (direction: 1 | -1) => {
    if (!course || !lesson) return
    const all = course.units.flatMap((currentUnit) => currentUnit.lessons.map((currentLesson) => ({ currentUnit, currentLesson })))
    const next = all[all.findIndex((item) => item.currentLesson.id === lesson.id) + direction]
    if (next) openLesson(course, next.currentUnit, next.currentLesson)
  }
  const lessonContext = lesson && course && unit ? [
    `Course: ${course.title[language]}`, `Unit: ${unit.title[language]}`, `Lesson: ${lesson.title[language]}`,
    `Introduction: ${lesson.introduction[language]}`, `Topics: ${lesson.topics[language].map((item) => `${item.title}: ${item.explanation}`).join(' ')}`,
    `Definitions: ${lesson.definitions[language].join(' ')}`, `Examples: ${lesson.examples[language].join(' ')}`, `Summary: ${lesson.summary[language]}`,
    `Selected language: ${language}`,
  ].join('\n') : ''

  if (view === 'catalog') return <main dir={rtl ? 'rtl' : 'ltr'} className="min-h-screen bg-[var(--bg-primary)] p-6 sm:p-10"><div className="mx-auto max-w-7xl space-y-10"><header className="rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-cyan-500 p-8 text-white sm:p-12"><div className="flex flex-wrap items-center justify-between gap-6"><div><p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider"><BookOpen size={18} /> AgroVision Academy</p><h1 className="text-4xl font-bold sm:text-5xl">{t('academy.title')}</h1><p className="mt-3">{language === 'en' ? 'A complete agriculture curriculum in six languages.' : 'የተሟላ የግብርና ትምህርት።'}</p></div><label className="flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2"><Globe2 size={18} /><select aria-label="Academy language" value={language} onChange={(event) => void i18n.changeLanguage(event.target.value)} className="bg-transparent font-semibold outline-none"><option value="en" className="text-black">English</option>{ACADEMY_LANGUAGES.slice(1).map((item) => <option key={item.code} value={item.code} className="text-black">{item.label}</option>)}</select></label></div><div className="relative mt-8 max-w-2xl"><Search className="absolute start-4 top-1/2 -translate-y-1/2" size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('ui.academySearch')} className="w-full rounded-lg bg-white px-12 py-4 text-gray-900 outline-none" /></div></header><div className="grid gap-4 sm:grid-cols-3"><Stat label="Courses" value={COURSES.length} /><Stat label="Lessons" value={totalLessons} /><Stat label="Completed" value={`${completed.length}/${totalLessons}`} /></div><section><h2 className="mb-5 text-2xl font-bold text-[var(--text-primary)]">Courses</h2><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filteredCourses.map((item) => <button key={item.id} onClick={() => { setCourseId(item.id); setView('course') }} className="overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-start shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className={`bg-gradient-to-br ${item.color} p-7 text-white`}><span className="text-5xl">{item.image}</span><h3 className="mt-5 text-xl font-bold">{item.title[language]}</h3></div><div className="space-y-4 p-6"><p className="text-sm leading-6 text-[var(--text-secondary)]">{item.description[language]}</p><div className="flex justify-between text-sm text-[var(--text-muted)]"><span>{item.units.reduce((sum, current) => sum + current.lessons.length, 0)} lessons</span><span>{item.duration}</span></div><span className="flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-3 font-semibold text-white">{t('ui.continueLearning')} <ChevronRight size={18} /></span></div></button>)}</div></section></div></main>

  if (view === 'course' && courseLoading) return <main className="min-h-screen bg-[var(--bg-primary)] p-10 text-center text-[var(--text-secondary)]">Loading course...</main>

  if (view === 'course' && course) return <main dir={rtl ? 'rtl' : 'ltr'} className="min-h-screen bg-[var(--bg-primary)] p-6 sm:p-10"><div className="mx-auto max-w-5xl space-y-8"><button onClick={() => setView('catalog')} className="flex items-center gap-2 font-semibold text-primary-500"><ArrowLeft size={18} /> {t('ui.backToCatalog')}</button><header className={`rounded-2xl bg-gradient-to-br ${course.color} p-8 text-white`}><span className="text-5xl">{course.image}</span><h1 className="mt-5 text-4xl font-bold">{course.title[language]}</h1><p className="mt-3 text-white/85">{course.description[language]}</p></header>{course.units.map((currentUnit, unitIndex) => <section key={currentUnit.id} className="overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]"><div className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)] p-6"><h2 className="text-xl font-bold text-[var(--text-primary)]">{unitIndex + 1}. {currentUnit.title[language]}</h2><p className="mt-2 text-[var(--text-secondary)]">{currentUnit.description[language]}</p></div>{currentUnit.lessons.map((currentLesson, lessonIndex) => <button key={currentLesson.id} onClick={() => openLesson(course, currentUnit, currentLesson)} className="flex w-full items-center justify-between border-b border-[var(--border-color)] p-5 text-start hover:bg-[var(--bg-secondary)]"><span className="flex items-center gap-4"><span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-color)]">{completed.includes(currentLesson.id) ? <CheckCircle className="text-green-500" size={20} /> : lessonIndex + 1}</span><span><strong className="block text-[var(--text-primary)]">{currentLesson.title[language]}</strong><small className="mt-1 flex items-center gap-1 text-[var(--text-muted)]"><Clock size={14} /> {currentLesson.duration}</small></span></span><ChevronRight className="text-primary-500" size={20} /></button>)}</section>)}</div></main>

  if (view === 'lesson' && course && unit && lesson) {
    const questions = lesson.quiz[language]
    const score = Math.round(questions.filter((question, index) => answers[index] === question.correct).length / questions.length * 100)
    return <main dir={rtl ? 'rtl' : 'ltr'} className="min-h-screen bg-[var(--bg-primary)]"><div className="flex min-h-screen"><aside className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-y-0 z-30 w-80 overflow-y-auto border-e border-[var(--border-color)] bg-[var(--bg-card)] p-6 lg:static lg:block`}><button onClick={() => setView('course')} className="mb-6 flex items-center gap-2 text-sm font-semibold text-primary-500"><ArrowLeft size={16} /> {t('ui.backToCourse')}</button><h2 className="mb-6 font-bold text-[var(--text-primary)]">{course.title[language]}</h2>{course.units.map((currentUnit) => <div key={currentUnit.id} className="mb-6"><h3 className="mb-2 text-sm font-bold text-[var(--text-secondary)]">{currentUnit.title[language]}</h3>{currentUnit.lessons.map((currentLesson) => <button key={currentLesson.id} onClick={() => openLesson(course, currentUnit, currentLesson)} className={`mb-1 w-full rounded-lg p-3 text-start text-sm ${lesson.id === currentLesson.id ? 'bg-primary-500/15 text-primary-600' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}>{completed.includes(currentLesson.id) ? '✓ ' : ''}{currentLesson.title[language]}</button>)}</div>)}</aside><article className="min-w-0 flex-1"><div className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-card)] p-4"><button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-lg p-2 lg:hidden" aria-label="Toggle lesson menu">{sidebarOpen ? <X size={22} /> : <Menu size={22} />}</button><h1 className="truncate px-3 font-bold text-[var(--text-primary)]">{lesson.title[language]}</h1><button onClick={toggleBookmark} aria-label="Bookmark lesson" className="text-xl">{bookmarks.includes(lesson.id) ? '★' : '☆'}</button></div><div className="mx-auto max-w-4xl space-y-8 p-6 sm:p-10"><p className="text-sm font-semibold text-primary-500">{course.title[language]} / {unit.title[language]}</p><h2 className="text-4xl font-bold text-[var(--text-primary)]">{lesson.title[language]}</h2><LessonSection title="Introduction" text={lesson.introduction[language]} /><List title="Learning objectives" items={lesson.objectives[language]} /><section className="space-y-7 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-7"><h3 className="text-2xl font-bold text-[var(--text-primary)]">Main lesson</h3>{lesson.topics[language].map((topic) => <div key={topic.title}><h4 className="text-xl font-bold text-[var(--text-primary)]">{topic.title}</h4><p className="mt-2 leading-7 text-[var(--text-secondary)]">{topic.explanation}</p><List title="Examples" items={topic.examples} /></div>)}<List title="Definitions" items={lesson.definitions[language]} /><List title="Examples" items={lesson.examples[language]} /><List title={t('ui.keyPoints')} items={lesson.keyPoints[language]} /><List title="Practice" items={lesson.practice[language]} /></section><div className="rounded-xl border border-primary-300 bg-primary-500/10 p-6"><div className="flex gap-3"><MessageCircle className="text-primary-500" /><div><h3 className="font-bold text-[var(--text-primary)]">{t('ui.needMoreHelp')}</h3><p className="my-2 text-sm text-[var(--text-secondary)]">{t('ui.askLesson')}</p><button onClick={() => navigate('/ai-chat', { state: { lessonContext } })} className="rounded-lg bg-primary-500 px-4 py-2 font-semibold text-white">{t('ui.askAssistant')}</button></div></div></div><section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-7"><h3 className="mb-5 text-2xl font-bold text-[var(--text-primary)]">Quiz: {questions.length} questions</h3>{questions.map((question, questionIndex) => <div key={question.id} className="mb-7"><h4 className="mb-3 font-semibold text-[var(--text-primary)]">{questionIndex + 1}. {question.question}</h4><div className="grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => <button key={option} onClick={() => setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }))} className={`rounded-lg border-2 p-3 text-start ${answers[questionIndex] === optionIndex ? 'border-primary-500 bg-primary-500/10' : 'border-[var(--border-color)] hover:border-primary-500'}`}>{String.fromCharCode(65 + optionIndex)}. {option}</button>)}</div>{submitted && <p className="mt-2 text-sm text-[var(--text-secondary)]">{question.explanation}</p>}</div>)}<button onClick={submitQuiz} className="rounded-lg bg-primary-500 px-5 py-3 font-semibold text-white">{submitted ? 'Retry / Submit again' : 'Submit quiz'}</button>{submitted && <p className={`mt-5 text-xl font-bold ${score >= 70 ? 'text-green-500' : 'text-orange-500'}`}>{score}% {score >= 70 ? 'Pass' : 'Fail: 70% required'}</p>}</section><LessonSection title="Summary" text={lesson.summary[language]} /><List title="Review questions" items={lesson.reviewQuestions[language]} /><p className="rounded-lg bg-[var(--bg-secondary)] p-4 text-[var(--text-secondary)]">{lesson.nextLesson[language]}</p><div className="flex justify-between border-t border-[var(--border-color)] pt-6"><button onClick={() => goNext(-1)} className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] px-4 py-3 font-semibold"><ArrowLeft size={18} /> {t('ui.previous')}</button><button disabled={!completed.includes(lesson.id)} onClick={() => goNext(1)} className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-3 font-semibold text-white disabled:opacity-40">{t('ui.next')} <ArrowRight size={18} /></button></div></div></article></div></main>
  }
  return null
}

function Stat({ label, value }: { label: string; value: string | number }) { return <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5"><p className="text-sm text-[var(--text-muted)]">{label}</p><p className="mt-2 text-3xl font-bold text-primary-500">{value}</p></div> }
function LessonSection({ title, text }: { title: string; text: string }) { return <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-7"><h3 className="mb-3 text-2xl font-bold text-[var(--text-primary)]">{title}</h3><p className="leading-8 text-[var(--text-secondary)]">{text}</p></section> }
function List({ title, items }: { title: string; items: string[] }) { return <div><h3 className="mb-3 text-xl font-bold text-[var(--text-primary)]">{title}</h3><ul className="list-disc space-y-2 ps-6 leading-7 text-[var(--text-secondary)]">{items.map((item) => <li key={item}>{item}</li>)}</ul></div> }
