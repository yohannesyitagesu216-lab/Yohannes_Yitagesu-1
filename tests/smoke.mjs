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

console.log(JSON.stringify({
  passed: true,
  checks: ['frontend', 'backend health', 'protected predictions', 'protected AI chat', 'AI readiness', 'invalid image handling'],
  frontendStatus: frontend.status,
}))