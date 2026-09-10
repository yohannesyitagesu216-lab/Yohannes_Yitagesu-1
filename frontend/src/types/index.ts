export interface User {
  id: string
  name: string
  email: string
  role: string
  created_at: string
}

export interface Prediction {
  id: string
  userId: string
  imageName: string
  crop: string
  disease: string
  confidence: number
  treatment: string
  prevention: string
  createdAt: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: User
  }
}

export interface PredictionResponse {
  success: boolean
  message?: string
  data: Prediction | Prediction[]
}

export interface HealthResponse {
  success: boolean
  backend: string
  database: string
  ai_service: string
  timestamp: string
}

export interface AcademyProgress {
    user_id: string
    lesson_id: string
    course_id: string
    completed: boolean
    quiz_score: number | null
    last_visited_at: string
    completed_at: string | null
}
