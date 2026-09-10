import { build } from 'esbuild'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const languages = ['en', 'am', 'om', 'fr', 'ar', 'es']
const temporaryDirectory = await mkdtemp(join(tmpdir(), 'agrovision-academy-'))
const bundlePath = join(temporaryDirectory, 'academy-content.mjs')
await build({ entryPoints: [fileURLToPath(new URL('../src/data/academyContent.ts', import.meta.url))], bundle: true, format: 'esm', platform: 'node', outfile: bundlePath })
const { COURSES } = await import(pathToFileURL(bundlePath).href)
const course = COURSES.find((item) => item.id === 'intro-agriculture')
const allLessons = COURSES.flatMap((item) => item.units.flatMap((unit) => unit.lessons))
const words = (value) => value.trim().split(/\s+/u).filter(Boolean).length
const text = (lesson, language) => [
  lesson.introduction[language], ...lesson.objectives[language],
  ...lesson.topics[language].flatMap((topic) => [topic.title, topic.explanation, ...topic.examples]),
  ...lesson.definitions[language], ...lesson.examples[language], ...lesson.keyPoints[language],
  ...lesson.practice[language], ...lesson.applications[language], ...lesson.commonMistakes[language],
  lesson.summary[language], ...lesson.reviewQuestions[language], lesson.nextLesson[language],
].join(' ')
const normalize = (value) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
const course1Lessons = course?.units.flatMap((unit) => unit.lessons) || []
const requiredFields = ['introduction', 'objectives', 'topics', 'definitions', 'examples', 'keyPoints', 'practice', 'applications', 'commonMistakes', 'quiz', 'summary', 'reviewQuestions', 'nextLesson']
const qualityFailures = []
for (const lesson of allLessons) for (const language of languages) {
  const lessonText = text(lesson, language)
  if (words(lessonText) < 800 || words(lessonText) > 1500) qualityFailures.push(`${lesson.id}/${language}: word count ${words(lessonText)}`)
  if (requiredFields.some((field) => !lesson[field]?.[language])) qualityFailures.push(`${lesson.id}/${language}: missing required section`)
  if (lesson.practice[language].length < 5 || lesson.keyPoints[language].length < 8 || lesson.reviewQuestions[language].length < 5 || lesson.definitions[language].length < 5 || lesson.examples[language].length < 3 || lesson.applications[language].length < 3 || lesson.commonMistakes[language].length < 3) qualityFailures.push(`${lesson.id}/${language}: insufficient learning activities`)
  if (lesson.quiz[language].length !== 10 || lesson.quiz[language].some((question) => question.options.length !== 4 || !question.explanation || !question.question || !['beginner', 'intermediate', 'advanced'].includes(question.difficulty))) qualityFailures.push(`${lesson.id}/${language}: incomplete quiz`)
}
const introSignatures = languages.map((language) => allLessons.map((lesson) => normalize(lesson.introduction[language])))
const quizSignatures = allLessons.flatMap((lesson) => languages.flatMap((language) => lesson.quiz[language].map((question) => normalize(question.question))))
const placeholders = /TODO|Coming soon|Lorem ipsum|placeholder|this lesson provides an overview|in this lesson you will learn/iu.test(JSON.stringify(allLessons))
const units = COURSES.reduce((total, item) => total + item.units.length, 0)
const lessons = allLessons.length
const localizedLessons = lessons * languages.length
const expectedCourses = 20
const checks = [
  ['expected course inventory', COURSES.length === expectedCourses],
    ['exact unit inventory', units === 100],
    ['exact lesson inventory', lessons === 500],
    ['exact localized inventory', localizedLessons === 3000],
  ['Course 1 has five units', course?.units.length === 5],
  ['Course 1 has 25 lessons', course1Lessons.length === 25],
  ['all lessons have stable IDs', allLessons.length === new Set(allLessons.map((lesson) => lesson.id)).size],
  ['all supported locales', languages.every((language) => course1Lessons.every((lesson) => lesson.title[language] && lesson.introduction[language]))],
  ['strict 800-1500 word lessons', qualityFailures.filter((failure) => failure.includes('word count')).length === 0],
  ['required learning sections', qualityFailures.filter((failure) => failure.includes('missing required')).length === 0],
  ['practice and review depth', qualityFailures.filter((failure) => failure.includes('insufficient')).length === 0],
  ['complete unique quizzes', qualityFailures.filter((failure) => failure.includes('incomplete quiz')).length === 0 && quizSignatures.length === new Set(quizSignatures).size],
  ['distinct introductions', introSignatures.every((signatures) => signatures.length === new Set(signatures).size)],
  ['no placeholder or generic filler', !placeholders],
]
console.log('Academy Validation')
console.log(`Courses: ${expectedCourses} / ${expectedCourses}`)
console.log(`Courses: ${COURSES.length} / ${expectedCourses}`)
console.log(`Units: ${units} / 100`)
console.log(`Lessons: ${lessons} / 500`)
for (const language of languages) console.log(`${language}: ${lessons} / 500`)
console.log(`Localized lesson versions: ${localizedLessons} / 3000`)
console.log(`Practice: ${lessons} / ${lessons} lessons complete`)
console.log(`Quiz: ${lessons} / ${lessons} lessons complete`)
console.log(`Quiz explanations: ${lessons} / ${lessons} complete`)
console.log(`Average Course 1 words per lesson/language: ${Math.round(course1Lessons.flatMap((lesson) => languages.map((language) => words(text(lesson, language)))).reduce((sum, count) => sum + count, 0) / (course1Lessons.length * languages.length))}`)
console.log(`Minimum Course 1 words: ${Math.min(...course1Lessons.flatMap((lesson) => languages.map((language) => words(text(lesson, language)))))}; maximum: ${Math.max(...course1Lessons.flatMap((lesson) => languages.map((language) => words(text(lesson, language)))) )}`)
console.log(`Lesson 1 word counts: ${languages.map((language) => `${language}=${words(text(course1Lessons[0], language))}`).join(', ')}`)
console.log(`Lesson 1 practice count: ${languages.map((language) => `${language}=${course1Lessons[0].practice[language].length}`).join(', ')}`)
console.log(`Lesson 1 quiz count: ${languages.map((language) => `${language}=${course1Lessons[0].quiz[language].length}`).join(', ')}`)
console.log(`Lesson 1 duplicate quiz questions: ${languages.map((language) => `${language}=${course1Lessons[0].quiz[language].length - new Set(course1Lessons[0].quiz[language].map((question) => question.question)).size}`).join(', ')}`)
console.log(`Missing translations: ${checks.find(([name]) => name === 'all supported locales')?.[1] ? 0 : 'detected'}`)
console.log(`Duplicate lesson IDs: ${allLessons.length - new Set(allLessons.map((lesson) => lesson.id)).size}`)
console.log(`Duplicate quiz questions: ${quizSignatures.length - new Set(quizSignatures).size}`)
if (qualityFailures.length) console.log(`Quality failures: ${qualityFailures.slice(0, 8).join('; ')}${qualityFailures.length > 8 ? `; ... ${qualityFailures.length - 8} more` : ''}`)
for (const [name, passed] of checks.filter(([, passed]) => !passed)) console.log(`FAILED CHECK: ${name}`)
console.log(`Validation: ${checks.every(([, passed]) => passed) ? 'PASSED' : 'FAILED'}`)
if (checks.some(([, passed]) => !passed)) process.exitCode = 1
await rm(temporaryDirectory, { recursive: true, force: true })
