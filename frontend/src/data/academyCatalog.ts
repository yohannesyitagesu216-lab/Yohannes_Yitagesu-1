import type { AcademyLanguage, Localized } from './academyContent'

export const ACADEMY_LANGUAGES: Array<{ code: AcademyLanguage; label: string }> = [
  { code: 'en', label: 'English' }, { code: 'am', label: 'አማርኛ' }, { code: 'om', label: 'Afaan Oromo' },
  { code: 'fr', label: 'Français' }, { code: 'ar', label: 'العربية' }, { code: 'es', label: 'Español' },
]

export interface AcademyCourseCatalog {
  id: string
  title: Localized<string>
  description: Localized<string>
  category: Localized<string>
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  image: string
  color: string
  lessonCount: number
  units: Array<{ lessons: unknown[] }>
}

const languages: AcademyLanguage[] = ACADEMY_LANGUAGES.map((language) => language.code)
const localized = (english: string): Localized<string> => Object.fromEntries(languages.map((language) => [language, english])) as Localized<string>

const entries: Array<[string, string, string, string, 'Beginner' | 'Intermediate' | 'Advanced', string, string, string]> = [
  ['intro-agriculture', 'Introduction to Agriculture', 'Foundations', 'Understand farms as connected biological, economic, and social systems.', 'Beginner', '8 hours', '🌾', 'from-green-600 to-lime-500'],
  ['soil-science', 'Soil Science', 'Soil Management', 'Learn soil texture, structure, biology, fertility, and conservation.', 'Beginner', '8 hours', '🌱', 'from-amber-600 to-yellow-500'],
  ['crop-production', 'Crop Production', 'Crop Production', 'Plan a crop from seed selection through harvest and storage.', 'Beginner', '10 hours', '🌿', 'from-emerald-600 to-green-500'],
  ['plant-nutrition', 'Plant Nutrition', 'Plant Nutrition', 'Diagnose nutrient needs and manage fertilizers precisely.', 'Intermediate', '8 hours', '🧪', 'from-cyan-600 to-blue-500'],
  ['irrigation-management', 'Irrigation Management', 'Irrigation', 'Use crop, soil, and weather information to irrigate efficiently.', 'Intermediate', '9 hours', '💧', 'from-blue-600 to-sky-400'],
  ['pest-management', 'Pest Management', 'Pest Management', 'Build an integrated pest management plan using monitoring and thresholds.', 'Intermediate', '9 hours', '🐞', 'from-red-600 to-orange-500'],
  ['plant-disease', 'Plant Disease Management', 'Plant Health', 'Recognize disease patterns and combine prevention, diagnosis, and treatment.', 'Intermediate', '10 hours', '🩺', 'from-violet-600 to-fuchsia-500'],
  ['sustainable-agriculture', 'Sustainable and Organic Agriculture', 'Sustainability', 'Protect soil, water, biodiversity, and livelihoods through sustainable, organic, and climate-smart practices.', 'Intermediate', '10 hours', '♻️', 'from-teal-600 to-emerald-500'],
  ['agricultural-technology', 'Smart Farming and Precision Agriculture', 'Smart Agriculture', 'Use field data, maps, sensors, and decision tools to manage variation precisely.', 'Advanced', '10 hours', '🛰️', 'from-sky-600 to-cyan-500'],
  ['smart-farming-ai', 'Artificial Intelligence in Agriculture', 'Artificial Intelligence', 'Apply machine learning, computer vision, and responsible AI to agricultural decisions.', 'Advanced', '10 hours', '🤖', 'from-indigo-600 to-blue-500'],
  ['farm-business', 'Farm Business Management', 'Farm Business', 'Turn production records into budgets, market plans, and resilient income.', 'Beginner', '8 hours', '📊', 'from-orange-600 to-amber-500'],
  ['vegetable-production', 'Vegetable Production', 'Crop Production', 'Study vegetable crop planning and field practice.', 'Beginner', '10 hours', '🥕', 'from-green-600 to-emerald-500'],
  ['fruit-production', 'Fruit Production', 'Crop Production', 'Study fruit crop planning and field practice.', 'Beginner', '10 hours', '🍊', 'from-orange-500 to-yellow-400'],
  ['cereal-grain-production', 'Cereal and Grain Production', 'Crop Production', 'Study cereal and grain production systems.', 'Beginner', '10 hours', '🌽', 'from-yellow-600 to-amber-500'],
  ['legume-production', 'Legume Production', 'Crop Production', 'Study legume biology, production, rotation, and storage.', 'Beginner', '9 hours', '🫘', 'from-lime-600 to-green-500'],
  ['livestock-agriculture', 'Livestock Agriculture', 'Livestock', 'Study livestock systems, production, health, and welfare.', 'Intermediate', '12 hours', '🐄', 'from-stone-600 to-amber-500'],
  ['agricultural-economics', 'Agricultural Economics', 'Farm Business', 'Study farm costs, income, markets, prices, and value chains.', 'Intermediate', '9 hours', '💰', 'from-emerald-600 to-teal-500'],
  ['agricultural-engineering', 'Agricultural Engineering and Mechanization', 'Technology', 'Study mechanization planning, equipment operation, and safety.', 'Advanced', '10 hours', '🚜', 'from-slate-600 to-blue-500'],
  ['iot-drones-technology', 'IoT, Drones and Agricultural Technology', 'Technology', 'Study sensors, drones, mapping, and smart farm systems.', 'Advanced', '10 hours', '📡', 'from-cyan-600 to-sky-500'],
  ['advanced-future-farming', 'Advanced Agriculture and Future Farming', 'Smart Agriculture', 'Study climate resilience, digital agriculture, biotechnology, and innovation.', 'Advanced', '11 hours', '🏙️', 'from-violet-600 to-indigo-500'],
]

export const COURSE_CATALOG: AcademyCourseCatalog[] = entries.map(([id, title, category, description, level, duration, image, color]) => ({
  id, title: localized(title), category: localized(category), description: localized(description), level, duration, image, color, lessonCount: 25,
  units: Array.from({ length: 5 }, () => ({ lessons: Array.from({ length: 5 }) })),
}))

export const COURSE_LESSON_COUNTS: Record<string, number> = Object.fromEntries(COURSE_CATALOG.map((course) => [course.id, course.lessonCount]))

export const ACADEMY_COURSE_ALIASES: Record<string, string> = {
  'organic-agriculture': 'sustainable-agriculture',
}

export async function loadAcademyCourse(courseId: string) {
  const resolvedCourseId = ACADEMY_COURSE_ALIASES[courseId] || courseId
  if (!COURSE_CATALOG.some((course) => course.id === resolvedCourseId)) return undefined
  const module = await import('./academyContent')
  return module.COURSES.find((course) => course.id === resolvedCourseId)
}
