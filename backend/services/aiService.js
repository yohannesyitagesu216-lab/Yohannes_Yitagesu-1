require("dotenv").config();

const AGROVISION_SYSTEM_PROMPT = `You are AgroVision AI, an intelligent agricultural and educational assistant.

You help farmers, students, teachers, and agricultural users.

You can answer:
- crop diseases
- crop management
- soil
- irrigation
- fertilizer
- pests
- plant nutrition
- farming techniques
- crop production
- farm management
- agricultural technology
- climate-related farming guidance
- agricultural education
- biology
- chemistry
- physics
- mathematics
- computer science
- programming
- general educational questions

Give accurate, clear, useful answers.

For agricultural disease questions:
- explain possible causes
- explain symptoms
- suggest practical management
- distinguish between diagnosis and possibility
- recommend professional/agricultural extension confirmation when necessary
- never claim certainty from text alone when an image or field information is required.

If the user provides a crop disease image through the Crop Analysis system, use the AI result supplied by the backend and explain it clearly.

For education:
- explain step-by-step
- use simple language when appropriate
- provide examples
- use formulas where needed
- create short notes when requested
- create practice questions when requested
- adapt explanations to the user's grade/level if provided.

Never pretend to have performed an analysis that was not actually performed.
Do not invent scientific facts.

If the question is unclear, ask a short clarification question.

Be conversational and helpful.`;

function buildLanguageInstruction(lang = 'en') {
  const normalizedLang = String(lang || 'en').toLowerCase();

  if (normalizedLang.startsWith('am')) {
    return 'Respond primarily in Amharic. If the user asks in English or Afaan Oromo, you may answer in that language only when explicitly requested.';
  }

  if (normalizedLang.startsWith('om')) {
    return 'Respond primarily in Afaan Oromo. If the user asks in English or Amharic, answer in that language only when explicitly requested.';
  }

  if (normalizedLang.startsWith('fr')) {
    return 'Répondez principalement en français professionnel et naturel. Utilisez une autre langue uniquement si l’utilisateur le demande explicitement.';
  }

  if (normalizedLang.startsWith('ar')) {
    return 'أجب باللغة العربية الفصحى الواضحة والطبيعية. استخدم لغة أخرى فقط إذا طلب المستخدم ذلك صراحةً.';
  }

  if (normalizedLang.startsWith('es')) {
    return 'Responde principalmente en español profesional, claro y natural. Usa otro idioma solo si el usuario lo solicita explícitamente.';
  }

  return 'Respond primarily in English. If the user asks in another language, answer in that language only when explicitly requested.';
}

async function generateChatResponse({ message, history = [], lang = 'en', intent = 'GENERAL', context = null }) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error('AI_API_KEY is not configured. Set it in the backend .env file.');
  }

  const baseUrl = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  const timeoutMs = Number(process.env.AI_TIMEOUT_MS || 30000);
  const languageInstruction = buildLanguageInstruction(lang);

  const contextInstruction = context
    ? `\n\nRequest intent: ${intent}\nAuthenticated AgroVision context (use only these facts; missing values are unavailable):\n${JSON.stringify(context)}\nRules: never invent farm, weather, soil, crop, disease, yield, or Academy data. Clearly label general advice when measured farm data is unavailable.`
    : '';

  const requestBody = {
    model,
    temperature: 0.7,
    max_tokens: 900,
    messages: [
      { role: 'system', content: `${AGROVISION_SYSTEM_PROMPT}\n\nLanguage rule: ${languageInstruction}${contextInstruction}` },
      ...history.slice(-12).map((entry) => ({
        role: entry.role === 'assistant' ? 'assistant' : 'user',
        content: String(entry.content || '').trim(),
      })).filter((entry) => entry.content),
      { role: 'user', content: String(message || '').trim() },
    ],
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    const responseText = await response.text();
    let payload;
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = null;
    }

    if (!response.ok) {
      throw new Error(`AI provider request failed (${response.status}).`);
    }

    const aiText = payload?.choices?.[0]?.message?.content;
    if (!aiText) {
      throw new Error('AI provider returned an empty response.');
    }

    return aiText.trim();
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('AI request timed out. Please try again.');
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('AI request failed. Please try again.');
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  generateChatResponse,
  AGROVISION_SYSTEM_PROMPT,
};
