import axios, { AxiosInstance } from 'axios'
import { AuthResponse, PredictionResponse, HealthResponse } from '../types'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      timeout: 30000,
    })

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('agrovision_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const requestUrl = String(error.config?.url || '')
        const publicAuthRequest = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password']
          .some((path) => requestUrl.endsWith(path))
        if (error.response?.status === 401 && !publicAuthRequest) {
          localStorage.removeItem('agrovision_token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register', {
      name,
      email,
      password,
    })
    return response.data
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', {
      email,
      password,
    })
    return response.data
  }

  async forgotPassword(email: string) {
    const response = await this.client.post('/auth/forgot-password', { email })
    return response
  }

  async resetPassword(token: string, newPassword: string) {
    const response = await this.client.post('/auth/reset-password', { token, newPassword })
    return response
  }

  async getProfile() {
    const response = await this.client.get('/auth/me')
    return response.data
  }

  async uploadPrediction(file: File) {
    const formData = new FormData()
    formData.append('image', file)
    const response = await this.client.post<PredictionResponse>('/predictions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async getPredictions(): Promise<PredictionResponse> {
    const response = await this.client.get<PredictionResponse>('/predictions')
    return response.data
  }

  async getPrediction(id: string): Promise<PredictionResponse> {
    const response = await this.client.get<PredictionResponse>(`/predictions/${id}`)
    return response.data
  }

  async getHealth(): Promise<HealthResponse> {
    const response = await this.client.get<HealthResponse>('/health')
    return response.data
  }

  async getWeather() {
    const response = await this.client.get('/weather')
    return response.data
  }

  async getFarm() {
    const response = await this.client.get('/farm')
    return response.data
  }

  async saveFarm(farm: { farmName: string; farmLocation: string; latitude: number; longitude: number; region?: string; city?: string; country?: string }) {
    const response = await this.client.put('/farm', farm)
    return response.data
  }

  async getDashboardSummary() {
    const response = await this.client.get('/dashboard/summary')
    return response.data
  }

  async getAcademyProgress() {
    const response = await this.client.get('/academy/progress')
    return response.data
  }

  async saveAcademyProgress(lessonId: string, courseId: string, completed: boolean, quizScore?: number | null) {
    const response = await this.client.put(`/academy/progress/${encodeURIComponent(lessonId)}`, {
      courseId,
      completed,
      quizScore: quizScore ?? null,
    })
    return response.data
  }

  async chat(message: string, lang: string = 'en', history: Array<{ role: 'user' | 'assistant'; content: string }> = []) {
    const response = await this.client.post('/chat', {
      message,
      lang,
      history,
    })
    return response.data
  }
}

export const apiClient = new ApiClient()
