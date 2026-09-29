import { readFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { performance } from 'node:perf_hooks'

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5500'
const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000'
const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000'

async function expectStatus(url, options, expected, name) {
  const response = await fetch(url, options)
  if (response.status !== expected) {
    throw new Error(`${name}: expected ${expected}, received ${response.status}`)
  }
  return response
}

const frontend = await expectStatus(`${frontendUrl}/`, undefined, 200, 'frontend')
const health = await expectStatus(`${backendUrl}/api/health`, undefined, 200, 'backend health')
const healthPayload = await health.json()
if (!healthPayload.success || healthPayload.backend !== 'online') throw new Error('backend health payload is invalid')

await expectStatus(`${backendUrl}/api/predictions`, undefined, 401, 'protected predictions')
await expectStatus(`${backendUrl}/api/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'smoke test' }),
}, 401, 'protected AI chat')

const readiness = await expectStatus(`${aiUrl}/ready`, undefined, 200, 'AI readiness')
const readinessPayload = await readiness.json()
if (!readinessPayload.model_loaded) throw new Error('AI model is not loaded')

const invalidImage = new FormData()
invalidImage.append('file', new Blob(['not-an-image'], { type: 'image/jpeg' }), 'invalid.jpg')
const invalidResponse = await expectStatus(`${aiUrl}/predict`, { method: 'POST', body: invalidImage }, 200, 'invalid image response')
const invalidPayload = await invalidResponse.json()
if (invalidPayload.success !== false || !invalidPayload.error?.message) throw new Error('invalid image response is not safe')

const imagePaths = [
  'ai-service/dataset/train/Apple___Apple_scab/00075aa8-d81a-4184-8541-b692b78d398a___FREC_Scab 3335.JPG',
  'ai-service/dataset/train/Tomato___Early_blight/0034a551-9512-44e5-ba6c-827f85ecc688___RS_Erly.B 9432.JPG',
  'ai-service/dataset/train/Tomato___healthy/000146ff-92a4-4db6-90ad-8fce2ae4fddd___GH_HL Leaf 259.1.JPG',
]
const imageSequence = [imagePaths[0], imagePaths[1], imagePaths[2], imagePaths[0]]
const imageResults = []

for (const relativePath of imageSequence) {
  const imageBytes = await readFile(resolve(relativePath))
  const formData = new FormData()
  formData.append('file', new Blob([imageBytes], { type: 'image/jpeg' }), basename(relativePath))

  const startedAt = performance.now()
  const response = await expectStatus(`${aiUrl}/predict`, { method: 'POST', body: formData, cache: 'no-store' }, 200, `prediction for ${basename(relativePath)}`)
  const responseTimeMs = Number((performance.now() - startedAt).toFixed(2))
  const payload = await response.json()
  const prediction = payload.prediction
  if (!payload.success || !prediction?.crop || !prediction?.disease || !Number.isFinite(Number(prediction.confidence))) {
    throw new Error(`AI prediction payload is invalid for ${basename(relativePath)}`)
  }

  imageResults.push({
    filename: basename(relativePath),
    crop: prediction.crop,
    predictedClass: prediction.disease,
    confidence: Number(prediction.confidence),
    changedFromPrevious: imageResults.length > 0
      ? prediction.crop !== imageResults.at(-1).crop || prediction.disease !== imageResults.at(-1).predictedClass
      : null,
    responseTimeMs,
  })
}

const firstA = imageResults[0]
const finalA = imageResults.at(-1)
if (firstA.crop !== finalA.crop || firstA.predictedClass !== finalA.predictedClass || firstA.confidence !== finalA.confidence) {
  throw new Error('A→B→C→A repeat produced a stale or inconsistent result for image A')
}

console.log(JSON.stringify({
  passed: true,
  checks: ['frontend', 'backend health', 'protected predictions', 'protected AI chat', 'AI readiness', 'invalid image handling', 'real image-specific inference', 'A-B-C-A repeat determinism'],
  frontendStatus: frontend.status,
  imageResults,
}))