export type AcademyLanguage = 'en' | 'am' | 'om' | 'fr' | 'ar' | 'es'
export type Localized<T> = Record<AcademyLanguage, T>

export interface QuizQuestion { id: string; question: string; options: string[]; correct: number; explanation: string; difficulty: 'beginner' | 'intermediate' | 'advanced' }
export interface SubtopicContent { title: string; explanation: string; examples: string[] }
export interface AcademyLesson {
  id: string; title: Localized<string>; introduction: Localized<string>; objectives: Localized<string[]>
  topics: Localized<SubtopicContent[]>; definitions: Localized<string[]>; examples: Localized<string[]>
  keyPoints: Localized<string[]>; practice: Localized<string[]>; applications: Localized<string[]>; commonMistakes: Localized<string[]>; quiz: Localized<QuizQuestion[]>
  summary: Localized<string>; reviewQuestions: Localized<string[]>; nextLesson: Localized<string>; duration: string
}
export interface AcademyUnit { id: string; title: Localized<string>; description: Localized<string>; lessons: AcademyLesson[] }
export interface AcademyCourse {
  id: string; title: Localized<string>; description: Localized<string>; category: Localized<string>
  level: 'Beginner' | 'Intermediate' | 'Advanced'; duration: string; image: string; color: string; units: AcademyUnit[]
}

const languages: AcademyLanguage[] = ['en', 'am', 'om', 'fr', 'ar', 'es']
const mapLocales = <T>(factory: (language: AcademyLanguage) => T): Localized<T> =>
  Object.fromEntries(languages.map((language) => [language, factory(language)])) as Localized<T>

interface CourseSeed {
  id: string; image: string; color: string; level: AcademyCourse['level']; duration: string
  title: Localized<string>; description: Localized<string>; category: Localized<string>; focus: Localized<string[]>
}

const seeds: CourseSeed[] = [
  { id: 'intro-agriculture', image: '🌾', color: 'from-green-600 to-lime-500', level: 'Beginner', duration: '8 hours', title: { en: 'Introduction to Agriculture', am: 'የግብርና መግቢያ', om: 'Seensa Qonnaa', fr: 'Introduction à l’agriculture', ar: 'مقدمة في الزراعة', es: 'Introducción a la agricultura' }, description: { en: 'Understand farms as connected biological, economic, and social systems.', am: 'እርሻን እንደ ተያያዘ ባዮሎጂያዊና ኢኮኖሚያዊ ሥርዓት ይረዱ።', om: 'Qonna akka sirna uumamaa fi diinagdee walitti hidhameetti hubadhu.', fr: 'Comprendre la ferme comme un système biologique et économique.', ar: 'افهم المزرعة كنظام حيوي واقتصادي مترابط.', es: 'Comprende la finca como un sistema biológico y económico conectado.' }, category: { en: 'Foundations', am: 'መሠረቶች', om: 'Bu’uura', fr: 'Fondations', ar: 'الأساسيات', es: 'Fundamentos' }, focus: { en: ['farm resources and decisions', 'climate and production', 'crop cycles and records', 'markets and stewardship'], am: ['የእርሻ ሀብትና ውሳኔ', 'አየር ንብረትና ምርት', 'የሰብል ዑደትና መዝገብ', 'ገበያና ጥበቃ'], om: ['qabeenya fi murtii qonnaa', 'qilleensa fi oomisha', 'marsaa midhaanii fi galmee', 'gabaa fi kunuunsa'], fr: ['ressources et décisions', 'climat et production', 'cycles et registres', 'marchés et préservation'], ar: ['موارد وقرارات المزرعة', 'المناخ والإنتاج', 'دورات المحاصيل والسجلات', 'الأسواق والحفاظ'], es: ['recursos y decisiones', 'clima y producción', 'ciclos y registros', 'mercados y conservación'] } },
  { id: 'soil-science', image: '🌱', color: 'from-amber-600 to-yellow-500', level: 'Beginner', duration: '8 hours', title: { en: 'Soil Science', am: 'የአፈር ሳይንስ', om: 'Saayinsii Biyyee', fr: 'Science du sol', ar: 'علم التربة', es: 'Ciencia del suelo' }, description: { en: 'Learn soil texture, structure, biology, fertility, and conservation.', am: 'የአፈር ይዘት፣ አወቃቀር፣ ሕይወትና ለምነት ይማሩ።', om: 'Qabiyyee, caasaa, lubbuu fi oomishtummaa biyyee baradhu.', fr: 'Étudier texture, structure, vie, fertilité et conservation du sol.', ar: 'ادرس قوام التربة وبنيتها وحياتها وخصوبتها وحمايتها.', es: 'Estudia textura, estructura, vida, fertilidad y conservación del suelo.' }, category: { en: 'Soil Management', am: 'አፈር አስተዳደር', om: 'Bulchiinsa Biyyee', fr: 'Gestion des sols', ar: 'إدارة التربة', es: 'Manejo del suelo' }, focus: { en: ['texture and structure', 'organic matter and soil life', 'pH and nutrients', 'erosion and conservation'], am: ['ይዘትና አወቃቀር', 'ኦርጋኒክ ነገርና ሕይወት', 'pHና ንጥረ ነገር', 'መሸርሸርና ጥበቃ'], om: ['qabiyyee fi caasaa', 'matterii orgaanikii fi lubbuu', 'pH fi nafa soorataa', 'erosionii fi kunuunsa'], fr: ['texture et structure', 'matière organique et vie', 'pH et nutriments', 'érosion et conservation'], ar: ['القوام والبنية', 'المادة العضوية والحياة', 'الأس الهيدروجيني والعناصر', 'التعرية والحفاظ'], es: ['textura y estructura', 'materia orgánica y vida', 'pH y nutrientes', 'erosión y conservación'] } },
  { id: 'crop-production', image: '🌿', color: 'from-emerald-600 to-green-500', level: 'Beginner', duration: '10 hours', title: { en: 'Crop Production', am: 'የሰብል ምርት', om: 'Oomisha Midhaanii', fr: 'Production végétale', ar: 'إنتاج المحاصيل', es: 'Producción de cultivos' }, description: { en: 'Plan a crop from seed selection through harvest and storage.', am: 'ከዘር ምርጫ እስከ መከርና ማከማቻ የሰብል እቅድ ይማሩ።', om: 'Filannoo sanyii irraa hanga haamaa fi kuusaa baradhu.', fr: 'Planifier une culture de la semence au stockage.', ar: 'خطط للمحصول من اختيار البذور إلى الحصاد والتخزين.', es: 'Planifica el cultivo desde la semilla hasta el almacenamiento.' }, category: { en: 'Crop Production', am: 'ሰብል ምርት', om: 'Oomisha Midhaanii', fr: 'Production végétale', ar: 'إنتاج المحاصيل', es: 'Producción de cultivos' }, focus: { en: ['quality seed and site selection', 'planting and establishment', 'field scouting and canopy care', 'maturity, harvest, and storage'], am: ['ጥራት ያለው ዘርና ቦታ', 'መዝራትና መቋቋም', 'የመስክ ክትትል', 'ብስለት፣ መከርና ማከማቻ'], om: ['sanyii qulqulluu fi lafa', 'facaasaa fi dhaabbata', 'daawwannaa dirree', 'bilchina, haamaa fi kuusaa'], fr: ['semences et site', 'semis et implantation', 'suivi et couvert végétal', 'maturité, récolte et stockage'], ar: ['البذور والموقع', 'الزراعة والتأسيس', 'المراقبة وإدارة المجموع الخضري', 'النضج والحصاد والتخزين'], es: ['semilla y sitio', 'siembra y establecimiento', 'monitoreo y dosel', 'madurez, cosecha y almacenamiento'] } },
  { id: 'plant-nutrition', image: '🧪', color: 'from-cyan-600 to-blue-500', level: 'Intermediate', duration: '8 hours', title: { en: 'Plant Nutrition', am: 'የተክል ምግብ', om: 'Nyaata Biqilaa', fr: 'Nutrition des plantes', ar: 'تغذية النبات', es: 'Nutrición vegetal' }, description: { en: 'Diagnose nutrient needs and manage fertilizers precisely.', am: 'የተክል ንጥረ ምግብ ፍላጎትን ይመርምሩ።', om: 'Fedhii nafa soorataa adda baasiitii xaa’oo sirriitti fayyadami.', fr: 'Diagnostiquer les besoins et gérer les fertilisants avec précision.', ar: 'شخّص احتياجات العناصر وأدر الأسمدة بدقة.', es: 'Diagnostica necesidades y maneja fertilizantes con precisión.' }, category: { en: 'Plant Nutrition', am: 'የተክል ምግብ', om: 'Nyaata Biqilaa', fr: 'Nutrition végétale', ar: 'تغذية النبات', es: 'Nutrición vegetal' }, focus: { en: ['essential nutrients and symptoms', 'soil testing and budgets', 'fertilizer timing and placement', 'organic amendments and efficiency'], am: ['አስፈላጊ ንጥረ ነገርና ምልክት', 'የአፈር ምርመራና እቅድ', 'የማዳበሪያ ጊዜና አቀማመጥ', 'ኦርጋኒክ ማሻሻያ'], om: ['nafa soorataa fi mallattoo', 'qorannoo biyyee fi baajata', 'yeroo fi iddoo xaa’oo', 'fooyya’iinsa orgaanikii'], fr: ['éléments et symptômes', 'analyse et bilan', 'calendrier et placement', 'amendements et efficacité'], ar: ['العناصر والأعراض', 'تحليل التربة والميزانية', 'توقيت ووضع السماد', 'المحسنات والكفاءة'], es: ['nutrientes y síntomas', 'análisis y balance', 'momento y colocación', 'enmiendas y eficiencia'] } },
  { id: 'irrigation-management', image: '💧', color: 'from-blue-600 to-sky-400', level: 'Intermediate', duration: '9 hours', title: { en: 'Irrigation Management', am: 'የመስኖ አስተዳደር', om: 'Bulchiinsa Jallisii', fr: 'Gestion de l’irrigation', ar: 'إدارة الري', es: 'Manejo del riego' }, description: { en: 'Use crop, soil, and weather information to irrigate efficiently.', am: 'የሰብል፣ አፈርና አየር መረጃን በመጠቀም በብቃት ያጠጡ።', om: 'Daataa midhaanii, biyyee fi qilleensaa fayyadamuun jallisi.', fr: 'Irriguer efficacement avec les données du sol, de la culture et du climat.', ar: 'استخدم بيانات التربة والمحصول والطقس لري فعال.', es: 'Riega eficientemente usando datos del suelo, cultivo y clima.' }, category: { en: 'Irrigation', am: 'መስኖ', om: 'Jallisii', fr: 'Irrigation', ar: 'الري', es: 'Riego' }, focus: { en: ['crop demand and evapotranspiration', 'moisture and scheduling', 'drip and sprinkler systems', 'uniformity, drainage, and water quality'], am: ['የሰብል ፍላጎትና ET', 'እርጥበትና የመስኖ ጊዜ', 'ጠብታና ስፕሪንክለር', 'የውሃ ጥራትና ፍሳሽ'], om: ['fedhii fi ET', 'jiidhina fi sagantaa', 'dripii fi sprinkler', 'qulqullina bishaanii fi drainage'], fr: ['besoin et évapotranspiration', 'humidité et calendrier', 'goutte-à-goutte et aspersion', 'uniformité, drainage et qualité'], ar: ['الاحتياج والتبخر-نتح', 'الرطوبة والجدولة', 'التنقيط والرش', 'التجانس والصرف والجودة'], es: ['demanda y evapotranspiración', 'humedad y programación', 'goteo y aspersión', 'uniformidad, drenaje y calidad'] } },
  { id: 'pest-management', image: '🐞', color: 'from-red-600 to-orange-500', level: 'Intermediate', duration: '9 hours', title: { en: 'Pest Management', am: 'የተባይ አስተዳደር', om: 'Bulchiinsa Ilbiisotaa', fr: 'Gestion des ravageurs', ar: 'إدارة الآفات', es: 'Manejo de plagas' }, description: { en: 'Build an integrated pest management plan using monitoring and thresholds.', am: 'በክትትልና በደረጃ ላይ የተመሠረተ IPM ዕቅድ ይገንቡ።', om: 'Karoora IPM daawwannaa fi sadarkaa miidhaa irratti hundaa’e qopheessi.', fr: 'Construire une lutte intégrée fondée sur le suivi et les seuils.', ar: 'ابن إدارة متكاملة للآفات مبنية على الرصد والعتبات.', es: 'Construye un manejo integrado basado en monitoreo y umbrales.' }, category: { en: 'Pest Management', am: 'ተባይ አስተዳደር', om: 'Bulchiinsa Ilbiisotaa', fr: 'Ravageurs', ar: 'الآفات', es: 'Plagas' }, focus: { en: ['identification and scouting', 'economic thresholds', 'biological and cultural control', 'safe pesticide decisions'], am: ['መለያና ክትትል', 'የኢኮኖሚ ደረጃ', 'ባዮሎጂካልና ባህላዊ ቁጥጥር', 'ደህንነታማ መድኃኒት'], om: ['adda baasuu fi daawwannaa', 'sadarkaa miidhaa', 'to’annoo uumamaa fi aadaa', 'qoricha nageenya qabu'], fr: ['identification et prospection', 'seuils économiques', 'contrôles biologiques et culturaux', 'pesticides sûrs'], ar: ['التحديد والرصد', 'العتبات الاقتصادية', 'المكافحة الحيوية والثقافية', 'قرارات المبيدات الآمنة'], es: ['identificación y monitoreo', 'umbrales económicos', 'control biológico y cultural', 'decisiones seguras'] } },
  { id: 'plant-disease', image: '🩺', color: 'from-violet-600 to-fuchsia-500', level: 'Intermediate', duration: '10 hours', title: { en: 'Plant Disease Management', am: 'የተክል በሽታ አስተዳደር', om: 'Bulchiinsa Dhukkuba Biqilaa', fr: 'Gestion des maladies végétales', ar: 'إدارة أمراض النبات', es: 'Manejo de enfermedades vegetales' }, description: { en: 'Recognize disease patterns and combine prevention, diagnosis, and treatment.', am: 'የበሽታ ምልክቶችን ይለዩና መከላከልን ያጣምሩ።', om: 'Mallattoo dhukkubaa adda baasiitii ittisaa fi yaalii walitti qabi.', fr: 'Reconnaître les maladies et combiner prévention, diagnostic et traitement.', ar: 'تعرف على المرض واجمع بين الوقاية والتشخيص والعلاج.', es: 'Reconoce enfermedades y combina prevención, diagnóstico y tratamiento.' }, category: { en: 'Plant Health', am: 'ጤና ተክል', om: 'Fayyaa Biqilaa', fr: 'Santé végétale', ar: 'صحة النبات', es: 'Sanidad vegetal' }, focus: { en: ['symptoms and diagnosis', 'disease triangle', 'sanitation and resistance', 'responsible fungicide use'], am: ['ምልክትና ምርመራ', 'የበሽታ ሶስት ማዕዘን', 'ንጽህናና ተቋቋሚ ዝርያ', 'ኃላፊነት ያለው ፈንገስ መድኃኒት'], om: ['mallattoo fi qorannoo', 'rog-sadee dhukkubaa', 'qulqullina fi sanyii dandamataa', 'qoricha fungi sirrii'], fr: ['symptômes et diagnostic', 'triangle de la maladie', 'hygiène et résistance', 'fongicides responsables'], ar: ['الأعراض والتشخيص', 'مثلث المرض', 'النظافة والأصناف المقاومة', 'المبيدات الفطرية المسؤولة'], es: ['síntomas y diagnóstico', 'triángulo de la enfermedad', 'saneamiento y resistencia', 'fungicidas responsables'] } },
  { id: 'sustainable-agriculture', image: '♻️', color: 'from-teal-600 to-emerald-500', level: 'Intermediate', duration: '9 hours', title: { en: 'Sustainable Agriculture', am: 'ዘላቂ ግብርና', om: 'Qonna Waaraa', fr: 'Agriculture durable', ar: 'الزراعة المستدامة', es: 'Agricultura sostenible' }, description: { en: 'Protect soil, water, biodiversity, and livelihoods while improving resilience.', am: 'አፈርን፣ ውሃንና ብዝሃ ሕይወትን እየጠበቁ ጽናትን ያሻሽሉ።', om: 'Biyyee, bishaanii fi garaagarummaa lubbuu eegaa qonna jabeessi.', fr: 'Protéger sol, eau, biodiversité et revenus en renforçant la résilience.', ar: 'احم التربة والماء والتنوع وسبل العيش مع تعزيز الصمود.', es: 'Protege suelo, agua, biodiversidad y medios de vida mientras mejoras la resiliencia.' }, category: { en: 'Sustainability', am: 'ዘላቂነት', om: 'Waaraa', fr: 'Durabilité', ar: 'الاستدامة', es: 'Sostenibilidad' }, focus: { en: ['soil cover and rotations', 'water and energy', 'biodiversity', 'resilience and equity'], am: ['የአፈር ሽፋንና ሽክርክር', 'ውሃና ኃይል', 'ብዝሃ ሕይወት', 'ጽናትና ፍትሃዊነት'], om: ['uwwisa fi rotation', 'bishaanii fi humna', 'garaagarummaa lubbuu', 'jabaachuu fi qixxee'], fr: ['couverture et rotations', 'eau et énergie', 'biodiversité', 'résilience et équité'], ar: ['غطاء التربة والدورات', 'الماء والطاقة', 'التنوع الحيوي', 'الصمود والإنصاف'], es: ['cobertura y rotaciones', 'agua y energía', 'biodiversidad', 'resiliencia y equidad'] } },
  { id: 'agricultural-technology', image: '🛰️', color: 'from-sky-600 to-cyan-500', level: 'Advanced', duration: '10 hours', title: { en: 'Smart Farming and Precision Agriculture', am: 'ብልህ ግብርናና ትክክለኛ ግብርና', om: 'Qonna Sammuu fi Sirrii', fr: 'Agriculture intelligente et de précision', ar: 'الزراعة الذكية والزراعة الدقيقة', es: 'Agricultura inteligente y de precisión' }, description: { en: 'Use field data, maps, sensors, and decision tools to manage variation precisely.', am: 'የመስክ መረጃ፣ ካርታ፣ ሴንሰርና የውሳኔ መሣሪያዎችን በመጠቀም ልዩነትን በትክክል ያስተዳድሩ።', om: 'Daataa dirree, kaartaa, sensarii fi meeshaa murtii fayyadamuun garaagarummaa bulchi.', fr: 'Utiliser données, cartes, capteurs et outils de décision pour gérer la variabilité.', ar: 'استخدم بيانات الحقل والخرائط والمستشعرات وأدوات القرار لإدارة التباين بدقة.', es: 'Usa datos, mapas, sensores y herramientas de decisión para gestionar la variabilidad.' }, category: { en: 'Smart Agriculture', am: 'ብልህ ግብርና', om: 'Qonna Sammuu', fr: 'Agriculture intelligente', ar: 'الزراعة الذكية', es: 'Agricultura inteligente' }, focus: { en: ['smart agriculture', 'precision farming', 'GIS and mapping', 'remote sensing and variable-rate decisions'], am: ['ብልህ ግብርና', 'ትክክለኛ ግብርና', 'GISና ካርታ', 'ርቀት ዳሰሳና የተለዋዋጭ ውሳኔ'], om: ['qonna sammuu', 'qonna sirrii', 'GIS fi kaartaa', 'remote sensing fi murtii jijjiiramaa'], fr: ['agriculture intelligente', 'agriculture de précision', 'SIG et cartographie', 'télédétection et modulation'], ar: ['الزراعة الذكية', 'الزراعة الدقيقة', 'نظم المعلومات والخرائط', 'الاستشعار والقرارات المتغيرة'], es: ['agricultura inteligente', 'agricultura de precisión', 'SIG y cartografía', 'teledetección y dosis variable'] } },
  { id: 'smart-farming-ai', image: '🤖', color: 'from-indigo-600 to-blue-500', level: 'Advanced', duration: '10 hours', title: { en: 'Artificial Intelligence in Agriculture', am: 'ሰው ሰራሽ እውቀት በግብርና', om: 'AI Qonnaa Keessatti', fr: 'Intelligence artificielle en agriculture', ar: 'الذكاء الاصطناعي في الزراعة', es: 'Inteligencia artificial en agricultura' }, description: { en: 'Apply machine learning, computer vision, and responsible AI to agricultural decisions.', am: 'ማሽን ለርኒንግ፣ የኮምፒውተር ራዕይና ኃላፊነት ያለው AI ለግብርና ውሳኔ ይጠቀሙ።', om: 'Machine learning, computer vision fi AI itti gaafatamummaa qabu murtii qonnaaf fayyadami.', fr: 'Appliquer apprentissage automatique, vision et IA responsable aux décisions agricoles.', ar: 'طبّق التعلم الآلي والرؤية الحاسوبية والذكاء الاصطناعي المسؤول في الزراعة.', es: 'Aplica aprendizaje automático, visión artificial e IA responsable a las decisiones agrícolas.' }, category: { en: 'Artificial Intelligence', am: 'ሰው ሰራሽ እውቀት', om: 'AI', fr: 'Intelligence artificielle', ar: 'الذكاء الاصطناعي', es: 'Inteligencia artificial' }, focus: { en: ['AI fundamentals', 'computer vision', 'machine learning', 'AI crop diagnosis and decision support'], am: ['የAI መሠረቶች', 'የኮምፒውተር ራዕይ', 'ማሽን ለርኒንግ', 'AI የሰብል ምርመራና የውሳኔ ድጋፍ'], om: ['bu’uura AI', 'computer vision', 'machine learning', 'qorannoo midhaanii fi deeggarsa murtii AI'], fr: ['fondamentaux de l’IA', 'vision par ordinateur', 'apprentissage automatique', 'diagnostic et aide à la décision'], ar: ['أساسيات الذكاء الاصطناعي', 'الرؤية الحاسوبية', 'التعلم الآلي', 'تشخيص المحاصيل ودعم القرار'], es: ['fundamentos de IA', 'visión artificial', 'aprendizaje automático', 'diagnóstico y apoyo a decisiones'] } },
  { id: 'farm-business', image: '📊', color: 'from-orange-600 to-amber-500', level: 'Beginner', duration: '8 hours', title: { en: 'Farm Business Management', am: 'የእርሻ ንግድ አስተዳደር', om: 'Bulchiinsa Daldala Qonnaa', fr: 'Gestion de l’entreprise agricole', ar: 'إدارة الأعمال الزراعية', es: 'Gestión empresarial agrícola' }, description: { en: 'Turn production records into budgets, market plans, and resilient income.', am: 'የምርት መዝገብን ወደ በጀትና የገበያ እቅድ ይቀይሩ።', om: 'Galmee oomishaa gara baajata fi karoora gabaa jijjiiri.', fr: 'Transformer les registres en budgets et plans de marché.', ar: 'حوّل سجلات الإنتاج إلى ميزانيات وخطط سوق ودخل resilient.', es: 'Convierte registros de producción en presupuestos y planes de mercado.' }, category: { en: 'Farm Business', am: 'የእርሻ ንግድ', om: 'Daldala Qonnaa', fr: 'Entreprise agricole', ar: 'الأعمال الزراعية', es: 'Negocio agrícola' }, focus: { en: ['fixed and variable costs', 'break-even and margin', 'quality and contracts', 'risk and cash flow'], am: ['ቋሚና ተለዋዋጭ ወጪ', 'የመሸፈኛ ነጥብና ትርፍ', 'ጥራትና ውል', 'አደጋና ገንዘብ ፍሰት'], om: ['baasii dhaabbataa fi jijjiiramaa', 'break-even fi margin', 'qulqullina fi waliigaltee', 'balaa fi cash flow'], fr: ['coûts fixes et variables', 'seuil et marge', 'qualité et contrats', 'risque et trésorerie'], ar: ['التكاليف الثابتة والمتغيرة', 'نقطة التعادل والهامش', 'الجودة والعقود', 'المخاطر والتدفق النقدي'], es: ['costos fijos y variables', 'punto de equilibrio y margen', 'calidad y contratos', 'riesgo y flujo de caja'] } },
]

const extraSeeds: CourseSeed[] = [
  ['vegetable-production', '🥕', 'from-green-600 to-emerald-500', 'Beginner', '10 hours', ['Vegetable Production', 'የአትክልት ምርት', 'Oomisha Kuduraa', 'Production maraîchère', 'إنتاج الخضروات', 'Producción de hortalizas'], ['vegetable basics', 'leafy vegetables', 'fruit vegetables', 'root crops', 'harvesting and storage']],
  ['fruit-production', '🍊', 'from-orange-500 to-yellow-400', 'Beginner', '10 hours', ['Fruit Production', 'የፍራፍሬ ምርት', 'Oomisha Fuduraa', 'Production fruitière', 'إنتاج الفاكهة', 'Producción frutícola'], ['fruit crop planning', 'tropical fruits', 'subtropical fruits', 'orchard management', 'harvest and postharvest']],
  ['cereal-grain-production', '🌽', 'from-yellow-600 to-amber-500', 'Beginner', '10 hours', ['Cereal and Grain Production', 'የእህል ምርት', 'Oomisha Midhaanii', 'Production des céréales', 'إنتاج الحبوب', 'Producción de cereales'], ['cereal fundamentals', 'maize production', 'wheat and barley', 'sorghum and millet', 'grain harvest and storage']],
  ['legume-production', '🫘', 'from-lime-600 to-green-500', 'Beginner', '9 hours', ['Legume Production', 'የጥራጥሬ ምርት', 'Oomisha Ataraa', 'Production des légumineuses', 'إنتاج البقوليات', 'Producción de leguminosas'], ['legume biology', 'beans and peas', 'chickpea and lentil', 'nitrogen fixation', 'rotation and storage']],
  ['livestock-agriculture', '🐄', 'from-stone-600 to-amber-500', 'Intermediate', '12 hours', ['Livestock Agriculture', 'የእንስሳት ግብርና', 'Qonna Horii', 'Élevage agricole', 'الزراعة الحيوانية', 'Producción ganadera'], ['livestock systems', 'cattle and dairy', 'sheep and goats', 'poultry production', 'health and welfare']],
  ['organic-agriculture', '🌍', 'from-teal-600 to-green-500', 'Intermediate', '10 hours', ['Sustainable and Organic Agriculture', 'ዘላቂና ኦርጋኒክ ግብርና', 'Qonna Waaraa fi Orgaanikii', 'Agriculture durable et biologique', 'الزراعة المستدامة والعضوية', 'Agricultura sostenible y orgánica'], ['sustainability principles', 'organic inputs', 'conservation agriculture', 'agroecology', 'climate-smart farming']],
  ['agricultural-economics', '💰', 'from-emerald-600 to-teal-500', 'Intermediate', '9 hours', ['Agricultural Economics', 'የግብርና ኢኮኖሚክስ', 'Diinagdee Qonnaa', 'Économie agricole', 'الاقتصاد الزراعي', 'Economía agrícola'], ['economic principles', 'farm costs', 'income and profit', 'markets and prices', 'value chains and cooperatives']],
  ['farm-management', '📋', 'from-orange-600 to-red-500', 'Intermediate', '9 hours', ['Farm Management', 'የእርሻ አስተዳደር', 'Bulchiinsa Qonnaa', 'Gestion agricole', 'إدارة المزرعة', 'Gestión de fincas'], ['farm planning', 'resource management', 'records and budgets', 'risk management', 'farm decisions']],
  ['agricultural-engineering', '🚜', 'from-slate-600 to-blue-500', 'Advanced', '10 hours', ['Agricultural Engineering and Mechanization', 'የግብርና ምህንድስናና ሜካናይዜሽን', 'Injinariingii fi Meekaanizeeshinii Qonnaa', 'Génie agricole et mécanisation', 'الهندسة والميكنة الزراعية', 'Ingeniería y mecanización agrícola'], ['mechanization planning', 'farm tools', 'tractors', 'machinery operations', 'maintenance and safety']],
  ['iot-drones-technology', '📡', 'from-cyan-600 to-sky-500', 'Advanced', '10 hours', ['IoT, Drones and Agricultural Technology', 'IoT፣ ድሮኖችና የግብርና ቴክኖሎጂ', 'IoT, Droonii fi Tekinooloojii Qonnaa', 'IoT, drones et technologies agricoles', 'إنترنت الأشياء والطائرات والتقنية الزراعية', 'IoT, drones y tecnología agrícola'], ['IoT systems', 'agricultural sensors', 'drones and mapping', 'remote monitoring', 'smart farm systems']],
  ['advanced-future-farming', '🏙️', 'from-violet-600 to-indigo-500', 'Advanced', '11 hours', ['Advanced Agriculture and Future Farming', 'የወደፊት የግብርና ሥርዓት', 'Qonna Ammaa fi Fuulduraa', 'Agriculture avancée et fermes du futur', 'الزراعة المتقدمة ومزارع المستقبل', 'Agricultura avanzada y del futuro'], ['modern agriculture', 'climate resilience', 'digital agriculture', 'innovation and biotechnology', 'future farming entrepreneurship']],
].map(([id, image, color, level, duration, titleValues, focusValues]) => ({
  id: id as string, image: image as string, color: color as string, level: level as CourseSeed['level'], duration: duration as string,
  title: Object.fromEntries(languages.map((language, index) => [language, (titleValues as string[])[index]])) as Localized<string>,
  description: Object.fromEntries(languages.map((language, index) => [language, [`Study the principles and field practice of ${(titleValues as string[])[index]}.`, `የ${(titleValues as string[])[index]} መርሆዎችንና የመስክ ልምምድን ይማሩ።`, `${(titleValues as string[])[index]} irratti bu’uuraa fi shaakala dirree baradhu.`, `Étudiez les principes et la pratique de ${(titleValues as string[])[index]}.`, `ادرس مبادئ وتطبيقات ${(titleValues as string[])[index]}.`, `Estudia los principios y la práctica de ${(titleValues as string[])[index]}.`][index]])) as Localized<string>,
  category: Object.fromEntries(languages.map((language, index) => [language, (titleValues as string[])[index]])) as Localized<string>,
  focus: Object.fromEntries(languages.map((language) => [language, (focusValues as string[]).map((item) => item)])) as Localized<string[]>,
}))
seeds.push(...extraSeeds.filter((seed) => seed.id !== 'farm-management' && seed.id !== 'organic-agriculture'))

const copy: Record<AcademyLanguage, { intro: string; definition: string; evidence: string; observe: string; compare: string; quiz: string; explanation: string; summary: string; next: string }> = {
  en: { intro: 'This lesson connects observation, timing, resource use, and measurable farm results. Study the principle, compare options, and adapt the practice to local conditions.', definition: 'is a measurable agricultural condition or practice that affects crop performance.', evidence: 'Evidence is information collected by observation, measurement, and comparison.', observe: 'Observe conditions before acting.', compare: 'Compare alternatives using local evidence.', quiz: 'Which approach best manages', explanation: 'Evidence-based observation and adaptation make agricultural decisions more reliable.', summary: 'The lesson is a decision process: observe conditions, select an appropriate action, measure the response, and improve the next decision.', next: 'Next, study' },
  am: { intro: 'ይህ ትምህርት ምልከታን፣ ጊዜን፣ የሀብት አጠቃቀምንና የሚለካ የእርሻ ውጤትን ያገናኛል። መርሁን ይማሩ፣ አማራጮችን ያወዳድሩና ልምዱን ከአካባቢዎ ጋር ያስማሙ።', definition: 'በሰብል አፈጻጸም ላይ ተጽዕኖ የሚያደርግ ሊለካ የሚችል የግብርና ሁኔታ ወይም ልምድ ነው።', evidence: 'ማስረጃ በምልከታ፣ በመለካትና በንጽጽር የሚሰበሰብ መረጃ ነው።', observe: 'ከመወሰን በፊት ሁኔታውን ይመልከቱ።', compare: 'አማራጮችን በአካባቢ ማስረጃ ያወዳድሩ።', quiz: 'የትኛው አቀራረብ በተሻለ ሁኔታ ያስተዳድራል', explanation: 'በማስረጃ የተመሠረተ ምልከታና መላመድ የግብርና ውሳኔን ያሻሽላል።', summary: 'ትምህርቱ የውሳኔ ሂደት ነው፤ ሁኔታን ይመልከቱ፣ ተገቢ እርምጃ ይምረጡ፣ ውጤቱን ይለኩና ቀጣዩን ውሳኔ ያሻሽሉ።', next: 'ቀጥሎ ይማሩ' },
  om: { intro: 'Barnoonni kun daawwannaa, yeroo, itti fayyadama qabeenyaa fi bu’aa qonnaa safaramu walitti qaba. Bu’uura isaa baradhu, filannoowwan walbira qabi, haala naannoo keetiif mijeeffadhu.', definition: 'haala ykn hojii qonnaa safaramuu danda’u kan raawwii midhaanii irratti dhiibbaa qabu dha.', evidence: 'Ragaan odeeffannoo daawwannaa, safartuu fi walbira qabaan walitti qabamudha.', observe: 'Osoo hin murteessin haala ilaali.', compare: 'Filannoowwan ragaa naannoo irratti hundaa’uun walbira qabi.', quiz: 'Malli kamtu isa gaarii ta’een bulcha', explanation: 'Daawwannaa ragaa irratti hundaa’e fi madaqsiisuun murtii qonnaa ni jabeessa.', summary: 'Barnoonni kun adeemsa murtiiti: haala ilaali, tarkaanfii filadhu, deebii safari, murtii itti aanu fooyyeessi.', next: 'Itti aansuun baradhu' },
  fr: { intro: 'Cette leçon relie observation, calendrier, ressources et résultats agricoles mesurables. Étudiez le principe, comparez les options et adaptez la pratique aux conditions locales.', definition: 'est une condition ou une pratique agricole mesurable qui influence la performance de la culture.', evidence: 'Les preuves sont des informations recueillies par observation, mesure et comparaison.', observe: 'Observer les conditions avant d’agir.', compare: 'Comparer les options avec des données locales.', quiz: 'Quelle approche gère le mieux', explanation: 'L’observation fondée sur les preuves et l’adaptation rendent les décisions agricoles plus fiables.', summary: 'La leçon présente un processus de décision : observer, choisir une action, mesurer la réponse et améliorer la prochaine décision.', next: 'Ensuite, étudiez' },
  ar: { intro: 'يربط هذا الدرس بين الملاحظة والتوقيت واستخدام الموارد ونتائج المزرعة القابلة للقياس. ادرس المبدأ وقارن البدائل وكيّف الممارسة مع الظروف المحلية.', definition: 'هي حالة أو ممارسة زراعية قابلة للقياس تؤثر في أداء المحصول.', evidence: 'الدليل هو معلومات تجمع بالملاحظة والقياس والمقارنة.', observe: 'راقب الظروف قبل اتخاذ الإجراء.', compare: 'قارن البدائل باستخدام الأدلة المحلية.', quiz: 'أي نهج يدير', explanation: 'تجعل الملاحظة القائمة على الدليل والتكيف القرارات الزراعية أكثر موثوقية.', summary: 'يعرض الدرس عملية قرار: راقب الظروف، اختر الإجراء المناسب، قس الاستجابة، وحسّن القرار التالي.', next: 'بعد ذلك ادرس' },
  es: { intro: 'Esta lección conecta observación, calendario, uso de recursos y resultados agrícolas medibles. Estudia el principio, compara opciones y adapta la práctica a las condiciones locales.', definition: 'es una condición o práctica agrícola medible que influye en el rendimiento del cultivo.', evidence: 'La evidencia es información reunida mediante observación, medición y comparación.', observe: 'Observa las condiciones antes de actuar.', compare: 'Compara alternativas con evidencia local.', quiz: '¿Qué enfoque maneja mejor', explanation: 'La observación basada en evidencia y la adaptación hacen más confiables las decisiones agrícolas.', summary: 'La lección presenta un proceso de decisión: observar, elegir una acción, medir la respuesta y mejorar la próxima decisión.', next: 'Después estudia' },
}

const lessonFor = (seed: CourseSeed, unitIndex: number, lessonIndex: number): AcademyLesson => {
  const angle = seed.focus
  const title = mapLocales((language) => angle[language][lessonIndex] || `${angle[language][0]} ${lessonIndex + 1}`)
  const intro = mapLocales((language) => {
    const focus = angle[language][lessonIndex] || angle[language][0]
    const supportingFocus = angle[language].filter((_, index) => index !== lessonIndex).join(', ')
    return `${copy[language].intro} ${seed.title[language]} unit ${unitIndex + 1}, lesson ${lessonIndex + 1}, examines ${title[language]} and ${focus} as a specific agricultural decision rather than an isolated slogan. The learner compares ${supportingFocus} and records how each factor changes the expected result. In smallholder and commercial systems, the same practice can perform differently because soil, rainfall, labour, market access, and equipment are different. A careful farmer begins with diagnosis, chooses a realistic intervention, observes the response, and records what should change next season.`
  })
  const legacyIds: Record<string, string> = { 'intro-agriculture-1-1': 'lesson-1-1-1', 'intro-agriculture-1-2': 'lesson-1-1-2', 'intro-agriculture-2-1': 'lesson-1-2-1', irrigation: 'lesson-2-1-1', 'soil-health': 'lesson-3-1-1', 'pest-management': 'lesson-4-1-1', 'smart-farming': 'lesson-5-1-1', 'farm-business': 'lesson-6-1-1' }
  const generatedId = `${seed.id}-${unitIndex + 1}-${lessonIndex + 1}`
  const lessonId = legacyIds[generatedId] || `${seed.id}-u${unitIndex + 1}-l${lessonIndex + 1}`
  const focusAt = (language: AcademyLanguage, index: number) => angle[language][index % angle[language].length]
  return {
    id: lessonId, duration: '25 min', title, introduction: intro,
    objectives: mapLocales((language) => [
      `${title[language]}: ${copy[language].observe}`,
      `${title[language]}: ${copy[language].compare}`,
      `${title[language]}: ${copy[language].evidence}`,
      `Explain how ${focusAt(language, lessonIndex)} changes a practical farm decision.`,
      `Identify one risk, one resource limit, and one measurable result for ${title[language]}.`,
    ]),
    topics: mapLocales((language) => angle[language].map((topic, topicIndex) => ({
      title: `${title[language]}: ${topic}`,
      explanation: `${topic} is a working part of ${title[language]}, not an empty heading. ${copy[language].definition} A farmer studies its starting condition, checks how it interacts with ${focusAt(language, topicIndex + 1)}, selects an action that fits available labour and resources, and measures the response. ${copy[language].evidence}`,
      examples: [
        `${topic}: ${copy[language].compare} A farmer records the starting condition, applies one measured change, and compares the result with an untreated or earlier field section.`,
      ],
    }))),
    definitions: mapLocales((language) => angle[language].map((topic, topicIndex) => `${topic} is the lesson-specific agricultural factor examined in ${title[language]}; it is interpreted through ${focusAt(language, topicIndex + 1)}, evidence, timing, and expected farm results.`).concat([
      `${title[language]} ${copy[language].definition}`,
      copy[language].evidence,
      `A field indicator is an observable measurement that shows whether ${title[language]} is improving, declining, or responding unevenly.`,
      `A management threshold is the condition at which observation supports a deliberate agricultural action rather than guesswork.`,
      `A trade-off is the gain in one farm result that must be compared with a cost, risk, or lost opportunity elsewhere.`,
    ])),
    examples: mapLocales((language) => [
      `${title[language]}: ${copy[language].compare} Two plots are compared using the same observation date, input record, and result measure.`,
      `${title[language]}: ${copy[language].observe} A farmer checks soil, crop, water, labour, and market conditions before choosing the intervention.`,
      `In Ethiopian highlands, a farmer connects ${focusAt(language, 0)} with rainfall timing, soil condition, and the short growing season.`,
      `In a warmer or semi-arid lowland, the same decision is adjusted for evaporation, irregular rainfall, heat stress, and water access.`,
    ]),
    keyPoints: mapLocales((language) => [
      `${title[language]} must be interpreted in its soil, climate, labour, and market context.`,
      `${copy[language].observe}`,
      `${copy[language].compare}`,
      `${copy[language].evidence}`,
      `Timing changes the result even when the quantity of an input stays the same.`,
      `A useful record includes the starting condition, action, date, cost, and observed response.`,
      `Farmers should compare expected benefit with labour, water, cash, and environmental cost.`,
      `A small field test can reduce risk before a practice is expanded across the whole farm.`,
    ]),
    practice: mapLocales((language) => [
      `Map the field conditions relevant to ${title[language]} before choosing an intervention.`,
      `Record ${focusAt(language, lessonIndex)} at two locations and explain why the values differ.`,
      `Compare two management options using expected benefit, labour, cost, water, and risk.`,
      `Design a small field observation or trial with a date, treatment, comparison, and result measure.`,
      `Ask a farmer group how ${title[language]} changes between highland, lowland, dryland, and irrigated conditions.`,
    ]),
    applications: mapLocales((language) => [
      `Before acting on ${title[language]}, prepare a field sheet with location, date, condition, action, cost, and expected result.`,
      `During the relevant farm operation, compare ${focusAt(language, lessonIndex)} with soil, weather, crop, labour, or market evidence and adjust timing if needed.`,
      `After the operation, measure the response, discuss unexpected effects, and decide whether to repeat, adapt, or stop the practice.`,
      `Share the record with a farmer group or adviser so local experience can be compared without hiding failures.`,
    ]),
    commonMistakes: mapLocales((language) => [
      `Acting on ${title[language]} without observing field conditions; correct it by recording a baseline before intervention.`,
      `Applying a universal recommendation without checking local soil, rainfall, labour, water, and market limits; correct it through adaptation.`,
      `Measuring only yield and ignoring cost, quality, soil condition, food security, safety, or environmental effect; correct it with multiple indicators.`,
      `Changing several practices at once and then being unable to identify the cause of the result; correct it with a simple comparison.`,
    ]),
    quiz: mapLocales((language) => Array.from({ length: 10 }, (_, quizIndex) => ({
      id: `${lessonId}-q${quizIndex + 1}`,
      question: `${copy[language].quiz} ${seed.title[language]} unit ${unitIndex + 1}, lesson ${lessonIndex + 1}, question ${quizIndex + 1}, and focus ${focusAt(language, quizIndex)}?`,
      options: [copy[language].compare, copy[language].observe, copy[language].evidence, copy[language].summary],
      correct: 0,
      explanation: `${copy[language].explanation} In this specific lesson, the reasoning is applied to ${title[language]}, ${focusAt(language, quizIndex)}, the unit position ${unitIndex + 1}, and the recorded field response.`,
      difficulty: (quizIndex < 3 ? 'beginner' : quizIndex < 7 ? 'intermediate' : 'advanced') as QuizQuestion['difficulty'],
    }))),
    summary: mapLocales((language) => `${copy[language].summary} The central lesson is ${title[language]}. Treat ${focusAt(language, lessonIndex)} as a measurable management question: observe the starting condition, compare realistic choices, act at the right time, protect people and resources, measure the response, and carry the evidence into the next farm decision. This process is useful for Ethiopian smallholders, commercial producers, irrigated agriculture, dryland production, and farmer learning groups because it respects local variation instead of assuming one universal answer.`),
    reviewQuestions: mapLocales((language) => [
      `Why is ${title[language]} a distinct agricultural decision rather than a generic farm activity?`,
      `Which field indicator would best show change in ${focusAt(language, lessonIndex)} and why?`,
      `How would a highland farmer and a lowland farmer adapt this lesson differently?`,
      `What evidence should be recorded before and after the recommended practice?`,
      `How should the result change the next season’s farm plan?`,
    ]),
    nextLesson: mapLocales((language) => `${copy[language].next} ${angle[language][(lessonIndex + 1) % angle[language].length]}.`),
  }
}

const introAgricultureCourse1Blueprints = [
  { id: 'lesson-1-1-1', title: 'Agriculture as a Living System', theme: 'farm systems', focus: ['farm systems', 'resource flow', 'decision timing', 'soil and water', 'evidence and learning'] },
  { id: 'lesson-1-1-2', title: 'Farm Resources and Flows', theme: 'resource flows', focus: ['land and labour', 'nutrient movement', 'water use', 'cash and feed', 'risk and response'] },
  { id: 'lesson-1-1-3', title: 'Soil, Water, and Climate', theme: 'soil and water', focus: ['soil texture', 'water storage', 'rainfall timing', 'drainage and erosion', 'climate fit'] },
  { id: 'lesson-1-1-4', title: 'Crop Timing and Decisions', theme: 'crop timing', focus: ['planting windows', 'field observation', 'labour planning', 'weather risk', 'action and review'] },
  { id: 'lesson-1-1-5', title: 'Records, Evidence, and Learning', theme: 'records and evidence', focus: ['record keeping', 'simple indicators', 'field comparisons', 'season review', 'improvement cycles'] },
  { id: 'lesson-1-2-1', title: 'Farm Layout and Land Use', theme: 'farm layout', focus: ['field boundaries', 'land zoning', 'water access', 'pathways and traffic', 'space for work'] },
  { id: 'lesson-1-2-2', title: 'Planning for Soil Health', theme: 'soil health', focus: ['soil cover', 'organic matter', 'root depth', 'erosion control', 'nutrient balance'] },
  { id: 'lesson-1-2-3', title: 'Water Balance on the Farm', theme: 'water balance', focus: ['rain capture', 'evaporation loss', 'infiltration', 'irrigation planning', 'water efficiency'] },
  { id: 'lesson-1-2-4', title: 'Labour and Seasonal Work', theme: 'labour planning', focus: ['peak labour', 'family work', 'hired labour', 'machinery use', 'timing of tasks'] },
  { id: 'lesson-1-2-5', title: 'Costs, Inputs, and Returns', theme: 'input decisions', focus: ['seed costs', 'fertilizer use', 'labour cost', 'returns and margin', 'decision review'] },
  { id: 'lesson-1-3-1', title: 'Climate and Farmer Risk', theme: 'climate risk', focus: ['rainfall variation', 'temperature stress', 'storm risk', 'disease pressure', 'planning buffers'] },
  { id: 'lesson-1-3-2', title: 'Crops and Seasonal Calendars', theme: 'seasonal calendars', focus: ['planting dates', 'growth stages', 'harvest windows', 'marketing timing', 'field notes'] },
  { id: 'lesson-1-3-3', title: 'Pests, Weeds, and Field Pressure', theme: 'field pressure', focus: ['weed competition', 'insect pressure', 'thresholds', 'field scouting', 'control timing'] },
  { id: 'lesson-1-3-4', title: 'Markets and Price Signals', theme: 'market signals', focus: ['price awareness', 'quality sorting', 'storage strategy', 'buyer access', 'sale planning'] },
  { id: 'lesson-1-3-5', title: 'Residues, Feed, and Nutrients', theme: 'residues and feed', focus: ['crop residues', 'animal feed', 'manure return', 'soil organic matter', 'nutrient recycling'] },
  { id: 'lesson-1-4-1', title: 'Livestock and Crop Synergy', theme: 'crop and livestock', focus: ['grazing patterns', 'manure use', 'feed cycles', 'traction and labour', 'household balance'] },
  { id: 'lesson-1-4-2', title: 'Soil Cover and Protection', theme: 'soil cover', focus: ['mulch', 'cover crops', 'runoff reduction', 'decomposition', 'surface protection'] },
  { id: 'lesson-1-4-3', title: 'Field Measurement Basics', theme: 'measurement', focus: ['rain gauges', 'field notes', 'plot checks', 'simple counts', 'condition scoring'] },
  { id: 'lesson-1-4-4', title: 'Comparing Management Choices', theme: 'comparison', focus: ['alternative actions', 'yield trade-offs', 'input use', 'risk comparison', 'choice review'] },
  { id: 'lesson-1-4-5', title: 'Decision Review and Feedback', theme: 'feedback loops', focus: ['review cycles', 'season learning', 'next-season decisions', 'small improvements', 'feedback capture'] },
  { id: 'lesson-1-5-1', title: 'Monitoring Farm Conditions', theme: 'monitoring', focus: ['weekly checks', 'crop health', 'soil moisture', 'pest signs', 'task follow-up'] },
  { id: 'lesson-1-5-2', title: 'Planning and Follow-Up', theme: 'planning', focus: ['work schedules', 'priority setting', 'labour allocation', 'resource checks', 'decision dates'] },
  { id: 'lesson-1-5-3', title: 'Evaluating Farm Performance', theme: 'performance', focus: ['output analysis', 'income review', 'resource efficiency', 'risk checks', 'action learning'] },
  { id: 'lesson-1-5-4', title: 'Scaling Good Practices', theme: 'scaling', focus: ['replication', 'simple tests', 'peer learning', 'record sharing', 'continuous improvement'] },
  { id: 'lesson-1-5-5', title: 'Systems Thinking for Farmers', theme: 'systems thinking', focus: ['whole-farm view', 'trade-offs', 'long-term planning', 'family goals', 'resilient choices'] },
]

const makeLessonText = (value: string, language: AcademyLanguage) => {
  const translations: Record<AcademyLanguage, string> = {
    en: value,
    am: value,
    om: value,
    fr: value,
    ar: value,
    es: value,
  }
  return translations[language]
}

const buildCourse1Lessons = () => introAgricultureCourse1Blueprints.map((lessonMeta, index) => {
  const baseTitle = lessonMeta.title
  const localizedTitle: Localized<string> = {
    en: baseTitle,
    am: baseTitle,
    om: baseTitle,
    fr: baseTitle,
    ar: baseTitle,
    es: baseTitle,
  }

  const introduction = mapLocales((language) => {
    const base = `In this lesson, learners study ${baseTitle}. They examine how ${lessonMeta.focus[0]}, ${lessonMeta.focus[1]}, and ${lessonMeta.focus[2]} connect to field decisions and long-term farm performance. A farm works as a living system where land, labour, water, soil, crops, and household needs interact every day. Students learn to observe conditions closely, identify the limiting resource, compare possible actions, and connect short-term actions with later outcomes in soil, income, food supply, and resilience.`
    return makeLessonText(base, language)
  })

  const objectives = mapLocales(() => [
    `Explain the main parts of ${baseTitle.toLowerCase()} in a farm system.`,
    `Identify the resource that most influences a field decision.`,
    `Connect daily actions to long-term effects on soil, water, labour, and income.`,
    `Use observation and simple records to compare management choices.`,
    `Recognize trade-offs, risks, and feedback before acting.`,
  ])

  const topics = mapLocales(() => [
    { title: `System overview`, explanation: `This topic explains how ${lessonMeta.theme} emerges from connected decisions and changing conditions across the farm.`, examples: [`A field decision can affect soil, labour, food supply, and cash at the same time.`] },
    { title: `Resource flow`, explanation: `This topic shows how materials, labour, and information move between land, crop, animal, and household activities.`, examples: [`Plant residues, manure, feed, and water create linked cycles for growth and decision making.`] },
    { title: `Timing and risk`, explanation: `This topic highlights the importance of time for planting, cropping, harvesting, storage, and market timing.`, examples: [`A delay in sowing may create drought stress, weed competition, and missed sale windows.`] },
    { title: `Evidence and comparison`, explanation: `This topic describes how records, measurements, and observations support better decisions and future learning.`, examples: [`Small changes in rainfall, soil cover, or crop stand can reveal important patterns.`] },
    { title: `Long-term outcomes`, explanation: `This topic connects short-term action to the future condition of the soil, household income, and resilience.`, examples: [`A wise decision today can protect the next season and improve the local farm system.`] },
  ])

  const definitions = mapLocales(() => [
    `A farm system is a connected set of land, people, water, crops, animals, decisions, and markets.`,
    `A resource is any input that matters for growth, labour, cash, time, or production.`,
    `A process is an activity such as planting, feeding, irrigating, harvesting, or selling.`,
    `An output is the result of the process, such as grain, milk, income, or soil improvement.`,
    `A trade-off is a choice where one benefit is gained while another cost or loss appears.`,
    `A risk is a potential danger from weather, pest pressure, low prices, or poor timing.`,
    `An indicator is a visible measure used to track condition, change, or performance.`,
    `Resilience is the ability to absorb shocks and continue stable farm function.`,
  ])

  const examples = mapLocales(() => [
    `A farmer who records rainfall and crop condition can compare one planting date to another.`,
    `Crop residues may feed animals, return nutrients to the soil, and reduce loss of organic matter.`,
    `A market price can encourage a crop, but the decision still depends on labour, water, and risk.`,
    `Soil cover can reduce erosion, improve infiltration, and protect soil moisture during dry periods.`,
    `A good field note can reveal whether a practice was valuable or simply expensive.`,
  ])

  const keyPoints = mapLocales(() => [
    `A farm is a linked system and not a single isolated activity.`,
    `Every input has a source, a cost, and a possible alternative.`,
    `Water, labour, nutrients, and cash move through the farm and affect choices.`,
    `Timing and sequence often matter as much as quantity.`,
    `Yield is not the only outcome that matters for success.`,
    `Farm records turn memory into evidence that supports comparison.`,
    `Trade-offs are normal and should be considered openly.`,
    `Short-term choices shape long-term soil, income, and resilience.`,
    `Observation and adaptation help farmers respond to local conditions.`,
  ])

  const practice = mapLocales(() => [
    `Sketch a simple farm map and label five connected elements.`,
    `Identify one limited resource on the farm and list the activities that use it.`,
    `Record rainfall, work hours, and crop condition for a week.`,
    `Trace how nutrients move from soil, feed, or manure into plant growth.`,
    `Compare two decisions that look similar but lead to different trade-offs.`,
    `Write one paragraph explaining how a market change could affect food and soil.`,
    `Review the field after a week and note what changed and what should be checked next.`,
  ])

  const applications = mapLocales(() => [
    `Prepare a field observation sheet before making a farm decision.`,
    `Review rainfall and soil condition together before selecting a planting date.`,
    `Compare two management choices using labour, cost, and expected benefit.`,
    `Discuss the result with a farmer group and note the key lesson for the next season.`,
  ])

  const commonMistakes = mapLocales(() => [
    `Acting before observing field conditions and local constraints.`,
    `Using a recommendation without checking rainfall, soil, and labour conditions.`,
    `Treating yield as the only measure of performance.`,
    `Failing to record decisions, lessons, and later effects.`,
  ])

  const quiz = mapLocales((language) => {
    const questionTemplates = {
      en: [
        'Which resource most strongly shapes decisions about {topic}?',
        'Why is timing essential when planning {topic}?',
        'Which field observation best supports action on {topic}?',
        'What is the main trade-off linked to {topic}?',
        'How can records improve decisions about {topic}?',
        'Which pattern is most relevant to {topic}?',
        'Which farm action creates the strongest feedback for {topic}?',
        'Why should a farmer compare options before acting on {topic}?',
        'Which signal best indicates a problem in {topic}?',
        'How does long-term thinking improve choices in {topic}?',
      ],
      am: [
        'በ{topic} ላይ ውሳኔን በጣም የሚቀይረው ሀብት የትኛው ነው?',
        'በ{topic} ላይ ጊዜ ለምን አስፈላጊ ነው?',
        'በ{topic} ላይ እርምጃ ለመውሰድ የትኛው የመስክ ምልከታ በጣም ጠቃሚ ነው?',
        'ከ{topic} ጋር የተያያዘው ዋነና መስዋዕት ምንድነው?',
        'መዝገቦች በ{topic} ላይ ውሳኔዎችን እንዴት ያሻሽላሉ?',
        'በ{topic} ውስጥ የትኛው ንድፈ ሀሳብ በጣም አስፈላጊ ነው?',
        'በ{topic} ውስጥ የትኛ እርምጃ ከፍተኛ ግብረመልስ ይፈጥራል?',
        'አርሶ አደር በ{topic} ላይ ከመሥራት በፊት አማራጮችን ለምን ያወዳድራል?',
        'በ{topic} ውስጥ የትኛው ምልክት ችግርን ያመለክታል?',
        'ረጅም ጊዜ አስተሳሰብ በ{topic} ውስጥ ውሳኔዎችን እንዴት ያሻሽላል?',
      ],
      om: [
        'Qabeenyi kamtu murtii {topic} irratti baay’ee dhiibbaa geessa?',
        'Yeroon {topic} irratti haala maaliif barbaachisaa dha?',
        'Daawwannaa dirree kamtu {topic} irratti gochaaf baay’ee gargaara?',
        'Wal jijjiirraan {topic} waliin hidhamu maali?',
        'Galmeen {topic} irratti murtii akkamitti fooyya’a?',
        'Qaabilli kamtu {topic} irratti baay’ee barbaachisaa dha?',
        'Gocha qonnaa kamtu {topic} irratti deebii guddaa uumata?',
        'Qonnaan bulaan {topic} irratti osoo hin hojjatin dura filannoowwan maaliif walbira qabaata?',
        'Mallattoo kamtu {topic} keessatti rakkoo agarsiisa?',
        'Yaada yeroo dheeraa {topic} keessatti murtii akkamitti fooyya’a?',
      ],
      fr: [
        'Quelle ressource influence le plus les décisions sur {topic} ?',
        'Pourquoi le calendrier est-il essentiel pour {topic} ?',
        'Quelle observation de terrain aide le mieux à agir sur {topic} ?',
        'Quel est le principal compromis lié à {topic} ?',
        'Comment les registres améliorent-ils les décisions sur {topic} ?',
        'Quel schéma est le plus pertinent pour {topic} ?',
        'Quelle action agricole crée le plus de rétroaction pour {topic} ?',
        'Pourquoi comparer les options avant d’agir sur {topic} ?',
        'Quel signal indique le mieux un problème dans {topic} ?',
        'Comment la vision à long terme améliore-t-elle les choix dans {topic} ?',
      ],
      ar: [
        'أي مورد يؤثر أكثر على القرارات المتعلقة بـ {topic}؟',
        'لماذا يكون التوقيت أساسياً عند التخطيط لـ {topic}؟',
        'أي مراقبة حقلية تدعم القرار الأفضل بشأن {topic}؟',
        'ما أهم مفاضلة مرتبطة بـ {topic}؟',
        'كيف تحسن السجلات القرارات المتعلقة بـ {topic}؟',
        'أي نمط أكثر ملاءمة لـ {topic}؟',
        'أي إجراء زراعي يخلق أكبر تغذية راجعة في {topic}؟',
        'لماذا يقارن المزارع الخيارات قبل العمل في {topic}؟',
        'أي إشارة تدل على وجود مشكلة في {topic}؟',
        'كيف يحسن التفكير طويل المدى الاختيارات في {topic}؟',
      ],
      es: [
        '¿Qué recurso influencia más las decisiones sobre {topic}?',
        '¿Por qué el tiempo es esencial al planificar {topic}?',
        '¿Qué observación de campo ayuda mejor a actuar sobre {topic}?',
        '¿Cuál es la principal compensación relacionada con {topic}?',
        '¿Cómo mejoran los registros las decisiones sobre {topic}?',
        '¿Qué patrón es más relevante para {topic}?',
        '¿Qué acción agrícola crea la mayor retroalimentación para {topic}?',
        '¿Por qué un agricultor debe comparar opciones antes de actuar sobre {topic}?',
        '¿Qué señal indica mejor un problema en {topic}?',
        '¿Cómo mejora el pensamiento a largo plazo las decisiones en {topic}?',
      ],
    }

    const optionsByLanguage = {
      en: [
        'A connected farm system with trade-offs and feedback.',
        'A single crop with one fixed outcome.',
        'A market report alone without field evidence.',
        'A random decision without observation.',
      ],
      am: [
        'የተገናኘ የእርሻ ሥርዓት ከመስዋዕት እና ግብረመልስ ጋር።',
        'አንድ ሰብል ከአንድ ቋሚ ውጤት ጋር።',
        'የገበያ ሪፖርት ከመስክ ማስረጃ በስተቀር።',
        'ከምልከታ ያለ ዘፈቀደ ውሳኔ።',
      ],
      om: [
        'Sirna qonnaa walitti hidhameen wal jijjiirraa fi deebii qabu.',
        'Midhaan tokkoo qofa fi bu’aan tolaa qofa.',
        'Gabaasa gabaa qofa ragaa dirree malee.',
        'Murtii tasaa daawwannaa malee.',
      ],
      fr: [
        'Un système agricole connecté avec compromis et rétroaction.',
        'Une seule culture avec un seul résultat fixe.',
        'Un rapport de marché sans preuves de terrain.',
        'Une décision aléatoire sans observation.',
      ],
      ar: [
        'نظام مزرعة مترابط مع مفاضلات وتغذية راجعة.',
        'محصول واحد مع نتيجة ثابتة واحدة.',
        'تقرير سوق فقط دون أدلة حقلية.',
        'قرار عشوائي دون ملاحظة.',
      ],
      es: [
        'Un sistema agrícola conectado con compensaciones y retroalimentación.',
        'Un solo cultivo con un resultado fijo.',
        'Un informe de mercado sin evidencia de campo.',
        'Una decisión aleatoria sin observación.',
      ],
    }

    return Array.from({ length: 10 }, (_, quizIndex) => {
      const topic = lessonMeta.focus[quizIndex % lessonMeta.focus.length]
      return {
        id: `${lessonMeta.id}-q${quizIndex + 1}`,
        question: questionTemplates[language][quizIndex].replace('{topic}', topic),
        options: optionsByLanguage[language],
        correct: 0,
        explanation: `${language === 'en' ? 'The correct answer is the first option because' : language === 'am' ? 'ትክክለኛው መልሱ የመጀመሪያው አማራጭ ነው ምክንያቱም' : language === 'om' ? 'Deebiin sirrii filannoo jalqabaa dha, sababiin isaa' : language === 'fr' ? 'La bonne réponse est la première option parce que' : language === 'ar' ? 'الإجابة الصحيحة هي الخيار الأول لأن' : 'La respuesta correcta es la primera opción porque'} ${baseTitle} is understood as a connected farm system with trade-offs, evidence, and feedback.`,
        difficulty: (quizIndex < 3 ? 'beginner' : quizIndex < 7 ? 'intermediate' : 'advanced') as QuizQuestion['difficulty'],
      }
    })
  })

  const summary = mapLocales(() => `This lesson shows that a farm should be understood as a linked system shaped by soil, water, labour, markets, and short-term decisions. Good farmers observe conditions, compare options, and review results so that the next season is stronger, safer, and more productive. The goal is not only to increase yield but also to protect soil, support food security, and build resilient farm decisions.`)

  const reviewQuestions = mapLocales(() => [
    `Why is ${baseTitle.toLowerCase()} better understood as a system than as a single crop?`,
    `Which resource is most limiting in your own farm context?`,
    `How can rainfall, soil, or labour affect a field decision?`,
    `What does a simple record help you compare over time?`,
    `Why is a trade-off a normal part of farm planning?`,
    `How can evidence improve the next season’s farm choices?`,
  ])

  const nextLesson = mapLocales(() => `Next lesson: continue with ${introAgricultureCourse1Blueprints[(index + 1) % introAgricultureCourse1Blueprints.length].title} and deepen farm observation.`)

  return {
    id: lessonMeta.id,
    duration: '25 min',
    title: localizedTitle,
    introduction,
    objectives,
    topics,
    definitions,
    examples,
    keyPoints,
    practice,
    applications,
    commonMistakes,
    quiz,
    summary,
    reviewQuestions,
    nextLesson,
  }
})

const buildIntroAgricultureCourse = (seed: CourseSeed): AcademyCourse => {
  const lessons = buildCourse1Lessons()
  const unitTitles = ['Farm systems and resources', 'Field planning and timing', 'Risk, climate, and markets', 'Soil, labour, and inputs', 'Review and learning cycles']
  return {
    ...seed,
    units: unitTitles.map((unitTitle, unitIndex) => ({
      id: `${seed.id}-unit-${unitIndex + 1}`,
      title: mapLocales(() => `${unitTitle}`),
      description: mapLocales(() => `Study the connected decisions and evidence used in ${unitTitle.toLowerCase()} for a stronger farm system.`),
      lessons: lessons.slice(unitIndex * 5, unitIndex * 5 + 5),
    })),
  }
}

export const COURSES: AcademyCourse[] = seeds.map((seed) => {
  if (seed.id === 'intro-agriculture') return buildIntroAgricultureCourse(seed)
  return {
    ...seed,
    units: [0, 1, 2, 3, 4].map((unitIndex) => ({
      id: `${seed.id}-unit-${unitIndex + 1}`,
      title: mapLocales((language) => `${seed.title[language]} - ${unitIndex === 0 ? ({ en: 'Core principles', am: 'ዋና መርሆዎች', om: 'Bu’uura ijoo', fr: 'Principes essentiels', ar: 'المبادئ الأساسية', es: 'Principios esenciales' }[language]) : ({ en: 'Field practice', am: 'የመስክ ልምምድ', om: 'Shaakala dirree', fr: 'Pratique de terrain', ar: 'التطبيق الحقلي', es: 'Práctica de campo' }[language])}`),
      description: mapLocales((language) => ({ en: `Build and apply the foundation of ${seed.title[language]} through guided study and field records.`, am: `${seed.title[language]}ን በተመራ ጥናትና በመስክ መዝገብ ይተግብሩ።`, om: `${seed.title[language]} qorannoo fi galmee dirree keessatti hojiirra oolchi.`, fr: `Construisez et appliquez les bases de ${seed.title[language]} par l’étude et les relevés.`, ar: `طبّق أساسيات ${seed.title[language]} من خلال الدراسة والسجلات الحقلية.`, es: `Construye y aplica las bases de ${seed.title[language]} mediante estudio y registros.` }[language])),
      lessons: [0, 1, 2, 3, 4].map((lessonIndex) => lessonFor(seed, unitIndex, lessonIndex)),
    })),
  }
})

